<?php

namespace App\Domains\AuthAdmin\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'shifts';

    protected $fillable = [
        'shift_name',
        'shift_code',
        'shift_type',
        'unit_name',
        'floor_name',
        'start_time',
        'end_time',
        'grace_period_mins',
        'break_start_time',
        'break_end_time',
        'net_work_hours',
        'allows_overtime',
        'max_ot_hours',
        'overtime_start_time',
        'tiffin_break_start',
        'tiffin_break_end',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'allows_overtime' => 'boolean',
        'grace_period_mins' => 'integer',
        'net_work_hours' => 'decimal:2',
        'max_ot_hours' => 'decimal:2',
    ];
}
