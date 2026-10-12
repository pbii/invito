<?php

declare(strict_types=1);

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGuestRequest;
use App\Models\Guest;
use App\Models\Invitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GuestController extends Controller
{
    public function index(Request $request, Invitation $invitation): Response
    {
        if ($invitation->user_id !== $request->user()->id) {
            abort(403);
        }

        $query = $invitation->guests()->with(['rsvp', 'events.eventType']);

        // Search Filter (name, phone, email)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Category Filter
        if ($category = $request->input('category')) {
            if ($category !== 'all') {
                $query->where('category', $category);
            }
        }

        // WhatsApp Sent Status Filter
        if ($request->has('is_sent') && $request->input('is_sent') !== 'all' && $request->input('is_sent') !== null) {
            $isSent = filter_var($request->input('is_sent'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_sent', $isSent);
        }

        // RSVP Status Filter
        if ($rsvpStatus = $request->input('rsvp_status')) {
            if ($rsvpStatus === 'attending') {
                $query->whereHas('rsvp', function ($q) {
                    $q->where('confirmation_status', 'ATTENDING');
                });
            } elseif ($rsvpStatus === 'declined') {
                $query->whereHas('rsvp', function ($q) {
                    $q->where('confirmation_status', 'DECLINED');
                });
            } elseif ($rsvpStatus === 'unconfirmed') {
                $query->doesntHave('rsvp');
            }
        }

        $guests = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        // Guest categories list for filter dropdown
        $categories = [
            'FAMILY' => 'Keluarga',
            'FRIEND' => 'Sahabat / Teman',
            'WORK' => 'Rekan Kerja / Kantor',
            'VIP' => 'VIP',
            'OTHER' => 'Lainnya',
        ];

        // Quick Stats
        $stats = [
            'total' => $invitation->guests()->count(),
            'sent' => $invitation->guests()->where('is_sent', true)->count(),
            'attending' => $invitation->guests()->whereHas('rsvp', fn ($q) => $q->where('confirmation_status', 'ATTENDING'))->count(),
            'declined' => $invitation->guests()->whereHas('rsvp', fn ($q) => $q->where('confirmation_status', 'DECLINED'))->count(),
        ];

        return Inertia::render('Couple/Invitation/Guests', [
            'invitation' => $invitation,
            'events' => $invitation->events()->with('eventType')->get(),
            'guests' => $guests,
            'categories' => $categories,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'all'),
                'is_sent' => $request->input('is_sent', 'all'),
                'rsvp_status' => $request->input('rsvp_status', 'all'),
            ],
        ]);
    }

    public function store(StoreGuestRequest $request, Invitation $invitation): RedirectResponse
    {
        $validated = $request->validated();

        $guest = $invitation->guests()->create([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'category' => $validated['category'] ?? 'FRIEND',
            'max_pax' => $validated['max_pax'] ?? 2,
            'personal_link_token' => Str::random(10),
            'is_sent' => false,
        ]);

        if (! empty($validated['event_ids'])) {
            $guest->events()->sync($validated['event_ids']);
        }

        return redirect()->back()->with('success', 'Tamu berhasil ditambahkan!');
    }

    public function update(StoreGuestRequest $request, Invitation $invitation, Guest $guest): RedirectResponse
    {
        if ($invitation->user_id !== $request->user()->id || $guest->invitation_id !== $invitation->id) {
            abort(403);
        }

        $validated = $request->validated();

        $guest->update([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'category' => $validated['category'] ?? 'FRIEND',
            'max_pax' => $validated['max_pax'] ?? 2,
        ]);

        if (isset($validated['event_ids'])) {
            $guest->events()->sync($validated['event_ids']);
        }

        return redirect()->back()->with('success', 'Data tamu berhasil diperbarui!');
    }

    public function destroy(Request $request, Invitation $invitation, Guest $guest): RedirectResponse
    {
        if ($invitation->user_id !== $request->user()->id || $guest->invitation_id !== $invitation->id) {
            abort(403);
        }

        $guest->delete();

        return redirect()->back()->with('success', 'Tamu berhasil dihapus!');
    }

    public function toggleSent(Request $request, Invitation $invitation, Guest $guest): RedirectResponse
    {
        if ($invitation->user_id !== $request->user()->id || $guest->invitation_id !== $invitation->id) {
            abort(403);
        }

        $guest->update(['is_sent' => ! $guest->is_sent]);

        return redirect()->back();
    }
}
