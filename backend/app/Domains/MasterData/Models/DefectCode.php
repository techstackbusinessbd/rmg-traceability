<?php

namespace App\Domains\MasterData\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DefectCode extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'defect_codes';

    protected $fillable = [
        'code',
        'name',
        'process_stage',
        'severity',
        'standard_penalty_points',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
