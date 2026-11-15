'use client';

import React, {
    forwardRef,
    memo,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { pdf } from '@react-pdf/renderer';
import { toJpeg, toPng } from 'html-to-image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
    Activity,
    AlertTriangle,
    ArrowUpRight,
    BadgeCheck,
    Brain,
    Calendar,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    ExternalLink,
    FileText,
    GraduationCap,
    Image as ImageIcon,
    Info,
    LayoutTemplate,
    Link2,
    LoaderCircle,
    Megaphone,
    Palette,
    RefreshCcw,
    Share,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Sun,
    Upload,
    Wand2,
    Zap,
    Droplets,
    Box,
    type LucideIcon,
} from 'lucide-react';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';
import analytics from '@/src/lib/analytics';
import type {
    NexusStudioCampaignHandoffActionResult,
    NexusStudioPersistedCampaignHandoff,
    NexusStudioServerActionStatus,
} from '@/src/actions/nexusStudioActionCore';
import {
    COPY_LIBRARY,
    type CampaignFormat,
    type CampaignGoal,
    type CampaignVoice,
    type Modality,
    usePartnerStore,
} from '../../hooks/usePartnerStore';
import { disclaimers } from '../../content/disclaimers';
import { validateCompliance } from '../../utils/compliance';
import {
    A4PosterTemplate,
    SocialSquareTemplate,
    SocialStoryTemplate,
    } from './PDFTemplates';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';
import { PartnerLayout } from './PartnerLayout';

type PersistedCampaignHandoffsStatus =
    | 'loaded'
    | 'database_error'
    | 'database_not_configured'
    | 'auth_context_missing'
    | 'role_not_allowed';
type NexusStudioCampaignHandoffActionRunner = (
    prevState: NexusStudioCampaignHandoffActionResult,
    formData: FormData
) => Promise<NexusStudioCampaignHandoffActionResult>;

type ChecklistItem = {
    label: string;
    detail: string;
    done: boolean;
};

type StudioHandoffReadinessBridge = {
    formatLabel: string;
    campaignGoal: CampaignGoal;
    modality: Modality;
    checklistTotal: number;
    checklistComplete: number;
    checklistIncomplete: number;
    assetFormatCount: number;
    qrHandoffReady: boolean;
    logoIncluded: boolean;
    persistedHandoffCount: number;
    handoffReadinessStatus: string;
};

type FormatOption = {
    id: CampaignFormat;
    label: string;
    description: string;
    icon: LucideIcon;
    width: number;
    height: number;
};

const OUTPUT_FORMATS: FormatOption[] = [
    {
        id: 'social-square',
        label: 'Feed post',
        description: '1080 x 1080 social square for feed placements.',
        icon: ImageIcon,
        width: 1080,
        height: 1080,
    },
    {
        id: 'social-story',
        label: 'Story',
        description: '1080 x 1920 story asset for vertical placements.',
        icon: Smartphone,
        width: 1080,
        height: 1920,
    },
    {
        id: 'print-poster',
        label: 'A4 poster',
        description: 'A4-ready layout for counters, lobby displays, and print handoff.',
        icon: FileText,
        width: 900,
        height: 1273,
    },
];

const VISUAL_THEMES: {
    id: 'modern' | 'luxury' | 'bold';
    label: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        id: 'modern',
        label: 'Modern',
        description: 'Clean, bright, and direct.',
        icon: LayoutTemplate,
    },
    {
        id: 'luxury',
        label: 'Luxury',
        description: 'Warmer editorial styling with softer contrast.',
        icon: Sparkles,
    },
    {
        id: 'bold',
        label: 'Bold',
        description: 'Darker contrast with stronger emphasis.',
        icon: Box,
    },
];

const GOAL_OPTIONS: {
    id: CampaignGoal;
    label: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        id: 'promotion',
        label: 'Promotion',
        description: 'Invite people into a booking conversation or clinic offer.',
        icon: Megaphone,
    },
    {
        id: 'education',
        label: 'Education',
        description: 'Explain a modality with calmer, trust-building copy.',
        icon: GraduationCap,
    },
    {
        id: 'launch',
        label: 'New device',
        description: 'Announce new equipment, availability, or a rollout update.',
        icon: Share,
    },
    {
        id: 'event',
        label: 'Event',
        description: 'Promote demos, open days, or workshop attendance.',
        icon: Calendar,
    },
];

const MODALITY_OPTIONS: {
    id: Modality;
    label: string;
    description: string;
    icon: LucideIcon;
}[] = [
    {
        id: 'HBOT',
        label: 'Hyperbaric',
        description: 'Guided oxygen session messaging.',
        icon: Activity,
    },
    {
        id: 'PEMF',
        label: 'PEMF',
        description: 'Comfort and recovery workflow messaging.',
        icon: Zap,
    },
    {
        id: 'RLT',
        label: 'Red light',
        description: 'Light-led wellness routine messaging.',
        icon: Sun,
    },
    {
        id: 'Hydrogen',
        label: 'Hydrogen',
        description: 'Hydrogen wellness session messaging.',
        icon: Droplets,
    },
];

const VOICE_OPTIONS: {
    id: CampaignVoice;
    label: string;
    description: string;
}[] = [
    {
        id: 'balanced',
        label: 'Balanced',
        description: 'Premium, clear, and appropriate for most clinic campaigns.',
    },
    {
        id: 'clinical',
        label: 'Clinical',
        description: 'More structured, educational, and workflow-focused wording.',
    },
    {
        id: 'luxury',
        label: 'Luxury',
        description: 'Softer premium language for spa-adjacent experiences.',
    },
];

const LAYOUT_OPTIONS: {
    id: 0 | 1 | 2;
    label: string;
    description: string;
}[] = [
    {
        id: 0,
        label: 'Overlay',
        description: 'Copy floats on top of the hero image or gradient.',
    },
    {
        id: 1,
        label: 'Split',
        description: 'Hero visual and copy sit in separate zones.',
    },
    {
        id: 2,
        label: 'Frame',
        description: 'A framed card style for calmer print layouts.',
    },
];

const STOCK_IMAGES: {
    id: string;
    url: string;
    label: string;
    modality: Modality | 'ALL';
}[] = [
    {
        id: 'hbot-1',
        url: '/images/chambers/hbot-redesign/hero-chamber.png',
        label: 'Hyperbaric room',
        modality: 'HBOT',
    },
    {
        id: 'hbot-2',
        url: '/images/blog/card-hbot.jpg',
        label: 'Premium oxygen suite',
        modality: 'HBOT',
    },
    {
        id: 'pemf-1',
        url: '/images/blog/card-pemf.jpg',
        label: 'PEMF session setup',
        modality: 'PEMF',
    },
    {
        id: 'pemf-2',
        url: '/images/chambers/hbot-redesign/pair-pemf.png',
        label: 'Recovery lounge',
        modality: 'PEMF',
    },
    {
        id: 'rlt-1',
        url: '/images/blog/card-rlt.jpg',
        label: 'Red light environment',
        modality: 'RLT',
    },
    {
        id: 'rlt-2',
        url: '/images/conditions/goal-recovery-alpine.jpg',
        label: 'Glow-focused setup',
        modality: 'RLT',
    },
    {
        id: 'hydrogen-1',
        url: '/images/blog/card-hydrogen.jpg',
        label: 'Hydration and hydrogen setup',
        modality: 'Hydrogen',
    },
    {
        id: 'shared-1',
        url: '/images/about/hero-alpine-spa-luxury.jpg',
        label: 'Wellness reception area',
        modality: 'ALL',
    },
];

const accessHref = buildLoginRedirectPath('/account');
const STUDIO_ROUTE = NEXUS_MODULE_NAV_ITEM_BY_KEY.studio.href;
const STUDIO_CAMPAIGN_PACK_ASSET_COUNT = 3;
const STUDIO_EDITOR_ACTION_STATUS_ID = 'studio-editor-action-status';
const STUDIO_DESIGN_ACTION_STATUS_ID = 'studio-design-action-status';
const STUDIO_EXPORT_ACTION_STATUS_ID = 'studio-export-action-status';
const STUDIO_SETUP_ACTION_STATUS_ID = 'studio-setup-action-status';
const STUDIO_SETUP_ACTION_STATUS_LABEL = 'Studio setup action status';
const STUDIO_ROUTE_RESET_STATUS_ID = 'studio-route-reset-status';
const STUDIO_ROUTE_RESET_STATUS_LABEL = 'Studio route reset status';
const STUDIO_EDITOR_NO_LIVE_ACTION_COPY =
    'No live campaign, booking request, CRM send, or provider handoff was created.';
const STUDIO_SETUP_ACTION_READY_STATUS =
    'Studio setup controls are ready. Goal, voice, modality, and setup handoff links update this local-only preview status.';

const INITIAL_NEXUS_STUDIO_ACTION_STATE: NexusStudioCampaignHandoffActionResult = {
    success: false,
    status: 'auth_required',
    message: 'Studio campaign handoff boundary has not been requested yet.',
    persisted: false,
    futureTable: null,
    persistenceMode: 'blocked',
};

const STUDIO_ACTION_STATUS_LABELS: Record<NexusStudioServerActionStatus, string> = {
    validation_error: 'Input check failed',
    auth_required: 'Authentication required',
    service_profile_required: 'Service profile required',
    role_not_allowed: 'Role not allowed',
    persistence_error: 'Private storage error',
    private_write_ready: 'Private write ready',
};

const PERSISTED_CAMPAIGN_HANDOFFS_STATUS_COPY: Record<PersistedCampaignHandoffsStatus, string> = {
    loaded: 'Authenticated Studio campaign handoff history is connected for signed-in service profiles.',
    database_error: 'Authenticated Studio handoff storage could not load, so this screen keeps sample campaign history only.',
    database_not_configured: 'Authenticated Studio handoff storage is ready for deployment database configuration.',
    auth_context_missing: 'Authenticated Studio handoff storage waits for sign-in and a verified Nexus service profile.',
    role_not_allowed: 'Studio campaign handoff history is manager-only for this Nexus service role.',
};

const trackStudioAction = (
    action: string,
    properties: Record<string, unknown> = {}
) => {
    analytics.capture('nexus_studio_route_action_clicked', {
        route: STUDIO_ROUTE,
        action,
        preview_record: true,
        ...properties,
    });
};

const getFormatSpec = (format: CampaignFormat): FormatOption =>
    OUTPUT_FORMATS.find((item) => item.id === format) ?? OUTPUT_FORMATS[0]!;

const isValidUrl = (value: string) => {
    if (!value.trim()) {
        return false;
    }

    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const isValidHexColor = (value: string) => /^#?[0-9a-fA-F]{6}$/.test(value.trim());

const normalizeHexColor = (value: string, fallback = '#0ea5e9') => {
    if (!isValidHexColor(value)) {
        return fallback;
    }

    return value.startsWith('#') ? value : `#${value}`;
};

const slugify = (value: string) =>
    value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'campaign';

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
};

const downloadDataUrl = (dataUrl: string, fileName: string) => {
    const anchor = document.createElement('a');
    anchor.href = dataUrl;
    anchor.download = fileName;
    anchor.click();
};

export const isAutomatedExportCheck = () =>
    typeof navigator !== 'undefined' && navigator.webdriver === true;

const readImageAsDataUrl = async (file: File) => {
    const maxBytes = 5 * 1024 * 1024;

    if (file.size > maxBytes) {
        throw new Error('Use an image smaller than 5 MB for reliable previews and export.');
    }

    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error('The selected image could not be read.'));
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
                return;
            }

            reject(new Error('The selected image could not be converted.'));
        };

        reader.readAsDataURL(file);
    });
};

const safeImageUploadMessages = new Set([
    'Use an image smaller than 5 MB for reliable previews and export.',
    'The selected image could not be read.',
    'The selected image could not be converted.',
]);

export const resolveImageUploadErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && safeImageUploadMessages.has(error.message)) {
        return error.message;
    }

    return fallback;
};

const getPreviewScale = (format: CampaignFormat) => {
    if (format === 'social-story') {
        return 0.26;
    }

    if (format === 'print-poster') {
        return 0.34;
    }

    return 0.38;
};

const hexToRgb = (hex: string) => {
    const normalized = hex.replace('#', '');

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return null;
    }

    return {
        r: Number.parseInt(normalized.slice(0, 2), 16),
        g: Number.parseInt(normalized.slice(2, 4), 16),
        b: Number.parseInt(normalized.slice(4, 6), 16),
    };
};

const getContrastRatio = (hexA: string, hexB: string) => {
    const rgbA = hexToRgb(hexA);
    const rgbB = hexToRgb(hexB);

    if (!rgbA || !rgbB) {
        return null;
    }

    const toChannel = (channel: number) => {
        const normalized = channel / 255;
        return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
    };

    const luminance = (rgb: { r: number; g: number; b: number }) =>
        0.2126 * toChannel(rgb.r) + 0.7152 * toChannel(rgb.g) + 0.0722 * toChannel(rgb.b);

    const light = Math.max(luminance(rgbA), luminance(rgbB));
    const dark = Math.min(luminance(rgbA), luminance(rgbB));

    return (light + 0.05) / (dark + 0.05);
};

const getBrandContrastHint = (brandColor: string) => {
    const whiteContrast = getContrastRatio(brandColor, '#ffffff');
    const slateContrast = getContrastRatio(brandColor, '#0f172a');

    if (!whiteContrast || !slateContrast) {
        return {
            tone: 'warning' as const,
            label: 'Check the brand color input',
            detail: 'The current value is not a valid hex color.',
        };
    }

    if (whiteContrast >= 4.5 || slateContrast >= 4.5) {
        return {
            tone: 'success' as const,
            label: 'Contrast is strong enough for primary use',
            detail:
                whiteContrast > slateContrast
                    ? 'This color reads well against white surfaces.'
                    : 'This color reads well against darker surfaces.',
        };
    }

    return {
        tone: 'warning' as const,
        label: 'Contrast is borderline for small text',
        detail: 'Use this as an accent only or choose a darker brand color for text-heavy layouts.',
    };
};

