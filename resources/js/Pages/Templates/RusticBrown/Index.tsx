import AudioPlayer from '@/Components/invitation/AudioPlayer';
import CoverOverlay from '@/Components/invitation/CoverOverlay';
import InvitationSectionsRenderer from '@/Components/invitation/InvitationSectionsRenderer';
import { Event, GalleryPhoto, Invitation, InvitationBankAccount, InvitationSection, LoveStory, Wish } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface RusticBrownProps {
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

export default function RusticBrown({
    invitation,
    sections,
    events,
    bankAccounts,
    loveStories,
    galleryPhotos,
    wishes,
    guestToken,
    turnstileSiteKey,
}: RusticBrownProps) {
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
        <div className="min-h-screen bg-[#FBF7F0] text-[#3D312A] selection:bg-amber-200">
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

            <main className="max-w-4xl mx-auto pt-16">
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
                        accentText: 'text-[#8B5E3C]',
                        accentBg: 'bg-[#8B5E3C]',
                        cardBg: 'bg-white',
                        headerFont: 'font-serif',
                    }}
                />
            </main>
        </div>
    );
}
