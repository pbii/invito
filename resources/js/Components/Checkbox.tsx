import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 dark:border-neutral-700 dark:bg-neutral-900 text-admin-primary shadow-xs focus:ring-admin-primary ' +
                className
            }
        />
    );
}
