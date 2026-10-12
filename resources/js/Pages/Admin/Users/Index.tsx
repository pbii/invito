import EmptyState from '@/Components/EmptyState';
import Pagination, { PaginationMeta } from '@/Components/Pagination';
import SearchInput from '@/Components/SearchInput';
import StatusBadge from '@/Components/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface UserItem {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    is_active: boolean;
    is_verified: boolean;
    invitations_count: number;
    created_at: string;
}

interface Props {
    users: {
        data: UserItem[];
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
        role?: string;
        is_active?: string;
    };
}

export default function AdminUsersIndex({ users, filters = { search: '', role: 'all', is_active: 'all' } }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || 'all');
    const [isActive, setIsActive] = useState(filters.is_active || 'all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '') || role !== (filters.role || 'all') || isActive !== (filters.is_active || 'all')) {
                router.get(
                    route('admin.users.index'),
                    {
                        search: search || undefined,
                        role: role !== 'all' ? role : undefined,
                        is_active: isActive !== 'all' ? isActive : undefined,
                    },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, role, isActive]);

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'COUPLE',
        password: '',
        is_active: true,
        is_verified: true,
    });

    const openCreateModal = () => {
        setEditingUser(null);
        reset();
        setModalOpen(true);
    };

    const openEditModal = (user: UserItem) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            password: '',
            is_active: user.is_active,
            is_verified: user.is_verified,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            put(route('admin.users.update', editingUser.id), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => {
                    setModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (user: UserItem) => {
        if (confirm(`Yakin ingin menghapus pengguna "${user.name}"?`)) {
            router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Manajemen Pengguna">
            <Head title="Kelola Pengguna - Admin" />

            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Daftar Pengguna Sistem</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Kelola akun pasangan pengantin, administrator, dan izin akses.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-admin-primary/25 hover:brightness-110 transition active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Pengguna Baru
                    </button>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md p-4 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <SearchInput value={search} onChange={setSearch} placeholder="Cari nama, email, WhatsApp..." />
                    </div>
                    <div>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-xl border border-admin-border bg-black/40 py-2 px-3 text-xs text-slate-200 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                        >
                            <option value="all">Semua Peran (Roles)</option>
                            <option value="SUPER_ADMIN">Super Administrator</option>
                            <option value="ADMIN">Administrator</option>
                            <option value="COUPLE">Pasangan Pengantin (Couple)</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={isActive}
                            onChange={(e) => setIsActive(e.target.value)}
                            className="w-full rounded-xl border border-admin-border bg-black/40 py-2 px-3 text-xs text-slate-200 focus:border-admin-primary focus:ring-2 focus:ring-admin-primary"
                        >
                            <option value="all">Semua Status Akun</option>
                            <option value="true">Hanya Akun Aktif</option>
                            <option value="false">Hanya Akun Nonaktif</option>
                        </select>
                    </div>
                </div>

                {users.data.length === 0 ? (
                    <EmptyState
                        title="Tidak Ada Pengguna Ditemukan"
                        description="Sesuaikan filter atau kata kunci pencarian Anda untuk melihat pengguna lainnya."
                    />
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-admin-border bg-admin-surface/90 backdrop-blur-md shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-admin-border text-left text-sm">
                                <thead className="bg-black/20 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="px-6 py-3.5">Pengguna</th>
                                        <th className="px-6 py-3.5">Kontak</th>
                                        <th className="px-6 py-3.5">Peran</th>
                                        <th className="px-6 py-3.5">Undangan</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-admin-border">
                                    {users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-100">{u.name}</div>
                                                <div className="text-xs text-slate-400 font-mono">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-slate-400">
                                                {u.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge
                                                    variant={u.role === 'SUPER_ADMIN' ? 'danger' : u.role === 'ADMIN' ? 'warning' : 'primary'}
                                                    dot={false}
                                                    className="font-mono text-[10px]"
                                                >
                                                    {u.role === 'SUPER_ADMIN'
                                                        ? 'Super Admin'
                                                        : u.role === 'ADMIN'
                                                        ? 'Admin'
                                                        : 'Couple'}
                                                </StatusBadge>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-slate-300">
                                                {u.invitations_count || 0} Undangan
                                            </td>
                                            <td className="px-6 py-4">
                                                {u.is_active ? (
                                                    <StatusBadge variant="success">Aktif</StatusBadge>
                                                ) : (
                                                    <StatusBadge variant="danger">Nonaktif</StatusBadge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(u)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                                                        title="Edit Pengguna"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(u)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                                        title="Hapus Pengguna"
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
                            <Pagination meta={users as unknown as PaginationMeta} />
                        </div>
                    </div>
                )}

                {/* Modal Create/Edit User */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <div className="w-full max-w-md rounded-2xl bg-admin-surface p-6 shadow-2xl border border-admin-border text-slate-200">
                            <h3 className="text-base font-bold text-white mb-4">
                                {editingUser ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                    {errors.name && <p className="text-rose-400 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Alamat Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                    {errors.email && <p className="text-rose-400 mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Nomor WhatsApp</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="628123456789"
                                        className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">Peran Akses (Role)</label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    >
                                        <option value="COUPLE">Couple (Pasangan Pengantin)</option>
                                        <option value="ADMIN">Administrator</option>
                                        <option value="SUPER_ADMIN">Super Administrator</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-300 mb-1">
                                        {editingUser ? 'Kata Sandi Baru (Kosongkan bila tidak diganti)' : 'Kata Sandi *'}
                                    </label>
                                    <input
                                        type="password"
                                        required={!editingUser}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full rounded-xl border border-admin-border bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                    {errors.password && <p className="text-rose-400 mt-1">{errors.password}</p>}
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded text-admin-primary focus:ring-admin-primary bg-black/40 border-white/20"
                                        />
                                        <span className="font-medium text-slate-300">Akun Aktif</span>
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
                                        {processing ? 'Menyimpan...' : 'Simpan Pengguna'}
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
