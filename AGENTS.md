# AGENTS.md - WedInvite (Laravel 11 Edition)

## Project Overview

WedInvite adalah platform undangan pernikahan online berkinerja tinggi berbasis **Laravel 11 (PHP 8.3+) + Inertia.js (React) + FilamentPHP v3**. Lihat `PRD.md` untuk detail spesifikasi fitur dan arsitektur data.

---

## Tech Stack

- **Backend:** Laravel 11 (PHP 8.3+ strict mode, OPcache)
- **Admin Panel:** FilamentPHP v3 (TALL Stack)
- **Frontend SPA:** Inertia.js v2 + React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL 15+ via Eloquent ORM & Native Migrations
- **Cache:** `spatie/laravel-responsecache` (Memory/Redis)
- **Queue & Cron:** Laravel Queue (Database/Redis) + Task Scheduler
- **Payment:** Midtrans Snap (`midtrans/midtrans-php`)
- **File Storage:** Cloudinary (`cloudinary/cloudinary_php`)
- **Email:** Resend (`resend/resend-laravel`)
- **Bot Protection:** Cloudflare Turnstile

---

## Commands

| Task | Command |
|------|---------|
| Dev backend | `php artisan serve` |
| Dev frontend | `pnpm dev` |
| Build frontend | `pnpm build` |
| Queue worker | `php artisan queue:work` |
| Run migrations | `php artisan migrate` |
| Rollback migration | `php artisan migrate:rollback` |
| Seed database | `php artisan db:seed` |
| Clear app cache | `php artisan optimize:clear` |
| Clear page cache | `php artisan responsecache:clear` |
| Code style fix | `./vendor/bin/pint` |
| Type check frontend | `pnpm typecheck` |
| Test (Pest / PHPUnit)| `php artisan test` |

**Setelah selesai edit kode backend, jalankan:**
```bash
./vendor/bin/pint
```

**Setelah selesai edit kode frontend, jalankan:**
```bash
pnpm typecheck
```

---

## Code Conventions

### General
- Bahasa kode (variabel, fungsi, komentar): **English**
- Bahasa UI/konten yang ditampilkan ke user: **Bahasa Indonesia**
- Strict Types di PHP: Selalu tambahkan `declare(strict_types=1);` di baris paling atas setiap file PHP.
- Strict TypeScript di frontend: Hindari `any`, gunakan interface terdefinisi di `resources/js/types/`.
- Jangan tambahkan komentar kecuali diminta.

### File Naming & Structure
- **Models:** `PascalCase.php` di `app/Models/` (contoh: `Invitation.php`, `Guest.php`)
- **Controllers:** `PascalCaseController.php` di `app/Http/Controllers/`
- **Form Requests:** `PascalCaseRequest.php` di `app/Http/Requests/`
- **Jobs:** `PascalCaseJob.php` di `app/Jobs/`
- **Filament Resources:** `PascalCaseResource.php` di `app/Filament/Resources/`
- **React Components:** `PascalCase.tsx` di `resources/js/Components/`
- **Inertia Pages:** `PascalCase.tsx` di `resources/js/Pages/`
- **Migrations:** `YYYY_MM_DD_HHMMSS_create_table_name_table.php` di `database/migrations/`

### Controller & Business Logic
- Tipiskan Controller (*Thin Controllers, Fat Models/Services*).
- Validasi input WAJIB menggunakan dedicated **FormRequest** (`app/Http/Requests/`), jangan validasi manual di controller.
- Operasi multi-table WAJIB dibungkus `DB::transaction()`.
- Return Inertia view untuk navigasi frontend: `return Inertia::render('Couple/Invitation/Edit', [...]);`.
- Return JSON response untuk API internal/webhook: `return response()->json(['data' => $result], 200);`.

### Database & Eloquent
- Gunakan `$fillable` di setiap model Eloquent, atau `$guarded = []` jika dilindungi FormRequest yang ketat.
- Selalu definisikan tipe relasi secara eksplisit (misal: `public function events(): HasMany`).
- Gunakan eager loading (`with(['events', 'bankAccounts'])`) untuk menghindari problem N+1 query.
- Gunakan SoftDeletes (`use SoftDeletes;`) pada model penting seperti `Guest` dan `Package`.

### Admin Panel (FilamentPHP v3)
- Seluruh kebutuhan CRUD master data (Templates, Categories, Packages, Payment Providers, Event Types, Users) dikelola melalui Filament Resources.
- Halaman konfigurasi dinamis (App Settings dan Feature Flags) menggunakan Filament Custom Page.
- Manfaatkan Form Schema Filament (`Forms\Components\TextInput`, `Toggle`, `Select`, `FileUpload`) tanpa menulis HTML/React manual untuk panel admin.

---

## Key Implementation Notes (Production Guidelines)

