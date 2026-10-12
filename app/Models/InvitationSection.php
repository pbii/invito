<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\ResponseCache\Facades\ResponseCache;

class InvitationSection extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invitation_id',
        'section_key',
        'custom_title',
        'is_enabled',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'sort_order' => 'integer',
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