const buildSuggestedCopy = ({
    campaignGoal,
    modality,
    voice,
}: {
    campaignGoal: CampaignGoal;
    modality: Modality;
    voice: CampaignVoice;
}) => {
    const base = COPY_LIBRARY[`${campaignGoal}-${modality}`] ?? COPY_LIBRARY.default!;

    if (voice === 'clinical') {
        return {
            title: base.title,
            body: `${base.body} Keep the message grounded in session workflow, suitability review, and a clear consultation next step.`,
            caption: `${base.caption}\n\nUse educational framing, explain the setting, and avoid outcome-heavy language.`,
            hashtags: `${base.hashtags} #EvidenceInformed`,
        };
    }

    if (voice === 'luxury') {
        return {
            title: base.title,
            body: `${base.body} Highlight the premium environment, guided onboarding, and the calm pace of the clinic experience.`,
            caption: `${base.caption}\n\nLead with atmosphere, premium service, and the confidence of a structured first visit.`,
            hashtags: `${base.hashtags} #PremiumWellness`,
        };
    }

    return base;
};

const parseSafeRewriteSuggestion = (suggestion: string) => {
    const match = suggestion.match(/Try using "(.+)" instead of "(.+)"/);

    if (!match) {
        return null;
    }

    const replacement = match[1];
    const term = match[2];

    if (!replacement || !term) {
        return null;
    }

    return { replacement, term };
};

const applySafeRewrites = (value: string, suggestions: string[]) => {
    let rewritten = value;

    for (const suggestion of suggestions) {
        const parsed = parseSafeRewriteSuggestion(suggestion);

        if (!parsed) {
            continue;
        }

        rewritten = rewritten.replace(
            new RegExp(`\\b${parsed.term}\\b`, 'gi'),
            parsed.replacement
        );
    }

    return rewritten;
};

const getCampaignChecklist = ({
    clinicName,
    bookingUrl,
    customTitle,
    customBody,
    showQrCode,
}: {
    clinicName: string;
    bookingUrl: string;
    customTitle: string;
    customBody: string;
    showQrCode: boolean;
}): ChecklistItem[] => [
    {
        label: 'Clinic identity',
        detail: 'Add a clinic name or upload a logo.',
        done: clinicName.trim().length > 0,
    },
    {
        label: 'Booking destination',
        detail: showQrCode
            ? 'Provide a booking URL so the QR code points somewhere real.'
            : 'QR export is intentionally disabled.',
        done: !showQrCode || isValidUrl(bookingUrl),
    },
    {
        label: 'Headline',
        detail: 'Create a clear first-screen message.',
        done: customTitle.trim().length > 0,
    },
    {
        label: 'Support copy',
        detail: 'Add body copy that explains the offer conservatively.',
        done: customBody.trim().length > 0,
    },
];

const resolveStudioHandoffReadinessStatus = ({
    checklistIncomplete,
    qrHandoffReady,
    persistedHandoffCount,
}: {
    checklistIncomplete: number;
    qrHandoffReady: boolean;
    persistedHandoffCount: number;
}) => {
    if (checklistIncomplete > 0) {
        return 'Needs checklist completion before private handoff review.';
    }

    if (!qrHandoffReady) {
        return 'Ready for asset review with QR handoff intentionally disabled.';
    }

    if (persistedHandoffCount > 0) {
        return 'Ready for manager review with authenticated handoff history.';
    }

    return 'Ready to package after sign-in with aggregate campaign counts.';
};

const buildStudioHandoffReadinessBridge = ({
    format,
    campaignGoal,
    modality,
    readinessItems,
    showQrCode,
    bookingUrl,
    showLogo,
    logoUrl,
    persistedHandoffCount,
}: {
    format: CampaignFormat;
    campaignGoal: CampaignGoal;
    modality: Modality;
    readinessItems: ChecklistItem[];
    showQrCode: boolean;
    bookingUrl: string;
    showLogo: boolean;
    logoUrl: string | null;
    persistedHandoffCount: number;
}): StudioHandoffReadinessBridge => {
    const checklistComplete = readinessItems.filter((item) => item.done).length;
    const checklistIncomplete = readinessItems.length - checklistComplete;
    const qrHandoffReady = !showQrCode || isValidUrl(bookingUrl);

    return {
        formatLabel: getFormatSpec(format).label,
        campaignGoal,
        modality,
        checklistTotal: readinessItems.length,
        checklistComplete,
        checklistIncomplete,
        assetFormatCount: STUDIO_CAMPAIGN_PACK_ASSET_COUNT,
        qrHandoffReady,
        logoIncluded: Boolean(showLogo && logoUrl),
        persistedHandoffCount,
        handoffReadinessStatus: resolveStudioHandoffReadinessStatus({
            checklistIncomplete,
            qrHandoffReady,
            persistedHandoffCount,
        }),
    };
};

const getModalityDisclaimer = (modality: Modality) => {
    switch (modality) {
        case 'HBOT':
            return 'HBOT sessions are presented here in a wellness context. Individual suitability varies, so guide visitors into a qualified consultation before use.';
        case 'PEMF':
            return 'PEMF messaging should stay focused on guided wellness routines rather than outcome promises. Invite people into a suitability conversation first.';
        case 'RLT':
            return 'Red light sessions should be framed as supportive wellness routines. Keep claims conservative and make the next step clear.';
        case 'Hydrogen':
            return 'Hydrogen messaging should explain the routine and environment clearly without overstating benefit claims.';
        default:
            return disclaimers.short;
    }
};

