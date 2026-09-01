<?php

namespace App\Domains\Cutting\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SinglePieceQr extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'single_piece_qrs';

    protected $fillable = [
        'bundle_id',
        'piece_number',
        'unique_tracking_code',
        'status',
    ];

    protected $casts = [
        'piece_number' => 'integer',
    ];

    public function bundle(): BelongsTo
    {
        return $this->belongsTo(Bundle::class, 'bundle_id');
    }
}
