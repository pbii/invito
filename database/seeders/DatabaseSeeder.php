<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AdminThemePreset;
use App\Models\AppSetting;
use App\Models\EventType;
use App\Models\FeatureFlag;
use App\Models\MessageTemplate;
use App\Models\Package;
use App\Models\PaymentProvider;
use App\Models\Template;
use App\Models\TemplateCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin & Demo Couple
        $superAdmin = User::firstOrCreate(
            ['email' => 'admin@wedinvite.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Super Admin',
                'password' => Hash::make('Admin@123'),
                'phone' => '6281200000001',
                'role' => 'SUPER_ADMIN',
                'is_verified' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $demoCouple = User::firstOrCreate(
            ['email' => 'demo@wedinvite.com'],
            [
                'id' => (string) Str::uuid(),
                'name' => 'Demo Couple',
                'password' => Hash::make('Demo@123'),
                'phone' => '6281200000002',
                'role' => 'COUPLE',
                'is_verified' => true,
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // 2. Global App Settings
        $appSettings = [
            // General / Branding
            ['key' => 'general.app_name', 'value' => 'WedInvite', 'group' => 'GENERAL', 'type' => 'STRING', 'description' => 'Nama brand aplikasi platform'],
            ['key' => 'general.app_tagline', 'value' => 'Platform Undangan Digital Elegan & Cepat', 'group' => 'GENERAL', 'type' => 'STRING', 'description' => 'Tagline utama platform'],
            ['key' => 'general.app_logo_url', 'value' => '/images/logo.png', 'group' => 'GENERAL', 'type' => 'STRING', 'description' => 'URL logo brand platform'],
            ['key' => 'general.app_favicon_url', 'value' => '/favicon.ico', 'group' => 'GENERAL', 'type' => 'STRING', 'description' => 'URL favicon platform'],
            ['key' => 'general.watermark_text', 'value' => 'Powered by WedInvite', 'group' => 'GENERAL', 'type' => 'STRING', 'description' => 'Teks watermark footer undangan'],
            ['key' => 'general.watermark_link', 'value' => 'https://wedinvite.com', 'group' => 'GENERAL', 'type' => 'STRING', 'description' => 'Link redirect saat watermark diklik'],

            // Storage & Upload Limits
            ['key' => 'upload.max_photo_size_mb', 'value' => '2', 'group' => 'STORAGE', 'type' => 'NUMBER', 'description' => 'Maksimal ukuran foto (MB) sebelum kompresi'],
            ['key' => 'upload.max_music_size_mb', 'value' => '5', 'group' => 'STORAGE', 'type' => 'NUMBER', 'description' => 'Maksimal ukuran audio latar (MB)'],

            // Guest Limits
            ['key' => 'guests.max_import_rows', 'value' => '500', 'group' => 'GUEST', 'type' => 'NUMBER', 'description' => 'Batas maksimal baris per sekali import CSV/Excel'],

            // Security & Protection
            ['key' => 'security.rate_limit_rsvp_per_ip_minutes', 'value' => '15', 'group' => 'SECURITY', 'type' => 'NUMBER', 'description' => 'Durasi limit submit RSVP per alamat IP'],
            ['key' => 'security.turnstile_enabled', 'value' => 'true', 'group' => 'SECURITY', 'type' => 'BOOLEAN', 'description' => 'Aktifkan Cloudflare Turnstile bot protection'],

            // System & Invitation
            ['key' => 'invitation.default_active_days', 'value' => '90', 'group' => 'LIMITS', 'type' => 'NUMBER', 'description' => 'Durasi masa aktif standar paket undangan'],
            ['key' => 'system.maintenance_mode', 'value' => 'false', 'group' => 'GENERAL', 'type' => 'BOOLEAN', 'description' => 'Status pemeliharaan sistem'],

            // Admin Dashboard Theme Palette Tokens
            ['key' => 'theme.admin_primary', 'value' => '#6366F1', 'group' => 'THEME', 'type' => 'STRING', 'description' => 'Warna primer utama dashboard admin'],
            ['key' => 'theme.admin_secondary', 'value' => '#F43F5E', 'group' => 'THEME', 'type' => 'STRING', 'description' => 'Warna aksen sekunder dashboard admin'],
            ['key' => 'theme.admin_background', 'value' => '#080B12', 'group' => 'THEME', 'type' => 'STRING', 'description' => 'Warna background kanvas dashboard admin'],
            ['key' => 'theme.admin_surface', 'value' => '#0E131F', 'group' => 'THEME', 'type' => 'STRING', 'description' => 'Warna permukaan kartu & modal dashboard admin'],
            ['key' => 'theme.admin_sidebar', 'value' => '#0B0F19', 'group' => 'THEME', 'type' => 'STRING', 'description' => 'Warna sidebar navigasi dashboard admin'],
            ['key' => 'theme.admin_border', 'value' => '#1E1B4B', 'group' => 'THEME', 'type' => 'STRING', 'description' => 'Warna garis tepi/border dashboard admin'],
        ];

        foreach ($appSettings as $setting) {
            AppSetting::firstOrCreate(
                ['key' => $setting['key']],
                array_merge($setting, ['updated_by' => $superAdmin->id, 'updated_at' => now()])
            );
        }

        // 3. Feature Flags
        $featureFlags = [
            ['key' => 'GATEWAY_PAYMENT_ENABLED', 'name' => 'Payment Gateway Midtrans', 'description' => 'Gunakan Midtrans Snap untuk pembayaran otomatis', 'is_enabled' => true],
            ['key' => 'DIGITAL_ENVELOPE_ENABLED', 'name' => 'Amplop Digital', 'description' => 'Fitur kirim amplop uang tunai & hadiah via QRIS/Transfer', 'is_enabled' => true],
            ['key' => 'STREAMING_LINK_ENABLED', 'name' => 'Live Streaming Link', 'description' => 'Integrasi YouTube/Zoom live streaming di undangan', 'is_enabled' => true],
            ['key' => 'ANALYTICS_ENABLED', 'name' => 'Advanced Analytics', 'description' => 'Pelacakan detail device & IP pengunjung undangan', 'is_enabled' => true],
        ];

        foreach ($featureFlags as $flag) {
            FeatureFlag::firstOrCreate(
                ['key' => $flag['key']],
                array_merge($flag, ['updated_by' => $superAdmin->id, 'updated_at' => now()])
            );
        }

        // 4. Payment Providers
        $providers = [
            ['name' => 'BCA (Bank Central Asia)', 'code' => 'BCA', 'type' => 'BANK', 'logo_url' => '/images/payments/bca.png', 'sort_order' => 1],
            ['name' => 'Bank Mandiri', 'code' => 'MANDIRI', 'type' => 'BANK', 'logo_url' => '/images/payments/mandiri.png', 'sort_order' => 2],
            ['name' => 'BRI (Bank Rakyat Indonesia)', 'code' => 'BRI', 'type' => 'BANK', 'logo_url' => '/images/payments/bri.png', 'sort_order' => 3],
            ['name' => 'BNI (Bank Negara Indonesia)', 'code' => 'BNI', 'type' => 'BANK', 'logo_url' => '/images/payments/bni.png', 'sort_order' => 4],
            ['name' => 'Bank Syariah Indonesia (BSI)', 'code' => 'BSI', 'type' => 'BANK', 'logo_url' => '/images/payments/bsi.png', 'sort_order' => 5],
            ['name' => 'GoPay', 'code' => 'GOPAY', 'type' => 'EWALLET', 'logo_url' => '/images/payments/gopay.png', 'sort_order' => 6],
            ['name' => 'OVO', 'code' => 'OVO', 'type' => 'EWALLET', 'logo_url' => '/images/payments/ovo.png', 'sort_order' => 7],
            ['name' => 'DANA', 'code' => 'DANA', 'type' => 'EWALLET', 'logo_url' => '/images/payments/dana.png', 'sort_order' => 8],
            ['name' => 'QRIS Universal', 'code' => 'QRIS', 'type' => 'QRIS', 'logo_url' => '/images/payments/qris.png', 'sort_order' => 9],
        ];

        foreach ($providers as $provider) {
            PaymentProvider::firstOrCreate(
                ['code' => $provider['code']],
                array_merge($provider, ['is_active' => true])
            );
        }

        // 5. Event Types
        $eventTypes = [
            ['name' => 'Akad Nikah', 'slug' => 'akad-nikah', 'description' => 'Ijab kabul dan prosesi sakral pernikahan Islam', 'default_icon' => 'ring', 'sort_order' => 1],
            ['name' => 'Pemberkatan', 'slug' => 'pemberkatan', 'description' => 'Upacara suci pemberkatan pernikahan di Gereja/Tempat Ibadah', 'default_icon' => 'church', 'sort_order' => 2],
            ['name' => 'Resepsi', 'slug' => 'resepsi', 'description' => 'Pesta perayaan jamuan makan bersama keluarga dan sahabat', 'default_icon' => 'party', 'sort_order' => 3],
            ['name' => 'Siraman', 'slug' => 'siraman', 'description' => 'Upacara adat pembersihan diri menjelang pernikahan', 'default_icon' => 'water', 'sort_order' => 4],
            ['name' => 'Midodareni', 'slug' => 'midodareni', 'description' => 'Malam sakral menjelang ijab kabul tradisi Jawa', 'default_icon' => 'moon', 'sort_order' => 5],
            ['name' => 'Unduh Mantu', 'slug' => 'unduh-mantu', 'description' => 'Pesta perayaan syukuran dari pihak keluarga mempelai pria', 'default_icon' => 'home', 'sort_order' => 6],
            ['name' => 'Pengajian', 'slug' => 'pengajian', 'description' => 'Doa bersama memohon kelancaran prosesi pernikahan', 'default_icon' => 'book', 'sort_order' => 7],
            ['name' => 'Tea Pai', 'slug' => 'tea-pai', 'description' => 'Tradisi minum teh penghormatan keluarga adat Tionghoa', 'default_icon' => 'cup', 'sort_order' => 8],
        ];

        foreach ($eventTypes as $type) {
            EventType::firstOrCreate(
                ['slug' => $type['slug']],
                array_merge($type, ['is_active' => true])
            );
        }

        // 6. Message Templates for WhatsApp
        $messageTemplates = [
            [
                'name' => 'Formal Islami',
                'language' => 'id',
                'is_default' => true,
                'content' => "Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nKepada Yth. Bapak/Ibu/Saudara/i *{{guest_name}}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri hari bahagia pernikahan kami:\n\n*{{groom_name}} & {{bride_name}}*\n\nBerikut tautan undangan digital kami untuk melihat detail acara, lokasi, serta konfirmasi kehadiran:\n{{invitation_url}}\n\nMerupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh.",
            ],
            [
                'name' => 'Santai Teman & Sahabat',
                'language' => 'id',
                'is_default' => false,
                'content' => "Halo *{{guest_name}}*!\n\nKabar bahagia untuk kita semua! Kami mengundang kamu untuk hadir dan merayakan momen sakral pernikahan kami:\n\n*{{groom_name}} & {{bride_name}}*\n\nYuk cek detail acara dan konfirmasi kehadiran kamu lewat tautan berikut:\n{{invitation_url}}\n\nKehadiran dan doa restumu sangat berarti bagi kami. Sampai jumpa di hari bahagia!",
            ],
            [
                'name' => 'English / International',
                'language' => 'en',
                'is_default' => false,
                'content' => "Dear *{{guest_name}}*,\n\nTogether with our families, we joyfully invite you to celebrate our wedding day:\n\n*{{groom_name}} & {{bride_name}}*\n\nPlease find the details of our wedding ceremony and RSVP through the link below:\n{{invitation_url}}\n\nWe look forward to celebrating this special day with you!",
            ],
        ];

        foreach ($messageTemplates as $tpl) {
            MessageTemplate::firstOrCreate(
                ['name' => $tpl['name']],
                $tpl
            );
        }

        // 7. Template Categories & Universal Templates
        $catModern = TemplateCategory::firstOrCreate(
            ['slug' => 'modern'],
            ['name' => 'Modern & Minimalis', 'description' => 'Desain kontemporer elegan dengan garis bersih', 'sort_order' => 1, 'is_active' => true]
        );

        $catRustic = TemplateCategory::firstOrCreate(
            ['slug' => 'rustic'],
            ['name' => 'Rustic & Vintage', 'description' => 'Nuansa hangat alam, daun, dan kayu bernuansa earth-tone', 'sort_order' => 2, 'is_active' => true]
        );

        $catIslami = TemplateCategory::firstOrCreate(
            ['slug' => 'islami'],
            ['name' => 'Islami & Tradisional', 'description' => 'Ornamen floral kaligrafi syahdu dan sopan', 'sort_order' => 3, 'is_active' => true]
        );

        $tpl1 = Template::firstOrCreate(
            ['slug' => 'modern-floral'],
            [
                'name' => 'Modern Floral',
                'description' => 'Template modern beraksen bunga lembut dan tipografi elegan',
                'thumbnail_url' => '/images/templates/modern-floral.jpg',
                'component_name' => 'ModernFloral',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );
        $tpl1->categories()->syncWithoutDetaching([$catModern->id]);

        $tpl2 = Template::firstOrCreate(
            ['slug' => 'rustic-brown'],
            [
                'name' => 'Rustic Brown',
                'description' => 'Template bertema bumi dan dedaunan kering yang hangat',
                'thumbnail_url' => '/images/templates/rustic-brown.jpg',
                'component_name' => 'RusticBrown',
                'sort_order' => 2,
                'is_active' => true,
            ]
        );
        $tpl2->categories()->syncWithoutDetaching([$catRustic->id]);

        $tpl3 = Template::firstOrCreate(
            ['slug' => 'islamic-elegance'],
            [
                'name' => 'Islamic Elegance',
                'description' => 'Template islami bernuansa emas dan hijau zamrud menyejukkan',
                'thumbnail_url' => '/images/templates/islamic-elegance.jpg',
                'component_name' => 'IslamicElegance',
                'sort_order' => 3,
                'is_active' => true,
            ]
        );
        $tpl3->categories()->syncWithoutDetaching([$catIslami->id]);

        $tpl4 = Template::firstOrCreate(
            ['slug' => 'eloise-editorial'],
            [
                'name' => 'Eloise Editorial (Anna & Jeremiah)',
                'description' => 'Replika tema Katsudoto bergaya majalah editorial dengan nuansa Forest Olive, Ovo & Cormorant typography, dan split screen desktop.',
                'thumbnail_url' => '/images/templates/eloise-editorial.jpg',
                'component_name' => 'EloiseEditorial',
                'sort_order' => 4,
                'is_active' => true,
            ]
        );
        $tpl4->categories()->syncWithoutDetaching([$catModern->id, $catRustic->id]);

        $tpl5 = Template::firstOrCreate(
            ['slug' => 'classy-royalty'],
            [
                'name' => 'Classy Royalty',
                'description' => 'Template mewah bergaya kerajaan dengan palet burgundy & emas, ornamen istana klasik, dan split screen interaktif.',
                'thumbnail_url' => '/images/templates/classy.jpg',
                'component_name' => 'Classy',
                'sort_order' => 5,
                'is_active' => true,
            ]
        );
        $tpl5->categories()->syncWithoutDetaching([$catModern->id]);

        // 8. Packages
        Package::firstOrCreate(
            ['name' => 'Gratis (Free Trial)'],
            [
                'description' => 'Coba buat undangan pernikahan digital secara instan tanpa biaya.',
                'badge' => 'Coba Gratis',
                'price' => 0,
                'duration_days' => 14,
                'sort_order' => 1,
                'is_active' => true,
                'is_popular' => false,
                'max_invitations' => 1,
                'max_guests' => 50,
                'max_photos' => 3,
                'max_music' => 1,
                'allow_custom_music' => false,
                'allow_custom_slug' => false,
                'allow_gift_info' => true,
                'allow_love_story' => false,
                'allow_countdown' => true,
                'allow_streaming' => false,
                'allow_multilingual' => false,
                'allow_analytics' => false,
                'allow_digital_envelope' => false,
                'remove_watermark' => false,
                'allow_guest_import' => false,
                'allow_wa_blast' => false,
            ]
        );

        Package::firstOrCreate(
            ['name' => 'Silver'],
            [
                'description' => 'Paket hemat dengan fitur lengkap untuk pernikahan hangat keluarga.',
                'badge' => 'Pilihan Hemat',
                'price' => 69000,
                'duration_days' => 90,
                'sort_order' => 2,
                'is_active' => true,
                'is_popular' => false,
                'max_invitations' => 2,
                'max_guests' => 300,
                'max_photos' => 10,
                'max_music' => 3,
                'allow_custom_music' => true,
                'allow_custom_slug' => true,
                'allow_gift_info' => true,
                'allow_love_story' => true,
                'allow_countdown' => true,
                'allow_streaming' => false,
                'allow_multilingual' => false,
                'allow_analytics' => true,
                'allow_digital_envelope' => true,
                'remove_watermark' => false,
                'allow_guest_import' => true,
                'allow_wa_blast' => true,
            ]
        );

        Package::firstOrCreate(
            ['name' => 'Gold (All-in-One)'],
            [
                'description' => 'Fitur tanpa batas tanpa watermark untuk momen pernikahan paling berharga.',
                'badge' => 'Paling Populer',
                'price' => 129000,
                'duration_days' => 180,
                'sort_order' => 3,
                'is_active' => true,
                'is_popular' => true,
                'max_invitations' => 5,
                'max_guests' => null, // Unlimited
                'max_photos' => 30,
                'max_music' => 10,
                'allow_custom_music' => true,
                'allow_custom_slug' => true,
                'allow_gift_info' => true,
                'allow_love_story' => true,
                'allow_countdown' => true,
                'allow_streaming' => true,
                'allow_multilingual' => true,
                'allow_analytics' => true,
                'allow_digital_envelope' => true,
                'remove_watermark' => true,
                'allow_guest_import' => true,
                'allow_wa_blast' => true,
            ]
        );

        // 9. Admin Theme Presets
        $themePresets = [
            [
                'name' => 'Midnight Indigo',
                'slug' => 'midnight-indigo',
                'primary_color' => '#6366F1',
                'secondary_color' => '#F43F5E',
                'background_color' => '#080B12',
                'surface_color' => '#0E131F',
                'sidebar_color' => '#0B0F19',
                'border_color' => '#1E1B4B',
                'is_default' => true,
                'is_system' => true,
            ],
            [
                'name' => 'Cyber Emerald',
                'slug' => 'cyber-emerald',
                'primary_color' => '#10B981',
                'secondary_color' => '#06B6D4',
                'background_color' => '#06120E',
                'surface_color' => '#0B1E17',
                'sidebar_color' => '#081712',
                'border_color' => '#064E3B',
                'is_default' => false,
                'is_system' => true,
            ],
            [
                'name' => 'Rose Velvet',
                'slug' => 'rose-velvet',
                'primary_color' => '#E11D48',
                'secondary_color' => '#FB7185',
                'background_color' => '#12080C',
                'surface_color' => '#1E0E14',
                'sidebar_color' => '#170A0F',
                'border_color' => '#4C0519',
                'is_default' => false,
                'is_system' => true,
            ],
            [
                'name' => 'Amethyst Night',
                'slug' => 'amethyst-night',
                'primary_color' => '#8B5CF6',
                'secondary_color' => '#D946EF',
                'background_color' => '#0C0814',
                'surface_color' => '#160E24',
                'sidebar_color' => '#110A1C',
                'border_color' => '#2E1065',
                'is_default' => false,
                'is_system' => true,
            ],
            [
                'name' => 'Ocean Sapphire',
                'slug' => 'ocean-sapphire',
                'primary_color' => '#0284C7',
                'secondary_color' => '#38BDF8',
                'background_color' => '#060D17',
                'surface_color' => '#0B1726',
                'sidebar_color' => '#08121E',
                'border_color' => '#0C4A6E',
                'is_default' => false,
                'is_system' => true,
            ],
            [
                'name' => 'Amber Sunset',
                'slug' => 'amber-sunset',
                'primary_color' => '#D97706',
                'secondary_color' => '#F97316',
                'background_color' => '#140D06',
                'surface_color' => '#20150B',
                'sidebar_color' => '#191108',
                'border_color' => '#451A03',
                'is_default' => false,
                'is_system' => true,
            ],
        ];

        foreach ($themePresets as $preset) {
            AdminThemePreset::firstOrCreate(
                ['slug' => $preset['slug']],
                $preset
            );
        }
    }
}
