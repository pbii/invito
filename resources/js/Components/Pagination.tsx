import { Link } from '@inertiajs/react';
import React from 'react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

interface PaginationProps {
    meta: PaginationMeta;
    className?: string;
}

export default function Pagination({ meta, className = '' }: PaginationProps) {
    if (!meta || meta.last_page <= 1) {
        return (
            <div className={`flex items-center justify-between text-xs text-gray-500 py-3 ${className}`}>
                <span>Total {meta?.total || 0} data</span>
            </div>
        );
    }

    const cleanLabel = (label: string) => {
        if (label.includes('Previous') || label.includes('&laquo;')) return '← Sebelumnya';
        if (label.includes('Next') || label.includes('&raquo;')) return 'Berikutnya →';
        return label;
    };

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 py-4 ${className}`}>
            <div className="text-xs text-gray-500 dark:text-zinc-400">
                Menampilkan <span className="font-semibold text-gray-700 dark:text-zinc-200">{meta.from ?? 0}</span> sampai{' '}
                <span className="font-semibold text-gray-700 dark:text-zinc-200">{meta.to ?? 0}</span> dari{' '}
                <span className="font-semibold text-gray-700 dark:text-zinc-200">{meta.total}</span> data
            </div>

            <nav aria-label="Pagination Navigation" className="inline-flex -space-x-px rounded-lg shadow-sm isolate">
                {meta.links.map((link, idx) => {
                    const isEdge = idx === 0 || idx === meta.links.length - 1;
                    const label = cleanLabel(link.label);

                    if (!link.url) {
                        return (
                            <span
                                key={idx}
                                className={`relative inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-300 dark:text-slate-600 bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-white/[0.08] cursor-not-allowed ${
                                    idx === 0 ? 'rounded-l-lg' : ''
                                } ${idx === meta.links.length - 1 ? 'rounded-r-lg' : ''}`}
                            >
                                {label}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`relative inline-flex items-center px-3.5 py-1.5 text-xs font-medium border transition-colors ${
                                link.active
                                    ? 'z-10 bg-admin-primary border-admin-primary text-white shadow-xs'
                                    : 'bg-white dark:bg-[#0E131F] border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white'
                            } ${idx === 0 ? 'rounded-l-lg' : ''} ${idx === meta.links.length - 1 ? 'rounded-r-lg' : ''}`}
                        >
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
