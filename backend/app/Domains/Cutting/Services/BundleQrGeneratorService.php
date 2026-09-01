<?php

namespace App\Domains\Cutting\Services;

use App\Domains\Cutting\Models\Bundle;
use App\Domains\Cutting\Models\Cut;
use App\Domains\Cutting\Models\SinglePieceQr;
use Illuminate\Support\Str;

class BundleQrGeneratorService
{
    /**
     * Mathematically partitions cut quantity into bundles and generates single piece QRs
     * e.g., 520 Pcs with 50 Pcs/Bundle => 10 bundles of 50 + 1 bundle of 20 = 11 bundles
     */
    public function generateBundlesForCut(Cut $cut, int $actualCutQty, int $pcsPerBundle): array
    {
        $bundlesCreated = [];
        $remainingQty = $actualCutQty;
        $bundleNumber = 1;
        $currentPieceCounter = 1;
        $datePrefix = date('ym'); // e.g. 2609

        $po = $cut->purchaseOrder;
        $poNumClean = preg_replace('/[^a-zA-Z0-9]/', '', $po?->po_number ?? 'PO');
        $poSuffix = substr($poNumClean, -4) ?: 'PO';

        while ($remainingQty > 0) {
            $bundleQty = min($remainingQty, $pcsPerBundle);
            $startPiece = $currentPieceCounter;
            $endPiece = $currentPieceCounter + $bundleQty - 1;

            $bundleCode = sprintf('BND-%s-%s-%s-%03d', $datePrefix, $poSuffix, str_replace('-', '', $cut->cut_number), $bundleNumber);
            $qrHash = 'QR-BND-' . (string) Str::uuid();

            $bundle = Bundle::create([
                'cut_id' => $cut->id,
                'purchase_order_id' => $cut->purchase_order_id,
                'bundle_number' => $bundleNumber,
                'bundle_code' => $bundleCode,
                'color_id' => $cut->color_id,
                'color_name' => $cut->color_name,
                'size_id' => $cut->size_id,
                'size_name' => $cut->size_name,
                'quantity' => $bundleQty,
                'qr_code_hash' => $qrHash,
                'start_piece_no' => $startPiece,
                'end_piece_no' => $endPiece,
                'status' => 'CUT_COMPLETED',
            ]);

            // Bulk generate Single Piece QRs for this bundle
            $singlePiecesData = [];
            for ($p = $startPiece; $p <= $endPiece; $p++) {
                $singlePiecesData[] = [
                    'id' => (string) Str::uuid(),
                    'bundle_id' => $bundle->id,
                    'piece_number' => $p,
                    'unique_tracking_code' => 'QR-PC-' . (string) Str::uuid(),
                    'status' => 'CREATED',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            if (!empty($singlePiecesData)) {
                SinglePieceQr::insert($singlePiecesData);
            }

            $bundlesCreated[] = $bundle;
            $remainingQty -= $bundleQty;
            $currentPieceCounter = $endPiece + 1;
            $bundleNumber++;
        }

        return $bundlesCreated;
    }
}
