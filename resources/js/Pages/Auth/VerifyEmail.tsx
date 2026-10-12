import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Alamat Email" />

            <div className="mb-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-admin-primary/10 text-admin-primary mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900">
                    Verifikasi Email Anda
                </h1>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                    Terima kasih telah mendaftar! Sebelum memulai, silakan verifikasi alamat email Anda melalui tautan yang baru saja kami kirimkan.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 border border-emerald-200 text-center">
                    Tautan verifikasi baru telah dikirim ke alamat email yang Anda daftarkan.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-admin-primary py-3 text-sm font-semibold text-white shadow-md shadow-admin-primary/20 transition hover:brightness-110 disabled:opacity-50 active:scale-98"
                >
                    {processing ? 'Mengirim Ulang...' : 'Kirim Ulang Email Verifikasi'}
                </button>

                <div className="pt-2 text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs font-medium text-gray-400 hover:text-gray-600 underline"
                    >
                        Keluar dari Akun
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
