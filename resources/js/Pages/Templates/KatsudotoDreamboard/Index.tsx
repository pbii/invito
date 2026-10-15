import {
    Event,
    GalleryPhoto,
    Invitation,
    InvitationBankAccount,
    InvitationSection,
    LoveStory,
    Wish,
} from '@/types';
import { formatIndonesianDate } from '@/Utils/date';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface KatsudotoDreamboardProps {
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

const TEMPLATE_BASE = '/templates/katsudoto-dreamboard';

// Fallback values = original template content (used when invitation field is empty)
const FALLBACK = {
    musicUrl:
        'https://media.katsudoto.id/media/public/70/73795/assets/lana-del-rey-young-and-beautiful-lyrics-1787040783-f44b4e0fe424d329d5aaa6bc.mp3',
    logoUrl: 'assets/img/custom-logo.png',
    coverPhoto: 'assets/img/cover-photo.webp',
    coverGif: 'assets/img/cover-anim.gif',
    groomPhoto: 'assets/img/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzcwLzcz_9.webp',
    bridePhoto: 'assets/img/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzcwLzcz_11.webp',
    streamVideoId: 'h4gjVTbbeY8',
    mapsUrl: 'https://maps.google.com/?cid=17799469754049146443',
};

// Original story photos (LoveStory has no photo field) — cycled per story
const STORY_PHOTOS: Array<[string, string]> = [
    [
        'assets/img/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzcwLzcz_22.webp',
        'assets/img/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzcwLzcz_2.webp',
    ],
    [
        'assets/img/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzcwLzcz_14.webp',
        'assets/img/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzcwLzcz_13.webp',
    ],
    [
        'assets/img/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzcwLzcz_19.webp',
        'assets/img/aHR0cHM6Ly9tZWRpYS5rYXRzdWRvdG8uaWQvbWVkaWEvcHVibGljLzcwLzcz_17.webp',
    ],
];

const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function esc(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function firstWord(name?: string | null): string {
    return (name || '').trim().split(/\s+/)[0] || '';
}

function ordinal(n: number): string {
    if (n >= 11 && n <= 13) return `${n}th`;
    switch (n % 10) {
        case 1: return `${n}st`;
        case 2: return `${n}nd`;
        case 3: return `${n}rd`;
        default: return `${n}th`;
    }
}

function fmtTime12(t?: string | null): string {
    if (!t) return '';
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr || '0', 10);
    if (isNaN(h)) return t;
    const ap = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ap}`;
}

function gcalStamp(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

function youtubeId(url?: string | null): string | null {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : null;
}

function nl2br(s: string): string {
    return esc(s).replace(/\n/g, '<br />');
}

export default function KatsudotoDreamboard({
    invitation,
    sections,
    events,
    bankAccounts,
    loveStories,
    galleryPhotos,
    wishes,
    guestToken,
    turnstileSiteKey,
}: KatsudotoDreamboardProps) {
    const [templateHtml, setTemplateHtml] = useState<string | null>(null);
    const [snippetHtml, setSnippetHtml] = useState<string | null>(null);
    const [guestName, setGuestName] = useState<string>('Tamu Undangan');
    const [frameHeight, setFrameHeight] = useState<number>(1200);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Fetch the tokenized template HTML + RSVP snippet (served from public/, not bundled)
    useEffect(() => {
        let alive = true;
        const load = (url: string) =>
            fetch(url).then((r) => {
                if (!r.ok) throw new Error('not found');
                return r.text();
            });
        load(`${TEMPLATE_BASE}/index.html`)
            .then((t) => {
                if (alive) setTemplateHtml(t);
            })
            .catch(() => {
                if (alive) setTemplateHtml(null);
            });
        load(`${TEMPLATE_BASE}/rsvp-form-snippet.html`)
            .then((t) => {
                if (alive) setSnippetHtml(t);
            })
            .catch(() => {
                if (alive) setSnippetHtml('');
            });
        return () => {
            alive = false;
        };
    }, []);

    // Resolve guest name like ModernFloral does
    useEffect(() => {
        if (!guestToken) return;
        axios
            .get(`/api/guests/resolve?token=${guestToken}`)
            .then((res) => {
                if (res.data?.valid && res.data.guest?.name) {
                    setGuestName(res.data.guest.name);
                }
            })
            .catch(() => null);
    }, [guestToken]);

    // Listen for height reports from the iframe's auto-resize script
    useEffect(() => {
        const onMsg = (e: MessageEvent) => {
            if (e.data && e.data.type === 'katsudoto-height' && typeof e.data.height === 'number') {
                setFrameHeight(Math.max(700, Math.min(e.data.height, 30000)));
            }
        };
        window.addEventListener('message', onMsg);
        return () => window.removeEventListener('message', onMsg);
    }, []);

    const measureFrame = () => {
        try {
            const doc = iframeRef.current?.contentDocument;
            if (doc?.documentElement) {
                const h = Math.max(doc.body?.scrollHeight || 0, doc.documentElement.scrollHeight);
                if (h > 0) setFrameHeight(Math.max(700, Math.min(h, 30000)));
            }
        } catch {
            /* cross-origin: rely on postMessage */
        }
    };

    const srcDoc = useMemo(() => {
        if (!templateHtml || snippetHtml === null) return '';
        let html = templateHtml;

        const groomFirst = firstWord(invitation.groom_name) || 'Nicholas';
        const brideFirst = firstWord(invitation.bride_name) || 'Arabella';
        const groomFull = invitation.groom_name || '';
        const brideFull = invitation.bride_name || '';

        // ---- Event date ----
        const ev: Event | undefined = events && events.length > 0 ? events[0] : undefined;
        let eventTs = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
        let dayName = 'Saturday';
        let dayNum = '21';
        let month = 'November';
        let year = '2026';
        let dateEn = 'Saturday, November 21st 2026';
        let dateId = '';
        let gcalUrl = '';
        if (ev?.date) {
            const [y, mo, d] = ev.date.split('-').map((x) => parseInt(x, 10));
            const [hh, mm] = (ev.time_start || '18:00').split(':').map((x) => parseInt(x, 10));
            const dt = new Date(y, (mo || 1) - 1, d || 1, isNaN(hh) ? 18 : hh, isNaN(mm) ? 0 : mm);
            if (!isNaN(dt.getTime())) {
                eventTs = Math.floor(dt.getTime() / 1000);
                dayName = EN_DAYS[dt.getDay()];
                dayNum = String(dt.getDate());
                month = EN_MONTHS[dt.getMonth()];
                year = String(dt.getFullYear());
                dateEn = `${dayName}, ${month} ${ordinal(dt.getDate())} ${year}`;
                dateId = formatIndonesianDate(ev.date, { withDayName: true });
                const [eh, em] = (ev.time_end || '').split(':').map((x) => parseInt(x, 10));
                const dtEnd = new Date(dt.getTime());
                if (!isNaN(eh)) dtEnd.setHours(eh, isNaN(em) ? 0 : em);
                else dtEnd.setHours(dt.getHours() + 3);
                const loc = [ev.venue_name, ev.address].filter(Boolean).join(' | ');
                gcalUrl =
                    'https://www.google.com/calendar/render?action=TEMPLATE' +
                    `&text=${encodeURIComponent(`${groomFirst} & ${brideFirst} Wedding`)}` +
                    `&dates=${gcalStamp(dt)}/${gcalStamp(dtEnd)}` +
                    `&location=${encodeURIComponent(loc)}` +
                    `&details=${encodeURIComponent(
                        `Hi, You're invited to our wedding ceremony | ${groomFirst} & ${brideFirst} Wedding | ${dateEn}`,
                    )}`;
            }
        }

        // ---- Scalar token replacement ----
        const R: Array<[string, string]> = [
            ['__GROOM_FIRST__', esc(groomFirst)],
            ['__BRIDE_FIRST__', esc(brideFirst)],
            ['__GROOM_FULL__', esc(groomFull) || esc('__GROOM_FULL__')],
            ['__BRIDE_FULL__', esc(brideFull) || esc('__BRIDE_FULL__')],
            ['__GROOM_FATHER__', esc(invitation.groom_father) || 'Theodore Alexander'],
            ['__GROOM_MOTHER__', esc(invitation.groom_mother) || 'Eleanor Alexander'],
            ['__BRIDE_FATHER__', esc(invitation.bride_father) || 'Charles Vivienne'],
            ['__BRIDE_MOTHER__', esc(invitation.bride_mother) || 'Victoria Vivienne'],
            ['__EVENT_TS__', String(eventTs)],
            ['__EVENT_DAYNAME__', esc(dayName)],
            ['__EVENT_DAYNUM__', esc(dayNum)],
            ['__EVENT_MONTH__', esc(month)],
            ['__EVENT_YEAR__', esc(year)],
            ['__EVENT_DATE_EN__', esc(dateEn)],
            ['__EVENT_DATE_ID__', esc(dateId)],
            ['__GCAL_URL__', gcalUrl || '#'],
            ['__MUSIC_URL__', esc(invitation.music_url) || FALLBACK.musicUrl],
            ['__LOGO_URL__', FALLBACK.logoUrl],
            ['__COVER_PHOTO__', FALLBACK.coverPhoto],
            ['__COVER_GIF__', FALLBACK.coverGif],
            ['__GROOM_PHOTO__', esc(invitation.groom_photo) || FALLBACK.groomPhoto],
            ['__BRIDE_PHOTO__', esc(invitation.bride_photo) || FALLBACK.bridePhoto],
            ['__GUEST_NAME__', esc(guestName)],
            ['__GUEST_NAME_HIDE__', guestName !== 'Tamu Undangan' ? 'hide' : ''],
            ['__STREAM_VIDEO_ID__', youtubeId(invitation.streaming_url) || FALLBACK.streamVideoId],
            ['__INVITATION_SLUG__', esc(invitation.slug || '')],
            ['__TURNSTILE_SITE_KEY__', esc(turnstileSiteKey || '')],
        ];
        for (const [token, value] of R) {
            html = html.split(token).join(value);
        }
        // Full names: keep original sample text when empty (never blank)
        html = html.split(esc('__GROOM_FULL__')).join('Nicholas Alexander');
        html = html.split(esc('__BRIDE_FULL__')).join('Arabella Victoria');

        // ---- Gallery ----
        if (galleryPhotos && galleryPhotos.length > 0) {
            const groups: GalleryPhoto[][] = [[], [], []];
            galleryPhotos.forEach((p, i) => groups[i % 3].push(p));
            const seqs = [
                ['photo-big', 'photo-small', 'photo-medium'],
                ['photo-medium', 'photo-small', 'photo-big'],
                ['photo-medium', 'photo-medium'],
            ];
            const frames: Record<string, string> = {
                'photo-big': 'gal-big.png',
                'photo-small': 'gal-small.png',
                'photo-medium': 'gal-medium.png',
            };
            const itemsHtml = groups
                .map((g, gi) => {
                    const items = g
                        .map((p, pi) => {
                            const size = seqs[gi][pi % seqs[gi].length];
                            const url = esc(p.photo_url);
                            const cap = esc(p.caption || '');
                            return (
                                `<a class="photo-item ${size}" data-aos="zoom-in" data-aos-duration="1000" ` +
                                `style="--gal-frame: url('assets/img/${frames[size]}')" href="${url}" target="_blank">` +
                                `<span class="photo-item-inner"><img src="${url}" alt="${cap}"></span></a>`
                            );
                        })
                        .join('');
                    return `<div class="photo-group pattern-${gi}">${items}</div>`;
                })
                .join('');
            html = html.replace(/<!--FALLBACK_GALLERY-->[\s\S]*?<!--\/FALLBACK_GALLERY-->\s*__GALLERY_ITEMS__/, itemsHtml);
        } else {
            html = html.split('__GALLERY_ITEMS__').join('');
        }

        // ---- Love story ----
        if (loveStories && loveStories.length > 0) {
            const itemsHtml = loveStories
                .map((st, i) => {
                    const [href, src] = STORY_PHOTOS[i % STORY_PHOTOS.length];
                    return (
                        `<div class="story-item-wrapper swiper-slide">` +
                        `<div class="story__slider-desc-outer" data-aos="zoom-out" data-aos-duration="1200" data-aos-delay="1300">` +
                        `<div class="orn-ls-frame"><div class="image-wrap"><img src="assets/img/frame-ls.png" alt="Ornaments"></div></div>` +
                        `<div class="ornaments-wrapper"><div class="orn-ls-2"><div class="image-wrap" data-aos="zoom-in" data-aos-duration="2500" data-aos-delay="1100"><img src="assets/img/Orn-47.png" alt="Ornaments"></div></div></div>` +
                        `<div class="story__slider-desc-wrap no-scrollbar">` +
                        `<div class="story-preview"><div class="story-picture lightgallery">` +
                        `<a data-aos="zoom-in" data-aos="zoom-out" data-aos-duration="1200" data-aos-delay="1300" href="${href}">` +
                        `<img src="${src}" alt=""></a></div></div>` +
                        `<h3 class="story-sub-title">${esc(st.title)}</h3>` +
                        `<div class="story__slider-caption"><div class="story-details-wrapper"><div class="story-details">` +
                        `<p class="story-caption">${nl2br(st.description || '')}</p>` +
                        `</div></div></div></div><div class="ornaments-wrapper"></div></div></div>`
                    );
                })
                .join('');
            html = html.replace(/<!--FALLBACK_STORY-->[\s\S]*?<!--\/FALLBACK_STORY-->\s*__STORY_ITEMS__/, itemsHtml);
        } else {
            html = html.split('__STORY_ITEMS__').join('');
        }

        // ---- Bank accounts ----
        if (bankAccounts && bankAccounts.length > 0) {
            const itemsHtml = bankAccounts
                .map((b, i) => {
                    const name = esc((b.bank_or_wallet_name || 'Bank').toUpperCase());
                    const num = esc(b.account_number || '');
                    const holder = esc(b.account_holder || '');
                    return (
                        `<div class="bank-item" id="savingBook${i}">` +
                        `<h3 class="bank-name">${name}</h3>` +
                        `<div class="bank-detail">` +
                        `<p class="bank-account-number-label">Account Number: <span class="bank-account-number">${num}</span></p>` +
                        `<p class="bank-account-name-label">Account Name: <span class="bank-account-name">${holder}</span></p>` +
                        `</div>` +
                        `<div class="bank-button-wrap" data-copy="${num}"><i class="ph ph-copy-simple"></i><p class="p">Copy</p></div>` +
                        `</div>`
                    );
                })
                .join('');
            html = html.replace(/<!--FALLBACK_BANK-->[\s\S]*?<!--\/FALLBACK_BANK-->\s*__BANK_ITEMS__/g, itemsHtml);
        } else {
            html = html.split('__BANK_ITEMS__').join('');
        }

        // ---- Events -> activity items ----
        if (events && events.length > 0) {
            const itemsHtml = events
                .map((e) => {
                    const time = [fmtTime12(e.time_start), fmtTime12(e.time_end)].filter(Boolean).join(' - ');
                    const maps =
                        e.latitude && e.longitude
                            ? `https://www.google.com/maps?q=${e.latitude},${e.longitude}`
                            : FALLBACK.mapsUrl;
                    return (
                        `<div class="activity-item"><div class="ornaments-wrapper">` +
                        `<div class="orn-ev-5"><div class="image-wrap" data-aos="zoom-in" data-aos-duration="2200" data-aos-delay="1500"><img src="assets/img/Orn-26.png" alt="Ornament"></div></div>` +
                        `<div class="orn-ev-6"><div class="image-wrap" data-aos="zoom-in" data-aos-duration="2200" data-aos-delay="900"><img src="assets/img/Orn-27.png" alt="Ornament"></div></div>` +
                        `</div><div class="activity-content">` +
                        `<div class="activity-head"><h3 class="activity-title" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="450" data-aos-anchor-placement="top-bottom">${esc(e.event_name)}</h3>` +
                        `<p class="activity-time" data-aos="zoom-in" data-aos-duration="1000" data-aos-delay="450" data-aos-anchor-placement="top-bottom">${esc(time)}</p></div>` +
                        `<div class="activity-details">` +
                        `<p class="activity-hall" data-aos="zoom-in" data-aos-duration="1000">${esc(e.venue_name || '')}</p>` +
                        `<p class="activity-address" data-aos="zoom-in" data-aos-duration="1000">${esc(e.address || '')}</p>` +
                        `<div class="activity-link-wrap" data-aos="zoom-in" data-aos-duration="1000"><a href="${esc(maps)}" class="event-link" target="_blank">View Maps</a></div>` +
                        `</div></div></div>`
                    );
                })
                .join('');
            html = html.replace(/<!--FALLBACK_ACTIVITIES-->[\s\S]*?<!--\/FALLBACK_ACTIVITIES-->\s*__ACTIVITY_ITEMS__/, itemsHtml);
        } else {
            html = html.split('__ACTIVITY_ITEMS__').join('');
        }

        // ---- Wishes ----
        const visibleWishes = (wishes || []).filter((w) => w.is_visible !== false);
        if (visibleWishes.length > 0) {
            const itemsHtml = visibleWishes
                .map((w) => {
                    const date = w.created_at ? formatIndonesianDate(w.created_at) : '';
                    return (
                        `<div class="comment-item swiper-slide">` +
                        `<div class="comment-head"><div class="comment-heart"><i class="fas fa-heart"></i></div>` +
                        (date ? `<p class="comment-date">${esc(date)}</p>` : '') +
                        `</div>` +
                        `<div class="comment-body"><p class="comment-name">${esc(w.name)}</p>` +
                        `<p class="comment-message">${nl2br(w.message || '')}</p></div></div>`
                    );
                })
                .join('');
            html = html.split('__WISH_ITEMS__').join(itemsHtml);
            html = html.split('class="comment-wrap swiper-wrapper"').join('class="comment-wrap swiper-wrapper show"');
        } else {
            html = html.split('__WISH_ITEMS__').join('');
        }

        // ---- Section visibility (invito sections -> template data-section-order) ----
        const hidden = (sections || [])
            .filter((s) => s && s.is_enabled === false && s.section_key && s.section_key !== 'opening_cover')
            .map((s) => `[data-section-order="${s.section_key}"]{display:none!important}`);
        if (hidden.length > 0) {
            html = html.replace('</head>', `<style>${hidden.join('')}</style></head>`);
        }

        // ---- RSVP snippet: event checkboxes, deadline, name ----
        let snippet = snippetHtml;
        if (events && events.length > 0) {
            const checkSvg =
                `<div class="check-rsvp"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">` +
                `<path d="M17.9425 6.06754L7.94254 16.0675C7.88449 16.1256 7.81556 16.1717 7.73969 16.2032C7.66381 16.2347 7.58248 16.2508 7.50035 16.2508C7.41821 16.2508 7.33688 16.2347 7.26101 16.2032C7.18514 16.1717 7.11621 16.1256 7.05816 16.0675L2.68316 11.6925C2.56588 11.5753 2.5 11.4162 2.5 11.2503C2.5 11.0845 2.56588 10.9254 2.68316 10.8082C2.80044 10.6909 2.9595 10.625 3.12535 10.625C3.2912 10.625 3.45026 10.6909 3.56753 10.8082L7.50035 14.7418L17.0582 5.18316C17.1754 5.06588 17.3345 5 17.5003 5C17.6662 5 17.8253 5.06588 17.9425 5.18316C18.0598 5.30044 18.1257 5.4595 18.1257 5.62535C18.1257 5.7912 18.0598 5.95026 17.9425 6.06754Z" fill="currentColor"/></svg></div>`;
            const boxes = events
                .map(
                    (e) =>
                        `<label class="rsvp-event-toggle-label" data-aos="fade-up" data-aos-duration="1200" style="margin-bottom: 0;">` +
                        `<input type="checkbox" name="selected_event[]" value="${esc(e.id)}" checked style="display: none;">` +
                        `<div class="rsvp-event-info"><span class="rsvp-event-name">${esc(e.event_name || 'Event')}</span>` +
                        checkSvg +
                        `</div></label>`,
                )
                .join('');
            snippet = snippet.split('__RSVP_EVENT_CHECKBOXES__').join(boxes);
        } else {
            snippet = snippet.split('__RSVP_EVENT_CHECKBOXES__').join('');
        }
        let rsvpDeadline = 'Nov 21<sup>st</sup>, 2026';
        if (ev?.date) {
            const [ry, rmo, rd] = ev.date.split('-').map((x) => parseInt(x, 10));
            const rdt = new Date(ry, (rmo || 1) - 1, rd || 1);
            if (!isNaN(rdt.getTime())) {
                const suffix = ordinal(rdt.getDate()).replace(/^\d+/, '');
                rsvpDeadline = `${EN_MONTHS[rdt.getMonth()].slice(0, 3)} ${rdt.getDate()}<sup>${suffix}</sup>, ${rdt.getFullYear()}`;
            }
        }
        snippet = snippet.split('__RSVP_DEADLINE__').join(rsvpDeadline);
        snippet = snippet.split('__RSVP_NAME__').join(guestName !== 'Tamu Undangan' ? esc(guestName) : '');
        html = html.split('__RSVP_SNIPPET_JSON__').join(JSON.stringify(snippet).replace(/</g, '\\u003c'));

        // ---- Wish item template for newly submitted wishes (bridge) ----
        const wishItemTemplate =
            `<div class="comment-item swiper-slide">` +
            `<div class="comment-head"><div class="comment-heart"><i class="fas fa-heart"></i></div>` +
            `<p class="comment-date">{date}</p></div>` +
            `<div class="comment-body"><p class="comment-name">{name}</p>` +
            `<p class="comment-message">{message}</p></div></div>`;
        html = html.split('__WISH_ITEM_JSON__').join(JSON.stringify(wishItemTemplate));

        return html;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [templateHtml, snippetHtml, guestName, invitation, events, bankAccounts, loveStories, galleryPhotos, wishes, sections, turnstileSiteKey]);

    return (
        <>
            <Head title={`${firstWord(invitation.groom_name)} & ${firstWord(invitation.bride_name)}`} />
            {srcDoc ? (
                <iframe
                    ref={iframeRef}
                    title="Wedding Invitation"
                    srcDoc={srcDoc}
                    onLoad={measureFrame}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    style={{ width: '100%', height: frameHeight, border: 0, display: 'block' }}
                />
            ) : (
                <div style={{ width: '100%', height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Memuat undangan…</p>
                </div>
            )}
        </>
    );
}
