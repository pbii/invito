import AudioPlayer from '@/Components/invitation/AudioPlayer';
import RsvpSection from '@/Components/invitation/RsvpSection';
import { Event, GalleryPhoto, Invitation, InvitationBankAccount, InvitationSection, LoveStory, PageProps, Wish } from '@/types';
import { formatIndonesianDate } from '@/Utils/date';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './eloise.css';

interface EloiseEditorialProps {
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

export default function EloiseEditorial({
    invitation,
    events,
    bankAccounts,
    loveStories,
    galleryPhotos,
    wishes,
    guestToken,
    turnstileSiteKey,
}: EloiseEditorialProps) {
    const [isCoverOpen, setIsCoverOpen] = useState(false);
    const [autoPlayAudio, setAutoPlayAudio] = useState(false);
    const [resolvedGuest, setResolvedGuest] = useState<{ id: string; name: string; category?: string; max_pax?: number; allowed_event_ids?: string[] } | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [showQrisModal, setShowQrisModal] = useState(false);
    const [scrollPercent, setScrollPercent] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Wishes local state for immediate feedback
    const [wishesList, setWishesList] = useState<Wish[]>(wishes || []);
    const { data: wishData, setData: setWishData, post: postWish, processing: wishProcessing, reset: resetWish } = useForm({
        name: '',
        message: '',
    });

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

    // Section-by-Section Isolated Observer
    useEffect(() => {
        if (!isCoverOpen) return;

        // Reveal the first section gently after cover opens
        const timer = setTimeout(() => {
            const firstSec = document.querySelector('.editorial-section');
            if (firstSec) {
                firstSec.classList.add('is-revealed');
            }
        }, 350);

        // Strict section-level observer to prevent premature triggers
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                    }
                });
            },
            {
                threshold: 0.2, // Must be 20% visible inside screen
                rootMargin: '0px 0px -18% 0px', // Delay trigger until scrolled close to it
            }
        );

        const sections = document.querySelectorAll('.editorial-section');
        sections.forEach((sec) => observer.observe(sec));

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [isCoverOpen]);

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

    // Formatted event date
    const formattedDate = earliestDate
        ? formatIndonesianDate(earliestDate, { withDayName: true })
        : 'Sabtu, 25 Juli 2026';

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        `Pernikahan ${invitation.groom_name} & ${invitation.bride_name}`
    )}&dates=${earliestDate ? new Date(earliestDate).toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 15) : '20260725T020000Z'}/${
        earliestDate ? new Date(earliestDate).toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 15) : '20260725T140000Z'
    }&details=${encodeURIComponent('Undangan Pernikahan Digital')}&location=${encodeURIComponent(
        events[0]?.venue_name || 'Lokasi Acara'
    )}`;

    return (
        <div className="relative min-h-screen bg-[#FFFFFF] text-[#353A20] font-roboto selection:bg-[#353A20]/20 selection:text-[#353A20] antialiased overflow-x-hidden">
            <Head title={`The Wedding of ${invitation.groom_name} & ${invitation.bride_name}`} />

            {/* Top Reading Progress Bar */}
            {isCoverOpen && (
                <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-[#353A20]/10 backdrop-blur-xs">
                    <div
                        className="h-full bg-gradient-to-r from-[#353A20] via-[#5C6438] to-[#C5A880] transition-all duration-150"
                        style={{ width: `${scrollPercent}%` }}
                    />
                </div>
            )}

            <AudioPlayer musicUrl={invitation.music_url} autoPlayTrigger={autoPlayAudio} />

            {/* Floating Back to Top Button */}
            {isCoverOpen && showScrollTop && (
                <button
                    type="button"
                    onClick={scrollToTop}
                    aria-label="Kembali ke atas"
                    className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#FBF7F0] text-[#353A20] shadow-xl border border-[#353A20]/20 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            )}

            {/* ======================================================== */}
            {/* FULLSCREEN OPENING GATE OVERLAY (Katsudoto Style Gate)  */}
            {/* ======================================================== */}
            <div
                className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#FBF7F0] p-6 text-center text-[#353A20] transition-all duration-1000 ease-in-out ${
                    isCoverOpen
                        ? 'pointer-events-none -translate-y-full opacity-0'
                        : 'opacity-100 translate-y-0'
                }`}
            >
                {/* Background subtle botanical pattern overlay */}
                <div className="absolute inset-0 bg-radial from-stone-100/40 via-transparent to-stone-200/40 pointer-events-none" />

                {/* Top Monogram & Subtitle */}
                <div className="relative z-10 pt-8 space-y-2 animate-float-gentle">
                    <span className="inline-block px-3 py-1 text-[11px] font-mono tracking-widest uppercase bg-[#353A20]/10 text-[#353A20] rounded-full">
                        {resolvedGuest?.category || 'VIP GUEST'}
                    </span>
                    <h2 className="font-cormorant text-4xl sm:text-5xl font-semibold tracking-tight">
                        {invitation.groom_name} &amp; {invitation.bride_name}
                    </h2>
                    <p className="font-ovo text-xs tracking-widest uppercase text-[#8A7B6B]">
                        Wedding Invitation
                    </p>
                </div>

                {/* Arched Photo Frame (Katsudoto Cathedral Silhouette) */}
                <div className="relative z-10 my-auto w-64 h-84 sm:w-72 sm:h-96 rounded-t-full rounded-b-2xl overflow-hidden border-4 border-[#353A20]/15 shadow-2xl bg-[#EBE5DA] p-1.5 transition-transform duration-700 hover:scale-105">
                    <div className="w-full h-full rounded-t-full rounded-b-xl overflow-hidden bg-stone-200">
                        {invitation.groom_photo || invitation.bride_photo ? (
                            <img
                                src={invitation.groom_photo || invitation.bride_photo || ''}
                                alt={`${invitation.groom_name} & ${invitation.bride_name}`}
                                className="w-full h-full object-cover object-top"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center font-cormorant text-5xl text-[#353A20]/40">
                                {invitation.groom_name.charAt(0)}&amp;{invitation.bride_name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Greeting & Open Invitation Trigger Button */}
                <div className="relative z-10 pb-8 space-y-4 max-w-sm w-full">
                    <div className="space-y-0.5">
                        <p className="font-ovo text-xs text-[#8A7B6B]">Kepada Yth. Bapak/Ibu/Saudara/i:</p>
                        <h3 className="font-cormorant text-2xl font-bold text-[#353A20]">
                            {resolvedGuest?.name || 'Tamu Undangan'}
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenInvitation}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#353A20] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-[#F5F0E8] shadow-lg shadow-[#353A20]/25 hover:bg-[#252A15] transition transform hover:scale-105 active:scale-95"
                    >
                        <svg className="w-4 h-4 text-[#F5F0E8] animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5m0 0l-2.25 1.5-2.25-1.5" />
                        </svg>
                        <span>Buka Undangan</span>
                    </button>
                </div>
            </div>

            {/* ======================================================== */}
            {/* DESKTOP SPLIT SCREEN / MOBILE SINGLE PANE CONTAINER      */}
            {/* ======================================================== */}
            <div className="lg:flex min-h-screen">
                {/* ---------------------------------------------------- */}
                {/* LEFT PRIMARY PANE (Fixed on Desktop min-width: 961px) */}
                {/* ---------------------------------------------------- */}
                <aside className="hidden lg:flex lg:w-5/12 xl:w-1/2 sticky top-0 h-screen bg-[#FBF7F0] border-r border-[#353A20]/10 flex-col justify-between p-12 text-[#353A20] relative overflow-hidden">
                    {/* Background Soft Glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#353A20]/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-2">
                        <span className="inline-block px-3 py-1 text-[11px] font-mono tracking-widest uppercase bg-[#353A20]/10 text-[#353A20] rounded-full">
                            {resolvedGuest?.category || 'VIP GUEST'}
                        </span>
                        <p className="font-ovo text-xs tracking-widest uppercase text-[#8A7B6B]">The Wedding Of</p>
                        <h1 className="font-cormorant text-5xl xl:text-6xl font-bold tracking-tight text-[#353A20]">
                            {invitation.groom_name} &amp; {invitation.bride_name}
                        </h1>
                        <p className="font-ovo text-sm italic text-[#8A7B6B]">#{invitation.groom_name}To{invitation.bride_name}</p>
                    </div>

                    {/* Large Cathedral Arched Highlight Portrait */}
                    <div className="relative z-10 my-auto mx-auto w-64 xl:w-72 h-88 xl:h-96 rounded-t-full rounded-b-2xl overflow-hidden border-4 border-[#353A20]/15 shadow-2xl bg-[#EBE5DA] p-1.5 transition-transform duration-700 hover:scale-105">
                        <div className="w-full h-full rounded-t-full rounded-b-xl overflow-hidden bg-stone-200">
                            {invitation.groom_photo || invitation.bride_photo ? (
                                <img
                                    src={invitation.groom_photo || invitation.bride_photo || ''}
                                    alt={`${invitation.groom_name} & ${invitation.bride_name}`}
                                    className="w-full h-full object-cover object-top"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-cormorant text-5xl text-[#353A20]/40">
                                    {invitation.groom_name.charAt(0)}&amp;{invitation.bride_name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative z-10 pt-4 border-t border-[#353A20]/10 flex items-center justify-between text-xs">
                        <div>
                            <p className="text-[#8A7B6B]">Kepada Yth:</p>
                            <p className="font-bold font-cormorant text-lg text-[#353A20]">{resolvedGuest?.name || 'Tamu Undangan'}</p>
                        </div>
                        <div className="text-right text-[#8A7B6B] font-mono text-[11px]">
                            {formattedDate}
                        </div>
                    </div>
                </aside>

                {/* ---------------------------------------------------- */}
                {/* RIGHT SECONDARY PANE (Scrollable Content Flow)       */}
                {/* ---------------------------------------------------- */}
                <main className="lg:w-7/12 xl:w-1/2 w-full max-w-2xl mx-auto px-4 sm:px-8 py-16 space-y-24 sm:space-y-32 bg-white">
                    {/* SECTION 1: HERO / COVER (Mobile view) */}
                    <section className="editorial-section text-center space-y-6 pt-4 lg:hidden">
                        <div className="flow-item-1 space-y-2">
                            <span className="inline-block px-3 py-1 text-[11px] font-mono tracking-widest uppercase bg-[#353A20]/10 text-[#353A20] rounded-full">
                                WEDDING INVITATION
                            </span>
                            <h1 className="font-cormorant text-5xl font-bold tracking-tight text-[#353A20]">
                                {invitation.groom_name} &amp; {invitation.bride_name}
                            </h1>
                            <p className="font-ovo text-sm italic text-[#8A7B6B]">#{invitation.groom_name}To{invitation.bride_name}</p>
                        </div>

                        <div className="flow-item-2 mx-auto w-60 h-80 rounded-t-full rounded-b-2xl overflow-hidden border-4 border-[#353A20]/15 shadow-xl bg-[#EBE5DA] p-1.5 transition-transform duration-500 hover:scale-105">
                            <div className="w-full h-full rounded-t-full rounded-b-xl overflow-hidden bg-stone-200">
                                {invitation.groom_photo || invitation.bride_photo ? (
                                    <img src={invitation.groom_photo || invitation.bride_photo || ''} alt="" className="w-full h-full object-cover object-top" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-cormorant text-4xl text-[#353A20]/40">
                                        Wedding
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>

                    {/* SECTION 2: QUOTE (Maya Angelou Inspired Editorial Card) */}
                    <section className="editorial-section rounded-3xl bg-[#FBF7F0] border border-[#353A20]/10 p-8 sm:p-12 text-center space-y-4 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
                        <div className="flow-item-1">
                            <span className="font-cormorant text-5xl text-[#353A20]/30 leading-none">“</span>
                            <p className="font-ovo text-base sm:text-lg text-[#353A20] leading-relaxed italic max-w-lg mx-auto mt-2">
                                &ldquo;In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine.&rdquo;
                            </p>
                        </div>
                        <div className="flow-item-2">
                            <p className="text-xs font-mono tracking-widest uppercase text-[#8A7B6B] mt-4">&mdash; Maya Angelou</p>
                        </div>
                    </section>

                    <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>

                    {/* SECTION 3: GROOM & BRIDE (Editorial Dual Profiles) */}
                    <section className="editorial-section space-y-12 text-center">
                        <div className="flow-item-1 space-y-1">
                            <h2 className="font-cormorant text-4xl sm:text-5xl font-bold text-[#353A20]">Groom and Bride</h2>
                            <p className="font-ovo text-xs sm:text-sm text-[#8A7B6B] max-w-md mx-auto">
                                Every love story is unique, and ours has led us to this unforgettable day. With joyful hearts, we invite you to celebrate our union.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center">
                            {/* Groom */}
                            <div className="flow-item-2 flex flex-col items-center space-y-3 group">
                                <div className="w-48 h-64 rounded-t-full rounded-b-xl overflow-hidden border-2 border-[#353A20]/20 shadow-md bg-[#EBE5DA] p-1 transition-transform duration-500 group-hover:scale-105">
                                    <div className="w-full h-full rounded-t-full rounded-b-lg overflow-hidden bg-stone-200">
                                        {invitation.groom_photo ? (
                                            <img src={invitation.groom_photo} alt={invitation.groom_name} className="w-full h-full object-cover object-top" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-cormorant text-3xl text-[#353A20]/30">Groom</div>
                                        )}
                                    </div>
                                </div>
                                <span className="font-ovo text-xs uppercase tracking-widest text-[#8A7B6B]">The Groom</span>
                                <h3 className="font-cormorant text-2xl font-bold text-[#353A20]">{invitation.groom_name}</h3>
                                {(invitation.groom_father || invitation.groom_mother) && (
                                    <p className="text-xs text-stone-500 leading-relaxed">
                                        Putra dari Bpk. {invitation.groom_father || '-'} <br /> &amp; Ibu {invitation.groom_mother || '-'}
                                    </p>
                                )}
                            </div>

                            {/* Bride */}
                            <div className="flow-item-3 flex flex-col items-center space-y-3 group">
                                <div className="w-48 h-64 rounded-t-full rounded-b-xl overflow-hidden border-2 border-[#353A20]/20 shadow-md bg-[#EBE5DA] p-1 transition-transform duration-500 group-hover:scale-105">
                                    <div className="w-full h-full rounded-t-full rounded-b-lg overflow-hidden bg-stone-200">
                                        {invitation.bride_photo ? (
                                            <img src={invitation.bride_photo} alt={invitation.bride_name} className="w-full h-full object-cover object-top" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-cormorant text-3xl text-[#353A20]/30">Bride</div>
                                        )}
                                    </div>
                                </div>
                                <span className="font-ovo text-xs uppercase tracking-widest text-[#8A7B6B]">The Bride</span>
                                <h3 className="font-cormorant text-2xl font-bold text-[#353A20]">{invitation.bride_name}</h3>
                                {(invitation.bride_father || invitation.bride_mother) && (
                                    <p className="text-xs text-stone-500 leading-relaxed">
                                        Putri dari Bpk. {invitation.bride_father || '-'} <br /> &amp; Ibu {invitation.bride_mother || '-'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: LOVE STORY TIMELINE */}
                    {loveStories.length > 0 && (
                        <>
                            <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>
                            <section className="editorial-section space-y-10">
                                <div className="flow-item-1 text-center space-y-1">
                                    <h2 className="font-cormorant text-4xl sm:text-5xl font-bold text-[#353A20]">Our Love Story</h2>
                                    <p className="font-ovo text-xs sm:text-sm text-[#8A7B6B]">Perjalanan kisah cinta kami dari awal hingga menuju hari bahagia.</p>
                                </div>

                                <div className="space-y-6">
                                    {loveStories.map((story, idx) => (
                                        <div
                                            key={story.id || idx}
                                            className={`flow-item-${(idx % 3) + 2} rounded-2xl border border-[#353A20]/10 bg-[#FBF7F0] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row gap-4 items-start transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
                                        >
                                            <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#353A20] text-[#F5F0E8] font-cormorant text-xl font-bold shadow-sm">
                                                0{idx + 1}
                                            </div>
                                            <div className="space-y-1.5 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-cormorant text-xl font-bold text-[#353A20]">{story.title}</h3>
                                                    {story.date && (
                                                        <span className="font-mono text-[10px] text-[#8A7B6B] uppercase">{formatIndonesianDate(story.date)}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{story.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}

                    <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>

                    {/* SECTION 5: SAVE THE DATE & COUNTDOWN */}
                    <section className="editorial-section rounded-3xl bg-[#353A20] text-[#F5F0E8] p-8 sm:p-12 text-center space-y-8 shadow-xl relative overflow-hidden">
                        <div className="flow-item-1 space-y-1">
                            <span className="font-ovo text-xs uppercase tracking-widest text-[#F5F0E8]/70">Save The Date</span>
                            <h2 className="font-cormorant text-4xl sm:text-5xl font-bold text-[#F5F0E8]">{formattedDate}</h2>
                        </div>

                        {/* Numeric Countdown Blocks */}
                        <div className="flow-item-2 grid grid-cols-4 gap-3 max-w-sm mx-auto">
                            {[
                                { label: 'Hari', val: timeLeft.days },
                                { label: 'Jam', val: timeLeft.hours },
                                { label: 'Menit', val: timeLeft.minutes },
                                { label: 'Detik', val: timeLeft.seconds },
                            ].map((item, idx) => (
                                <div key={idx} className="rounded-xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15 text-center transition-transform hover:scale-105">
                                    <span className="block font-cormorant text-3xl sm:text-4xl font-bold text-[#F5F0E8]">{item.val}</span>
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#F5F0E8]/70">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flow-item-3">
                            <a
                                href={googleCalendarUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full bg-[#F5F0E8] px-7 py-3 text-xs font-semibold uppercase tracking-wider text-[#353A20] shadow-md hover:bg-white transition transform hover:scale-105 active:scale-95"
                            >
                                <svg className="w-4 h-4 text-[#353A20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Add to Google Calendar
                            </a>
                        </div>
                    </section>

                    <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>

                    {/* SECTION 6: OUR SPECIAL DAY / EVENTS (Holy Matrimony & Reception) */}
                    <section className="editorial-section space-y-8">
                        <div className="flow-item-1 text-center space-y-1">
                            <h2 className="font-cormorant text-4xl sm:text-5xl font-bold text-[#353A20]">Our Special Day</h2>
                            <p className="font-ovo text-xs sm:text-sm text-[#8A7B6B]">
                                With grateful hearts, we invite you to witness and celebrate the beginning of our forever.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {events.map((evt, eIdx) => (
                                <div
                                    key={evt.id}
                                    className={`flow-item-${eIdx + 2} rounded-2xl border border-[#353A20]/15 bg-[#FBF7F0] p-6 sm:p-8 shadow-sm space-y-4 transition-all duration-300 hover:shadow-md`}
                                >
                                    <div className="flex items-center justify-between border-b border-[#353A20]/10 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#353A20]/10 flex items-center justify-center text-[#353A20]">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#353A20]">
                                                    {evt.event_name}
                                                </h3>
                                                <p className="text-xs text-[#8A7B6B] font-mono">
                                                    {formatIndonesianDate(evt.date, { withDayName: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#353A20] text-[#F5F0E8]">
                                            {evt.time_start?.slice(0, 5)} - {evt.time_end ? evt.time_end.slice(0, 5) : 'Selesai'}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-xs text-stone-700">
                                        <p className="font-bold text-sm sm:text-base text-[#353A20]">{evt.venue_name}</p>
                                        <p className="leading-relaxed text-stone-600">{evt.address}</p>
                                    </div>

                                    {(evt.latitude && evt.longitude) || evt.address ? (
                                        <div className="pt-2">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                    `${evt.venue_name} ${evt.address}`
                                                )}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 rounded-full border border-[#353A20] px-5 py-2 text-xs font-semibold text-[#353A20] hover:bg-[#353A20] hover:text-[#F5F0E8] transition hover:scale-105"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                View Maps
                                            </a>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>

                    {/* SECTION 7: DRESSCODE SWATCHES (Katsudoto Garden Palette) */}
                    <section className="editorial-section rounded-2xl border border-[#353A20]/10 bg-[#FBF7F0] p-8 text-center space-y-6">
                        <div className="flow-item-1 space-y-1">
                            <span className="font-ovo text-xs uppercase tracking-widest text-[#8A7B6B]">Wedding Attire</span>
                            <h3 className="font-cormorant text-3xl font-bold text-[#353A20]">Dresscode</h3>
                            <p className="text-xs text-stone-600 max-w-sm mx-auto">
                                Kami memohon kehadiran tamu undangan mengenakan pakaian bernuansa warna berikut:
                            </p>
                        </div>

                        <div className="flow-item-2 flex justify-center items-center gap-4 pt-2">
                            {[
                                { color: '#B3C6D5', label: 'Sky Blue' },
                                { color: '#47472F', label: 'Dark Olive' },
                                { color: '#A19C7F', label: 'Muted Sage' },
                                { color: '#A75F62', label: 'Terracotta' },
                            ].map((swatch, sIdx) => (
                                <div key={sIdx} className="flex flex-col items-center gap-1.5 group">
                                    <div
                                        className="w-11 h-11 rounded-full border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-115"
                                        style={{ backgroundColor: swatch.color }}
                                        title={swatch.label}
                                    />
                                    <span className="text-[10px] font-mono text-[#8A7B6B]">{swatch.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 8: PORTRAIT OF US (PHOTO GALLERY) */}
                    {galleryPhotos.length > 0 && (
                        <>
                            <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>
                            <section className="editorial-section space-y-8">
                                <div className="flow-item-1 text-center space-y-1">
                                    <h2 className="font-cormorant text-4xl sm:text-5xl font-bold text-[#353A20]">Portrait of Us</h2>
                                    <p className="font-ovo text-xs sm:text-sm text-[#8A7B6B]">Kenangan manis dan momen berharga kami menjelang pernikahan.</p>
                                </div>

                                <div className="flow-item-2 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                                    {galleryPhotos.map((photo, pIdx) => (
                                        <div
                                            key={photo.id || pIdx}
                                            onClick={() => setSelectedPhotoIndex(pIdx)}
                                            className="aspect-4/5 overflow-hidden rounded-xl bg-stone-100 border border-[#353A20]/10 shadow-xs group cursor-pointer relative"
                                        >
                                            <img
                                                src={photo.photo_url}
                                                alt={photo.caption || 'Foto Galeri'}
                                                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-[#353A20]/30 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                                <span className="px-3.5 py-1.5 rounded-full bg-white/85 text-[10px] font-semibold text-[#353A20] shadow-sm">
                                                    Lihat Foto
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}

                    <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>

                    {/* SECTION 9: WEDDING GIFT & DIGITAL ENVELOPE */}
                    {bankAccounts.length > 0 && (
                        <section className="editorial-section rounded-3xl border border-[#353A20]/15 bg-[#FBF7F0] p-8 sm:p-10 text-center space-y-8 shadow-sm">
                            <div className="flow-item-1 space-y-1">
                                <span className="font-ovo text-xs uppercase tracking-widest text-[#8A7B6B]">Tanda Kasih</span>
                                <h2 className="font-cormorant text-4xl sm:text-5xl font-bold text-[#353A20]">Wedding Gift</h2>
                                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                                    Doa restu Anda adalah hadiah terindah bagi kami. Namun jika Anda ingin memberikan tanda kasih, kami menyediakan amplop digital berikut:
                                </p>
                            </div>

                            <div className="flow-item-2 space-y-4 max-w-sm mx-auto">
                                {bankAccounts.map((acc, aIdx) => (
                                    <div
                                        key={acc.id || aIdx}
                                        className="rounded-2xl border border-[#353A20]/10 bg-white p-5 sm:p-6 text-left shadow-xs space-y-3 transition-all duration-300 hover:shadow-md"
                                    >
                                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                                            <span className="font-bold font-mono text-xs text-[#353A20] uppercase">
                                                {acc.bank_or_wallet_name || 'BANK'}
                                            </span>
                                            <span className="text-[10px] font-mono text-[#8A7B6B]">TRANSFER</span>
                                        </div>

                                        <div>
                                            <p className="text-[11px] text-stone-400">Atas Nama:</p>
                                            <p className="font-semibold text-sm text-[#353A20]">{acc.account_holder}</p>
                                        </div>

                                        <div className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 border border-stone-200">
                                            <span className="font-mono text-sm font-bold text-[#353A20] tracking-wider">
                                                {acc.account_number}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(acc.account_number, aIdx)}
                                                className="px-3.5 py-1.5 rounded-lg bg-[#353A20] text-[#F5F0E8] text-[10px] font-semibold uppercase tracking-wider hover:bg-[#252A15] transition active:scale-95"
                                            >
                                                {copiedIndex === aIdx ? 'Tersalin! ✓' : 'Salin'}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {invitation.qris_image_url && (
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowQrisModal(true)}
                                            className="inline-flex items-center gap-2 rounded-2xl border border-[#353A20]/30 bg-white px-6 py-3 text-xs font-semibold text-[#353A20] shadow-xs hover:bg-[#FBF7F0] transition hover:scale-105 active:scale-95"
                                        >
                                            <svg className="w-4 h-4 text-[#353A20]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                            </svg>
                                            Buka QRIS Pembayaran
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>

                    {/* SECTION 10: RSVP FORM */}
                    <section className="editorial-section space-y-6">
                        <div className="flow-item-1">
                            <RsvpSection
                                slug={invitation.slug}
                                events={events}
                                resolvedGuest={resolvedGuest}
                                turnstileSiteKey={turnstileSiteKey}
                            />
                        </div>
                    </section>

                    <div className="editorial-divider" aria-hidden="true"><span>✦</span></div>

                    {/* SECTION 11: WISHES & BLESSINGS GUESTBOOK */}
                    <section className="editorial-section space-y-8 rounded-3xl border border-[#353A20]/15 bg-[#FBF7F0] p-6 sm:p-10">
                        <div className="flow-item-1 text-center space-y-1">
                            <h2 className="font-cormorant text-4xl sm:text-5xl font-bold text-[#353A20]">Share Your Blessing</h2>
                            <p className="font-ovo text-xs sm:text-sm text-[#8A7B6B]">Kirimkan doa dan ucapan hangat untuk kedua mempelai.</p>
                        </div>

                        {/* Submit Wish Form */}
                        <div className="flow-item-2">
                            <form onSubmit={handleWishSubmit} className="space-y-3.5 bg-white p-6 rounded-2xl border border-[#353A20]/10 shadow-xs">
                                <div>
                                    <label className="block text-xs font-semibold text-[#353A20] mb-1">Nama Anda *</label>
                                    <input
                                        type="text"
                                        required
                                        value={wishData.name}
                                        onChange={(e) => setWishData('name', e.target.value)}
                                        placeholder="Nama Lengkap"
                                        className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-[#353A20] focus:ring-1 focus:ring-[#353A20]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[#353A20] mb-1">Ucapan &amp; Doa *</label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={wishData.message}
                                        onChange={(e) => setWishData('message', e.target.value)}
                                        placeholder="Tuliskan ucapan selamat dan doa restu..."
                                        className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-xs focus:border-[#353A20] focus:ring-1 focus:ring-[#353A20]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={wishProcessing}
                                    className="w-full rounded-full bg-[#353A20] py-3 text-xs font-semibold uppercase tracking-wider text-[#F5F0E8] hover:bg-[#252A15] transition disabled:opacity-50 hover:scale-102 active:scale-98"
                                >
                                    {wishProcessing ? 'Mengirim...' : 'Kirim Ucapan'}
                                </button>
                            </form>
                        </div>

                        {/* Wishes Feed */}
                        <div className="flow-item-3 space-y-3 max-h-96 overflow-y-auto pr-1">
                            {wishesList.map((w, wIdx) => (
                                <div key={w.id || wIdx} className="rounded-xl bg-white p-4 border border-stone-100 shadow-2xs space-y-1 text-left">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-xs text-[#353A20]">{w.name}</h4>
                                        <span className="text-[10px] text-stone-400 font-mono">{w.created_at || 'Baru'}</span>
                                    </div>
                                    <p className="text-xs text-stone-600 leading-relaxed">{w.message}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 12: FOOTER & CLOSING NOTE */}
                    <footer className="editorial-section text-center pt-8 pb-16 space-y-4 border-t border-[#353A20]/10">
                        <div className="flow-item-1 space-y-2">
                            <p className="font-cormorant text-3xl font-bold text-[#353A20]">
                                {invitation.groom_name} &amp; {invitation.bride_name}
                            </p>
                            <p className="text-xs font-mono text-[#8A7B6B]">
                                Terima kasih atas doa dan kehadiran Anda.
                            </p>
                            {!invitation.package?.remove_watermark && (
                                <div className="pt-4 text-[10px] text-stone-400 font-mono">
                                    <a
                                        href={usePage<PageProps>().props.branding?.watermark_link || 'https://wedinvite.com'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline"
                                    >
                                        {usePage<PageProps>().props.branding?.watermark_text || 'Powered by WedInvite'}
                                    </a>
                                </div>
                            )}
                        </div>
                    </footer>
                </main>
            </div>

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

                        <h3 className="font-cormorant text-2xl font-bold text-[#353A20]">Scan QRIS</h3>
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

                        <p className="mt-4 text-[11px] text-[#8A7B6B] font-mono">
                            {invitation.groom_name} &amp; {invitation.bride_name}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
