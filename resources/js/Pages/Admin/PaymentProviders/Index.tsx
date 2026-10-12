import EmptyState from '@/Components/EmptyState';
import Pagination, { PaginationMeta } from '@/Components/Pagination';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface ProviderItem {
    id: string;
    name: string;
    code: string;
    type: 'BANK' | 'EWALLET' | 'QRIS';
    logo_url: string | null;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    providers: {
        data: ProviderItem[];
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
        type?: string;
    };
}

export default function AdminPaymentProvidersIndex({ providers, filters = { search: '', type: 'all' } }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || 'all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<ProviderItem | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '') || type !== (filters.type || 'all')) {
                router.get(
                    route('admin.payment-providers.index'),
                    { search: search || undefined, type: type !== 'all' ? type : undefined },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, type]);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        code: '',
        type: 'BANK' as 'BANK' | 'EWALLET' | 'QRIS',
        logo_url: '',
        sort_order: 0,
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingProvider(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (p: ProviderItem) => {
        setEditingProvider(p);
        setData({
            name: p.name,
            code: p.code,
            type: p.type,
            logo_url: p.logo_url || '',
            sort_order: p.sort_order,
            is_active: p.is_active,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProvider) {
            put(route('admin.payment-providers.update', editingProvider.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.payment-providers.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (p: ProviderItem) => {
        if (confirm(`Hapus provider "${p.name}"?`)) {
            router.delete(route('admin.payment-providers.destroy', p.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Metode Pembayaran">
            <Head title="Metode Pembayaran - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Penyedia Layanan Bank &amp; E-Wallet</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Daftar bank &amp; dompet digital yang dapat dipilih pengantin untuk amplop pernikahan.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-admin-primary/25 hover:brightness-110 transition active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Metode Baru
                    </button>
                </div>

                <div className="rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                    <div>
                        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama bank, kode..." />
                    </div>
                    <div>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full rounded-xl border border-admin-border bg-black/40 py-2 px-3 text-xs text-zinc-200 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                        >
                            <option value="all">Semua Tipe Saluran</option>
                            <option value="BANK">Transfer Bank</option>
                            <option value="EWALLET">E-Wallet</option>
                            <option value="QRIS">QRIS</option>
                        </select>
                    </div>
                </div>

                {providers.data.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Metode Pembayaran Ditemukan"
                        description="Sesuaikan filter pencarian untuk melihat data saluran pembayaran."
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/[0.06] text-left text-sm">
                                <thead className="bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                                    <tr>
                                        <th className="px-6 py-3.5">Nama Provider</th>
                                        <th className="px-6 py-3.5">Kode Unik</th>
                                        <th className="px-6 py-3.5">Tipe Saluran</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {providers.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                                            <td className="px-6 py-4 font-semibold text-zinc-100">
                                                {p.name}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">
                                                <StatusBadge variant="danger" dot={false} className="font-mono text-[10px] font-bold">
                                                    {p.code}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge
                                                    variant={p.type === 'BANK' ? 'info' : p.type === 'EWALLET' ? 'success' : 'warning'}
                                                    dot={false}
                                                    className="font-mono text-[10px]"
                                                >
                                                    {p.type}
                                                </StatusBadge>
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
                                                        className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
                                                        title="Edit Provider"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(p)}
                                                        className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                                        title="Hapus Provider"
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

                        <div className="p-4 border-t border-white/[0.06]">
                            <Pagination meta={providers as unknown as PaginationMeta} />
                        </div>
                    </div>
                )}

                {/* Modal Create/Edit Payment Provider (Dark Glass) */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="w-full max-w-md rounded-2xl bg-[#12151E] p-6 shadow-2xl border border-white/[0.1] text-zinc-200">
                            <h3 className="text-base font-bold text-white mb-4">
                                {editingProvider ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Nama Provider / Bank *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Bank Central Asia (BCA)"
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-zinc-300 mb-1">Kode Unik *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            placeholder="BCA"
                                            className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-zinc-300 mb-1">Tipe Saluran *</label>
                                        <select
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value as 'BANK' | 'EWALLET' | 'QRIS')}
                                            className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        >
                                            <option value="BANK">Bank Transfer</option>
                                            <option value="EWALLET">E-Wallet</option>
                                            <option value="QRIS">QRIS</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">URL Logo</label>
                                    <input
                                        type="text"
                                        value={data.logo_url}
                                        onChange={(e) => setData('logo_url', e.target.value)}
                                        placeholder="/images/payments/bca.png"
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded text-admin-primary focus:ring-admin-primary bg-zinc-900 border-white/[0.2]"
                                        />
                                        <span className="font-medium text-zinc-300">Metode Aktif</span>
                                    </label>
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="rounded-xl border border-white/[0.1] px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50 transition shadow-md shadow-admin-primary/20"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Metode'}
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
