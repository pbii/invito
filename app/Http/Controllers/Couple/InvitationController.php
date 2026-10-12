<?php

declare(strict_types=1);

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInvitationRequest;
use App\Http\Requests\UpdateInvitationRequest;
use App\Models\EventType;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\PaymentProvider;
use App\Models\Template;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function create(): Response
    {
        $packages = Package::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $templates = Template::where('is_active', true)
            ->with('categories')
            ->orderBy('sort_order')
            ->get();

        $eventTypes = EventType::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $paymentProviders = PaymentProvider::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Couple/Invitation/Create', [
            'packages' => $packages,
            'templates' => $templates,
            'eventTypes' => $eventTypes,
            'paymentProviders' => $paymentProviders,
        ]);
    }

    public function store(StoreInvitationRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $package = Package::findOrFail($validated['package_id']);

        $invitation = DB::transaction(function () use ($request, $validated, $package) {
            $invitation = Invitation::create([
                'user_id' => $request->user()->id,
                'package_id' => $package->id,
                'template_id' => $validated['template_id'],
                'slug' => strtolower($validated['slug']),
                'groom_name' => $validated['groom_name'],
                'groom_father' => $validated['groom_father'] ?? null,
                'groom_mother' => $validated['groom_mother'] ?? null,
                'groom_photo' => $validated['groom_photo'] ?? null,
                'bride_name' => $validated['bride_name'],
                'bride_father' => $validated['bride_father'] ?? null,
                'bride_mother' => $validated['bride_mother'] ?? null,
                'bride_photo' => $validated['bride_photo'] ?? null,
                'music_url' => $validated['music_url'] ?? null,
                'streaming_url' => $validated['streaming_url'] ?? null,
                'language' => $validated['language'] ?? 'id',
                'is_published' => false,
                'expires_at' => now()->addDays($package->duration_days),
            ]);

            // Save Events
            foreach ($validated['events'] as $evt) {
                $invitation->events()->create([
                    'event_type_id' => $evt['event_type_id'] ?? null,
                    'event_name' => $evt['event_name'],
                    'date' => $evt['date'],
                    'time_start' => $evt['time_start'] ?? null,
                    'time_end' => $evt['time_end'] ?? null,
                    'venue_name' => $evt['venue_name'],
                    'address' => $evt['address'] ?? null,
                    'latitude' => $evt['latitude'] ?? null,
                    'longitude' => $evt['longitude'] ?? null,
                ]);
            }

            // Save Bank Accounts
            if (! empty($validated['bank_accounts'])) {
                foreach ($validated['bank_accounts'] as $idx => $acc) {
                    $invitation->bankAccounts()->create([
                        'provider_id' => $acc['provider_id'] ?? null,
                        'bank_or_wallet_name' => $acc['bank_or_wallet_name'],
                        'account_number' => $acc['account_number'],
                        'account_holder' => $acc['account_holder'],
                        'qr_code_url' => $acc['qr_code_url'] ?? null,
                        'sort_order' => $idx + 1,
                    ]);
                }
            }

            // Save Love Stories
            if (! empty($validated['love_stories'])) {
                foreach ($validated['love_stories'] as $idx => $story) {
                    $invitation->loveStories()->create([
                        'title' => $story['title'],
                        'description' => $story['description'] ?? null,
                        'date' => $story['date'] ?? null,
                        'order' => $idx + 1,
                    ]);
                }
            }

            // Save Gallery Photos
            if (! empty($validated['gallery_photos'])) {
                foreach ($validated['gallery_photos'] as $idx => $photo) {
                    $invitation->galleryPhotos()->create([
                        'photo_url' => $photo['photo_url'],
                        'caption' => $photo['caption'] ?? null,
                        'order' => $idx + 1,
                    ]);
                }
            }

            // Setup Default Section Registry
            $defaultSections = [
                ['section_key' => 'COUPLE', 'custom_title' => 'Mempelai', 'sort_order' => 1],
                ['section_key' => 'COUNTDOWN', 'custom_title' => 'Hitung Mundur', 'sort_order' => 2],
                ['section_key' => 'EVENTS', 'custom_title' => 'Rangkaian Acara', 'sort_order' => 3],
                ['section_key' => 'MAPS', 'custom_title' => 'Peta Lokasi', 'sort_order' => 4],
                ['section_key' => 'STORY', 'custom_title' => 'Cerita Cinta', 'sort_order' => 5],
                ['section_key' => 'GALLERY', 'custom_title' => 'Galeri Kenangan', 'sort_order' => 6],
                ['section_key' => 'GIFT', 'custom_title' => 'Kado & Rekening', 'sort_order' => 7],
                ['section_key' => 'STREAMING', 'custom_title' => 'Live Streaming', 'sort_order' => 8],
                ['section_key' => 'RSVP', 'custom_title' => 'Konfirmasi Kehadiran', 'sort_order' => 9],
                ['section_key' => 'WISHES', 'custom_title' => 'Ucapan & Doa', 'sort_order' => 10],
            ];

            foreach ($defaultSections as $sec) {
                $invitation->sections()->create([
                    'section_key' => $sec['section_key'],
                    'custom_title' => $sec['custom_title'],
                    'is_enabled' => true,
                    'sort_order' => $sec['sort_order'],
                ]);
            }

            return $invitation;
        });

        return redirect()->route('invitation.sections', $invitation->id)
            ->with('success', 'Undangan berhasil dibuat! Silakan atur urutan section yang diinginkan.');
    }

    public function edit(Request $request, Invitation $invitation): Response
    {
        if ($invitation->user_id !== $request->user()->id) {
            abort(403);
        }

        $invitation->load(['events', 'bankAccounts', 'loveStories', 'galleryPhotos']);

        $packages = Package::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $templates = Template::where('is_active', true)
            ->with('categories')
            ->orderBy('sort_order')
            ->get();

        $eventTypes = EventType::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $paymentProviders = PaymentProvider::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Couple/Invitation/Edit', [
            'invitation' => $invitation,
            'packages' => $packages,
            'templates' => $templates,
            'eventTypes' => $eventTypes,
            'paymentProviders' => $paymentProviders,
        ]);
    }

    public function update(UpdateInvitationRequest $request, Invitation $invitation): RedirectResponse
    {
        $validated = $request->validated();
        $package = Package::findOrFail($validated['package_id']);

        DB::transaction(function () use ($invitation, $validated, $package) {
            $invitation->update([
                'package_id' => $package->id,
                'template_id' => $validated['template_id'],
                'slug' => strtolower($validated['slug']),
                'groom_name' => $validated['groom_name'],
                'groom_father' => $validated['groom_father'] ?? null,
                'groom_mother' => $validated['groom_mother'] ?? null,
                'groom_photo' => $validated['groom_photo'] ?? null,
                'bride_name' => $validated['bride_name'],
                'bride_father' => $validated['bride_father'] ?? null,
                'bride_mother' => $validated['bride_mother'] ?? null,
                'bride_photo' => $validated['bride_photo'] ?? null,
                'music_url' => $validated['music_url'] ?? null,
                'streaming_url' => $validated['streaming_url'] ?? null,
                'language' => $validated['language'] ?? 'id',
                'is_published' => $validated['is_published'] ?? $invitation->is_published,
            ]);

            // Sync Events
            $invitation->events()->delete();
            foreach ($validated['events'] as $evt) {
                $invitation->events()->create([
                    'event_type_id' => $evt['event_type_id'] ?? null,
                    'event_name' => $evt['event_name'],
                    'date' => $evt['date'],
                    'time_start' => $evt['time_start'] ?? null,
                    'time_end' => $evt['time_end'] ?? null,
                    'venue_name' => $evt['venue_name'],
                    'address' => $evt['address'] ?? null,
                    'latitude' => $evt['latitude'] ?? null,
                    'longitude' => $evt['longitude'] ?? null,
                ]);
            }

            // Sync Bank Accounts
            $invitation->bankAccounts()->delete();
            if (! empty($validated['bank_accounts'])) {
                foreach ($validated['bank_accounts'] as $idx => $acc) {
                    $invitation->bankAccounts()->create([
                        'provider_id' => $acc['provider_id'] ?? null,
                        'bank_or_wallet_name' => $acc['bank_or_wallet_name'],
                        'account_number' => $acc['account_number'],
                        'account_holder' => $acc['account_holder'],
                        'qr_code_url' => $acc['qr_code_url'] ?? null,
                        'sort_order' => $idx + 1,
                    ]);
                }
            }

            // Sync Love Stories
            $invitation->loveStories()->delete();
            if (! empty($validated['love_stories'])) {
                foreach ($validated['love_stories'] as $idx => $story) {
                    $invitation->loveStories()->create([
                        'title' => $story['title'],
                        'description' => $story['description'] ?? null,
                        'date' => $story['date'] ?? null,
                        'order' => $idx + 1,
                    ]);
                }
            }

            // Sync Gallery Photos
            $invitation->galleryPhotos()->delete();
            if (! empty($validated['gallery_photos'])) {
                foreach ($validated['gallery_photos'] as $idx => $photo) {
                    $invitation->galleryPhotos()->create([
                        'photo_url' => $photo['photo_url'],
                        'caption' => $photo['caption'] ?? null,
                        'order' => $idx + 1,
                    ]);
                }
            }
        });

        return redirect()->route('dashboard')->with('success', 'Data undangan berhasil diperbarui!');
    }
}
