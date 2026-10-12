<?php

namespace App\Http\Middleware;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'adminTheme' => [
                'primary' => (string) AppSetting::get('theme.admin_primary', '#6366F1'),
                'secondary' => (string) AppSetting::get('theme.admin_secondary', '#F43F5E'),
                'background' => (string) AppSetting::get('theme.admin_background', '#080B12'),
                'surface' => (string) AppSetting::get('theme.admin_surface', '#0E131F'),
                'sidebar' => (string) AppSetting::get('theme.admin_sidebar', '#0B0F19'),
                'border' => (string) AppSetting::get('theme.admin_border', '#1E1B4B'),
            ],
            'branding' => [
                'app_name' => (string) AppSetting::get('general.app_name', 'WedInvite'),
                'app_tagline' => (string) AppSetting::get('general.app_tagline', 'Platform Undangan Digital Elegan & Cepat'),
                'app_logo_url' => (string) AppSetting::get('general.app_logo_url', '/images/logo.png'),
                'app_favicon_url' => (string) AppSetting::get('general.app_favicon_url', '/favicon.ico'),
                'watermark_text' => (string) AppSetting::get('general.watermark_text', 'Powered by WedInvite'),
                'watermark_link' => (string) AppSetting::get('general.watermark_link', 'https://wedinvite.com'),
            ],
        ];
    }
}