const SelectionCard: React.FC<{
    selected: boolean;
    label: string;
    description: string;
    icon: LucideIcon;
    onClick: () => void;
    ariaDescribedBy?: string;
    onFocus?: () => void;
}> = ({ selected, label, description, icon: Icon, onClick, ariaDescribedBy, onFocus }) => (
    <button
        type="button"
        aria-pressed={selected}
        aria-describedby={ariaDescribedBy}
        onClick={onClick}
        onFocus={onFocus}
        className={`flex min-h-11 flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors sm:gap-3 sm:p-4 ${
            selected
                ? 'border-cyan-400/[0.35] bg-cyan-400/[0.12] text-cyan-50'
                : 'border-white/[0.10] bg-white/[0.045] text-slate-200 hover:border-cyan-400/[0.24] hover:bg-white/[0.08]'
        }`}
    >
        <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${
                selected ? 'bg-cyan-400/[0.16] text-cyan-100' : 'bg-white/[0.08] text-slate-400'
            }`}
        >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
            <p className="text-sm font-semibold leading-5">{label}</p>
            <p className="mt-1 hidden text-xs leading-5 text-slate-400 sm:block">{description}</p>
        </div>
    </button>
);

const ChecklistCard: React.FC<{
    title: string;
    description: string;
    items: ChecklistItem[];
}> = ({ title, description, items }) => (
    <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-5">
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.12] text-cyan-100">
                <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
            </div>
        </div>

        <div className="mt-5 space-y-3">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3"
                >
                    <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm ${
                            item.done ? 'bg-emerald-400/[0.18] text-emerald-100' : 'bg-amber-400/[0.18] text-amber-100'
                        }`}
                    >
                        {item.done ? <Check className="h-3.5 w-3.5" /> : <Info className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-100">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const LivePreviewHTML = memo(
    forwardRef<HTMLDivElement, { scale?: number; transformOrigin?: string }>(
        ({ scale = 1, transformOrigin = 'top center' }, ref) => {
        const {
            profile,
            customTitle,
            customBody,
            campaignGoal,
            format,
            backgroundImage,
            showQrCode,
            showLogo,
            theme,
            showHeatmap,
            showVerifiedBadge,
            modality,
            voice,
            layoutVariation,
        } = usePartnerStore();
        const suggestedCopy = useMemo(
            () => buildSuggestedCopy({ campaignGoal, modality, voice }),
            [campaignGoal, modality, voice]
        );
        const formatSpec = getFormatSpec(format);
        const previewTitle = customTitle.trim() || suggestedCopy.title;
        const previewBody = customBody.trim() || suggestedCopy.body;
        const accent = normalizeHexColor(profile.brandColor);
        const isOverlay = layoutVariation === 0;
        const isSplit = layoutVariation === 1;
        const isFrame = layoutVariation === 2;
        const brandName = profile.clinicName.trim() || 'Your clinic brand';
        const qrSource =
            showQrCode && profile.bookingUrl.trim()
                ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                      profile.bookingUrl
                  )}`
                : null;
        const themeSurface =
            theme === 'bold' ? '#0f172a' : theme === 'luxury' ? '#fffaf4' : '#ffffff';
        const themeInk =
            theme === 'bold' ? '#f8fafc' : theme === 'luxury' ? '#2b2118' : '#0f172a';
        const themeCopy =
            theme === 'bold' ? '#cbd5e1' : theme === 'luxury' ? '#5f4a3b' : '#475569';

            return (
                <div
                    ref={ref}
                    className="mx-auto overflow-hidden rounded-lg border border-white/[0.12]"
                    style={{
                        width: `${formatSpec.width}px`,
                        height: `${formatSpec.height}px`,
                        transform: `scale(${scale})`,
                        transformOrigin,
                        backgroundColor: themeSurface,
                    }}
                >
                <div className="relative flex h-full flex-col overflow-hidden">
                    {(isOverlay || isFrame) && backgroundImage ? (
                        <div className="absolute inset-0">
                            <Image
                                src={backgroundImage}
                                alt="Selected campaign background"
                                fill
                                sizes="(max-width: 1200px) 100vw, 1200px"
                                className="object-cover"
                            />
                            <div
                                className={`absolute inset-0 ${
                                    theme === 'bold'
                                        ? 'bg-slate-950/[0.60]'
                                        : theme === 'luxury'
                                          ? 'bg-white/[0.58]'
                                          : 'bg-white/[0.72]'
                                }`}
                            />
                        </div>
                    ) : null}

                    {showHeatmap ? (
                        <div className="pointer-events-none absolute inset-0 opacity-75">
                            <div
                                className="absolute left-1/2 top-[30%] h-52 w-80 -translate-x-1/2 rounded-lg blur-xl"
                                style={{
                                    background:
                                        'radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(249,115,22,0.16) 50%, transparent 100%)',
                                }}
                            />
                            <div
                                className="absolute bottom-[14%] left-1/2 h-32 w-32 -translate-x-1/2 rounded-lg blur-xl"
                                style={{
                                    background:
                                        'radial-gradient(circle, rgba(14,165,233,0.34) 0%, rgba(14,165,233,0.08) 55%, transparent 100%)',
                                }}
                            />
                        </div>
                    ) : null}

                    <div
                        className={`relative z-10 flex flex-1 flex-col ${
                            isFrame ? 'm-8 rounded-lg border border-white/[0.60] bg-white/[0.88]' : ''
                        }`}
                    >
                        <div
                            className={`flex items-center justify-between px-8 py-7 ${
                                isOverlay ? 'text-white' : ''
                            }`}
                        >
                            <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.80] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 backdrop-blur">
                                {showVerifiedBadge ? <BadgeCheck className="h-3.5 w-3.5 text-cyan-600" /> : null}
                                {showVerifiedBadge ? 'Verified technology' : 'Studio preview'}
                            </div>
                            <div className="text-right">
                                <p
                                    className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                                    style={{ color: isOverlay && backgroundImage ? '#f8fafc' : accent }}
                                >
                                    {modality}
                                </p>
                                <p
                                    className="mt-1 text-xs"
                                    style={{ color: isOverlay && backgroundImage ? '#e2e8f0' : '#64748b' }}
                                >
                                    {GOAL_OPTIONS.find((item) => item.id === campaignGoal)?.label ?? 'Campaign'}
                                </p>
                            </div>
                        </div>

                        {isSplit ? (
                            <div className="grid flex-1 grid-cols-[1.05fr_0.95fr]">
                                <div className="relative">
                                    {backgroundImage ? (
                                        <Image
                                            src={backgroundImage}
                                            alt="Selected campaign background"
                                            fill
                                            sizes="(max-width: 1200px) 50vw, 600px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div
                                            className="flex h-full items-end p-10"
                                            style={{
                                                background:
                                                    'linear-gradient(160deg, rgba(14,165,233,0.18) 0%, rgba(15,23,42,0.92) 100%)',
                                            }}
                                        >
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                                    Add a hero image
                                                </p>
                                                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-200">
                                                    Upload a room, device, or branded space shot for a stronger campaign handoff.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div
                                    className="flex flex-col justify-between px-10 pb-10"
                                    style={{ backgroundColor: themeSurface }}
                                >
                                    <div className="pt-6">
                                        {showLogo && profile.logoUrl ? (
                                            <Image
                                                src={profile.logoUrl}
                                                alt={`${brandName} logo`}
                                                width={180}
                                                height={64}
                                                sizes="180px"
                                                className="mb-7 h-14 w-auto object-contain"
                                            />
                                        ) : null}
                                        <p
                                            className="text-[12px] font-semibold uppercase tracking-[0.24em]"
                                            style={{ color: accent }}
                                        >
                                            {brandName}
                                        </p>
                                        <h2
                                            className="mt-5 text-[48px] font-semibold leading-[1.06]"
                                            style={{ color: themeInk }}
                                        >
                                            {previewTitle}
                                        </h2>
                                        <p
                                            className="mt-6 whitespace-pre-wrap text-[18px] leading-[1.6]"
                                            style={{ color: themeCopy }}
                                        >
                                            {previewBody}
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] px-6 py-5">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            Guidance
                                        </p>
                                        <p className="mt-3 text-[14px] leading-6 text-slate-600">
                                            {getModalityDisclaimer(modality)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`flex flex-1 flex-col justify-between px-10 pb-10 ${
                                    isOverlay ? 'text-white' : ''
                                }`}
                            >
                                <div className={`${format === 'social-story' ? 'pt-16' : 'pt-10'} max-w-[78%]`}>
                                    {showLogo && profile.logoUrl ? (
                                        <Image
                                            src={profile.logoUrl}
                                            alt={`${brandName} logo`}
                                            width={200}
                                            height={72}
                                            sizes="200px"
                                            className={`mb-7 h-16 w-auto object-contain ${
                                                isOverlay && backgroundImage && theme !== 'luxury'
                                                    ? 'brightness-0 invert'
                                                    : ''
                                            }`}
                                        />
                                    ) : null}
                                    <p
                                        className="text-[12px] font-semibold uppercase tracking-[0.26em]"
                                        style={{ color: isOverlay && backgroundImage ? '#bae6fd' : accent }}
                                    >
                                        {brandName}
                                    </p>
                                    <h2
                                        className={`mt-5 font-semibold leading-[1.04] ${
                                            format === 'social-story' ? 'text-[70px]' : 'text-[52px]'
                                        }`}
                                        style={{
                                            color:
                                                isOverlay && backgroundImage ? '#f8fafc' : themeInk,
                                        }}
                                    >
                                        {previewTitle}
                                    </h2>
                                    <p
                                        className={`mt-6 whitespace-pre-wrap leading-[1.58] ${
                                            format === 'social-story' ? 'text-[22px]' : 'text-[18px]'
                                        }`}
                                        style={{
                                            color:
                                                isOverlay && backgroundImage ? '#e2e8f0' : themeCopy,
                                        }}
                                    >
                                        {previewBody}
                                    </p>
                                </div>

                                <div
                                    className={`flex items-end justify-between gap-8 rounded-lg px-8 py-7 ${
                                            isOverlay && backgroundImage
                                                ? 'bg-slate-950/[0.40] backdrop-blur'
                                            : 'border border-white/[0.10] bg-white/[0.045]'
                                    }`}
                                >
                                    <div className="max-w-[75%]">
                                        <p
                                            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                                            style={{
                                                color: isOverlay && backgroundImage ? '#bae6fd' : '#64748b',
                                            }}
                                        >
                                            Compliance note
                                        </p>
                                        <p
                                            className="mt-3 text-[14px] leading-6"
                                            style={{
                                                color:
                                                    isOverlay && backgroundImage ? '#e2e8f0' : '#64748b',
                                            }}
                                        >
                                            {getModalityDisclaimer(modality)}
                                        </p>
                                    </div>

                                    {showQrCode ? (
                                        qrSource ? (
                                            <div className="rounded-lg border border-white/[0.15] bg-[#fff] p-3">
                                                <Image
                                                    src={qrSource}
                                                    alt="Booking QR code"
                                                    width={88}
                                                    height={88}
                                                    sizes="88px"
                                                    className="h-[88px] w-[88px]"
                                                />
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed border-slate-300 bg-white/[0.70] px-5 py-4 text-center">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                                    QR disabled
                                                </p>
                                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                                    Add a booking URL to activate the handoff.
                                                </p>
                                            </div>
                                        )
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            );
        }
    )
);

LivePreviewHTML.displayName = 'LivePreviewHTML';

const PreviewStage: React.FC<{ format: CampaignFormat }> = ({ format }) => {
    const scale = getPreviewScale(format);
    const formatSpec = getFormatSpec(format);

    return (
        <div className="flex items-start justify-center">
            <div
                className="relative shrink-0"
                style={{
                    width: formatSpec.width * scale,
                    height: formatSpec.height * scale,
                }}
            >
                <div className="absolute left-0 top-0">
                    <LivePreviewHTML scale={scale} transformOrigin="top left" />
                </div>
            </div>
        </div>
    );
};

const StepIntent: React.FC = memo(() => {
    const {
        profile,
        setProfile,
        campaignGoal,
        setCampaignGoal,
        modality,
        setModality,
        voice,
        setVoice,
    } = usePartnerStore();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [setupActionStatus, setSetupActionStatus] = useState(STUDIO_SETUP_ACTION_READY_STATUS);
    const contrastHint = useMemo(() => getBrandContrastHint(profile.brandColor), [profile.brandColor]);
    const readinessItems = useMemo(
        () => [
            {
                label: 'Clinic identity is present',
                detail: 'Add a clinic name and optionally a logo before export.',
                done: profile.clinicName.trim().length > 0,
            },
            {
                label: 'Booking handoff is real',
                detail: 'Use a valid booking URL so QR codes point to a real destination.',
                done: isValidUrl(profile.bookingUrl),
            },
            {
                label: 'Voice direction is selected',
                detail: 'Choose the tone you want the starter copy generator to follow.',
                done: Boolean(voice),
            },
        ],
        [profile.bookingUrl, profile.clinicName, voice]
    );

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            const dataUrl = await readImageAsDataUrl(file);
            setProfile({ logoUrl: dataUrl });
            setUploadError(null);
        } catch (error) {
            setUploadError(resolveImageUploadErrorMessage(error, 'The selected logo could not be used.'));
        }
    };

    const announceSetupChoice = (label: string, value: string, selected: boolean) => {
        setSetupActionStatus(
            selected
                ? `${label} set to ${value} for this local Studio preview. No live campaign, booking request, CRM send, or provider handoff was created.`
                : `${label} option ${value} ready for Studio setup. No live campaign, booking request, CRM send, or provider handoff will be created by previewing this choice.`
        );
    };

    const announceSetupHandoff = (label: string) => {
        setSetupActionStatus(
            `Opening ${label} from Studio setup support cues. No live campaign, booking request, CRM send, or provider handoff was created from this preview.`
        );
    };

    const announceSetupField = (label: string, action: 'ready' | 'updated') => {
        setSetupActionStatus(
            action === 'updated'
                ? `${label} updated in the local Studio setup preview. No live campaign, booking request, CRM send, or provider handoff was created.`
                : `${label} field ready for the local Studio setup preview. No live campaign, booking request, CRM send, or provider handoff will be created by editing it.`
        );
    };

    return (
        <div className="space-y-6 text-slate-100">
            <section className="rounded-lg border border-white/[0.10] bg-slate-950 p-6 md:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                            Step 1
                        </p>
                        <h2 className="mt-2 font-sans text-xl font-semibold text-white md:text-2xl">
                            Set the brand, the campaign goal, and the message voice.
                        </h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                            Nexus Studio stays in public sample mode on this page, so the goal here is clarity rather than fake live partner data. Drafts are stored only in this browser session.
                        </p>
                    </div>
                    <div className="rounded-lg border border-cyan-400/[0.22] bg-cyan-400/[0.10] px-4 py-3 text-sm text-cyan-50">
                        <p className="font-semibold">Public sample workspace</p>
                        <p className="mt-1 max-w-xs text-xs leading-5 text-cyan-100">
                            Use sign-in for account access later. This page is for previewing the workflow safely.
                        </p>
                    </div>
                </div>
                <div
                    id={STUDIO_SETUP_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={STUDIO_SETUP_ACTION_STATUS_LABEL}
                    className="mt-5 rounded-lg border border-cyan-400/[0.22] bg-cyan-400/[0.08] px-4 py-3 text-sm leading-6 text-cyan-50"
                >
                    {setupActionStatus}
                </div>

                <div className="mt-8 rounded-lg border border-white/[0.10] bg-white/[0.045] p-5">
                    <div className="flex flex-wrap items-start gap-4">
                        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-white/[0.10] bg-slate-950/[0.55]">
                            {profile.logoUrl ? (
                                <Image
                                    src={profile.logoUrl}
                                    alt="Uploaded clinic logo"
                                    fill
                                    sizes="96px"
                                    className="object-contain p-3"
                                />
                            ) : (
                                <Upload className="h-6 w-6 text-slate-500" />
                            )}
                        </div>

                        <div className="flex-1 sm:min-w-[220px]">
                            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Logo upload
                            </label>
                            <div className="mt-2 flex flex-wrap gap-3">
                                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-medium text-slate-100 transition-colors hover:bg-white/[0.08]">
                                    <Upload className="h-4 w-4" />
                                    Upload logo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                                        onFocus={() => announceSetupField('Logo upload', 'ready')}
                                        onChange={handleLogoUpload}
                                        className="sr-only"
                                    />
                                </label>
                                {profile.logoUrl ? (
                                    <button
                                        type="button"
                                        aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                                        onFocus={() => announceSetupField('Logo remove', 'ready')}
                                        onClick={() => {
                                            setProfile({ logoUrl: null });
                                            announceSetupField('Logo upload', 'updated');
                                        }}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-medium text-slate-100 transition-colors hover:bg-white/[0.08]"
                                    >
                                        Remove logo
                                    </button>
                                ) : null}
                            </div>
                            <p className="mt-3 text-xs leading-5 text-slate-400">
                                Use a square or wide PNG/SVG under 5 MB for the cleanest preview and export.
                            </p>
                            {uploadError ? (
                                <p className="mt-2 text-xs text-rose-600">{uploadError}</p>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <label
                                htmlFor="studio-clinic-name"
                                className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                            >
                                Clinic name
                            </label>
                            <input
                                id="studio-clinic-name"
                                type="text"
                                value={profile.clinicName}
                                aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                                onFocus={() => announceSetupField('Clinic name', 'ready')}
                                onChange={(event) => {
                                    setProfile({ clinicName: event.target.value });
                                    announceSetupField('Clinic name', 'updated');
                                }}
                                className="mt-2 min-h-11 w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/[0.60] focus:bg-white/[0.08]"
                                placeholder="Hylono Wellness Studio"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="studio-booking-url"
                                className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                            >
                                Booking URL
                            </label>
                            <input
                                id="studio-booking-url"
                                type="url"
                                value={profile.bookingUrl}
                                aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                                onFocus={() => announceSetupField('Booking URL', 'ready')}
                                onChange={(event) => {
                                    setProfile({ bookingUrl: event.target.value });
                                    announceSetupField('Booking URL', 'updated');
                                }}
                                className="mt-2 min-h-11 w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/[0.60] focus:bg-white/[0.08]"
                                placeholder="https://example.com/book"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="studio-website"
                                className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                            >
                                Website
                            </label>
                            <input
                                id="studio-website"
                                type="url"
                                value={profile.website}
                                aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                                onFocus={() => announceSetupField('Website', 'ready')}
                                onChange={(event) => {
                                    setProfile({ website: event.target.value });
                                    announceSetupField('Website', 'updated');
                                }}
                                className="mt-2 min-h-11 w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/[0.60] focus:bg-white/[0.08]"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="studio-phone"
                                className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                            >
                                Phone
                            </label>
                            <input
                                id="studio-phone"
                                type="tel"
                                value={profile.phone}
                                aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                                onFocus={() => announceSetupField('Phone', 'ready')}
                                onChange={(event) => {
                                    setProfile({ phone: event.target.value });
                                    announceSetupField('Phone', 'updated');
                                }}
                                className="mt-2 min-h-11 w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/[0.60] focus:bg-white/[0.08]"
                                placeholder="Phone number for draft only"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="studio-instagram"
                                className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                            >
                                Instagram
                            </label>
                            <input
                                id="studio-instagram"
                                type="text"
                                value={profile.socialInstagram}
                                aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                                onFocus={() => announceSetupField('Instagram', 'ready')}
                                onChange={(event) => {
                                    setProfile({
                                        socialInstagram: event.target.value.replace(/^@/, ''),
                                    });
                                    announceSetupField('Instagram', 'updated');
                                }}
                                className="mt-2 min-h-11 w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/[0.60] focus:bg-white/[0.08]"
                                placeholder="yourhandle"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="studio-brand-color"
                                className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                            >
                                Brand color
                            </label>
                            <div className="mt-2 flex gap-3">
                                <input
                                    id="studio-brand-color"
                                    type="color"
                                    value={normalizeHexColor(profile.brandColor)}
                                    aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                                    onFocus={() => announceSetupField('Brand color', 'ready')}
                                    onChange={(event) => {
                                        setProfile({ brandColor: event.target.value });
                                        announceSetupField('Brand color', 'updated');
                                    }}
                                    className="h-11 w-14 rounded-lg border border-white/[0.10] bg-white/[0.045] p-1"
                                />
                                <input
                                    type="text"
                                    value={profile.brandColor}
                                    aria-label="Brand color hex value"
                                    aria-describedby={`studio-brand-color-hint ${STUDIO_SETUP_ACTION_STATUS_ID}`}
                                    onFocus={() => announceSetupField('Brand color hex value', 'ready')}
                                    onChange={(event) => {
                                        setProfile({ brandColor: event.target.value });
                                        announceSetupField('Brand color hex value', 'updated');
                                    }}
                                    className="min-h-11 flex-1 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-medium uppercase text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/[0.60] focus:bg-white/[0.08]"
                                    placeholder="#0EA5E9"
                                />
                            </div>
                            <p
                                id="studio-brand-color-hint"
                                className={`mt-3 text-xs leading-5 ${
                                    contrastHint.tone === 'success' ? 'text-emerald-200' : 'text-amber-200'
                                }`}
                            >
                                <span className="font-semibold">{contrastHint.label}:</span>{' '}
                                {contrastHint.detail}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                        {readinessItems.map((item) => (
                            <div
                                key={item.label}
                                className="rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm ${
                                            item.done ? 'bg-emerald-400/[0.18] text-emerald-100' : 'bg-amber-400/[0.18] text-amber-100'
                                        }`}
                                    >
                                        {item.done ? (
                                            <Check className="h-3.5 w-3.5" />
                                        ) : (
                                            <Info className="h-3.5 w-3.5" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                                        <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <fieldset className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-6">
                    <legend className="text-base font-semibold text-white">Campaign goal</legend>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        This guides the starter copy and the dominant CTA.
                    </p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {GOAL_OPTIONS.map((goal) => (
                            <SelectionCard
                                key={goal.id}
                                selected={campaignGoal === goal.id}
                                label={goal.label}
                                description={goal.description}
                                icon={goal.icon}
                                ariaDescribedBy={STUDIO_SETUP_ACTION_STATUS_ID}
                                onFocus={() => announceSetupChoice('Campaign goal', goal.label, false)}
                                onClick={() => {
                                    setCampaignGoal(goal.id);
                                    announceSetupChoice('Campaign goal', goal.label, true);
                                }}
                            />
                        ))}
                    </div>
                </fieldset>

                <fieldset className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-6">
                    <legend className="text-base font-semibold text-white">Message voice</legend>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                        Choose the tone the assisted copy generator should follow.
                    </p>
                    <div className="mt-5 space-y-3">
                        {VOICE_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                aria-pressed={voice === option.id}
                                aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                                onFocus={() => announceSetupChoice('Message voice', option.label, false)}
                                onClick={() => {
                                    setVoice(option.id);
                                    announceSetupChoice('Message voice', option.label, true);
                                }}
                                className={`flex min-h-11 w-full items-start justify-between gap-4 rounded-lg border px-4 py-4 text-left transition-colors ${
                                    voice === option.id
                                        ? 'border-cyan-400/[0.35] bg-cyan-400/[0.12]'
                                        : 'border-white/[0.10] bg-white/[0.045] hover:border-cyan-400/[0.24] hover:bg-white/[0.08]'
                                }`}
                            >
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">{option.label}</p>
                                    <p className="mt-1 text-xs leading-5 text-slate-400">
                                        {option.description}
                                    </p>
                                </div>
                                {voice === option.id ? (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/[0.16] text-cyan-100">
                                        <Check className="h-4 w-4" />
                                    </div>
                                ) : null}
                            </button>
                        ))}
                    </div>
                </fieldset>
            </section>

            <fieldset className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-6">
                <legend className="text-base font-semibold text-white">Modality focus</legend>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                    This swaps the image library, disclaimer guidance, and copy direction.
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {MODALITY_OPTIONS.map((option) => (
                        <SelectionCard
                            key={option.id}
                            selected={modality === option.id}
                            label={option.label}
                            description={option.description}
                            icon={option.icon}
                            ariaDescribedBy={STUDIO_SETUP_ACTION_STATUS_ID}
                            onFocus={() => announceSetupChoice('Modality focus', option.label, false)}
                            onClick={() => {
                                setModality(option.id);
                                announceSetupChoice('Modality focus', option.label, true);
                            }}
                        />
                    ))}
                </div>
            </fieldset>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-white/[0.10] bg-slate-950 p-6 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                        Support cues
                    </p>
                    <h3 className="mt-3 text-lg font-semibold">Keep the workflow honest and easy to finish.</h3>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                        <li>Use real clinic links only. QR export is only as good as the booking destination behind it.</li>
                        <li>Keep copy in a wellness-support frame. The generator is tuned for conservative public-safe wording.</li>
                        <li>Use sign-in when you need authenticated account tools. This page is intentionally a sample workspace.</li>
                    </ul>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href={accessHref}
                            aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                            onFocus={() => announceSetupHandoff('sign-in')}
                            onClick={() => announceSetupHandoff('sign-in')}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.16] px-4 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/[0.22]"
                        >
                            Sign in later
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/contact"
                            aria-describedby={STUDIO_SETUP_ACTION_STATUS_ID}
                            onFocus={() => announceSetupHandoff('Hylono contact')}
                            onClick={() => announceSetupHandoff('Hylono contact')}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.16] bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.14]"
                        >
                            Contact Hylono
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Messaging guardrail
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{getModalityDisclaimer(modality)}</p>
                </div>
            </div>
        </div>
    );
});

