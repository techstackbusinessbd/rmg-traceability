<?php

namespace Tests\Feature;

use App\Domains\AuthAdmin\Models\User;
use App\Domains\MasterData\Models\Buyer;
use App\Domains\MasterData\Models\Floor;
use App\Domains\MasterData\Models\Unit;
use Database\Seeders\AuthAdminSeeder;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterDataFeatureTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(AuthAdminSeeder::class);
        $this->seed(MasterDataSeeder::class);
    }

    public function test_admin_can_fetch_plant_tree(): void
    {
        $admin = User::where('email', 'admin@rmgtrace.com')->first();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/master/plant/tree');

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'code',
                        'floors' => [
                            '*' => [
                                'id',
                                'name',
                                'code',
                                'production_lines',
                            ]
                        ]
                    ]
                ]
            ]);
    }

    public function test_admin_can_create_unit_floor_and_line(): void
    {
        $admin = User::where('email', 'admin@rmgtrace.com')->first();

        // 1. Create Unit
        $uRes = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/master/units', [
                'name' => 'Unit 03 (Outerwear Complex)',
                'code' => 'UNIT-03',
                'address' => 'Plot 99, CEPZ',
                'contact_person' => 'Nazmul Huda',
                'contact_phone' => '+880 1711-999888',
                'is_active' => true,
            ]);
        $uRes->assertStatus(201);
        $unitId = $uRes->json('data.id');

        // 2. Create Floor
        $fRes = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/master/floors', [
                'unit_id' => $unitId,
                'name' => '1st Floor (Jacket Sewing)',
                'code' => 'FL-U3-01',
                'process_type' => 'SEWING',
                'sequence_order' => 1,
            ]);
        $fRes->assertStatus(201);
        $floorId = $fRes->json('data.id');

        // 3. Create Line
        $lRes = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/master/lines', [
                'unit_id' => $unitId,
                'floor_id' => $floorId,
                'name' => 'Heavy Down Jacket Line 01',
                'code' => 'L-JKT-01',
                'section' => 'SEWING',
                'total_machines' => 45,
                'hourly_target' => 90,
                'supervisor_name' => 'Belal Ahmed',
            ]);
        $lRes->assertStatus(201)
            ->assertJsonPath('data.code', 'L-JKT-01');

        $this->assertDatabaseHas('production_lines', ['code' => 'L-JKT-01']);
    }

    public function test_admin_can_create_style_and_operation(): void
    {
        $admin = User::where('email', 'admin@rmgtrace.com')->first();
        $buyer = Buyer::first();

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/master/styles', [
                'buyer_id' => $buyer->id,
                'style_number' => 'STY-TEST-POLO-99',
                'style_name' => 'Mens Classic Cotton Pique Polo',
                'garment_type' => 'POLO',
                'season' => 'SS-2027',
                'fabric_type' => '100% Cotton 220 GSM Pique',
                'total_smv' => 12.00,
                'operations' => [
                    [
                        'sequence_no' => 1,
                        'operation_name' => 'Collar Band Attach',
                        'operation_code' => 'OP-P01',
                        'section' => 'SEWING',
                        'smv' => 1.50,
                        'machine_type' => 'SNLS',
                    ],
                    [
                        'sequence_no' => 2,
                        'operation_name' => 'Sleeve Rib Hem',
                        'operation_code' => 'OP-P02',
                        'section' => 'SEWING',
                        'smv' => 0.75,
                        'machine_type' => 'Flatlock',
                    ],
                ]
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.style_number', 'STY-TEST-POLO-99')
            ->assertJsonPath('data.total_smv', '2.25'); // Sum of operations

        $this->assertDatabaseHas('styles', ['style_number' => 'STY-TEST-POLO-99']);
    }

    public function test_admin_can_manage_colors_sizes_and_defects(): void
    {
        $admin = User::where('email', 'admin@rmgtrace.com')->first();

        // Color
        $cRes = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/master/colors', [
                'name' => 'Heather Mint Green',
                'code' => 'COL-MINT',
                'hex_code' => '#10B981',
                'pantone_ref' => '14-0156 TCX',
            ]);
        $cRes->assertStatus(201);

        // Size
        $sRes = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/master/sizes', [
                'name' => '40',
                'code' => 'SZ-40',
                'category' => 'NUMERIC',
                'sort_order' => 16,
            ]);
        $sRes->assertStatus(201);

        // Defect
        $dRes = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/master/defects', [
                'code' => 'DEF-FAB-01',
                'name' => 'Knitting Hole / Lycra Run',
                'process_stage' => 'FABRIC',
                'severity' => 'CRITICAL',
                'standard_penalty_points' => '5',
            ]);
        $dRes->assertStatus(201);

        $this->assertDatabaseHas('colors', ['code' => 'COL-MINT']);
        $this->assertDatabaseHas('sizes', ['code' => 'SZ-40']);
        $this->assertDatabaseHas('defect_codes', ['code' => 'DEF-FAB-01']);
    }
}
