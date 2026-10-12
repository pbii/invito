import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import React, { PropsWithChildren, ReactNode, useState } from "react";

interface AdminLayoutProps {
    header?: ReactNode;
    title?: string;
}

export default function AdminLayout({
    header,
    title,
    children,
}: PropsWithChildren<AdminLayoutProps>) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigationGroups = [
        {
            name: "Ikhtisar",
            items: [
                {
                    name: "Dashboard",
                    href: route("admin.dashboard"),
                    active: route().current("admin.dashboard"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                    ),
                },
            ],
        },
        {
            name: "Pengguna & Undangan",
            items: [
                {
                    name: "Manajemen Pengguna",
                    href: route("admin.users.index"),
                    active: route().current("admin.users.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Semua Undangan",
                    href: route("admin.invitations.index"),
                    active: route().current("admin.invitations.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                        </svg>
                    ),
                },
            ],
        },
        {
            name: "Katalog & Paket",
            items: [
                {
                    name: "Katalog Template",
                    href: route("admin.templates.index"),
                    active: route().current("admin.templates.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Kategori Template",
                    href: route("admin.template-categories.index"),
                    active: route().current("admin.template-categories.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Paket & Harga",
                    href: route("admin.packages.index"),
                    active: route().current("admin.packages.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    ),
                },
            ],
        },
        {
            name: "Master Data",
            items: [
                {
                    name: "Metode Pembayaran",
                    href: route("admin.payment-providers.index"),
                    active: route().current("admin.payment-providers.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Jenis Prosesi Acara",
                    href: route("admin.event-types.index"),
                    active: route().current("admin.event-types.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Pesan Broadcast WA",
                    href: route("admin.message-templates.index"),
                    active: route().current("admin.message-templates.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    ),
                },
            ],
        },
        {
            name: "Konfigurasi",
            items: [
                {
                    name: "Pengaturan Global",
                    href: route("admin.settings.index"),
                    active: route().current("admin.settings.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    ),
                },
                {
                    name: "Feature Flags",
                    href: route("admin.feature-flags.index"),
                    active: route().current("admin.feature-flags.*"),
                    icon: (
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                            />
                        </svg>
                    ),
                },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-admin-bg text-slate-100 font-sans selection:bg-admin-primary/30 selection:text-admin-primary flex">
            {/* Background Ambient Radial Mesh */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/4 h-[550px] w-[550px] rounded-full bg-admin-primary/15 blur-[150px]" />
                <div className="absolute top-1/3 -right-32 h-[550px] w-[550px] rounded-full bg-admin-secondary/10 blur-[160px]" />
                <div className="absolute -bottom-32 left-1/3 h-[450px] w-[450px] rounded-full bg-admin-primary/10 blur-[140px]" />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-admin-sidebar/95 backdrop-blur-2xl border-r border-admin-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Brand Header */}
                    <div className="h-16 flex items-center px-5 border-b border-admin-border justify-between">
                        <Link
                            href={route("admin.dashboard")}
                            className="flex items-center gap-2.5 group"
                        >
                            {usePage().props.branding?.app_logo_url ? (
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1 shadow-lg border border-white/20 transition group-hover:scale-105 overflow-hidden">
                                    <img
                                        src={usePage().props.branding?.app_logo_url}
                                        alt={usePage().props.branding?.app_name || "WedInvite"}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-tr from-admin-primary via-admin-primary/80 to-admin-secondary text-white shadow-lg shadow-admin-primary/25 ring-1 ring-white/20 transition group-hover:scale-105">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2.5"
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </div>
                            )}
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-sans text-sm font-bold tracking-tight text-white leading-none">
                                        {usePage().props.branding?.app_name ||
                                            "WedInvite"}
                                    </span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-semibold bg-admin-primary/10 text-admin-primary border border-admin-primary/20">
                                        ENTERPRISE
                                    </span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-400 mt-0.5">
                                    Control Panel
                                </span>
                            </div>
                        </Link>
                        <button
                            type="button"
                            className="lg:hidden text-slate-400 hover:text-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <svg
                                className="w-5 h-5"
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
                    </div>

                    {/* Navigation Menu Links */}
                    <div className="flex-1 overflow-y-auto px-3 py-5 space-y-5 custom-scrollbar">
                        {navigationGroups.map((group, gIdx) => (
                            <div key={gIdx} className="space-y-1">
                                <h3 className="px-3 text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                                    {group.name}
                                </h3>
                                <div className="mt-1.5 space-y-0.5">
                                    {group.items.map((item, itemIdx) => (
                                        <Link
                                            key={itemIdx}
                                            href={item.href}
                                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                                item.active
                                                    ? "bg-admin-primary/15 text-white shadow-xs border border-admin-primary/40 font-semibold"
                                                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                                            }`}
                                        >
                                            <span
                                                className={
                                                    item.active
                                                        ? "text-admin-primary"
                                                        : "text-slate-400"
                                                }
                                            >
                                                {item.icon}
                                            </span>
                                            <span>{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* User Profile Bar at Bottom of Sidebar */}
                    <div className="p-3 border-t border-admin-border bg-white/[0.01]">
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-admin-surface/80 border border-admin-border">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-linear-to-tr from-admin-primary to-admin-secondary text-[11px] font-bold text-white shadow-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-semibold text-slate-200 truncate">
                                        {user.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400 truncate">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-white/[0.05] transition shrink-0"
                                title="Keluar"
                            >
                                <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Workspace */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10">
                {/* Topbar Header */}
                <header className="sticky top-0 z-30 h-16 border-b border-admin-border bg-admin-bg/90 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="lg:hidden p-2 text-slate-400 hover:bg-white/[0.05] rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                        <h1 className="text-sm font-semibold text-slate-200 tracking-tight">
                            {title || "Dashboard"}
                        </h1>
                    </div>
                </header>

                {/* Page Header (Optional) */}
                {header && (
                    <div className="border-b border-admin-border bg-white/[0.01] px-4 sm:px-8 py-4">
                        {header}
                    </div>
                )}

                {/* Main Body Content */}
                <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