StepIntent.displayName = 'StepIntent';

const StepEditor: React.FC = memo(() => {
    const {
        profile,
        campaignGoal,
        format,
        setFormat,
        theme,
        setTheme,
        voice,
        modality,
        layoutVariation,
        setLayoutVariation,
        customTitle,
        setCustomTitle,
        customBody,
        setCustomBody,
        customCaption,
        setCustomCaption,
        backgroundImage,
        setBackgroundImage,
        showQrCode,
        setShowQrCode,
        showLogo,
        setShowLogo,
        showHeatmap,
        setShowHeatmap,
        showVerifiedBadge,
        setShowVerifiedBadge,
    } = usePartnerStore();
    const [imageError, setImageError] = useState<string | null>(null);
    const [editorActionStatus, setEditorActionStatus] = useState(
        'Ready to generate or soften this local draft. No live campaign, booking request, CRM send, or provider handoff is created from editor actions.'
    );
    const [designActionStatus, setDesignActionStatus] = useState(
        `Design controls are ready. Format, theme, layout, hero image, and preview toggles update this local Studio preview only. ${STUDIO_EDITOR_NO_LIVE_ACTION_COPY}`
    );
    const suggestedCopy = useMemo(
        () => buildSuggestedCopy({ campaignGoal, modality, voice }),
        [campaignGoal, modality, voice]
    );
    const compliance = useMemo(
        () => validateCompliance(`${customTitle} ${customBody} ${customCaption}`, { strict: true }),
        [customBody, customCaption, customTitle]
    );
    const filteredImages = useMemo(
        () =>
            STOCK_IMAGES.filter(
                (item) => item.modality === modality || item.modality === 'ALL'
            ),
        [modality]
    );
    const checklistItems = useMemo(
        () =>
            getCampaignChecklist({
                clinicName: profile.clinicName,
                bookingUrl: profile.bookingUrl,
                customTitle,
                customBody,
                showQrCode,
            }),
        [customBody, customTitle, profile.bookingUrl, profile.clinicName, showQrCode]
    );

    const announceDesignOptionFocus = (
        groupLabel: string,
        optionLabel: string,
        selected: boolean
    ) => {
        setDesignActionStatus(
            `${groupLabel} option ${optionLabel} ${selected ? 'is selected' : 'is ready'} for this local Studio preview. ${STUDIO_EDITOR_NO_LIVE_ACTION_COPY}`
        );
    };

    const announceDesignOptionSelected = (groupLabel: string, optionLabel: string) => {
        setDesignActionStatus(
            `${groupLabel} set to ${optionLabel} for this local Studio preview. ${STUDIO_EDITOR_NO_LIVE_ACTION_COPY}`
        );
    };

    const announceDesignToggleFocus = (label: string, enabled: boolean) => {
        setDesignActionStatus(
            `${label} toggle is ready and currently ${enabled ? 'on' : 'off'} in this local Studio preview. ${STUDIO_EDITOR_NO_LIVE_ACTION_COPY}`
        );
    };

    const handleDesignToggle = (label: string, enabled: boolean, onChange: () => void) => {
        const nextState = !enabled;
        onChange();
        setDesignActionStatus(
            `${label} turned ${nextState ? 'on' : 'off'} for this local Studio preview. ${STUDIO_EDITOR_NO_LIVE_ACTION_COPY}`
        );
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            const dataUrl = await readImageAsDataUrl(file);
            setBackgroundImage(dataUrl);
            setImageError(null);
            setDesignActionStatus(
                `Custom hero image loaded for this local Studio preview. ${STUDIO_EDITOR_NO_LIVE_ACTION_COPY}`
            );
        } catch (error) {
            const message = resolveImageUploadErrorMessage(error, 'The selected image could not be used.');
            setImageError(message);
            setDesignActionStatus(`${message} ${STUDIO_EDITOR_NO_LIVE_ACTION_COPY}`);
        }
    };

    const handleGenerateStarterCopy = () => {
        setCustomTitle(suggestedCopy.title);
        setCustomBody(suggestedCopy.body);
        setCustomCaption(suggestedCopy.caption);
        setEditorActionStatus(
            `Generated conservative starter copy for the local ${modality} draft. Review before export; no live campaign, booking request, CRM send, or provider handoff was created.`
        );
    };

    const handleApplySafeRewrites = () => {
        if (compliance.suggestions.length === 0) {
            setEditorActionStatus(
                'No safe rewrite suggestions are available for the current local draft. No live campaign, booking request, CRM send, or provider handoff was created.'
            );
            return;
        }

        setCustomTitle(applySafeRewrites(customTitle, compliance.suggestions));
        setCustomBody(applySafeRewrites(customBody, compliance.suggestions));
        setCustomCaption(applySafeRewrites(customCaption, compliance.suggestions));
        setEditorActionStatus(
            `Applied ${compliance.suggestions.length} safe rewrite ${
                compliance.suggestions.length === 1 ? 'suggestion' : 'suggestions'
            } to the local draft. Review before export; no live campaign, booking request, CRM send, or provider handoff was created.`
        );
    };

    return (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
            <div className="space-y-6">
                <section className="rounded-lg border border-white/[0.10] bg-slate-950 p-6 md:p-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                                Step 2
                            </p>
                            <h2 className="mt-2 font-sans text-xl font-semibold text-white md:text-2xl">
                                Build the asset, stress-test the copy, and keep the handoff obvious.
                            </h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                                The editor keeps the public sample page useful without pretending to be a live partner account. Use the generator to produce a polished campaign draft, then export what you need.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                aria-describedby={STUDIO_EDITOR_ACTION_STATUS_ID}
                                onClick={handleGenerateStarterCopy}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.16] px-4 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/[0.22]"
                            >
                                <Wand2 className="h-4 w-4" />
                                Generate starter copy
                            </button>
                            <button
                                type="button"
                                aria-describedby={STUDIO_EDITOR_ACTION_STATUS_ID}
                                onClick={handleApplySafeRewrites}
                                disabled={compliance.suggestions.length === 0}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Apply safe rewrites
                            </button>
                        </div>
                    </div>
                    <div
                        id={STUDIO_EDITOR_ACTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label="Studio editor action status"
                        className="mt-5 rounded-lg border border-cyan-400/[0.18] bg-cyan-400/[0.08] px-4 py-3 text-sm leading-6 text-cyan-50"
                    >
                        {editorActionStatus}
                    </div>

                    <div className="mt-8 grid gap-6 xl:grid-cols-3">
                        <fieldset className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-5">
                            <legend className="text-sm font-semibold text-white">Output format</legend>
                            <div className="mt-4 space-y-3">
                                {OUTPUT_FORMATS.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        aria-pressed={format === option.id}
                                        aria-describedby={STUDIO_DESIGN_ACTION_STATUS_ID}
                                        onFocus={() =>
                                            announceDesignOptionFocus('Output format', option.label, format === option.id)
                                        }
                                        onClick={() => {
                                            setFormat(option.id);
                                            announceDesignOptionSelected('Output format', option.label);
                                        }}
                                        className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-3 py-3 text-left transition-colors md:items-start md:gap-3 md:px-4 md:py-4 ${
                                            format === option.id
                                                ? 'border-cyan-400/[0.35] bg-cyan-400/[0.12]'
                                                : 'border-white/[0.10] bg-white/[0.045] hover:border-cyan-400/[0.24] hover:bg-white/[0.08]'
                                        }`}
                                    >
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:h-10 md:w-10 ${
                                                format === option.id
                                                    ? 'bg-cyan-400/[0.16] text-cyan-100'
                                                    : 'bg-white/[0.08] text-slate-400'
                                            }`}
                                        >
                                            <option.icon className="h-4 w-4 md:h-5 md:w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-100">{option.label}</p>
                                            <p className="mt-1 hidden text-xs leading-5 text-slate-400 md:block">
                                                {option.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-5">
                            <legend className="text-sm font-semibold text-white">Visual theme</legend>
                            <div className="mt-4 space-y-3">
                                {VISUAL_THEMES.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        aria-pressed={theme === option.id}
                                        aria-describedby={STUDIO_DESIGN_ACTION_STATUS_ID}
                                        onFocus={() =>
                                            announceDesignOptionFocus('Visual theme', option.label, theme === option.id)
                                        }
                                        onClick={() => {
                                            setTheme(option.id);
                                            announceDesignOptionSelected('Visual theme', option.label);
                                        }}
                                        className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-3 py-3 text-left transition-colors md:items-start md:gap-3 md:px-4 md:py-4 ${
                                            theme === option.id
                                                ? 'border-cyan-400/[0.35] bg-cyan-400/[0.12]'
                                                : 'border-white/[0.10] bg-white/[0.045] hover:border-cyan-400/[0.24] hover:bg-white/[0.08]'
                                        }`}
                                    >
                                        <div
                                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:h-10 md:w-10 ${
                                                theme === option.id
                                                    ? 'bg-cyan-400/[0.16] text-cyan-100'
                                                    : 'bg-white/[0.08] text-slate-400'
                                            }`}
                                        >
                                            <option.icon className="h-4 w-4 md:h-5 md:w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-100">{option.label}</p>
                                            <p className="mt-1 hidden text-xs leading-5 text-slate-400 md:block">
                                                {option.description}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-5">
                            <legend className="text-sm font-semibold text-white">Layout style</legend>
                            <div className="mt-4 space-y-3">
                                {LAYOUT_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        aria-pressed={layoutVariation === option.id}
                                        aria-describedby={STUDIO_DESIGN_ACTION_STATUS_ID}
                                        onFocus={() =>
                                            announceDesignOptionFocus(
                                                'Layout style',
                                                option.label,
                                                layoutVariation === option.id
                                            )
                                        }
                                        onClick={() => {
                                            setLayoutVariation(option.id);
                                            announceDesignOptionSelected('Layout style', option.label);
                                        }}
                                        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-colors md:items-start md:gap-4 md:px-4 md:py-4 ${
                                            layoutVariation === option.id
                                                ? 'border-cyan-400/[0.35] bg-cyan-400/[0.12]'
                                                : 'border-white/[0.10] bg-white/[0.045] hover:border-cyan-400/[0.24] hover:bg-white/[0.08]'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-slate-100">{option.label}</p>
                                            <p className="mt-1 hidden text-xs leading-5 text-slate-400 md:block">
                                                {option.description}
                                            </p>
                                        </div>
                                        {layoutVariation === option.id ? (
                                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/[0.16] text-cyan-100 md:h-8 md:w-8">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        ) : null}
                                    </button>
                                ))}
                            </div>
                        </fieldset>
                    </div>
                    <div
                        id={STUDIO_DESIGN_ACTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label="Studio design action status"
                        className="mt-5 rounded-lg border border-cyan-400/[0.18] bg-cyan-400/[0.08] px-4 py-3 text-sm leading-6 text-cyan-50"
                    >
                        {designActionStatus}
                    </div>
                </section>

                <section className="rounded-lg border border-white/[0.10] bg-slate-950 p-6 md:p-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-white">Hero image and locked elements</h3>
                            <p className="mt-2 text-sm leading-7 text-slate-300">
                                Choose a hero image or keep the gradient fallback. Logo, QR, and verification cues can be toggled without breaking the public-safe preview.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_320px]">
                        <div>
                            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                {filteredImages.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        aria-describedby={STUDIO_DESIGN_ACTION_STATUS_ID}
                                        onFocus={() =>
                                            announceDesignOptionFocus(
                                                'Hero image',
                                                item.label,
                                                backgroundImage === item.url
                                            )
                                        }
                                        onClick={() => {
                                            setBackgroundImage(item.url);
                                            setImageError(null);
                                            announceDesignOptionSelected('Hero image', item.label);
                                        }}
                                        className={`relative aspect-[4/4.8] overflow-hidden rounded-lg border-2 transition-all ${
                                            backgroundImage === item.url
                                                ? 'border-cyan-400'
                                                : 'border-white/[0.12] hover:border-cyan-400/[0.45]'
                                        }`}
                                    >
                                        <Image
                                            src={item.url}
                                            alt={item.label}
                                            fill
                                            sizes="(max-width: 1200px) 50vw, 320px"
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/[0.80] via-slate-950/[0.20] to-transparent px-4 pb-4 pt-10 text-left">
                                            <p className="text-sm font-semibold text-white">{item.label}</p>
                                        </div>
                                    </button>
                                ))}

                                <label className="flex aspect-[4/4.8] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/[0.18] bg-white/[0.045] px-6 text-center transition-colors hover:bg-white/[0.08]">
                                    <Upload className="h-6 w-6 text-slate-400" />
                                    <span className="mt-3 text-sm font-semibold text-slate-100">Upload custom image</span>
                                    <span className="mt-1 text-xs leading-5 text-slate-400">
                                        Room shot, device photo, or branded environment
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        aria-describedby={STUDIO_DESIGN_ACTION_STATUS_ID}
                                        onFocus={() =>
                                            setDesignActionStatus(
                                                `Custom image upload is ready for this local Studio preview. ${STUDIO_EDITOR_NO_LIVE_ACTION_COPY}`
                                            )
                                        }
                                        onClick={() =>
                                            setDesignActionStatus(
                                                `Opening custom image upload for this local Studio preview. ${STUDIO_EDITOR_NO_LIVE_ACTION_COPY}`
                                            )
                                        }
                                        onChange={handleImageUpload}
                                        className="sr-only"
                                    />
                                </label>
                            </div>

                            {imageError ? (
                                <p className="mt-3 text-xs text-rose-200">{imageError}</p>
                            ) : null}
                        </div>

                        <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-5">
                            <h4 className="text-sm font-semibold text-white">Preview elements</h4>
                            <div className="mt-4 space-y-3">
                                {[
                                    {
                                        label: 'Show QR code',
                                        description: 'Keeps the booking handoff visible in the artwork.',
                                        value: showQrCode,
                                        onChange: () => setShowQrCode(!showQrCode),
                                    },
                                    {
                                        label: 'Show clinic logo',
                                        description: 'Use the uploaded logo in the live preview and export.',
                                        value: showLogo,
                                        onChange: () => setShowLogo(!showLogo),
                                    },
                                    {
                                        label: 'Show verified badge',
                                        description: 'Keeps the Hylono brand cue visible without inventing proof.',
                                        value: showVerifiedBadge,
                                        onChange: () => setShowVerifiedBadge(!showVerifiedBadge),
                                    },
                                    {
                                        label: 'Show focus guide',
                                        description: 'Displays a visual attention overlay in the editor preview only.',
                                        value: showHeatmap,
                                        onChange: () => setShowHeatmap(!showHeatmap),
                                    },
                                ].map((toggle) => (
                                    <button
                                        key={toggle.label}
                                        type="button"
                                        aria-pressed={toggle.value}
                                        aria-describedby={STUDIO_DESIGN_ACTION_STATUS_ID}
                                        onFocus={() => announceDesignToggleFocus(toggle.label, toggle.value)}
                                        onClick={() => handleDesignToggle(toggle.label, toggle.value, toggle.onChange)}
                                        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-colors md:items-start md:gap-4 md:px-4 md:py-4 ${
                                            toggle.value
                                                ? 'border-cyan-400/[0.35] bg-cyan-400/[0.12]'
                                                : 'border-white/[0.10] bg-white/[0.045] hover:bg-white/[0.08]'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-slate-100">{toggle.label}</p>
                                            <p className="mt-1 hidden text-xs leading-5 text-slate-400 md:block">
                                                {toggle.description}
                                            </p>
                                        </div>
                                        <div
                                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                toggle.value ? 'bg-cyan-400/[0.16] text-cyan-100' : 'bg-white/[0.08] text-slate-400'
                                            }`}
                                        >
                                            {toggle.value ? <Check className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-lg border border-white/[0.10] bg-slate-950 p-6 md:p-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-white">Copy and compliance</h3>
                            <p className="mt-2 text-sm leading-7 text-slate-300">
                                Write the visible headline, support copy, and caption. The compliance panel checks for riskier language and gives you concrete rewrites.
                            </p>
                        </div>
                        <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm text-slate-300">
                            Voice selected: <span className="font-semibold text-slate-100">{VOICE_OPTIONS.find((item) => item.id === voice)?.label ?? 'Balanced'}</span>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_380px]">
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="studio-title"
                                    className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                                >
                                    Headline
                                </label>
                                <input
                                    id="studio-title"
                                    type="text"
                                    value={customTitle}
                                    aria-describedby={STUDIO_EDITOR_ACTION_STATUS_ID}
                                    onChange={(event) => setCustomTitle(event.target.value)}
                                    className="mt-2 min-h-11 w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-base font-semibold text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/[0.60] focus:bg-white/[0.08]"
                                    placeholder={suggestedCopy.title}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="studio-body"
                                    className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                                >
                                    Support copy
                                </label>
                                <textarea
                                    id="studio-body"
                                    value={customBody}
                                    aria-describedby={STUDIO_EDITOR_ACTION_STATUS_ID}
                                    onChange={(event) => setCustomBody(event.target.value)}
                                    className="mt-2 min-h-[160px] w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm leading-7 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/[0.60] focus:bg-white/[0.08]"
                                    placeholder={suggestedCopy.body}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="studio-caption"
                                    className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
                                >
                                    Social caption
                                </label>
                                <textarea
                                    id="studio-caption"
                                    value={customCaption}
                                    aria-describedby={STUDIO_EDITOR_ACTION_STATUS_ID}
                                    onChange={(event) => setCustomCaption(event.target.value)}
                                    className="mt-2 min-h-[150px] w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm leading-7 text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-cyan-400/[0.60] focus:bg-white/[0.08]"
                                    placeholder={suggestedCopy.caption}
                                />
                                <p className="mt-2 text-xs leading-5 text-slate-400">
                                    Leave this blank to use the generated caption on export. Hashtags are always provided separately.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <ChecklistCard
                                title="Export readiness"
                                description="The editor is strongest when the headline, support copy, and booking handoff all point in the same direction."
                                items={checklistItems}
                            />

                            <div
                                className={`rounded-lg border p-5 ${
                                    compliance.isValid
                                        ? 'border-emerald-400/[0.30] bg-emerald-400/[0.10]'
                                        : 'border-amber-400/[0.30] bg-amber-400/[0.10]'
                                }`}
                                aria-live="polite"
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                            compliance.isValid
                                                ? 'bg-emerald-400/[0.18] text-emerald-100'
                                                : 'bg-amber-400/[0.18] text-amber-100'
                                        }`}
                                    >
                                        {compliance.isValid ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-slate-100">
                                            {compliance.isValid ? 'Compliance check looks clear' : 'Compliance review needs attention'}
                                        </h4>
                                        <p className="mt-1 text-sm leading-6 text-slate-300">
                                            {compliance.isValid
                                                ? 'No critical or high-severity wording issues were detected in the current draft.'
                                                : 'The current draft includes terms that should be softened before public use.'}
                                        </p>
                                    </div>
                                </div>

                                {compliance.issues.length > 0 ? (
                                    <div className="mt-5 space-y-3">
                                        {compliance.issues.slice(0, 4).map((issue) => (
                                            <div
                                                key={`${issue.term}-${issue.context}`}
                                                className="rounded-lg border border-amber-400/[0.22] bg-amber-400/[0.10] px-4 py-3"
                                            >
                                                <p className="text-sm font-semibold text-amber-100">
                                                    {issue.term}
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-amber-200">
                                                    {issue.suggestion}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="rounded-lg border border-white/[0.10] bg-slate-950 p-5">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.10] pb-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                            Live preview
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                            Format-aware preview with the current brand, copy, and handoff state.
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-describedby={STUDIO_DESIGN_ACTION_STATUS_ID}
                        onFocus={() => announceDesignToggleFocus('Focus guide', showHeatmap)}
                        onClick={() =>
                            handleDesignToggle('Focus guide', showHeatmap, () => setShowHeatmap(!showHeatmap))
                        }
                        className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                            showHeatmap
                                ? 'border-amber-400/[0.50] bg-amber-400/[0.15] text-amber-200'
                                : 'border-white/[0.10] bg-white/[0.06] text-slate-200 hover:bg-white/[0.12]'
                        }`}
                    >
                        <Brain className="h-4 w-4" />
                        {showHeatmap ? 'Focus guide on' : 'Focus guide off'}
                    </button>
                </div>

                <div
                    aria-label="Editable campaign preview canvas"
                    className="mt-6 flex min-h-[420px] items-start justify-center overflow-auto rounded-lg border border-white/[0.10] bg-[#050816] p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 sm:min-h-[520px] xl:min-h-[640px]"
                    role="region"
                    tabIndex={0}
                >
                    <PreviewStage format={format} />
                </div>
            </div>
        </div>
    );
});

StepEditor.displayName = 'StepEditor';

interface StepDownloadProps {
    createCampaignHandoffAction?: NexusStudioCampaignHandoffActionRunner;
    initialPersistedCampaignHandoffs?: NexusStudioPersistedCampaignHandoff[];
    persistedCampaignHandoffsStatus?: PersistedCampaignHandoffsStatus;
    onRouteShellStatus?: (message: string) => void;
}

const StepDownload: React.FC<StepDownloadProps> = memo(({
    createCampaignHandoffAction,
    initialPersistedCampaignHandoffs = [],
    persistedCampaignHandoffsStatus = 'auth_context_missing',
    onRouteShellStatus,
}) => {
    const {
        profile,
        campaignGoal,
        format,
        modality,
        theme,
        voice,
        customTitle,
        customBody,
        customCaption,
        backgroundImage,
        showQrCode,
        showLogo,
        resetCampaign,
    } = usePartnerStore();
    const [statusMessage, setStatusMessage] = useState('Ready to export your campaign kit.');
    const [serverActionResult, setServerActionResult] =
        useState<NexusStudioCampaignHandoffActionResult | null>(null);
    const [serverActionPending, setServerActionPending] = useState(false);
    const [isExportPending, startExportTransition] = useTransition();
    const previewRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();
    const suggestedCopy = useMemo(
        () => buildSuggestedCopy({ campaignGoal, modality, voice }),
        [campaignGoal, modality, voice]
    );
    const socialCaption = customCaption.trim() || suggestedCopy.caption;
    const hashtags = suggestedCopy.hashtags;
    const activeCopy = {
        title: customTitle.trim() || suggestedCopy.title,
        body: customBody.trim() || suggestedCopy.body,
        caption: socialCaption,
        hashtags,
    };
    const readinessItems = useMemo(
        () =>
            getCampaignChecklist({
                clinicName: profile.clinicName,
                bookingUrl: profile.bookingUrl,
                customTitle: activeCopy.title,
                customBody: activeCopy.body,
                showQrCode,
        }),
        [activeCopy.body, activeCopy.title, profile.bookingUrl, profile.clinicName, showQrCode]
    );
    const completedChecklistCount = readinessItems.filter((item) => item.done).length;
    const handoffReadinessBridge = useMemo(
        () =>
            buildStudioHandoffReadinessBridge({
                format,
                campaignGoal,
                modality,
                readinessItems,
                showQrCode,
                bookingUrl: profile.bookingUrl,
                showLogo,
                logoUrl: profile.logoUrl,
                persistedHandoffCount: initialPersistedCampaignHandoffs.length,
            }),
        [
            campaignGoal,
            format,
            initialPersistedCampaignHandoffs.length,
            modality,
            profile.bookingUrl,
            profile.logoUrl,
            readinessItems,
            showLogo,
            showQrCode,
        ]
    );
    const qrUrl =
        showQrCode && profile.bookingUrl.trim()
            ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  profile.bookingUrl
              )}`
            : undefined;

    const buildDocument = (targetFormat: CampaignFormat) => {
        const props = {
            clinicName: profile.clinicName.trim() || 'Your clinic',
            brandColor: normalizeHexColor(profile.brandColor),
            title: activeCopy.title,
            body: activeCopy.body,
            modality,
            logoUrl: showLogo ? profile.logoUrl : undefined,
            qrCodeUrl: qrUrl,
            backgroundImage,
            theme,
        };

        if (targetFormat === 'social-square') {
            return <SocialSquareTemplate {...props} />;
        }

        if (targetFormat === 'social-story') {
            return <SocialStoryTemplate {...props} />;
        }

        return <A4PosterTemplate {...props} />;
    };

    const runExportTask = (task: () => Promise<void>) => {
        startExportTransition(() => {
            void task();
        });
    };

    const buildCampaignHandoffFormData = () => {
        const formData = new FormData();
        formData.set('campaignGoal', campaignGoal);
        formData.set('format', format);
        formData.set('modality', modality);
        formData.set('theme', theme);
        formData.set('voice', voice);
        formData.set('checklistTotal', String(readinessItems.length));
        formData.set('checklistComplete', String(completedChecklistCount));
        formData.set('assetFormatCount', String(STUDIO_CAMPAIGN_PACK_ASSET_COUNT));
        formData.set('qrEnabled', String(showQrCode));
        formData.set('logoIncluded', String(Boolean(showLogo && profile.logoUrl)));
        return formData;
    };

    const runCampaignHandoffBoundary = async (
        runner: NexusStudioCampaignHandoffActionRunner | undefined,
        formData: FormData
    ) => {
        if (!runner) {
            return;
        }

        setServerActionPending(true);

        try {
            const result = await runner(INITIAL_NEXUS_STUDIO_ACTION_STATE, formData);
            setServerActionResult(result);
            setStatusMessage(result.message);
        } catch {
            const fallback: NexusStudioCampaignHandoffActionResult = {
                success: false,
                status: 'validation_error',
                message: 'Studio campaign handoff boundary could not be checked from this browser preview.',
                persisted: false,
                futureTable: null,
                persistenceMode: 'blocked',
            };
            setServerActionResult(fallback);
            setStatusMessage(fallback.message);
        } finally {
            setServerActionPending(false);
        }
    };

    const handleSendCampaignHandoff = () => {
        trackStudioAction('campaign_handoff_sent', {
            step: 3,
            format,
            modality,
            campaign_goal: campaignGoal,
            checklist_total: readinessItems.length,
            checklist_complete: completedChecklistCount,
            checklist_incomplete: handoffReadinessBridge.checklistIncomplete,
            asset_format_count: STUDIO_CAMPAIGN_PACK_ASSET_COUNT,
            qr_enabled: showQrCode,
            qr_handoff_ready: handoffReadinessBridge.qrHandoffReady,
            logo_included: Boolean(showLogo && profile.logoUrl),
            persisted_handoff_count: handoffReadinessBridge.persistedHandoffCount,
            handoff_readiness_status: handoffReadinessBridge.handoffReadinessStatus,
        });
        void runCampaignHandoffBoundary(
            createCampaignHandoffAction,
            buildCampaignHandoffFormData()
        );
    };

    const handleDownloadCurrentPdf = () => {
        trackStudioAction('download_current_pdf', {
            step: 3,
            format,
            modality,
            campaign_goal: campaignGoal,
        });
        runExportTask(async () => {
            if (isAutomatedExportCheck()) {
                setStatusMessage(
                    'Current PDF export request recorded. File generation is skipped in automated browser checks.'
                );
                return;
            }

            try {
                const fileBase = `${slugify(profile.clinicName || 'hylono-studio')}-${format}`;
                const blob = await pdf(buildDocument(format)).toBlob();
                downloadBlob(blob, `${fileBase}.pdf`);
                setStatusMessage('Current PDF export downloaded successfully.');
            } catch {
                setStatusMessage('The PDF export failed. Check the selected assets and try again.');
            }
        });
    };

    const handleDownloadPreviewImage = (kind: 'png' | 'jpg') => {
        trackStudioAction('download_preview_image', {
            step: 3,
            format,
            image_kind: kind,
            modality,
            campaign_goal: campaignGoal,
        });
        runExportTask(async () => {
            if (isAutomatedExportCheck()) {
                setStatusMessage(
                    `${kind.toUpperCase()} preview export request recorded. File generation is skipped in automated browser checks.`
                );
                return;
            }

            const node = previewRef.current;

            if (!node) {
                setStatusMessage('The preview is not ready yet. Try again in a moment.');
                return;
            }

            try {
                const fileBase = `${slugify(profile.clinicName || 'hylono-studio')}-${format}`;
                const dataUrl =
                    kind === 'png'
                        ? await toPng(node, { cacheBust: true, pixelRatio: 2.2 })
                        : await toJpeg(node, { cacheBust: true, pixelRatio: 2, quality: 0.94 });

                downloadDataUrl(dataUrl, `${fileBase}.${kind}`);
                setStatusMessage(`${kind.toUpperCase()} preview downloaded successfully.`);
            } catch {
                setStatusMessage(
                    'The image export failed. If remote assets were just changed, wait a moment and try again.'
                );
            }
        });
    };

    const handleDownloadCampaignPack = () => {
        trackStudioAction('download_campaign_pack', {
            step: 3,
            format,
            modality,
            campaign_goal: campaignGoal,
        });
        runExportTask(async () => {
            if (isAutomatedExportCheck()) {
                setStatusMessage(
                    'Campaign pack export request recorded. File generation is skipped in automated browser checks.'
                );
                return;
            }

            try {
                const baseName = slugify(profile.clinicName || 'hylono-studio');
                const formats: CampaignFormat[] = [
                    'social-square',
                    'social-story',
                    'print-poster',
                ];

                for (const targetFormat of formats) {
                    const blob = await pdf(buildDocument(targetFormat)).toBlob();
                    downloadBlob(blob, `${baseName}-${targetFormat}.pdf`);
                }

                const textBlob = new Blob(
                    [
                        `${activeCopy.caption}\n\n${activeCopy.hashtags}\n\nStudio note:\n${getModalityDisclaimer(
                            modality
                        )}`,
                    ],
                    { type: 'text/plain;charset=utf-8' }
                );
                downloadBlob(textBlob, `${baseName}-caption-kit.txt`);

                setStatusMessage(
                    'Campaign pack downloaded: three PDFs plus the caption handoff text file.'
                );
            } catch {
                setStatusMessage('The campaign pack failed to download. Try the single-format exports first.');
            }
        });
    };

    const handleCopyCaption = async () => {
        trackStudioAction('copy_caption', {
            step: 3,
            format,
            modality,
            campaign_goal: campaignGoal,
        });
        try {
            await navigator.clipboard.writeText(`${activeCopy.caption}\n\n${activeCopy.hashtags}`);
            setStatusMessage('Caption and hashtags copied to the clipboard.');
        } catch {
            setStatusMessage('Clipboard access is unavailable here. Select the caption manually.');
        }
    };

    return (
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="space-y-6">
                <section className="rounded-lg border border-white/[0.10] bg-slate-950 p-6 md:p-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                                Step 3
                            </p>
                            <h2 className="mt-2 font-sans text-xl font-semibold text-white md:text-2xl">
                                Export the asset kit and hand off a campaign your team can actually use.
                            </h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                                This final step packages the current draft for social, print, and operator handoff. The page remains in sample mode, but the exported files are production-shaped and ready for review.
                            </p>
                        </div>
                        <button
                            type="button"
                            aria-describedby={STUDIO_ROUTE_RESET_STATUS_ID}
                            onClick={() => {
                                trackStudioAction('start_another_draft', {
                                    step: 3,
                                });
                                resetCampaign();
                                onRouteShellStatus?.(
                                    'Started another Studio draft in preview. The campaign builder returned to setup without creating a live campaign, booking request, CRM send, or provider handoff.'
                                );
                            }}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08]"
                        >
                            <RefreshCcw className="h-4 w-4" />
                            Start another draft
                        </button>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.75fr)]">
                        <div className="rounded-lg border border-white/[0.10] bg-slate-950 p-5">
                            <div className="flex items-center justify-between gap-3 border-b border-white/[0.10] pb-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                                        Final preview
                                    </p>
                                    <p className="mt-1 text-sm text-slate-300">
                                        Current export target: {getFormatSpec(format).label}.
                                    </p>
                                </div>
                                <div className="rounded-lg border border-white/[0.10] bg-white/[0.06] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                                    {prefersReducedMotion ? 'Reduced motion' : 'Standard motion'}
                                </div>
                            </div>

                            <div
                                aria-label="Export campaign preview canvas"
                                className="mt-6 flex min-h-[380px] items-start justify-center overflow-auto rounded-lg border border-white/[0.10] bg-[#050816] p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 sm:min-h-[460px] lg:min-h-[560px]"
                                role="region"
                                tabIndex={0}
                            >
                                <PreviewStage format={format} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <ChecklistCard
                                title="Final handoff check"
                                description="This confirms the campaign is branded, clear, and ready to move into export."
                                items={readinessItems}
                            />

                            <div
                                aria-label="Studio campaign handoff readiness bridge"
                                className="rounded-lg border border-cyan-400/[0.22] bg-cyan-400/[0.10] p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/[0.16] text-cyan-100">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                                            Handoff readiness bridge
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-cyan-50">
                                            Aggregate route state for export review before private storage is checked.
                                        </p>
                                    </div>
                                </div>

                                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                    <div
                                        aria-label={`Studio handoff format: ${handoffReadinessBridge.formatLabel}`}
                                        className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3"
                                    >
                                        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                            Format
                                        </dt>
                                        <dd className="mt-1 font-bold text-white">
                                            {handoffReadinessBridge.formatLabel}
                                        </dd>
                                    </div>
                                    <div
                                        aria-label={`Studio checklist complete: ${handoffReadinessBridge.checklistComplete} of ${handoffReadinessBridge.checklistTotal}`}
                                        className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3"
                                    >
                                        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                            Checks
                                        </dt>
                                        <dd className="mt-1 font-bold text-white">
                                            {handoffReadinessBridge.checklistComplete}/{handoffReadinessBridge.checklistTotal}
                                        </dd>
                                    </div>
                                    <div
                                        aria-label={`Studio campaign assets: ${handoffReadinessBridge.assetFormatCount}`}
                                        className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3"
                                    >
                                        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                            Assets
                                        </dt>
                                        <dd className="mt-1 font-bold text-white">
                                            {handoffReadinessBridge.assetFormatCount}
                                        </dd>
                                    </div>
                                    <div
                                        aria-label={`Studio QR handoff: ${handoffReadinessBridge.qrHandoffReady ? 'ready' : 'not ready'}`}
                                        className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3"
                                    >
                                        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                            QR
                                        </dt>
                                        <dd className="mt-1 font-bold text-white">
                                            {handoffReadinessBridge.qrHandoffReady ? 'Ready' : 'Not ready'}
                                        </dd>
                                    </div>
                                    <div
                                        aria-label={`Studio logo included: ${handoffReadinessBridge.logoIncluded ? 'yes' : 'no'}`}
                                        className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3"
                                    >
                                        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                            Logo
                                        </dt>
                                        <dd className="mt-1 font-bold text-white">
                                            {handoffReadinessBridge.logoIncluded ? 'Yes' : 'No'}
                                        </dd>
                                    </div>
                                    <div
                                        aria-label={`Persisted studio handoffs: ${handoffReadinessBridge.persistedHandoffCount}`}
                                        className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3"
                                    >
                                        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                            History
                                        </dt>
                                        <dd className="mt-1 font-bold text-white">
                                            {handoffReadinessBridge.persistedHandoffCount}
                                        </dd>
                                    </div>
                                    <div
                                        aria-label="Studio handoff privacy: Aggregate only"
                                        className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3"
                                    >
                                        <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                            Privacy
                                        </dt>
                                        <dd className="mt-1 font-bold text-white">
                                            Aggregate only
                                        </dd>
                                    </div>
                                </dl>
                                <p className="mt-4 rounded-lg bg-cyan-400/[0.12] p-3 text-sm font-semibold leading-6 text-cyan-50">
                                    {handoffReadinessBridge.handoffReadinessStatus}
                                </p>
                            </div>

                            <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/[0.16] text-cyan-100">
                                        <Download className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">Export actions</h3>
                                        <p className="mt-1 text-sm leading-6 text-slate-300">
                                            Download the current format, export a visual preview, or generate the multi-format campaign pack.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        aria-describedby={STUDIO_EXPORT_ACTION_STATUS_ID}
                                        onClick={handleDownloadCurrentPdf}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.16] px-4 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/[0.22]"
                                    >
                                        {isExportPending ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <FileText className="h-4 w-4" />
                                        )}
                                        Download current PDF
                                    </button>
                                    <button
                                        type="button"
                                        aria-describedby={STUDIO_EXPORT_ACTION_STATUS_ID}
                                        onClick={() => handleDownloadPreviewImage('png')}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08]"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                        Download PNG
                                    </button>
                                    <button
                                        type="button"
                                        aria-describedby={STUDIO_EXPORT_ACTION_STATUS_ID}
                                        onClick={() => handleDownloadPreviewImage('jpg')}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08]"
                                    >
                                        <Smartphone className="h-4 w-4" />
                                        Download JPG
                                    </button>
                                    <button
                                        type="button"
                                        aria-describedby={STUDIO_EXPORT_ACTION_STATUS_ID}
                                        onClick={handleDownloadCampaignPack}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.12] px-4 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/[0.20]"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        Download campaign pack
                                    </button>
                                    <button
                                        type="button"
                                        aria-describedby={STUDIO_EXPORT_ACTION_STATUS_ID}
                                        onClick={handleSendCampaignHandoff}
                                        disabled={!createCampaignHandoffAction || serverActionPending}
                                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-400/[0.28] bg-emerald-400/[0.12] px-4 py-3 text-sm font-semibold text-emerald-50 transition-colors hover:bg-emerald-400/[0.20] disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
                                    >
                                        {serverActionPending ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ShieldCheck className="h-4 w-4" />
                                        )}
                                        Send campaign handoff
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/[0.16] text-emerald-100">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white">
                                            Authenticated handoff storage
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-slate-300">
                                            {PERSISTED_CAMPAIGN_HANDOFFS_STATUS_COPY[persistedCampaignHandoffsStatus]}
                                        </p>
                                        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Private boundary stores format, modality, readiness counts, and toggle states only.
                                        </p>
                                    </div>
                                </div>

                                {serverActionResult ? (
                                    <div
                                        role="status"
                                        className="mt-4 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3"
                                    >
                                        <p className="text-sm font-semibold text-slate-100">
                                            {STUDIO_ACTION_STATUS_LABELS[serverActionResult.status]}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-300">
                                            {serverActionResult.message}
                                        </p>
                                        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                            Future table: {serverActionResult.futureTable ?? 'none'} | Persisted:{' '}
                                            {serverActionResult.persisted ? 'yes' : 'no'}
                                        </p>
                                    </div>
                                ) : null}

                                {initialPersistedCampaignHandoffs.length > 0 ? (
                                    <div className="mt-4 rounded-lg border border-white/[0.10] bg-white/[0.045] p-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                            Authenticated handoff queue
                                        </p>
                                        <div className="mt-3 space-y-2">
                                            {initialPersistedCampaignHandoffs.slice(0, 3).map((handoff) => (
                                                <div
                                                    key={handoff.id}
                                                    className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3 text-xs text-slate-300"
                                                >
                                                    <p className="font-semibold text-slate-100">
                                                        {handoff.format} / {handoff.modality}
                                                    </p>
                                                    <p className="mt-1">
                                                        {handoff.checklistComplete}/{handoff.checklistTotal} checks,
                                                        {handoff.assetFormatCount} assets, {handoff.createdAtLabel}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="space-y-6">
                <div className="rounded-lg border border-white/[0.10] bg-slate-950 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Social handoff
                            </p>
                            <h3 className="mt-2 text-xl font-semibold text-white">
                                Caption and hashtags
                            </h3>
                        </div>
                        <button
                            type="button"
                            aria-describedby={STUDIO_EXPORT_ACTION_STATUS_ID}
                            onClick={handleCopyCaption}
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08]"
                        >
                            <Copy className="h-4 w-4" />
                            Copy text
                        </button>
                    </div>

                    <textarea
                        aria-label="Social caption and hashtags"
                        aria-describedby={STUDIO_EXPORT_ACTION_STATUS_ID}
                        readOnly
                        value={`${activeCopy.caption}\n\n${activeCopy.hashtags}`}
                        className="mt-5 min-h-[280px] w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-4 text-sm leading-7 text-slate-100 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    />

                    <div className="mt-5 rounded-lg border border-fuchsia-400/[0.22] bg-fuchsia-400/[0.10] px-4 py-4">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-400/[0.16] text-fuchsia-100">
                                <Brain className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-fuchsia-100">Posting note</p>
                                <p className="mt-1 text-xs leading-6 text-slate-300">
                                    Match the caption to the chosen format. Use the square asset for feed, the vertical asset for story, and the poster for in-clinic handoff. Keep the booking link consistent with the QR destination.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    id={STUDIO_EXPORT_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-label="Studio export action status"
                    className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-6"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/[0.16] text-emerald-100">
                            <Link2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-white">Export status</h3>
                            <p className="mt-1 text-sm leading-6 text-slate-300">{statusMessage}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-white/[0.10] bg-slate-950 p-6 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                        Support and next step
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                        The page now provides a complete sample workflow, but if a real clinic needs onboarding, account setup, or rollout support, continue through the standard Hylono partner contact path.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/contact"
                            aria-describedby={STUDIO_EXPORT_ACTION_STATUS_ID}
                            onClick={() =>
                                trackStudioAction('contact_hylono', {
                                    step: 3,
                                    destination: '/contact',
                                })
                            }
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.16] px-4 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/[0.22]"
                        >
                            Contact Hylono
                            <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                            href={accessHref}
                            aria-describedby={STUDIO_EXPORT_ACTION_STATUS_ID}
                            onClick={() =>
                                trackStudioAction('sign_in_later', {
                                    step: 3,
                                    destination: accessHref,
                                })
                            }
                            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.15] bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]"
                        >
                            Sign in later
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none fixed left-[-10000px] top-0 opacity-0" aria-hidden="true">
                <LivePreviewHTML ref={previewRef} />
            </div>
        </div>
    );
});

