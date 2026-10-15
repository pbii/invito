<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWishRequest;
use App\Models\Invitation;
use App\Models\Wish;
use App\Services\TurnstileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class PublicWishController extends Controller
{
    public function store(StoreWishRequest $request, string $slug, TurnstileService $turnstileService): JsonResponse|RedirectResponse
    {
        $invitation = Invitation::where('slug', $slug)->firstOrFail();

        if ($request->filled('honeypot')) {
            abort(400);
        }

        $turnstileValid = $turnstileService->verify(
            $request->input('turnstile_token'),
            $request->ip()
        );

        if (! $turnstileValid) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Verifikasi bot gagal.',
                    'errors' => ['turnstile' => ['Verifikasi bot gagal.']],
                ], 422);
            }

            return back()->withErrors(['turnstile' => 'Verifikasi bot gagal.']);
        }

        $validated = $request->validated();

        $wish = Wish::create([
            'invitation_id' => $invitation->id,
            'name' => $validated['name'],
            'message' => $validated['message'],
            'is_visible' => true,
            'turnstile_verified' => true,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['ok' => true, 'wish' => $wish], 201);
        }

        return back()->with('success', 'Ucapan berhasil dikirim! Terima kasih.');
    }
}
