<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invitation;
use App\Models\Package;
use App\Models\Template;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminInvitationController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Invitation::query()
            ->with(['user:id,name,email', 'package:id,name,badge,price', 'template:id,name,thumbnail_url'])
            ->withCount(['guests', 'rsvps']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('groom_name', 'like', "%{$search}%")
                    ->orWhere('bride_name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($uq) => $uq->where('email', 'like', "%{$search}%"));
            });
        }

        if ($packageId = $request->input('package_id')) {
            if ($packageId !== 'all') {
                $query->where('package_id', $packageId);
            }
        }

        if ($templateId = $request->input('template_id')) {
            if ($templateId !== 'all') {
                $query->where('template_id', $templateId);
            }
        }

        if ($status = $request->input('status')) {
            if ($status === 'active') {
                $query->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                });
            } elseif ($status === 'expired') {
                $query->where('expires_at', '<=', now());
            } elseif ($status === 'draft') {
                $query->where('is_published', false);
            }
        }

        $invitations = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Invitations/Index', [
            'invitations' => $invitations,
            'packages' => Package::select('id', 'name')->get(),
            'templates' => Template::select('id', 'name')->get(),
            'filters' => [
                'search' => $request->input('search', ''),
                'package_id' => $request->input('package_id', 'all'),
                'template_id' => $request->input('template_id', 'all'),
                'status' => $request->input('status', 'all'),
            ],
        ]);
    }

    public function destroy(Invitation $invitation): RedirectResponse
    {
        $invitation->delete();

        return redirect()->back()->with('success', 'Undangan berhasil dihapus.');
    }
}
