<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminThemePreset;
use App\Models\AppSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    public function index(): Response
    {
        $settings = AppSetting::all()->pluck('value', 'key')->toArray();
        $themePresets = AdminThemePreset::orderBy('is_system', 'desc')
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'themePresets' => $themePresets,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->except(['_token', '_method']);

        foreach ($data as $key => $val) {
            $group = str_starts_with($key, 'theme.') ? 'THEME' : (
                str_starts_with($key, 'upload.') ? 'STORAGE' : (
                    str_starts_with($key, 'guests.') ? 'GUEST' : (
                        str_starts_with($key, 'security.') ? 'SECURITY' : (
                            str_starts_with($key, 'invitation.') ? 'LIMITS' : 'GENERAL'
                        )
                    )
                )
            );

            AppSetting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => (string) $val,
                    'group' => $group,
                    'type' => 'STRING',
                    'updated_at' => now(),
                ]
            );
            Cache::forget("app_setting:{$key}");
        }

        return redirect()->back()->with('success', 'Pengaturan platform berhasil disimpan!');
    }
}
