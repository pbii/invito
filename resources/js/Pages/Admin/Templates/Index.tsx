import EmptyState from '@/Components/EmptyState';
import Pagination, { PaginationMeta } from '@/Components/Pagination';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface TemplateItem {
    id: string;
    name: string;
    slug: string;
    component_name: string;
    thumbnail_url: string | null;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    invitations_count: number;
    categories?: Array<{ id: string; name: string }>;
}

interface Props {
    templates: {
        data: TemplateItem[];
        current_page: number;
        from: number | null;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
    categories: Array<{ id: string; name: string }>;
    filters: {
        search?: string;
        category_id?: string;
    };
}

export default function AdminTemplatesIndex({ templates, categories = [], filters = { search: '', category_id: 'all' } }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || 'all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '') || categoryId !== (filters.category_id || 'all')) {
                router.get(
                    route('admin.templates.index'),
                    { search: search || undefined, category_id: categoryId !== 'all' ? categoryId : undefined },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, categoryId]);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        slug: '',
        component_name: '',
        thumbnail_url: '',
        description: '',
        sort_order: 0,
        is_active: true,
        category_ids: [] as string[],
    });

    const openCreateModal = () => {
        setEditingTemplate(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (tpl: TemplateItem) => {
        setEditingTemplate(tpl);
        setData({
            name: tpl.name,
            slug: tpl.slug,
            component_name: tpl.component_name,
            thumbnail_url: tpl.thumbnail_url || '',
            description: tpl.description || '',
            sort_order: tpl.sort_order,
            is_active: tpl.is_active,
            category_ids: tpl.categories ? tpl.categories.map((c) => c.id) : [],
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTemplate) {
            put(route('admin.templates.update', editingTemplate.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.templates.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (tpl: TemplateItem) => {
        if (confirm(`Hapus template "${tpl.name}"?`)) {
            router.delete(route('admin.templates.destroy', tpl.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Katalog Template">
            <Head title="Katalog Template - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Daftar Template Undangan</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Kelola komponen tema React, thumbnail, dan kategori.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-admin-primary/25 hover:brightness-110 transition active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Template Baru
                    </button>
                </div>

                <div className="rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                    <div>
                        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama template, slug..." />
                    </div>
                    <div>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-xl border border-admin-border bg-black/40 py-2 px-3 text-xs text-slate-200 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {templates.data.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Template Ditemukan"
                        description="Sesuaikan kata kunci pencarian Anda untuk menampilkan tema."
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-admin-border text-left text-sm">
                                <thead className="bg-black/20 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3.5">Template</th>
                                        <th className="px-6 py-3.5">Kategori</th>
                                        <th className="px-6 py-3.5">Digunakan</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {templates.data.map((t) => (
                                        <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                                            {/* 1. Template (Thumbnail + Name + Slug + Component) */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-black/40 border border-white/[0.1] shadow-xs">
                                                        <img
                                                            src={t.thumbnail_url || '/images/templates/modern-floral.jpg'}
                                                            alt={t.name}
                                                            onError={(e) => {
                                                                const target = e.currentTarget;
                                                                target.onerror = null;
                                                                target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80';
                                                            }}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-white truncate">{t.name}</div>
                                                        <div className="text-[11px] font-mono text-admin-primary truncate">/{t.slug}</div>
                                                        <div className="text-[10px] font-mono text-zinc-400 truncate">
                                                            Komponen: <span className="text-zinc-300 font-medium">{t.component_name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. Kategori */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {t.categories && t.categories.length > 0 ? (
                                                        t.categories.map((cat) => (
                                                            <StatusBadge key={cat.id} variant="neutral" dot={false} className="text-[10px] font-mono">
                                                                {cat.name}
                                                            </StatusBadge>
                                                        ))
                                                    ) : (
                                                        <span className="text-zinc-600 font-mono">-</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 3. Digunakan */}
                                            <td className="px-6 py-4 text-xs font-mono text-slate-300">
                                                {t.invitations_count || 0} Undangan
                                            </td>

                                            {/* 4. Status */}
                                            <td className="px-6 py-4">
                                                {t.is_active ? (
                                                    <StatusBadge variant="success">Aktif</StatusBadge>
                                                ) : (
                                                    <StatusBadge variant="danger">Nonaktif</StatusBadge>
                                                )}
                                            </td>

                                            {/* 5. Aksi */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(t)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                                                        title="Edit Template"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(t)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                                        title="Hapus Template"
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
                            <Pagination meta={templates as unknown as PaginationMeta} />
                        </div>
                    </div>
                )}

                {/* Modal Create/Edit Template (Dark Glass) */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="w-full max-w-lg rounded-2xl bg-[#12151E] p-6 shadow-2xl border border-white/[0.1] text-zinc-200 max-h-[90vh] overflow-y-auto">
                            <h3 className="text-base font-bold text-white mb-4">
                                {editingTemplate ? 'Edit Template Desain' : 'Tambah Template Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-zinc-300 mb-1">Nama Template *</label>
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
                                </div>

                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Nama Komponen React *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.component_name}
                                        onChange={(e) => setData('component_name', e.target.value)}
                                        placeholder="ModernFloral / RusticBrown / IslamicElegance"
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Thumbnail URL</label>
                                    <input
                                        type="text"
                                        value={data.thumbnail_url}
                                        onChange={(e) => setData('thumbnail_url', e.target.value)}
                                        placeholder="/images/templates/modern.jpg"
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Deskripsi Gaya Tema</label>
                                    <textarea
                                        rows={3}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded text-admin-primary focus:ring-admin-primary bg-zinc-900 border-white/[0.2]"
                                        />
                                        <span className="font-medium text-zinc-300">Template Aktif (Dapat Dipilih)</span>
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
                                        {processing ? 'Menyimpan...' : 'Simpan Template'}
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
