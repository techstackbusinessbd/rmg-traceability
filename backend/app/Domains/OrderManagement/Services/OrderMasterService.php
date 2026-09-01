<?php

namespace App\Domains\OrderManagement\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\User;
use App\Domains\OrderManagement\Models\Order;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderMasterService
{
    public function getAllOrders(?string $buyerId = null, ?string $status = null): Collection
    {
        $query = Order::with(['buyer', 'brand', 'style', 'purchaseOrders.breakdowns'])
            ->withCount('purchaseOrders')
            ->orderBy('created_at', 'desc');

        if ($buyerId) {
            $query->where('buyer_id', $buyerId);
        }

        if ($status && $status !== 'ALL') {
            $query->where('status', $status);
        }

        return $query->get();
    }

    public function getOrderDetails(string $id): Order
    {
        return Order::with([
            'buyer',
            'brand',
            'style.operations',
            'company',
            'unit',
            'purchaseOrders.breakdowns.color',
            'purchaseOrders.breakdowns.size',
        ])->findOrFail($id);
    }

    public function createOrder(array $data, User $actor, ?string $ip = null): Order
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $order = Order::create([
                'order_number' => strtoupper(trim($data['order_number'])),
                'buyer_id' => $data['buyer_id'],
                'brand_id' => $data['brand_id'] ?? null,
                'style_id' => $data['style_id'],
                'company_id' => $data['company_id'] ?? null,
                'unit_id' => $data['unit_id'] ?? null,
                'season' => $data['season'] ?? 'SPRING-2027',
                'merchant_name' => $data['merchant_name'] ?? null,
                'total_quantity' => $data['total_quantity'] ?? 0,
                'total_value' => $data['total_value'] ?? 0.00,
                'currency' => strtoupper($data['currency'] ?? 'USD'),
                'status' => $data['status'] ?? 'DRAFT',
                'techpack_path' => $data['techpack_path'] ?? null,
                'remarks' => $data['remarks'] ?? null,
            ]);

            // If initial POs provided
            if (!empty($data['purchase_orders']) && is_array($data['purchase_orders'])) {
                foreach ($data['purchase_orders'] as $poData) {
                    $po = $order->purchaseOrders()->create([
                        'po_number' => strtoupper(trim($poData['po_number'])),
                        'destination_market' => $poData['destination_market'] ?? 'USA [USA]',
                        'ship_date' => $poData['ship_date'],
                        'phd_date' => $poData['phd_date'] ?? null,
                        'order_quantity' => (int) ($poData['order_quantity'] ?? 0),
                        'unit_price' => (float) ($poData['unit_price'] ?? 0.00),
                        'smv' => (float) ($poData['smv'] ?? 0.00),
                        'status' => $poData['status'] ?? 'DRAFT',
                        'notes' => $poData['notes'] ?? null,
                    ]);

                    if (!empty($poData['breakdowns']) && is_array($poData['breakdowns'])) {
                        foreach ($poData['breakdowns'] as $bData) {
                            if ((int)($bData['quantity'] ?? 0) > 0) {
                                $po->breakdowns()->create([
                                    'color_id' => $bData['color_id'] ?? null,
                                    'color_name' => strtoupper(trim($bData['color_name'])),
                                    'size_id' => $bData['size_id'] ?? null,
                                    'size_name' => strtoupper(trim($bData['size_name'])),
                                    'quantity' => (int) $bData['quantity'],
                                ]);
                            }
                        }
                    }
                }

                $this->recalculateOrderTotals($order);
            }

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_ORDER',
                'module' => 'OrderManagement',
                'ip_address' => $ip,
                'payload' => ['order_id' => $order->id, 'order_number' => $order->order_number],
            ]);

            return $order->load(['buyer', 'brand', 'style', 'purchaseOrders.breakdowns']);
        });
    }

    public function updateOrder(Order $order, array $data, User $actor, ?string $ip = null): Order
    {
        return DB::transaction(function () use ($order, $data, $actor, $ip) {
            // Cannot edit if confirmed and already in cutting
            if ($order->status === 'IN_PRODUCTION') {
                throw ValidationException::withMessages([
                    'status' => ['Order is currently active in factory production floor and cannot be modified directly.'],
                ]);
            }

            $order->update([
                'order_number' => isset($data['order_number']) ? strtoupper(trim($data['order_number'])) : $order->order_number,
                'buyer_id' => $data['buyer_id'] ?? $order->buyer_id,
                'brand_id' => array_key_exists('brand_id', $data) ? $data['brand_id'] : $order->brand_id,
                'style_id' => $data['style_id'] ?? $order->style_id,
                'company_id' => array_key_exists('company_id', $data) ? $data['company_id'] : $order->company_id,
                'unit_id' => array_key_exists('unit_id', $data) ? $data['unit_id'] : $order->unit_id,
                'season' => $data['season'] ?? $order->season,
                'merchant_name' => $data['merchant_name'] ?? $order->merchant_name,
                'currency' => isset($data['currency']) ? strtoupper($data['currency']) : $order->currency,
                'status' => $data['status'] ?? $order->status,
                'remarks' => $data['remarks'] ?? $order->remarks,
            ]);

            $this->recalculateOrderTotals($order);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'UPDATE_ORDER',
                'module' => 'OrderManagement',
                'ip_address' => $ip,
                'payload' => ['order_id' => $order->id, 'order_number' => $order->order_number],
            ]);

            return $order->load(['buyer', 'brand', 'style', 'purchaseOrders.breakdowns']);
        });
    }

    public function confirmOrder(Order $order, User $actor, ?string $ip = null): Order
    {
        return DB::transaction(function () use ($order, $actor, $ip) {
            $order->load('purchaseOrders.breakdowns');

            if ($order->purchaseOrders->isEmpty()) {
                throw ValidationException::withMessages([
                    'purchase_orders' => ['Cannot confirm an order without at least one Purchase Order (PO).'],
                ]);
            }

            // Verify each PO breakdown sum matches PO order_quantity
            foreach ($order->purchaseOrders as $po) {
                $matrixSum = $po->breakdowns->sum('quantity');
                if ($matrixSum !== $po->order_quantity && $po->order_quantity > 0) {
                    throw ValidationException::withMessages([
                        'breakdowns' => ["PO {$po->po_number} color-size breakdown sum ({$matrixSum}) must equal PO total quantity ({$po->order_quantity})."],
                    ]);
                }
                $po->update(['status' => 'CONFIRMED']);
            }

            $order->update(['status' => 'CONFIRMED']);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CONFIRM_ORDER',
                'module' => 'OrderManagement',
                'ip_address' => $ip,
                'payload' => ['order_id' => $order->id, 'order_number' => $order->order_number],
            ]);

            return $order;
        });
    }

    public function deleteOrder(Order $order, User $actor, ?string $ip = null): bool
    {
        return DB::transaction(function () use ($order, $actor, $ip) {
            if ($order->status === 'IN_PRODUCTION') {
                throw ValidationException::withMessages([
                    'order' => ['Active production orders cannot be deleted.'],
                ]);
            }

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'DELETE_ORDER',
                'module' => 'OrderManagement',
                'ip_address' => $ip,
                'payload' => ['order_id' => $order->id, 'order_number' => $order->order_number],
            ]);

            $order->delete();
            return true;
        });
    }

    public function recalculateOrderTotals(Order $order): void
    {
        $order->load('purchaseOrders');
        $totalQty = $order->purchaseOrders->sum('order_quantity');
        $totalVal = $order->purchaseOrders->reduce(function ($carry, $po) {
            return $carry + ($po->order_quantity * $po->unit_price);
        }, 0.0);

        $order->update([
            'total_quantity' => $totalQty,
            'total_value' => $totalVal,
        ]);
    }
}
