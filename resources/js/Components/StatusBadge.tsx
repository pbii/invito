import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'wedding' | 'primary';

interface StatusBadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    className?: string;
    dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor: string }> = {
    success: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-500 dark:text-emerald-400', dotColor: 'bg-emerald-500' },
    warning: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-600 dark:text-amber-400', dotColor: 'bg-amber-500' },
    danger: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-600 dark:text-rose-400', dotColor: 'bg-rose-500' },
    info: { bg: 'bg-sky-500/10 border-sky-500/20', text: 'text-sky-600 dark:text-sky-400', dotColor: 'bg-sky-500' },
    neutral: { bg: 'bg-gray-500/10 border-gray-500/20', text: 'text-gray-600 dark:text-slate-400', dotColor: 'bg-gray-400' },
    wedding: { bg: 'bg-admin-primary/10 border-admin-primary/20', text: 'text-admin-primary', dotColor: 'bg-admin-primary' },
    primary: { bg: 'bg-admin-primary/10 border-admin-primary/20', text: 'text-admin-primary', dotColor: 'bg-admin-primary' },
};

export default function StatusBadge({
    variant = 'neutral',
    children,
    className = '',
    dot = true,
}: StatusBadgeProps) {
    const style = variantStyles[variant];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${className}`}
        >
            {dot && <span className={`h-1.5 w-1.5 rounded-full ${style.dotColor}`} />}
            {children}
        </span>
    );
}
