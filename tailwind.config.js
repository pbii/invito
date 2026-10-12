import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                serif: ['"Playfair Display"', ...defaultTheme.fontFamily.serif],
                cormorant: ['"Cormorant Upright"', ...defaultTheme.fontFamily.serif],
                ovo: ['"Ovo"', ...defaultTheme.fontFamily.serif],
                roboto: ['"Roboto"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                admin: {
                    primary: 'rgb(var(--admin-primary-rgb) / <alpha-value>)',
                    secondary: 'rgb(var(--admin-secondary-rgb) / <alpha-value>)',
                    bg: 'rgb(var(--admin-background-rgb) / <alpha-value>)',
                    surface: 'rgb(var(--admin-surface-rgb) / <alpha-value>)',
                    sidebar: 'rgb(var(--admin-sidebar-rgb) / <alpha-value>)',
                    border: 'rgb(var(--admin-border-rgb) / <alpha-value>)',
                },
                wedding: {
                    50: '#fff1f2',
                    100: '#ffe4e6',
                    200: '#fecdd3',
                    300: '#fda4af',
                    400: '#fb7185',
                    500: '#f43f5e',
                    600: '#e11d48',
                    700: '#be123c',
                    800: '#9f1239',
                    900: '#881337',
                },
                champagne: {
                    50: '#faf8f5',
                    100: '#f4efe6',
                    200: '#e8dcce',
                    300: '#dac5af',
                    400: '#c7a98c',
                    500: '#b89270',
                    600: '#a37b5a',
                    700: '#846046',
                    800: '#6c4f3b',
                    900: '#584132',
                },
            },
        },
    },

    plugins: [forms],
};
