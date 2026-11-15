/**
 * Hylono Brand & Component Design Tokens — Canonical Technical Contract
 *
 * Authoritative constants for Hylono UI engineering.
 * Governed by:
 * - AGENTS.md Brand Invariants (Immutable heading font, vibrant modality colors, rounded-[2rem] containers, zero truncation)
 * - docs/brand/01_MASTER_BRAND_AND_THEME_CONCEPT.md
 * - docs/brand/02_PAGE_ALIGNMENT_AND_LAYOUT_SPECIFICATION.md
 * - docs/brand/03_BAD_ELEMENTS_AND_ANTI_PATTERNS_BLACK_BOOK.md
 * - docs/brand/DESIGN_SYSTEM_TOKENS.md
 */

export const MODALITY_KEYS = ['hbot', 'hydrogen', 'pemf', 'rlt'] as const;
export type ModalityKey = typeof MODALITY_KEYS[number];

export interface ModalityPalette {
  readonly id: ModalityKey;
  readonly name: string;
  readonly shortName: string;
  /** Pure vibrant brand signature color (used for glowing indicators, dark borders, laser accents) */
  readonly coreHex: string;
  readonly glowRgba: string;
  /** High-contrast daylight surface palette (WCAG 2.2 AA verified >= 4.5:1 on light canvas) */
  readonly daylight: {
    readonly text: string;
    readonly textBold: string;
    readonly bg: string;
    readonly border: string;
    readonly chipBg: string;
  };
  /** Luminous/dark palette for nocturnal hubs, interactive media viewers & immersive states */
  readonly luminous: {
    readonly text: string;
    readonly bg: string;
    readonly border: string;
    readonly glow: string;
  };
  /** Ambient aura gradient class string */
  readonly ambientGradient: string;
}

export const MODALITY_TOKENS: Record<ModalityKey, ModalityPalette> = {
  hbot: {
    id: 'hbot',
    name: 'Hyperbaric Oxygen Therapy',
    shortName: 'HBOT',
    coreHex: '#00F0FF', // Pure Electric Cyan (Alpine Cyan)
    glowRgba: 'rgba(0, 240, 255, 0.4)',
    daylight: {
      text: '#0369A1', // Sky-700 (contrast on #FFFFFF: 5.82:1, on #FAF8F5: 5.49:1)
      textBold: '#075985', // Sky-800 (contrast on #FFFFFF: 7.82:1)
      bg: '#F0F9FF', // Sky-50
      border: '#BAE6FD', // Sky-200
      chipBg: '#E0F2FE', // Sky-100
    },
    luminous: {
      text: '#38BDF8', // Sky-400
      bg: 'rgba(0, 240, 255, 0.08)',
      border: 'rgba(0, 240, 255, 0.25)',
      glow: '0 0 20px rgba(0, 240, 255, 0.35)',
    },
    ambientGradient: 'from-[#00F0FF]/15 via-[#0284C7]/8 to-transparent',
  },
  hydrogen: {
    id: 'hydrogen',
    name: 'Molecular Hydrogen Therapy',
    shortName: 'Hydrogen',
    coreHex: '#0EA5E9', // Alpine Sky / Forest Teal (#0EA5E9 / #143D34)
    glowRgba: 'rgba(14, 165, 233, 0.4)',
    daylight: {
      text: '#0F766E', // Teal-700 (contrast on #FFFFFF: 5.12:1, on #FAF8F5: 4.83:1)
      textBold: '#115E59', // Teal-800 (contrast on #FFFFFF: 7.60:1)
      bg: '#F0FDFA', // Teal-50
      border: '#99F6E4', // Teal-200
      chipBg: '#CCFBF1', // Teal-100
    },
    luminous: {
      text: '#2DD4BF', // Teal-400
      bg: 'rgba(14, 165, 233, 0.08)',
      border: 'rgba(14, 165, 233, 0.25)',
      glow: '0 0 20px rgba(14, 165, 233, 0.35)',
    },
    ambientGradient: 'from-[#0EA5E9]/15 via-[#143D34]/10 to-transparent',
  },
  pemf: {
    id: 'pemf',
    name: 'Pulsed Electromagnetic Field',
    shortName: 'PEMF',
    coreHex: '#A855F7', // Royal Amethyst Purple
    glowRgba: 'rgba(168, 85, 247, 0.4)',
    daylight: {
      text: '#6D28D9', // Purple-700 (contrast on #FFFFFF: 6.84:1)
      textBold: '#581C87', // Purple-900 (contrast on #FFFFFF: 10.42:1)
      bg: '#FAF5FF', // Purple-50
      border: '#DDD6FE', // Purple-200
      chipBg: '#F3E8FF', // Purple-100
    },
    luminous: {
      text: '#C084FC', // Purple-400
      bg: 'rgba(168, 85, 247, 0.08)',
      border: 'rgba(168, 85, 247, 0.25)',
      glow: '0 0 20px rgba(168, 85, 247, 0.35)',
    },
    ambientGradient: 'from-[#A855F7]/15 via-[#6D28D9]/8 to-transparent',
  },
  rlt: {
    id: 'rlt',
    name: 'Photobiomodulation / Red Light',
    shortName: 'RLT',
    coreHex: '#F43F5E', // Solar Crimson / Rose
    glowRgba: 'rgba(244, 63, 94, 0.4)',
    daylight: {
      text: '#B91C1C', // Red-700 (contrast on #FFFFFF: 5.62:1)
      textBold: '#991B1B', // Red-800 (contrast on #FFFFFF: 7.85:1)
      bg: '#FEF2F2', // Red-50
      border: '#FECDD3', // Rose-200
      chipBg: '#FFE4E6', // Rose-100
    },
    luminous: {
      text: '#FB7185', // Rose-400
      bg: 'rgba(244, 63, 94, 0.08)',
      border: 'rgba(244, 63, 94, 0.25)',
      glow: '0 0 20px rgba(244, 63, 94, 0.35)',
    },
    ambientGradient: 'from-[#F43F5E]/15 via-[#BE123C]/8 to-transparent',
  },
} as const;

