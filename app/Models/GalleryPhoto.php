<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\ResponseCache\Facades\ResponseCache;

class GalleryPhoto extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invitation_id',
        'photo_url',
        'cloudinary_public_id',
        'caption',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
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
}
