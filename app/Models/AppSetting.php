<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    public $incrementing = false;

    protected $primaryKey = 'key';

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'description',
        'updated_by',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'updated_at' => 'datetime',
        ];
    }

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::rememberForever("app_setting:{$key}", function () use ($key, $default) {
            $setting = self::find($key);
            if (! $setting) {
                return $default;
            }

            return match ($setting->type) {
                'BOOLEAN' => filter_var($setting->value, FILTER_VALIDATE_BOOLEAN),
                'NUMBER' => is_numeric($setting->value) ? $setting->value + 0 : $setting->value,
                'JSON' => json_decode((string) $setting->value, true),
                default => $setting->value,
            };
        });
    }

    public static function set(string $key, mixed $value): void
    {
        $setting = self::find($key);
        if ($setting) {
            $stringValue = match ($setting->type) {
                'BOOLEAN' => $value ? 'true' : 'false',
                'JSON' => is_string($value) ? $value : json_encode($value),
                default => (string) $value,
            };
            $setting->update([
                'value' => $stringValue,
                'updated_at' => now(),
            ]);
            Cache::forget("app_setting:{$key}");
        }
    }
}
