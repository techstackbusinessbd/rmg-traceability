<?php

namespace App\Domains\OrderManagement\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\User;
use App\Domains\MasterData\Models\Brand;
use App\Domains\MasterData\Models\Buyer;
use App\Domains\MasterData\Models\Color;
use App\Domains\MasterData\Models\Size;
use App\Domains\MasterData\Models\Style;
use App\Domains\OrderManagement\Models\Order;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use SimpleXMLElement;
use ZipArchive;

class PoExcelIngestionService
{
    public function __construct(
        protected OrderMasterService $orderService,
        protected PurchaseOrderService $poService
    ) {}

    /**
     * Parse uploaded XLSX file into structured staging format
     */
    public function parseExcelStaging(string $filePath, ?string $buyerId = null): array
    {
        $sheetData = $this->extractXmlFromXlsx($filePath);
        if (empty($sheetData['rows'])) {
            throw ValidationException::withMessages([
                'excel_file' => ['The uploaded Excel sheet contains no readable rows.'],
            ]);
        }

        $allRows = $sheetData['rows'];
        
        // 1. Extract Master Header Info (Row 1 or top block)
        $r1 = $allRows[1] ?? [];
        $jobNo = $r1['B'] ?? 'JOB-' . strtoupper(substr(uniqid(), -6));
        $totalQtyRaw = $r1['D'] ?? '0';
        $totalJobQty = (int) filter_var($totalQtyRaw, FILTER_SANITIZE_NUMBER_INT);
        $buyerName = $r1['J'] ?? 'AMERICAN EAGLE OUTFITTERS';
        $brandName = $r1['L'] ?? 'AEO';
        $season = $r1['N'] ?? 'SPRING-2027';
        $styleRef = $r1['P'] ?? '5481';
        $prodDept = $r1['R'] ?? 'AEO MENS';
        $merchant = $r1['T'] ?? '';

        // 2. Extract Size Scale Header (Row 3)
        $r3 = $allRows[3] ?? [];
        $sizeCols = [];
        foreach ($r3 as $col => $val) {
            $val = trim((string)$val);
            if (!empty($val) && !in_array($col, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])) {
                $sizeCols[$col] = $val;
            }
        }

        // 3. Extract PO Blocks
        $pos = [];
        $detectedColors = [];
        $totalCalculatedQty = 0;

