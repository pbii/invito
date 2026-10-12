import EmptyState from '@/Components/EmptyState';
import Pagination, { PaginationMeta } from '@/Components/Pagination';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface InvitationItem {
    id: string;
    slug: string;
    groom_name: string;
    bride_name: string;
    is_published: boolean;
    expires_at: string | null;
    created_at: string;
    guests_count: number;
    rsvps_count: number;
    user?: { id: string; name: string; email: string };
    package?: { id: string; name: string; badge: string };
    template?: { id: string; name: string; thumbnail_url: string };
}

interface Props {
    invitations: {
        data: InvitationItem[];
        current_page: number;
        from: number | null;
        last_page: number;
        links: { url: string | null; label: string; active: boolean }[];
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
    packages: Array<{ id: string; name: string }>;
    templates: Array<{ id: string; name: string }>;
    filters: {
        search?: string;
        package_id?: string;
        template_id?: string;
        status?: string;
    };
}

export default function AdminInvitationsIndex({
    invitations,
    packages = [],
    templates = [],
    filters = { search: '', package_id: 'all', template_id: 'all', status: 'all' },
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [packageId, setPackageId] = useState(filters.package_id || 'all');
    const [templateId, setTemplateId] = useState(filters.template_id || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (
                search !== (filters.search || '') ||
                packageId !== (filters.package_id || 'all') ||
                templateId !== (filters.template_id || 'all') ||
                status !== (filters.status || 'all')
            ) {
                router.get(
                    route('admin.invitations.index'),
                    {
                        search: search || undefined,
                        package_id: packageId !== 'all' ? packageId : undefined,
                        template_id: templateId !== 'all' ? templateId : undefined,
                        status: status !== 'all' ? status : undefined,
                    },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, packageId, templateId, status]);

    const handleDelete = (inv: InvitationItem) => {
        if (confirm(`Hapus undangan "${inv.groom_name} & ${inv.bride_name}" (${inv.slug})?`)) {
            router.delete(route('admin.invitations.destroy', inv.id), { preserveScroll: true });
        }
    };

    const isExpired = (expiresAt?: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    return (
        <AdminLayout title="Semua Undangan">
            <Head title="Semua Undangan - Admin" />

            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Daftar Undangan Seluruh Pengguna</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Pantau status penayangan, masa aktif, dan kuota undangan online.</p>
                </div>

                {/* Search & Multi-Filter Toolbar */}
                <div className="rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md p-4 shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                        <SearchInput value={search} onChange={setSearch} placeholder="Cari pengantin, slug, email..." />
                    </div>
                    <div>
                        <select
                            value={packageId}
                            onChange={(e) => setPackageId(e.target.value)}
                            className="w-full rounded-xl border border-admin-border bg-black/40 py-2 px-3 text-xs text-slate-200 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                        >
                            <option value="all">Semua Paket</option>
                            {packages.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={templateId}
                            onChange={(e) => setTemplateId(e.target.value)}
                            className="w-full rounded-xl border border-admin-border bg-black/40 py-2 px-3 text-xs text-slate-200 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                        >
                            <option value="all">Semua Desain Template</option>
                            {templates.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-xl border border-admin-border bg-black/40 py-2 px-3 text-xs text-slate-200 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                        >
                            <option value="all">Semua Status</option>
                            <option value="active">Aktif Tayang</option>
                            <option value="expired">Masa Aktif Berakhir</option>
                            <option value="draft">Draft (Belum Publish)</option>
                        </select>
                    </div>
                </div>

                {invitations.data.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Undangan Sesuai Kriteria"
                        description="Coba ubah kata kunci pencarian atau sesuaikan opsi filter di atas."
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-admin-border text-left text-sm">
                                <thead className="bg-black/20 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3.5">Mempelai</th>
                                        <th className="px-6 py-3.5">Pemilik Akun</th>
                                        <th className="px-6 py-3.5">Paket &amp; Template</th>
                                        <th className="px-6 py-3.5">Buku Tamu</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {invitations.data.map((inv) => {
                                        const expired = isExpired(inv.expires_at);
                                        return (
                                            <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-100">
                                                        {inv.groom_name} &amp; {inv.bride_name}
                                                    </div>
                                                    <div className="text-xs font-mono text-admin-primary">/{inv.slug}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs font-medium text-slate-200">{inv.user?.name}</div>
                                                    <div className="text-[11px] font-mono text-slate-400">{inv.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    <span className="font-semibold text-slate-300">{inv.package?.name || '-'}</span>
                                                    <div className="text-slate-400">Tema: {inv.template?.name || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-400">
                                                    <span className="font-semibold text-slate-200">{inv.guests_count || 0}</span> tamu &bull;{' '}
                                                    <span className="font-semibold text-emerald-400">{inv.rsvps_count || 0}</span> RSVP
                                                </td>
                                                <td className="px-6 py-4">
                                                    {expired ? (
                                                        <StatusBadge variant="danger">Kadaluwarsa</StatusBadge>
                                                    ) : inv.is_published ? (
                                                        <StatusBadge variant="success">Aktif</StatusBadge>
                                                    ) : (
                                                        <StatusBadge variant="neutral">Draft</StatusBadge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <a
                                                            href={`/${inv.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                                                            title="Buka Website Undangan"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(inv)}
                                                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                                            title="Hapus Undangan"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                        <div className="p-4 border-t border-admin-border">
                            <Pagination meta={invitations as unknown as PaginationMeta} />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
