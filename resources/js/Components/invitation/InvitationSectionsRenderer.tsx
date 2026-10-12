import { Event, GalleryPhoto, Invitation, InvitationBankAccount, InvitationSection, LoveStory, PageProps, Wish } from '@/types';
import { formatIndonesianDate } from '@/Utils/date';
import { usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import RsvpSection from './RsvpSection';

interface InvitationSectionsRendererProps {
    invitation: Invitation;
    sections: InvitationSection[];
    events: Event[];
    bankAccounts: InvitationBankAccount[];
    loveStories: LoveStory[];
    galleryPhotos: GalleryPhoto[];
    wishes: Wish[];
    resolvedGuest: { id: string; name: string; max_pax?: number; allowed_event_ids?: string[] } | null;
    turnstileSiteKey?: string;
    themeClasses?: {
        accentText?: string;
        accentBg?: string;
        cardBg?: string;
        headerFont?: string;
    };
}

export default function InvitationSectionsRenderer({
    invitation,
    sections,
    events,
    bankAccounts,
    loveStories,
    galleryPhotos,
    wishes,
    resolvedGuest,
    turnstileSiteKey,
    themeClasses = {
        accentText: 'text-amber-700',
        accentBg: 'bg-amber-600',
        cardBg: 'bg-white',
        headerFont: 'font-serif',
    },
}: InvitationSectionsRendererProps) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Countdown logic to the earliest event date
    const earliestDate = events.length > 0 ? events[0].date : invitation.expires_at;
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (!earliestDate) return;
        const target = new Date(earliestDate).getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = target - now;
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((diff % (1000 * 60)) / 1000),
                });
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [earliestDate]);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const enabledSections = [...sections]
        .filter((s) => s.is_enabled)
        .sort((a, b) => a.sort_order - b.sort_order);

    const getNormalizedKey = (rawKey: string): string => {
        const k = (rawKey || '').toUpperCase().trim();
        if (k === 'EVENT' || k === 'EVENTS') return 'EVENTS';
        if (k === 'LOVE_STORY' || k === 'STORY') return 'STORY';
        if (k === 'GIFT' || k === 'BANK_TRANSFER') return 'GIFT';
        if (k === 'CLOSING' || k === 'FOOTNOTE') return 'CLOSING';
        return k;
    };

    return (
        <div className="space-y-16 pb-24">
            {enabledSections.map((section) => {
                const normalizedKey = getNormalizedKey(section.section_key);
                switch (normalizedKey) {
                    case 'QUOTE':
                        return (
                            <section key={section.id} className="text-center px-4 max-w-2xl mx-auto">
                                <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-xs border border-stone-200/60 shadow-xs">
                                    <svg className="w-8 h-8 mx-auto text-amber-500/60 mb-3" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                    </svg>
                                    <p className="italic text-stone-700 text-sm leading-relaxed">
                                        &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&rdquo;
                                    </p>
                                    <p className="mt-3 text-xs font-semibold tracking-wider text-amber-700 uppercase">
                                        (QS. Ar-Rum: 21)
                                    </p>
                                </div>
                            </section>
                        );

                    case 'COUPLE':
                        return (
                            <section key={section.id} className="text-center px-4">
                                <h2 className={`text-3xl font-bold ${themeClasses.headerFont} ${themeClasses.accentText}`}>
                                    {section.custom_title || 'Kedua Mempelai'}
                                </h2>
                                <p className="mt-2 text-stone-600 text-sm max-w-lg mx-auto">
                                    Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.
                                </p>

                                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                    {/* Groom */}
                                    <div className="flex flex-col items-center">
                                        <div className="h-44 w-44 rounded-full overflow-hidden border-4 border-white shadow-xl bg-stone-100">
                                            {invitation.groom_photo ? (
                                                <img src={invitation.groom_photo} alt={invitation.groom_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-4xl text-stone-300 font-serif">Pria</div>
                                            )}
                                        </div>
                                        <h3 className={`mt-4 text-2xl font-bold ${themeClasses.headerFont} text-stone-800`}>
                                            {invitation.groom_name}
                                        </h3>
                                        {(invitation.groom_father || invitation.groom_mother) && (
                                            <p className="mt-1 text-xs text-stone-500">
                                                Putra dari Bpk. {invitation.groom_father || '-'} & Ibu {invitation.groom_mother || '-'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bride */}
                                    <div className="flex flex-col items-center">
                                        <div className="h-44 w-44 rounded-full overflow-hidden border-4 border-white shadow-xl bg-stone-100">
                                            {invitation.bride_photo ? (
                                                <img src={invitation.bride_photo} alt={invitation.bride_name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-4xl text-stone-300 font-serif">Wanita</div>
                                            )}
                                        </div>
                                        <h3 className={`mt-4 text-2xl font-bold ${themeClasses.headerFont} text-stone-800`}>
                                            {invitation.bride_name}
                                        </h3>
                                        {(invitation.bride_father || invitation.bride_mother) && (
                                            <p className="mt-1 text-xs text-stone-500">
                                                Putri dari Bpk. {invitation.bride_father || '-'} & Ibu {invitation.bride_mother || '-'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'COUNTDOWN':
                        return (
                            <section key={section.id} className="text-center px-4">
                                <h2 className={`text-2xl font-bold ${themeClasses.headerFont} ${themeClasses.accentText}`}>
                                    {section.custom_title || 'Hitung Mundur'}
                                </h2>
                                <div className="mt-6 flex justify-center gap-4 text-center">
                                    {[
                                        { label: 'Hari', val: timeLeft.days },
                                        { label: 'Jam', val: timeLeft.hours },
                                        { label: 'Menit', val: timeLeft.minutes },
                                        { label: 'Detik', val: timeLeft.seconds },
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex flex-col items-center rounded-2xl bg-white p-3 shadow-md border border-stone-200 w-16 sm:w-20">
                                            <span className={`text-2xl sm:text-3xl font-bold ${themeClasses.accentText}`}>
                                                {item.val}
                                            </span>
                                            <span className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-wider">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );

                    case 'EVENTS': {
                        const isOdd = events.length % 2 !== 0;

                        return (
                            <section key={section.id} className={`px-4 mx-auto ${isOdd ? 'max-w-xl' : 'max-w-4xl'}`}>
                                <h2 className={`text-center text-3xl font-bold ${themeClasses.headerFont} ${themeClasses.accentText}`}>
                                    {section.custom_title || 'Rangkaian Acara'}
                                </h2>
                                <div className={`mt-8 ${isOdd ? 'space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
                                    {events.map((evt) => (
                                        <div key={evt.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md text-center">
                                            <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200 mb-3">
                                                {evt.event_name}
                                            </span>
                                            <p className="text-lg font-bold text-stone-800">{formatIndonesianDate(evt.date)}</p>
                                            <p className="text-sm text-stone-600 mt-1">
                                                {evt.time_start || '08:00'} - {evt.time_end || 'Selesai'} WIB
                                            </p>
                                            <div className="mt-4 pt-4 border-t border-stone-100">
                                                <p className="font-semibold text-stone-800">{evt.venue_name}</p>
                                                {evt.address && <p className="text-xs text-stone-500 mt-1">{evt.address}</p>}
                                                {evt.latitude && evt.longitude && (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${evt.latitude},${evt.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-medium text-white hover:bg-stone-800 transition"
                                                    >
                                                        Buka Google Maps
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    }

                    case 'STORY':
                        if (loveStories.length === 0) return null;
                        return (
                            <section key={section.id} className="px-4 max-w-3xl mx-auto">
                                <h2 className={`text-center text-3xl font-bold ${themeClasses.headerFont} ${themeClasses.accentText}`}>
                                    {section.custom_title || 'Kisah Cinta Kami'}
                                </h2>
                                <div className="mt-8 space-y-6">
                                    {loveStories.map((story) => (
                                        <div key={story.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                                            {story.date && <span className="text-xs font-semibold text-amber-600">{formatIndonesianDate(story.date)}</span>}
                                            <h4 className="text-lg font-bold text-stone-800 mt-1">{story.title}</h4>
                                            <p className="text-sm text-stone-600 mt-2 leading-relaxed">{story.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );

                    case 'GALLERY':
                        if (galleryPhotos.length === 0) return null;
                        return (
                            <section key={section.id} className="px-4 max-w-4xl mx-auto text-center">
                                <h2 className={`text-3xl font-bold ${themeClasses.headerFont} ${themeClasses.accentText}`}>
                                    {section.custom_title || 'Galeri Kenangan'}
                                </h2>
                                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {galleryPhotos.map((photo) => (
                                        <div key={photo.id} className="aspect-square rounded-xl overflow-hidden shadow-sm bg-stone-100 group relative">
                                            <img
                                                src={photo.photo_url}
                                                alt={photo.caption || 'Foto Galeri'}
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                            {photo.caption && (
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition">
                                                    {photo.caption}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );

                    case 'GIFT':
                        if (bankAccounts.length === 0 && !invitation.qris_image_url) return null;
                        return (
                            <section key={section.id} className="px-4 max-w-2xl mx-auto text-center">
                                <h2 className={`text-3xl font-bold ${themeClasses.headerFont} ${themeClasses.accentText}`}>
                                    {section.custom_title || 'Tanda Kasih'}
                                </h2>
                                <p className="mt-2 text-sm text-stone-600">
                                    Doa restu Anda merupakan karunia terindah bagi kami. Bagi yang ingin mengirimkan kado pernikahan secara digital:
                                </p>

                                <div className="mt-8 space-y-4">
                                    {bankAccounts.map((acc, idx) => (
                                        <div key={acc.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md text-left flex items-center justify-between">
                                            <div>
                                                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">{acc.bank_or_wallet_name}</span>
                                                <p className="text-xl font-mono font-bold text-stone-800 mt-1">{acc.account_number}</p>
                                                <p className="text-xs text-stone-500 mt-0.5">a.n. {acc.account_holder}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(acc.account_number, idx)}
                                                className="rounded-lg bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200 transition"
                                            >
                                                {copiedIndex === idx ? 'Tersalin!' : 'Salin Rekening'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );

                    case 'STREAMING':
                        if (!invitation.streaming_url) return null;
                        return (
                            <section key={section.id} className="px-4 max-w-xl mx-auto text-center">
                                <h2 className={`text-2xl font-bold ${themeClasses.headerFont} ${themeClasses.accentText}`}>
                                    {section.custom_title || 'Siaran Langsung (Live Streaming)'}
                                </h2>
                                <p className="mt-2 text-xs text-stone-600">Saksikan momen bahagia pernikahan kami dari mana saja</p>
                                <a
                                    href={invitation.streaming_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-rose-500 transition"
                                >
                                    Tonton Live Streaming
                                </a>
                            </section>
                        );

                    case 'RSVP':
                        return (
                            <section key={section.id} className="px-4">
                                <RsvpSection
                                    slug={invitation.slug}
                                    events={events}
                                    resolvedGuest={resolvedGuest}
                                    turnstileSiteKey={turnstileSiteKey}
                                />
                            </section>
                        );

                    case 'WISHES':
                        return (
                            <section key={section.id} className="px-4 max-w-2xl mx-auto">
                                <h2 className={`text-center text-3xl font-bold ${themeClasses.headerFont} ${themeClasses.accentText}`}>
                                    {section.custom_title || 'Ucapan & Doa Restu'}
                                </h2>
                                <div className="mt-8 space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {wishes.map((w) => (
                                        <div key={w.id} className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                                            <p className="font-semibold text-sm text-stone-800">{w.name}</p>
                                            <p className="text-xs text-stone-600 mt-1 leading-relaxed">{w.message}</p>
                                        </div>
                                    ))}
                                    {wishes.length === 0 && (
                                        <p className="text-center text-xs text-stone-400">Belum ada ucapan. Jadilah yang pertama memberikan doa restu!</p>
                                    )}
                                </div>
                            </section>
                        );

                    case 'CLOSING':
                        return (
                            <section key={section.id} className="text-center px-4 max-w-xl mx-auto">
                                <h3 className={`text-2xl font-bold ${themeClasses.headerFont} ${themeClasses.accentText}`}>
                                    {section.custom_title || 'Terima Kasih'}
                                </h3>
                                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                                    Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu bagi kami berdua.
                                </p>
                                <p className={`mt-6 text-xl font-bold ${themeClasses.headerFont} text-stone-800`}>
                                    {invitation.groom_name} &amp; {invitation.bride_name}
                                </p>
                            </section>
                        );

                    default:
                        return null;
                }
            })}

            {/* Footer Watermark */}
            {!invitation.package?.remove_watermark && (
                <footer className="text-center py-8">
                    <a
                        href={usePage<PageProps>().props.branding?.watermark_link || 'https://wedinvite.com'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-stone-400 hover:text-stone-600 transition"
                    >
                        {usePage<PageProps>().props.branding?.watermark_text || 'Powered by WedInvite'}
                    </a>
                </footer>
            )}
        </div>
    );
}
