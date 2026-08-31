<?php

use App\Domains\AuthAdmin\Controllers\AuthController;
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
            Route::post('/users', [UserController::class, 'store']); // Only Admin can register users
            Route::put('/users/{id}', [UserController::class, 'update']);
            Route::delete('/users/{id}', [UserController::class, 'destroy']);
            
            // Roles & Permissions List
            Route::get('/roles', [UserController::class, 'roles']);
            
            // Floor Devices (Tablets)
            Route::get('/devices', [UserController::class, 'devices']);
            Route::post('/devices', [UserController::class, 'storeDevice']); // Only Admin can register floor tablets
            Route::put('/devices/{id}', [UserController::class, 'updateDevice']);
            Route::delete('/devices/{id}', [UserController::class, 'destroyDevice']);
            
            // Immutable Audit Trail
            Route::get('/audit-logs', [UserController::class, 'auditLogs']);

            // Dynamic System Settings (Redis Cached)
            Route::get('/settings', [SystemSettingController::class, 'index']);
            Route::post('/settings', [SystemSettingController::class, 'update']);
        });

    });

});
