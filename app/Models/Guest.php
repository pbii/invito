<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Guest extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'invitation_id',
        'name',
        'phone',
        'email',
        'category',
        'max_pax',
        'personal_link_token',
        'is_sent',
        'is_deleted',
    ];

    protected function casts(): array
    {
        return [
            'max_pax' => 'integer',
            'is_sent' => 'boolean',
            'is_deleted' => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'guest_events')
            ->withPivot('is_invited')
            ->withTimestamps();
    }

    public function rsvp(): HasOne
    {
        return $this->hasOne(Rsvp::class);
    }
}
