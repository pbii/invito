<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminThemePreset;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AdminThemePresetController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'primary_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'surface_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'sidebar_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'border_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $baseSlug = Str::slug($validated['name']);
        $slug = $baseSlug;
        $counter = 1;
        while (AdminThemePreset::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        AdminThemePreset::create([
            'id' => (string) Str::uuid(),
            'name' => $validated['name'],
            'slug' => $slug,
            'primary_color' => strtoupper($validated['primary_color']),
            'secondary_color' => strtoupper($validated['secondary_color']),
            'background_color' => strtoupper($validated['background_color']),
            'surface_color' => strtoupper($validated['surface_color']),
            'sidebar_color' => strtoupper($validated['sidebar_color']),
            'border_color' => strtoupper($validated['border_color']),
            'is_default' => false,
            'is_system' => false,
        ]);

        return redirect()->back()->with('success', "Preset tema '{$validated['name']}' berhasil disimpan!");
    }

    public function update(Request $request, AdminThemePreset $themePreset): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'primary_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'background_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'surface_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'sidebar_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'border_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $themePreset->update([
            'name' => $validated['name'],
            'primary_color' => strtoupper($validated['primary_color']),
            'secondary_color' => strtoupper($validated['secondary_color']),
            'background_color' => strtoupper($validated['background_color']),
            'surface_color' => strtoupper($validated['surface_color']),
            'sidebar_color' => strtoupper($validated['sidebar_color']),
            'border_color' => strtoupper($validated['border_color']),
        ]);

        return redirect()->back()->with('success', "Preset tema '{$themePreset->name}' berhasil diperbarui!");
    }

    public function destroy(AdminThemePreset $themePreset): RedirectResponse
    {
        $name = $themePreset->name;
        $themePreset->delete();

        return redirect()->back()->with('success', "Preset tema '{$name}' berhasil dihapus!");
    }

    public function apply(AdminThemePreset $themePreset): RedirectResponse
    {
        $colors = [
            'theme.admin_primary' => $themePreset->primary_color,
            'theme.admin_secondary' => $themePreset->secondary_color,
            'theme.admin_background' => $themePreset->background_color,
            'theme.admin_surface' => $themePreset->surface_color,
            'theme.admin_sidebar' => $themePreset->sidebar_color,
            'theme.admin_border' => $themePreset->border_color,
        ];

        foreach ($colors as $key => $val) {
            AppSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $val,
                    'group' => 'THEME',
                    'type' => 'STRING',
                    'updated_at' => now(),
                ]
            );
            Cache::forget("app_setting:{$key}");
        }

        AdminThemePreset::query()->update(['is_default' => false]);
        $themePreset->update(['is_default' => true]);

        return redirect()->back()->with('success', "Tema '{$themePreset->name}' berhasil diterapkan ke dashboard admin!");
    }
}
