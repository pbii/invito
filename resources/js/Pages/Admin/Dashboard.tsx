import AdminLayout from '@/Layouts/AdminLayout';
import StatusBadge from '@/Components/StatusBadge';
import { Head, Link } from '@inertiajs/react';
import React from 'react';

interface Props {
    statistics: {
        total_users: number;
        couple_users: number;
        total_invitations: number;
        active_invitations: number;
        total_guests: number;
        total_rsvps: number;
        total_templates: number;
        total_packages: number;
    };
    latestInvitations: Array<{
        id: string;
        slug: string;
        groom_name: string;
        bride_name: string;
        is_published: boolean;
        expires_at: string | null;
        created_at: string;
        guests_count: number;
        rsvps_count: number;
        user?: { name: string; email: string };
        template?: { name: string; thumbnail_url: string };
        package?: { name: string; badge: string };
    }>;
}

export default function AdminDashboard({ statistics, latestInvitations = [] }: Props) {
    const statCards = [
        {
            title: 'Pengguna Pasangan',
            value: statistics.couple_users,
            subtext: `Dari ${statistics.total_users} total akun`,
            icon: (
                <svg className="w-5 h-5 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            accent: 'from-admin-primary/20 to-transparent',
        },
        {
            title: 'Undangan Aktif',
            value: `${statistics.active_invitations} / ${statistics.total_invitations}`,
            subtext: 'Undangan publik online',
            icon: (
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            accent: 'from-emerald-500/15 to-transparent',
        },
        {
            title: 'Buku Tamu & RSVP',
            value: `${statistics.total_guests} Tamu`,
            subtext: `${statistics.total_rsvps} konfirmasi hadir`,
            icon: (
                <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            ),
            accent: 'from-rose-500/15 to-transparent',
        },
        {
            title: 'Template & Paket',
            value: `${statistics.total_templates} Tema`,
            subtext: `${statistics.total_packages} pilihan paket aktif`,
            icon: (
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            ),
            accent: 'from-amber-500/15 to-transparent',
        },
    ];

    return (
        <AdminLayout title="Dashboard">
            <Head title="Super Admin Dashboard" />

            <div className="space-y-8">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((c, idx) => (
                        <div
                            key={idx}
                            className="p-5 rounded-2xl bg-admin-surface/90 border border-admin-border shadow-xs backdrop-blur-md transition-all hover:border-admin-primary/40 group"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{c.title}</p>
                                <div className="p-2 rounded-xl bg-black/30 border border-admin-border text-slate-200">
                                    {c.icon}
                                </div>
                            </div>
                            <h3 className="mt-3 font-sans text-2xl font-bold tracking-tight text-white">{c.value}</h3>
                            <p className="mt-1 text-xs text-slate-400 font-medium">{c.subtext}</p>
                        </div>
                    ))}
                </div>

                {/* Latest Platform Invitations Table */}
                <div className="rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-admin-border pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-admin-secondary animate-pulse" />
                                <h2 className="text-base font-bold text-white tracking-tight">Undangan Terbaru di Platform</h2>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Aktivitas pendaftaran undangan pasangan pengantin terbaru</p>
                        </div>
                        <Link
                            href={route('admin.invitations.index')}
                            className="text-xs font-mono font-medium text-admin-primary hover:brightness-125 hover:underline flex items-center gap-1 transition"
                        >
                            Lihat Semua &rarr;
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-admin-border text-left text-sm">
                            <thead className="bg-black/20 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Mempelai</th>
                                    <th className="px-4 py-3">Slug Tautan</th>
                                    <th className="px-4 py-3">Akun Pemilik</th>
                                    <th className="px-4 py-3">Paket</th>
                                    <th className="px-4 py-3">Tamu &amp; RSVP</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-admin-border">
                                {latestInvitations.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-slate-100">
                                                {inv.groom_name} &amp; {inv.bride_name}
                                            </div>
                                            <span className="text-[11px] text-slate-400">
                                                Tema: {inv.template?.name || '-'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-xs text-admin-primary">
                                            /{inv.slug}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="text-slate-200 font-medium text-xs">{inv.user?.name}</div>
                                            <div className="text-slate-400 text-[11px] font-mono">{inv.user?.email}</div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StatusBadge variant="primary" dot={false} className="text-xs">
                                                {inv.package?.name || 'Paket Kustom'}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs font-mono text-slate-300">
                                            {inv.guests_count} tamu / {inv.rsvps_count} hadir
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StatusBadge
                                                variant={inv.is_published ? 'success' : 'neutral'}
                                            >
                                                {inv.is_published ? 'Published' : 'Draft'}
                                            </StatusBadge>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <a
                                                href={`/${inv.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded-lg border border-admin-border bg-admin-surface/70 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
                                            >
                                                <span>Buka</span>
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
