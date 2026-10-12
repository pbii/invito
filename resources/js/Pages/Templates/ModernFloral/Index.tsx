import AudioPlayer from '@/Components/invitation/AudioPlayer';
import RsvpSection from '@/Components/invitation/RsvpSection';
import { Event, GalleryPhoto, Invitation, InvitationBankAccount, InvitationSection, LoveStory, PageProps, Wish } from '@/types';
import { formatIndonesianDate } from '@/Utils/date';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import FloralPetalsCanvas from './FloralPetalsCanvas';
import './modern-floral.css';

interface ModernFloralProps {
    invitation: Invitation;
    sections: InvitationSection[];
    events: Event[];
    bankAccounts: InvitationBankAccount[];
    loveStories: LoveStory[];
    galleryPhotos: GalleryPhoto[];
    wishes: Wish[];
    guestToken?: string;
    turnstileSiteKey?: string;
}

export default function ModernFloral({
    invitation,
    sections,
    events,
    bankAccounts,
    loveStories,
    galleryPhotos,
    wishes,
    guestToken,
    turnstileSiteKey,
}: ModernFloralProps) {
    const { branding } = usePage<PageProps>().props;
    const [isCoverOpen, setIsCoverOpen] = useState(false);
    const [autoPlayAudio, setAutoPlayAudio] = useState(false);
    const [resolvedGuest, setResolvedGuest] = useState<{ id: string; name: string; category?: string; max_pax?: number; allowed_event_ids?: string[] } | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [showQrisModal, setShowQrisModal] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Wishes local state for real-time optimistic update
    const [wishesList, setWishesList] = useState<Wish[]>(wishes || []);
    const { data: wishData, setData: setWishData, post: postWish, processing: wishProcessing, reset: resetWish } = useForm({
        name: '',
        message: '',
    });

    // Resolve guest token
    useEffect(() => {
        if (guestToken) {
            axios.get(`/api/guests/resolve?token=${guestToken}`).then((res) => {
                if (res.data?.valid && res.data.guest) {
                    setResolvedGuest(res.data.guest);
                    setWishData('name', res.data.guest.name);
                }
            }).catch(() => null);
        }
    }, [guestToken]);

    // Scroll progress bar and scroll-to-top visibility
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollPercent(Math.min(100, Math.max(0, progress)));
            setShowScrollTop(scrollTop > 450);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // IntersectionObserver for scroll-reveal animations
    useEffect(() => {
        if (!isCoverOpen) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px',
            }
        );

        const elements = document.querySelectorAll('.reveal-on-scroll');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [isCoverOpen, sections]);

    // Countdown logic
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

    const handleOpenInvitation = () => {
        setIsCoverOpen(true);
        setAutoPlayAudio(true);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleWishSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postWish(route('public.wishes.store', invitation.slug), {
            preserveScroll: true,
            onSuccess: () => {
                setWishesList((prev) => [
                    {
                        id: Math.random().toString(),
                        invitation_id: invitation.id,
                        name: wishData.name,
                        message: wishData.message,
                        is_visible: true,
                        created_at: 'Baru saja',
                    },
                    ...prev,
                ]);
                resetWish('message');
            },
        });
    };

    const formattedEventDate = earliestDate
        ? formatIndonesianDate(earliestDate, { withDayName: true })
        : 'Sabtu, 21 November 2026';

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        `Pernikahan ${invitation.groom_name} & ${invitation.bride_name}`
    )}&dates=${earliestDate ? new Date(earliestDate).toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 15) : '20261121T020000Z'}/${
        earliestDate ? new Date(earliestDate).toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 15) : '20261121T140000Z'
    }&details=${encodeURIComponent('The Wedding of ' + invitation.groom_name + ' & ' + invitation.bride_name)}&location=${encodeURIComponent(
        events[0]?.venue_name || 'Lokasi Acara'
    )}`;

    // Normalize section keys
    const getNormalizedKey = (rawKey: string): string => {
        const k = (rawKey || '').toUpperCase().trim();
        if (k === 'EVENT' || k === 'EVENTS') return 'EVENTS';
        if (k === 'LOVE_STORY' || k === 'STORY') return 'STORY';
        if (k === 'GIFT' || k === 'BANK_TRANSFER') return 'GIFT';
        if (k === 'CLOSING' || k === 'FOOTNOTE') return 'CLOSING';
        return k;
    };

    const enabledSections = [...sections]
        .filter((s) => s.is_enabled)
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-rose-50/70 via-[#FFFDF9] to-rose-50/50 text-stone-800 font-sans selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden">
            <Head>
                <title>{`The Wedding of ${invitation.groom_name} & ${invitation.bride_name}`}</title>
                <meta name="description" content={`Undangan pernikahan ${invitation.groom_name} & ${invitation.bride_name}`} />
            </Head>

            {/* Interactive Petals Canvas Simulation */}
            <FloralPetalsCanvas />

            {/* Top Reading Progress Bar */}
            {isCoverOpen && (
                <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-rose-100/60 backdrop-blur-xs">
                    <div
                        className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-amber-300 transition-all duration-150"
                        style={{ width: `${scrollPercent}%` }}
                    />
                </div>
            )}

            {/* Audio Player Component */}
            <AudioPlayer musicUrl={invitation.music_url} autoPlayTrigger={autoPlayAudio} />

            {/* Floating Scroll to Top Button */}
            {isCoverOpen && showScrollTop && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    aria-label="Kembali ke atas"
                    className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-rose-700 shadow-xl border border-rose-200/80 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-rose-50 active:scale-95"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            )}

            {/* ======================================================== */}
            {/* FULLSCREEN FLORAL COVER OVERLAY                          */}
            {/* ======================================================== */}
            <section
                className={`fixed inset-0 z-50 flex flex-col items-center justify-between px-6 py-12 text-center transition-all duration-1000 ease-in-out ${
                    isCoverOpen
                        ? 'pointer-events-none -translate-y-full opacity-0'
                        : 'opacity-100 translate-y-0'
                }`}
                style={{
                    backgroundColor: '#1C1917',
                    backgroundImage: invitation.groom_photo || invitation.bride_photo
                        ? `linear-gradient(rgba(28, 25, 23, 0.72), rgba(28, 25, 23, 0.88)), url(${invitation.groom_photo || invitation.bride_photo})`
                        : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Decorative Floral Top Badge */}
                <div className="pt-6 animate-float-gentle">
                    <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/40 bg-white/10 px-4 py-1.5 text-xs tracking-widest text-rose-200 uppercase backdrop-blur-md">
                        <svg className="w-3.5 h-3.5 text-rose-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        The Wedding Celebration
                    </span>
                    <h1 className="mt-5 font-serif text-4xl sm:text-6xl font-normal tracking-wide text-rose-100">
                        {invitation.groom_name}
                        <span className="block my-1 text-2xl font-sans text-rose-300">&amp;</span>
                        {invitation.bride_name}
                    </h1>
                </div>

                {/* Recipient Card */}
                <div className="my-auto max-w-sm w-full rounded-3xl border border-white/20 bg-stone-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                    <p className="text-xs font-light tracking-widest text-stone-300 uppercase">
                        Kepada Yth. Bapak/Ibu/Saudara/i:
                    </p>
                    <h2 className="mt-2 text-2xl font-serif font-bold text-white tracking-wide">
                        {resolvedGuest?.name || 'Tamu Undangan Terhormat'}
                    </h2>
                    {resolvedGuest?.category && (
                        <span className="mt-2 inline-block rounded-full bg-rose-500/30 border border-rose-400/40 px-3 py-0.5 text-[11px] font-medium text-rose-200 tracking-wider">
                            {resolvedGuest.category}
                        </span>
                    )}
                    <p className="mt-3 text-xs text-stone-400 leading-relaxed">
                        Merupakan suatu kehormatan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.
                    </p>

                    <button
                        type="button"
                        onClick={handleOpenInvitation}
                        className="mt-6 inline-flex items-center justify-center gap-2.5 w-full rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-rose-900/40 transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95"
                    >
                        <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5m0 0l-2.25 1.5-2.25-1.5" />
                        </svg>
                        Buka Undangan
                    </button>
                </div>

                <p className="text-[11px] text-stone-400 tracking-wider">
                    {formattedEventDate}
                </p>
            </section>

            {/* ======================================================== */}
            {/* MAIN INVITATION CONTENT (SCROLLABLE)                     */}
            {/* ======================================================== */}
            <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-24">
                {/* HERO HEADER */}
                <header className="reveal-on-scroll text-center space-y-4 pt-4">
                    <div className="inline-flex items-center gap-3">
                        <span className="h-px w-10 bg-rose-300" />
                        <span className="text-xs font-semibold tracking-widest text-rose-800 uppercase">Walimatul &apos;Ursy</span>
                        <span className="h-px w-10 bg-rose-300" />
                    </div>
                    <h1 className="font-serif text-4xl sm:text-6xl font-bold text-stone-900 tracking-tight">
                        {invitation.groom_name} <span className="text-rose-600 font-normal">&amp;</span> {invitation.bride_name}
                    </h1>
                    <p className="text-sm sm:text-base text-stone-600 font-light max-w-lg mx-auto">
                        Kami mengundang Anda untuk merayakan cinta dan menyatukan dua hati dalam ikatan suci pernikahan.
                    </p>
                </header>

                {/* DYNAMIC SECTIONS LOOP */}
                {enabledSections.map((section) => {
                    const key = getNormalizedKey(section.section_key);

                    switch (key) {
                        case 'QUOTE':
                            return (
                                <section key={section.id} className="reveal-on-scroll text-center max-w-2xl mx-auto px-4">
                                    <div className="floral-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-rose-200/30 blur-xl pointer-events-none" />
                                        <div className="w-10 h-10 mx-auto rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mb-4 shadow-xs">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                            </svg>
                                        </div>
                                        <p className="font-serif italic text-stone-700 text-base sm:text-lg leading-relaxed">
                                            &ldquo;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.&rdquo;
                                        </p>
                                        <p className="mt-4 text-xs font-semibold tracking-widest text-rose-700 uppercase">
                                            (QS. Ar-Rum: 21)
                                        </p>
                                    </div>
                                </section>
                            );

                        case 'COUPLE':
                            return (
                                <section key={section.id} className="reveal-on-scroll text-center space-y-12">
                                    <div>
                                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-rose-900">
                                            {section.custom_title || 'Mempelai Pria & Wanita'}
                                        </h2>
                                        <p className="mt-2 text-stone-600 text-sm max-w-md mx-auto">
                                            Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami mengumumkan pernikahan kami:
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
                                        {/* Groom */}
                                        <div className="floral-card rounded-3xl p-8 flex flex-col items-center group transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                                            <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-rose-200/80 shadow-lg bg-stone-100 transition duration-500 group-hover:scale-105">
                                                {invitation.groom_photo ? (
                                                    <img src={invitation.groom_photo} alt={invitation.groom_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-4xl text-rose-300 font-serif">Pria</div>
                                                )}
                                            </div>
                                            <h3 className="mt-6 font-serif text-2xl font-bold text-stone-900">
                                                {invitation.groom_name}
                                            </h3>
                                            {(invitation.groom_father || invitation.groom_mother) && (
                                                <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                                                    Putra dari Bpk. {invitation.groom_father || '-'} &amp; Ibu {invitation.groom_mother || '-'}
                                                </p>
                                            )}
                                        </div>

                                        {/* Bride */}
                                        <div className="floral-card rounded-3xl p-8 flex flex-col items-center group transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                                            <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-rose-200/80 shadow-lg bg-stone-100 transition duration-500 group-hover:scale-105">
                                                {invitation.bride_photo ? (
                                                    <img src={invitation.bride_photo} alt={invitation.bride_name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-4xl text-rose-300 font-serif">Wanita</div>
                                                )}
                                            </div>
                                            <h3 className="mt-6 font-serif text-2xl font-bold text-stone-900">
                                                {invitation.bride_name}
                                            </h3>
                                            {(invitation.bride_father || invitation.bride_mother) && (
                                                <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                                                    Putri dari Bpk. {invitation.bride_father || '-'} &amp; Ibu {invitation.bride_mother || '-'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            );

                        case 'COUNTDOWN':
                            return (
                                <section key={section.id} className="reveal-on-scroll text-center space-y-6">
                                    <h2 className="font-serif text-3xl font-bold text-rose-900">
                                        {section.custom_title || 'Hitung Mundur Menuju Hari Bahagia'}
                                    </h2>
                                    <p className="text-sm text-stone-600">{formattedEventDate}</p>

                                    <div className="flex justify-center gap-3 sm:gap-6">
                                        {[
                                            { label: 'Hari', val: timeLeft.days },
                                            { label: 'Jam', val: timeLeft.hours },
                                            { label: 'Menit', val: timeLeft.minutes },
                                            { label: 'Detik', val: timeLeft.seconds },
                                        ].map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="floral-card flex flex-col items-center rounded-2xl p-4 sm:p-5 w-20 sm:w-24 shadow-sm border border-rose-200/80"
                                            >
                                                <span className="text-2xl sm:text-4xl font-bold font-serif text-rose-800">
                                                    {item.val}
                                                </span>
                                                <span className="text-[10px] sm:text-xs font-medium text-stone-500 uppercase tracking-widest mt-1">
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-2">
                                        <a
                                            href={googleCalendarUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-white/90 px-6 py-2.5 text-xs font-semibold text-rose-800 shadow-xs hover:bg-rose-50 transition hover:scale-105 active:scale-95"
                                        >
                                            <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Simpan ke Google Calendar
                                        </a>
                                    </div>
                                </section>
                            );

                        case 'EVENTS': {
                            const isOdd = events.length % 2 !== 0;

                            return (
                                <section key={section.id} className="reveal-on-scroll space-y-10">
                                    <div className="text-center">
                                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-rose-900">
                                            {section.custom_title || 'Rangkaian Acara'}
                                        </h2>
                                        <p className="mt-2 text-stone-600 text-sm">
                                            Informasi waktu dan tempat pelaksanaan acara pernikahan kami:
                                        </p>
                                    </div>

                                    <div className={`mt-8 ${isOdd ? 'max-w-xl mx-auto space-y-8' : 'grid grid-cols-1 md:grid-cols-2 gap-8'}`}>
                                        {events.map((evt) => (
                                            <div
                                                key={evt.id}
                                                className="floral-card rounded-3xl p-8 text-center flex flex-col justify-between transition duration-300 hover:shadow-xl"
                                            >
                                                <div>
                                                    <span className="inline-block rounded-full bg-rose-100 text-rose-800 px-4 py-1 text-xs font-semibold tracking-wider uppercase mb-4 border border-rose-200">
                                                        {evt.event_name}
                                                    </span>
                                                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                                                        {formatIndonesianDate(evt.date, { withDayName: true })}
                                                    </h3>
                                                    <p className="mt-2 text-sm font-medium text-rose-700">
                                                        Pukul {evt.time_start || '08:00'} - {evt.time_end || 'Selesai'} WIB
                                                    </p>
                                                    <div className="mt-4 pt-4 border-t border-rose-100">
                                                        <h4 className="font-semibold text-stone-900">{evt.venue_name}</h4>
                                                        {evt.address && (
                                                            <p className="mt-1 text-xs sm:text-sm text-stone-600 leading-relaxed">
                                                                {evt.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {evt.latitude && evt.longitude && (
                                                    <div className="mt-6 pt-2">
                                                        <a
                                                            href={`https://www.google.com/maps/search/?api=1&query=${evt.latitude},${evt.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-medium text-white shadow-md hover:bg-stone-800 hover:scale-105 transition"
                                                        >
                                                            <svg className="w-4 h-4 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            Petunjuk Google Maps
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        case 'STORY':
                            if (loveStories.length === 0) return null;
                            return (
                                <section key={section.id} className="reveal-on-scroll max-w-2xl mx-auto space-y-10">
                                    <div className="text-center">
                                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-rose-900">
                                            {section.custom_title || 'Kisah Cinta Kami'}
                                        </h2>
                                        <p className="mt-2 text-stone-600 text-sm">
                                            Langkah-langkah berharga yang menuntun kami menuju ikatan suci ini:
                                        </p>
                                    </div>

                                    <div className="relative pl-6 sm:pl-8 border-l-2 border-rose-200 space-y-8">
                                        {loveStories.map((story) => (
                                            <div key={story.id} className="relative group">
                                                {/* Bullet marker */}
                                                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-rose-500 shadow-md group-hover:scale-125 transition" />
                                                <div className="floral-card rounded-2xl p-6 transition duration-300 hover:shadow-lg">
                                                    {story.date && (
                                                        <span className="text-xs font-semibold text-rose-700 tracking-wider">
                                                            {formatIndonesianDate(story.date)}
                                                        </span>
                                                    )}
                                                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 mt-1">
                                                        {story.title}
                                                    </h3>
                                                    <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
                                                        {story.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );

                        case 'GALLERY':
                            if (galleryPhotos.length === 0) return null;
                            return (
                                <section key={section.id} className="reveal-on-scroll space-y-10">
                                    <div className="text-center">
                                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-rose-900">
                                            {section.custom_title || 'Galeri Kenangan'}
                                        </h2>
                                        <p className="mt-2 text-stone-600 text-sm">
                                            Momen-momen indah dalam perjalanan kami:
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {galleryPhotos.map((photo, idx) => (
                                            <div
                                                key={photo.id || idx}
                                                onClick={() => setSelectedPhotoIndex(idx)}
                                                className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-100 shadow-md cursor-pointer"
                                            >
                                                <img
                                                    src={photo.photo_url}
                                                    alt={photo.caption || 'Foto Galeri'}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
                                                    <span className="text-xs text-white line-clamp-1">{photo.caption || 'Perbesar Foto'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );

                        case 'GIFT':
                            return (
                                <section key={section.id} className="reveal-on-scroll max-w-2xl mx-auto space-y-8 text-center">
                                    <div>
                                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-rose-900">
                                            {section.custom_title || 'Tanda Kasih & Amplop Digital'}
                                        </h2>
                                        <p className="mt-2 text-stone-600 text-sm leading-relaxed">
                                            Doa restu Anda merupakan karunia terindah bagi kami. Bagi yang berkenan memberikan tanda kasih:
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {bankAccounts.map((acc, idx) => (
                                            <div
                                                key={acc.id || idx}
                                                className="floral-card rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left"
                                            >
                                                <div>
                                                    <span className="text-xs font-bold text-rose-700 tracking-wider uppercase">
                                                        {acc.bank_or_wallet_name}
                                                    </span>
                                                    <p className="font-mono text-xl font-bold text-stone-900 mt-1">
                                                        {acc.account_number}
                                                    </p>
                                                    <p className="text-xs text-stone-500">a.n. {acc.account_holder}</p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(acc.account_number, idx)}
                                                    className="w-full sm:w-auto rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-500 transition active:scale-95 flex items-center justify-center gap-1.5"
                                                >
                                                    {copiedIndex === idx ? (
                                                        <>
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Tersalin!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            Salin Nomor
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        ))}

                                        {/* QRIS Option */}
                                        {invitation.qris_image_url && (
                                            <div className="pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowQrisModal(true)}
                                                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-white px-6 py-3 text-xs font-semibold text-rose-800 shadow-sm hover:bg-rose-50 transition hover:scale-105 active:scale-95"
                                                >
                                                    <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                    </svg>
                                                    Buka QRIS Pembayaran
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            );

                        case 'RSVP':
                            return (
                                <section key={section.id} className="reveal-on-scroll max-w-2xl mx-auto space-y-8">
                                    <div className="text-center">
                                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-rose-900">
                                            {section.custom_title || 'Konfirmasi Kehadiran (RSVP)'}
                                        </h2>
                                        <p className="mt-2 text-stone-600 text-sm">
                                            Mohon konfirmasikan kehadiran Anda untuk mempermudah persiapan kami:
                                        </p>
                                    </div>

                                    <div className="floral-card rounded-3xl p-6 sm:p-8">
                                        <RsvpSection
                                            slug={invitation.slug}
                                            events={events}
                                            resolvedGuest={resolvedGuest}
                                            turnstileSiteKey={turnstileSiteKey}
                                        />
                                    </div>
                                </section>
                            );

                        case 'WISHES':
                            return (
                                <section key={section.id} className="reveal-on-scroll max-w-2xl mx-auto space-y-8">
                                    <div className="text-center">
                                        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-rose-900">
                                            {section.custom_title || 'Doa Restu & Ucapan Bahagia'}
                                        </h2>
                                        <p className="mt-2 text-stone-600 text-sm">
                                            Tuliskan untaian doa dan harapan terbaik Anda bagi kedua mempelai:
                                        </p>
                                    </div>

                                    <div className="floral-card rounded-3xl p-6 sm:p-8">
                                        <form onSubmit={handleWishSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                                                    Nama Anda
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={wishData.name}
                                                    onChange={(e) => setWishData('name', e.target.value)}
                                                    placeholder="Contoh: Bpk. Bambang & Keluarga"
                                                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                                                    Ucapan &amp; Doa Restu
                                                </label>
                                                <textarea
                                                    required
                                                    rows={3}
                                                    value={wishData.message}
                                                    onChange={(e) => setWishData('message', e.target.value)}
                                                    placeholder="Tuliskan doa restu yang tulus..."
                                                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={wishProcessing}
                                                className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105 transition disabled:opacity-50"
                                            >
                                                {wishProcessing ? 'Mengirimkan...' : 'Kirim Ucapan'}
                                            </button>
                                        </form>

                                        {/* Wishes List */}
                                        <div className="mt-8 space-y-3 max-h-96 overflow-y-auto pr-1">
                                            {wishesList.map((w) => (
                                                <div key={w.id} className="rounded-xl border border-rose-100 bg-white p-4 shadow-xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold text-sm text-stone-900">{w.name}</span>
                                                        <span className="text-[10px] text-stone-400">{w.created_at || 'Baru saja'}</span>
                                                    </div>
                                                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{w.message}</p>
                                                </div>
                                            ))}
                                            {wishesList.length === 0 && (
                                                <p className="text-center text-xs text-stone-400 py-4">
                                                    Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            );

                        case 'CLOSING':
                            return (
                                <section key={section.id} className="reveal-on-scroll text-center max-w-xl mx-auto space-y-4">
                                    <h2 className="font-serif text-3xl font-bold text-rose-900">
                                        {section.custom_title || 'Terima Kasih'}
                                    </h2>
                                    <p className="text-sm text-stone-600 leading-relaxed">
                                        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
                                    </p>
                                    <p className="font-serif text-2xl font-bold text-stone-900 pt-4">
                                        {invitation.groom_name} &amp; {invitation.bride_name}
                                    </p>
                                </section>
                            );

                        default:
                            return null;
                    }
                })}

                {/* FOOTER WATERMARK */}
                {!invitation.package?.remove_watermark && (
                    <footer className="reveal-on-scroll text-center pt-12 pb-6 border-t border-rose-100">
                        <a
                            href={branding?.watermark_link || 'https://wedinvite.com'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-stone-400 hover:text-stone-600 transition"
                        >
                            {branding?.watermark_text || 'Powered by WedInvite'}
                        </a>
                    </footer>
                )}
            </main>

            {/* ======================================================== */}
            {/* PHOTO LIGHTBOX MODAL                                     */}
            {/* ======================================================== */}
            {selectedPhotoIndex !== null && galleryPhotos[selectedPhotoIndex] && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4"
                    onClick={() => setSelectedPhotoIndex(null)}
                >
                    <div
                        className="relative max-w-3xl max-h-[85vh] w-full flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setSelectedPhotoIndex(null)}
                            className="absolute -top-12 right-0 text-white/80 hover:text-white p-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <img
                            src={galleryPhotos[selectedPhotoIndex].photo_url}
                            alt="Preview"
                            className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
                        />

                        {galleryPhotos[selectedPhotoIndex].caption && (
                            <p className="mt-4 text-xs sm:text-sm text-stone-200 text-center">
                                {galleryPhotos[selectedPhotoIndex].caption}
                            </p>
                        )}

                        {/* Navigation controls */}
                        <div className="flex items-center gap-6 mt-4">
                            <button
                                type="button"
                                disabled={selectedPhotoIndex === 0}
                                onClick={() => setSelectedPhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
                                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 disabled:opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="text-xs text-stone-300">
                                {selectedPhotoIndex + 1} / {galleryPhotos.length}
                            </span>
                            <button
                                type="button"
                                disabled={selectedPhotoIndex === galleryPhotos.length - 1}
                                onClick={() => setSelectedPhotoIndex((prev) => (prev !== null && prev < galleryPhotos.length - 1 ? prev + 1 : prev))}
                                className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30 disabled:opacity-30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* QRIS POPUP MODAL                                         */}
            {/* ======================================================== */}
            {showQrisModal && invitation.qris_image_url && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-sm p-4"
                    onClick={() => setShowQrisModal(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowQrisModal(false)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h3 className="font-serif text-xl font-bold text-stone-900">Scan QRIS</h3>
                        <p className="text-xs text-stone-500 mt-1 mb-4">
                            Gunakan aplikasi BCA, Mandiri, GoPay, OVO, ShopeePay, atau bank lainnya:
                        </p>

                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 inline-block shadow-inner">
                            <img
                                src={invitation.qris_image_url}
                                alt="QRIS"
                                className="w-52 h-52 object-contain mx-auto"
                            />
                        </div>

                        <p className="mt-4 text-[11px] text-stone-400">
                            {invitation.groom_name} &amp; {invitation.bride_name}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
