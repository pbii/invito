import { Invitation } from '@/types';
import React from 'react';

interface CoverOverlayProps {
    invitation: Invitation;
    guestName: string | null;
    isOpen: boolean;
    onOpen: () => void;
}

export default function CoverOverlay({
    invitation,
    guestName,
    isOpen,
    onOpen,
}: CoverOverlayProps) {
    if (isOpen) {
        return null;
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-stone-900 px-6 py-12 text-center text-white transition-all duration-1000 ${
                isOpen ? 'pointer-events-none -translate-y-full opacity-0' : 'opacity-100'
            }`}
            style={{
                backgroundImage: invitation.groom_photo
                    ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${invitation.groom_photo})`
                    : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="pt-8">
                <p className="text-sm font-light tracking-widest uppercase text-stone-300">
                    The Wedding Of
                </p>
                <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-normal text-amber-200">
                    {invitation.groom_name} & {invitation.bride_name}
                </h1>
            </div>

            <div className="my-auto max-w-sm rounded-2xl border border-white/20 bg-black/40 p-6 backdrop-blur-md">
                <p className="text-xs tracking-wider uppercase text-stone-300">
                    Kepada Yth. Bapak/Ibu/Saudara/i:
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                    {guestName || 'Tamu Undangan'}
                </p>
                <p className="mt-1 text-xs text-stone-300">
                    *Mohon maaf jika ada kesalahan penulisan nama/gelar
                </p>

                <button
                    type="button"
                    onClick={onOpen}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition duration-200 hover:bg-amber-500 hover:scale-105 active:scale-95"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 animate-bounce"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5m0 0l-2.25 1.5-2.25-1.5"
                        />
                    </svg>
                    Buka Undangan
                </button>
            </div>

            <p className="text-xs text-stone-400">
                Putar audio otomatis saat membuka undangan
            </p>
        </div>
    );
}
