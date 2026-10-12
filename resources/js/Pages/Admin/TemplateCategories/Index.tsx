import EmptyState from '@/Components/EmptyState';
import Pagination, { PaginationMeta } from '@/Components/Pagination';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    templates_count: number;
}

interface Props {
    categories: {
        data: CategoryItem[];
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
    };
}

export default function AdminTemplateCategoriesIndex({ categories, filters = { search: '' } }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(
                    route('admin.template-categories.index'),
                    { search: search || undefined },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [search]);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        description: '',
        sort_order: 0,
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingCategory(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            sort_order: cat.sort_order,
            is_active: cat.is_active,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('admin.template-categories.update', editingCategory.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.template-categories.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (cat: CategoryItem) => {
        if (confirm(`Hapus kategori "${cat.name}"?`)) {
            router.delete(route('admin.template-categories.destroy', cat.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Kategori Template">
            <Head title="Kategori Template - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Daftar Kategori Template</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Kelola klasifikasi tema (Floral, Adat, Modern, Islami, Minimalist).</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-admin-primary/25 hover:brightness-110 transition active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Kategori Baru
                    </button>
                </div>

                <div className="rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md p-4 shadow-xl max-w-md">
                    <SearchInput value={search} onChange={setSearch} placeholder="Cari nama kategori atau slug..." />
                </div>

                {categories.data.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Kategori Ditemukan"
                        description="Sesuaikan kata kunci pencarian Anda untuk melihat data."
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-admin-border text-left text-sm">
                                <thead className="bg-black/20 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3.5">Kategori</th>
                                        <th className="px-6 py-3.5">Total Template</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {categories.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-white">{c.name}</div>
                                                <div className="text-[11px] font-mono text-admin-primary">/{c.slug}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-semibold text-slate-200">
                                                    {c.templates_count || 0}{' '}
                                                    <span className="font-normal text-slate-400">Template</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {c.is_active ? (
                                                    <StatusBadge variant="success">Aktif</StatusBadge>
                                                ) : (
                                                    <StatusBadge variant="danger">Nonaktif</StatusBadge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(c)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                                                        title="Edit Kategori"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(c)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                                        title="Hapus Kategori"
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
                            <Pagination meta={categories as unknown as PaginationMeta} />
                        </div>
                    </div>
                )}

                {/* Modal Create/Edit Category */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="w-full max-w-md rounded-2xl bg-admin-surface p-6 shadow-2xl border border-admin-border text-slate-200">
                            <h3 className="text-base font-bold text-white mb-4">
                                {editingCategory ? 'Edit Kategori Template' : 'Tambah Kategori Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Nama Kategori *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Slug *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Deskripsi</label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
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
                                        <span className="font-medium text-zinc-300">Kategori Aktif</span>
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
                                        {processing ? 'Menyimpan...' : 'Simpan Kategori'}
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
