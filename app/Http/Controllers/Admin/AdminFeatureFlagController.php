<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FeatureFlag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AdminFeatureFlagController extends Controller
{
    public function index(): Response
    {
        $flags = FeatureFlag::all();

        return Inertia::render('Admin/FeatureFlags/Index', [
            'flags' => $flags,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $flags = $request->input('flags', []);

        foreach ($flags as $key => $isEnabled) {
            FeatureFlag::where('key', $key)->update([
                'is_enabled' => (bool) $isEnabled,
                'updated_at' => now(),
            ]);
            Cache::forget("feature_flag:{$key}");
        }

        return redirect()->back()->with('success', 'Feature flags berhasil diperbarui!');
    }
}
