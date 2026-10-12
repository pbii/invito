import EmptyState from "@/Components/EmptyState";
import Pagination, { PaginationMeta } from "@/Components/Pagination";
import SearchInput from "@/Components/SearchInput";
import StatusBadge from "@/Components/StatusBadge";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Invitation } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import React, { useEffect, useState } from "react";

interface PaginatedInvitations {
    data: Invitation[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

interface CoupleDashboardProps {
    invitations: PaginatedInvitations;
    filters?: {
        search?: string;
        status?: string;
    };
    statistics: {
        total_invitations: number;
        total_guests: number;
        total_rsvps: number;
    };
}

export default function CoupleDashboard({
    invitations,
    filters = { search: "", status: "all" },
    statistics = { total_invitations: 0, total_guests: 0, total_rsvps: 0 },
}: CoupleDashboardProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [status, setStatus] = useState(filters.status || "all");
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    // Debounced search handling
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (
                search !== (filters.search || "") ||
                status !== (filters.status || "all")
            ) {
                router.get(
                    route("dashboard"),
                    {
                        search: search || undefined,
                        status: status !== "all" ? status : undefined,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, status]);

    const handleCopyLink = (slug: string) => {
        const url = `${window.location.origin}/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2500);
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const isExpired = (expiresAt?: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-serif text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Dashboard Undangan
                        </h2>
                    </div>
                    <Link
                        href={route("invitation.create")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-admin-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-admin-primary/25 transition-all hover:brightness-110 active:scale-95"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Buat Undangan Baru
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard Mempelai" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Metrics Banner */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="relative overflow-hidden rounded-2xl border border-admin-primary/20 dark:border-neutral-800 bg-linear-to-br from-white to-admin-primary/5 dark:from-neutral-900 dark:to-neutral-900/80 p-6 shadow-xs transition hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-admin-primary/10 dark:bg-admin-primary/20 text-admin-primary">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                                        Total Undangan
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-sans text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                            {statistics.total_invitations}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-neutral-500">
                                            tema aktif
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-sky-100 dark:border-neutral-800 bg-linear-to-br from-white to-sky-50/30 dark:from-neutral-900 dark:to-neutral-900/80 p-6 shadow-xs transition hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                                        Buku Tamu
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-sans text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                            {statistics.total_guests}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-neutral-500">
                                            tamu terdaftar
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 dark:border-neutral-800 bg-linear-to-br from-white to-emerald-50/30 dark:from-neutral-900 dark:to-neutral-900/80 p-6 shadow-xs transition hover:shadow-md">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                                        Konfirmasi RSVP
                                    </p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-sans text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                            {statistics.total_rsvps}
                                        </span>
                                        <span className="text-xs text-gray-400 dark:text-neutral-500">
                                            respons tamu
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                        <div className="w-full sm:max-w-md">
                            <SearchInput
                                value={search}
                                onChange={setSearch}
                                placeholder="Cari judul, mempelai, atau tautan slug..."
                            />
                        </div>

                        {/* Status Filters */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-gray-400 dark:text-neutral-500 mr-1">
                                Status:
                            </span>
                            {[
                                { id: "all", label: "Semua" },
                                { id: "active", label: "Aktif" },
                                { id: "expired", label: "Kadaluwarsa" },
                                { id: "draft", label: "Draft" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setStatus(tab.id)}
                                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                                        status === tab.id
                                            ? "bg-admin-primary text-white shadow-xs"
                                            : "bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Invitation Cards Grid */}
                    {invitations.data.length === 0 ? (
                        <EmptyState
                            title="Tidak Ada Undangan Ditemukan"
                            description={
                                search || status !== "all"
                                    ? "Coba sesuaikan kata kunci pencarian atau ubah filter status di atas."
                                    : "Anda belum memiliki undangan digital. Mulai dengan membuat undangan pernikahan pertama Anda!"
                            }
                            action={
                                <Link
                                    href={route("invitation.create")}
                                    className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-4 py-2 text-sm font-semibold text-white shadow-xs hover:brightness-110"
                                >
                                    Buat Undangan Sekarang
                                </Link>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {invitations.data.map((invitation) => {
                                const expired = isExpired(
                                    invitation.expires_at,
                                );

                                return (
                                    <div
                                        key={invitation.id}
                                        className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-admin-primary/40 dark:hover:border-neutral-700 hover:shadow-xl hover:shadow-admin-primary/5"
                                    >
                                        <div>
                                            {/* Header Card / Thumbnail Banner */}
                                            <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                <img
                                                    src={
                                                        invitation.template?.thumbnail_url ||
                                                        "/images/templates/modern-floral.jpg"
                                                    }
                                                    alt={
                                                        invitation.template?.name ||
                                                        "Undangan Pernikahan"
                                                    }
                                                    onError={(e) => {
                                                        const target = e.currentTarget;
                                                        target.onerror = null;
                                                        target.src =
                                                            "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80";
                                                    }}
                                                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

                                                {/* Status Badges on Image */}
                                                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                                    {expired ? (
                                                        <StatusBadge variant="danger">
                                                            Kadaluwarsa
                                                        </StatusBadge>
                                                    ) : invitation.is_published ? (
                                                        <StatusBadge variant="success">
                                                            Aktif
                                                        </StatusBadge>
                                                    ) : (
                                                        <StatusBadge variant="neutral">
                                                            Draft
                                                        </StatusBadge>
                                                    )}
                                                    {invitation.package
                                                        ?.badge && (
                                                        <span className="rounded-full bg-black/40 backdrop-blur-xs px-2.5 py-0.5 text-xs font-semibold text-white">
                                                            {
                                                                invitation
                                                                    .package
                                                                    .badge
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Names Overlay */}
                                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                                    <h3 className="font-serif text-lg font-bold leading-snug drop-shadow-xs">
                                                        {invitation.groom_name}{" "}
                                                        &amp;{" "}
                                                        {invitation.bride_name}
                                                    </h3>
                                                    <p className="text-xs text-white/80 line-clamp-1">
                                                        Pernikahan{" "}
                                                        {invitation.groom_name}{" "}
                                                        &amp;{" "}
                                                        {invitation.bride_name}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Details Body */}
                                            <div className="p-5 space-y-4">
                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 border-b border-gray-100 dark:border-neutral-800 pb-3">
                                                    <span>
                                                        Tautan Undangan:
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleCopyLink(
                                                                invitation.slug,
                                                            )
                                                        }
                                                        className="font-mono text-admin-primary hover:brightness-125 hover:underline flex items-center gap-1 font-semibold"
                                                    >
                                                        /{invitation.slug}
                                                        <span className="text-[10px] bg-admin-primary/10 dark:bg-admin-primary/20 text-admin-primary px-2 py-0.5 rounded-full font-mono font-medium">
                                                            {copiedSlug ===
                                                            invitation.slug
                                                                ? "Tersalin!"
                                                                : "Salin"}
                                                        </span>
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-center">
                                                    <div className="rounded-xl bg-gray-50 dark:bg-neutral-800/80 p-2.5">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
                                                            Tamu
                                                        </span>
                                                        <span className="font-semibold text-gray-800 dark:text-neutral-100 text-sm">
                                                            {invitation.guests_count ||
                                                                0}{" "}
                                                            Orang
                                                        </span>
                                                    </div>
                                                    <div className="rounded-xl bg-gray-50 dark:bg-neutral-800/80 p-2.5">
                                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500 block">
                                                            Konfirmasi RSVP
                                                        </span>
                                                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                                                            {invitation.rsvps_count ||
                                                                0}{" "}
                                                            Respon
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-neutral-500 pt-1">
                                                    <span>Berlaku hingga:</span>
                                                    <span className="font-medium text-gray-600 dark:text-neutral-300">
                                                        {formatDate(
                                                            invitation.expires_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Footer */}
                                        <div className="border-t border-gray-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 p-4 flex items-center justify-between gap-2">
                                            <a
                                                href={`/${invitation.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-neutral-200 shadow-2xs hover:bg-gray-50 dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white transition"
                                                title="Lihat Website Undangan"
                                            >
                                                <svg
                                                    className="h-3.5 w-3.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                    />
                                                </svg>
                                                Preview
                                            </a>

                                            <div className="flex items-center gap-1.5">
                                                <Link
                                                    href={route(
                                                        "invitation.guests.index",
                                                        invitation.id,
                                                    )}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-admin-primary/20 bg-admin-primary/10 dark:bg-admin-primary/20 px-3 py-2 text-xs font-semibold text-admin-primary transition hover:bg-admin-primary/15 dark:hover:bg-admin-primary/30"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5"
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
                                                    Tamu
                                                </Link>
                                                <Link
                                                    href={route(
                                                        "invitation.edit",
                                                        invitation.id,
                                                    )}
                                                    className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 dark:bg-neutral-800 border border-transparent dark:border-neutral-700 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-gray-800 dark:hover:bg-neutral-700"
                                                >
                                                    <svg
                                                        className="h-3.5 w-3.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pagination */}
                    <Pagination
                        meta={invitations as unknown as PaginationMeta}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
