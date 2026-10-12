import EmptyState from '@/Components/EmptyState';
import Pagination, { PaginationMeta } from '@/Components/Pagination';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface MsgTemplateItem {
    id: string;
    name: string;
    language: 'id' | 'en';
    content: string;
    is_default: boolean;
    created_at: string;
}

interface Props {
    templates: {
        data: MsgTemplateItem[];
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
        language?: string;
    };
}

export default function AdminMessageTemplatesIndex({ templates, filters = { search: '', language: 'all' } }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [language, setLanguage] = useState(filters.language || 'all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMsg, setEditingMsg] = useState<MsgTemplateItem | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '') || language !== (filters.language || 'all')) {
                router.get(
                    route('admin.message-templates.index'),
                    { search: search || undefined, language: language !== 'all' ? language : undefined },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, language]);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        language: 'id' as 'id' | 'en',
        content: '',
        is_default: false,
    });

    const openCreateModal = () => {
        setEditingMsg(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (m: MsgTemplateItem) => {
        setEditingMsg(m);
        setData({
            name: m.name,
            language: m.language,
            content: m.content,
            is_default: m.is_default,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMsg) {
            put(route('admin.message-templates.update', editingMsg.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.message-templates.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (m: MsgTemplateItem) => {
        if (confirm(`Hapus template pesan "${m.name}"?`)) {
            router.delete(route('admin.message-templates.destroy', m.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Pesan Broadcast WA">
            <Head title="Pesan Broadcast WA - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Format Broadcast WhatsApp</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Preset teks undangan pernikahan yang disiapkan bagi pasangan pengantin.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-admin-primary/25 hover:brightness-110 transition active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Format Pesan
                    </button>
                </div>

                <div className="rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                    <div>
                        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama template atau teks..." />
                    </div>
                    <div>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full rounded-xl border border-admin-border bg-black/40 py-2 px-3 text-xs text-zinc-200 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                        >
                            <option value="all">Semua Bahasa</option>
                            <option value="id">Bahasa Indonesia</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>

                {templates.data.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Template Pesan Ditemukan"
                        description="Sesuaikan filter pencarian untuk melihat format pesan broadcast."
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-white/[0.06] text-left text-sm">
                                <thead className="bg-white/[0.02] text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                                    <tr>
                                        <th className="px-6 py-3.5">Nama Template</th>
                                        <th className="px-6 py-3.5">Bahasa</th>
                                        <th className="px-6 py-3.5">Isi Pesan Singkat</th>
                                        <th className="px-6 py-3.5">Default</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {templates.data.map((m) => (
                                        <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                                            <td className="px-6 py-4 font-semibold text-zinc-100">
                                                {m.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge variant="neutral" dot={false} className="font-mono text-[10px]">
                                                    {m.language === 'id' ? 'ID (Indonesia)' : 'EN (English)'}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-zinc-400 max-w-sm truncate font-mono">
                                                {m.content}
                                            </td>
                                            <td className="px-6 py-4">
                                                {m.is_default ? (
                                                    <StatusBadge variant="success">Utama</StatusBadge>
                                                ) : (
                                                    <span className="text-zinc-600 font-mono">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(m)}
                                                        className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
                                                        title="Edit Pesan"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(m)}
                                                        className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                                        title="Hapus Pesan"
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
                            <Pagination meta={templates as unknown as PaginationMeta} />
                        </div>
                    </div>
                )}

                {/* Modal Create/Edit Message Template (Dark Glass) */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="w-full max-w-lg rounded-2xl bg-[#12151E] p-6 shadow-2xl border border-white/[0.1] text-zinc-200">
                            <h3 className="text-base font-bold text-white mb-4">
                                {editingMsg ? 'Edit Template Pesan WhatsApp' : 'Tambah Template Pesan Baru'}
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
                                            placeholder="Formal Islami"
                                            className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-zinc-300 mb-1">Bahasa *</label>
                                        <select
                                            value={data.language}
                                            onChange={(e) => setData('language', e.target.value as 'id' | 'en')}
                                            className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        >
                                            <option value="id">Bahasa Indonesia</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Isi Pesan WhatsApp *</label>
                                    <p className="text-[11px] text-zinc-500 mb-1 font-mono">
                                        Variabel: {'{{guest_name}}'}, {'{{groom_name}}'}, {'{{bride_name}}'}, {'{{invitation_url}}'}
                                    </p>
                                    <textarea
                                        rows={7}
                                        required
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary font-mono"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_default}
                                            onChange={(e) => setData('is_default', e.target.checked)}
                                            className="rounded text-admin-primary focus:ring-admin-primary bg-zinc-900 border-white/[0.2]"
                                        />
                                        <span className="font-medium text-zinc-300">Jadikan Template Standar</span>
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
                                        {processing ? 'Menyimpan...' : 'Simpan Format'}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Format Pesan'}
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
