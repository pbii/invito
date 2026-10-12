import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { HTMLAttributes } from 'react';

export default function ApplicationLogo(props: HTMLAttributes<HTMLDivElement>) {
    const { branding } = usePage<PageProps>().props;
    const appName = branding?.app_name || 'WedInvite';
    const appTagline = branding?.app_tagline || 'Platform Undangan Digital';
    const appLogoUrl = branding?.app_logo_url;

    return (
        <div {...props} className={`flex items-center gap-2.5 ${props.className || ''}`}>
            {appLogoUrl ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white/10 p-1 shadow-md border border-gray-200/20">
                    <img
                        src={appLogoUrl}
                        alt={appName}
                        className="h-full w-full object-contain"
                    />
                </div>
            ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-admin-primary via-admin-primary/80 to-admin-secondary text-white shadow-md shadow-admin-primary/20">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </div>
            )}
            <div className="flex flex-col text-left">
                <span className="font-serif text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">
                    {appName}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400 dark:text-neutral-400 mt-0.5 truncate max-w-[150px]">
                    {appTagline}
                </span>
            </div>
        </div>
    );
}
