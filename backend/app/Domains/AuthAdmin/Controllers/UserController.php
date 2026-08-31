<?php

namespace App\Domains\AuthAdmin\Controllers;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\Device;
use App\Domains\AuthAdmin\Models\User;
use App\Domains\AuthAdmin\Repositories\UserRepository;
use App\Domains\AuthAdmin\Services\AuthService;
use App\Domains\AuthAdmin\Services\DeviceAuthService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function __construct(
        protected UserRepository $userRepository,
        protected AuthService $authService,
        protected DeviceAuthService $deviceAuthService
    ) {}

    /**
     * List all Users (Admin Only)
     */
    public function index(Request $request): JsonResponse
    {
        $users = $this->userRepository->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    /**
     * Protected Admin-Only User Registration
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'emp_id' => 'required|string|max:50|unique:users,emp_id',
            'name' => 'required|string|min:3|max:100',
            'email' => 'nullable|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string|exists:roles,name',
            'is_active' => 'boolean',
        ]);

        $user = $this->authService->registerUserByAdmin(
            $validated,
            $request->user(),
            $request->ip()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully by Administrator.',
            'data' => $user,
        ], 201);
    }

    /**
     * Update User Status or Role (Admin Only)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $this->userRepository->findById($id);

        if (! $user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|min:3|max:100',
            'is_active' => 'sometimes|boolean',
            'role' => 'sometimes|string|exists:roles,name',
        ]);

        if (isset($validated['name'])) {
            $user->name = $validated['name'];
        }

        if (isset($validated['is_active'])) {
            $user->is_active = $validated['is_active'];
            if (! $validated['is_active']) {
                // Instantly revoke all active Sanctum tokens upon deactivation
                $user->tokens()->delete();
            }
        }

        $user->save();

        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'UPDATE_USER',
            'module' => 'AuthAdmin',
            'payload' => ['target_user_id' => $user->id, 'changes' => $validated],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully.',
            'data' => $user->fresh('roles.permissions'),
        ]);
    }

    /**
     * Delete User (Admin Only)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $this->userRepository->findById($id);

        if (! $user) {
            return response()->json(['status' => 'error', 'message' => 'User not found.'], 404);
        }

        // Prevent self-deletion
        if ($user->id === $request->user()->id) {
            return response()->json(['status' => 'error', 'message' => 'You cannot delete your own account.'], 400);
        }

        $user->tokens()->delete();
        $user->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'DELETE_USER',
            'module' => 'AuthAdmin',
            'payload' => ['deleted_user_id' => $id, 'deleted_user_name' => $user->name],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * List all Roles & Permissions (Admin Only)
     */
    public function roles(): JsonResponse
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return response()->json([
            'status' => 'success',
            'data' => [
                'roles' => $roles,
                'permissions' => $permissions,
            ],
        ]);
    }

    /**
     * List registered Floor Devices (Admin Only)
     */
    public function devices(): JsonResponse
    {
        $devices = Device::latest()->get();

        return response()->json([
            'status' => 'success',
            'data' => $devices,
        ]);
    }

    /**
     * Register New Floor Tablet Device (Admin Only)
     */
    public function storeDevice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_name' => 'required|string|unique:devices,device_name',
            'device_code' => 'required|string|unique:devices,device_code',
            'pin_code' => 'required|string|min:4|max:10',
            'line_id' => 'nullable|uuid',
            'line_name' => 'nullable|string',
            'device_type' => 'nullable|string',
        ]);

        $device = $this->deviceAuthService->registerDeviceByAdmin(
            $validated,
            $request->user()->id
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Floor device registered successfully.',
            'data' => $device,
        ], 201);
    }

    /**
     * Toggle Device Active Status (Admin Only)
     */
    public function updateDevice(Request $request, string $id): JsonResponse
    {
        $device = Device::find($id);

        if (! $device) {
            return response()->json(['status' => 'error', 'message' => 'Device not found.'], 404);
        }

        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'line_name' => 'sometimes|string',
        ]);

        if (isset($validated['is_active'])) {
            $device->is_active = $validated['is_active'];
            if (! $validated['is_active']) {
                $device->tokens()->delete();
            }
        }

        if (isset($validated['line_name'])) {
            $device->line_name = $validated['line_name'];
        }

        $device->save();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'UPDATE_DEVICE',
            'module' => 'AuthAdmin',
            'payload' => ['device_id' => $device->id, 'changes' => $validated],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Device updated successfully.',
            'data' => $device,
        ]);
    }

    /**
     * Delete Floor Device (Admin Only)
     */
    public function destroyDevice(Request $request, string $id): JsonResponse
    {
        $device = Device::find($id);

        if (! $device) {
            return response()->json(['status' => 'error', 'message' => 'Device not found.'], 404);
        }

        $device->tokens()->delete();
        $device->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'user_name' => $request->user()->name,
            'action' => 'DELETE_DEVICE',
            'module' => 'AuthAdmin',
            'payload' => ['device_id' => $id, 'device_code' => $device->device_code],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Device removed successfully.',
        ]);
    }

    /**
     * System Audit Trail Logs (Admin Only)
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $logs = AuditLog::latest('created_at')->paginate($request->get('per_page', 25));

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }
}
