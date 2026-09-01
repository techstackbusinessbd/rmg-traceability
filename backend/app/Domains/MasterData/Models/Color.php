<?php

namespace App\Domains\MasterData\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Color extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'colors';

    protected $fillable = [
        'name',
        'code',
        'hex_code',
        'pantone_ref',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
