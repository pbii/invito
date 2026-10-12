<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Models\TemplateCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminTemplateController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Template::query()->with('categories')->withCount('invitations');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('component_name', 'like', "%{$search}%");
            });
        }

        if ($catId = $request->input('category_id')) {
            if ($catId !== 'all') {
                $query->whereHas('categories', fn ($cq) => $cq->where('template_categories.id', $catId));
            }
        }

        $templates = $query->orderBy('sort_order', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Admin/Templates/Index', [
            'templates' => $templates,
            'categories' => TemplateCategory::select('id', 'name')->get(),
            'filters' => [
                'search' => $request->input('search', ''),
                'category_id' => $request->input('category_id', 'all'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:templates,slug'],
            'component_name' => ['required', 'string', 'max:255'],
            'thumbnail_url' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
            'category_ids' => ['array'],
        ]);

        $template = Template::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'component_name' => $validated['component_name'],
            'thumbnail_url' => $validated['thumbnail_url'] ?? null,
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (! empty($validated['category_ids'])) {
            $template->categories()->sync($validated['category_ids']);
        }

        return redirect()->back()->with('success', 'Template berhasil ditambahkan!');
    }

    public function update(Request $request, Template $template): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:templates,slug,'.$template->id],
            'component_name' => ['required', 'string', 'max:255'],
            'thumbnail_url' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
            'category_ids' => ['array'],
        ]);

        $template->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'component_name' => $validated['component_name'],
            'thumbnail_url' => $validated['thumbnail_url'] ?? null,
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (isset($validated['category_ids'])) {
            $template->categories()->sync($validated['category_ids']);
        }

        return redirect()->back()->with('success', 'Template berhasil diperbarui!');
    }

    public function destroy(Template $template): RedirectResponse
    {
        $template->delete();

        return redirect()->back()->with('success', 'Template berhasil dihapus!');
    }
}
