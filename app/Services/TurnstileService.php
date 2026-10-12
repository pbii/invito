<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Support\Facades\Http;

class TurnstileService
{
    public function verify(?string $token, ?string $ip = null): bool
    {
        $turnstileEnabled = (bool) AppSetting::get('security.turnstile_enabled', true);

        if (! $turnstileEnabled) {
            return true;
        }

        if (empty($token)) {
            return false;
        }

        $secret = config('services.turnstile.secret')
            ?: env('TURNSTILE_SECRET_KEY')
            ?: '1x0000000000000000000000000000000AA';

        $payload = [
            'secret' => $secret,
            'response' => $token,
        ];

        if ($ip) {
            $payload['remoteip'] = $ip;
        }

        $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', $payload);

        return (bool) $response->json('success', false);
    }
}
