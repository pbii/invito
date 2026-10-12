import EmptyState from '@/Components/EmptyState';
import Pagination, { PaginationMeta } from '@/Components/Pagination';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Guest, Invitation } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface PaginatedGuests {
    data: Guest[];
    current_page: number;
    from: number | null;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

interface Props {
    invitation: Invitation;
    events?: Array<{
        id: string;
        event_name: string;
        event_type?: { name: string };
        time_start?: string;
        time_end?: string;
    }>;
    guests: PaginatedGuests;
    categories: Record<string, string>;
    stats: {
        total: number;
        sent: number;
        attending: number;
        declined: number;
    };
    filters: {
        search?: string;
        category?: string;
        is_sent?: string;
        rsvp_status?: string;
    };
}

const CATEGORY_LABELS: Record<string, string> = {
    FAMILY: 'Keluarga',
    FRIEND: 'Sahabat / Teman',
    WORK: 'Rekan Kerja / Kantor',
    VIP: 'VIP',
    OTHER: 'Lainnya',
};

export default function GuestsIndex({
    invitation,
    events = [],
    guests,
    categories = {},
    stats = { total: 0, sent: 0, attending: 0, declined: 0 },
    filters = { search: '', category: 'all', is_sent: 'all', rsvp_status: 'all' },
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [isSent, setIsSent] = useState(filters.is_sent || 'all');
    const [rsvpStatus, setRsvpStatus] = useState(filters.rsvp_status || 'all');
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    // Edit modal states
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

    // Form Tambah / Edit Tamu
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        phone: '',
        email: '',
        category: 'FAMILY',
        max_pax: 2,
        event_ids: [] as string[],
    });

    const openEditModal = (guest: Guest) => {
        setEditingGuest(guest);
        setData({
            name: guest.name,
            phone: guest.phone || '',
            email: guest.email || '',
            category: guest.category || 'FAMILY',
            max_pax: guest.max_pax || 2,
            event_ids: guest.events ? (guest.events.map((e) => e.id).filter(Boolean) as string[]) : [],
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('invitation.guests.store', invitation.id), {
            onSuccess: () => reset(),
        });
    };

    const handleUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGuest) return;
        put(route('invitation.guests.update', [invitation.id, editingGuest.id]), {
            onSuccess: () => {
                setEditingGuest(null);
                reset();
            },
        });
    };

    // Debounced filter dispatch
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (
                search !== (filters.search || '') ||
                category !== (filters.category || 'all') ||
                isSent !== (filters.is_sent || 'all') ||
                rsvpStatus !== (filters.rsvp_status || 'all')
            ) {
                router.get(
                    route('invitation.guests.index', invitation.id),
                    {
                        search: search || undefined,
                        category: category !== 'all' ? category : undefined,
                        is_sent: isSent !== 'all' ? isSent : undefined,
                        rsvp_status: rsvpStatus !== 'all' ? rsvpStatus : undefined,
                    },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    }
                );
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, category, isSent, rsvpStatus]);

    const getShareUrl = (token?: string) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return token ? `${origin}/${invitation.slug}?to=${token}` : `${origin}/${invitation.slug}`;
    };

    const handleCopy = (token: string) => {
        navigator.clipboard.writeText(getShareUrl(token));
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2500);
    };

    const getWaLink = (guest: Guest) => {
        if (!guest.phone) return '#';
        const url = getShareUrl(guest.personal_link_token);
        const text = encodeURIComponent(
            `Halo ${guest.name}, kami mengundang Anda untuk hadir di pernikahan kami (${invitation.groom_name} & ${invitation.bride_name}). Silakan buka tautan undangan berikut:\n\n${url}`
        );
        return `https://wa.me/${guest.phone}?text=${text}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-neutral-400">
                            <Link href={route('dashboard')} className="hover:underline">
                                Dashboard
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900 dark:text-white font-medium">Buku Tamu</span>
                        </div>
                        <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Buku Tamu: {invitation.groom_name} &amp; {invitation.bride_name}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('invitation.edit', invitation.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-neutral-200 shadow-2xs hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
                        >
                            Edit Undangan
                        </Link>
                        <a
                            href={`/${invitation.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 dark:bg-neutral-800 border border-transparent dark:border-neutral-700 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-gray-800 dark:hover:bg-neutral-700 transition"
                        >
                            Preview Web
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Kelola Tamu Undangan" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Stats Highlights */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-500">Total Tamu</p>
                            <p className="mt-1 font-serif text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                        <div className="rounded-2xl border border-admin-primary/20 dark:border-neutral-800 bg-admin-primary/5 dark:bg-neutral-900 p-5 shadow-xs">
                            <p className="text-xs font-semibold uppercase tracking-wider text-admin-primary">Undangan Terkirim</p>
                            <p className="mt-1 font-serif text-2xl font-bold text-gray-900 dark:text-white">{stats.sent}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 dark:border-neutral-800 bg-emerald-50/30 dark:bg-neutral-900 p-5 shadow-xs">
                            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Akan Hadir</p>
                            <p className="mt-1 font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.attending}</p>
                        </div>
                        <div className="rounded-2xl border border-rose-100 dark:border-neutral-800 bg-rose-50/30 dark:bg-neutral-900 p-5 shadow-xs">
                            <p className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Berhalangan</p>
                            <p className="mt-1 font-serif text-2xl font-bold text-rose-700 dark:text-rose-400">{stats.declined}</p>
                        </div>
                    </div>

                    {/* Quick Add Guest Card */}
                    <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-admin-primary/10 text-admin-primary">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Tambah Tamu Baru &amp; Alokasi Sesi Acara</h3>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300">Nama Tamu *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Budi Santoso, S.Kom"
                                        className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white px-3 py-2 text-sm shadow-2xs focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300">Nomor WhatsApp</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="628123456789"
                                        className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white px-3 py-2 text-sm shadow-2xs focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                    />
                                    {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300">Kategori</label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white px-3 py-2 text-sm shadow-2xs focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                    >
                                        <option value="FAMILY">Keluarga</option>
                                        <option value="FRIEND">Sahabat / Teman</option>
                                        <option value="WORK">Rekan Kerja / Kantor</option>
                                        <option value="VIP">VIP</option>
                                        <option value="OTHER">Lainnya</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-neutral-300">Maks. Pax (Orang)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={data.max_pax}
                                        onChange={(e) => setData('max_pax', Number(e.target.value))}
                                        className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white px-3 py-2 text-sm shadow-2xs focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                            </div>

                            {/* Session Allocation Selection */}
                            {events.length > 0 && (
                                <div className="pt-2 border-t border-gray-100">
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Sesi Acara yang Boleh Dihadiri Tamu Ini:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {events.map((evt) => {
                                            const isChecked = data.event_ids.includes(evt.id);
                                            return (
                                                <button
                                                    key={evt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = [...data.event_ids];
                                                        const updated = isChecked
                                                            ? current.filter((id) => id !== evt.id)
                                                            : [...current, evt.id];
                                                        setData('event_ids', updated);
                                                    }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                                                        isChecked
                                                            ? 'bg-admin-primary/10 border-admin-primary text-admin-primary font-semibold ring-1 ring-admin-primary'
                                                            : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                                    }`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-admin-primary' : 'bg-gray-300'}`} />
                                                    <span>{evt.event_name}</span>
                                                    {evt.time_start && (
                                                        <span className="text-[10px] text-gray-400">({evt.time_start.slice(0, 5)})</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                        {data.event_ids.length === 0 && (
                                            <span className="text-[11px] text-amber-600 flex items-center">
                                                *Jika tidak ada yang dipilih, tamu dapat melihat semua acara.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-admin-primary px-6 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Data Tamu'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Filter and Search Toolbar */}
                    <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-xs space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                            <div className="sm:col-span-2">
                                <SearchInput
                                    value={search}
                                    onChange={setSearch}
                                    placeholder="Cari nama, WhatsApp, atau email tamu..."
                                />
                            </div>

                            <div>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-700 dark:text-neutral-200 py-2 px-3 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                >
                                    <option value="all">Semua Kategori</option>
                                    <option value="FAMILY">Keluarga</option>
                                    <option value="FRIEND">Sahabat / Teman</option>
                                    <option value="WORK">Rekan Kerja / Kantor</option>
                                    <option value="VIP">VIP</option>
                                    <option value="OTHER">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <select
                                    value={rsvpStatus}
                                    onChange={(e) => setRsvpStatus(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-gray-700 dark:text-neutral-200 py-2 px-3 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                >
                                    <option value="all">Semua Respon RSVP</option>
                                    <option value="attending">Hadir</option>
                                    <option value="declined">Tidak Hadir</option>
                                    <option value="unconfirmed">Belum Konfirmasi</option>
                                </select>
                            </div>
                        </div>

                        {/* Status Kirim Filter Tabs */}
                        <div className="flex items-center gap-2 border-t border-gray-100 dark:border-neutral-800 pt-3">
                            <span className="text-xs font-medium text-gray-400 dark:text-neutral-500">Pengiriman WA:</span>
                            {[
                                { id: 'all', label: 'Semua' },
                                { id: 'false', label: 'Belum Terkirim' },
                                { id: 'true', label: 'Sudah Terkirim' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setIsSent(tab.id)}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                                        isSent === tab.id
                                            ? 'bg-admin-primary text-white shadow-2xs'
                                            : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Guest Table */}
                    {guests.data.length === 0 ? (
                        <EmptyState
                            title="Tidak Ada Tamu Ditemukan"
                            description={
                                search || category !== 'all' || isSent !== 'all' || rsvpStatus !== 'all'
                                    ? 'Coba sesuaikan kata kunci atau ubah pengaturan filter di atas.'
                                    : 'Buku tamu masih kosong. Mulai tambahkan tamu undangan melalui form di atas.'
                            }
                        />
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 dark:divide-neutral-800 text-left text-sm">
                                    <thead className="bg-gray-50/80 dark:bg-neutral-800/80 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                                        <tr>
                                            <th scope="col" className="px-6 py-4">Tamu</th>
                                            <th scope="col" className="px-6 py-4">Sesi Acara &amp; Pax</th>
                                            <th scope="col" className="px-6 py-4">Kontak</th>
                                            <th scope="col" className="px-6 py-4">Kategori</th>
                                            <th scope="col" className="px-6 py-4">Status RSVP</th>
                                            <th scope="col" className="px-6 py-4">Status Kirim</th>
                                            <th scope="col" className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                                        {guests.data.map((guest) => {
                                            const rsvp = guest.rsvp;
                                            const isAttending = rsvp?.confirmation_status === 'ATTENDING';
                                            const isDeclined = rsvp?.confirmation_status === 'DECLINED';

                                            return (
                                                <tr key={guest.id} className="transition hover:bg-neutral-50/60 dark:hover:bg-neutral-800/50">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-gray-900 dark:text-white">{guest.name}</div>
                                                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400 dark:text-neutral-500">
                                                            <span>Token: {guest.personal_link_token || '-'}</span>
                                                            {guest.personal_link_token && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleCopy(guest.personal_link_token!)}
                                                                    className="text-admin-primary hover:underline"
                                                                >
                                                                    {copiedToken === guest.personal_link_token ? 'Tersalin' : 'Salin Link'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-xs">
                                                        <div className="font-medium text-gray-800 dark:text-neutral-200">
                                                            Maks. {guest.max_pax || 2} Pax
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {guest.events && guest.events.length > 0 ? (
                                                                guest.events.map((evt) => (
                                                                    <StatusBadge
                                                                        key={evt.id}
                                                                        variant="neutral"
                                                                        dot={false}
                                                                        className="text-[10px]"
                                                                    >
                                                                        {evt.event_name}
                                                                    </StatusBadge>
                                                                ))
                                                            ) : (
                                                                <span className="text-[11px] text-gray-400 italic">Semua Acara</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-gray-600 dark:text-neutral-300">
                                                        <div>{guest.phone || '-'}</div>
                                                        <div className="text-xs text-gray-400 dark:text-neutral-500">{guest.email || ''}</div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <StatusBadge variant="info" dot={false} className="text-xs">
                                                            {CATEGORY_LABELS[guest.category || ''] || guest.category || 'Lainnya'}
                                                        </StatusBadge>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {isAttending ? (
                                                            <StatusBadge variant="success">Hadir ({rsvp?.pax || 1} pax)</StatusBadge>
                                                        ) : isDeclined ? (
                                                            <StatusBadge variant="danger">Tidak Hadir</StatusBadge>
                                                        ) : (
                                                            <StatusBadge variant="neutral">Belum Konfirmasi</StatusBadge>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                router.patch(
                                                                    route('invitation.guests.toggle-sent', [invitation.id, guest.id]),
                                                                    {},
                                                                    { preserveScroll: true }
                                                                )
                                                            }
                                                            title="Klik untuk mengubah status kirim"
                                                            className="cursor-pointer"
                                                        >
                                                            {guest.is_sent ? (
                                                                <StatusBadge variant="wedding">Terkirim</StatusBadge>
                                                            ) : (
                                                                <StatusBadge variant="warning">Belum</StatusBadge>
                                                            )}
                                                        </button>
                                                    </td>

                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(guest)}
                                                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
                                                                title="Edit Tamu &amp; Sesi"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>

                                                            {guest.phone && (
                                                                <a
                                                                    href={getWaLink(guest)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                                                                    title="Kirim via WhatsApp"
                                                                >
                                                                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.969.53 1.761.799 2.796.799 3.179 0 5.766-2.587 5.767-5.766.001-3.181-2.585-5.785-5.767-5.785zm0 10.372c-.894 0-1.637-.251-2.383-.693l-.17-.101-1.77.464.472-1.724-.112-.178c-.477-.757-.729-1.488-.729-2.374 0-2.541 2.068-4.609 4.609-4.609 2.54 0 4.608 2.068 4.608 4.609 0 2.54-2.068 4.606-4.595 4.606z" />
                                                                    </svg>
                                                                    <span>WA</span>
                                                                </a>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (confirm(`Hapus tamu ${guest.name}?`)) {
                                                                        router.delete(
                                                                            route('invitation.guests.destroy', [invitation.id, guest.id]),
                                                                            { preserveScroll: true }
                                                                        );
                                                                    }
                                                                }}
                                                                className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition"
                                                                title="Hapus Tamu"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paging Component */}
                            <div className="p-4 border-t border-gray-100 dark:border-neutral-800">
                                <Pagination meta={guests as unknown as PaginationMeta} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Edit Tamu & Sesi */}
            {editingGuest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-neutral-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
                            <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-white">
                                Edit Tamu: {editingGuest.name}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setEditingGuest(null)}
                                className="rounded-lg p-1 text-gray-400 hover:text-gray-700 dark:hover:text-neutral-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">Nama Tamu *</label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">Nomor WhatsApp</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">Kategori</label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                    >
                                        <option value="FAMILY">Keluarga</option>
                                        <option value="FRIEND">Sahabat / Teman</option>
                                        <option value="WORK">Rekan Kerja / Kantor</option>
                                        <option value="VIP">VIP</option>
                                        <option value="OTHER">Lainnya</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1">Maks. Pax (Orang)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={data.max_pax}
                                    onChange={(e) => setData('max_pax', Number(e.target.value))}
                                    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                                />
                            </div>

                            {events.length > 0 && (
                                <div className="pt-2 border-t border-gray-100 dark:border-neutral-800">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-2">
                                        Alokasi Sesi Acara:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {events.map((evt) => {
                                            const isChecked = data.event_ids.includes(evt.id);
                                            return (
                                                <button
                                                    key={evt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = [...data.event_ids];
                                                        const updated = isChecked
                                                            ? current.filter((id) => id !== evt.id)
                                                            : [...current, evt.id];
                                                        setData('event_ids', updated);
                                                    }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                                                        isChecked
                                                            ? 'bg-admin-primary/10 border-admin-primary text-admin-primary font-semibold ring-1 ring-admin-primary'
                                                            : 'bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                                    }`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-admin-primary' : 'bg-gray-300'}`} />
                                                    <span>{evt.event_name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {data.event_ids.length === 0 && (
                                        <p className="mt-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                                            *Tamu ini dapat melihat seluruh acara.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingGuest(null)}
                                    className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded-xl bg-admin-primary px-5 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50 transition"
                                >
                                    {processing ? 'Menyimpan...' : 'Perbarui Data Tamu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
