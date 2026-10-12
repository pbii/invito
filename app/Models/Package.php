<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Package extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'badge',
        'price',
        'duration_days',
        'sort_order',
        'is_active',
        'is_popular',
        'max_guests',
        'max_invitations',
        'max_photos',
        'max_music',
        'allow_custom_music',
        'allow_custom_slug',
        'allow_gift_info',
        'allow_love_story',
        'allow_countdown',
        'allow_streaming',
        'allow_multilingual',
        'allow_analytics',
        'allow_digital_envelope',
        'remove_watermark',
        'allow_guest_import',
        'allow_wa_blast',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'duration_days' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'is_popular' => 'boolean',
            'max_guests' => 'integer',
            'max_invitations' => 'integer',
            'max_photos' => 'integer',
            'max_music' => 'integer',
            'allow_custom_music' => 'boolean',
            'allow_custom_slug' => 'boolean',
            'allow_gift_info' => 'boolean',
            'allow_love_story' => 'boolean',
            'allow_countdown' => 'boolean',
            'allow_streaming' => 'boolean',
            'allow_multilingual' => 'boolean',
            'allow_analytics' => 'boolean',
            'allow_digital_envelope' => 'boolean',
            'remove_watermark' => 'boolean',
            'allow_guest_import' => 'boolean',
            'allow_wa_blast' => 'boolean',
        ];
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(Invitation::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