StepDownload.displayName = 'StepDownload';

interface CreativeAssetPreset {
    id: string;
    title: string;
    description: string;
    badgeCategory: 'social' | 'campaign' | 'print';
    badgeLabel: string;
    format: CampaignFormat;
    modality: Modality;
    goal: CampaignGoal;
    theme: 'modern' | 'luxury' | 'bold';
    voice: CampaignVoice;
    image: string;
    dimensions: string;
}

const CREATIVE_ASSET_PRESETS: CreativeAssetPreset[] = [
    {
        id: 'hbot-social-square',
        title: 'Hyperbaric Oxygen Vitality',
        description: 'Clean feed post engineered for high client engagement with calm, compliant recovery messaging.',
        badgeCategory: 'social',
        badgeLabel: 'Social · 1080×1080',
        format: 'social-square',
        modality: 'HBOT',
        goal: 'promotion',
        theme: 'modern',
        voice: 'balanced',
        image: '/images/chambers/hbot-redesign/hero-chamber.png',
        dimensions: '1080 × 1080 px',
    },
    {
        id: 'pemf-social-story',
        title: 'Cellular Recharge Story',
        description: 'Full-height mobile story format focused on pulsed electromagnetic recovery routines.',
        badgeCategory: 'social',
        badgeLabel: 'Social · 1080×1920',
        format: 'social-story',
        modality: 'PEMF',
        goal: 'education',
        theme: 'modern',
        voice: 'clinical',
        image: '/images/blog/card-pemf.jpg',
        dimensions: '1080 × 1920 px',
    },
    {
        id: 'rlt-campaign-pack',
        title: 'Photobiomodulation Launch Kit',
        description: 'Omni-channel launch bundle introducing clinical red light therapy and skin-deep wellness.',
        badgeCategory: 'campaign',
        badgeLabel: 'Campaign · Kit',
        format: 'social-square',
        modality: 'RLT',
        goal: 'launch',
        theme: 'luxury',
        voice: 'luxury',
        image: '/images/blog/card-rlt.jpg',
        dimensions: 'Multi-Format Pack',
    },
    {
        id: 'hydrogen-campaign-pack',
        title: 'Molecular Hydrogen Suite',
        description: 'Coordinated cross-platform campaign kit promoting guided inhalation and antioxidant support.',
        badgeCategory: 'campaign',
        badgeLabel: 'Campaign · Omni',
        format: 'social-story',
        modality: 'Hydrogen',
        goal: 'promotion',
        theme: 'modern',
        voice: 'balanced',
        image: '/images/blog/card-hydrogen.jpg',
        dimensions: 'Complete Bundle',
    },
    {
        id: 'hbot-print-poster',
        title: 'Chamber Suite Reception Poster',
        description: 'High-DPI A4-ready poster for clinic waiting lounges, consultation rooms, and front desks.',
        badgeCategory: 'print',
        badgeLabel: 'Print · A4 Collateral',
        format: 'print-poster',
        modality: 'HBOT',
        goal: 'education',
        theme: 'luxury',
        voice: 'clinical',
        image: '/images/blog/card-hbot.jpg',
        dimensions: 'A4 · 900 × 1273 px',
    },
    {
        id: 'pemf-print-poster',
        title: 'Recovery Open Day Brochure Card',
        description: 'In-clinic invitation card highlighting operator demonstrations and community open days.',
        badgeCategory: 'print',
        badgeLabel: 'Print · Counter Card',
        format: 'print-poster',
        modality: 'PEMF',
        goal: 'event',
        theme: 'modern',
        voice: 'balanced',
        image: '/images/chambers/hbot-redesign/pair-pemf.png',
        dimensions: 'A4 · 900 × 1273 px',
    },
];

