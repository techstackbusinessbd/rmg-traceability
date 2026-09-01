<?php

namespace Database\Seeders;

use App\Domains\MasterData\Services\AttributeMasterService;
use App\Domains\MasterData\Services\BuyerMasterService;
use App\Domains\MasterData\Services\PlantStructureService;
use App\Domains\MasterData\Services\StyleMasterService;
use Illuminate\Database\Seeder;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Plant Structure (Units, Floors, Production Lines)
        $plantService = app(PlantStructureService::class);
        $plantService->seedDefaults();

        // 2. Buyers & Brands Master
        $buyerService = app(BuyerMasterService::class);
        $buyerService->seedDefaults();

        // 3. Garment Styles & Operation Bulletin (SMV)
        $styleService = app(StyleMasterService::class);
        $styleService->seedDefaults();

        // 4. Colors, Sizes & Quality Defect Codes
        $attributeService = app(AttributeMasterService::class);
        $attributeService->seedDefaults();
    }
}
