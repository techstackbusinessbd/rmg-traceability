<?php

use App\Domains\AuthAdmin\Controllers\AuditLogController;
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
            Route::post('/permissions', [UserController::class, 'storePermission']);
            Route::delete('/permissions/{id}', [UserController::class, 'destroyPermission']);
            
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

            // Immutable Enterprise Audit Trail
            Route::get('/audit-logs', [AuditLogController::class, 'index']);
            Route::get('/audit-logs/export', [AuditLogController::class, 'export']);
            Route::get('/audit-logs/{id}', [AuditLogController::class, 'show']);

            // Dynamic System Settings (Redis Cached)
            Route::get('/settings', [SystemSettingController::class, 'index']);
            Route::post('/settings', [SystemSettingController::class, 'update']);
        });

        // =========================================================
        // MODULE 02: MASTER DATA SETUP
        // =========================================================
        Route::prefix('master')->group(function () {
            
            // Group of Companies & Plant Structure
            Route::get('/companies', [PlantStructureController::class, 'indexCompanies']);
            Route::post('/companies', [PlantStructureController::class, 'storeCompany']);

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

        // =========================================================
        // MODULE 03: ORDER & PURCHASE ORDER (PO) MANAGEMENT
        // =========================================================
        Route::prefix('orders')->group(function () {
            Route::get('/', [\App\Domains\OrderManagement\Controllers\OrderController::class, 'index']);
            Route::post('/', [\App\Domains\OrderManagement\Controllers\OrderController::class, 'store']);
            Route::get('/{id}', [\App\Domains\OrderManagement\Controllers\OrderController::class, 'show']);
            Route::put('/{id}', [\App\Domains\OrderManagement\Controllers\OrderController::class, 'update']);
            Route::delete('/{id}', [\App\Domains\OrderManagement\Controllers\OrderController::class, 'destroy']);
            Route::post('/{id}/confirm', [\App\Domains\OrderManagement\Controllers\OrderController::class, 'confirm']);

            // Child Purchase Orders
            Route::post('/{orderId}/pos', [\App\Domains\OrderManagement\Controllers\PoBreakdownController::class, 'storePo']);

            // Excel Ingestion Engine
            Route::post('/import/preview', [\App\Domains\OrderManagement\Controllers\PoImportController::class, 'previewExcel']);
            Route::post('/import/commit', [\App\Domains\OrderManagement\Controllers\PoImportController::class, 'commitStaging']);
        });

        Route::prefix('pos')->group(function () {
            Route::put('/{id}', [\App\Domains\OrderManagement\Controllers\PoBreakdownController::class, 'updatePo']);
            Route::delete('/{id}', [\App\Domains\OrderManagement\Controllers\PoBreakdownController::class, 'destroyPo']);
            Route::get('/{id}/matrix', [\App\Domains\OrderManagement\Controllers\PoBreakdownController::class, 'getMatrix']);
            Route::put('/{id}/matrix', [\App\Domains\OrderManagement\Controllers\PoBreakdownController::class, 'updateMatrix']);
        });

        // =========================================================
        // MODULE 04: IE & PRODUCTION PLANNING
        // =========================================================
        Route::prefix('planning')->group(function () {
            Route::get('/plans', [\App\Domains\Planning\Controllers\ProductionPlanController::class, 'index']);
            Route::post('/plans', [\App\Domains\Planning\Controllers\ProductionPlanController::class, 'store']);
            Route::post('/calculate-target', [\App\Domains\Planning\Controllers\ProductionPlanController::class, 'calculateMath']);
            Route::get('/plans/{id}', [\App\Domains\Planning\Controllers\ProductionPlanController::class, 'show']);
            Route::put('/plans/{id}', [\App\Domains\Planning\Controllers\ProductionPlanController::class, 'update']);
            Route::delete('/plans/{id}', [\App\Domains\Planning\Controllers\ProductionPlanController::class, 'destroy']);
        });

        // =========================================================
        // MODULE 05: CUTTING & BUNDLE TICKET GENERATION
        // =========================================================
        Route::prefix('cutting')->group(function () {
            Route::get('/cuts', [\App\Domains\Cutting\Controllers\CutController::class, 'index']);
            Route::post('/cuts', [\App\Domains\Cutting\Controllers\CutController::class, 'store']);
            Route::get('/cuts/{id}', [\App\Domains\Cutting\Controllers\CutController::class, 'show']);
            Route::delete('/cuts/{id}', [\App\Domains\Cutting\Controllers\CutController::class, 'destroy']);
            Route::get('/check-eligibility/{poId}', [\App\Domains\Cutting\Controllers\CutController::class, 'checkPoEligibility']);

            // Bundle Tickets & QR scanning
            Route::get('/bundles', [\App\Domains\Cutting\Controllers\BundleController::class, 'index']);
            Route::get('/bundles/{id}', [\App\Domains\Cutting\Controllers\BundleController::class, 'show']);
            Route::post('/scan-qr', [\App\Domains\Cutting\Controllers\BundleController::class, 'scanQr']);
        });

    });

});

