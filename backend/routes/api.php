<?php

use App\Domains\AuthAdmin\Controllers\AuthController;
use App\Domains\AuthAdmin\Controllers\ShiftController;
use App\Domains\AuthAdmin\Controllers\SystemSettingController;
use App\Domains\AuthAdmin\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 Routes - RMG Traceability Suite
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // -------------------------------------------------------------
    // MODULE 01: PUBLIC AUTH & CONFIG ROUTES
    // -------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/device-login', [AuthController::class, 'deviceLogin']);
    });

    // Public Settings for Floor Tablets
    Route::get('/settings/public', [SystemSettingController::class, 'publicSettings']);
    Route::get('/shifts/active', [ShiftController::class, 'index']); // Public endpoint for line tablets

    // -------------------------------------------------------------
    // MODULE 01: PROTECTED ROUTES (SANCTUM BEARER TOKEN)
    // -------------------------------------------------------------
    Route::middleware('auth:sanctum')->group(function () {
        
        // Current User Profile & Logout
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Admin-Only Protected User & System Management
        Route::prefix('admin')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/{id}', [UserController::class, 'show']);
            Route::post('/users', [UserController::class, 'store']); // Only Admin can register users
            Route::put('/users/{id}', [UserController::class, 'update']);
            Route::delete('/users/{id}', [UserController::class, 'destroy']);
            
            // Roles & Permissions Matrix
            Route::get('/roles', [UserController::class, 'roles']);
            Route::post('/roles', [UserController::class, 'storeRole']);
            Route::put('/roles/{id}/permissions', [UserController::class, 'updateRolePermissions']);
            Route::delete('/roles/{id}', [UserController::class, 'destroyRole']);
            
            // Floor Devices (Tablets)
            Route::get('/devices', [UserController::class, 'devices']);
            Route::post('/devices', [UserController::class, 'storeDevice']); // Only Admin can register floor tablets
            Route::put('/devices/{id}', [UserController::class, 'updateDevice']);
            Route::delete('/devices/{id}', [UserController::class, 'destroyDevice']);
            
            // Unit & Floor-wise Shifts Management
            Route::get('/shifts', [ShiftController::class, 'index']);
            Route::post('/shifts', [ShiftController::class, 'store']);
            Route::put('/shifts/{id}', [ShiftController::class, 'update']);
            Route::delete('/shifts/{id}', [ShiftController::class, 'destroy']);

            // Immutable Audit Trail
            Route::get('/audit-logs', [UserController::class, 'auditLogs']);

            // Dynamic System Settings (Redis Cached)
            Route::get('/settings', [SystemSettingController::class, 'index']);
            Route::post('/settings', [SystemSettingController::class, 'update']);
        });

    });

});
