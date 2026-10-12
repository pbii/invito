<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigitalEnvelope extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invitation_id',
        'sender_name',
        'amount',
        'method',
        'payment_status',
        'payment_gateway_id',
        'proof_image_url',
        'is_verified_by_couple',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_verified_by_couple' => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
