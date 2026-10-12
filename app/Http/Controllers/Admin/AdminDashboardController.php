<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\Rsvp;
use App\Models\Template;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $totalUsers = User::count();
        $coupleUsers = User::where('role', 'COUPLE')->count();
        $totalInvitations = Invitation::count();
        $activeInvitations = Invitation::where('is_published', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })->count();
        $totalGuests = Guest::count();
        $totalRsvps = Rsvp::count();
        $totalTemplates = Template::where('is_active', true)->count();
        $totalPackages = Package::where('is_active', true)->count();

        // 10 Undangan Terkini
        $latestInvitations = Invitation::with([
            'user:id,name,email',
            'template:id,name,thumbnail_url',
            'package:id,name,badge,price',
        ])
            ->withCount(['guests', 'rsvps'])
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'statistics' => [
                'total_users' => $totalUsers,
                'couple_users' => $coupleUsers,
                'total_invitations' => $totalInvitations,
                'active_invitations' => $activeInvitations,
                'total_guests' => $totalGuests,
                'total_rsvps' => $totalRsvps,
                'total_templates' => $totalTemplates,
                'total_packages' => $totalPackages,
            ],
            'latestInvitations' => $latestInvitations,
        ]);
    }
}