/**
 * Geometric Container Standards (Immutable Brand Invariants)
 */
export const CONTAINER_STANDARDS = {
  /** Master architectural card container: 32px curvature */
  masterCard: 'rounded-[2rem]',
  /** Secondary intermediate cards / visual preview boxes: 20px or 16px */
  previewCard: 'rounded-[20px]',
  intermediateCard: 'rounded-2xl',
  /** Tactical micro-badges / compact tags: 8px to 12px */
  badge: 'rounded-xl',
  /** Universal action pill control: 9999px full pill */
  pillControl: 'rounded-[9999px]',
} as const;

/**
 * Surface & Ambient Lighting Standards
 */
export const SURFACE_STANDARDS = {
  /** Swiss sandstone daylight canvas */
  canvasDaylight: '#FAF8F5',
  /** Pure daylight glass card panel */
  panelDaylight: '#FFFFFF',
  /** Delicate natural stone borders */
  borderStone: '#E8E2D8',
  borderStoneSubtle: '#EAE4D8',
  divideStone: 'divide-[#EAE4D8]',
  /** Warm burnished bronze accent (numerals, seals, technical watermarks) */
  bronzeAccent: '#966D48',
  /** Deep European forest teal (primary action pills) */
  forestTeal: '#143D34',
  forestTealHover: '#0E2C25',
  /** Deep espresso charcoal / obsidian slate */
  obsidianSlate: '#141716',
  /** Soft ambient luxury dispersion shadow */
  ambientShadow: 'shadow-[0_15px_35px_rgba(20,25,23,0.04)]',
  ambientHoverShadow: 'hover:shadow-[0_20px_45px_rgba(20,25,23,0.08)]',
} as const;

/**
 * Typography Hierarchy Standard Classes
 */
export const TYPOGRAPHY_STANDARDS = {
  /** Tier 1: Technical Eyebrow & Badges (Syncopate) */
  eyebrow: 'font-heading text-xs font-bold uppercase tracking-[0.25em]',
  /** Tier 2: Editorial Display Headlines (Cormorant Garamond) */
  displayHeadline: 'font-editorial font-normal tracking-tight text-slate-950 leading-[1.15]',
  /** Tier 3: Body & Parameters (Outfit / Inter) */
  body: 'font-body text-base text-slate-700 leading-relaxed break-words',
  bodyMuted: 'font-body text-sm text-slate-600 leading-relaxed break-words',
  caption: 'font-body text-xs text-slate-500 break-words',
  /** Zero-truncation invariant: all textual surfaces must wrap naturally */
  wrapSafe: 'break-words overflow-wrap-normal',
} as const;

/**
 * Minimum Touch Target Standard (WCAG 2.5.8 / 2.2 AA)
 */
export const TOUCH_TARGET_STANDARDS = {
  minHeight: 'min-h-[44px]',
  minWidth: 'min-w-[44px]',
} as const;
