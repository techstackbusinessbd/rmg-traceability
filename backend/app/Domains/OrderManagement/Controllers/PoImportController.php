<?php

namespace App\Domains\OrderManagement\Controllers;

use App\Domains\OrderManagement\Services\PoExcelIngestionService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PoImportController extends Controller
{
    public function __construct(
        protected PoExcelIngestionService $ingestionService
    ) {}

    public function previewExcel(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:20480', // 20MB
            'buyer_id' => 'nullable|uuid|exists:buyers,id',
        ]);

        $uploadedFile = $request->file('file');
        $ext = $uploadedFile->getClientOriginalExtension() ?: 'xlsx';
        $tempPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'po_upload_' . uniqid() . '.' . $ext;
        $uploadedFile->move(sys_get_temp_dir(), basename($tempPath));

        try {
            $stagingResult = $this->ingestionService->parseExcelStaging($tempPath, $request->input('buyer_id'));
        } finally {
            if (file_exists($tempPath)) {
                @unlink($tempPath);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'PO Excel sheet parsed successfully. Review staging audit before committing.',
            'data' => $stagingResult,
        ]);
    }

    public function commitStaging(Request $request): JsonResponse
    {
        $request->validate([
            'order_summary' => 'required|array',
            'order_summary.job_number' => 'required|string',
            'order_summary.buyer_name' => 'required|string',
            'purchase_orders' => 'required|array|min:1',
            'auto_create_missing' => 'nullable|boolean',
        ]);

        $order = $this->ingestionService->commitStagingOrder($request->all(), $request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => "Job Order #{$order->order_number} and {$order->purchaseOrders()->count()} Purchase Orders ingested successfully.",
            'data' => $order,
        ], 201);
    }
}
