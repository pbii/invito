import React from 'react';

interface ColorPickerInputProps {
    label: string;
    description?: string;
    value: string;
    onChange: (hex: string) => void;
    defaultValue?: string;
}

export default function ColorPickerInput({
    label,
    description,
    value,
    onChange,
    defaultValue,
}: ColorPickerInputProps) {
    const safeHex = (value && value.startsWith('#') ? value : `#${value || '000000'}`).slice(0, 7);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.trim();
        if (!val.startsWith('#') && val.length > 0) {
            val = `#${val}`;
        }
        onChange(val.toUpperCase());
    };

    const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value.toUpperCase());
    };

    const isValidHex = /^#[0-9A-Fa-f]{6}$/.test(safeHex);

    return (
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors">
            <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">{label}</label>
                {defaultValue && defaultValue.toUpperCase() !== safeHex.toUpperCase() && (
                    <button
                        type="button"
                        onClick={() => onChange(defaultValue.toUpperCase())}
                        className="text-[10px] font-mono text-slate-400 hover:text-admin-primary transition"
                        title={`Reset ke default (${defaultValue})`}
                    >
                        Reset
                    </button>
                )}
            </div>

            {description && (
                <p className="text-[11px] text-slate-400 leading-tight">{description}</p>
            )}

            <div className="flex items-center gap-2 mt-1">
                {/* Visual Color Swatch Trigger */}
                <div className="relative shrink-0 w-9 h-9 rounded-lg border border-white/20 shadow-inner overflow-hidden cursor-pointer group">
                    <div
                        className="w-full h-full"
                        style={{ backgroundColor: isValidHex ? safeHex : '#000000' }}
                    />
                    <input
                        type="color"
                        value={isValidHex ? safeHex : '#000000'}
                        onChange={handlePickerChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        aria-label={`Pilih warna ${label}`}
                    />
                </div>

                {/* Hex Text Field */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        maxLength={7}
                        value={value || ''}
                        onChange={handleTextChange}
                        placeholder="#000000"
                        className="w-full rounded-lg border border-white/[0.1] bg-black/40 px-3 py-1.5 font-mono text-xs text-white uppercase placeholder-slate-500 focus:border-admin-primary focus:ring-1 focus:ring-admin-primary"
                    />
                </div>
            </div>
        </div>
    );
}
