<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRsvpRequest;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Rsvp;
use App\Models\RsvpEvent;
use App\Services\TurnstileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class PublicRsvpController extends Controller
{
    public function store(StoreRsvpRequest $request, string $slug, TurnstileService $turnstileService): RedirectResponse
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
            return back()->withErrors(['turnstile' => 'Verifikasi bot gagal.']);
        }

        $validated = $request->validated();
        $guestId = $validated['guest_id'] ?? null;

        if ($guestId) {
            $guest = Guest::find($guestId);
            if (! $guest || $guest->invitation_id !== $invitation->id || trim(mb_strtolower($guest->name)) !== trim(mb_strtolower($validated['name']))) {
                $guestId = null;
            } else {
                // Enforce max_pax limitation
                if ($guest->max_pax && $validated['number_of_guests'] > $guest->max_pax) {
                    $validated['number_of_guests'] = $guest->max_pax;
                }
            }
        }

        DB::transaction(function () use ($invitation, $validated, $guestId, $request) {
            $rsvp = Rsvp::create([
                'invitation_id' => $invitation->id,
                'guest_id' => $guestId,
                'name' => $validated['name'],
                'is_attending' => (bool) $validated['is_attending'],
                'number_of_guests' => (int) $validated['number_of_guests'],
                'notes' => $validated['notes'] ?? null,
                'ip_address' => $request->ip(),
                'turnstile_verified' => true,
            ]);

            foreach ($validated['events'] as $eventItem) {
                RsvpEvent::create([
                    'rsvp_id' => $rsvp->id,
                    'event_id' => $eventItem['event_id'],
                    'is_attending' => (bool) $eventItem['is_attending'],
                    'created_at' => now(),
                ]);
            }
        });

        return back()->with('success', 'Konfirmasi kehadiran berhasil dikirim! Terima kasih.');
    }
}
