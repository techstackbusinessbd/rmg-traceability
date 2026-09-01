<?php

namespace App\Domains\MasterData\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StyleOperation extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'style_operations';

    protected $fillable = [
        'style_id',
        'sequence_no',
        'operation_name',
        'operation_code',
        'section',
        'smv',
        'machine_type',
        'target_hourly_pcs',
    ];

    protected $casts = [
        'sequence_no' => 'integer',
        'smv' => 'decimal:2',
        'target_hourly_pcs' => 'integer',
    ];

    public function style(): BelongsTo
    {
        return $this->belongsTo(Style::class, 'style_id');
    }
}
