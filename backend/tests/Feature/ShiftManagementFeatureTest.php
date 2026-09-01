<?php

namespace Tests\Feature;

use App\Domains\AuthAdmin\Models\Shift;
use App\Domains\AuthAdmin\Models\User;
use Database\Seeders\AuthAdminSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShiftManagementFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AuthAdminSeeder::class);
    }

    public function test_admin_can_list_shifts_with_floor_filters(): void
    {
        $admin = User::where('email', 'admin@rmgtrace.com')->first();

        Shift::create([
            'shift_name' => 'General Floor 1 Shift',
            'shift_code' => 'SH-GEN-01',
            'shift_type' => 'DAY',
            'allows_overtime' => true,
            'max_ot_hours' => 2.0,
            'unit_name' => 'Unit 01',
            'floor_name' => '1st Floor',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'grace_period_mins' => 15,
            'break_start_time' => '13:00:00',
            'break_end_time' => '14:00:00',
            'net_work_hours' => 8.00,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/shifts?floor=1st Floor');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'shift_name',
                        'shift_code',
                        'unit_name',
                        'floor_name',
                        'start_time',
                        'end_time',
                        'net_work_hours',
                    ]
                ]
            ]);
    }

    public function test_admin_can_create_staggered_floor_shift(): void
    {
        $admin = User::where('email', 'admin@rmgtrace.com')->first();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/shifts', [
                'shift_name' => 'Floor 5 Special Denim Shift',
                'shift_code' => 'SH-U1-F5-DNM',
                'shift_type' => 'DAY',
                'allows_overtime' => true,
                'max_ot_hours' => 2.0,
                'unit_name' => 'Unit 01',
                'floor_name' => '5th Floor',
                'start_time' => '08:45:00',
                'end_time' => '17:45:00',
                'grace_period_mins' => 15,
                'break_start_time' => '13:45:00',
                'break_end_time' => '14:45:00',
                'net_work_hours' => 8.00,
                'overtime_start_time' => '18:15:00',
                'is_active' => true,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.shift_code', 'SH-U1-F5-DNM')
            ->assertJsonPath('data.floor_name', '5th Floor');

        $this->assertDatabaseHas('shifts', ['shift_code' => 'SH-U1-F5-DNM']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'CREATE_SHIFT']);
    }

    public function test_admin_can_update_shift_timings(): void
    {
        $admin = User::where('email', 'admin@rmgtrace.com')->first();
        $shift = Shift::first();

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/shifts/{$shift->id}", [
                'start_time' => '08:20:00',
                'grace_period_mins' => 12,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.start_time', '08:20:00')
            ->assertJsonPath('data.grace_period_mins', 12);

        $this->assertDatabaseHas('shifts', [
            'id' => $shift->id,
            'start_time' => '08:20:00',
            'grace_period_mins' => 12,
        ]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'UPDATE_SHIFT']);
    }

    public function test_admin_can_delete_shift(): void
    {
        $admin = User::where('email', 'admin@rmgtrace.com')->first();
        $shift = Shift::first();

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/shifts/{$shift->id}");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseMissing('shifts', ['id' => $shift->id]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'DELETE_SHIFT']);
    }
}
