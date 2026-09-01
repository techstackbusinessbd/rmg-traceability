<?php

namespace Tests\Feature;

use App\Domains\AuthAdmin\Models\Device;
use App\Domains\AuthAdmin\Models\User;
use Database\Seeders\AuthAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthAdminFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AuthAdminSeeder::class);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@rmgtrace.com',
            'password' => 'Admin@123456',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'roles', 'permissions'],
                    'token'
                ]
            ]);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => 'admin@rmgtrace.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['login']);
    }

    public function test_unauthenticated_user_cannot_register_new_users(): void
    {
        // Protected Registration Rule Check
        $response = $this->postJson('/api/v1/admin/users', [
            'emp_id' => 'EMP-TEST-01',
            'name' => 'John Operator',
            'email' => 'operator@rmgtrace.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'Line Supervisor',
        ]);

        $response->assertStatus(401);
    }

    public function test_admin_can_register_new_user_and_assign_role(): void
    {
        $admin = User::where('email', 'admin@rmgtrace.com')->first();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/users', [
                'emp_id' => 'EMP-CUT-01',
                'name' => 'Cutting Master User',
                'email' => 'cutting@rmgtrace.com',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'role' => 'Cutting Master',
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'cutting@rmgtrace.com');

        $this->assertDatabaseHas('users', ['email' => 'cutting@rmgtrace.com']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'CREATE_USER']);
    }

    public function test_floor_tablet_can_authenticate_via_pin(): void
    {
        Device::create([
            'device_code' => 'TAB-SEW-L01',
            'device_name' => 'Sewing Line 01 In-charge Tablet',
            'pin_code' => Hash::make('123456'),
            'line_name' => 'Sewing Line 01',
            'device_type' => 'Tablet',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/device-login', [
            'device_code' => 'TAB-SEW-L01',
            'pin_code' => '123456',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'device' => ['id', 'device_name', 'device_code', 'line_name'],
                    'token'
                ]
            ]);
    }
}
