import ApplicationLogo from '@/Components/ApplicationLogo';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { branding } = usePage<PageProps>().props;
    const appName = branding?.app_name || 'WedInvite';
    const appTagline = branding?.app_tagline || 'Platform Undangan Digital Elegan';

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-radial from-admin-primary/5 via-neutral-50 to-admin-secondary/5 p-4 sm:p-6 font-sans selection:bg-admin-primary/20 selection:text-admin-primary">
            {/* Background Decorative Rings */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-admin-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-admin-secondary/10 blur-3xl" />

            <div className="relative mb-6 text-center">
                <Link href="/" className="inline-block transition-transform hover:scale-105">
                    <ApplicationLogo />
                </Link>
            </div>

            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white/95 p-8 shadow-xl shadow-gray-200/50 backdrop-blur-md sm:p-10">
                {children}
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} {appName} &bull; {appTagline}
            </div>
        </div>
    );
}
