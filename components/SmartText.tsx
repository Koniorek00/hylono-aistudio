"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

interface SmartTextProps {
    children: string;
    onNavigate?: (path: string) => void;
    className?: string;
    variant?: 'light' | 'dark';
}

const TERM_MAPPINGS: { [key: string]: string } = {
    'PEMF': '/product/pemf',
    'HBOT': '/product/hbot',
    'RLT': '/product/rlt',
    'Hydrogen': '/product/hydrogen',
    'Support Hub': '/help?tab=support',
    'Superhuman Protocol': '/protocols',
    'Zone Builder': '/wellness-planner',
    'Bio-Assessment': '/dashboard',
    'Hylono Rewards': '/rewards',
    'Support': '/help?tab=support'
};

const createSmartTextIdPart = (value: string): string =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'term';

export const SmartText: React.FC<SmartTextProps> = ({ children, onNavigate, className = '', variant = 'light' }) => {
    const router = useRouter();
    const instanceId = React.useId().replace(/[^a-zA-Z0-9_-]+/g, '') || 'instance';
    const linkClassName =
        variant === 'dark'
            ? 'cursor-pointer font-bold text-cyan-200 underline decoration-cyan-300/30 underline-offset-4 transition-colors hover:text-cyan-100'
            : 'cursor-pointer font-bold text-cyan-600 underline decoration-cyan-500/30 underline-offset-4 transition-colors hover:text-cyan-400';

    if (!children) return null;

    const handleNavigate = (path: string) => {
        if (onNavigate) {
            onNavigate(path);
        } else {
            router.push(path);
            window.scrollTo(0, 0);
        }
    };

    const handleLinkClick =
        (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
            event.stopPropagation();

            if (
                event.defaultPrevented ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                event.button !== 0
            ) {
                return;
            }

            event.preventDefault();
            handleNavigate(path);
        };

    const handleLinkKeyDown =
        (path: string) => (event: React.KeyboardEvent<HTMLAnchorElement>) => {
            if (event.key !== ' ') {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            handleNavigate(path);
        };

    // improved regex to capture exact terms but allow punctuation
    // Sort terms by length descending to match longest phrases first ("Support Hub" before "Support")
    const terms = Object.keys(TERM_MAPPINGS).sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');

    const parts = children.split(pattern);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                const link = TERM_MAPPINGS[part];
                if (link) {
                    const statusId = `smart-text-${instanceId}-${createSmartTextIdPart(`${part}-${index}`)}-status`;

                    return (
                        <React.Fragment key={`${part}-${index}`}>
                            <a
                                href={link}
                                onClick={handleLinkClick(link)}
                                onKeyDown={handleLinkKeyDown(link)}
                                aria-describedby={statusId}
                                className={linkClassName}
                            >
                                {part}
                            </a>
                            <span
                                id={statusId}
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                aria-label={`${part} smart text link status`}
                                className="sr-only"
                            >
                                {part} link is ready.
                            </span>
                        </React.Fragment>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};
