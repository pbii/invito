<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminPackageController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Package::query()->withCount('invitations');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('badge', 'like', "%{$search}%");
            });
        }

        if ($sortColumn = $request->input('sort')) {
            $sortDir = $request->input('direction', 'asc');
            $query->orderBy($sortColumn, $sortDir);
        } else {
            $query->orderBy('sort_order', 'asc');
        }

        $packages = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Packages/Index', [
            'packages' => $packages,
            'filters' => [
                'search' => $request->input('search', ''),
                'sort' => $request->input('sort', 'sort_order'),
                'direction' => $request->input('direction', 'asc'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'badge' => ['nullable', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'max_invitations' => ['nullable', 'integer', 'min:1'],
            'max_guests' => ['nullable', 'integer'],
            'max_photos' => ['required', 'integer', 'min:1'],
            'max_music' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'is_popular' => ['boolean'],
            'description' => ['nullable', 'string'],
        ]);

        Package::create([
            'id' => (string) Str::uuid(),
            ...$validated,
        ]);

        return redirect()->back()->with('success', 'Paket berhasil ditambahkan!');
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'badge' => ['nullable', 'string', 'max:50'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'max_invitations' => ['nullable', 'integer', 'min:1'],
            'max_guests' => ['nullable', 'integer'],
            'max_photos' => ['required', 'integer', 'min:1'],
            'max_music' => ['required', 'integer', 'min:1'],
            'is_active' => ['boolean'],
            'is_popular' => ['boolean'],
            'description' => ['nullable', 'string'],
        ]);

        $package->update($validated);

        return redirect()->back()->with('success', 'Paket berhasil diperbarui!');
    }

    public function destroy(Package $package): RedirectResponse
    {
        $package->delete();

        return redirect()->back()->with('success', 'Paket berhasil dihapus!');
    }
}