        foreach ($allRows as $rowNum => $row) {
            $colA = trim((string)($row['A'] ?? ''));
            $nextRow = $allRows[$rowNum + 1] ?? [];
            $nextColA = trim((string)($nextRow['A'] ?? ''));

            // A valid PO block has a PO number in Col A (and is NOT style ref / grand total) AND next row has 'Ship Date'
            $isSummary = str_contains(strtolower($colA), 'total') || $colA === $styleRef || str_contains(strtolower($colA), 'grand');
            $hasShipDate = str_starts_with(strtolower($nextColA), 'ship date');

            if (!empty($colA) && !$isSummary && ($hasShipDate || is_numeric($colA) || str_starts_with($colA, 'TBA') || str_starts_with($colA, 'ROLLING'))) {
                $shipDateRaw = $nextRow['A'] ?? '';
                $shipDate = $this->parseShipDate($shipDateRaw);
                $unitPrice = (float) filter_var($nextRow['D'] ?? '15.00', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
                $smv = (float) filter_var($nextRow['E'] ?? '20.00', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);

                $item = $row['E'] ?? 'GARMENT ITEM';
                $dest = !empty($row['F']) ? $row['F'] : 'USA [USA]';
                $color = strtoupper(trim((string)($row['G'] ?? 'DEFAULT COLOR')));
                $poTotal = (int) filter_var($row['H'] ?? ($row['D'] ?? '0'), FILTER_SANITIZE_NUMBER_INT);
                
                if (!empty($color)) {
                    $detectedColors[$color] = true;
                }

                // Extract size quantities
                $breakdowns = [];
                $breakdownSum = 0;
                foreach ($sizeCols as $col => $sizeName) {
                    $qtyVal = isset($row[$col]) ? (int) floatval($row[$col]) : 0;
                    if ($qtyVal > 0) {
                        $breakdowns[] = [
                            'color_name' => $color,
                            'size_name' => $sizeName,
                            'quantity' => $qtyVal,
                        ];
                        $breakdownSum += $qtyVal;
                    }
                }

                // If breakdown sum is 0 (like TBA / rolling stock), use PO total
                if ($breakdownSum === 0 && $poTotal > 0) {
                    $breakdownSum = $poTotal;
                }

                $totalCalculatedQty += $breakdownSum;

                $pos[] = [
                    'po_number' => $colA,
                    'item_name' => $item,
                    'destination_market' => $dest,
                    'color_name' => $color,
                    'order_quantity' => $breakdownSum,
                    'ship_date' => $shipDate,
                    'unit_price' => $unitPrice > 0 ? $unitPrice : 15.00,
                    'smv' => $smv > 0 ? $smv : 20.00,
                    'status' => 'DRAFT',
                    'breakdowns' => $breakdowns,
                ];
            }
        }

        // 4. Master Data Validation Cross-Check
        $matchedBuyer = Buyer::where('name', 'ILIKE', "%{$buyerName}%")
            ->orWhere('code', 'ILIKE', "%{$buyerName}%")
            ->first();

        $matchedBrand = null;
        if ($matchedBuyer) {
            $matchedBrand = Brand::where('buyer_id', $matchedBuyer->id)
                ->where(function ($q) use ($brandName) {
                    $q->where('name', 'ILIKE', "%{$brandName}%")
                      ->orWhere('code', 'ILIKE', "%{$brandName}%");
                })->first();
        }

        $matchedStyle = Style::where('style_number', 'ILIKE', "%{$styleRef}%")
            ->orWhere('style_name', 'ILIKE', "%{$styleRef}%")
            ->first();

        // Cross-check missing colors and sizes
        $existingColors = Color::pluck('name')->map(fn($n) => strtoupper($n))->toArray();
        $missingColors = array_values(array_diff(array_keys($detectedColors), $existingColors));

        $existingSizes = Size::pluck('name')->map(fn($n) => strtoupper($n))->toArray();
        $detectedSizeNames = array_values(array_unique(array_values($sizeCols)));
        $missingSizes = array_values(array_diff(array_map('strtoupper', $detectedSizeNames), $existingSizes));

        $existingOrder = Order::where('order_number', $jobNo)->first();

        return [
            'status' => 'preview_ready',
            'order_summary' => [
                'job_number' => $jobNo,
                'buyer_name' => $buyerName,
                'matched_buyer_id' => $matchedBuyer?->id,
                'matched_buyer_name' => $matchedBuyer?->name,
                'brand_name' => $brandName,
                'matched_brand_id' => $matchedBrand?->id,
                'season' => $season,
                'style_reference' => $styleRef,
                'matched_style_id' => $matchedStyle?->id,
                'matched_style_name' => $matchedStyle?->style_name,
                'product_department' => $prodDept,
                'merchant_name' => $merchant,
                'total_job_quantity' => $totalJobQty > 0 ? $totalJobQty : $totalCalculatedQty,
                'total_calculated_quantity' => $totalCalculatedQty,
                'total_pos_count' => count($pos),
                'total_estimated_value' => $totalCalculatedQty * 15.00,
                'currency' => 'USD',
            ],
            'size_scale_headers' => array_values($sizeCols),
            'detected_colors' => array_keys($detectedColors),
            'reconciliation_audit' => [
                'buyer_found' => (bool) $matchedBuyer,
                'brand_found' => (bool) $matchedBrand,
                'style_found' => (bool) $matchedStyle,
                'order_already_exists' => (bool) $existingOrder,
                'existing_order_id' => $existingOrder?->id,
                'missing_colors' => $missingColors,
                'missing_sizes' => $missingSizes,
                'ready_for_direct_commit' => ($matchedBuyer && $matchedStyle && !$existingOrder),
            ],
            'purchase_orders' => $pos,
        ];
    }

