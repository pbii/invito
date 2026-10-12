import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <div className="mb-6 text-center">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Atur Ulang Kata Sandi
                </h1>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Masukkan alamat email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full rounded-xl border-gray-200 text-sm focus:border-admin-primary focus:ring-admin-primary"
                        isFocused={true}
                        placeholder="contoh@domain.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full inline-flex items-center justify-center rounded-xl bg-admin-primary py-3 text-sm font-semibold text-white shadow-md shadow-admin-primary/20 transition hover:brightness-110 disabled:opacity-50 active:scale-98"
                    >
                        {processing ? 'Mengirim...' : 'Kirim Tautan Reset Sandi'}
                    </button>
                </div>

                <div className="pt-4 text-center border-t border-gray-100 dark:border-neutral-800">
                    <Link
                        href={route('login')}
                        className="text-xs font-medium text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white"
                    >
                        &larr; Kembali ke Halaman Masuk
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
