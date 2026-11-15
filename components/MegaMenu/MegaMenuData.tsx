import React from 'react';
import {
    Layout, Brain, Box, BookOpen, Users, Globe, Info, Microscope, Briefcase, MessageCircle,
    Activity, Zap, Wind, Sun, Droplets
} from 'lucide-react';
import { TechType } from '../../types';

export type MenuContext =
    | 'HBOT' | 'PEMF' | 'RLT' | 'HYDROGEN' | 'NEUTRAL'
    | 'BUILDER' | 'PROTOCOLS' | 'PARTNERS' | 'LOCATOR'
    | 'MISSION' | 'SCIENCE' | 'CAREERS' | 'CONTACT';

export interface SearchDatabaseItem {
    id: number;
    title: string;
    category: string;
    desc: string;
    type: string;
    page?: string;
    /** Keywords and synonyms for smart search matching */
    keywords?: string[];
    /** Related terms that should match this item */
    relatedTerms?: string[];
}

export const SEARCH_DATABASE: SearchDatabaseItem[] = [
    {
        id: 1,
        title: 'HBOT Pro X Chamber',
        category: 'Products',
        desc: '1.3 ATA Precision Oxygen',
        type: 'hbot',
        keywords: ['hbot', 'hyperbaric', 'oxygen', 'chamber', 'pressure', 'ata', 'soft chamber', 'mild hbot', 'oxygen therapy', 'wellness chamber'],
        relatedTerms: ['oxyhelp', 'oxylife', 'recovery routine', 'athletic', 'longevity', 'protocol planning', 'research']
    },
    {
        id: 2,
        title: 'Tesla Max PEMF',
        category: 'Products',
        desc: 'High-intensity pulsing',
        type: 'pemf',
        keywords: ['pemf', 'pulsed electromagnetic', 'magnetic', 'tesla', 'field', 'frequency', 'pemf mat', 'pemf device', 'electromagnetic therapy'],
        relatedTerms: ['pain relief', 'sleep', 'recovery', 'circulation', 'energy', 'brainwave', 'delta', 'alpha', 'grounding', 'earthing']
    },
    {
        id: 3,
        title: 'Horizon RLT Panel',
        category: 'Products',
        desc: 'Dual-sync photobiomodulation',
        type: 'rlt',
        keywords: ['rlt', 'red light', 'near infrared', 'nir', 'photobiomodulation', 'pbm', 'light therapy', 'led panel', 'red light therapy', '660nm', '850nm'],
        relatedTerms: ['skin routine', 'protocol setup', 'session planning', 'comfort', 'recovery routine', 'irradiance', 'wavelengths']
    },
    {
        id: 4,
        title: 'Hydra Molecular H2',
        category: 'Products',
        desc: '99.9% Pure Hydrogen',
        type: 'hydrogen',
        keywords: ['hydrogen', 'h2', 'molecular hydrogen', 'hydrogen water', 'hydrogen inhalation', 'hydrogen generator', 'brown gas', 'hhO'],
        relatedTerms: ['antioxidant', 'oxidative stress', 'ros', 'free radicals', 'recovery routine', 'athletic performance', 'research']
    },
    {
        id: 5,
        title: 'RLT Session Planning',
        category: 'Protocols',
        desc: 'Light protocol fit guide',
        type: 'protocol',
        page: 'protocols',
        keywords: ['skin routine', 'session planning', 'face protocol', 'rlt', 'red light', 'photobiomodulation', 'near infrared', 'irradiance', 'wavelength'],
        relatedTerms: ['fit', 'protocol', 'routine', 'comfort', 'light exposure']
    },
    {
        id: 6,
        title: 'The Longevity Stack',
        category: 'Protocols',
        desc: 'HBOT + RLT Synergy',
        type: 'protocol',
        page: 'protocols',
        keywords: ['longevity', 'stack', 'hbot', 'rlt', 'combined protocol', 'multi modality', 'recovery routine', 'research'],
        relatedTerms: ['protocol planning', 'oxygen', 'light exposure', 'limitations', 'support']
    },
    {
        id: 7,
        title: 'Deep Sleep Reset',
        category: 'Protocols',
        desc: 'PEMF Entrainment',
        type: 'protocol',
        page: 'protocols',
        keywords: ['sleep', 'deep sleep', 'delta', 'brainwave', 'pemf', 'entrainment', 'insomnia', 'rest', 'circadian', 'night'],
        relatedTerms: ['relaxation', 'melatonin', 'recovery', 'rem', 'sleep quality']
    },
    {
        id: 8,
        title: 'Photobiomodulation Research',
        category: 'Science',
        desc: 'Evidence and limitations',
        type: 'article',
        page: 'research',
        keywords: ['photobiomodulation', 'red light', 'near infrared', 'science', 'research', 'evidence', 'limitations', 'wavelengths'],
        relatedTerms: ['protocol evidence', 'study context', 'safety', 'research limits']
    },
    {
        id: 11,
        title: 'Protocol Codex',
        category: 'Tools',
        desc: '100+ Research Papers',
        type: 'protocols',
        page: 'protocols',
        keywords: ['protocol', 'codex', 'research', 'papers', 'library', 'guide', 'bio-stacks', 'combinations', 'therapy protocols'],
        relatedTerms: ['evidence-based', 'structured', 'protocol', 'regimens', 'safety']
    },
    {
        id: 12,
        title: 'Wellness Planner',
        category: 'Tools',
        desc: 'Build Your Stack',
        type: 'builder',
        page: 'wellness-planner',
        keywords: ['wellness', 'planner', 'stack', 'builder', 'configuration', 'setup', 'goal', 'budget', 'protocol', 'recommendation'],
        relatedTerms: ['stack builder', 'goal planning', 'protocol matching', 'technology recommendation']
    },
    {
        id: 13,
        title: 'Condition Guides',
        category: 'Resources',
        desc: 'Goal-led wellness routes',
        type: 'resource',
        page: 'conditions',
        keywords: ['conditions', 'goals', 'recovery', 'sleep', 'stress', 'comfort', 'vitality', 'guides'],
        relatedTerms: ['goal planning', 'condition guide', 'wellness goal', 'support path']
    },
    {
        id: 14,
        title: 'Research Hub',
        category: 'Science',
        desc: 'Evidence and limitations',
        type: 'article',
        page: 'research',
        keywords: ['research', 'evidence', 'citations', 'studies', 'limitations', 'science'],
        relatedTerms: ['published research', 'study context', 'evidence-aware', 'evidence-informed']
    },
    {
        id: 15,
        title: 'Store',
        category: 'Products',
        desc: 'Ownership options',
        type: 'resource',
        page: 'store',
        keywords: ['store', 'shop', 'buy', 'ownership', 'products', 'catalog'],
        relatedTerms: ['purchase planning', 'ownership path', 'product hub']
    },
    {
        id: 16,
        title: 'Rental',
        category: 'Resources',
        desc: 'Lower-commitment access',
        type: 'resource',
        page: 'rental',
        keywords: ['rental', 'rent', 'monthly', 'access', 'delivery', 'onboarding'],
        relatedTerms: ['rental planning', 'lower commitment', 'try before ownership']
    },
    {
        id: 17,
        title: 'Help Center',
        category: 'Resources',
        desc: 'Support articles and next steps',
        type: 'resource',
        page: 'help',
        keywords: ['help', 'support', 'setup', 'question', 'faq', 'guidance'],
        relatedTerms: ['support path', 'customer support', 'device support']
    },
    {
        id: 18,
        title: 'FAQ',
        category: 'Resources',
        desc: 'Common Hylono questions',
        type: 'resource',
        page: 'faq',
        keywords: ['faq', 'questions', 'answers', 'support', 'policy'],
        relatedTerms: ['common questions', 'self serve', 'support standards']
    },
    {
        id: 19,
        title: 'Policies',
        category: 'Resources',
        desc: 'Privacy, terms, shipping, returns, warranty, and cookies',
        type: 'resource',
        page: 'policies',
        keywords: [
            'policies',
            'policy center',
            'privacy',
            'terms',
            'shipping',
            'returns',
            'warranty',
            'cookies',
        ],
        relatedTerms: ['legal policies', 'commerce policies', 'support policies']
    },
    {
        id: 20,
        title: 'Shipping Policy',
        category: 'Resources',
        desc: 'Delivery and logistics',
        type: 'resource',
        page: 'shipping',
        keywords: ['shipping', 'delivery', 'logistics', 'freight', 'dispatch'],
        relatedTerms: ['delivery planning', 'commerce policy', 'order support']
    },
    {
        id: 21,
        title: 'Returns Policy',
        category: 'Resources',
        desc: 'Return path and inspection',
        type: 'resource',
        page: 'returns',
        keywords: ['returns', 'return', 'refund', 'policy', 'inspection'],
        relatedTerms: ['commerce policy', 'return planning', 'order support']
    },
    {
        id: 22,
        title: 'Warranty',
        category: 'Resources',
        desc: 'Warranty support path',
        type: 'resource',
        page: 'warranty',
        keywords: ['warranty', 'guarantee', 'support', 'repair', 'coverage'],
        relatedTerms: ['commerce policy', 'support path', 'after purchase']
    },
    {
        id: 23,
        title: 'Privacy Policy',
        category: 'Resources',
        desc: 'Privacy and data handling',
        type: 'resource',
        page: 'privacy',
        keywords: ['privacy', 'data', 'gdpr', 'personal data', 'policy'],
        relatedTerms: ['legal policy', 'data rights', 'privacy rights']
    },
    {
        id: 24,
        title: 'Terms',
        category: 'Resources',
        desc: 'Website and commerce terms',
        type: 'resource',
        page: 'terms',
        keywords: ['terms', 'conditions', 'legal', 'commerce', 'policy'],
        relatedTerms: ['legal policy', 'terms of use', 'consumer terms']
    },
    {
        id: 25,
        title: 'Press',
        category: 'Resources',
        desc: 'Company news and media',
        type: 'resource',
        page: 'press',
        keywords: ['press', 'media', 'news', 'brand', 'company'],
        relatedTerms: ['press inquiries', 'media contact', 'company updates']
    },
    {
        id: 26,
        title: 'Partners',
        category: 'Resources',
        desc: 'Professional and clinic inquiries',
        type: 'resource',
        page: 'partners',
        keywords: ['partners', 'clinic', 'professional', 'studio', 'b2b'],
        relatedTerms: ['professional planning', 'clinic request', 'partner inquiry']
    },
];

