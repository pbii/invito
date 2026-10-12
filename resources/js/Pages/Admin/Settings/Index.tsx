import ColorPickerInput from '@/Components/ColorPickerInput';
import AdminLayout from '@/Layouts/AdminLayout';
import { AdminThemePresetData } from '@/types';
import { compressImage, fileToBase64 } from '@/Utils/imageCompression';
import { Head, router, useForm } from '@inertiajs/react';
import React, { useRef, useState } from 'react';

interface Props {
    settings: Record<string, string>;
    themePresets?: AdminThemePresetData[];
}

export default function AdminSettingsIndex({ settings, themePresets = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'theme' | 'branding' | 'media' | 'limits' | 'security'>('theme');

    const defaultThemeTokens: Record<string, string> = {
        'theme.admin_primary': '#6366F1',
        'theme.admin_secondary': '#F43F5E',
        'theme.admin_background': '#080B12',
        'theme.admin_surface': '#0E131F',
        'theme.admin_sidebar': '#0B0F19',
        'theme.admin_border': '#1E1B4B',
    };

    const initialFormData: Record<string, string> = {
        ...defaultThemeTokens,
        ...settings,
    };

    const { data, setData, put, processing, wasSuccessful } = useForm<Record<string, string>>(initialFormData);

    // Preset Modal States (Create & Edit)
    const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<AdminThemePresetData | null>(null);
    const [presetFormData, setPresetFormData] = useState({
        name: '',
        primary_color: '#6366F1',
        secondary_color: '#F43F5E',
        background_color: '#080B12',
        surface_color: '#0E131F',
        sidebar_color: '#0B0F19',
        border_color: '#1E1B4B',
    });
    const [presetProcessing, setPresetProcessing] = useState(false);
    const [isLogoUploading, setIsLogoUploading] = useState(false);
    const logoFileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (key: string, val: string) => {
        setData(key, val);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLogoUploading(true);
        try {
            const compressed = await compressImage(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
            });
            const base64 = await fileToBase64(compressed);
            handleChange('general.app_logo_url', base64);
        } catch (error) {
            console.error('Failed to compress/read logo', error);
        } finally {
            setIsLogoUploading(false);
            if (logoFileInputRef.current) {
                logoFileInputRef.current.value = '';
            }
        }
    };

    const handleClearLogo = () => {
        handleChange('general.app_logo_url', '');
        if (logoFileInputRef.current) {
            logoFileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.settings.update'));
    };

    // Live Theme Token Values
    const curPrimary = data['theme.admin_primary'] || '#6366F1';
    const curSecondary = data['theme.admin_secondary'] || '#F43F5E';
    const curBackground = data['theme.admin_background'] || '#080B12';
    const curSurface = data['theme.admin_surface'] || '#0E131F';
    const curSidebar = data['theme.admin_sidebar'] || '#0B0F19';
    const curBorder = data['theme.admin_border'] || '#1E1B4B';

    // Apply Preset into Form immediately
    const handleSelectPreset = (preset: AdminThemePresetData) => {
        setData((prev) => ({
            ...prev,
            'theme.admin_primary': preset.primary_color,
            'theme.admin_secondary': preset.secondary_color,
            'theme.admin_background': preset.background_color,
            'theme.admin_surface': preset.surface_color,
            'theme.admin_sidebar': preset.sidebar_color,
            'theme.admin_border': preset.border_color,
        }));
    };

    // Apply Preset directly into Database via Backend
    const handleApplyPresetDirect = (preset: AdminThemePresetData) => {
        if (confirm(`Terapkan preset tema "${preset.name}" langsung ke seluruh dashboard admin?`)) {
            router.post(route('admin.theme-presets.apply', preset.id), {}, {
                preserveScroll: true,
                onSuccess: () => {
                    handleSelectPreset(preset);
                },
            });
        }
    };

    // Open Modal for New Preset
    const handleOpenCreatePreset = () => {
        setEditingPreset(null);
        setPresetFormData({
            name: '',
            primary_color: curPrimary,
            secondary_color: curSecondary,
            background_color: curBackground,
            surface_color: curSurface,
            sidebar_color: curSidebar,
            border_color: curBorder,
        });
        setIsPresetModalOpen(true);
    };

    // Open Modal for Edit Existing Preset
    const handleOpenEditPreset = (preset: AdminThemePresetData) => {
        setEditingPreset(preset);
        setPresetFormData({
            name: preset.name,
            primary_color: preset.primary_color,
            secondary_color: preset.secondary_color,
            background_color: preset.background_color,
            surface_color: preset.surface_color,
            sidebar_color: preset.sidebar_color,
            border_color: preset.border_color,
        });
        setIsPresetModalOpen(true);
    };

    // Delete Preset
    const handleDeletePreset = (preset: AdminThemePresetData) => {
        if (confirm(`Yakin ingin menghapus preset tema "${preset.name}"?`)) {
            router.delete(route('admin.theme-presets.destroy', preset.id), {
                preserveScroll: true,
            });
        }
    };

    // Submit Preset Modal (Store / Update)
    const handleSavePreset = (e: React.FormEvent) => {
        e.preventDefault();
        setPresetProcessing(true);

        if (editingPreset) {
            router.put(route('admin.theme-presets.update', editingPreset.id), presetFormData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsPresetModalOpen(false);
                    setPresetProcessing(false);
                },
                onError: () => setPresetProcessing(false),
            });
        } else {
            router.post(route('admin.theme-presets.store'), presetFormData, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsPresetModalOpen(false);
                    setPresetProcessing(false);
                },
                onError: () => setPresetProcessing(false),
            });
        }
    };

    return (
        <AdminLayout title="Pengaturan Global">
            <Head title="Pengaturan Global - Admin" />

            <div className="space-y-6 max-w-5xl">
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Konfigurasi Operasional & Tampilan Platform</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">Kelola palet warna tema dashboard admin, identitas white-label, kuota upload, dan keamanan.</p>
                </div>

                {wasSuccessful && (
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-400 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Pengaturan platform berhasil diperbarui dan disimpan ke sistem!
                    </div>
                )}

                {/* Tabs Header */}
                <div className="flex border-b border-white/[0.08] gap-6 text-xs font-mono overflow-x-auto pb-1">
                    {[
                        { id: 'theme', label: 'Tema & Palet Admin' },
                        { id: 'branding', label: 'White-label & Branding' },
                        { id: 'media', label: 'Batas Upload Media' },
                        { id: 'limits', label: 'Buku Tamu & Masa Aktif' },
                        { id: 'security', label: 'Keamanan & Proteksi' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`pb-3 border-b-2 whitespace-nowrap transition font-medium ${
                                activeTab === tab.id
                                    ? 'border-admin-primary text-white font-bold'
                                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* TAB: THEME & PALETTE */}
                    {activeTab === 'theme' && (
                        <div className="space-y-6">
                            {/* Color Controls + Live Preview Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Left: 6 Color Token Inputs */}
                                <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#10131B]/90 backdrop-blur-md p-5 shadow-xl space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Palet Warna Aktif</h3>
                                            <p className="text-[11px] text-zinc-400 mt-0.5">Ubah token warna dashboard secara real-time via Color Picker atau kode Hex.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleOpenCreatePreset}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/[0.08] transition"
                                        >
                                            <svg className="w-3.5 h-3.5 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Simpan Jadi Preset
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <ColorPickerInput
                                            label="Warna Primer (Primary)"
                                            description="Tombol aksi utama, menu aktif, badge"
                                            value={curPrimary}
                                            onChange={(hex) => handleChange('theme.admin_primary', hex)}
                                            defaultValue="#6366F1"
                                        />

                                        <ColorPickerInput
                                            label="Warna Sekunder (Secondary)"
                                            description="Aksen brand, ikon khusus, glow mesh"
                                            value={curSecondary}
                                            onChange={(hex) => handleChange('theme.admin_secondary', hex)}
                                            defaultValue="#F43F5E"
                                        />

                                        <ColorPickerInput
                                            label="Latar Belakang (Background)"
                                            description="Kanvas utama dashboard & topbar"
                                            value={curBackground}
                                            onChange={(hex) => handleChange('theme.admin_background', hex)}
                                            defaultValue="#080B12"
                                        />

                                        <ColorPickerInput
                                            label="Permukaan (Surface / Card)"
                                            description="Kartu metrik, kontainer tabel, modal"
                                            value={curSurface}
                                            onChange={(hex) => handleChange('theme.admin_surface', hex)}
                                            defaultValue="#0E131F"
                                        />

                                        <ColorPickerInput
                                            label="Navigasi (Sidebar)"
                                            description="Latar panel menu navigasi samping"
                                            value={curSidebar}
                                            onChange={(hex) => handleChange('theme.admin_sidebar', hex)}
                                            defaultValue="#0B0F19"
                                        />

                                        <ColorPickerInput
                                            label="Garis Pembatas (Border)"
                                            description="Garis batas kartu, tabel, dan header"
                                            value={curBorder}
                                            onChange={(hex) => handleChange('theme.admin_border', hex)}
                                            defaultValue="#1E1B4B"
                                        />
                                    </div>

                                    {/* Logo Platform Quick Customizer in Theme Tab */}
                                    <div className="pt-4 border-t border-white/[0.06] space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-xs font-semibold text-slate-200">Logo Website & Brand Dashboard</label>
                                                <p className="text-[11px] text-zinc-400 mt-0.5">Unggah gambar logo (PNG, SVG, WebP) atau masukkan tautan URL gambar.</p>
                                            </div>
                                            {data['general.app_logo_url'] && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearLogo}
                                                    className="text-[11px] font-mono text-rose-400 hover:text-rose-300 transition"
                                                >
                                                    Hapus Logo
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                            {/* Preview Box */}
                                            <div className="relative shrink-0 w-16 h-16 rounded-xl border border-white/15 bg-black/40 flex items-center justify-center p-1.5 overflow-hidden shadow-inner group">
                                                {data['general.app_logo_url'] ? (
                                                    <img
                                                        src={data['general.app_logo_url']}
                                                        alt="Logo Website"
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-zinc-600">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-[8px] font-mono mt-0.5">POLOS</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Controls: Upload & URL */}
                                            <div className="flex-1 w-full space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        ref={logoFileInputRef}
                                                        onChange={handleLogoUpload}
                                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                                        className="hidden"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => logoFileInputRef.current?.click()}
                                                        disabled={isLogoUploading}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50"
                                                    >
                                                        <svg className="w-3.5 h-3.5 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                        </svg>
                                                        {isLogoUploading ? 'Memproses...' : 'Pilih File Gambar'}
                                                    </button>
                                                    <span className="text-[10px] text-zinc-500">Maks. 500KB (Otomatis WebP)</span>
                                                </div>

                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={data['general.app_logo_url'] || ''}
                                                        onChange={(e) => handleChange('general.app_logo_url', e.target.value)}
                                                        placeholder="Atau tempel URL gambar (https://... / base64)"
                                                        className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-1.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Real-time Live Interactive Preview */}
                                <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#10131B]/90 backdrop-blur-md p-5 shadow-xl flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-white">Live Real-time Preview</h3>
                                                <p className="text-[11px] text-zinc-400 mt-0.5">Simulasi miniatur antarmuka dashboard admin</p>
                                            </div>
                                            <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: curPrimary }} />
                                        </div>

                                        {/* Mockup Canvas */}
                                        <div
                                            className="rounded-xl border p-3.5 transition-all shadow-inner relative overflow-hidden space-y-3"
                                            style={{
                                                backgroundColor: curBackground,
                                                borderColor: curBorder,
                                            }}
                                        >
                                            {/* Glow Radial Mockup */}
                                            <div
                                                className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-40 pointer-events-none"
                                                style={{ backgroundColor: curSecondary }}
                                            />
                                            <div
                                                className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full blur-2xl opacity-40 pointer-events-none"
                                                style={{ backgroundColor: curPrimary }}
                                            />

                                            {/* Mini Topbar */}
                                            <div
                                                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[10px] relative z-10"
                                                style={{ backgroundColor: curSidebar, borderColor: curBorder }}
                                            >
                                                <div className="flex items-center gap-1.5 font-bold text-white min-w-0">
                                                    {data['general.app_logo_url'] ? (
                                                        <img
                                                            src={data['general.app_logo_url']}
                                                            alt="Logo"
                                                            className="w-4 h-4 object-contain rounded-xs shrink-0"
                                                        />
                                                    ) : (
                                                        <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: curPrimary }} />
                                                    )}
                                                    <span className="truncate">{data['general.app_name'] || 'WedInvite'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span
                                                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white"
                                                        style={{ backgroundColor: curPrimary }}
                                                    >
                                                        ADMIN
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mini Content Grid */}
                                            <div className="grid grid-cols-12 gap-2 relative z-10">
                                                {/* Mini Sidebar */}
                                                <div
                                                    className="col-span-4 rounded-lg border p-2 space-y-1 text-[9px]"
                                                    style={{ backgroundColor: curSidebar, borderColor: curBorder }}
                                                >
                                                    <div
                                                        className="px-1.5 py-1 rounded font-semibold text-white flex items-center gap-1 border"
                                                        style={{
                                                            backgroundColor: `${curPrimary}25`,
                                                            borderColor: curPrimary,
                                                            color: curPrimary,
                                                        }}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: curPrimary }} />
                                                        Dashboard
                                                    </div>
                                                    <div className="px-1.5 py-1 text-slate-400">Pengguna</div>
                                                    <div className="px-1.5 py-1 text-slate-400">Undangan</div>
                                                </div>

                                                {/* Mini Main Area */}
                                                <div className="col-span-8 space-y-2">
                                                    {/* Mini Stat Card */}
                                                    <div
                                                        className="rounded-lg border p-2.5"
                                                        style={{ backgroundColor: curSurface, borderColor: curBorder }}
                                                    >
                                                        <div className="flex justify-between items-center text-[9px] text-slate-400">
                                                            <span>Statistik Tamu</span>
                                                            <span
                                                                className="px-1 py-0.2 rounded font-mono text-[8px] font-bold"
                                                                style={{ backgroundColor: `${curSecondary}20`, color: curSecondary }}
                                                            >
                                                                LIVE
                                                            </span>
                                                        </div>
                                                        <div className="text-sm font-bold text-white mt-1">1,240 <span className="text-[9px] font-normal text-slate-400">tamu</span></div>
                                                    </div>

                                                    {/* Mini Action Buttons */}
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            type="button"
                                                            className="flex-1 py-1 rounded text-[9px] font-bold text-white shadow-xs transition"
                                                            style={{ backgroundColor: curPrimary }}
                                                        >
                                                            Aksi Primer
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="flex-1 py-1 rounded text-[9px] font-bold text-white shadow-xs transition border"
                                                            style={{
                                                                backgroundColor: `${curSecondary}25`,
                                                                borderColor: `${curSecondary}50`,
                                                                color: curSecondary,
                                                            }}
                                                        >
                                                            Aksen
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Palette Preview Swatches Strip */}
                                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                                        <span className="text-zinc-400 font-mono text-[10px]">6 Token Aktif</span>
                                        <div className="flex items-center gap-1.5">
                                            {[curPrimary, curSecondary, curBackground, curSurface, curSidebar, curBorder].map((c, i) => (
                                                <div
                                                    key={i}
                                                    className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                                                    style={{ backgroundColor: c }}
                                                    title={c}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preset Manager Card */}
                            <div className="rounded-2xl border border-white/[0.08] bg-[#10131B]/90 backdrop-blur-md p-5 shadow-xl space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Preset Tema Siap Pakai (Database)</h3>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">Pilih tema siap pakai, ubah nilainya, atau buat preset tema kustom baru.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleOpenCreatePreset}
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-admin-primary px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-admin-primary/20 hover:brightness-110 transition shrink-0"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        + Tambah Preset Baru
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {themePresets.map((preset) => {
                                        const isMatchingActive =
                                            preset.primary_color.toUpperCase() === curPrimary.toUpperCase() &&
                                            preset.background_color.toUpperCase() === curBackground.toUpperCase() &&
                                            preset.surface_color.toUpperCase() === curSurface.toUpperCase();

                                        return (
                                            <div
                                                key={preset.id}
                                                className={`relative rounded-xl border p-3.5 transition-all flex flex-col justify-between gap-3 ${
                                                    isMatchingActive
                                                        ? 'border-admin-primary bg-admin-primary/5 ring-1 ring-admin-primary'
                                                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                                                }`}
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="text-xs font-bold text-white truncate">{preset.name}</span>
                                                            {preset.is_default && (
                                                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                                    DEFAULT
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditPreset(preset)}
                                                                className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition"
                                                                title="Edit Preset"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeletePreset(preset)}
                                                                className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 transition"
                                                                title="Hapus Preset"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Color Bar Preview */}
                                                    <div className="h-4 rounded-md overflow-hidden flex border border-white/10 shadow-inner">
                                                        <div style={{ backgroundColor: preset.primary_color }} className="flex-1" title={`Primary: ${preset.primary_color}`} />
                                                        <div style={{ backgroundColor: preset.secondary_color }} className="flex-1" title={`Secondary: ${preset.secondary_color}`} />
                                                        <div style={{ backgroundColor: preset.background_color }} className="flex-1" title={`Background: ${preset.background_color}`} />
                                                        <div style={{ backgroundColor: preset.surface_color }} className="flex-1" title={`Surface: ${preset.surface_color}`} />
                                                        <div style={{ backgroundColor: preset.sidebar_color }} className="flex-1" title={`Sidebar: ${preset.sidebar_color}`} />
                                                        <div style={{ backgroundColor: preset.border_color }} className="flex-1" title={`Border: ${preset.border_color}`} />
                                                    </div>
                                                </div>

                                                <div className="flex gap-1.5 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSelectPreset(preset)}
                                                        className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] py-1.5 text-[11px] font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
                                                    >
                                                        Muat ke Form
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApplyPresetDirect(preset)}
                                                        className="flex-1 rounded-lg bg-white/10 py-1.5 text-[11px] font-bold text-white hover:bg-white/20 transition"
                                                    >
                                                        Terapkan Langsung
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: BRANDING */}
                    {activeTab === 'branding' && (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#10131B]/90 backdrop-blur-md p-6 shadow-xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Nama Aplikasi Platform</label>
                                    <input
                                        type="text"
                                        value={data['general.app_name'] || ''}
                                        onChange={(e) => handleChange('general.app_name', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Tagline Brand</label>
                                    <input
                                        type="text"
                                        value={data['general.app_tagline'] || ''}
                                        onChange={(e) => handleChange('general.app_tagline', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">URL Logo Aplikasi</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={data['general.app_logo_url'] || ''}
                                            onChange={(e) => handleChange('general.app_logo_url', e.target.value)}
                                            placeholder="URL gambar logo"
                                            className="flex-1 rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                        />
                                        {data['general.app_logo_url'] && (
                                            <button
                                                type="button"
                                                onClick={handleClearLogo}
                                                className="px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Teks Watermark Undangan</label>
                                    <input
                                        type="text"
                                        value={data['general.watermark_text'] || ''}
                                        onChange={(e) => handleChange('general.watermark_text', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: MEDIA */}
                    {activeTab === 'media' && (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#10131B]/90 backdrop-blur-md p-6 shadow-xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Maks Ukuran Foto Galeri (MB)</label>
                                    <input
                                        type="number"
                                        value={data['upload.max_photo_size_mb'] || ''}
                                        onChange={(e) => handleChange('upload.max_photo_size_mb', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Maks Ukuran Audio Musik (MB)</label>
                                    <input
                                        type="number"
                                        value={data['upload.max_music_size_mb'] || ''}
                                        onChange={(e) => handleChange('upload.max_music_size_mb', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: LIMITS */}
                    {activeTab === 'limits' && (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#10131B]/90 backdrop-blur-md p-6 shadow-xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Batas Maks Impor Tamu (Baris Excel/CSV)</label>
                                    <input
                                        type="number"
                                        value={data['guests.max_import_rows'] || ''}
                                        onChange={(e) => handleChange('guests.max_import_rows', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Masa Aktif Standar Undangan (Hari)</label>
                                    <input
                                        type="number"
                                        value={data['invitation.default_active_days'] || ''}
                                        onChange={(e) => handleChange('invitation.default_active_days', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: SECURITY */}
                    {activeTab === 'security' && (
                        <div className="rounded-2xl border border-white/[0.08] bg-[#10131B]/90 backdrop-blur-md p-6 shadow-xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Rate Limit RSVP per IP (Menit)</label>
                                    <input
                                        type="number"
                                        value={data['security.rate_limit_rsvp_per_ip_minutes'] || ''}
                                        onChange={(e) => handleChange('security.rate_limit_rsvp_per_ip_minutes', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-zinc-300 mb-1">Status Cloudflare Turnstile Bot Protection</label>
                                    <select
                                        value={data['security.turnstile_enabled'] || 'true'}
                                        onChange={(e) => handleChange('security.turnstile_enabled', e.target.value)}
                                        className="w-full rounded-xl border border-white/[0.1] bg-zinc-900/80 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                    >
                                        <option value="true">Aktif (Enabled)</option>
                                        <option value="false">Nonaktif (Disabled)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Global Submit Button */}
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-admin-primary px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-admin-primary/25 hover:brightness-110 disabled:opacity-50 transition active:scale-95"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
                        </button>
                    </div>
                </form>
            </div>

            {/* PRESET CREATE & EDIT MODAL */}
            {isPresetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-xl rounded-2xl bg-[#0E131F] p-6 shadow-2xl border border-white/10 text-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="text-base font-bold text-white">
                                {editingPreset ? `Edit Preset: ${editingPreset.name}` : 'Buat Preset Tema Baru'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsPresetModalOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSavePreset} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nama Preset Tema</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Midnight Velvet"
                                    value={presetFormData.name}
                                    onChange={(e) => setPresetFormData((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:ring-2 focus:ring-admin-primary"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <ColorPickerInput
                                    label="Primary Color"
                                    value={presetFormData.primary_color}
                                    onChange={(hex) => setPresetFormData((p) => ({ ...p, primary_color: hex }))}
                                />
                                <ColorPickerInput
                                    label="Secondary Color"
                                    value={presetFormData.secondary_color}
                                    onChange={(hex) => setPresetFormData((p) => ({ ...p, secondary_color: hex }))}
                                />
                                <ColorPickerInput
                                    label="Background Color"
                                    value={presetFormData.background_color}
                                    onChange={(hex) => setPresetFormData((p) => ({ ...p, background_color: hex }))}
                                />
                                <ColorPickerInput
                                    label="Surface Color"
                                    value={presetFormData.surface_color}
                                    onChange={(hex) => setPresetFormData((p) => ({ ...p, surface_color: hex }))}
                                />
                                <ColorPickerInput
                                    label="Sidebar Color"
                                    value={presetFormData.sidebar_color}
                                    onChange={(hex) => setPresetFormData((p) => ({ ...p, sidebar_color: hex }))}
                                />
                                <ColorPickerInput
                                    label="Border Color"
                                    value={presetFormData.border_color}
                                    onChange={(hex) => setPresetFormData((p) => ({ ...p, border_color: hex }))}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsPresetModalOpen(false)}
                                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={presetProcessing}
                                    className="rounded-xl bg-admin-primary px-5 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50 transition shadow-md shadow-admin-primary/25"
                                >
                                    {presetProcessing ? 'Menyimpan...' : (editingPreset ? 'Perbarui Preset' : 'Simpan Preset Baru')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
