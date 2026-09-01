<?php

namespace App\Domains\OrderManagement\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\User;
use App\Domains\MasterData\Models\Color;
use App\Domains\MasterData\Models\Size;
use App\Domains\OrderManagement\Models\Order;
use App\Domains\OrderManagement\Models\PoBreakdown;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PurchaseOrderService
{
    public function __construct(
        protected OrderMasterService $orderService
    ) {}

    public function createPurchaseOrder(Order $order, array $data, User $actor, ?string $ip = null): PurchaseOrder
    {
        return DB::transaction(function () use ($order, $data, $actor, $ip) {
            $po = $order->purchaseOrders()->create([
                'po_number' => strtoupper(trim($data['po_number'])),
                'destination_market' => $data['destination_market'] ?? 'USA [USA]',
                'ship_date' => $data['ship_date'],
                'phd_date' => $data['phd_date'] ?? null,
                'order_quantity' => (int) ($data['order_quantity'] ?? 0),
                'unit_price' => (float) ($data['unit_price'] ?? 0.00),
                'smv' => (float) ($data['smv'] ?? 0.00),
                'status' => $data['status'] ?? 'DRAFT',
                'notes' => $data['notes'] ?? null,
            ]);

            if (!empty($data['breakdowns']) && is_array($data['breakdowns'])) {
                $this->syncPoMatrixBreakdown($po, $data['breakdowns'], (int)$data['order_quantity']);
            }

            $this->orderService->recalculateOrderTotals($order);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_PURCHASE_ORDER',
                'module' => 'OrderManagement',
                'ip_address' => $ip,
                'payload' => ['po_id' => $po->id, 'po_number' => $po->po_number, 'order_id' => $order->id],
            ]);

            return $po->load('breakdowns');
        });
    }

    public function updatePurchaseOrder(PurchaseOrder $po, array $data, User $actor, ?string $ip = null): PurchaseOrder
    {
        return DB::transaction(function () use ($po, $data, $actor, $ip) {
            $orderQty = array_key_exists('order_quantity', $data) ? (int)$data['order_quantity'] : $po->order_quantity;

            $po->update([
                'po_number' => isset($data['po_number']) ? strtoupper(trim($data['po_number'])) : $po->po_number,
                'destination_market' => $data['destination_market'] ?? $po->destination_market,
                'ship_date' => $data['ship_date'] ?? $po->ship_date,
                'phd_date' => array_key_exists('phd_date', $data) ? $data['phd_date'] : $po->phd_date,
                'order_quantity' => $orderQty,
                'unit_price' => isset($data['unit_price']) ? (float)$data['unit_price'] : $po->unit_price,
                'smv' => isset($data['smv']) ? (float)$data['smv'] : $po->smv,
                'status' => $data['status'] ?? $po->status,
                'notes' => array_key_exists('notes', $data) ? $data['notes'] : $po->notes,
            ]);

            if (!empty($data['breakdowns']) && is_array($data['breakdowns'])) {
                $this->syncPoMatrixBreakdown($po, $data['breakdowns'], $orderQty);
            }

            $this->orderService->recalculateOrderTotals($po->order);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_PURCHASE_ORDER',
                'module' => 'OrderManagement',
                'ip_address' => $ip,
                'payload' => ['po_id' => $po->id, 'po_number' => $po->po_number],
            ]);

            return $po->load('breakdowns');
        });
    }

    public function syncPoMatrixBreakdown(PurchaseOrder $po, array $breakdowns, ?int $expectedTotal = null): void
    {
        $sum = 0;
        $itemsToInsert = [];

        // Preload master colors and sizes with case-insensitive uppercase keys
        $colorsMap = Color::all()->mapWithKeys(fn($c) => [strtoupper(trim($c->name)) => $c->id])->toArray();
        $sizesMap = Size::all()->mapWithKeys(fn($s) => [strtoupper(trim($s->name)) => $s->id])->toArray();

        foreach ($breakdowns as $item) {
            $qty = (int) ($item['quantity'] ?? 0);
            if ($qty > 0) {
                $rawColorName = trim($item['color_name'] ?? 'DEFAULT');
                $rawSizeName = trim($item['size_name'] ?? 'FREE');
                $colorName = strtoupper($rawColorName);
                $sizeName = strtoupper($rawSizeName);
                $sum += $qty;

                // Auto-create missing Color on-the-fly if not found
                if (!isset($colorsMap[$colorName])) {
                    $newCol = Color::firstOrCreate(['name' => $rawColorName], [
                        'code' => 'COL-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $rawColorName), 0, 4)),
                        'hex_code' => '#4B5563',
                    ]);
                    $colorsMap[$colorName] = $newCol->id;
                }

                // Auto-create missing Size on-the-fly if not found
                if (!isset($sizesMap[$sizeName])) {
                    $newSz = Size::firstOrCreate(['name' => $rawSizeName], [
                        'code' => 'SZ-' . strtoupper(str_replace(' ', '', $rawSizeName)),
                        'category' => 'NUMERIC',
                    ]);
                    $sizesMap[$sizeName] = $newSz->id;
                }

                $itemsToInsert[] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'purchase_order_id' => $po->id,
                    'color_id' => $colorsMap[$colorName] ?? null,
                    'color_name' => $rawColorName,
                    'size_id' => $sizesMap[$sizeName] ?? null,
                    'size_name' => $rawSizeName,
                    'quantity' => $qty,
                    'cut_quantity' => 0,
                    'sewn_quantity' => 0,
                    'packed_quantity' => 0,
                    'shipped_quantity' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Golden Rule Math Integrity Check
        $targetTotal = $expectedTotal ?? $po->order_quantity;
        if ($targetTotal > 0 && $sum !== $targetTotal) {
            throw ValidationException::withMessages([
                'matrix' => ["Golden Rule Validation Mismatch: Sum of Color-Size matrix quantities ({$sum} Pcs) must exactly equal PO Total ({$targetTotal} Pcs). Difference: " . abs($sum - $targetTotal) . " Pcs."],
            ]);
        }

        // Clear existing and insert clean matrix
        $po->breakdowns()->delete();
        if (!empty($itemsToInsert)) {
            PoBreakdown::insert($itemsToInsert);
        }
    }

    public function deletePurchaseOrder(PurchaseOrder $po, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($po, $actor, $ip) {
            $order = $po->order;
            $poNumber = $po->po_number;
            $poId = $po->id;

            $po->breakdowns()->delete();
            $po->delete();

            $this->orderService->recalculateOrderTotals($order);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_PURCHASE_ORDER',
                'module' => 'OrderManagement',
                'ip_address' => $ip,
                'payload' => ['po_id' => $poId, 'po_number' => $poNumber],
            ]);

            return true;
        });
    }
}