    /**
     * Commit Staging Data into Live Production Order in Database
     */
    public function commitStagingOrder(array $stagingData, User $actor, ?string $ip = null): Order
    {
        return DB::transaction(function () use ($stagingData, $actor, $ip) {
            $summary = $stagingData['order_summary'];
            $pos = $stagingData['purchase_orders'] ?? [];
            $autoCreate = $stagingData['auto_create_missing'] ?? true;

            $orderNumber = strtoupper(trim($summary['job_number'] ?? ''));
            if (empty($orderNumber)) {
                $orderNumber = 'ORD-' . strtoupper(substr(uniqid(), -6));
            }

            // 1. Resolve or Create Buyer
            $buyerId = $summary['matched_buyer_id'] ?? null;
            if (!$buyerId && $autoCreate) {
                $buyer = Buyer::create([
                    'name' => $summary['buyer_name'],
                    'code' => 'BUY-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $summary['buyer_name']), 0, 4)),
                    'currency' => $summary['currency'] ?? 'USD',
                ]);
                $buyerId = $buyer->id;
            } elseif (!$buyerId) {
                $buyer = Buyer::first();
                $buyerId = $buyer?->id;
            }

            // 2. Resolve or Create Brand
            $brandId = $summary['matched_brand_id'] ?? null;
            if (!$brandId && $buyerId && !empty($summary['brand_name']) && $autoCreate) {
                $brand = Brand::create([
                    'buyer_id' => $buyerId,
                    'name' => $summary['brand_name'],
                    'code' => 'BR-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $summary['brand_name']), 0, 4)),
                ]);
                $brandId = $brand->id;
            }

            // 3. Resolve or Create Style
            $styleId = $summary['matched_style_id'] ?? null;
            if (!$styleId && $buyerId && $autoCreate) {
                $style = Style::create([
                    'buyer_id' => $buyerId,
                    'brand_id' => $brandId,
                    'style_number' => $summary['style_reference'] ?? '5481',
                    'style_name' => !empty($summary['product_department']) ? $summary['product_department'] : ('Style ' . ($summary['style_reference'] ?? '5481')),
                    'garment_type' => 'PANT',
                    'season' => $summary['season'] ?? 'SPRING-2027',
                    'total_smv' => 20.00,
                ]);
                $styleId = $style->id;
            } elseif (!$styleId) {
                $style = Style::where('buyer_id', $buyerId)->first() ?? Style::first();
                $styleId = $style?->id;
            }

            // 4. Auto-create missing colors and sizes in Master Data
            if ($autoCreate) {
                if (!empty($stagingData['reconciliation_audit']['missing_colors'])) {
                    foreach ($stagingData['reconciliation_audit']['missing_colors'] as $cName) {
                        Color::firstOrCreate(['name' => $cName], [
                            'code' => 'COL-' . strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $cName), 0, 4)),
                            'hex_code' => '#4B5563',
                        ]);
                    }
                }

                if (!empty($stagingData['reconciliation_audit']['missing_sizes'])) {
                    foreach ($stagingData['reconciliation_audit']['missing_sizes'] as $sName) {
                        Size::firstOrCreate(['name' => $sName], [
                            'code' => 'SZ-' . strtoupper(str_replace(' ', '', $sName)),
                            'category' => 'NUMERIC',
                        ]);
                    }
                }
            }

