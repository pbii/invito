<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EventType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminEventTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = EventType::query();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")->orWhere('slug', 'like', "%{$search}%");
        }

        $eventTypes = $query->orderBy('sort_order', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Admin/EventTypes/Index', [
            'eventTypes' => $eventTypes,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:event_types,slug'],
            'default_icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        EventType::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'default_icon' => $validated['default_icon'] ?? null,
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Jenis acara berhasil ditambahkan!');
    }

    public function update(Request $request, EventType $eventType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:event_types,slug,'.$eventType->id],
            'default_icon' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $eventType->update($validated);

        return redirect()->back()->with('success', 'Jenis acara berhasil diperbarui!');
    }

    public function destroy(EventType $eventType): RedirectResponse
    {
        $eventType->delete();

        return redirect()->back()->with('success', 'Jenis acara berhasil dihapus!');
    }
}