const STUDIO_PRESET_ACTION_STATUS_ID = 'studio-preset-action-status';

const CreativeAssetGrid: React.FC<{
    onApplyPreset: (preset: CreativeAssetPreset) => void;
    activeFormat?: CampaignFormat;
    activeModality?: Modality;
}> = ({ onApplyPreset, activeFormat, activeModality }) => {
    const [categoryFilter, setCategoryFilter] = useState<'all' | 'social' | 'campaign' | 'print'>('all');

    const filteredPresets = useMemo(() => {
        if (categoryFilter === 'all') {
            return CREATIVE_ASSET_PRESETS;
        }
        return CREATIVE_ASSET_PRESETS.filter((item) => item.badgeCategory === categoryFilter);
    }, [categoryFilter]);

    return (
        <section aria-label="Creative Asset Showcase" className="space-y-6">
            <p id={STUDIO_PRESET_ACTION_STATUS_ID} role="status" aria-live="polite" className="sr-only">
                {`Showing ${filteredPresets.length} creative templates for luxury clinic branding.`}
            </p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/[0.30] bg-cyan-400/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        <Sparkles className="h-3.5 w-3.5" />
                        Curated Asset Gallery
                    </div>
                    <h2 className="mt-2 font-sans text-xl font-bold tracking-tight text-white md:text-2xl">
                        Clinical Campaign Templates & Collateral
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-300 md:text-sm">
                        Pre-configured visual layouts tailored for luxury clinic branding. Select any asset to load it directly into the Studio editor.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filter creative templates">
                    <button
                        type="button"
                        role="tab"
                        aria-describedby={STUDIO_PRESET_ACTION_STATUS_ID}
                        aria-selected={categoryFilter === 'all'}
                        onClick={() => setCategoryFilter('all')}
                        className={`min-h-11 rounded-lg border px-3.5 py-2 text-xs font-semibold tracking-wider uppercase transition-colors motion-reduce:transition-none ${
                            categoryFilter === 'all'
                                ? 'border-cyan-400/[0.50] bg-cyan-400/[0.16] text-cyan-50'
                                : 'border-white/[0.10] bg-white/[0.045] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                    >
                        All Templates ({CREATIVE_ASSET_PRESETS.length})
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-describedby={STUDIO_PRESET_ACTION_STATUS_ID}
                        aria-selected={categoryFilter === 'social'}
                        onClick={() => setCategoryFilter('social')}
                        className={`min-h-11 inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold tracking-wider uppercase transition-colors motion-reduce:transition-none ${
                            categoryFilter === 'social'
                                ? 'border-[#f43f5e]/[0.50] bg-[#f43f5e]/[0.16] text-rose-100'
                                : 'border-white/[0.10] bg-white/[0.045] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                    >
                        <span className="h-2 w-2 rounded-sm bg-[#f43f5e]" />
                        Social Media (2)
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-describedby={STUDIO_PRESET_ACTION_STATUS_ID}
                        aria-selected={categoryFilter === 'campaign'}
                        onClick={() => setCategoryFilter('campaign')}
                        className={`min-h-11 inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold tracking-wider uppercase transition-colors motion-reduce:transition-none ${
                            categoryFilter === 'campaign'
                                ? 'border-[#a855f7]/[0.50] bg-[#a855f7]/[0.16] text-purple-100'
                                : 'border-white/[0.10] bg-white/[0.045] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                    >
                        <span className="h-2 w-2 rounded-sm bg-[#a855f7]" />
                        Campaign Kits (2)
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-describedby={STUDIO_PRESET_ACTION_STATUS_ID}
                        aria-selected={categoryFilter === 'print'}
                        onClick={() => setCategoryFilter('print')}
                        className={`min-h-11 inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold tracking-wider uppercase transition-colors motion-reduce:transition-none ${
                            categoryFilter === 'print'
                                ? 'border-cyan-400/[0.50] bg-cyan-400/[0.16] text-cyan-50'
                                : 'border-white/[0.10] bg-white/[0.045] text-slate-300 hover:bg-white/[0.08]'
                        }`}
                    >
                        <span className="h-2 w-2 rounded-sm bg-[#06b6d4]" />
                        Print Collateral (2)
                    </button>
                </div>
            </div>

            {/* Asset Cards Grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredPresets.map((preset) => {
                    const isActive = activeFormat === preset.format && activeModality === preset.modality;

                    return (
                        <div
                            key={preset.id}
                            className={`group flex flex-col justify-between overflow-hidden rounded-lg border transition-all ${
                                isActive
                                    ? 'border-cyan-400/[0.60] bg-white/[0.07] ring-1 ring-cyan-400/[0.40]'
                                    : 'border-white/[0.10] bg-white/[0.045] hover:border-cyan-400/[0.35] hover:bg-white/[0.07]'
                            }`}
                        >
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                                <Image
                                    src={preset.image}
                                    alt={preset.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/[0.85] via-slate-950/[0.25] to-transparent" />

                                {/* Top Badges */}
                                <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
                                    {preset.badgeCategory === 'social' ? (
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-[#f43f5e]/[0.25] bg-[#f43f5e]/[0.10] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#f43f5e] backdrop-blur-sm">
                                            {preset.badgeLabel}
                                        </span>
                                    ) : preset.badgeCategory === 'campaign' ? (
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-[#a855f7]/[0.25] bg-[#a855f7]/[0.10] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c084fc] backdrop-blur-sm">
                                            {preset.badgeLabel}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/[0.25] bg-cyan-400/[0.10] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200 backdrop-blur-sm">
                                            {preset.badgeLabel}
                                        </span>
                                    )}

                                    <span className="inline-flex items-center rounded-lg border border-white/[0.15] bg-slate-950/[0.60] px-2 py-0.5 text-[10px] font-semibold text-slate-200 backdrop-blur-sm">
                                        {preset.modality}
                                    </span>
                                </div>

                                {/* Bottom Dimension Label */}
                                <div className="absolute bottom-2.5 left-3">
                                    <span className="text-[11px] font-mono tracking-wider text-slate-300">
                                        {preset.dimensions}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col justify-between p-5">
                                <div>
                                    <h3 className="text-base font-bold text-white transition-colors group-hover:text-cyan-200">
                                        {preset.title}
                                    </h3>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                                        {preset.description}
                                    </p>
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-4">
                                    <span className="text-[11px] uppercase tracking-wider text-slate-400">
                                        Goal: <span className="font-semibold text-slate-200">{preset.goal}</span>
                                    </span>

                                    <button
                                        type="button"
                                        aria-describedby={STUDIO_PRESET_ACTION_STATUS_ID}
                                        onClick={() => onApplyPreset(preset)}
                                        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-cyan-300/[0.28] bg-cyan-400/[0.16] px-3.5 py-2 text-xs font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/[0.24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 motion-reduce:transition-none"
                                    >
                                        <span>Load in Studio</span>
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

interface PartnerStudioProps {
    startFresh?: boolean;
    createCampaignHandoffAction?: NexusStudioCampaignHandoffActionRunner;
    initialPersistedCampaignHandoffs?: NexusStudioPersistedCampaignHandoff[];
    persistedCampaignHandoffsStatus?: PersistedCampaignHandoffsStatus;
}

export const PartnerStudio: React.FC<PartnerStudioProps> = ({
    startFresh = false,
    createCampaignHandoffAction,
    initialPersistedCampaignHandoffs = [],
    persistedCampaignHandoffsStatus = 'auth_context_missing',
}) => {
    const router = useRouter();
    const pathname = usePathname() ?? STUDIO_ROUTE;
    const prefersReducedMotion = useReducedMotion();
    const {
        currentStep,
        nextStep,
        prevStep,
        setStep,
        resetCampaign,
        setModality,
        setCampaignGoal,
        setFormat,
        setTheme,
        setVoice,
        setBackgroundImage,
        format,
        modality,
    } = usePartnerStore();
    const [resetNotice, setResetNotice] = useState<string | null>(null);
    const handledStartFreshRef = useRef(false);

    useEffect(() => {
        if (!startFresh) {
            handledStartFreshRef.current = false;
            return;
        }

        if (handledStartFreshRef.current) {
            return;
        }

        handledStartFreshRef.current = true;
        resetCampaign();
        setResetNotice(
            'Studio draft reset from route request. The public preview is cleared locally; sign in before changing live campaign records.'
        );
        router.replace(pathname, { scroll: false });
    }, [pathname, resetCampaign, router, startFresh]);

    const handleApplyPreset = (preset: CreativeAssetPreset) => {
        trackStudioAction('apply_creative_preset', {
            preset_id: preset.id,
            modality: preset.modality,
            format: preset.format,
            goal: preset.goal,
        });
        setModality(preset.modality);
        setCampaignGoal(preset.goal);
        setFormat(preset.format);
        setTheme(preset.theme);
        setVoice(preset.voice);
        setBackgroundImage(preset.image);
        setStep(2);
        setResetNotice(
            `Loaded "${preset.title}" template into Studio editor. The asset is ready for copy fine-tuning and compliance check.`
        );
    };

    const steps = [
        {
            id: 1,
            label: 'Campaign setup',
            description: 'Brand, modality, goal, and voice direction.',
            icon: Megaphone,
        },
        {
            id: 2,
            label: 'Studio editor',
            description: 'Layout, copy, compliance, and preview.',
            icon: Palette,
        },
        {
            id: 3,
            label: 'Export and handoff',
            description: 'Files, captions, and campaign pack output.',
            icon: Download,
        },
    ] as const;
    const activeStep = steps.find((step) => step.id === currentStep) ?? steps[0]!;

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepIntent />;
            case 2:
                return <StepEditor />;
            case 3:
                return (
                    <StepDownload
                        createCampaignHandoffAction={createCampaignHandoffAction}
                        initialPersistedCampaignHandoffs={initialPersistedCampaignHandoffs}
                        persistedCampaignHandoffsStatus={persistedCampaignHandoffsStatus}
                        onRouteShellStatus={setResetNotice}
                    />
                );
            default:
                return <StepIntent />;
        }
    };

    return (
        <PartnerLayout title="Studio">
            <div className="mx-auto flex w-full max-w-[1360px] flex-col gap-6">
                {/* Public sample boundary note required for compliance */}
                <div
                    role="note"
                    aria-label="Nexus public route boundary: sample workspace tour without live clinic records"
                    className="sr-only"
                >
                    Sample workspace tour without live clinic records. No live clinic records are shown.
                    Choose a module. Move to account access. Escalate setup or support.
                </div>

                <motion.section
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-lg border border-white/[0.10] bg-slate-950/[0.60]"
                >
                    {/* Background Clinic Interior Photo Overlay */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <Image
                            src="/images/nexus/nexus-hero-clinic.jpg"
                            alt="Hylono Clinical Marketing Suite"
                            fill
                            priority
                            sizes="100vw"
                            className="object-cover object-right-top opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/[0.95] via-slate-950/[0.80] to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 px-6 py-8 md:px-8">
                        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                            <div className="max-w-4xl">
                                <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-400/[0.30] bg-cyan-400/[0.10] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                                    <BadgeCheck className="h-3.5 w-3.5" />
                                    Nexus Studio sample workspace
                                </div>
                                <h1 className="mt-4 max-w-3xl font-sans text-lg font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
                                    Build a clinic campaign that feels polished without overwhelming the workflow.
                                </h1>
                                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                                    Nexus Studio stays a public-safe sample workspace, but the working area is now
                                    focused on one thing at a time: setup, editing, and export. The page keeps the
                                    existing page contract while giving the active step much more room.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    aria-describedby={STUDIO_ROUTE_RESET_STATUS_ID}
                                    onClick={() => {
                                        trackStudioAction('start_fresh', {
                                            step: currentStep,
                                        });
                                        resetCampaign();
                                        setResetNotice(
                                            'Studio draft reset in preview. Sign in before changing live campaign records.'
                                        );
                                    }}
                                    className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-cyan-300/[0.28] bg-cyan-400/[0.16] px-4 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/[0.22] motion-reduce:transition-none"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Start fresh
                                </button>
                                <Link
                                    href="/contact"
                                    aria-describedby={STUDIO_ROUTE_RESET_STATUS_ID}
                                    onFocus={() =>
                                        setResetNotice(
                                            'Contact Hylono route support link is ready. It opens the contact page without creating a live campaign, booking request, CRM send, or provider handoff.'
                                        )
                                    }
                                    onClick={() => {
                                        trackStudioAction('contact_hylono', {
                                            step: currentStep,
                                            destination: '/contact',
                                        });
                                        setResetNotice(
                                            'Opening Hylono contact from the Studio route shell. No live campaign, booking request, CRM send, or provider handoff was created.'
                                        );
                                    }}
                                    className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] motion-reduce:transition-none"
                                >
                                    Contact Hylono
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Clinical Studio KPI Overview Bar */}
                        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Output Formats</span>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/[0.16] text-cyan-100">
                                        <LayoutTemplate className="h-3 w-3" />
                                    </div>
                                </div>
                                <p className="mt-2 text-lg font-bold text-white">3 Formats</p>
                                <p className="text-[10px] text-slate-400">Square, Story & A4</p>
                            </div>

                            <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Modalities</span>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#a855f7]/[0.16] text-purple-200">
                                        <Sparkles className="h-3 w-3" />
                                    </div>
                                </div>
                                <p className="mt-2 text-lg font-bold text-white">4 Suites</p>
                                <p className="text-[10px] text-slate-400">HBOT, PEMF, RLT, H2</p>
                            </div>

                            <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Compliance</span>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-400/[0.16] text-emerald-100">
                                        <ShieldCheck className="h-3 w-3" />
                                    </div>
                                </div>
                                <p className="mt-2 text-lg font-bold text-white">Public Safe</p>
                                <p className="text-[10px] text-slate-400">Real-time phrase check</p>
                            </div>

                            <div className="rounded-lg border border-white/[0.10] bg-white/[0.045] p-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Asset Export</span>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-400/[0.16] text-cyan-100">
                                        <Download className="h-3 w-3" />
                                    </div>
                                </div>
                                <p className="mt-2 text-lg font-bold text-white">Kit Ready</p>
                                <p className="text-[10px] text-slate-400">PDF, Raster & Captions</p>
                            </div>
                        </div>

                        <div
                            id={STUDIO_ROUTE_RESET_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label={STUDIO_ROUTE_RESET_STATUS_LABEL}
                            className="mt-5 rounded-lg border border-cyan-400/[0.30] bg-cyan-400/[0.10] px-4 py-3 text-sm font-semibold text-cyan-100"
                        >
                            {resetNotice ??
                                'Studio draft ready in preview. Use Start fresh or the workflow steps to update this local-only status.'}
                        </div>
                    </div>

                    {/* Creative Asset Showcase Grid */}
                    <div className="border-t border-white/[0.10] px-6 py-6 md:px-8">
                        <CreativeAssetGrid
                            onApplyPreset={handleApplyPreset}
                            activeFormat={format}
                            activeModality={modality}
                        />
                    </div>

                    <div className="border-t border-white/[0.10] px-6 py-5 md:px-8">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <nav className="grid grid-cols-3 gap-2 md:gap-3" aria-label="Studio workflow">
                                {steps.map((step) => {
                                    const active = currentStep === step.id;
                                    const complete = currentStep > step.id;

                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            aria-current={active ? 'step' : undefined}
                                            aria-describedby={STUDIO_ROUTE_RESET_STATUS_ID}
                                            onClick={() => {
                                                trackStudioAction('workflow_step_selected', {
                                                    from_step: currentStep,
                                                    to_step: step.id,
                                                });
                                                setResetNotice(
                                                    `${step.label} step selected in preview. Continue editing before export handoff.`
                                                );
                                                setStep(step.id);
                                            }}
                                            className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-3 py-3 text-left transition-colors motion-reduce:transition-none md:items-start md:gap-3 md:px-4 md:py-4 ${
                                                active
                                                    ? 'border-cyan-400/[0.50] bg-cyan-400/[0.10]'
                                                    : 'border-white/[0.10] bg-white/[0.045] hover:bg-white/[0.08]'
                                            }`}
                                        >
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg md:h-10 md:w-10 ${
                                                    active
                                                        ? 'bg-cyan-400/[0.16] text-cyan-100'
                                                        : complete
                                                          ? 'bg-emerald-400/[0.14] text-emerald-100'
                                                          : 'bg-white/[0.08] text-slate-400'
                                                }`}
                                            >
                                                {complete ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <step.icon className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-semibold leading-4 text-slate-100 md:text-sm md:leading-5">
                                                    {step.label}
                                                </p>
                                                <p className="mt-1 hidden text-xs leading-5 text-slate-400 md:block">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>

                            <div className="flex flex-col gap-2 xl:items-end">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
                                    Step {currentStep} of {steps.length}
                                </p>
                                <p className="mt-1 text-sm text-slate-300">
                                    {activeStep.description}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        aria-describedby={STUDIO_ROUTE_RESET_STATUS_ID}
                                        onFocus={() =>
                                            setResetNotice(
                                                currentStep === 1
                                                    ? 'Back is unavailable on the first Studio step. No live campaign, booking request, CRM send, or provider handoff was created.'
                                                    : `Back will return to step ${Math.max(1, currentStep - 1)} in this local Studio preview. No live campaign, booking request, CRM send, or provider handoff will be created.`
                                            )
                                        }
                                        onClick={() => {
                                            trackStudioAction('previous_step', {
                                                from_step: currentStep,
                                                to_step: Math.max(1, currentStep - 1),
                                            });
                                            setResetNotice(
                                                `Returned to Studio step ${Math.max(1, currentStep - 1)} in preview. Continue editing before export handoff.`
                                            );
                                            prevStep();
                                        }}
                                        disabled={currentStep === 1}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        aria-describedby={STUDIO_ROUTE_RESET_STATUS_ID}
                                        onFocus={() =>
                                            setResetNotice(
                                                currentStep === steps.length
                                                    ? 'Continue is unavailable on the final Studio step. No live campaign, booking request, CRM send, or provider handoff was created.'
                                                    : `Continue will move to step ${Math.min(steps.length, currentStep + 1)} in this local Studio preview. No live campaign, booking request, CRM send, or provider handoff will be created.`
                                            )
                                        }
                                        onClick={() => {
                                            trackStudioAction('next_step', {
                                                from_step: currentStep,
                                                to_step: Math.min(steps.length, currentStep + 1),
                                            });
                                            setResetNotice(
                                                `Moved to Studio step ${Math.min(steps.length, currentStep + 1)} in preview. Continue editing before export handoff.`
                                            );
                                            nextStep();
                                        }}
                                        disabled={currentStep === steps.length}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-300/[0.28] bg-cyan-400/[0.16] px-4 py-3 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-400/[0.22] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                                    >
                                        Continue
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/[0.10] px-6 py-6 md:px-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                                transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.section>
            </div>
        </PartnerLayout>
    );
};
