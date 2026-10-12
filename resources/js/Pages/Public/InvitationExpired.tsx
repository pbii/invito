import ApplicationLogo from '@/Components/ApplicationLogo';
import { Invitation, PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';

interface InvitationExpiredProps {
    invitation: Invitation;
}

export default function InvitationExpired({ invitation }: InvitationExpiredProps) {
    const { branding } = usePage<PageProps>().props;
    const appName = branding?.app_name || 'WedInvite';
    const appTagline = branding?.app_tagline || 'Platform Undangan Digital';

    return (
        <div className="min-h-screen bg-radial from-neutral-50 via-white to-wedding-50/20 flex flex-col items-center justify-center p-6 text-center">
            <Head title="Masa Aktif Undangan Selesai" />

            <div className="mb-6">
                <Link href="/">
                    <ApplicationLogo />
                </Link>
            </div>

            <div className="max-w-md w-full rounded-3xl bg-white p-8 sm:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-champagne-100 text-champagne-700 mb-6 shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-widest text-champagne-600 bg-champagne-50 px-3 py-1 rounded-full">
                    Momen Bahagia Telah Berlalu
                </span>

                <h1 className="mt-4 text-2xl font-serif font-bold text-gray-900">
                    Masa Aktif Undangan Telah Selesai
                </h1>

                <p className="mt-2 text-wedding-700 font-serif text-lg font-medium">
                    {invitation.groom_name} &amp; {invitation.bride_name}
                </p>

                <p className="mt-4 text-xs text-gray-500 leading-relaxed">
                    Terima kasih atas seluruh perhatian, doa restu, serta kehadiran yang telah diberikan kepada kedua mempelai. Semoga doa baik senantiasa menyertai kita semua.
                </p>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                    <Link
                        href="/"
                        className="inline-flex justify-center rounded-xl bg-wedding-600 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-wedding-700 transition"
                    >
                        Kembali ke Halaman Utama
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400">
                &copy; {new Date().getFullYear()} {appName} &bull; {appTagline}
            </p>
        </div>
    );
}
