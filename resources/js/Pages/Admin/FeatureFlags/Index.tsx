import StatusBadge from '@/Components/StatusBadge';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface FeatureFlagItem {
    id: string;
    key: string;
    name: string;
    description: string;
    is_enabled: boolean;
}

interface Props {
    flags: FeatureFlagItem[];
}

export default function AdminFeatureFlagsIndex({ flags }: Props) {
    const initialValues: Record<string, boolean> = {};
    flags.forEach((f) => {
        initialValues[f.key] = f.is_enabled;
    });

    const { data, setData, put, processing, wasSuccessful } = useForm({
        flags: initialValues,
    });

    const handleToggle = (key: string, current: boolean) => {
        setData('flags', {
            ...data.flags,
            [key]: !current,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.feature-flags.update'));
    };

    return (
        <AdminLayout title="Feature Flags">
            <Head title="Feature Flags - Admin" />

            <div className="space-y-6 max-w-4xl">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Kill-Switches &amp; Fitur Eksperimental</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Saklar darurat global. Jika fitur dinonaktifkan, sistem otomatis mengalihkan operasi ke mode aman.
                    </p>
                </div>

                {wasSuccessful && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-400 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Status saklar fitur (feature flags) berhasil diperbarui dan disimpan ke sistem!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-white/[0.08] bg-[#10131B]/90 backdrop-blur-md divide-y divide-white/[0.05] shadow-xl">
                        {flags.map((flag) => {
                            const isChecked = data.flags[flag.key] ?? flag.is_enabled;

                            return (
                                <div key={flag.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-zinc-100">{flag.name}</h3>
                                            <StatusBadge variant="neutral" dot={false} className="font-mono text-[10px]">
                                                {flag.key}
                                            </StatusBadge>
                                        </div>
                                        <p className="text-xs text-zinc-400 mt-1 max-w-xl">{flag.description}</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleToggle(flag.key, isChecked)}
                                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            isChecked ? 'bg-admin-primary shadow-sm shadow-admin-primary/40' : 'bg-zinc-800'
                                        }`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                                isChecked ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-admin-primary/25 hover:brightness-110 disabled:opacity-50 transition active:scale-95"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Status Feature Flags'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
