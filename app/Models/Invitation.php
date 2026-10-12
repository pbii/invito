<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\ResponseCache\Facades\ResponseCache;

class Invitation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'slug',
        'groom_name',
        'groom_photo',
        'groom_photo_public_id',
        'groom_father',
        'groom_mother',
        'bride_name',
        'bride_photo',
        'bride_photo_public_id',
        'bride_father',
        'bride_mother',
        'template_id',
        'package_id',
        'music_url',
        'music_public_id',
        'streaming_url',
        'language',
        'is_published',
        'qris_image_url',
        'qris_public_id',
        'expires_at',
        'is_expired',
    ];

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'is_expired' => 'boolean',
            'expires_at' => 'datetime',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function sections(): HasMany
    {
        return $this->hasMany(InvitationSection::class)->orderBy('sort_order');
    }

    public function bankAccounts(): HasMany
    {
        return $this->hasMany(InvitationBankAccount::class)->orderBy('sort_order');
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class)->orderBy('date');
    }

    public function loveStories(): HasMany
    {
        return $this->hasMany(LoveStory::class)->orderBy('order');
    }

    public function galleryPhotos(): HasMany
    {
        return $this->hasMany(GalleryPhoto::class)->orderBy('order');
    }

    public function guests(): HasMany
    {
        return $this->hasMany(Guest::class);
    }

    public function rsvps(): HasMany
    {
        return $this->hasMany(Rsvp::class);
    }

    public function wishes(): HasMany
    {
        return $this->hasMany(Wish::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(InvitationView::class);
    }

    public function digitalEnvelopes(): HasMany
    {
        return $this->hasMany(DigitalEnvelope::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function isExpired(): bool
    {
        return $this->is_expired || ($this->expires_at && now()->isAfter($this->expires_at));
    }
}
