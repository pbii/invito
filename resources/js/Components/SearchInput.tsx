import React from "react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    inputClassName?: string;
    onClear?: () => void;
}

export default function SearchInput({
    value,
    onChange,
    placeholder = "Cari...",
    className = "",
    inputClassName = "",
    onClear,
}: SearchInputProps) {
    return (
        <div className={`relative flex items-center ${className}`}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </span>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full pl-10 pr-9 py-2 text-sm bg-transparent border border-gray-300 hover:border-gray-400 dark:border-neutral-700 dark:hover:border-neutral-600 text-gray-900 dark:text-neutral-100 rounded-xl shadow-xs placeholder-gray-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-admin-primary focus:border-admin-primary transition-all ${inputClassName}`}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => {
                        onChange("");
                        if (onClear) onClear();
                    }}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-neutral-400 dark:hover:text-neutral-200 transition"
                    title="Hapus pencarian"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            )}
        </div>
    );
}
