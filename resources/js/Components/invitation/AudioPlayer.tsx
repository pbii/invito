import React, { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
    musicUrl?: string | null;
    autoPlayTrigger?: boolean;
}

export default function AudioPlayer({ musicUrl, autoPlayTrigger }: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (autoPlayTrigger && audioRef.current && !isPlaying) {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch((e) => {
                console.warn('Autoplay prevented by browser:', e);
            });
        }
    }, [autoPlayTrigger]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch((e) => console.warn(e));
        }
    };

    if (!musicUrl) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-40">
            <audio ref={audioRef} src={musicUrl} loop preload="auto" />
            <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-stone-900/80 text-amber-400 shadow-xl backdrop-blur-md transition duration-300 hover:scale-110 active:scale-95 border border-amber-400/30 ${
                    isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '4s' }}
            >
                {isPlaying ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}
