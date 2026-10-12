import ApplicationLogo from "@/Components/ApplicationLogo";
import EmptyState from "@/Components/EmptyState";
import SearchInput from "@/Components/SearchInput";
import { Package, PageProps, Template, TemplateCategory } from "@/types";
import { Head, Link, usePage } from "@inertiajs/react";
import React, { useMemo, useState } from "react";

interface WelcomeProps extends PageProps {
    canLogin: boolean;
    canRegister: boolean;
    templates?: Template[];
    categories?: TemplateCategory[];
    packages?: Package[];
}

export default function Welcome({
    auth,
    canLogin,
    canRegister,
    templates = [],
    categories = [],
    packages = [],
}: WelcomeProps) {
    const { branding } = usePage<PageProps>().props;
    const appName = branding?.app_name || "WedInvite";
    const appTagline = branding?.app_tagline || "Undangan Pernikahan Online Mewah & Elegan";

    const [searchTemplate, setSearchTemplate] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(
        null,
    );

    // Filter templates based on search & category
    const filteredTemplates = useMemo(() => {
        return templates.filter((tpl) => {
            const matchesSearch =
                !searchTemplate ||
                tpl.name.toLowerCase().includes(searchTemplate.toLowerCase()) ||
                (tpl.description &&
                    tpl.description
                        .toLowerCase()
                        .includes(searchTemplate.toLowerCase()));

            const matchesCategory =
                selectedCategory === "all" ||
                tpl.categories?.some(
                    (c) =>
                        c.slug === selectedCategory ||
                        c.id === selectedCategory,
                );

            return matchesSearch && matchesCategory;
        });
    }, [templates, searchTemplate, selectedCategory]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-neutral-50/70 text-gray-800 font-sans selection:bg-admin-primary/20 selection:text-admin-primary">
            <Head title={`${appName} - ${appTagline}`} />

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/">
                        <ApplicationLogo />
                    </Link>

                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                        <a
                            href="#features"
                            className="hover:text-admin-primary transition"
                        >
                            Fitur
                        </a>
                        <a
                            href="#templates"
                            className="hover:text-admin-primary transition"
                        >
                            Pilihan Desain
                        </a>
                        <a
                            href="#pricing"
                            className="hover:text-admin-primary transition"
                        >
                            Paket Harga
                        </a>
                    </nav>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={
                                    auth.user.role === "SUPER_ADMIN"
                                        ? route("admin.dashboard")
                                        : route("dashboard")
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-admin-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:brightness-110 transition"
                            >
                                {auth.user.role === "SUPER_ADMIN"
                                    ? "Control Panel"
                                    : "Buka Dashboard"}
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </Link>
                        ) : (
                            <>
                                {canLogin && (
                                    <Link
                                        href={route("login")}
                                        className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 transition"
                                    >
                                        Masuk
                                    </Link>
                                )}
                                {canRegister && (
                                    <Link
                                        href={route("register")}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-admin-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:brightness-110 transition"
                                    >
                                        Mulai Gratis
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 sm:py-28">
                <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-radial from-admin-primary/15 via-admin-secondary/10 to-transparent blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                        Bagikan Momen Bahagia Anda{" "}
                        <br className="hidden sm:inline" />
                        dengan Sentuhan{" "}
                        <span className="text-admin-primary italic">
                            Mewah &amp; Penuh Cerita
                        </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed">
                        Ciptakan website undangan digital interaktif dalam
                        hitungan menit. Dilengkapi audio otomatis, amplop
                        digital, RSVP instan via WhatsApp, dan galeri beresolusi
                        tinggi.
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href={
                                auth.user
                                    ? auth.user.role === "SUPER_ADMIN"
                                        ? route("admin.dashboard")
                                        : route("dashboard")
                                    : route("register")
                            }
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-admin-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-admin-primary/25 transition hover:brightness-110 active:scale-95"
                        >
                            {auth.user && auth.user.role === "SUPER_ADMIN"
                                ? "Masuk ke Control Panel"
                                : "Buat Undangan Sekarang"}
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </Link>
                        <a
                            href="#templates"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition"
                        >
                            Jelajahi Template
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Highlight */}
            <section
                id="features"
                className="py-16 bg-white border-y border-gray-100"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-xl mx-auto mb-12">
                        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
                            Mengundang dengan Hangat dan Penuh Penghormatan
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-gray-500">
                            Setiap detail dirancang agar keluarga, sahabat, dan kerabat
                            merasa dihargai sejak pertama kali membuka undangan Anda.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-2xl border border-gray-100 p-6 bg-neutral-50/50 hover:bg-white hover:border-wedding-200 transition shadow-2xs">
                            <div className="w-10 h-10 rounded-xl bg-wedding-100 text-wedding-600 flex items-center justify-center mb-4">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base mb-2">
                                Undangan Personal untuk Setiap Tamu
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Cantumkan nama tamu dan kuota keluarga secara khusus di sampul depan.
                                Kirimkan tautan personal lewat WhatsApp dengan sapaan yang santun dan rapi.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 p-6 bg-neutral-50/50 hover:bg-white hover:border-wedding-200 transition shadow-2xs">
                            <div className="w-10 h-10 rounded-xl bg-champagne-200 text-champagne-800 flex items-center justify-center mb-4">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base mb-2">
                                Tanda Kasih &amp; Doa Restu
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Memudahkan kerabat yang ingin menyampaikan bingkisan atau tanda kasih
                                nontunai lewat transfer bank, e-wallet, maupun scan QRIS langsung di halaman undangan.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 p-6 bg-neutral-50/50 hover:bg-white hover:border-wedding-200 transition shadow-2xs">
                            <div className="w-10 h-10 rounded-xl bg-wedding-100 text-wedding-600 flex items-center justify-center mb-4">
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                    />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base mb-2">
                                Alunan Musik &amp; Sampul Pembuka
                            </h3>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Hadirkan kesan khidmat sejak detik pertama. Musik pengiring favorit Anda
                                langsung mengalun lembut begitu tamu menekan tombol buka undangan di ponsel mereka.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Template Gallery with Search & Filters */}
            <section id="templates" className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-admin-primary">
                                Koleksi Eksklusif
                            </span>
                            <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-gray-900">
                                Pilihan Desain &amp; Tema Undangan
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                Cari dan saring katalog template undangan dengan
                                sentuhan estetika pilihan.
                            </p>
                        </div>

                        {/* Search Input for Templates */}
                        <div className="w-full sm:w-72">
                            <SearchInput
                                value={searchTemplate}
                                onChange={setSearchTemplate}
                                placeholder="Cari nama atau gaya tema..."
                            />
                        </div>
                    </div>

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory("all")}
                            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                selectedCategory === "all"
                                    ? "bg-admin-primary text-white shadow-xs"
                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            Semua Tema ({templates.length})
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() =>
                                    setSelectedCategory(cat.slug || cat.id)
                                }
                                className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                                    selectedCategory === (cat.slug || cat.id)
                                        ? "bg-admin-primary text-white shadow-xs"
                                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Template Grid */}
                    {filteredTemplates.length === 0 ? (
                        <EmptyState
                            title="Tidak Ada Desain Yang Sesuai"
                            description="Coba ubah kata kunci pencarian atau pilih kategori tema yang berbeda."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-wedding-200 hover:shadow-xl"
                                >
                                    <div className="relative aspect-[2/1] w-full overflow-hidden bg-gray-100">
                                        <img
                                            src={
                                                template.thumbnail_url ||
                                                "/images/templates/modern-floral.jpg"
                                            }
                                            alt={template.name}
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.onerror = null;
                                                target.src =
                                                    "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80";
                                            }}
                                            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPreviewTemplate(template)
                                                }
                                                className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-gray-900 shadow-md hover:bg-gray-50 transition"
                                            >
                                                Pratinjau
                                            </button>
                                            <Link
                                                href={route(
                                                    "invitation.create",
                                                )}
                                                className="rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 transition"
                                            >
                                                Gunakan Desain
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-serif text-lg font-bold text-gray-900">
                                                {template.name}
                                            </h3>
                                            <span className="text-[10px] font-semibold text-admin-primary bg-admin-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                Tersedia
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                            {template.description ||
                                                "Desain undangan premium dengan tata letak responsif dan animasi lembut."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Pricing Section */}
            {packages.length > 0 && (
                <section
                    id="pricing"
                    className="py-20 bg-white border-t border-gray-100"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-xl mx-auto mb-14">
                            <span className="text-xs font-bold uppercase tracking-widest text-admin-primary">
                                Investasi Bahagia
                            </span>
                            <h2 className="mt-1 font-serif text-3xl font-bold text-gray-900">
                                Pilihan Paket Sesuai Kebutuhan Anda
                            </h2>
                            <p className="mt-2 text-xs sm:text-sm text-gray-500">
                                Tanpa biaya tersembunyi. Dapatkan seluruh fitur
                                terbaik untuk perayaan sekali seumur hidup.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {packages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className={`relative flex flex-col justify-between rounded-3xl p-8 border transition ${
                                        pkg.badge
                                            ? "border-admin-primary shadow-xl shadow-admin-primary/10 bg-white ring-2 ring-admin-primary"
                                            : "border-gray-100 bg-white shadow-xs hover:border-gray-200"
                                    }`}
                                >
                                    {pkg.badge && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-admin-primary px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                                            {pkg.badge}
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="font-serif text-xl font-bold text-gray-900">
                                            {pkg.name}
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                                            {pkg.description}
                                        </p>

                                        <div className="mt-6 flex items-baseline gap-1">
                                            <span className="font-sans text-3xl font-extrabold tracking-tight text-gray-900">
                                                {formatPrice(pkg.price)}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                / selamanya
                                            </span>
                                        </div>

                                        <ul className="mt-6 space-y-3 text-xs text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4 text-emerald-500 shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Maksimal{" "}
                                                {pkg.max_invitations ?? 1}{" "}
                                                website undangan
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4 text-emerald-500 shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Masa aktif {pkg.duration_days}{" "}
                                                hari
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4 text-emerald-500 shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Maksimal {pkg.max_guests} tamu
                                                undangan
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg
                                                    className="w-4 h-4 text-emerald-500 shrink-0"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                Upload hingga {pkg.max_photos}{" "}
                                                foto galeri
                                            </li>
                                            {pkg.allow_digital_envelope && (
                                                <li className="flex items-center gap-2">
                                                    <svg
                                                        className="w-4 h-4 text-emerald-500 shrink-0"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Amplop digital &amp; QRIS
                                                </li>
                                            )}
                                            {pkg.allow_custom_music && (
                                                <li className="flex items-center gap-2">
                                                    <svg
                                                        className="w-4 h-4 text-emerald-500 shrink-0"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Musik kustom latar belakang
                                                </li>
                                            )}
                                        </ul>
                                    </div>

                                    <div className="mt-8">
                                        <Link
                                            href={
                                                auth.user
                                                    ? route("invitation.create")
                                                    : route("register")
                                            }
                                            className={`w-full inline-flex items-center justify-center rounded-xl py-3 text-xs font-semibold transition ${
                                                pkg.badge
                                                    ? "bg-admin-primary text-white shadow-xs hover:brightness-110"
                                                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                            }`}
                                        >
                                            Pilih {pkg.name}
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400">
                    <p className="font-serif text-lg font-bold text-gray-800 mb-2">
                        {appName}
                    </p>
                    <p className="max-w-md mx-auto mb-6">
                        Solusi terbaik undangan digital pernikahan masa kini
                        dengan performa cepat, tampilan elegan, dan kontrol
                        penuh mempelai.
                    </p>
                    <p>
                        &copy; {new Date().getFullYear()} {appName} &bull; Hak
                        Cipta Dilindungi.
                    </p>
                </div>
            </footer>

            {/* Template Interactive Preview Modal */}
            {previewTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <div className="flex items-center gap-2.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-admin-primary" />
                                <h3 className="font-serif text-lg font-bold text-gray-900">
                                    Pratinjau Desain: {previewTemplate.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPreviewTemplate(null)}
                                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-6 space-y-4">
                            <div className="relative aspect-[16/9] max-h-72 w-full overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/60 shadow-inner">
                                <img
                                    src={
                                        previewTemplate.thumbnail_url ||
                                        "/images/templates/modern-floral.jpg"
                                    }
                                    alt={previewTemplate.name}
                                    onError={(e) => {
                                        const target = e.currentTarget;
                                        target.onerror = null;
                                        target.src =
                                            "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80";
                                    }}
                                    className="h-full w-full object-cover object-top"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    {previewTemplate.categories?.map((c) => (
                                        <span
                                            key={c.id}
                                            className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-700"
                                        >
                                            {c.name}
                                        </span>
                                    ))}
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-100">
                                        Tersedia di Seluruh Paket
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {previewTemplate.description ||
                                        "Desain undangan pernikahan premium yang responsif dengan animasi estetik, audio latar, hitung mundur, galeri foto, amplop digital, dan buku tamu RSVP interaktif."}
                                </p>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/50">
                            <button
                                type="button"
                                onClick={() => setPreviewTemplate(null)}
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                            >
                                Tutup
                            </button>
                            <Link
                                href={route("invitation.create")}
                                className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-admin-primary/20 hover:brightness-110 transition"
                            >
                                Gunakan Desain Ini
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
