<?php

namespace App\Domains\AuthAdmin\Controllers;

use App\Domains\AuthAdmin\Services\AuthService;
use App\Domains\AuthAdmin\Services\DeviceAuthService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
        protected DeviceAuthService $deviceAuthService
    ) {}

    /**
     * Web Admin Login (Public)
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $result = $this->authService->login(
            $validated['email'],
            $validated['password'],
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => $result,
        ]);
    }

    /**
     * Floor Tablet PIN Login (Public)
     */
    public function deviceLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_code' => 'required|string',
            'pin_code' => 'required|string|min:4|max:10',
        ]);

        $result = $this->deviceAuthService->authenticateDevice(
            $validated['device_code'],
            $validated['pin_code'],
            $request->ip()
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Device authenticated successfully',
            'data' => $result,
        ]);
    }

    /**
     * Get Current Authenticated User Profile (Protected)
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ]
            ],
        ]);
    }

    /**
     * Logout Current Session (Protected)
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user(), $request->ip());

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully',
        ]);
    }
}
