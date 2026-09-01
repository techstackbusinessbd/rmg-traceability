<?php

namespace App\Domains\Cutting\Controllers;

use App\Domains\Cutting\Models\Bundle;
use App\Domains\Cutting\Models\SinglePieceQr;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BundleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Bundle::with([
            'cut',
            'purchaseOrder.order.buyer',
            'purchaseOrder.order.style',
        ]);

        if ($request->filled('cut_id')) {
            $query->where('cut_id', $request->input('cut_id'));
        }

        if ($request->filled('purchase_order_id')) {
            $query->where('purchase_order_id', $request->input('purchase_order_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $bundles = $query->orderBy('created_at', 'desc')->paginate(50);

        return response()->json([
            'status' => 'success',
            'data' => $bundles,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $bundle = Bundle::with([
            'cut',
            'purchaseOrder.order.buyer',
            'purchaseOrder.order.style',
            'singlePieceQrs'
        ])->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $bundle,
        ]);
    }

    public function scanQr(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'qr_code_hash' => 'required|string',
        ]);

        // Check if QR matches a bundle or a single piece
        $bundle = Bundle::where('qr_code_hash', $validated['qr_code_hash'])
            ->with(['cut', 'purchaseOrder.order.buyer', 'purchaseOrder.order.style'])
            ->first();

        if ($bundle) {
            return response()->json([
                'status' => 'success',
                'type' => 'BUNDLE_QR',
                'data' => $bundle,
            ]);
        }

        $piece = SinglePieceQr::where('unique_tracking_code', $validated['qr_code_hash'])
            ->with(['bundle.cut', 'bundle.purchaseOrder.order.buyer'])
            ->first();

        if ($piece) {
            return response()->json([
                'status' => 'success',
                'type' => 'SINGLE_PIECE_QR',
                'data' => $piece,
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Invalid or unrecognized QR Code.',
        ], 404);
    }
}
