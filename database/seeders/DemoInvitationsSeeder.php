<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventType;
use App\Models\GalleryPhoto;
use App\Models\Guest;
use App\Models\Invitation;
use App\Models\InvitationBankAccount;
use App\Models\InvitationSection;
use App\Models\LoveStory;
use App\Models\Package;
use App\Models\PaymentProvider;
use App\Models\Rsvp;
use App\Models\Template;
use App\Models\User;
use App\Models\Wish;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoInvitationsSeeder extends Seeder
{
    public function run(): void
    {
        $demoUser = User::where('email', 'demo@wedinvite.com')->first();
        if (! $demoUser) {
            return;
        }

        $templates = Template::all();
        $packages = Package::all();
        $eventTypes = EventType::all();
        $paymentProviders = PaymentProvider::all();

        if ($templates->isEmpty() || $packages->isEmpty()) {
            return;
        }

        $defaultSections = [
            ['key' => 'cover', 'title' => 'Layar Sampul', 'sort' => 1],
            ['key' => 'quote', 'title' => 'Kutipan Suci', 'sort' => 2],
            ['key' => 'couple', 'title' => 'Mempelai Pria & Wanita', 'sort' => 3],
            ['key' => 'event', 'title' => 'Rangkaian Acara', 'sort' => 4],
            ['key' => 'countdown', 'title' => 'Hitung Mundur', 'sort' => 5],
            ['key' => 'love_story', 'title' => 'Perjalanan Cinta', 'sort' => 6],
            ['key' => 'gallery', 'title' => 'Galeri Kenangan', 'sort' => 7],
            ['key' => 'gift', 'title' => 'Amplop & Tanda Cinta', 'sort' => 8],
            ['key' => 'rsvp', 'title' => 'Konfirmasi Kehadiran (RSVP)', 'sort' => 9],
            ['key' => 'wishes', 'title' => 'Doa & Ucapan Bahagia', 'sort' => 10],
            ['key' => 'closing', 'title' => 'Salam Hangat & Penutup', 'sort' => 11],
        ];

        $coupleDummies = [
            [
                'slug' => 'raden-citra',
                'groom_name' => 'Raden Mas Arya Pratama',
                'groom_father' => 'Bpk. Bambang Wijaya',
                'groom_mother' => 'Ibu Sri Rahayu',
                'bride_name' => 'Citra Dewi Anggraini, S.E.',
                'bride_father' => 'Bpk. Prof. Hartono',
                'bride_mother' => 'Ibu Endang Lestari',
                'template_slug' => 'rustic-brown',
                'package_name' => 'Gold (All-in-One)',
                'days_expiry' => 90,
                'is_published' => true,
                'location' => 'Plataran Dharmawangsa, Jakarta Selatan',
            ],
            [
                'slug' => 'farhan-aisyah',
                'groom_name' => 'dr. Muhammad Farhan, Sp.PD',
                'groom_father' => 'H. Ahmad Syukri, M.Ag',
                'groom_mother' => 'Hj. Fatimah Zahra',
                'bride_name' => 'Aisyah Humaira, S.Ked',
                'bride_father' => 'H. Ir. Mansyur',
                'bride_mother' => 'Hj. Nurul Inayah',
                'template_slug' => 'islamic-elegance',
                'package_name' => 'Gold (All-in-One)',
                'days_expiry' => 120,
                'is_published' => true,
                'location' => 'Grand Ballroom Menara 165, Jakarta Selatan',
            ],
            [
                'slug' => 'kevin-michelle',
                'groom_name' => 'Kevin Alexander Wijaya, B.Sc.',
                'groom_father' => 'David Wijaya',
                'groom_mother' => 'Linda Tanoto',
                'bride_name' => 'Michelle Evelyn Gunawan, M.Ds.',
                'bride_father' => 'Hendra Gunawan',
                'bride_mother' => 'Cynthia Salim',
                'template_slug' => 'modern-floral',
                'package_name' => 'Silver',
                'days_expiry' => 60,
                'is_published' => true,
                'location' => 'The Hermitage, Menteng, Jakarta Pusat',
            ],
            [
                'slug' => 'dimas-anjani',
                'groom_name' => 'Dimas Surya Wicaksana',
                'groom_father' => 'Bpk. Soedarmono',
                'groom_mother' => 'Ibu Dwi Astuti',
                'bride_name' => 'Anjani Kusuma Wardhani',
                'bride_father' => 'Bpk. Tri Nugroho',
                'bride_mother' => 'Ibu Ratna Kumala',
                'template_slug' => 'rustic-brown',
                'package_name' => 'Silver',
                'days_expiry' => 45,
                'is_published' => true,
                'location' => 'Bumi Sangkuriang, Ciumbuleuit, Bandung',
            ],
            [
                'slug' => 'rizky-nadia',
                'groom_name' => 'Muhammad Rizky Ramadhan, S.Kom',
                'groom_father' => 'Bpk. Agus Salim',
                'groom_mother' => 'Ibu Siti Aminah',
                'bride_name' => 'Nadia Putri Khairunnisa, S.I.Kom',
                'bride_father' => 'Bpk. Hendra Gunawan',
                'bride_mother' => 'Ibu Rina Marlina',
                'template_slug' => 'islamic-elegance',
                'package_name' => 'Gratis (Free Trial)',
                'days_expiry' => 14,
                'is_published' => true,
                'location' => 'Masjid Raya Al-Azhar & Puri Begawan, Bogor',
            ],
            [
                'slug' => 'adrian-natasha',
                'groom_name' => 'Adrian Jonathan Lee',
                'groom_father' => 'Robert Lee',
                'groom_mother' => 'Veronica Sutanto',
                'bride_name' => 'Natasha Clarissa Sugiarto',
                'bride_father' => 'Edwin Sugiarto',
                'bride_mother' => 'Grace Susilo',
                'template_slug' => 'modern-floral',
                'package_name' => 'Gold (All-in-One)',
                'days_expiry' => 180,
                'is_published' => true,
                'location' => 'Ayana Resort & Spa, Jimbaran, Bali',
            ],
            [
                'slug' => 'bayu-tiara',
                'groom_name' => 'Bayu Samudra, S.T.',
                'groom_father' => 'Bpk. Joko Prayitno',
                'groom_mother' => 'Ibu Wulandari',
                'bride_name' => 'Tiara Alodya Paramitha, S.Psi',
                'bride_father' => 'Bpk. Sukamto',
                'bride_mother' => 'Ibu Erna Susilowati',
                'template_slug' => 'rustic-brown',
                'package_name' => 'Silver',
                'days_expiry' => 75,
                'is_published' => true,
                'location' => 'Gedung Sasono Utomo TMII, Jakarta Timur',
            ],
            [
                'slug' => 'fajar-maharani',
                'groom_name' => 'Fajar Hidayatullah, M.B.A.',
                'groom_father' => 'H. Abdul Kadir',
                'groom_mother' => 'Hj. Syarifah',
                'bride_name' => 'Maharani Safitri, S.Farm',
                'bride_father' => 'Drs. H. Basuki Rahmat',
                'bride_mother' => 'Hj. Maryam',
                'template_slug' => 'islamic-elegance',
                'package_name' => 'Gold (All-in-One)',
                'days_expiry' => 100,
                'is_published' => true,
                'location' => 'Auditorium Manggala Wanabakti, Senayan',
            ],
            [
                'slug' => 'bima-laras',
                'groom_name' => 'Bima Sena Abimanyu',
                'groom_father' => 'Bpk. Harun Ar-Rasyid',
                'groom_mother' => 'Ibu Yayuk Sri',
                'bride_name' => 'Laras Sekar Wangi',
                'bride_father' => 'Bpk. Purnomo Hadi',
                'bride_mother' => 'Ibu Endah Permata',
                'template_slug' => 'rustic-brown',
                'package_name' => 'Gratis (Free Trial)',
                'days_expiry' => -5, // Expired example
                'is_published' => true,
                'location' => 'Pendopo Dalem Ngabean, D.I. Yogyakarta',
            ],
            [
                'slug' => 'rendy-chelsea',
                'groom_name' => 'Rendy Kurniawan Putra',
                'groom_father' => 'Bpk. Gunawan Putra',
                'groom_mother' => 'Ibu Christine',
                'bride_name' => 'Chelsea Felicia Santoso',
                'bride_father' => 'Bpk. Hermawan Santoso',
                'bride_mother' => 'Ibu Silvia',
                'template_slug' => 'modern-floral',
                'package_name' => 'Silver',
                'days_expiry' => 30,
                'is_published' => false, // Draft example
                'location' => 'The Tribrata Grand Ballroom, Dharmawangsa',
            ],
        ];

        foreach ($coupleDummies as $item) {
            $tpl = $templates->firstWhere('slug', $item['template_slug']) ?? $templates->first();
            $pkg = $packages->firstWhere('name', $item['package_name']) ?? $packages->first();

            $expiresAt = $item['days_expiry'] >= 0
                ? Carbon::now()->addDays($item['days_expiry'])
                : Carbon::now()->subDays(abs($item['days_expiry']));

            // Create or update Invitation
            $invitation = Invitation::updateOrCreate(
                ['slug' => $item['slug']],
                [
                    'id' => (string) Str::uuid(),
                    'user_id' => $demoUser->id,
                    'groom_name' => $item['groom_name'],
                    'groom_father' => $item['groom_father'],
                    'groom_mother' => $item['groom_mother'],
                    'groom_photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
                    'bride_name' => $item['bride_name'],
                    'bride_father' => $item['bride_father'],
                    'bride_mother' => $item['bride_mother'],
                    'bride_photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
                    'template_id' => $tpl->id,
                    'package_id' => $pkg->id,
                    'music_url' => 'https://assets.mixkit.co/music/preview/mixkit-romantic-moment-113.mp3',
                    'language' => 'id',
                    'is_published' => $item['is_published'],
                    'expires_at' => $expiresAt,
                    'is_expired' => $item['days_expiry'] < 0,
                    'qris_image_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=WEDINVITE-QRIS-DEMO',
                ]
            );

            // 1. Invitation Sections
            foreach ($defaultSections as $sec) {
                InvitationSection::updateOrCreate(
                    [
                        'invitation_id' => $invitation->id,
                        'section_key' => $sec['key'],
                    ],
                    [
                        'id' => (string) Str::uuid(),
                        'custom_title' => $sec['title'],
                        'is_enabled' => true,
                        'sort_order' => $sec['sort'],
                    ]
                );
            }

            // 2. Events (Akad & Resepsi)
            Event::updateOrCreate(
                [
                    'invitation_id' => $invitation->id,
                    'event_name' => 'Akad Nikah / Pemberkatan',
                ],
                [
                    'id' => (string) Str::uuid(),
                    'event_type_id' => $eventTypes->first()?->id,
                    'date' => Carbon::now()->addDays(max(10, $item['days_expiry'] - 20))->toDateString(),
                    'time_start' => '08:00:00',
                    'time_end' => '10:30:00',
                    'venue_name' => $item['location'],
                    'address' => 'Jl. Pengantin No. 88, Kawasan Utama Pernikahan',
                    'latitude' => -6.200000,
                    'longitude' => 106.816666,
                ]
            );

            Event::updateOrCreate(
                [
                    'invitation_id' => $invitation->id,
                    'event_name' => 'Resepsi Pernikahan',
                ],
                [
                    'id' => (string) Str::uuid(),
                    'event_type_id' => $eventTypes->skip(1)->first()?->id ?? $eventTypes->first()?->id,
                    'date' => Carbon::now()->addDays(max(10, $item['days_expiry'] - 20))->toDateString(),
                    'time_start' => '11:00:00',
                    'time_end' => '14:30:00',
                    'venue_name' => $item['location'],
                    'address' => 'Jl. Pengantin No. 88, Kawasan Utama Pernikahan',
                    'latitude' => -6.200000,
                    'longitude' => 106.816666,
                ]
            );

            // 3. Bank Accounts
            $provBca = $paymentProviders->firstWhere('code', 'BCA');
            $provMandiri = $paymentProviders->firstWhere('code', 'MANDIRI');

            InvitationBankAccount::updateOrCreate(
                [
                    'invitation_id' => $invitation->id,
                    'account_number' => '8820192831',
                ],
                [
                    'id' => (string) Str::uuid(),
                    'provider_id' => $provBca?->id,
                    'bank_or_wallet_name' => 'Bank Central Asia (BCA)',
                    'account_holder' => $item['groom_name'],
                    'sort_order' => 1,
                ]
            );

            InvitationBankAccount::updateOrCreate(
                [
                    'invitation_id' => $invitation->id,
                    'account_number' => '1370019283719',
                ],
                [
                    'id' => (string) Str::uuid(),
                    'provider_id' => $provMandiri?->id,
                    'bank_or_wallet_name' => 'Bank Mandiri',
                    'account_holder' => $item['bride_name'],
                    'sort_order' => 2,
                ]
            );

            // 4. Love Stories
            $stories = [
                ['title' => 'Pertemuan Pertama', 'desc' => 'Bertemu saat masa perkuliahan di tahun 2018 dalam sebuah kegiatan kepanitiaan kampus.', 'date' => '2018-09-12'],
                ['title' => 'Mulai Menjalin Komitmen', 'desc' => 'Setelah saling mengenal lebih dekat, kami memutuskan untuk melangkah bersama.', 'date' => '2020-02-14'],
                ['title' => 'Momen Lamaran Khidmat', 'desc' => 'Kedua keluarga besar bertemu untuk mengikat janji suci menuju pernikahan.', 'date' => '2024-08-20'],
            ];

            foreach ($stories as $idx => $st) {
                LoveStory::updateOrCreate(
                    [
                        'invitation_id' => $invitation->id,
                        'title' => $st['title'],
                    ],
                    [
                        'id' => (string) Str::uuid(),
                        'description' => $st['desc'],
                        'date' => $st['date'],
                        'order' => $idx + 1,
                    ]
                );
            }

            // 5. Gallery Photos
            $photos = [
                'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&auto=format&fit=crop&q=80',
            ];

            foreach ($photos as $pIdx => $photoUrl) {
                GalleryPhoto::updateOrCreate(
                    [
                        'invitation_id' => $invitation->id,
                        'order' => $pIdx + 1,
                    ],
                    [
                        'id' => (string) Str::uuid(),
                        'photo_url' => $photoUrl,
                        'caption' => 'Prewedding session '.($pIdx + 1),
                    ]
                );
            }

            // 6. Dummy Guests & RSVP
            $dummyGuestNames = [
                ['name' => 'Bpk. Ahmad Fauzi & Keluarga', 'phone' => '6281234567801', 'cat' => 'FAMILY', 'status' => true, 'sent' => true],
                ['name' => 'dr. Sarah Nabila', 'phone' => '6281234567802', 'cat' => 'FRIEND', 'status' => true, 'sent' => true],
                ['name' => 'Bpk. Bambang Soeprapto', 'phone' => '6281234567803', 'cat' => 'WORK', 'status' => false, 'sent' => true],
                ['name' => 'Alfi & Reva', 'phone' => '6281234567804', 'cat' => 'FRIEND', 'status' => true, 'sent' => false],
                ['name' => 'Keluarga Besar Alm. H. Sanusi', 'phone' => '6281234567805', 'cat' => 'FAMILY', 'status' => null, 'sent' => false],
            ];

            foreach ($dummyGuestNames as $dg) {
                $guest = Guest::updateOrCreate(
                    [
                        'invitation_id' => $invitation->id,
                        'name' => $dg['name'],
                    ],
                    [
                        'id' => (string) Str::uuid(),
                        'phone' => $dg['phone'],
                        'category' => $dg['cat'],
                        'personal_link_token' => Str::random(10),
                        'is_sent' => $dg['sent'],
                    ]
                );

                if ($dg['status'] !== null) {
                    Rsvp::updateOrCreate(
                        [
                            'invitation_id' => $invitation->id,
                            'guest_id' => $guest->id,
                        ],
                        [
                            'id' => (string) Str::uuid(),
                            'name' => $guest->name,
                            'is_attending' => $dg['status'],
                            'number_of_guests' => $dg['status'] ? rand(1, 3) : 0,
                            'notes' => $dg['status'] ? 'Insya Allah kami hadir memenuhi undangan.' : 'Mohon maaf berhalangan hadir karena ada agenda dinas luar kota.',
                        ]
                    );
                }
            }

            // 7. Wishes
            $sampleWishes = [
                ['name' => 'Bpk. Ahmad Fauzi', 'msg' => 'Barakallahu lakuma wa baraka alaikuma wa jamaa bainakuma fii khoir. Selamat menempuh hidup baru!'],
                ['name' => 'dr. Sarah Nabila', 'msg' => 'Selamat untuk kedua mempelai! Semoga menjadi keluarga yang sakinah, mawaddah, wa rahmah selamanya.'],
                ['name' => 'Keluarga Besar Sanusi', 'msg' => 'Selamat berbahagia, semoga langgeng sampai kakek nenek dan dilimpahi keturunan yang saleh dan salihah.'],
            ];

            foreach ($sampleWishes as $w) {
                Wish::updateOrCreate(
                    [
                        'invitation_id' => $invitation->id,
                        'name' => $w['name'],
                    ],
                    [
                        'id' => (string) Str::uuid(),
                        'message' => $w['msg'],
                        'is_visible' => true,
                    ]
                );
            }
        }
    }
}
