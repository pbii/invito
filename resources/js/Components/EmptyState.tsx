import React from 'react';

interface EmptyStateProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    icon?: React.ReactNode;
}

export default function EmptyState({
    title,
    description,
    action,
    icon,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50 backdrop-blur-xs">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-admin-primary/10 text-admin-primary mb-4 shadow-xs">
                {icon || (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                )}
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">{title}</h4>
            {description && (
                <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>
            )}
            {action && <div>{action}</div>}
        </div>
    );
}
