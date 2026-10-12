import AudioPlayer from '@/Components/invitation/AudioPlayer';
import CoverOverlay from '@/Components/invitation/CoverOverlay';
import InvitationSectionsRenderer from '@/Components/invitation/InvitationSectionsRenderer';
import { Event, GalleryPhoto, Invitation, InvitationBankAccount, InvitationSection, LoveStory, Wish } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface IslamicEleganceProps {
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

export default function IslamicElegance({
    invitation,
    sections,
    events,
    bankAccounts,
    loveStories,
    galleryPhotos,
    wishes,
    guestToken,
    turnstileSiteKey,
}: IslamicEleganceProps) {
    const [isCoverOpen, setIsCoverOpen] = useState(false);
    const [autoPlayAudio, setAutoPlayAudio] = useState(false);
    const [resolvedGuest, setResolvedGuest] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (guestToken) {
            axios.get(`/api/guests/resolve?token=${guestToken}`).then((res) => {
                if (res.data?.valid && res.data.guest) {
                    setResolvedGuest(res.data.guest);
                }
            }).catch(() => null);
        }
    }, [guestToken]);

    const handleOpenInvitation = () => {
        setIsCoverOpen(true);
        setAutoPlayAudio(true);
    };

    return (
        <div className="min-h-screen bg-[#F4F7F5] text-stone-800 selection:bg-emerald-200">
            <Head title={`Pernikahan ${invitation.groom_name} & ${invitation.bride_name}`} />

            <CoverOverlay
                invitation={invitation}
                guestName={resolvedGuest?.name ?? null}
                isOpen={isCoverOpen}
                onOpen={handleOpenInvitation}
            />

            <AudioPlayer
                musicUrl={invitation.music_url}
                autoPlayTrigger={autoPlayAudio}
            />

            {/* Basmallah Calligraphy Header */}
            <div className="pt-12 text-center">
                <p className="font-serif text-2xl text-emerald-800 tracking-wide">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </p>
                <p className="mt-2 text-xs text-stone-500 italic max-w-md mx-auto px-4">
                    "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri..." (QS. Ar-Rum: 21)
                </p>
            </div>

            <main className="max-w-4xl mx-auto pt-10">
                <InvitationSectionsRenderer
                    invitation={invitation}
                    sections={sections}
                    events={events}
                    bankAccounts={bankAccounts}
                    loveStories={loveStories}
                    galleryPhotos={galleryPhotos}
                    wishes={wishes}
                    resolvedGuest={resolvedGuest}
                    turnstileSiteKey={turnstileSiteKey}
                    themeClasses={{
                        accentText: 'text-emerald-800',
                        accentBg: 'bg-emerald-700',
                        cardBg: 'bg-white',
                        headerFont: 'font-serif',
                    }}
                />
            </main>
        </div>
    );
}