/**
 * Smart search keywords map - maps user queries to product types
 * Used for intelligent matching of related terms
 */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
    // Oxygen/HBOT synonyms
    'oxygen': ['hbot', 'hyperbaric', 'chamber', 'oxyhelp', 'oxylife'],
    'hyperbaric': ['hbot', 'oxygen', 'chamber', 'pressure'],
    'hyper': ['hyperbaric', 'hbot', 'oxygen'],
    'hbot': ['hyperbaric', 'oxygen', 'chamber'],
    'chamber': ['hbot', 'hyperbaric', 'oxygen'],
    'pressure': ['hbot', 'hyperbaric', 'chamber'],

    // Light/RLT synonyms
    'light': ['rlt', 'red light', 'photobiomodulation', 'led', 'nir', 'near infrared'],
    'red': ['rlt', 'red light', 'photobiomodulation'],
    'infrared': ['rlt', 'nir', 'near infrared', 'photobiomodulation'],
    'photobiomodulation': ['rlt', 'red light', 'light therapy', 'pbm'],
    'collagen': ['rlt', 'red light', 'skin routine', 'research'],

    // PEMF synonyms
    'magnetic': ['pemf', 'electromagnetic', 'tesla', 'field'],
    'pemf': ['magnetic', 'electromagnetic', 'frequency', 'pulsed'],
    'frequency': ['pemf', 'brainwave', 'entrainment'],
    'brainwave': ['pemf', 'sleep', 'delta', 'alpha'],

    // Hydrogen synonyms
    'hydrogen': ['h2', 'molecular hydrogen', 'hydrogen water', 'antioxidant'],
    'h2': ['hydrogen', 'molecular hydrogen', 'antioxidant'],
    'antioxidant': ['hydrogen', 'h2', 'oxidative stress'],

    // General wellness synonyms
    'recovery': ['hbot', 'rlt', 'pemf', 'hydrogen'],
    'sleep': ['pemf', 'brainwave', 'delta'],
    'aging': ['rlt', 'hbot', 'research', 'longevity'],
    'longevity': ['hbot', 'rlt', 'research', 'stack'],
    'wellness': ['hbot', 'rlt', 'pemf', 'hydrogen'],
    'therapy': ['hbot', 'rlt', 'pemf', 'hydrogen'],
    'protocol': ['hbot', 'rlt', 'pemf', 'routine'],
    'energy': ['pemf', 'research', 'protocol', 'rlt'],
    'mitochondria': ['rlt', 'research', 'photobiomodulation'],
    'atp': ['research', 'photobiomodulation', 'rlt'],
    'inflammation': ['hbot', 'rlt', 'hydrogen', 'research'],
    'skin': ['rlt', 'skin routine', 'red light', 'protocol'],
    'athletic': ['hbot', 'hydrogen', 'recovery', 'pemf'],
    'pain': ['pemf', 'magnetic', 'recovery'],
    'stress': ['hydrogen', 'pemf', 'sleep'],
};