            // 5. Upsert Order Master (Update if exists/trashed, create if new)
            $existing = Order::withTrashed()->whereRaw('LOWER(TRIM(order_number)) = ?', [strtolower(trim($orderNumber))])->first();
            if ($existing) {
                if ($existing->trashed()) {
                    $existing->restore();
                } elseif ($existing->status === 'CONFIRMED') {
                    throw ValidationException::withMessages([
                        'order_summary.job_number' => ["Job Order \"{$orderNumber}\" is already confirmed and locked for production. Unlock before re-importing."],
                    ]);
                }

                $existing->update([
                    'buyer_id' => $buyerId,
                    'brand_id' => $brandId,
                    'style_id' => $styleId,
                    'season' => $summary['season'] ?? 'SPRING-2027',
                    'merchant_name' => $summary['merchant_name'] ?? $actor->name,
                    'total_quantity' => $summary['total_calculated_quantity'] ?? 0,
                    'total_value' => $summary['total_estimated_value'] ?? 0.00,
                    'currency' => $summary['currency'] ?? 'USD',
                    'remarks' => "Updated via Enterprise PO Excel Parser on " . now()->toFormattedDateString(),
                ]);

                // Cleanly remove old draft PO lines & breakdowns to refresh with latest sheet
                foreach ($existing->purchaseOrders as $oldPo) {
                    $oldPo->breakdowns()->delete();
                    $oldPo->delete();
                }

                $order = $existing;
            } else {
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'buyer_id' => $buyerId,
                    'brand_id' => $brandId,
                    'style_id' => $styleId,
                    'season' => $summary['season'] ?? 'SPRING-2027',
                    'merchant_name' => $summary['merchant_name'] ?? $actor->name,
                    'total_quantity' => $summary['total_calculated_quantity'] ?? 0,
                    'total_value' => $summary['total_estimated_value'] ?? 0.00,
                    'currency' => $summary['currency'] ?? 'USD',
                    'status' => 'DRAFT',
                    'remarks' => "Ingested via Enterprise PO Excel Parser on " . now()->toFormattedDateString(),
                ]);
            }

            // 6. Insert POs and Matrix Breakdowns
            foreach ($pos as $pData) {
                $po = $order->purchaseOrders()->create([
                    'po_number' => strtoupper(trim($pData['po_number'])),
                    'destination_market' => $pData['destination_market'] ?? 'USA [USA]',
                    'ship_date' => $pData['ship_date'] ?? now()->addDays(60)->toDateString(),
                    'order_quantity' => (int) ($pData['order_quantity'] ?? 0),
                    'unit_price' => (float) ($pData['unit_price'] ?? 15.00),
                    'smv' => (float) ($pData['smv'] ?? 20.00),
                    'status' => 'DRAFT',
                    'notes' => $pData['item_name'] ?? null,
                ]);

                if (!empty($pData['breakdowns']) && is_array($pData['breakdowns'])) {
                    $this->poService->syncPoMatrixBreakdown($po, $pData['breakdowns'], (int)$pData['order_quantity']);
                }
            }

            $this->orderService->recalculateOrderTotals($order);

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'EXCEL_IMPORT_ORDER',
                'module' => 'OrderManagement',
                'ip_address' => $ip,
                'payload' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'pos_count' => count($pos),
                    'total_quantity' => $order->total_quantity,
                ],
            ]);

            return $order->load(['buyer', 'brand', 'style', 'purchaseOrders.breakdowns']);
        });
    }

    /**
     * Low-level pure PHP XML parser for XLSX workbook & sheets without external vendor packages
     */
    protected function extractXmlFromXlsx(string $filePath): array
    {
        $zip = new ZipArchive;
        if ($zip->open($filePath) !== true) {
            throw ValidationException::withMessages([
                'excel_file' => ['Unable to decompress or read valid XLSX archive.'],
            ]);
        }

        // 1. Read Shared Strings
        $sharedStrings = [];
        $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($sharedStringsXml) {
            $xml = new SimpleXMLElement($sharedStringsXml);
            foreach ($xml->si as $si) {
                if (isset($si->t)) {
                    $sharedStrings[] = (string) $si->t;
                } else {
                    $parts = [];
                    foreach ($si->xpath('.//t') as $tElem) {
                        $parts[] = (string) $tElem;
                    }
                    $sharedStrings[] = implode('', $parts);
                }
            }
        }

        // 2. Read Primary Worksheet (Dynamic detection of sheet1.xml or whatever first sheet is named)
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        if (!$sheetXml) {
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $name = $zip->getNameIndex($i);
                if (str_starts_with($name, 'xl/worksheets/') && str_ends_with($name, '.xml')) {
                    $sheetXml = $zip->getFromIndex($i);
                    break;
                }
            }
        }

        if (!$sheetXml) {
            $zip->close();
            throw ValidationException::withMessages([
                'excel_file' => ['No valid worksheet found in the uploaded workbook.'],
            ]);
        }

        $xml = new SimpleXMLElement($sheetXml);
        $rowsData = [];

        foreach ($xml->sheetData->row as $row) {
            $rowNum = (int) $row['r'];
            $rowCells = [];

            foreach ($row->c as $c) {
                $cellRef = (string) $c['r'];
                $colLetter = preg_replace('/[0-9]/', '', $cellRef);
                $type = (string) $c['t'];
                $val = isset($c->v) ? (string) $c->v : '';

                if ($type === 's' && is_numeric($val)) {
                    $idx = (int) $val;
                    $val = $sharedStrings[$idx] ?? '';
                }

                $rowCells[$colLetter] = trim($val);
            }

            $rowsData[$rowNum] = $rowCells;
        }

        $zip->close();
        return ['rows' => $rowsData];
    }

    protected function parseShipDate(string $rawDate): string
    {
        $clean = trim(str_ireplace(['Ship Date:', 'PHD Date:'], '', $rawDate));
        if (empty($clean)) {
            return now()->addDays(60)->toDateString();
        }

        $timestamp = strtotime($clean);
        if ($timestamp !== false) {
            return date('Y-m-d', $timestamp);
        }

        return now()->addDays(60)->toDateString();
    }
}
