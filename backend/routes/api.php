<?php

use App\Domains\AuthAdmin\Controllers\AuthController;
use App\Domains\AuthAdmin\Controllers\ShiftController;
use App\Domains\AuthAdmin\Controllers\SystemSettingController;
use App\Domains\AuthAdmin\Controllers\UserController;
use App\Domains\MasterData\Controllers\AttributeController;
use App\Domains\MasterData\Controllers\BuyerController;
use App\Domains\MasterData\Controllers\PlantStructureController;
use App\Domains\MasterData\Controllers\StyleController;
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
    // PROTECTED ROUTES (SANCTUM BEARER TOKEN)
    // -------------------------------------------------------------
    Route::middleware('auth:sanctum')->group(function () {
        
        // Current User Profile & Logout
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // =========================================================
        // MODULE 01: AUTH & ADMINISTRATION
        // =========================================================
        Route::prefix('admin')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::get('/users/{id}', [UserController::class, 'show']);
            Route::post('/users', [UserController::class, 'store']);
            Route::put('/users/{id}', [UserController::class, 'update']);
            Route::delete('/users/{id}', [UserController::class, 'destroy']);
            
            // Roles & Permissions Matrix
            Route::get('/roles', [UserController::class, 'roles']);
            Route::post('/roles', [UserController::class, 'storeRole']);
            Route::put('/roles/{id}/permissions', [UserController::class, 'updateRolePermissions']);
            Route::delete('/roles/{id}', [UserController::class, 'destroyRole']);
            
            // Floor Devices (Tablets)
            Route::get('/devices', [UserController::class, 'devices']);
            Route::post('/devices', [UserController::class, 'storeDevice']);
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

        // =========================================================
        // MODULE 02: MASTER DATA SETUP
        // =========================================================
        Route::prefix('master')->group(function () {
            
            // Factory Plant Structure (Units, Floors, Lines)
            Route::get('/plant/tree', [PlantStructureController::class, 'tree']);
            Route::get('/units', [PlantStructureController::class, 'indexUnits']);
            Route::post('/units', [PlantStructureController::class, 'storeUnit']);
            Route::put('/units/{id}', [PlantStructureController::class, 'updateUnit']);
            Route::delete('/units/{id}', [PlantStructureController::class, 'destroyUnit']);

            Route::get('/floors', [PlantStructureController::class, 'indexFloors']);
            Route::post('/floors', [PlantStructureController::class, 'storeFloor']);
            Route::put('/floors/{id}', [PlantStructureController::class, 'updateFloor']);
            Route::delete('/floors/{id}', [PlantStructureController::class, 'destroyFloor']);

            Route::get('/lines', [PlantStructureController::class, 'indexLines']);
            Route::post('/lines', [PlantStructureController::class, 'storeLine']);
            Route::put('/lines/{id}', [PlantStructureController::class, 'updateLine']);
            Route::delete('/lines/{id}', [PlantStructureController::class, 'destroyLine']);

            // Buyers & Brands
            Route::get('/buyers', [BuyerController::class, 'index']);
            Route::post('/buyers', [BuyerController::class, 'store']);
            Route::put('/buyers/{id}', [BuyerController::class, 'update']);
            Route::delete('/buyers/{id}', [BuyerController::class, 'destroy']);
            Route::post('/brands', [BuyerController::class, 'storeBrand']);

            // Garment Styles & Operation Bulletin (OB / SMV)
            Route::get('/styles', [StyleController::class, 'index']);
            Route::post('/styles', [StyleController::class, 'store']);
            Route::put('/styles/{id}', [StyleController::class, 'update']);
            Route::delete('/styles/{id}', [StyleController::class, 'destroy']);
            Route::post('/styles/{id}/operations', [StyleController::class, 'storeOperation']);

            // Attributes: Colors, Sizes, Defects Codebook
            Route::get('/colors', [AttributeController::class, 'indexColors']);
            Route::post('/colors', [AttributeController::class, 'storeColor']);
            Route::delete('/colors/{id}', [AttributeController::class, 'destroyColor']);

            Route::get('/sizes', [AttributeController::class, 'indexSizes']);
            Route::post('/sizes', [AttributeController::class, 'storeSize']);
            Route::delete('/sizes/{id}', [AttributeController::class, 'destroySize']);

            Route::get('/defects', [AttributeController::class, 'indexDefects']);
            Route::post('/defects', [AttributeController::class, 'storeDefect']);
            Route::delete('/defects/{id}', [AttributeController::class, 'destroyDefect']);
        });

    });

});
