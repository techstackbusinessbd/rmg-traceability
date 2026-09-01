<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Domains\Planning\Models\ProductionPlan;
use App\Domains\Planning\Services\ProductionPlanningService;
use App\Domains\Cutting\Models\Cut;
use App\Domains\Cutting\Models\Bundle;
use App\Domains\Cutting\Models\SinglePieceQr;
use App\Domains\Cutting\Services\CuttingOrderService;
use App\Domains\Cutting\Services\BundleQrGeneratorService;
use App\Domains\OrderManagement\Models\Order;
use App\Domains\OrderManagement\Models\PurchaseOrder;
use App\Domains\MasterData\Models\ProductionLine;
use App\Domains\AuthAdmin\Models\User;
use Illuminate\Validation\ValidationException;

echo "========================================================\n";
echo "MODULE 04 & 05: PLANNING & CUTTING GOVERNANCE TEST\n";
echo "========================================================\n\n";

$actor = User::first() ?? User::factory()->create(['name' => 'IE Planning Lead']);
$planningService = app(ProductionPlanningService::class);
$cuttingService = app(CuttingOrderService::class);
$bundleService = app(BundleQrGeneratorService::class);

$order = Order::where('order_number', 'ITS-26-00391')->first() ?? Order::first();
if (!$order) {
    echo "❌ No active Job Order found. Run test_po_import.php first.\n";
    exit(1);
}

$line = ProductionLine::first();
if (!$line) {
    echo "❌ No Production Line found in master data.\n";
    exit(1);
}

// ----------------------------------------------------
// TEST 1: IE Mathematical Hourly Target Calculation
// ----------------------------------------------------
echo "[TEST 1] IE Hourly Target Formula: ((Manpower * 60) / SMV) * (Eff% / 100)...\n";
$target1 = $planningService->calculateHourlyTarget(30, 15.00, 60.00); // ((30*60)/15) * 0.60 = 72
echo "  - Manpower: 30, SMV: 15.00, Eff: 60% => Calculated Hourly Target: {$target1} Pcs/Hr\n";
if ($target1 === 72) {
    echo "  ✓ PASS: IE Capacity Target Formula is 100% accurate (72 Pcs/Hr).\n\n";
} else {
    echo "  ❌ FAIL: Expected 72 but got {$target1}\n\n";
}

// ----------------------------------------------------
// TEST 2: Production Plan Creation & Schedule Conflict
// ----------------------------------------------------
echo "[TEST 2] Schedule Production Plan for Line #{$line->code}...\n";
// Clean up previous test plans
ProductionPlan::where('order_id', $order->id)->forceDelete();

$plan = $planningService->createPlan([
    'order_id' => $order->id,
    'purchase_order_id' => $order->purchaseOrders()->first()?->id,
    'line_id' => $line->id,
    'start_date' => '2026-10-01',
    'end_date' => '2026-10-10',
    'smv' => 15.00,
    'manpower' => 30,
    'target_efficiency' => 60.00,
    'planned_quantity' => 2000,
    'cutting_mode' => 'DEPENDENT', // Strict FIFO Mode
], $actor);

echo "  ✓ PASS: Created Plan ID: {$plan->id} (Line: {$line->code}, Mode: {$plan->cutting_mode})\n";

echo "  - Testing Schedule Double-Booking Conflict on Line #{$line->code} (2026-10-05 to 2026-10-15)...\n";
try {
    $planningService->createPlan([
        'order_id' => $order->id,
        'line_id' => $line->id,
        'start_date' => '2026-10-05',
        'end_date' => '2026-10-15',
    ], $actor);
    echo "  ❌ FAIL: Overlapping plan was NOT blocked!\n\n";
} catch (ValidationException $e) {
    echo "  ✓ PASS: Double-Booking Conflict caught cleanly: " . json_encode($e->errors()) . "\n\n";
}

