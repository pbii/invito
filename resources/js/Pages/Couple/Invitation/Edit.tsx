import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { EventType, Invitation, Package, PaymentProvider, Template } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Props {
    invitation: Invitation;
    packages: Package[];
    templates: Template[];
    eventTypes: EventType[];
    paymentProviders: PaymentProvider[];
}

export default function EditInvitation({
    invitation,
    packages,
    templates,
    eventTypes,
    paymentProviders,
}: Props) {
    const [formData, setFormData] = useState({
        template_id: invitation.template_id,
        package_id: invitation.package_id,
        slug: invitation.slug,
        groom_name: invitation.groom_name,
        groom_father: invitation.groom_father || '',
        groom_mother: invitation.groom_mother || '',
        groom_photo: invitation.groom_photo || '',
        bride_name: invitation.bride_name,
        bride_father: invitation.bride_father || '',
        bride_mother: invitation.bride_mother || '',
        bride_photo: invitation.bride_photo || '',
        music_url: invitation.music_url || '',
        streaming_url: invitation.streaming_url || '',
        language: invitation.language || 'id',
        is_published: invitation.is_published,
        events: invitation.events && invitation.events.length > 0 ? invitation.events : [
            {
                event_name: 'Akad Nikah',
                event_type_id: eventTypes[0]?.id || '',
                date: new Date().toISOString().split('T')[0],
                time_start: '08:00',
                time_end: '10:00',
                venue_name: 'Masjid Agung',
                address: 'Jl. Contoh No. 123',
                latitude: null,
                longitude: null,
            },
        ],
        bank_accounts: invitation.bank_accounts || [],
        love_stories: invitation.love_stories || [],
        gallery_photos: invitation.gallery_photos || [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        router.put(route('invitation.update', invitation.id), formData as any, {
            onError: (err) => {
                setErrors(err);
                setIsSubmitting(false);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Link href={route('dashboard')} className="hover:underline">
                                Dashboard
                            </Link>
                            <span>/</span>
                            <span>Edit Undangan</span>
                        </div>
                        <h2 className="mt-1 text-xl font-bold leading-tight text-gray-800 dark:text-white">
                            Edit Undangan: {invitation.groom_name} & {invitation.bride_name}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title="Edit Data Undangan" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Data Mempelai */}
                        <div className="rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Informasi Mempelai</h3>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">Nama Mempelai Pria</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.groom_name}
                                        onChange={(e) => setFormData({ ...formData, groom_name: e.target.value })}
                                        className="mt-1 block w-full rounded-xl border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:border-admin-primary focus:ring-admin-primary"
                                    />
                                    {errors.groom_name && <p className="mt-1 text-xs text-red-500">{errors.groom_name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">Nama Mempelai Wanita</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.bride_name}
                                        onChange={(e) => setFormData({ ...formData, bride_name: e.target.value })}
                                        className="mt-1 block w-full rounded-xl border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm focus:border-admin-primary focus:ring-admin-primary"
                                    />
                                    {errors.bride_name && <p className="mt-1 text-xs text-red-500">{errors.bride_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300">Custom Slug Undangan</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, '') })}
                                        className="mt-1 block w-full rounded-xl border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm font-mono focus:border-admin-primary focus:ring-admin-primary"
                                    />
                                    {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700">Pilihan Template</label>
                                    <select
                                        value={formData.template_id}
                                        onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                                        className="mt-1 block w-full rounded-xl border-gray-200 text-sm focus:border-admin-primary focus:ring-admin-primary"
                                    >
                                        {templates.map((tpl) => (
                                            <option key={tpl.id} value={tpl.id}>
                                                {tpl.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-700">Status Publikasi</label>
                                    <div className="mt-2 flex items-center space-x-4">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_published}
                                                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                                className="rounded border-gray-300 text-admin-primary focus:ring-admin-primary"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Publikasikan Undangan (Live)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-3">
                            <Link
                                href={route('dashboard')}
                                className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-admin-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-50 transition"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
