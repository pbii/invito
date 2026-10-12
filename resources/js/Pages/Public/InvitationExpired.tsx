import ApplicationLogo from '@/Components/ApplicationLogo';
import ThemeToggle from '@/Components/ThemeToggle';
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
        <div className="relative min-h-screen bg-radial from-neutral-50 via-white to-wedding-50/20 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 flex flex-col items-center justify-center p-6 text-center transition-colors duration-200">
            <Head title="Masa Aktif Undangan Selesai" />

            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeToggle />
            </div>

            <div className="mb-6">
                <Link href="/">
                    <ApplicationLogo />
                </Link>
            </div>

            <div className="max-w-md w-full rounded-3xl bg-white dark:bg-neutral-900 p-8 sm:p-10 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-neutral-800">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-champagne-100 dark:bg-champagne-950/40 text-champagne-700 dark:text-champagne-300 mb-6 shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-widest text-champagne-600 dark:text-champagne-400 bg-champagne-50 dark:bg-champagne-950/50 px-3 py-1 rounded-full border border-champagne-200/50 dark:border-champagne-800/40">
                    Momen Bahagia Telah Berlalu
                </span>

                <h1 className="mt-4 text-2xl font-serif font-bold text-gray-900 dark:text-white">
                    Masa Aktif Undangan Telah Selesai
                </h1>

                <p className="mt-2 text-wedding-700 dark:text-wedding-400 font-serif text-lg font-medium">
                    {invitation.groom_name} &amp; {invitation.bride_name}
                </p>

                <p className="mt-4 text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Terima kasih atas seluruh perhatian, doa restu, serta kehadiran yang telah diberikan kepada kedua mempelai. Semoga doa baik senantiasa menyertai kita semua.
                </p>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 flex flex-col gap-3">
                    <Link
                        href="/"
                        className="inline-flex justify-center rounded-xl bg-wedding-600 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-wedding-700 transition"
                    >
                        Kembali ke Halaman Utama
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400 dark:text-neutral-500">
                &copy; {new Date().getFullYear()} {appName} &bull; {appTagline}
            </p>
        </div>
    );
}
