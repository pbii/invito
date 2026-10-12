import AudioPlayer from '@/Components/invitation/AudioPlayer';
import RsvpSection from '@/Components/invitation/RsvpSection';
import { Event, GalleryPhoto, Invitation, InvitationBankAccount, InvitationSection, LoveStory, PageProps, Wish } from '@/types';
import { formatIndonesianDate } from '@/Utils/date';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './classy.css';

interface ClassyProps {
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

export default function Classy({
    invitation,
    events,
    bankAccounts,
    loveStories,
    galleryPhotos,
    wishes,
    guestToken,
    turnstileSiteKey,
}: ClassyProps) {
    const { branding } = usePage<PageProps>().props;
    const [isCoverOpen, setIsCoverOpen] = useState(false);
    const [autoPlayAudio, setAutoPlayAudio] = useState(false);
    const [resolvedGuest, setResolvedGuest] = useState<{ id: string; name: string; category?: string; max_pax?: number; allowed_event_ids?: string[] } | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Wishes local state for immediate feedback
    const [wishesList, setWishesList] = useState<Wish[]>(wishes || []);
    const { data: wishData, setData: setWishData, post: postWish, processing: wishProcessing, reset: resetWish } = useForm({
        name: '',
        message: '',
    });

    useEffect(() => {
        // Add ningrum original class to body
        document.body.classList.add('ningrum', 'original', 'preset-original');

        // Dynamically load scripts for Katsudoto exact interactions
        const loadScript = (src: string) => {
            return new Promise((resolve) => {
                const s = document.createElement('script');
                s.src = src;
                s.async = false;
                s.onload = () => resolve(true);
                document.body.appendChild(s);
            });
        };

        const loadAllScripts = async () => {
            await loadScript('/templates/classy/js/jquery.js');
            await loadScript('/templates/classy/js/aos.js');
            await loadScript('/templates/classy/js/swiper-bundle.min.js');
            await loadScript('/templates/classy/js/gsap.min.js');
            await loadScript('/templates/classy/js/ScrollTrigger.min.js');
            await loadScript('/templates/classy/js/universal.js');
            await loadScript('/templates/classy/js/0e585db1.js');
            await loadScript('/templates/classy/js/681959a2.js');

            if ((window as any).AOS) {
                (window as any).AOS.init({
                    duration: 1200,
                    easing: 'ease-out-cubic',
                    once: false,
                });
            }
        };

        loadAllScripts();

        return () => {
            document.body.classList.remove('ningrum', 'original', 'preset-original');
        };
    }, []);

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

    const handleOpenInvitation = () => {
        setIsCoverOpen(true);
        setAutoPlayAudio(true);

        if (typeof (window as any).startTheJourney === 'function') {
            (window as any).startTheJourney();
        } else {
            const coverEl = document.querySelector('.top-cover');
            if (coverEl) coverEl.classList.add('hide');
        }

        setTimeout(() => {
            if ((window as any).AOS) {
                (window as any).AOS.refresh();
            }
        }, 300);
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

    const formattedDate = earliestDate
        ? formatIndonesianDate(earliestDate, { withDayName: true })
        : 'Sabtu, 21 November 2026';

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        `Pernikahan ${invitation.groom_name} & ${invitation.bride_name}`
    )}&dates=${earliestDate ? new Date(earliestDate).toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 15) : '20261121T020000Z'}/${
        earliestDate ? new Date(earliestDate).toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, 15) : '20261121T140000Z'
    }&details=${encodeURIComponent('The Wedding Celebration')}&location=${encodeURIComponent(
        events[0]?.venue_name || 'Lokasi Acara'
    )}`;

    return (
        <div className="ningrum-outer relative">
            <Head>
                <title>{`${invitation.groom_name} & ${invitation.bride_name} - Wedding Invitation`}</title>
                <meta name="description" content={`Undangan pernikahan ${invitation.groom_name} & ${invitation.bride_name}`} />
            </Head>

            {/* Audio Player Component */}
            <AudioPlayer musicUrl={invitation.music_url || '/music/wedding-song.mp3'} autoPlayTrigger={autoPlayAudio} />

            {/* Katsudoto Side to Side Master Container */}
            <section className="kat-page__side-to-side">
                {/* ======================================================== */}
                {/* PRIMARY PANE (DESKTOP LEFT SIDE HERO)                    */}
                {/* ======================================================== */}
                <section className="primary-pane">
                    <div className="inner">
                        <div className="ornaments-wrapper">
                            <div className="orn-pp-7">
                                <div className="image-wrap" data-aos="fade-right" data-aos-duration="3000" data-aos-delay="2100">
                                    <img src="/templates/classy/Orn-22.png" alt="Ornaments" />
                                </div>
                            </div>
                            <div className="orn-pp-6">
                                <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="3000" data-aos-delay="2100">
                                    <img src="/templates/classy/Orn-50.png" alt="Ornaments" />
                                </div>
                            </div>
                            <div className="orn-pp-3">
                                <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="600">
                                    <img src="/templates/classy/Orn-51.png" alt="Ornaments" />
                                </div>
                            </div>
                        </div>

                        <div className="inner-wrapper">
                            <div className="pp-head">
                                <div className="invitation-category vip">
                                    <div className="category-icon" data-aos="fade-up" data-aos-duration="1000">
                                        <svg className="icon ic-filled ic-star" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256">
                                            <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"></path>
                                        </svg>
                                    </div>
                                    <p className="category-label" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                                        {resolvedGuest?.category || 'VIP GUEST'}
                                    </p>
                                </div>
                                <h1 className="top-cover-title" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="700">
                                    {invitation.groom_name} &amp;<br />{invitation.bride_name}
                                </h1>
                            </div>

                            <div className="pp-frame-wrapper">
                                <div className="body highlight" data-aos="zoom-out" data-aos-duration="2000">
                                    <div className="pp-frame" id="ppFrame">
                                        <div className="ornaments-wrapper">
                                            <div className="orn-tc-5">
                                                <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="2600">
                                                    <img src="/templates/classy/Orn-37.png" alt="Ornaments" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="preview-container cover-show" id="cover-primary">
                                            <img
                                                src={invitation.groom_photo || invitation.bride_photo || '/templates/classy/gif-1004829-1787031678-3a3df7d652ad92b7182be0a8.gif'}
                                                alt="Cover"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        </div>
                                        <div className="image-wrap">
                                            <img src="/templates/classy/frame-ff.png" alt="Cover Frame" />
                                        </div>
                                        <div className="ornaments-wrapper">
                                            <div className="orn-tc-4">
                                                <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="2600">
                                                    <img src="/templates/classy/Orn-25.png" alt="Ornaments" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="details" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="1900">
                                <p data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                                    Kepada Yth. {resolvedGuest?.name || 'Tamu Undangan'}
                                </p>
                            </div>
                        </div>

                        <div className="ornaments-wrapper">
                            <div className="orn-pp-5">
                                <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="1900">
                                    <img src="/templates/classy/Orn-43.png" alt="Ornaments" />
                                </div>
                            </div>
                            <div className="orn-pp-4">
                                <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="1400">
                                    <img src="/templates/classy/Orn-17.png" alt="Ornaments" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ======================================================== */}
                {/* SECONDARY PANE (SCROLLABLE INVITATION CONTENT)            */}
                {/* ======================================================== */}
                <section className="secondary-pane">
                    {/* TOP COVER (FULLSCREEN GATE OVERLAY) */}
                    <section className={`top-cover ${isCoverOpen ? 'hide' : ''}`} data-section-order="opening_cover">
                        <div className="tc-animation-wrap">
                            <div className="bg-tca"></div>
                            <div className="ornaments-wrapper">
                                <div className="orn-tc-7">
                                    <div className="smoke-wrap">
                                        <span className="smoke s1"></span>
                                        <span className="smoke s2"></span>
                                        <span className="smoke s3"></span>
                                        <span className="smoke s4"></span>
                                        <span className="smoke s5"></span>
                                        <span className="smoke s6"></span>
                                        <span className="smoke s7"></span>
                                        <span className="smoke s8"></span>
                                        <span className="smoke s9"></span>
                                        <span className="smoke s10"></span>
                                        <span className="smoke s11"></span>
                                        <span className="smoke s12"></span>
                                    </div>
                                    <div className="image-wrap" data-aos="zoom-in" data-aos-duration="1500" data-aos-delay="600">
                                        <img src="/templates/classy/Orn-17.png" alt="Ornaments" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ornaments-wrapper">
                            <div className="orn-tc-2">
                                <div className="image-wrap" data-aos="fade-right" data-aos-duration="3000" data-aos-delay="2600">
                                    <img src="/templates/classy/Orn-22.png" alt="Ornaments" />
                                </div>
                            </div>
                            <div className="orn-tc-6">
                                <div className="image-wrap" data-aos="fade-up" data-aos-duration="3000" data-aos-delay="2600">
                                    <img src="/templates/classy/Orn-50.png" alt="Ornaments" />
                                </div>
                            </div>
                            <div className="orn-tc-1">
                                <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="2600">
                                    <img src="/templates/classy/Orn-48.png" alt="Ornaments" />
                                </div>
                            </div>
                        </div>

                        <div className="inner">
                            <div className="tc-head">
                                <div className="invitation-category vip">
                                    <div className="category-icon" data-aos="fade-up" data-aos-duration="1000">
                                        <svg className="icon ic-filled ic-star" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256">
                                            <path d="M234.29,114.85l-45,38.83L203,211.75a16.4,16.4,0,0,1-24.5,17.82L128,198.49,77.47,229.57A16.4,16.4,0,0,1,53,211.75l13.76-58.07-45-38.83A16.46,16.46,0,0,1,31.08,86l59-4.76,22.76-55.08a16.36,16.36,0,0,1,30.27,0l22.75,55.08,59,4.76a16.46,16.46,0,0,1,9.37,28.86Z"></path>
                                        </svg>
                                    </div>
                                    <p className="category-label" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                                        {resolvedGuest?.category || 'VIP GUEST'}
                                    </p>
                                </div>
                                <h1 className="top-cover-title" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="700">
                                    {invitation.groom_name} &amp;<br />{invitation.bride_name}
                                </h1>
                            </div>

                            <div className="tc-frame-wrapper">
                                <div className="body highlight" data-aos="zoom-out" data-aos-duration="2000">
                                    <div className="tc-frame" id="tcFrame">
                                        <div className="ornaments-wrapper">
                                            <div className="orn-tc-5">
                                                <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="2600">
                                                    <img src="/templates/classy/Orn-37.png" alt="Ornaments" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="preview-container cover-show" id="cover-opening">
                                            <img
                                                src={invitation.groom_photo || invitation.bride_photo || '/templates/classy/gif-1004829-1787031678-3a3df7d652ad92b7182be0a8.gif'}
                                                alt="Cover"
                                                className="w-full h-full object-cover rounded-xl"
                                            />
                                        </div>
                                        <div className="image-wrap">
                                            <img src="/templates/classy/frame-ff.png" alt="Cover Frame" />
                                        </div>
                                        <div className="orn-tc-4">
                                            <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="2600">
                                                <img src="/templates/classy/Orn-25.png" alt="Ornaments" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="ornaments-wrapper">
                                <div className="orn-tc-3">
                                    <div className="orn-tc-3-1">
                                        <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="2600">
                                            <img src="/templates/classy/Orn-12.png" alt="Ornaments" />
                                        </div>
                                    </div>
                                    <div className="image-wrap" data-aos="zoom-out" data-aos-duration="3000" data-aos-delay="2600">
                                        <img src="/templates/classy/Orn-49.png" alt="Ornaments" />
                                    </div>
                                </div>
                            </div>

                            <div className="tc-footer">
                                <div className="details" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="2300">
                                    <p className="to" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">
                                        Kepada Yth. Bapak/Ibu/Saudara/i:
                                    </p>
                                    <h2 className="name" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200">
                                        {resolvedGuest?.name || 'Tamu Undangan Terhormat'}
                                    </h2>
                                </div>
                                <div className="action" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="2500">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        id="open-invitation"
                                        onClick={handleOpenInvitation}
                                    >
                                        Buka Undangan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* COVER */}
                    <section className="cover" data-section-order="cover">
                        <div className="ornaments-wrapper">
                            <div className="orn-cover-2 center">
                                <div className="image-wrap" data-aos="zoom-in-down" data-aos-duration="3000" data-aos-delay="2600">
                                    <img src="/templates/classy/Orn-07.png" alt="Ornaments" />
                                </div>
                            </div>
                            <div className="orn-cover-1 right">
                                <div className="image-wrap" data-aos="fade-down-left" data-aos-duration="3000" data-aos-delay="1200">
                                    <img src="/templates/classy/Orn-06.png" alt="Ornaments" />
                                </div>
                            </div>
                            <div className="orn-cover-1 left">
                                <div className="image-wrap" data-aos="fade-down-left" data-aos-duration="3000" data-aos-delay="1200">
                                    <img src="/templates/classy/Orn-06.png" alt="Ornaments" />
                                </div>
                            </div>
                        </div>

                        <div className="inner">
                            <div className="head" data-aos="zoom-in" data-aos-duration="3000" data-aos-delay="2800">
                                <div className="logo-wrap" data-aos="fade-down" data-aos-duration="3000" data-aos-delay="3000">
                                    <img src="/templates/classy/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzcwLzcz_20.webp" alt="Logo" className="logo" />
                                </div>
                            </div>

                            <div className="body highlight" data-aos="zoom-in-up" data-aos-duration="1900" data-aos-delay="500">
                                <div className="orn-cover-frame">
                                    <div className="orn-cover-5">
                                        <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="2500" data-aos-delay="2850">
                                            <img src="/templates/classy/Orn-12.png" alt="Orn" />
                                        </div>
                                    </div>

                                    <div className="cover-frame" id="coverFrame">
                                        <div className="cover-picture cover-show" id="cover-main">
                                            <div className="picture desktop">
                                                <img src={invitation.groom_photo || invitation.bride_photo || '/templates/classy/gif-1004829-1787031678-3a3df7d652ad92b7182be0a8.gif'} alt="Cover" />
                                            </div>
                                            <div className="picture mobile">
                                                <img src={invitation.groom_photo || invitation.bride_photo || '/templates/classy/gif-1004829-1787031678-3a3df7d652ad92b7182be0a8.gif'} alt="Cover" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="image-wrap">
                                        <img src="/templates/classy/frame-cover.png" alt="Cover Frame" />
                                    </div>

                                    <div className="orn-cover-3">
                                        <div className="image-wrap" data-aos="zoom-in-right" data-aos-duration="2500" data-aos-delay="1650">
                                            <img src="/templates/classy/Orn-08.png" alt="Orn" />
                                        </div>
                                    </div>

                                    <div className="orn-cover-4">
                                        <div className="orn-cover-4-2">
                                            <div className="image-wrap" data-aos="zoom-in-up" data-aos-duration="2500" data-aos-delay="2850">
                                                <img src="/templates/classy/Orn-11.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="orn-cover-4-1">
                                            <div className="image-wrap" data-aos="zoom-in-left" data-aos-duration="2500" data-aos-delay="2650">
                                                <img src="/templates/classy/Orn-10.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="image-wrap" data-aos="zoom-in-down" data-aos-duration="2500" data-aos-delay="1650">
                                            <img src="/templates/classy/Orn-09.png" alt="Orn" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="details">
                                <h1 className="title" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="100">
                                    The Wedding Celebration of
                                </h1>
                                <p className="subtitle" data-aos="fade-up" data-aos-duration="1500" data-aos-delay="300">
                                    {invitation.groom_name} &amp; {invitation.bride_name}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* COUPLE */}
                    <section className="couple-wrap" data-section-order="couple">
                        <div className="couple">
                            <div className="couple-head">
                                <h1 className="couple-title" data-aos="zoom-in" data-aos-duration="1000">Groom and Bride</h1>
                                <p className="couple-description" data-aos="fade-up" data-aos-duration="1000">
                                    Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan kami:
                                </p>
                            </div>

                            <div className="couple-body show-picture">
                                {/* Groom */}
                                <div className="couple-info groom">
                                    <div className="couple-preview">
                                        <div className="orn-cp-5">
                                            <div className="image-wrap" data-aos="zoom-out" data-aos-duration="2500">
                                                <img src="/templates/classy/Orn-25.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="couple-picture">
                                            <img src={invitation.groom_photo || '/images/templates/rustic-brown.jpg'} alt={invitation.groom_name} />
                                        </div>
                                        <div className="image-wrap">
                                            <img src="/templates/classy/frame-couple.png" alt="Frame" />
                                        </div>
                                    </div>
                                    <div className="couple-details">
                                        <h2 className="couple-name" data-aos="fade-up" data-aos-duration="1000">{invitation.groom_name}</h2>
                                        <p className="couple-parents" data-aos="fade-up" data-aos-duration="1000">
                                            Putra dari Bapak {invitation.groom_father || '...'} &amp; Ibu {invitation.groom_mother || '...'}
                                        </p>
                                    </div>
                                </div>

                                <div className="separator-wrap">
                                    <div className="separator" data-aos="zoom-in" data-aos-duration="1500">
                                        <span>&amp;</span>
                                    </div>
                                </div>

                                {/* Bride */}
                                <div className="couple-info bride">
                                    <div className="couple-preview">
                                        <div className="orn-cp-5">
                                            <div className="image-wrap" data-aos="zoom-out" data-aos-duration="2500">
                                                <img src="/templates/classy/Orn-25.png" alt="Orn" />
                                            </div>
                                        </div>
                                        <div className="couple-picture">
                                            <img src={invitation.bride_photo || '/images/templates/modern-floral.jpg'} alt={invitation.bride_name} />
                                        </div>
                                        <div className="image-wrap">
                                            <img src="/templates/classy/frame-couple.png" alt="Frame" />
                                        </div>
                                    </div>
                                    <div className="couple-details">
                                        <h2 className="couple-name" data-aos="fade-up" data-aos-duration="1000">{invitation.bride_name}</h2>
                                        <p className="couple-parents" data-aos="fade-up" data-aos-duration="1000">
                                            Putri dari Bapak {invitation.bride_father || '...'} &amp; Ibu {invitation.bride_mother || '...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SAVE THE DATE (COUNTDOWN) */}
                    <section className="std-container" data-section-order="save_the_date">
                        <div className="std-inner">
                            <h2 className="std-title" data-aos="fade-up" data-aos-duration="1200">Save The Date</h2>
                            <p className="std-date" data-aos="fade-up" data-aos-duration="1200" data-aos-delay="200">{formattedDate}</p>

                            <div className="countdown-wrap" data-aos="zoom-in" data-aos-duration="1400">
                                <div className="countdown-item">
                                    <span className="number">{timeLeft.days}</span>
                                    <span className="label">Hari</span>
                                </div>
                                <div className="countdown-item">
                                    <span className="number">{timeLeft.hours}</span>
                                    <span className="label">Jam</span>
                                </div>
                                <div className="countdown-item">
                                    <span className="number">{timeLeft.minutes}</span>
                                    <span className="label">Menit</span>
                                </div>
                                <div className="countdown-item">
                                    <span className="number">{timeLeft.seconds}</span>
                                    <span className="label">Detik</span>
                                </div>
                            </div>

                            <div className="std-action" data-aos="fade-up" data-aos-duration="1000">
                                <a href={googleCalendarUrl} target="_blank" rel="noreferrer" className="btn btn-calendar">
                                    Tambahkan ke Google Calendar
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* AGENDA (EVENT) WITH KATSU SVG GATE ARCH */}
                    <section className="agenda-container" data-section-order="event">
                        <div className="ornaments-wrapper">
                            <div className="orn-ev-4">
                                <div className="image-wrap" data-aos="zoom-in-down" data-aos-duration="3000" data-aos-delay="2300">
                                    <img src="/templates/classy/Orn-07.png" alt="Ornaments" />
                                </div>
                            </div>
                        </div>

                        <div className="agenda-frame-outer">
                            <div className="agenda-frame-sticky">
                                <div className="agenda-frame">
                                    <div className="image-wrap" data-aos="zoom-out" data-aos-duration="1200">
                                        <svg preserveAspectRatio="none" width="100%" height="100%" viewBox="0 0 390 744" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M390 744H0V0H390V744ZM252.633 78.835C220.627 65.7835 188.344 63.2602 154.827 72.5977L153.954 72.8018C136.379 78.2468 119.564 86.1778 104.874 97.3662C103.322 98.5487 98.8209 102.169 97.7607 103.541C95.5867 105.532 91.9953 108.766 90.2676 111.029C87.1243 113.301 78.3695 125.46 76.0947 129.118C74.6995 129.159 72.7875 129.159 71.4473 129.344C63.5184 129.264 54.4131 128.412 47.5078 132.939L46.2998 133.576C38.21 137.665 30.0082 147.537 30.5576 157.045C30.5185 159.721 30.6602 169.658 30.3545 171.58C28.7068 171.754 25.2237 172.496 23.9316 173.498C18.8345 175.704 15.7425 177.831 12.9795 182.933C12.05 185.291 11.194 187.401 11.1846 189.984C11.1539 198.39 11.1663 206.822 11.166 215.228L11.1719 265.098L11.1729 443.397L11.1758 539.236L11.1543 569.091C11.1346 573.976 10.8539 580.15 11.1025 584.953C11.1838 586.717 11.7222 588.457 12.6885 590.069C16.0448 595.736 22.723 598.23 30.5039 599.178C30.4255 608.88 28.5929 616.896 38.5645 624.324C45.8186 629.727 53.0019 631.327 62.9697 631.369L77.7832 631.345C82.8644 636.478 88.0167 641.319 94.1221 645.815C115.706 661.478 143.26 671.763 172.996 675.257C210.758 679.619 249.278 672.393 279.788 655.222C293.384 647.704 301.129 641.308 311.012 631.324C325.287 631.389 338.823 632.927 349.907 624.723C360.393 616.963 358.145 609.303 358.302 599.207C360.289 598.948 362.006 598.724 363.923 598.254C372.358 596.188 377.883 590.95 377.949 584.264C378.019 576.985 377.889 569.718 377.902 562.444L377.933 513.449V223.237L377.923 199.687C377.916 193.438 378.556 189.04 376.266 183.042C372.518 176.382 366.554 172.3 358.933 171.45C357.986 168.904 359.486 157.328 357.669 151.509C354.322 140.797 350.04 137.593 340.738 132.088C333.407 128.664 324.089 129.03 316.062 129.355C313.115 129.191 313.181 129.224 311.421 126.761C307.543 121.335 303.802 115.928 299.083 111.177C297.824 109.439 293.683 105.554 292.124 104.113C280.301 93.1904 267.335 85.2843 252.633 78.835Z" fill="#48110C" />
                                        </svg>
                                    </div>
                                    <div className="ornaments-wrapper">
                                        <div className="orn-cover-1 right">
                                            <div className="image-wrap" data-aos="fade-down-left" data-aos-duration="3000" data-aos-delay="900">
                                                <img src="/templates/classy/Orn-06.png" alt="Ornaments" />
                                            </div>
                                        </div>
                                        <div className="orn-cover-1 left">
                                            <div className="image-wrap" data-aos="fade-down-left" data-aos-duration="3000" data-aos-delay="900">
                                                <img src="/templates/classy/Orn-06.png" alt="Ornaments" />
                                            </div>
                                        </div>
                                        <div className="orn-ev-1">
                                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="3000" data-aos-delay="2500">
                                                <img src="/templates/classy/Orn-24.png" alt="Ornaments" />
                                            </div>
                                        </div>
                                        <div className="orn-ev-2">
                                            <div className="image-wrap" data-aos="zoom-in" data-aos-duration="3000" data-aos-delay="1300">
                                                <img src="/templates/classy/Orn-10.png" alt="Ornaments" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <section className="agenda-wrap">
                            <div className="agenda-inner">
                                <div className="agenda-head">
                                    <h2 className="agenda-title" data-aos="zoom-in" data-aos-duration="1500">The Wedding Day</h2>
                                </div>

                                <div className="agenda-body">
                                    {events.map((evt, idx) => (
                                        <div key={evt.id || idx} className="event-item" data-aos="fade-up" data-aos-duration="1200">
                                            <div className="event-head">
                                                <h3 className="event-name">{evt.event_name}</h3>
                                                <p className="event-date">{formatIndonesianDate(evt.date, { withDayName: true })}</p>
                                                <p className="event-time">Pukul {evt.time_start || '09:00'} - {evt.time_end || 'Selesai'}</p>
                                            </div>
                                            <div className="event-body">
                                                <p className="event-venue">{evt.venue_name}</p>
                                                <p className="event-address">{evt.address}</p>
                                                {evt.latitude && evt.longitude && (
                                                    <a
                                                        href={`https://maps.google.com/?q=${evt.latitude},${evt.longitude}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-maps"
                                                    >
                                                        Lihat Google Maps
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </section>

                    {/* LOVE STORY */}
                    {loveStories.length > 0 && (
                        <section className="story-container" data-section-order="love_story">
                            <div className="story-inner">
                                <h2 className="story-title" data-aos="zoom-in" data-aos-duration="1200">Our Love Story</h2>
                                <div className="story-swiper" data-aos="fade-up" data-aos-duration="1400">
                                    <div className="swiper-wrapper">
                                        {loveStories.map((story, idx) => (
                                            <div key={story.id || idx} className="story-item-wrapper">
                                                <div className="story-item">
                                                    <span className="story-date">{story.date}</span>
                                                    <h3 className="story-item-title">{story.title}</h3>
                                                    <p className="story-description">{story.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="story-pagination-top"></div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* PHOTO GALLERY */}
                    {galleryPhotos.length > 0 && (
                        <section className="gallery-container" data-section-order="gallery_photo">
                            <div className="gallery-inner">
                                <h2 className="gallery-title" data-aos="zoom-in" data-aos-duration="1200">Our Gallery</h2>
                                <div className="gallery-grid">
                                    {galleryPhotos.map((photo, idx) => (
                                        <div key={photo.id || idx} className="gallery-item" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay={idx * 100}>
                                            <img src={photo.photo_url} alt={photo.caption || 'Gallery'} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* WEDDING GIFT */}
                    {bankAccounts.length > 0 && (
                        <section className="gift-container" data-section-order="wedding_gift">
                            <div className="gift-inner">
                                <h2 className="gift-title" data-aos="zoom-in" data-aos-duration="1200">Wedding Gift</h2>
                                <p className="gift-description" data-aos="fade-up" data-aos-duration="1000">
                                    Doa restu Anda merupakan karunia terindah bagi kami. Bagi yang berkenan memberikan tanda kasih:
                                </p>

                                <div className="bank-list">
                                    {bankAccounts.map((bank, idx) => (
                                        <div key={bank.id || idx} className="bank-card" data-aos="fade-up" data-aos-duration="1200">
                                            <span className="bank-provider">{bank.bank_or_wallet_name}</span>
                                            <p className="bank-number">{bank.account_number}</p>
                                            <p className="bank-holder">a.n. {bank.account_holder}</p>
                                            <button
                                                type="button"
                                                className="btn btn-copy"
                                                onClick={() => copyToClipboard(bank.account_number, idx)}
                                            >
                                                {copiedIndex === idx ? 'Tersalin!' : 'Salin Nomor'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* RSVP & WISHES */}
                    <section className="rsvp-wishes-container" data-section-order="rsvp">
                        <div className="rw-inner">
                            <h2 className="rw-title" data-aos="zoom-in" data-aos-duration="1200">RSVP &amp; Best Wishes</h2>

                            {/* WedInvite Standard RSVP Form */}
                            <div className="rsvp-box" data-aos="fade-up" data-aos-duration="1200">
                                <RsvpSection
                                    slug={invitation.slug}
                                    events={events}
                                    resolvedGuest={resolvedGuest}
                                    turnstileSiteKey={turnstileSiteKey}
                                />
                            </div>

                            {/* Wishes Form & Guestbook */}
                            <div className="wishes-box" data-aos="fade-up" data-aos-duration="1200">
                                <form onSubmit={handleWishSubmit} className="wish-form">
                                    <input
                                        type="text"
                                        required
                                        value={wishData.name}
                                        onChange={(e) => setWishData('name', e.target.value)}
                                        placeholder="Nama Anda"
                                        className="form-control"
                                    />
                                    <textarea
                                        required
                                        rows={3}
                                        value={wishData.message}
                                        onChange={(e) => setWishData('message', e.target.value)}
                                        placeholder="Tuliskan ucapan dan doa restu..."
                                        className="form-control"
                                    />
                                    <button type="submit" disabled={wishProcessing} className="btn btn-submit">
                                        {wishProcessing ? 'Mengirim...' : 'Kirim Ucapan'}
                                    </button>
                                </form>

                                <div className="wishes-list">
                                    {wishesList.map((w, idx) => (
                                        <div key={w.id || idx} className="wish-item">
                                            <div className="wish-head">
                                                <strong>{w.name}</strong>
                                                <span>{w.created_at}</span>
                                            </div>
                                            <p className="wish-message">{w.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FOOTNOTE */}
                    <footer className="footer-container" data-section-order="footnote">
                        <div className="footer-inner" data-aos="zoom-in" data-aos-duration="1200">
                            <p className="footer-greeting">Terima Kasih</p>
                            <h3 className="footer-couple">{invitation.groom_name} &amp; {invitation.bride_name}</h3>
                            <p className="footer-watermark">{branding?.watermark_text || 'Powered by WedInvite'}</p>
                        </div>
                    </footer>
                </section>
            </section>
        </div>
    );
}