export const TECH_COLOR_MAP: Record<string, any> = {
    'text-cyan-400': {
        activeBg: 'rgba(6,182,212,0.1)', activeBorder: 'rgba(6,182,212,0.4)', activeShadow: '0 0 30px rgba(0,0,0,0.3)',
        iconActiveBg: '#06b6d4', iconActiveShadow: '0 0 20px rgba(255,255,255,0.4)',
        iconDefaultBg: 'rgba(34,211,238,0.2)', iconDefaultText: '#22d3ee',
        iconHoverShadow: '0 0 15px rgba(34,211,238,0.5)',
        subtitleActive: '#22d3ee', subtitleDefault: 'rgba(34,211,238,0.7)',
        barActive: '#22d3ee',
        arrowActive: '#22d3ee',
        shimmer: 'rgba(6,182,212,0.05)',
    },
    'text-purple-400': {
        activeBg: 'rgba(168,85,247,0.1)', activeBorder: 'rgba(168,85,247,0.4)', activeShadow: '0 0 30px rgba(0,0,0,0.3)',
        iconActiveBg: '#a855f7', iconActiveShadow: '0 0 20px rgba(255,255,255,0.4)',
        iconDefaultBg: 'rgba(192,132,252,0.2)', iconDefaultText: '#c084fc',
        iconHoverShadow: '0 0 15px rgba(192,132,252,0.5)',
        subtitleActive: '#c084fc', subtitleDefault: 'rgba(192,132,252,0.7)',
        barActive: '#c084fc',
        arrowActive: '#c084fc',
        shimmer: 'rgba(168,85,247,0.05)',
    },
    'text-red-400': {
        activeBg: 'rgba(248,113,113,0.1)', activeBorder: 'rgba(248,113,113,0.4)', activeShadow: '0 0 30px rgba(0,0,0,0.3)',
        iconActiveBg: '#f87171', iconActiveShadow: '0 0 20px rgba(255,255,255,0.4)',
        iconDefaultBg: 'rgba(248,113,113,0.2)', iconDefaultText: '#f87171',
        iconHoverShadow: '0 0 15px rgba(248,113,113,0.5)',
        subtitleActive: '#f87171', subtitleDefault: 'rgba(248,113,113,0.7)',
        barActive: '#f87171',
        arrowActive: '#f87171',
        shimmer: 'rgba(248,113,113,0.05)',
    },
    'text-sky-400': {
        activeBg: 'rgba(56,189,248,0.1)', activeBorder: 'rgba(56,189,248,0.4)', activeShadow: '0 0 30px rgba(0,0,0,0.3)',
        iconActiveBg: '#38bdf8', iconActiveShadow: '0 0 20px rgba(255,255,255,0.4)',
        iconDefaultBg: 'rgba(56,189,248,0.2)', iconDefaultText: '#38bdf8',
        iconHoverShadow: '0 0 15px rgba(56,189,248,0.5)',
        subtitleActive: '#38bdf8', subtitleDefault: 'rgba(56,189,248,0.7)',
        barActive: '#38bdf8',
        arrowActive: '#38bdf8',
        shimmer: 'rgba(56,189,248,0.05)',
    },
};

