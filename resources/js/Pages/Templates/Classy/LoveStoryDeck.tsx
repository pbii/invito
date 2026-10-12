import React, { useState } from 'react';
import { LoveStory } from '@/types';

interface LoveStoryDeckProps {
    stories: LoveStory[];
}

export default function LoveStoryDeck({ stories }: LoveStoryDeckProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!stories || stories.length === 0) return null;

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % stories.length);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + stories.length) % stories.length);
    };

    // Katsudoto original tilt rotation angles
    const tiltAngles = [0, -3.5, 3.5, -2, 2.5];

    return (
        <div className="relative w-full max-w-md mx-auto pt-4 pb-8 select-none">
            {/* Card Deck Wrapper */}
            <div className="relative h-64 sm:h-72 w-full flex items-center justify-center">
                {stories.map((story, idx) => {
                    // Calculate relative offset from active
                    const offset = (idx - activeIndex + stories.length) % stories.length;
                    const isCurrent = offset === 0;
                    const isNext = offset === 1;
                    const isSecondNext = offset === 2;
                    const isHidden = offset > 2;

                    if (isHidden) return null;

                    const rotation = isCurrent ? 0 : tiltAngles[idx % tiltAngles.length];
                    const scale = isCurrent ? 1 : isNext ? 0.94 : 0.88;
                    const translateY = isCurrent ? 0 : isNext ? 12 : 24;
                    const zIndex = stories.length - offset;
                    const opacity = isCurrent ? 1 : isNext ? 0.75 : 0.45;

                    return (
                        <div
                            key={story.id || idx}
                            onClick={handleNext}
                            style={{
                                transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
                                zIndex,
                                opacity,
                                transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
                            }}
                            className="absolute inset-0 w-full classy-card-burgundy rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl border border-[#C5A880]/30 cursor-pointer overflow-hidden backdrop-blur-md"
                        >
                            <div className="flex items-center justify-between border-b border-[#C5A880]/20 pb-3">
                                <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#DFCAAB] bg-[#C5A880]/15 px-3 py-1 rounded-full border border-[#C5A880]/30">
                                    {story.date || `Momen #${idx + 1}`}
                                </span>
                                <span className="text-[10px] font-mono text-[#E7E4DB]/50">
                                    {idx + 1} / {stories.length}
                                </span>
                            </div>

                            <div className="my-auto space-y-2 py-3">
                                <h4 className="classy-serif text-2xl text-[#DFCAAB] font-medium leading-snug">
                                    {story.title}
                                </h4>
                                <p className="text-xs text-[#E7E4DB]/85 leading-relaxed font-light line-clamp-4">
                                    {story.description}
                                </p>
                            </div>

                            <div className="text-center pt-2 border-t border-[#C5A880]/15">
                                <span className="text-[10px] font-mono text-[#A29166] uppercase tracking-wider">
                                    Klik kartu untuk lanjut &rarr;
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {stories.length > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="w-9 h-9 rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#DFCAAB] hover:bg-[#C5A880]/20 active:scale-95 transition"
                        aria-label="Sebelumnya"
                    >
                        &larr;
                    </button>
                    <div className="flex gap-1.5">
                        {stories.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                    idx === activeIndex ? 'w-6 bg-[#C5A880]' : 'w-1.5 bg-[#C5A880]/30'
                                }`}
                                aria-label={`Pindah ke slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="w-9 h-9 rounded-full border border-[#C5A880]/40 flex items-center justify-center text-[#DFCAAB] hover:bg-[#C5A880]/20 active:scale-95 transition"
                        aria-label="Selanjutnya"
                    >
                        &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}
