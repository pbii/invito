<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class FeatureFlag extends Model
{
    public $incrementing = false;

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'key',
        'name',
        'description',
        'is_enabled',
        'updated_by',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'updated_at' => 'datetime',
        ];
    }

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function isEnabled(string $key, bool $default = false): bool
    {
        return Cache::rememberForever("feature_flag:{$key}", function () use ($key, $default) {
            $flag = self::find($key);

            return $flag ? (bool) $flag->is_enabled : $default;
        });
    }

    public static function toggle(string $key, bool $enabled): void
    {
        $flag = self::find($key);
        if ($flag) {
            $flag->update([
                'is_enabled' => $enabled,
                'updated_at' => now(),
            ]);
            Cache::forget("feature_flag:{$key}");
        }
    }
}
