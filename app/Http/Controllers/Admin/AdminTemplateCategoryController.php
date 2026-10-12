<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TemplateCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminTemplateCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = TemplateCategory::query()->withCount('templates');

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%")->orWhere('slug', 'like', "%{$search}%");
        }

        $categories = $query->orderBy('sort_order', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Admin/TemplateCategories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search', ''),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:template_categories,slug'],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        TemplateCategory::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Kategori template berhasil ditambahkan!');
    }

    public function update(Request $request, TemplateCategory $templateCategory): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:template_categories,slug,'.$templateCategory->id],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
            'is_active' => ['boolean'],
        ]);

        $templateCategory->update($validated);

        return redirect()->back()->with('success', 'Kategori template berhasil diperbarui!');
    }

    public function destroy(TemplateCategory $templateCategory): RedirectResponse
    {
        $templateCategory->delete();

        return redirect()->back()->with('success', 'Kategori template berhasil dihapus!');
    }
}
