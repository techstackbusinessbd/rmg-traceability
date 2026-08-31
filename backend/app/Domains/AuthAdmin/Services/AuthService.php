<?php

namespace App\Domains\AuthAdmin\Services;

use App\Domains\AuthAdmin\Models\AuditLog;
use App\Domains\AuthAdmin\Models\User;
use App\Domains\AuthAdmin\Repositories\UserRepository;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class AuthService
{
    public function __construct(
        protected UserRepository $userRepository
    ) {}

    /**
     * User Login & Token Generation
     */
    public function login(string $email, string $password, ?string $ip = null, ?string $userAgent = null): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password credentials provided.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact the administrator.'],
            ]);
        }

        // Revoke existing web tokens for single session if desired, or generate new token
        $token = $user->createToken('auth-token', ['*'])->plainTextToken;

        // Log Audit
        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'action' => 'USER_LOGIN',
            'module' => 'AuthAdmin',
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'payload' => ['email' => $email],
        ]);

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
            'token' => $token,
        ];
    }

    /**
     * Register New User (Admin-Only Protected)
     */
    public function registerUserByAdmin(array $data, User $actor, ?string $ip = null): User
    {
        return DB::transaction(function () use ($data, $actor, $ip) {
            $user = $this->userRepository->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (! empty($data['role'])) {
                $user->assignRole($data['role']);
            }

            AuditLog::create([
                'user_id' => $actor->id,
                'user_name' => $actor->name,
                'action' => 'CREATE_USER',
                'module' => 'AuthAdmin',
                'ip_address' => $ip,
                'payload' => [
                    'created_user_id' => $user->id,
                    'created_email' => $user->email,
                    'assigned_role' => $data['role'] ?? null,
                ],
            ]);

            return $user->load('roles.permissions');
        });
    }

    /**
     * Logout & Revoke Current Token
     */
    public function logout(User $user, ?string $ip = null): void
    {
        $user->currentAccessToken()->delete();

        AuditLog::create([
            'user_id' => $user->id,
            'user_name' => $user->name,
            'action' => 'USER_LOGOUT',
            'module' => 'AuthAdmin',
            'ip_address' => $ip,
        ]);
    }
}
