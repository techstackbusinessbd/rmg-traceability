<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$service = app(App\Domains\OrderManagement\Services\PoExcelIngestionService::class);
$refPath = file_exists('/tmp/PO.xlsx') ? '/tmp/PO.xlsx' : realpath(__DIR__ . '/../ref/PO.xlsx');

if (!$refPath || !file_exists($refPath)) {
    echo "Ref file not found\n";
    exit(1);
}

echo "Testing Excel parser with: $refPath\n";
$result = $service->parseExcelStaging($refPath);

echo "\n=== PARSER STAGING RESULT ===\n";
echo "Job Number: " . $result['order_summary']['job_number'] . "\n";
echo "Buyer: " . $result['order_summary']['buyer_name'] . "\n";
echo "Total Calculated Qty: " . number_format($result['order_summary']['total_calculated_quantity']) . " Pcs\n";
echo "Total Value: $" . number_format($result['order_summary']['total_estimated_value'], 2) . " USD\n";
echo "Total POs: " . count($result['purchase_orders']) . "\n";
echo "Size Scales Found: " . count($result['size_scale_headers']) . " (" . implode(', ', array_slice($result['size_scale_headers'], 0, 8)) . "...)\n";

echo "\nPO Breakdown:\n";
foreach ($result['purchase_orders'] as $idx => $po) {
    echo " [" . ($idx + 1) . "] PO: {$po['po_number']} | Color: {$po['color_name']} | Dest: {$po['destination_market']} | Qty: {$po['order_quantity']} Pcs | Ship: {$po['ship_date']}\n";
}

echo "\nReconciliation Audit:\n";
echo "Missing Colors: " . json_encode($result['reconciliation_audit']['missing_colors']) . "\n";
echo "Missing Sizes: " . count($result['reconciliation_audit']['missing_sizes']) . " sizes\n";

echo "\nTesting 1-Click Commit into Database...\n";
$adminUser = App\Domains\AuthAdmin\Models\User::first();
if (!$adminUser) {
    echo "No user found in DB, skipping commit\n";
    exit(0);
}

$order = $service->commitStagingOrder($result, $adminUser, '127.0.0.1');
echo "\nSUCCESSFULLY COMMITTED ORDER TO DB!\n";
echo "Created Order ID: {$order->id}\n";
echo "Order Number: {$order->order_number}\n";
echo "Total Quantity in DB: " . number_format($order->total_quantity) . " Pcs\n";
echo "Total POs in DB: " . $order->purchaseOrders()->count() . "\n";
echo "Total Matrix Breakdowns in DB: " . App\Domains\OrderManagement\Models\PoBreakdown::count() . " rows\n";
