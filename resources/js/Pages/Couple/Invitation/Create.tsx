import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    EventType,
    Package,
    PaymentProvider,
    Template,
    TemplateCategory,
} from "@/types";
import { compressImage, fileToBase64 } from "@/Utils/imageCompression";
import { Head, router } from "@inertiajs/react";
import React, { ChangeEvent, useState } from "react";

interface CreateInvitationProps {
    templates: Template[];
    categories: TemplateCategory[];
    packages: Package[];
    eventTypes: EventType[];
    paymentProviders: PaymentProvider[];
}

interface EventFormItem {
    event_type_id: string | null;
    event_name: string;
    date: string;
    time_start: string;
    time_end: string;
    venue_name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
}

interface BankAccountFormItem {
    provider_id: string | null;
    bank_or_wallet_name: string;
    account_number: string;
    account_holder: string;
    qr_code_url: string;
}

interface LoveStoryFormItem {
    title: string;
    description: string;
    date: string;
    order: number;
}

interface GalleryPhotoFormItem {
    photo_url: string;
    caption: string;
    order: number;
}

export default function CreateInvitation({
    templates = [],
    categories = [],
    packages = [],
    eventTypes = [],
    paymentProviders = [],
}: CreateInvitationProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Form state
    const [formData, setFormData] = useState({
        template_id: templates[0]?.id || "",
        package_id: packages[0]?.id || "",
        slug: "",
        groom_name: "",
        groom_father: "",
        groom_mother: "",
        groom_photo: "",
        bride_name: "",
        bride_father: "",
        bride_mother: "",
        bride_photo: "",
        music_url: "",
        streaming_url: "",
        language: "id",
        events: [
            {
                event_type_id: eventTypes[0]?.id || null,
                event_name: "Akad Nikah",
                date: "",
                time_start: "08:00",
                time_end: "10:00",
                venue_name: "",
                address: "",
                latitude: null,
                longitude: null,
            },
            {
                event_type_id: eventTypes[1]?.id || null,
                event_name: "Resepsi Pernikahan",
                date: "",
                time_start: "11:00",
                time_end: "14:00",
                venue_name: "",
                address: "",
                latitude: null,
                longitude: null,
            },
        ] as EventFormItem[],
        bank_accounts: [] as BankAccountFormItem[],
        love_stories: [] as LoveStoryFormItem[],
        gallery_photos: [] as GalleryPhotoFormItem[],
    });

    const steps = [
        { number: 1, title: "Template & Paket" },
        { number: 2, title: "Data Mempelai" },
        { number: 3, title: "Rangkaian Acara" },
        { number: 4, title: "Rekening & Hadiah" },
        { number: 5, title: "Galeri & Cerita" },
        { number: 6, title: "Pengaturan & Final" },
    ];

    const filteredTemplates = templates.filter((tpl) => {
        if (selectedCategory === "all") return true;
        return tpl.categories?.some((cat) => cat.id === selectedCategory);
    });

    const handlePhotoUpload = async (
        e: ChangeEvent<HTMLInputElement>,
        target: "groom_photo" | "bride_photo",
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file);
            const base64 = await fileToBase64(compressed);
            setFormData((prev) => ({ ...prev, [target]: base64 }));
        } catch {
            alert("Gagal mengompres gambar.");
        }
    };

    const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const uploadedPhotos: GalleryPhotoFormItem[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const compressed = await compressImage(file);
                const base64 = await fileToBase64(compressed);
                uploadedPhotos.push({
                    photo_url: base64,
                    caption: "",
                    order: formData.gallery_photos.length + i,
                });
            } catch {
                // skip failed compressions
            }
        }

        setFormData((prev) => ({
            ...prev,
            gallery_photos: [...prev.gallery_photos, ...uploadedPhotos],
        }));
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.template_id)
                newErrors.template_id = "Pilih salah satu template.";
            if (!formData.package_id)
                newErrors.package_id = "Pilih salah satu paket.";
        } else if (step === 2) {
            if (!formData.groom_name.trim())
                newErrors.groom_name = "Nama mempelai pria wajib diisi.";
            if (!formData.bride_name.trim())
                newErrors.bride_name = "Nama mempelai wanita wajib diisi.";
        } else if (step === 3) {
            if (formData.events.length === 0) {
                newErrors.events = "Tambahkan minimal satu rangkaian acara.";
            } else {
                formData.events.forEach((ev, idx) => {
                    if (!ev.event_name.trim())
                        newErrors[`event_name_${idx}`] =
                            "Nama acara wajib diisi.";
                    if (!ev.date)
                        newErrors[`event_date_${idx}`] =
                            "Tanggal acara wajib diisi.";
                    if (!ev.venue_name.trim())
                        newErrors[`event_venue_${idx}`] =
                            "Lokasi/Gedung wajib diisi.";
                });
            }
        } else if (step === 6) {
            if (!formData.slug.trim()) {
                newErrors.slug = "Slug undangan wajib diisi.";
            } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
                newErrors.slug =
                    "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-).";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = () => {
        if (!validateStep(currentStep)) return;

        setIsSubmitting(true);
        router.post(route("invitation.store"), formData as any, {
            onError: (err) => {
                setErrors(err);
                setIsSubmitting(false);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold leading-tight text-gray-800">
                        Buat Undangan Baru
                    </h2>
                </div>
            }
        >
            <Head title="Buat Undangan Baru" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {/* Stepper Wizard Indicator */}
                    <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            {steps.map((s, idx) => (
                                <React.Fragment key={s.number}>
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                                                currentStep === s.number
                                                    ? "bg-admin-primary text-white shadow-md shadow-admin-primary/20"
                                                    : currentStep > s.number
                                                      ? "bg-emerald-500 text-white"
                                                      : "bg-gray-100 text-gray-400"
                                            }`}
                                        >
                                            {currentStep > s.number ? (
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
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            ) : (
                                                s.number
                                            )}
                                        </div>
                                        <span
                                            className={`mt-2 hidden text-xs font-medium sm:block ${
                                                currentStep === s.number
                                                    ? "text-admin-primary font-bold"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            {s.title}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div
                                            className={`h-0.5 flex-1 transition ${
                                                currentStep > s.number
                                                    ? "bg-emerald-500"
                                                    : "bg-gray-200"
                                            }`}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Step Contents */}
                    <div className="rounded-xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm">
                        {/* STEP 1: PILIH TEMPLATE & PAKET */}
                        {currentStep === 1 && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Langkah 1: Pilih Desain Template
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Pilih tema visual yang paling sesuai
                                        dengan tema pernikahan Anda.
                                    </p>

                                    {/* Category Filter */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategory("all")
                                            }
                                            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                                                selectedCategory === "all"
                                                    ? "bg-admin-primary text-white shadow-xs"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            Semua Desain
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedCategory(cat.id)
                                                }
                                                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                                                    selectedCategory === cat.id
                                                        ? "bg-admin-primary text-white shadow-xs"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Template Grid */}
                                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {filteredTemplates.map((template) => (
                                            <div
                                                key={template.id}
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        template_id:
                                                            template.id,
                                                    }))
                                                }
                                                className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                                                    formData.template_id ===
                                                    template.id
                                                        ? "border-admin-primary shadow-md ring-2 ring-admin-primary/20"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <div className="aspect-[2/1] w-full overflow-hidden bg-gray-100">
                                                    <img
                                                        src={
                                                            template.thumbnail_url ||
                                                            "/images/templates/modern-floral.jpg"
                                                        }
                                                        alt={template.name}
                                                        onError={(e) => {
                                                            const target = e.currentTarget;
                                                            target.onerror = null;
                                                            target.src =
                                                                "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80";
                                                        }}
                                                        className="h-full w-full object-cover object-top transition duration-300 hover:scale-105"
                                                    />
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-gray-900">
                                                        {template.name}
                                                    </h4>
                                                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                                                        {template.description ||
                                                            "Tema elegan untuk momen istimewa."}
                                                    </p>
                                                </div>
                                                {formData.template_id ===
                                                    template.id && (
                                                    <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-admin-primary text-white shadow">
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="3"
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.template_id && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {errors.template_id}
                                        </p>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-8">
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Pilih Paket Layanan
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Tentukan paket fitur yang sesuai dengan
                                        kebutuhan Anda.
                                    </p>

                                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        {packages.map((pkg) => (
                                            <div
                                                key={pkg.id}
                                                onClick={() =>
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        package_id: pkg.id,
                                                    }))
                                                }
                                                className={`relative cursor-pointer rounded-xl border-2 p-5 transition ${
                                                    formData.package_id ===
                                                    pkg.id
                                                        ? "border-admin-primary bg-admin-primary/5 shadow-md ring-2 ring-admin-primary/20"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                {pkg.badge && (
                                                    <span className="absolute -top-3 right-4 rounded-full bg-admin-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                                        {pkg.badge}
                                                    </span>
                                                )}
                                                <h4 className="font-bold text-gray-900">
                                                    {pkg.name}
                                                </h4>
                                                <p className="mt-2 text-xl font-extrabold text-admin-primary">
                                                    Rp{" "}
                                                    {pkg.price.toLocaleString(
                                                        "id-ID",
                                                    )}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Masa aktif{" "}
                                                    {pkg.duration_days} hari
                                                </p>
                                                <ul className="mt-4 space-y-1.5 text-xs text-gray-600">
                                                    <li>
                                                        • Max {pkg.max_invitations ?? 1} Website Undangan
                                                    </li>
                                                    <li>
                                                        • Max {pkg.max_guests}{" "}
                                                        Tamu
                                                    </li>
                                                    <li>
                                                        • Max {pkg.max_photos}{" "}
                                                        Foto Galeri
                                                    </li>
                                                    <li>
                                                        •{" "}
                                                        {pkg.allow_digital_envelope
                                                            ? "Amplop Digital"
                                                            : "Tanpa Amplop Digital"}
                                                    </li>
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.package_id && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {errors.package_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DATA MEMPELAI */}
                        {currentStep === 2 && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Langkah 2: Informasi Kedua Mempelai
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Masukkan data profil pengantin pria dan
                                        wanita beserta nama orang tua.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    {/* Mempelai Pria */}
                                    <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/40 p-5">
                                        <h4 className="font-bold text-gray-900 text-sm">
                                            Mempelai Pria (Groom)
                                        </h4>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Foto Mempelai Pria
                                            </label>
                                            <div className="mt-2 flex items-center space-x-4">
                                                {formData.groom_photo ? (
                                                    <img
                                                        src={
                                                            formData.groom_photo
                                                        }
                                                        alt="Groom"
                                                        className="h-16 w-16 rounded-full object-cover ring-2 ring-admin-primary"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                                                        <svg
                                                            className="h-8 w-8"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="1.5"
                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        handlePhotoUpload(
                                                            e,
                                                            "groom_photo",
                                                        )
                                                    }
                                                    className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-admin-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-admin-primary hover:file:bg-admin-primary/20 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Nama Lengkap &amp; Gelar Pria *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.groom_name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        groom_name:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Contoh: Raden Surya, S.T."
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                            />
                                            {errors.groom_name && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.groom_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Nama Ayah Pria
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.groom_father}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        groom_father:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Contoh: Bapak H. Bambang Sutrisno"
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Nama Ibu Pria
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.groom_mother}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        groom_mother:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Contoh: Ibu Hj. Sri Wahyuni"
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                            />
                                        </div>
                                    </div>

                                    {/* Mempelai Wanita */}
                                    <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/40 p-5">
                                        <h4 className="font-bold text-gray-900 text-sm">
                                            Mempelai Wanita (Bride)
                                        </h4>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Foto Mempelai Wanita
                                            </label>
                                            <div className="mt-2 flex items-center space-x-4">
                                                {formData.bride_photo ? (
                                                    <img
                                                        src={
                                                            formData.bride_photo
                                                        }
                                                        alt="Bride"
                                                        className="h-16 w-16 rounded-full object-cover ring-2 ring-admin-primary"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                                                        <svg
                                                            className="h-8 w-8"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="1.5"
                                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) =>
                                                        handlePhotoUpload(
                                                            e,
                                                            "bride_photo",
                                                        )
                                                    }
                                                    className="text-xs file:mr-3 file:rounded-md file:border-0 file:bg-admin-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-admin-primary hover:file:bg-admin-primary/20 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Nama Lengkap &amp; Gelar Wanita
                                                *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.bride_name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        bride_name:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Contoh: Putri Anindya, S.Ked."
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                            />
                                            {errors.bride_name && (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.bride_name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Nama Ayah Wanita
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.bride_father}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        bride_father:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Contoh: Bapak H. Slamet Riyadi"
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700">
                                                Nama Ibu Wanita
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.bride_mother}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        bride_mother:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Contoh: Ibu Hj. Endang Rahayu"
                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: RANGKAIAN ACARA */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Langkah 3: Rangkaian Acara
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Atur jadwal prosesi (Akad Nikah,
                                            Pemberkatan, Resepsi, dll).
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                events: [
                                                    ...prev.events,
                                                    {
                                                        event_type_id:
                                                            eventTypes[0]?.id ||
                                                            null,
                                                        event_name:
                                                            "Acara Tambahan",
                                                        date: "",
                                                        time_start: "10:00",
                                                        time_end: "12:00",
                                                        venue_name: "",
                                                        address: "",
                                                        latitude: null,
                                                        longitude: null,
                                                    },
                                                ],
                                            }))
                                        }
                                        className="inline-flex items-center rounded-lg bg-admin-primary/10 px-3 py-1.5 text-xs font-semibold text-admin-primary hover:bg-admin-primary/20 transition"
                                    >
                                        + Tambah Acara
                                    </button>
                                </div>

                                {errors.events && (
                                    <p className="text-xs text-red-500">
                                        {errors.events}
                                    </p>
                                )}

                                <div className="space-y-6">
                                    {formData.events.map((ev, idx) => (
                                        <div
                                            key={idx}
                                            className="relative rounded-xl border border-gray-200 p-5 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                                <h4 className="font-semibold text-gray-800 text-sm">
                                                    Acara #{idx + 1}
                                                </h4>
                                                {formData.events.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    events: prev.events.filter(
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) =>
                                                                            i !==
                                                                            idx,
                                                                    ),
                                                                }),
                                                            )
                                                        }
                                                        className="text-xs text-red-500 hover:text-red-700"
                                                    >
                                                        Hapus Acara
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700">
                                                        Kategori Acara
                                                    </label>
                                                    <select
                                                        value={
                                                            ev.event_type_id ||
                                                            ""
                                                        }
                                                        onChange={(e) => {
                                                            const newEvents = [
                                                                ...formData.events,
                                                            ];
                                                            newEvents[
                                                                idx
                                                            ].event_type_id =
                                                                e.target
                                                                    .value ||
                                                                null;
                                                            setFormData({
                                                                ...formData,
                                                                events: newEvents,
                                                            });
                                                        }}
                                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                    >
                                                        <option value="">
                                                            Pilih Kategori
                                                        </option>
                                                        {eventTypes.map(
                                                            (et) => (
                                                                <option
                                                                    key={et.id}
                                                                    value={
                                                                        et.id
                                                                    }
                                                                >
                                                                    {et.name}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700">
                                                        Nama Acara *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={ev.event_name}
                                                        onChange={(e) => {
                                                            const newEvents = [
                                                                ...formData.events,
                                                            ];
                                                            newEvents[
                                                                idx
                                                            ].event_name =
                                                                e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                events: newEvents,
                                                            });
                                                        }}
                                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                        placeholder="Contoh: Akad Nikah"
                                                    />
                                                    {errors[
                                                        `event_name_${idx}`
                                                    ] && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {
                                                                errors[
                                                                    `event_name_${idx}`
                                                                ]
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700">
                                                        Tanggal Acara *
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={ev.date}
                                                        onChange={(e) => {
                                                            const newEvents = [
                                                                ...formData.events,
                                                            ];
                                                            newEvents[
                                                                idx
                                                            ].date =
                                                                e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                events: newEvents,
                                                            });
                                                        }}
                                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                    />
                                                    {errors[
                                                        `event_date_${idx}`
                                                    ] && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {
                                                                errors[
                                                                    `event_date_${idx}`
                                                                ]
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700">
                                                        Waktu Mulai
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={ev.time_start}
                                                        onChange={(e) => {
                                                            const newEvents = [
                                                                ...formData.events,
                                                            ];
                                                            newEvents[
                                                                idx
                                                            ].time_start =
                                                                e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                events: newEvents,
                                                            });
                                                        }}
                                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700">
                                                        Waktu Selesai
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={ev.time_end}
                                                        onChange={(e) => {
                                                            const newEvents = [
                                                                ...formData.events,
                                                            ];
                                                            newEvents[
                                                                idx
                                                            ].time_end =
                                                                e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                events: newEvents,
                                                            });
                                                        }}
                                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700">
                                                        Nama Gedung / Tempat *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={ev.venue_name}
                                                        onChange={(e) => {
                                                            const newEvents = [
                                                                ...formData.events,
                                                            ];
                                                            newEvents[
                                                                idx
                                                            ].venue_name =
                                                                e.target.value;
                                                            setFormData({
                                                                ...formData,
                                                                events: newEvents,
                                                            });
                                                        }}
                                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                        placeholder="Contoh: Gedung Sasana Kriya"
                                                    />
                                                    {errors[
                                                        `event_venue_${idx}`
                                                    ] && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {
                                                                errors[
                                                                    `event_venue_${idx}`
                                                                ]
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-xs font-semibold text-gray-700">
                                                    Alamat Lengkap Lokasi
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={ev.address}
                                                    onChange={(e) => {
                                                        const newEvents = [
                                                            ...formData.events,
                                                        ];
                                                        newEvents[idx].address =
                                                            e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            events: newEvents,
                                                        });
                                                    }}
                                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                    placeholder="Jalan, nomor, kelurahan, kecamatan, kota..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: REKENING & HADIAH */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            Langkah 4: Rekening &amp; Hadiah
                                            Digital (Amplop)
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Tambahkan nomor rekening atau
                                            e-wallet untuk kemudahan tamu
                                            memberi tanda kasih.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                bank_accounts: [
                                                    ...prev.bank_accounts,
                                                    {
                                                        provider_id:
                                                            paymentProviders[0]
                                                                ?.id || null,
                                                        bank_or_wallet_name:
                                                            paymentProviders[0]
                                                                ?.name || "BCA",
                                                        account_number: "",
                                                        account_holder: "",
                                                        qr_code_url: "",
                                                    },
                                                ],
                                            }))
                                        }
                                        className="inline-flex items-center rounded-lg bg-admin-primary/10 px-3 py-1.5 text-xs font-semibold text-admin-primary hover:bg-admin-primary/20 transition"
                                    >
                                        + Tambah Rekening
                                    </button>
                                </div>

                                {formData.bank_accounts.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                                        Belum ada rekening/e-wallet ditambahkan.
                                        Klik tombol di atas jika ingin
                                        menampilkan amplop digital.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {formData.bank_accounts.map(
                                            (acc, idx) => (
                                                <div
                                                    key={idx}
                                                    className="rounded-xl border border-gray-200 p-4 shadow-sm"
                                                >
                                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                                                        <span className="text-xs font-bold text-gray-700">
                                                            Rekening #{idx + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        bank_accounts:
                                                                            prev.bank_accounts.filter(
                                                                                (
                                                                                    _,
                                                                                    i,
                                                                                ) =>
                                                                                    i !==
                                                                                    idx,
                                                                            ),
                                                                    }),
                                                                )
                                                            }
                                                            className="text-xs text-red-500 hover:text-red-700"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700">
                                                                Penyedia / Bank
                                                            </label>
                                                            <select
                                                                value={
                                                                    acc.provider_id ||
                                                                    ""
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const selected =
                                                                        paymentProviders.find(
                                                                            (
                                                                                p,
                                                                            ) =>
                                                                                p.id ===
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        );
                                                                    const newAccs =
                                                                        [
                                                                            ...formData.bank_accounts,
                                                                        ];
                                                                    newAccs[
                                                                        idx
                                                                    ].provider_id =
                                                                        e.target
                                                                            .value ||
                                                                        null;
                                                                    newAccs[
                                                                        idx
                                                                    ].bank_or_wallet_name =
                                                                        selected
                                                                            ? selected.name
                                                                            : "";
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            bank_accounts:
                                                                                newAccs,
                                                                        },
                                                                    );
                                                                }}
                                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                            >
                                                                <option value="">
                                                                    Pilih Bank /
                                                                    E-Wallet
                                                                </option>
                                                                {paymentProviders.map(
                                                                    (p) => (
                                                                        <option
                                                                            key={
                                                                                p.id
                                                                            }
                                                                            value={
                                                                                p.id
                                                                            }
                                                                        >
                                                                            {
                                                                                p.name
                                                                            }{" "}
                                                                            (
                                                                            {
                                                                                p.type
                                                                            }
                                                                            )
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700">
                                                                Nomor Rekening /
                                                                HP
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    acc.account_number
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const newAccs =
                                                                        [
                                                                            ...formData.bank_accounts,
                                                                        ];
                                                                    newAccs[
                                                                        idx
                                                                    ].account_number =
                                                                        e.target.value;
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            bank_accounts:
                                                                                newAccs,
                                                                        },
                                                                    );
                                                                }}
                                                                placeholder="Contoh: 1234567890"
                                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-700">
                                                                Atas Nama
                                                                (Pemilik)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    acc.account_holder
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const newAccs =
                                                                        [
                                                                            ...formData.bank_accounts,
                                                                        ];
                                                                    newAccs[
                                                                        idx
                                                                    ].account_holder =
                                                                        e.target.value;
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            bank_accounts:
                                                                                newAccs,
                                                                        },
                                                                    );
                                                                }}
                                                                placeholder="Contoh: Raden Surya"
                                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 5: GALERI & CERITA CINTA */}
                        {currentStep === 5 && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Langkah 5: Galeri Foto &amp; Kisah Cinta
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Unggah momen prewedding dan bagikan
                                        timeline perjalanan cinta Anda.
                                    </p>
                                </div>

                                {/* Galeri */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-800">
                                        Foto Galeri Prewedding
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Foto otomatis dikompresi ke format WebP
                                        ringan berkualitas tinggi.
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-xs font-semibold text-gray-700 transition hover:border-admin-primary hover:text-admin-primary">
                                            <span>+ Unggah Foto Baru</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleGalleryUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {formData.gallery_photos.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                            {formData.gallery_photos.map(
                                                (photo, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200"
                                                    >
                                                        <img
                                                            src={
                                                                photo.photo_url
                                                            }
                                                            alt={`Gallery ${idx}`}
                                                            className="h-full w-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setFormData(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        gallery_photos:
                                                                            prev.gallery_photos.filter(
                                                                                (
                                                                                    _,
                                                                                    i,
                                                                                ) =>
                                                                                    i !==
                                                                                    idx,
                                                                            ),
                                                                    }),
                                                                )
                                                            }
                                                            className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                                                        >
                                                            <svg
                                                                className="h-3 w-3"
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
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Kisah Cinta */}
                                <div className="border-t border-gray-100 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-bold text-gray-800">
                                            Kisah Cinta (Love Story)
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    love_stories: [
                                                        ...prev.love_stories,
                                                        {
                                                            title: "Pertama Bertemu",
                                                            date: "",
                                                            description: "",
                                                            order: prev
                                                                .love_stories
                                                                .length,
                                                        },
                                                    ],
                                                }))
                                            }
                                            className="text-xs font-semibold text-admin-primary hover:brightness-125 transition"
                                        >
                                            + Tambah Momen
                                        </button>
                                    </div>

                                    {formData.love_stories.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-500">
                                            Belum ada momen kisah cinta yang
                                            ditambahkan.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {formData.love_stories.map(
                                                (story, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="rounded-xl border border-gray-200 p-4 shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs font-bold text-gray-700">
                                                                Momen #{idx + 1}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setFormData(
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            love_stories:
                                                                                prev.love_stories.filter(
                                                                                    (
                                                                                        _,
                                                                                        i,
                                                                                    ) =>
                                                                                        i !==
                                                                                        idx,
                                                                                ),
                                                                        }),
                                                                    )
                                                                }
                                                                className="text-xs text-red-500 hover:text-red-700"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-600">
                                                                    Judul Cerita
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        story.title
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newStories =
                                                                            [
                                                                                ...formData.love_stories,
                                                                            ];
                                                                        newStories[
                                                                            idx
                                                                        ].title =
                                                                            e.target.value;
                                                                        setFormData(
                                                                            {
                                                                                ...formData,
                                                                                love_stories:
                                                                                    newStories,
                                                                            },
                                                                        );
                                                                    }}
                                                                    placeholder="Contoh: Pertama Kali Bertemu"
                                                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-gray-600">
                                                                    Tanggal /
                                                                    Tahun
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        story.date
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newStories =
                                                                            [
                                                                                ...formData.love_stories,
                                                                            ];
                                                                        newStories[
                                                                            idx
                                                                        ].date =
                                                                            e.target.value;
                                                                        setFormData(
                                                                            {
                                                                                ...formData,
                                                                                love_stories:
                                                                                    newStories,
                                                                            },
                                                                        );
                                                                    }}
                                                                    placeholder="Contoh: 14 Februari 2022"
                                                                    className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mt-3">
                                                            <label className="block text-xs font-semibold text-gray-600">
                                                                Deskripsi Kisah
                                                            </label>
                                                            <textarea
                                                                rows={2}
                                                                value={
                                                                    story.description
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const newStories =
                                                                        [
                                                                            ...formData.love_stories,
                                                                        ];
                                                                    newStories[
                                                                        idx
                                                                    ].description =
                                                                        e.target.value;
                                                                    setFormData(
                                                                        {
                                                                            ...formData,
                                                                            love_stories:
                                                                                newStories,
                                                                        },
                                                                    );
                                                                }}
                                                                placeholder="Ceritakan momen indah Anda..."
                                                                className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                                            />
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 6: MUSIK & PENGATURAN */}
                        {currentStep === 6 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Langkah 6: Pengaturan Tautan &amp; Media
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Tentukan link custom undangan Anda dan
                                        link pendukung lainnya.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Kustom Slug Undangan (URL) *
                                        </label>
                                        <div className="mt-1 flex rounded-lg shadow-sm">
                                            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                                {typeof window !== "undefined" ? window.location.host : "app"}/
                                            </span>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        slug: e.target.value
                                                            .toLowerCase()
                                                            .replace(
                                                                /[^a-z0-9-]/g,
                                                                "-",
                                                            ),
                                                    })
                                                }
                                                placeholder="surya-putri"
                                                className="block w-full flex-1 rounded-none rounded-r-lg border-gray-300 text-sm focus:border-admin-primary focus:ring-admin-primary"
                                            />
                                        </div>
                                        {errors.slug && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Bahasa Undangan
                                        </label>
                                        <select
                                            value={formData.language}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    language: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                        >
                                            <option value="id">
                                                Bahasa Indonesia
                                            </option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700">
                                            Link Live Streaming (YouTube / Zoom)
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.streaming_url}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    streaming_url:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="https://youtube.com/live/..."
                                            className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700">
                                            URL Background Musik (MP3)
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.music_url}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    music_url: e.target.value,
                                                })
                                            }
                                            placeholder="https://domain.com/audio.mp3"
                                            className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-admin-primary focus:ring-admin-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                            {currentStep > 1 ? (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                                >
                                    Kembali
                                </button>
                            ) : (
                                <div />
                            )}

                            {currentStep < steps.length ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="rounded-lg bg-admin-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                                >
                                    Lanjut
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={handleSubmit}
                                    className="inline-flex items-center rounded-lg bg-admin-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Menyimpan..."
                                        : "Simpan Undangan"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
