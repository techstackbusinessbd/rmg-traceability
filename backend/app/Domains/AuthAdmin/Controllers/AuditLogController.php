<?php

namespace App\Domains\AuthAdmin\Controllers;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Services\AuditLogService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Get Paginated and Filtered Audit Trail Logs (Admin / Super Admin)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 25);
        $logs = $this->auditLogService->getFilteredLogs($request->all(), $perPage);

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }

    /**
     * Get Single Audit Log Details
     */
    public function show(string $id): JsonResponse
    {
        $log = AuditLog::with(['user', 'company', 'unit'])->find($id);

        if (! $log) {
            return response()->json([
                'status' => 'error',
                'message' => 'Audit log record not found.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $log,
        ]);
    }

    /**
     * Export Filtered Audit Trail to CSV (Big ERP Compliance Standard)
     */
    public function export(Request $request): StreamedResponse
    {
        $logs = $this->auditLogService->getExportLogs($request->all());

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="rmg_audit_trail_' . date('Ymd_His') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            
            // CSV Header Row
            fputcsv($file, [
                'Log ID',
                'Timestamp (UTC)',
                'Module',
                'Event',
                'Action',
                'Summary / Description',
                'Actor Name',
                'Employee ID',
                'User Role',
                'IP Address',
                'HTTP Method',
                'Target Entity',
                'Old Values Snapshot',
                'New Values Snapshot',
            ]);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at ? $log->created_at->toIso8601String() : '',
                    $log->module,
                    $log->event,
                    $log->action,
                    $log->action_summary,
                    $log->user_name,
                    $log->user_emp_id,
                    $log->user_role,
                    $log->ip_address,
                    $log->http_method,
                    $log->auditable_type ? ($log->auditable_type . ' #' . $log->auditable_id) : 'N/A',
                    $log->old_values ? json_encode($log->old_values) : '',
                    $log->new_values ? json_encode($log->new_values) : ($log->payload ? json_encode($log->payload) : ''),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
