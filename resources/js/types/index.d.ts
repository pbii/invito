export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role?: string;
    is_verified?: boolean;
    is_active?: boolean;
    email_verified_at?: string | null;
}

export interface Package {
    id: string;
    name: string;
    description?: string;
    badge?: string;
    price: number;
    duration_days: number;
    max_guests: number;
    max_invitations?: number;
    max_photos: number;
    max_music: number;
    allow_custom_music: boolean;
    allow_custom_slug: boolean;
    allow_gift_info: boolean;
    allow_love_story: boolean;
    allow_countdown: boolean;
    allow_streaming: boolean;
    allow_multilingual: boolean;
    allow_analytics: boolean;
    allow_digital_envelope: boolean;
    remove_watermark: boolean;
    allow_guest_import: boolean;
    allow_wa_blast: boolean;
}

export interface TemplateCategory {
    id: string;
    name: string;
    slug: string;
}

export interface Template {
    id: string;
    name: string;
    slug: string;
    description?: string;
    thumbnail_url: string;
    component_name: string;
    categories?: TemplateCategory[];
}

export interface EventType {
    id: string;
    name: string;
    slug: string;
    description?: string;
    default_icon?: string;
}

export interface PaymentProvider {
    id: string;
    name: string;
    code: string;
    type: 'BANK' | 'EWALLET' | 'QRIS';
    logo_url?: string;
}

export interface InvitationSection {
    id: string;
    invitation_id: string;
    section_key: string;
    custom_title?: string | null;
    is_enabled: boolean;
    sort_order: number;
}

export interface Event {
    id?: string;
    invitation_id?: string;
    event_type_id: string | null;
    event_name: string;
    date: string;
    time_start: string;
    time_end: string;
    venue_name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
}

export interface InvitationBankAccount {
    id?: string;
    invitation_id?: string;
    provider_id: string | null;
    bank_or_wallet_name: string;
    account_number: string;
    account_holder: string;
    qr_code_url?: string;
}

export interface LoveStory {
    id?: string;
    invitation_id?: string;
    title: string;
    description: string;
    date: string;
    order?: number;
}

export interface GalleryPhoto {
    id?: string;
    invitation_id?: string;
    photo_url: string;
    caption?: string;
    order?: number;
}

export interface Invitation {
    id: string;
    user_id: string;
    slug: string;
    groom_name: string;
    groom_photo?: string | null;
    groom_father?: string | null;
    groom_mother?: string | null;
    bride_name: string;
    bride_photo?: string | null;
    bride_father?: string | null;
    bride_mother?: string | null;
    template_id: string;
    package_id: string;
    music_url?: string | null;
    streaming_url?: string | null;
    language: string;
    is_published: boolean;
    qris_image_url?: string | null;
    expires_at?: string | null;
    is_expired?: boolean;
    created_at?: string;
    updated_at?: string;
    package?: Package;
    template?: Template;
    sections?: InvitationSection[];
    events?: Event[];
    bank_accounts?: InvitationBankAccount[];
    love_stories?: LoveStory[];
    gallery_photos?: GalleryPhoto[];
    guests_count?: number;
    rsvps_count?: number;
}

export interface Guest {
    id: string;
    invitation_id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    category?: string | null;
    max_pax?: number;
    personal_link_token?: string;
    is_sent: boolean;
    created_at?: string;
    events?: Event[];
    rsvp?: {
        status?: string;
        confirmation_status?: string;
        pax: number;
    } | null;
}

export interface Wish {
    id: string;
    invitation_id: string;
    name: string;
    message: string;
    is_visible: boolean;
    created_at?: string;
}

export interface AdminThemePresetData {
    id: string;
    name: string;
    slug: string;
    primary_color: string;
    secondary_color: string;
    background_color: string;
    surface_color: string;
    sidebar_color: string;
    border_color: string;
    is_default: boolean;
    is_system: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface AdminThemeConfig {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    sidebar: string;
    border: string;
}

export interface BrandingConfig {
    app_name: string;
    app_tagline: string;
    app_logo_url: string;
    app_favicon_url: string;
    watermark_text: string;
    watermark_link: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    adminTheme?: AdminThemeConfig;
    branding?: BrandingConfig;
    flash?: {
        success?: string;
        error?: string;
    };
};
