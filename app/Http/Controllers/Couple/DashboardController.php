<?php

declare(strict_types=1);

namespace App\Http\Controllers\Couple;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $query = $user->invitations()
            ->with([
                'package:id,name,badge,price',
                'template:id,name,thumbnail_url,component_name',
            ])
            ->withCount(['guests', 'rsvps']);

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('groom_name', 'like', "%{$search}%")
                    ->orWhere('bride_name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Status Filter
        if ($status = $request->input('status')) {
            if ($status === 'active') {
                $query->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                });
            } elseif ($status === 'expired') {
                $query->where('expires_at', '<=', now());
            } elseif ($status === 'draft') {
                $query->where('is_active', false);
            }
        }

        $invitations = $query->latest()->paginate(6)->withQueryString();

        // Calculate statistics for all invitations of this user
        $allInvitations = $user->invitations()->withCount(['guests', 'rsvps'])->get();
        $totalInvitations = $allInvitations->count();
        $totalGuests = $allInvitations->sum('guests_count');
        $totalRsvps = $allInvitations->sum('rsvps_count');

        return Inertia::render('Couple/Dashboard', [
            'invitations' => $invitations,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
            ],
            'statistics' => [
                'total_invitations' => $totalInvitations,
                'total_guests' => $totalGuests,
                'total_rsvps' => $totalRsvps,
            ],
        ]);
    }
}
