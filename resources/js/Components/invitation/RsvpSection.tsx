import { Event } from '@/types';
import { formatIndonesianDate } from '@/Utils/date';
import { useForm } from '@inertiajs/react';
import React, { useState } from 'react';

interface RsvpSectionProps {
    slug: string;
    events: Event[];
    resolvedGuest: { id: string; name: string; max_pax?: number; allowed_event_ids?: string[] } | null;
    turnstileSiteKey?: string;
}

export default function RsvpSection({
    slug,
    events,
    resolvedGuest,
    turnstileSiteKey,
}: RsvpSectionProps) {
    const [useCustomName, setUseCustomName] = useState(false);

    const { data, setData, post, processing, wasSuccessful, errors, reset } = useForm({
        guest_id: resolvedGuest ? resolvedGuest.id : null,
        name: resolvedGuest ? resolvedGuest.name : '',
        is_attending: true,
        number_of_guests: 1,
        notes: '',
        turnstile_token: '',
        honeypot: '',
        events: events.map((e) => ({
            event_id: e.id,
            is_attending: true,
        })),
    });

    const handleEventAttendanceChange = (eventId: string, isAttending: boolean) => {
        setData(
            'events',
            data.events.map((evt) =>
                evt.event_id === eventId ? { ...evt, is_attending: isAttending } : evt
            )
        );
    };

    const handleSwitchToCustom = () => {
        setUseCustomName(true);
        setData((prev) => ({
            ...prev,
            guest_id: null,
            name: '',
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('public.rsvp', slug), {
            preserveScroll: true,
            onSuccess: () => {
                reset('notes');
            },
        });
    };

    return (
        <div className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="text-center">
                <h3 className="text-2xl font-serif font-bold text-stone-800">
                    Konfirmasi Kehadiran
                </h3>
                <p className="mt-2 text-sm text-stone-600">
                    Merupakan kehormatan bagi kami atas konfirmasi kehadiran Anda
                </p>
            </div>

            {wasSuccessful && (
                <div className="mt-6 rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-center">
                    <p className="text-sm font-semibold text-emerald-800">
                        Terima kasih! Konfirmasi kehadiran Anda telah berhasil dikirim.
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* Honeypot field */}
                <input
                    type="text"
                    name="honeypot"
                    value={data.honeypot}
                    onChange={(e) => setData('honeypot', e.target.value)}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                />

                {/* Guest context badge / switch */}
                {resolvedGuest && !useCustomName ? (
                    <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3 border border-amber-200">
                        <div>
                            <span className="text-xs text-amber-700 font-medium">Tamu Terdaftar:</span>
                            <p className="text-sm font-bold text-amber-900">{resolvedGuest.name}</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleSwitchToCustom}
                            className="text-xs text-amber-800 underline hover:text-amber-900"
                        >
                            Bukan Anda? Isi nama sendiri
                        </button>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-stone-700">Nama Lengkap</label>
                        <input
                            type="text"
                            required
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Masukkan nama Anda"
                            className="mt-1 block w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                        />
                        {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                    </div>
                )}

                {/* Attendance radio */}
                <div>
                    <label className="block text-sm font-medium text-stone-700">Kehadiran</label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <label
                            className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition ${
                                data.is_attending
                                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="is_attending"
                                checked={data.is_attending === true}
                                onChange={() => setData('is_attending', true)}
                                className="sr-only"
                            />
                            Hadir
                        </label>
                        <label
                            className={`flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm font-medium transition ${
                                !data.is_attending
                                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                        >
                            <input
                                type="radio"
                                name="is_attending"
                                checked={data.is_attending === false}
                                onChange={() => setData('is_attending', false)}
                                className="sr-only"
                            />
                            Tidak Hadir
                        </label>
                    </div>
                </div>

                {data.is_attending && (
                    <>
                        {/* Number of guests */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-stone-700">
                                    Jumlah Tamu yang Hadir
                                </label>
                                {resolvedGuest?.max_pax && (
                                    <span className="text-xs text-amber-700 font-medium">
                                        Maks. alokasi: {resolvedGuest.max_pax} orang
                                    </span>
                                )}
                            </div>
                            <select
                                value={data.number_of_guests}
                                onChange={(e) => setData('number_of_guests', parseInt(e.target.value, 10))}
                                className="mt-1 block w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                            >
                                {Array.from({ length: Math.min(resolvedGuest?.max_pax || 5, 10) }, (_, i) => i + 1).map((num) => (
                                    <option key={num} value={num}>
                                        {num} Orang
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Multi-event selection */}
                        {events.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                    Pilih Rangkaian Acara yang Dihadiri
                                </label>
                                <div className="space-y-2">
                                    {events.map((evt) => {
                                        const isSelected = data.events.find((e) => e.event_id === evt.id)?.is_attending ?? true;
                                        return (
                                            <label
                                                key={evt.id}
                                                className="flex items-center gap-3 rounded-lg border border-stone-200 p-3 hover:bg-stone-50 cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={(e) => handleEventAttendanceChange(evt.id!, e.target.checked)}
                                                    className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                                                />
                                                <div className="text-sm">
                                                    <p className="font-semibold text-stone-800">{evt.event_name}</p>
                                                    <p className="text-xs text-stone-500">{formatIndonesianDate(evt.date)} • {evt.venue_name}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-stone-700">Ucapan / Pesan Tambahan</label>
                    <textarea
                        rows={3}
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder="Tuliskan ucapan atau doa restu..."
                        className="mt-1 block w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm"
                    />
                </div>

                {(errors as Record<string, string>).turnstile && (
                    <p className="text-xs text-rose-600 text-center">{(errors as Record<string, string>).turnstile}</p>
                )}

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-amber-500 disabled:opacity-50"
                >
                    {processing ? 'Mengirim Konfirmasi...' : 'Kirim Konfirmasi'}
                </button>
            </form>
        </div>
    );
}
