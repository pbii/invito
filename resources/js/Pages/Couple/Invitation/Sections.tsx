import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Invitation, InvitationSection } from '@/types';
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface SectionsProps {
    invitation: Invitation;
    sections: InvitationSection[];
}

const DEFAULT_SECTION_NAMES: Record<string, string> = {
    cover: 'Layar Sampul (Cover)',
    quote: 'Kutipan / Ayat Suci',
    couple: 'Profil Mempelai',
    event: 'Rangkaian Acara',
    countdown: 'Hitung Mundur Acara',
    love_story: 'Kisah Cinta (Love Story)',
    gallery: 'Galeri Foto & Video',
    streaming: 'Live Streaming',
    rsvp: 'Konfirmasi Kehadiran (RSVP)',
    wishes: 'Ucapan & Doa Tamu',
    gift: 'Amplop Digital & Hadiah',
    closing: 'Penutup & Salam Hormat',
};

function SortableItem({
    section,
    onToggle,
    onTitleChange,
}: {
    section: InvitationSection;
    onToggle: (id: string) => void;
    onTitleChange: (id: string, title: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
    };

    const defaultTitle =
        DEFAULT_SECTION_NAMES[section.section_key] || section.section_key;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition ${
                section.is_enabled
                    ? 'border-gray-200'
                    : 'border-gray-200 bg-gray-50/70 opacity-60'
            }`}
        >
            <div className="flex flex-1 items-center space-x-3">
                {/* Drag Handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab p-1 text-gray-400 hover:text-gray-600 active:cursor-grabbing"
                    title="Geser untuk mengubah urutan"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 8h16M4 16h16"
                        />
                    </svg>
                </button>

                {/* Section Key Tag & Title Input */}
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-gray-600">
                            {section.section_key}
                        </span>
                        <span className="text-xs text-gray-400">
                            (Bawaan: {defaultTitle})
                        </span>
                    </div>

                    <div className="mt-1.5">
                        <input
                            type="text"
                            value={section.custom_title || ''}
                            placeholder={`Kustom judul: "${defaultTitle}"`}
                            onChange={(e) => onTitleChange(section.id, e.target.value)}
                            className="block w-full max-w-sm rounded-xl border-gray-200 py-1.5 px-3 text-xs text-gray-800 shadow-2xs focus:border-admin-primary focus:ring-admin-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center space-x-3">
                <span className="text-xs font-medium text-gray-600">
                    {section.is_enabled ? 'Aktif' : 'Nonaktif'}
                </span>
                <button
                    type="button"
                    onClick={() => onToggle(section.id)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        section.is_enabled ? 'bg-admin-primary' : 'bg-gray-200'
                    }`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            section.is_enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                    />
                </button>
            </div>
        </div>
    );
}

export default function InvitationSections({
    invitation,
    sections: initialSections = [],
}: SectionsProps) {
    const [sections, setSections] = useState<InvitationSection[]>(
        [...initialSections].sort((a, b) => a.sort_order - b.sort_order),
    );
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newArray = arrayMove(items, oldIndex, newIndex);
                return newArray.map((sec, idx) => ({
                    ...sec,
                    sort_order: idx + 1,
                }));
            });
        }
    };

    const handleToggle = (id: string) => {
        setSections((items) =>
            items.map((sec) =>
                sec.id === id ? { ...sec, is_enabled: !sec.is_enabled } : sec,
            ),
        );
    };

    const handleTitleChange = (id: string, title: string) => {
        setSections((items) =>
            items.map((sec) =>
                sec.id === id ? { ...sec, custom_title: title } : sec,
            ),
        );
    };

    const handleSave = () => {
        setIsSaving(true);
        router.put(
            route('invitation.sections.update', invitation.id),
            {
                sections: sections.map((sec, idx) => ({
                    id: sec.id,
                    section_key: sec.section_key,
                    custom_title: sec.custom_title,
                    is_enabled: sec.is_enabled,
                    sort_order: idx + 1,
                })),
            },
            {
                onFinish: () => setIsSaving(false),
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Link href={route('dashboard')} className="hover:underline">
                                Dashboard
                            </Link>
                            <span>/</span>
                            <Link href={route('invitation.edit', invitation.id)} className="hover:underline">
                                Edit Undangan
                            </Link>
                            <span>/</span>
                            <span className="font-semibold text-gray-800">Tata Letak Bagian</span>
                        </div>
                        <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-gray-900">
                            Tata Letak Bagian Undangan
                        </h2>
                        <p className="text-xs text-gray-500">
                            {invitation.groom_name} &amp; {invitation.bride_name} (/{invitation.slug})
                        </p>
                    </div>

                    <div className="flex items-center space-x-3">
                        <a
                            href={`/${invitation.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            <svg
                                className="mr-1.5 h-4 w-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                            Preview
                        </a>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-admin-primary px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-110 disabled:opacity-50"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Tata Letak'}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Tata Letak Section" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800">
                        <div className="flex items-center space-x-2">
                            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold">Panduan Pengaturan Tata Letak:</span>
                        </div>
                        <ul className="mt-2 list-inside list-disc space-y-1 pl-1 text-blue-700">
                            <li>Geser ikon baris untuk menata urutan tampil section dari atas ke bawah.</li>
                            <li>Gunakan sakelar tombol di samping kanan untuk mengaktifkan atau menonaktifkan section tertentu.</li>
                            <li>Anda dapat mengganti teks judul bagian sesuai keinginan, contoh: &ldquo;Kisah Kami&rdquo; alih-alih &ldquo;Cerita Cinta&rdquo;.</li>
                        </ul>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sections.map((s) => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-3">
                                {sections.map((section) => (
                                    <SortableItem
                                        key={section.id}
                                        section={section}
                                        onToggle={handleToggle}
                                        onTitleChange={handleTitleChange}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    <div className="mt-8 flex justify-end">
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={handleSave}
                            className="inline-flex items-center rounded-lg bg-admin-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
                        >
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
