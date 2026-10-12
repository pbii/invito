<?php

declare(strict_types=1);

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\InvitationView;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InvitationViewController extends Controller
{
    public function show(Request $request, string $slug): Response
    {
        $invitation = Invitation::where('slug', $slug)
            ->with([
                'template',
                'package',
                'sections' => fn ($query) => $query->orderBy('sort_order'),
                'events.eventType',
                'bankAccounts.provider',
                'loveStories' => fn ($query) => $query->orderBy('order'),
                'galleryPhotos' => fn ($query) => $query->orderBy('order'),
                'wishes' => fn ($query) => $query->where('is_visible', true)->latest(),
            ])
            ->firstOrFail();

        if ($invitation->isExpired() || ($invitation->expires_at && now()->isAfter($invitation->expires_at))) {
            return Inertia::render('Public/InvitationExpired', [
                'invitation' => $invitation,
            ]);
        }

        $userAgent = (string) $request->userAgent();
        $deviceType = 'desktop';
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i', $userAgent)) {
            $deviceType = 'tablet';
        } elseif (preg_match('/(iphone|ipod|android.*mobile|blackberry|iemobile|opera mini)/i', $userAgent)) {
            $deviceType = 'mobile';
        }

        try {
            InvitationView::create([
                'invitation_id' => $invitation->id,
                'ip_address' => $request->ip(),
                'user_agent' => $userAgent,
                'referrer' => $request->header('referer'),
                'device_type' => $deviceType,
                'browser' => null,
                'created_at' => now(),
            ]);
        } catch (\Throwable) {
            // Non-blocking view logging failure
        }

        $guestToken = $request->query('to');
        $events = $invitation->events;

        if ($guestToken && is_string($guestToken)) {
            $guest = Guest::where('personal_link_token', $guestToken)
                ->where('invitation_id', $invitation->id)
                ->with('events')
                ->first();

            if ($guest && $guest->events()->exists()) {
                $guestEventIds = $guest->events->pluck('id')->toArray();
                $events = $events->filter(fn ($e) => in_array($e->id, $guestEventIds))->values();
            }
        }

        $componentName = $invitation->template->component_name ?? 'ModernFloral';
        $turnstileSiteKey = config('services.turnstile.key') ?: env('TURNSTILE_SITE_KEY', '');

        return Inertia::render("Templates/{$componentName}/Index", [
            'invitation' => $invitation,
            'sections' => $invitation->sections,
            'events' => $events,
            'bankAccounts' => $invitation->bankAccounts,
            'loveStories' => $invitation->loveStories,
            'galleryPhotos' => $invitation->galleryPhotos,
            'wishes' => $invitation->wishes,
            'turnstileSiteKey' => $turnstileSiteKey,
            'guestToken' => $guestToken,
        ]);
    }
}
