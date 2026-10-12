import React, { useEffect, useState } from 'react';

interface ThemeToggleProps {
    className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const [isDark, setIsDark] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
        const isCurrentDark = document.documentElement.classList.contains('dark');
        setIsDark(isCurrentDark);

        // Optional: synchronize if another tab changes the theme
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'theme') {
                const dark = e.newValue === 'dark' || (!e.newValue && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (dark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
                setIsDark(dark);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    if (!mounted) {
        return (
            <div
                className={`h-9 w-9 rounded-xl border border-transparent p-2 ${className}`}
                aria-hidden="true"
            />
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            title={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            className={`group relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/80 bg-white/90 text-gray-600 shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-admin-primary/50 dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white ${className}`}
        >
            {isDark ? (
                // Sun Icon (when currently dark, click to switch to light)
                <svg
                    className="h-4.5 w-4.5 text-amber-400 transition-transform duration-200 group-hover:rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                </svg>
            ) : (
                // Moon Icon (when currently light, click to switch to dark)
                <svg
                    className="h-4.5 w-4.5 text-neutral-600 transition-transform duration-200 group-hover:-rotate-12 dark:text-neutral-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                    />
                </svg>
            )}
        </button>
    );
}
