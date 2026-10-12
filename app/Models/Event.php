<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\ResponseCache\Facades\ResponseCache;

class Event extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invitation_id',
        'event_type_id',
        'event_name',
        'date',
        'time_start',
        'time_end',
        'venue_name',
        'address',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
        ];
    }

    protected static function booted(): void
    {
        static::saved(function () {
            if (class_exists(ResponseCache::class)) {
                ResponseCache::clear();
            }
        });

        static::deleted(function () {
            if (class_exists(ResponseCache::class)) {
                ResponseCache::clear();
            }
        });
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function eventType(): BelongsTo
    {
        return $this->belongsTo(EventType::class, 'event_type_id');
    }

    public function rsvpEvents(): HasMany
    {
        return $this->hasMany(RsvpEvent::class);
    }

    public function guests(): BelongsToMany
    {
        return $this->belongsToMany(Guest::class, 'guest_events')
            ->withPivot('is_invited')
            ->withTimestamps();
    }
}