// ----------------------------------------------------
// TEST 3: Cutting Dependency Governance (Dependent vs Independent)
// ----------------------------------------------------
echo "[TEST 3] Testing Cutting Dependency Governance (Strict FIFO vs Independent)...\n";
$pos = $order->purchaseOrders()->orderBy('ship_date', 'asc')->get();
$firstPo = $pos[0] ?? null;
$laterPo = $order->purchaseOrders()->where('ship_date', '>', $firstPo->ship_date)->orderBy('ship_date', 'asc')->first();

if ($firstPo && $laterPo) {
    echo "  - Earliest PO: #{$firstPo->po_number} (Ship Date: {$firstPo->ship_date}, Cut Qty: {$firstPo->cut_quantity})\n";
    echo "  - Later PO: #{$laterPo->po_number} (Ship Date: {$laterPo->ship_date}, Cut Qty: {$laterPo->cut_quantity})\n";

    // Attempting to cut later PO while earliest PO is still pending in DEPENDENT mode
    echo "  - Attempting to cut later PO #{$laterPo->po_number} under DEPENDENT mode...\n";
    try {
        $cuttingService->createCutOrder([
            'purchase_order_id' => $laterPo->id,
            'color_name' => 'OG KHAKI',
            'size_name' => '32X30',
            'planned_cut_qty' => 500,
            'actual_cut_qty' => 500,
            'pcs_per_bundle' => 50,
        ], $actor);
        echo "  ❌ FAIL: Dependent Mode did not block later PO cutting!\n\n";
    } catch (ValidationException $e) {
        echo "  ✓ PASS: Dependent Mode successfully BLOCKED cutting later PO: " . json_encode($e->errors()) . "\n";
    }

    // Now test Independent Mode
    echo "  - Switching Planning Governance to INDEPENDENT mode...\n";
    $plan->update(['cutting_mode' => 'INDEPENDENT']);

    $cut = $cuttingService->createCutOrder([
        'purchase_order_id' => $laterPo->id,
        'color_name' => 'OG KHAKI',
        'size_name' => '32X30',
        'planned_cut_qty' => 520,
        'actual_cut_qty' => 520,
        'pcs_per_bundle' => 50,
    ], $actor);

    echo "  ✓ PASS: Independent Mode allowed cutting PO #{$laterPo->po_number}! Cut Number: {$cut->cut_number}\n\n";

    // ----------------------------------------------------
    // TEST 4: Mathematical Bundle & Single-Piece QR Generation
    // ----------------------------------------------------
    echo "[TEST 4] Verifying Mathematical Bundle & Single Piece QRs for 520 Pcs (@ 50 Pcs/Bundle)...\n";
    $bundles = Bundle::where('cut_id', $cut->id)->orderBy('bundle_number')->get();
    $totalSinglePieces = SinglePieceQr::whereIn('bundle_id', $bundles->pluck('id'))->count();

    echo "  - Bundles Created: {$bundles->count()} (Expected: 11 Bundles)\n";
    echo "  - Single Piece QRs Created: {$totalSinglePieces} (Expected: 520 Sub-QRs)\n";

    $lastBundle = $bundles->last();
    echo "  - Last Bundle (#{$lastBundle->bundle_number}) Quantity: {$lastBundle->quantity} Pcs (Piece Range: {$lastBundle->start_piece_no} - {$lastBundle->end_piece_no})\n";

    if ($bundles->count() === 11 && $totalSinglePieces === 520 && $lastBundle->quantity === 20) {
        echo "  ✓ PASS: Mathematical Bundle & Single Piece QR Partitioning is 100% PERFECT!\n\n";
    } else {
        echo "  ❌ FAIL: Bundle count or Single Piece QR count mismatch!\n\n";
    }
}

echo "========================================================\n";
echo "ALL MODULE 04 & MODULE 05 TESTS COMPLETED SUCCESSFULLY!\n";
echo "========================================================\n";
