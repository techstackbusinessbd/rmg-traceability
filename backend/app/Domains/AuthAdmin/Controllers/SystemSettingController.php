<?php

namespace App\Domains\AuthAdmin\Controllers;

use App\Domains\AuthAdmin\Services\SystemSettingService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemSettingController extends Controller
{
    public function __construct(
        protected SystemSettingService $settingService
    ) {}

    /**
     * Get All System Settings (Admin Only)
     */
    public function index(): JsonResponse
    {
        $settings = $this->settingService->getAllSettings();

        return response()->json([
            'status' => 'success',
            'data' => $settings,
        ]);
    }

    /**
     * Update Global Settings (Admin/Super Admin)
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
        ]);

        $updated = $this->settingService->updateSettings(
            $validated['settings'],
            $request->user(),
            $request->ip()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'System settings updated successfully and Redis cache synchronized.',
            'data' => $updated,
        ]);
    }

    /**
     * Get Public Settings for Tablets (No Auth or Device Token)
     */
    public function publicSettings(): JsonResponse
    {
        $settings = $this->settingService->getPublicSettings();

        return response()->json([
            'status' => 'success',
            'data' => $settings,
        ]);
    }
}
