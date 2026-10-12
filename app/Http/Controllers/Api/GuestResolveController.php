<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuestResolveController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $token = $request->query('token');

        if (empty($token) || ! is_string($token)) {
            return response()->json([
                'valid' => false,
                'guest' => null,
            ]);
        }

        $guest = Guest::where('personal_link_token', $token)
            ->with('events')
            ->first();

        if (! $guest) {
            return response()->json([
                'valid' => false,
                'guest' => null,
            ]);
        }

        return response()->json([
            'valid' => true,
            'guest' => [
                'id' => $guest->id,
                'name' => $guest->name,
                'category' => $guest->category,
                'max_pax' => $guest->max_pax ?? 2,
                'allowed_event_ids' => $guest->events->pluck('id')->toArray(),
            ],
        ]);
    }
}
