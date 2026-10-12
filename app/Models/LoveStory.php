<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\ResponseCache\Facades\ResponseCache;

class LoveStory extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invitation_id',
        'title',
        'description',
        'date',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
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
