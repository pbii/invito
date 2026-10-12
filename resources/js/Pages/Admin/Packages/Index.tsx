import EmptyState from '@/Components/EmptyState';
import Pagination, { PaginationMeta } from '@/Components/Pagination';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface PackageItem {
    id: string;
    name: string;
    badge: string | null;
    price: number;
    duration_days: number;
    max_guests: number | null;
    max_invitations: number | null;
    max_photos: number;
    max_music: number;
    is_active: boolean;
    is_popular: boolean;
    invitations_count: number;
    description: string | null;
}

interface Props {
    packages: {
        data: PackageItem[];
        current_page: number;
        from: number | null;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

export default function AdminPackagesIndex({ packages, filters = { search: '', sort: 'sort_order', direction: 'asc' } }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('admin.packages.index'),
                    { search: search || undefined, sort: filters.sort, direction: filters.direction },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [search]);

    const handleSort = (column: string) => {
        const nextDir = filters.sort === column && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route('admin.packages.index'),
            { search: search || undefined, sort: column, direction: nextDir },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        badge: '',
        price: 0,
        duration_days: 90,
        max_invitations: 1 as number | null,
        max_guests: null as number | null,
        max_photos: 5,
        max_music: 1,
        is_active: true,
        is_popular: false,
        description: '',
    });

    const openCreateModal = () => {
        setEditingPackage(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (pkg: PackageItem) => {
        setEditingPackage(pkg);
        setData({
            name: pkg.name,
            badge: pkg.badge || '',
            price: pkg.price,
            duration_days: pkg.duration_days,
            max_invitations: pkg.max_invitations ?? 1,
            max_guests: pkg.max_guests,
            max_photos: pkg.max_photos,
            max_music: pkg.max_music,
            is_active: pkg.is_active,
            is_popular: pkg.is_popular,
            description: pkg.description || '',
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPackage) {
            put(route('admin.packages.update', editingPackage.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.packages.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (pkg: PackageItem) => {
        if (confirm(`Hapus paket "${pkg.name}"?`)) {
            router.delete(route('admin.packages.destroy', pkg.id), { preserveScroll: true });
        }
    };

    const formatPrice = (p: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(p);
    };

    return (
        <AdminLayout title="Paket & Harga">
            <Head title="Paket & Harga - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Daftar Paket Langganan</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Konfigurasi kuota resource, masa aktif, dan harga paket pernikahan.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-admin-primary/25 hover:brightness-110 transition active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Paket Baru
                    </button>
                </div>

                {/* Search Bar */}
                <div className="rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md p-4 shadow-xl max-w-md">
                    <SearchInput value={search} onChange={setSearch} placeholder="Cari nama paket atau badge promosi..." />
                </div>

                {packages.data.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Paket Ditemukan"
                        description="Sesuaikan kata kunci pencarian Anda untuk menampilkan data paket."
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-admin-border text-left text-sm">
                                <thead className="bg-black/20 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3.5 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                                            Nama Paket
                                        </th>
                                        <th className="px-6 py-3.5 cursor-pointer hover:text-white" onClick={() => handleSort('price')}>
                                            Harga
                                        </th>
                                        <th className="px-6 py-3.5">Masa Aktif</th>
                                        <th className="px-6 py-3.5">Batas Kuota</th>
                                        <th className="px-6 py-3.5 cursor-pointer hover:text-white" onClick={() => handleSort('is_popular')}>
                                            Populer
                                        </th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {packages.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-100">{p.name}</div>
                                                {p.badge && (
                                                    <div className="mt-1">
                                                        <StatusBadge variant="warning" dot={false} className="text-[10px] font-mono">
                                                            {p.badge}
                                                        </StatusBadge>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-mono font-semibold text-slate-200 text-xs">
                                                {formatPrice(p.price)}
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                                {p.duration_days} Hari
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400">
                                                <div className="font-semibold text-slate-200">
                                                    {p.max_invitations ? `${p.max_invitations} Website Undangan` : '1 Website Undangan'}
                                                </div>
                                                <div>{p.max_guests ? `${p.max_guests} Tamu` : 'Tamu Unlimited'}</div>
                                                <div className="text-[11px] text-slate-400">{p.max_photos} Foto &bull; {p.max_music} Musik</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.is_popular ? (
                                                    <StatusBadge variant="warning">Populer</StatusBadge>
                                                ) : (
                                                    <span className="text-slate-500 font-mono">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.is_active ? (
                                                    <StatusBadge variant="success">Aktif</StatusBadge>
                                                ) : (
                                                    <StatusBadge variant="danger">Nonaktif</StatusBadge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(p)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                                                        title="Edit Paket"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(p)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                                        title="Hapus Paket"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 border-t border-admin-border">
                            <Pagination meta={packages as unknown as PaginationMeta} />
                        </div>
                    </div>
                )}

                {/* Modal Create/Edit Package */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="w-full max-w-lg rounded-2xl bg-admin-surface p-6 shadow-2xl border border-admin-border text-slate-200 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-base font-bold text-white mb-4">
                                {editingPackage ? 'Edit Paket Layanan' : 'Tambah Paket Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-300 mb-1">Nama Paket *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-300 mb-1">Badge Promosi</label>
                                        <input
                                            type="text"
                                            value={data.badge}
                                            onChange={(e) => setData('badge', e.target.value)}
                                            placeholder="Populer / Promo"
                                            className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-300 mb-1">Harga (IDR) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={data.price}
                                            onChange={(e) => setData('price', Number(e.target.value))}
                                            className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-300 mb-1">Masa Aktif (Hari) *</label>
                                        <input
                                            type="number"
                                            required
                                            value={data.duration_days}
                                            onChange={(e) => setData('duration_days', Number(e.target.value))}
                                            className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-300 mb-1">Maks Undangan *</label>
                                        <input
                                            type="number"
                                            required
                                            min={1}
                                            value={data.max_invitations ?? 1}
                                            onChange={(e) => setData('max_invitations', e.target.value ? Number(e.target.value) : 1)}
                                            placeholder="Default = 1"
                                            className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-300 mb-1">Maks Tamu</label>
                                        <input
                                            type="number"
                                            value={data.max_guests ?? ''}
                                            onChange={(e) => setData('max_guests', e.target.value ? Number(e.target.value) : null)}
                                            placeholder="Kosong = Unlimited"
                                            className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-300 mb-1">Maks Foto *</label>
                                        <input
                                            type="number"
                                            required
                                            value={data.max_photos}
                                            onChange={(e) => setData('max_photos', Number(e.target.value))}
                                            className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-300 mb-1">Maks Musik *</label>
                                        <input
                                            type="number"
                                            required
                                            value={data.max_music}
                                            onChange={(e) => setData('max_music', Number(e.target.value))}
                                            className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Deskripsi Paket</label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>

                                <div className="flex items-center gap-6 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_popular}
                                            onChange={(e) => setData('is_popular', e.target.checked)}
                                            className="rounded text-admin-primary focus:ring-admin-primary bg-black/40 border-admin-border"
                                        />
                                        <span className="font-medium text-slate-300">Tandai Populer</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded text-admin-primary focus:ring-admin-primary bg-black/40 border-admin-border"
                                        />
                                        <span className="font-medium text-slate-300">Paket Aktif</span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-admin-border">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="rounded-xl border border-admin-border px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05]"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50 transition shadow-md shadow-admin-primary/20"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Paket'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
