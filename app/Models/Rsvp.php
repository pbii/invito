<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rsvp extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invitation_id',
        'guest_id',
        'name',
        'is_attending',
        'number_of_guests',
        'notes',
        'ip_address',
        'turnstile_verified',
    ];

    protected function casts(): array
    {
        return [
            'is_attending' => 'boolean',
            'number_of_guests' => 'integer',
            'turnstile_verified' => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function rsvpEvents(): HasMany
    {
        return $this->hasMany(RsvpEvent::class);
    }
}