1. **Full-Page Cache & Invalidasi (`responsecache`):** Halaman undangan publik `/[slug]` di-cache menggunakan middleware `spatie/laravel-responsecache`. Setiap kali couple mengubah data undangan, sistem otomatis memicu pembersihan cache via Eloquent Model Event `saved`/`updated`.
2. **Cover Overlay Audio Policy:** Layar pembuka wajib fullscreen cover overlay. Trigger `Audio.play()` hanya dijalankan saat tombol "Buka Undangan" diklik (user gesture) agar tidak dicekal oleh browser policy iOS/Android.
3. **Client-side Image Compression:** Semua foto wajib dikompres otomatis di browser via `browser-image-compression` (< 800KB, WebP, max width 1920px) sebelum dikirim ke server/Cloudinary.
4. **Cloudinary Asset Cleanup:** Simpan `cloudinary_public_id` di database. Saat user mengupdate atau menghapus foto galeri, musik, atau QRIS, dispatch `CleanupCloudinaryMediaJob` untuk menghapus aset lama di Cloudinary via Destroy API.
5. **Bot Protection:** Submit form publik (RSVP, wishes, digital envelope) wajib memvalidasi token Cloudflare Turnstile di sisi server dan mengecek hidden honeypot field.
6. **Token Tamu & Forwarding Protection:** Link personal tamu format: `/{slug}?to={token}`. Pada form RSVP, jika token terdeteksi milik orang lain (di-forward), berikan opsi "Isi atas nama sendiri" (`guest_id = null`) agar data kehadiran asli tidak tertimpa.
7. **Normalisasi Telepon E.164:** Setiap input dan import nomor HP tamu wajib disanitasi ke format `628xxxxxxxxxx` (tanpa `+`, strip, atau `0` di depan) di `StoreGuestRequest` sebelum disimpan ke PostgreSQL agar link WhatsApp `wa.me` selalu valid.
8. **Idempotent Midtrans Webhook:** Handler `MidtransWebhookController` wajib menggunakan `DB::transaction()` dengan `lockForUpdate()`. Jika status transaksi di database sudah `SETTLEMENT` atau `CAPTURE_SUCCESS`, lewati pemrosesan penambahan masa aktif dan langsung kembalikan HTTP 200.
9. **WhatsApp Guided Queue:** Fitur kirim massal WhatsApp menggunakan mode antrean terpandu per baris tamu dengan indikator status `is_sent` untuk menghindari popup blocker browser.
10. **Akses Template Universal:** Seluruh template dapat digunakan gratis oleh semua user/paket tanpa klasifikasi free/premium. Kategori template dikelola dinamis oleh admin via relasi many-to-many (`template_category_tags`). Jika kategori tidak dipilih (`category_id` kosong/"all"), sistem WAJIB menampilkan seluruh template aktif (select all behavior).
11. **Dynamic Template Rendering:** Komponen template di `resources/js/Pages/Templates/` wajib mengikuti standard interface `InvitationPageProps`. Pergantian template (`template_id`) pada undangan TIDAK boleh mengubah atau merusak struktur data undangan.
12. **Section Registry Rendering (`invitation_sections`):** Urutan dan visibilitas section di halaman undangan (`/[slug]`) WAJIB di-loop dinamis berdasarkan data `invitation_sections` (`sort_order` dan `is_enabled = true`).
13. **Dynamic Platform Settings (`app_settings`):** Batasan operasional (kuota upload file foto/musik, batas baris import tamu, durasi rate limit IP) DILARANG di-hardcode di kode. Selalu ambil dari `AppSetting::get('key', $default)` dengan cache internal.
14. **Feature Flags Engine (`feature_flags`):** Operasi eksternal kritis (payment gateway, amplop digital) WAJIB memeriksa status flag via `FeatureFlag::isEnabled('KEY')`. Jika `false`, sistem otomatis fallback ke mode aman (contoh: transfer manual).
15. **Master Data Payment & Event:** Pilihan bank/e-wallet hadiah dan jenis prosesi acara adat WAJIB di-fetch dinamis dari tabel `payment_providers` dan `event_types`.
16. **Dynamic Whitelabel & Branding:** Nama aplikasi, tagline, logo, favicon, dan teks watermark DILARANG di-hardcode sebagai string statis di UI/email. Selalu konsumsi dari `AppSetting::get('general.app_name')` dan `AppSetting::get('general.watermark_text')`.
17. **Status Undangan Expired:** Jika `now() > expires_at`, halaman undangan menampilkan tampilan ramah kadaluwarsa (bukan 404), dan couple diberi tombol opsi perpanjang masa aktif.
18. **Reserved Slug Blacklist:** Validasi slug kustom WAJIB mengecek `RESERVED_SLUGS` pada FormRequest agar tidak menimpa rute sistem.

<!-- antislop:start -->
## Anti-Slop Guidelines (Active)
Pastikan kode, desain visual, teks/copywriting, dan layout bebas dari generic AI slop.
- Gunakan aturan dan standar dari `.agents/skills/antislop/` (Core, UI, Copywriting, Human/Accessibility, Layout Mobile, Code).
- Delivery Gate wajib lolos sebelum commit/rilis.
<!-- antislop:end -->

