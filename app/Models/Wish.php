<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wish extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'invitation_id',
        'name',
        'message',
        'is_visible',
        'turnstile_verified',
    ];

    protected function casts(): array
    {
        return [
            'is_visible' => 'boolean',
            'turnstile_verified' => 'boolean',
        ];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }
}