const CONTEXT_ICONS = {
    layout: <Layout className="w-4 h-4" />,
    brain: <Brain className="w-4 h-4" />,
    box: <Box className="w-4 h-4" />,
    bookOpen: <BookOpen className="w-4 h-4" />,
    users: <Users className="w-4 h-4" />,
    globe: <Globe className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
    microscope: <Microscope className="w-4 h-4" />,
    briefcase: <Briefcase className="w-4 h-4" />,
    messageCircle: <MessageCircle className="w-4 h-4" />,
} as const;

export const CONTEXT_CONFIG_STORE: Record<MenuContext, any> = {
    NEUTRAL: {
        accent: 'text-slate-400',
        glow: 'bg-cyan-500/0',
        relatedTools: ['BUILDER', 'PROTOCOLS', 'PARTNERS', 'LOCATOR'],
        featured: {
            type: 'base',
            title: "Hylono\nIntelligence",
            desc: "Navigate Hylono's guided wellness-technology map. Hover over any technology or tool to review structured context, protocols, and planning details.",
            badge: "System Overview",
            badgeColor: "text-white/60",
            action: "Get Started",
            icon: CONTEXT_ICONS.layout,
        },
        trendingTags: ["Wellness Tech", "Guided Access", "Recovery"],
    },
    HBOT: {
        accent: 'text-cyan-400',
        glow: 'bg-cyan-500/20',
        relatedTools: ['LOCATOR', 'PROTOCOLS'],
        featured: {
            type: 'protocol',
            title: "The Longevity\nStack",
            desc: "Compare oxygen and light-session planning before choosing a combined protocol.",
            badge: "Recommended Protocol",
            badgeColor: "text-cyan-300",
            action: "View Protocol",
            icon: CONTEXT_ICONS.brain,
            scienceScore: 98,
        },
        trendingTags: ["1.3 ATA", "Soft Chambers", "Oxygen Safety"],
    },
    PEMF: {
        accent: 'text-purple-400',
        glow: 'bg-purple-500/20',
        relatedTools: ['BUILDER'],
        featured: {
            type: 'protocol',
            title: "Deep Sleep\nReset",
            desc: "Entrain your brainwaves to Delta frequencies using low-intensity PEMF before bed.",
            badge: "Circadian Protocol",
            badgeColor: "text-purple-300",
            action: "View Protocol",
            icon: CONTEXT_ICONS.brain,
            scienceScore: 92,
        },
        trendingTags: ["Tesla Max", "Alpha Waves", "Bio-feedback"],
    },
    RLT: {
        accent: 'text-red-400',
        glow: 'bg-red-500/20',
        relatedTools: ['BUILDER'],
        featured: {
            type: 'protocol',
            title: "RLT Session\nPlanning",
            desc: "Map wavelength, distance, and session cadence before adding red-light work to a protocol.",
            badge: "Protocol Fit",
            badgeColor: "text-red-300",
            action: "View Protocol",
            icon: CONTEXT_ICONS.brain,
            scienceScore: 95,
        },
        trendingTags: ["660nm Red", "Distance", "Irradiance"],
    },
    HYDROGEN: {
        accent: 'text-sky-400',
        glow: 'bg-sky-500/20',
        relatedTools: ['PROTOCOLS'],
        featured: {
            type: 'protocol',
            title: "Oxidative\nDefense",
            desc: "Review hydrogen as a supporting routine after intense physical exertion, with evidence limits visible before planning.",
            badge: "Recovery Protocol",
            badgeColor: "text-sky-300",
            action: "View Protocol",
            icon: CONTEXT_ICONS.brain,
            scienceScore: 89,
        },
        trendingTags: ["Inhalation", "H2 Water", "ROS Defense"],
    },
    BUILDER: {
        accent: 'text-slate-100',
        glow: 'bg-white/10',
        relatedTools: ['BUILDER'],
        featured: {
            type: 'preview',
            title: "Wellness\nPlanner",
            desc: "Answer a few questions and we'll match you with the right technologies and protocols for your goals.",
            badge: "Stack Builder",
            badgeColor: "text-slate-100",
            action: "Start Planning",
            icon: CONTEXT_ICONS.box,
            points: ["Goal-Based Recommendations", "Budget Optimization", "Protocol Synergies"],
        },
        trendingTags: ["Stack Builder", "Goal Planning", "Protocol Matching"],
    },
    PROTOCOLS: {
        accent: 'text-emerald-400',
        glow: 'bg-emerald-500/10',
        relatedTools: ['PROTOCOLS'],
        featured: {
            type: 'preview',
            title: "The Protocol\nCodex",
            desc: "Compare Hylono's current protocol library by goal, technology, device load, and evidence context.",
            badge: "Library",
            badgeColor: "text-emerald-400",
            action: "Explore Library",
            icon: CONTEXT_ICONS.bookOpen,
            points: ["Multi-Modality Synergies", "Contraindication Safety Check", "Outcome Tracking"],
        },
        trendingTags: ["Bio-Stacks", "Research", "Safety"],
    },
    PARTNERS: {
        accent: 'text-amber-400',
        glow: 'bg-amber-500/10',
        relatedTools: ['PARTNERS', 'LOCATOR'],
        featured: {
            type: 'narrative',
            title: "Elevate Your\nPractice",
            desc: "Send professional, clinic, studio, or team requests for manual planning and rollout-oriented follow-up.",
            badge: "Innovation Partner",
            badgeColor: "text-amber-400",
            action: "Join Network",
            icon: CONTEXT_ICONS.users,
            points: ["Structured training review", "Clinic planning pack", "Lead-intake checklist"],
        },
        trendingTags: ["Planning checklist", "Outreach context", "Clinic setup"],
    },
    LOCATOR: {
        accent: 'text-teal-400',
        glow: 'bg-teal-500/10',
        relatedTools: ['LOCATOR', 'PARTNERS'],
        featured: {
            type: 'preview',
            title: "Experience\nthe Future",
            desc: "Find verified Hylono Centers near you to try Hyperbaric, PEMF, and RLT protocols first-hand.",
            badge: "Find",
            badgeColor: "text-teal-400",
            action: "Open Map",
            icon: CONTEXT_ICONS.globe,
            points: ["Verified Facility Quality", "Session Booking", "Expert Consultation"],
        },
        trendingTags: ["Verified Hubs", "Nearest Location", "Book Demo"],
    },
    MISSION: {
        accent: 'text-white',
        glow: 'bg-white/5',
        relatedTools: [],
        featured: {
            type: 'narrative',
            title: "Guidance\nBefore Access",
            desc: "Hylono keeps complex wellness-technology decisions grounded in evidence review, route planning, and support.",
            badge: "Mission",
            badgeColor: "text-white/80",
            action: "Read About Hylono",
            icon: CONTEXT_ICONS.info,
        },
        trendingTags: ["Guided Access", "Evidence Context", "Support Model"],
    },
    SCIENCE: {
        accent: 'text-blue-400',
        glow: 'bg-blue-500/10',
        relatedTools: [],
        featured: {
            type: 'preview',
            title: "Evidence\nContext",
            desc: "Research summaries with limitations, modality fit, and conservative next-step guidance.",
            badge: "Research",
            badgeColor: "text-blue-400",
            action: "Explore Studies",
            icon: CONTEXT_ICONS.microscope,
            points: ["Research Summaries", "Evidence Limits", "Route Context"],
        },
        trendingTags: ["Evidence", "Limitations", "Protocols"],
    },
    CAREERS: {
        accent: 'text-cyan-400',
        glow: 'bg-cyan-500/10',
        relatedTools: [],
        featured: {
            type: 'narrative',
            title: "Build the\nSupport Layer",
            desc: "Review open company paths for people interested in wellness technology, operations, and support.",
            badge: "Hiring",
            badgeColor: "text-cyan-400",
            action: "View Openings",
            icon: CONTEXT_ICONS.briefcase,
        },
        trendingTags: ["Operations", "Support", "Evidence Review"],
    },
    CONTACT: {
        accent: 'text-slate-400',
        glow: 'bg-white/5',
        relatedTools: [],
        featured: {
            type: 'narrative',
            title: "Human\nSupport",
            desc: "Speak with Hylono support about guided device access, protocol planning, or next-step routing.",
            badge: "Connect",
            badgeColor: "text-slate-200",
            action: "Contact Hylono",
            icon: CONTEXT_ICONS.messageCircle,
        },
        trendingTags: ["Live Chat", "Booking", "Inquiry"],
    },
};

export const TECH_CARDS = [
    { context: 'HBOT', title: 'Hyperbaric', subtitle: 'Oxygen', icon: <Wind />, color: 'text-cyan-400' },
    { context: 'PEMF', title: 'PEMF', subtitle: 'Energy', icon: <Zap />, color: 'text-purple-400' },
    { context: 'RLT', title: 'Red Light', subtitle: 'Photons', icon: <Sun />, color: 'text-red-400' },
    { context: 'HYDROGEN', title: 'Hydrogen', subtitle: 'Molecular', icon: <Droplets />, color: 'text-sky-400' },
] as const;
