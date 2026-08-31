<?php

namespace App\Domains\AuthAdmin\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class Device extends Model
{
    use HasFactory, HasUuids, HasApiTokens, SoftDeletes;

    protected $fillable = [
        'device_name',
        'device_code',
        'pin_code',
        'line_id',
        'line_name',
        'device_type',
        'is_active',
        'last_active_at',
    ];

    protected $hidden = [
        'pin_code',
    ];

    protected function casts(): array
    {
        return [
            'pin_code' => 'hashed',
            'is_active' => 'boolean',
            'last_active_at' => 'datetime',
        ];
    }
}
