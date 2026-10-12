<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            $appName = \App\Models\AppSetting::get('general.app_name', config('app.name', 'WedInvite'));
            $appFavicon = \App\Models\AppSetting::get('general.app_favicon_url', '/favicon.ico');
        @endphp

        <title inertia>{{ $appName }}</title>
        <link rel="icon" href="{{ $appFavicon }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Cormorant+Upright:wght@300;400;500;600;700&family=Ovo&family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400&display=swap" rel="stylesheet" />

        @php
            $adminPrimary = \App\Models\AppSetting::get('theme.admin_primary', '#6366F1');
            $adminSecondary = \App\Models\AppSetting::get('theme.admin_secondary', '#F43F5E');
            $adminBg = \App\Models\AppSetting::get('theme.admin_background', '#080B12');
            $adminSurface = \App\Models\AppSetting::get('theme.admin_surface', '#0E131F');
            $adminSidebar = \App\Models\AppSetting::get('theme.admin_sidebar', '#0B0F19');
            $adminBorder = \App\Models\AppSetting::get('theme.admin_border', '#1E1B4B');

            $hexToRgb = function ($hex, $defaultRgb = '99 102 241') {
                $hex = ltrim((string) $hex, '#');
                if (strlen($hex) === 3) {
                    $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
                }
                if (strlen($hex) !== 6) {
                    return $defaultRgb;
                }
                $r = hexdec(substr($hex, 0, 2));
                $g = hexdec(substr($hex, 2, 2));
                $b = hexdec(substr($hex, 4, 2));
                return "{$r} {$g} {$b}";
            };
        @endphp
        <style id="admin-theme-vars">
            :root {
                --admin-primary: {{ $adminPrimary }};
                --admin-primary-rgb: {{ $hexToRgb($adminPrimary, '99 102 241') }};
                --admin-secondary: {{ $adminSecondary }};
                --admin-secondary-rgb: {{ $hexToRgb($adminSecondary, '244 63 94') }};
                --admin-background: {{ $adminBg }};
                --admin-background-rgb: {{ $hexToRgb($adminBg, '8 11 18') }};
                --admin-surface: {{ $adminSurface }};
                --admin-surface-rgb: {{ $hexToRgb($adminSurface, '14 19 31') }};
                --admin-sidebar: {{ $adminSidebar }};
                --admin-sidebar-rgb: {{ $hexToRgb($adminSidebar, '11 15 25') }};
                --admin-border: {{ $adminBorder }};
                --admin-border-rgb: {{ $hexToRgb($adminBorder, '30 27 75') }};
            }
        </style>

        <script>
            (function () {
                try {
                    const theme = localStorage.getItem('theme');
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (theme === 'dark' || (!theme && prefersDark)) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                } catch (e) {}
            })();
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
