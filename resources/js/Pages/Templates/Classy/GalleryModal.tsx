import React from 'react';

interface GalleryModalProps {
    isOpen: boolean;
    photoUrl: string | null;
    caption?: string | null;
    onClose: () => void;
}

export default function GalleryModal({ isOpen, photoUrl, caption, onClose }: GalleryModalProps) {
    if (!isOpen || !photoUrl) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#17130E]/80 border border-[#C5A880]/40 text-[#DFCAAB] flex items-center justify-center hover:bg-[#C5A880]/20 transition z-50 text-xl font-light"
                aria-label="Tutup"
            >
                &times;
            </button>

            <div
                className="relative max-w-3xl max-h-[85vh] w-full flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={photoUrl}
                    alt={caption || 'Preview'}
                    className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-[#C5A880]/40 shadow-2xl"
                />
                {caption && (
                    <div className="mt-4 px-6 py-2 rounded-full classy-glass border border-[#C5A880]/30 text-xs text-[#DFCAAB] font-mono text-center">
                        {caption}
                    </div>
                )}
            </div>
        </div>
    );
}
