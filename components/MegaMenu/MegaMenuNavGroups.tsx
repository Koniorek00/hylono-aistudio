import React from 'react';
import {
    Layout, Brain, Globe, Briefcase, BookOpen, HelpCircle, ShoppingBag, FileText,
} from 'lucide-react';
import { MenuContext } from './MegaMenuData';

export interface NavGroupLink {
    title?: string;
    label?: string;
    sub?: string;
    page: string;
    href: string;
    context?: MenuContext;
    icon?: React.ReactNode;
    color?: string;
    bg?: string;
}

export const NAV_GROUPS = {
    explore: [
        {
            title: 'Condition Guides',
            sub: 'Goal fit',
            page: 'conditions',
            href: '/conditions',
            context: 'PROTOCOLS' as MenuContext,
            icon: <Brain size={18} />,
            color: 'text-cyan-400',
            bg: 'bg-cyan-400/10',
        },
        {
            title: 'Research Hub',
            sub: 'Evidence',
            page: 'research',
            href: '/research',
            context: 'SCIENCE' as MenuContext,
            icon: <BookOpen size={18} />,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
        },
        {
            title: 'Protocol Library',
            sub: 'Schedules',
            page: 'protocols',
            href: '/protocols',
            context: 'PROTOCOLS' as MenuContext,
            icon: <Layout size={18} />,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
        },
        {
            title: 'Learning',
            sub: 'Articles',
            page: 'learning',
            href: '/learning',
            context: 'SCIENCE' as MenuContext,
            icon: <FileText size={18} />,
            color: 'text-indigo-400',
            bg: 'bg-indigo-400/10',
        },
    ],
    access: [
        {
            title: 'Store',
            sub: 'Ownership',
            page: 'store',
            href: '/store',
            context: 'BUILDER' as MenuContext,
            icon: <ShoppingBag size={18} />,
            color: 'text-slate-700',
            bg: 'bg-white/10',
        },
        {
            title: 'Rental',
            sub: 'Rental access',
            page: 'rental',
            href: '/rental',
            context: 'BUILDER' as MenuContext,
            icon: <Briefcase size={18} />,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
        },
        {
            title: 'Wellness Planner',
            sub: 'Guided planning',
            page: 'wellness-planner',
            href: '/wellness-planner',
            context: 'BUILDER' as MenuContext,
            icon: <HelpCircle size={18} />,
            color: 'text-teal-400',
            bg: 'bg-teal-400/10',
        },
        {
            title: 'Find Center',
            sub: 'Map',
            page: 'locator',
            href: '/locator',
            context: 'LOCATOR' as MenuContext,
            icon: <Globe size={18} />,
            color: 'text-teal-400',
            bg: 'bg-teal-400/10',
        },
    ],
    support: [
        { label: 'Help Center', page: 'help', href: '/help' },
        { label: 'FAQ', page: 'faq', href: '/faq' },
        { label: 'Contact', page: 'contact', href: '/contact', context: 'CONTACT' as MenuContext },
    ],
    policies: [
        { label: 'All Policies', page: 'policies', href: '/policies' },
        { label: 'Shipping', page: 'shipping', href: '/shipping' },
        { label: 'Returns', page: 'returns', href: '/returns' },
        { label: 'Warranty', page: 'warranty', href: '/warranty' },
        { label: 'Privacy', page: 'privacy', href: '/privacy' },
        { label: 'Terms', page: 'terms', href: '/terms' },
        { label: 'Cookie Policy', page: 'cookie-policy', href: '/cookie-policy' },
    ],
    company: [
        { label: 'About', page: 'about', href: '/about', context: 'MISSION' as MenuContext },
        { label: 'Blog', page: 'blog', href: '/blog', context: 'SCIENCE' as MenuContext },
        { label: 'Press', page: 'press', href: '/press' },
        { label: 'Careers', page: 'careers', href: '/careers', context: 'CAREERS' as MenuContext },
        { label: 'Affiliate', page: 'affiliate', href: '/affiliate' },
        { label: 'Partners', page: 'partners', href: '/partners', context: 'PARTNERS' as MenuContext },
    ],
};
