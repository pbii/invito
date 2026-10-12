import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-admin-primary text-gray-900 dark:text-white focus:border-admin-primary font-semibold'
                    : 'border-transparent text-gray-500 dark:text-neutral-400 hover:border-gray-300 dark:hover:border-neutral-600 hover:text-gray-700 dark:hover:text-neutral-200 focus:border-gray-300 focus:text-gray-700') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
