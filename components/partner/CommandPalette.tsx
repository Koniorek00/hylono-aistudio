'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Command,
    ClipboardCheck,
    CornerDownLeft,
    LayoutDashboard,
    Wrench,
    ShoppingBag,
    Users,
    FileText,
    Palette,
    GraduationCap,
    Boxes,
    Link2,
    Home,
    LucideIcon,
    LogIn,
    MessageSquare,
} from 'lucide-react';
import { buildLoginRedirectPath } from '@/lib/auth-redirect';
import { NEXUS_MODULE_NAV_ITEMS, NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';
import type { NexusNavIconKey } from './nexusNavigation';

type CommandCategory = 'Modules' | 'Access' | 'System';

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon: LucideIcon;
    category: CommandCategory;
    href?: string;
}

interface CommandPaletteProps {
    triggerLabel?: string;
}

const NEXUS_COMMAND_PALETTE_ACTION_STATUS_ID = 'nexus-command-palette-action-status';
const NEXUS_COMMAND_FALLBACK_HREF = NEXUS_MODULE_NAV_ITEM_BY_KEY.workspace.href;

const MODULE_ICON_BY_KEY: Record<NexusNavIconKey, LucideIcon> = {
    layoutDashboard: LayoutDashboard,
    users: Users,
    wrench: Wrench,
    clipboardCheck: ClipboardCheck,
    graduationCap: GraduationCap,
    shoppingBag: ShoppingBag,
    fileText: FileText,
    palette: Palette,
    boxes: Boxes,
};

const ITEMS: CommandItem[] = [
    ...NEXUS_MODULE_NAV_ITEMS.map((item, index) => ({
        id: `m${index + 1}`,
        label: item.commandLabel,
        description: item.commandDescription,
        category: 'Modules' as const,
        icon: MODULE_ICON_BY_KEY[item.iconKey],
        href: item.href,
    })),
    {
        id: 'a1',
        label: 'Sign in to account',
        description: 'Continue into authenticated partner access.',
        category: 'Access',
        icon: LogIn,
        href: buildLoginRedirectPath('/account'),
    },
    {
        id: 'a2',
        label: 'Contact Hylono',
        description: 'Talk to the team about rollout, training, or access.',
        category: 'Access',
        icon: MessageSquare,
        href: '/contact',
    },
    {
        id: 's1',
        label: 'Back to website',
        description: 'Return to the main Hylono website.',
        category: 'System',
        icon: Home,
        href: '/',
    },
    {
        id: 's2',
        label: 'Partner access',
        description: 'Open the partner entry page.',
        category: 'System',
        icon: Link2,
        href: '/partners',
    },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    triggerLabel = 'Search modules',
}) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [actionStatus, setActionStatus] = useState('Ready to open Nexus command palette.');
    const triggerRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const filterItems = useCallback((currentQuery: string) => {
        const normalizedQuery = currentQuery.toLowerCase();

        return ITEMS.filter((item) =>
            item.label.toLowerCase().includes(normalizedQuery) ||
            item.description?.toLowerCase().includes(normalizedQuery) ||
            item.category.toLowerCase().includes(normalizedQuery)
        );
    }, []);

    const filteredItems = filterItems(query);

    const closePalette = useCallback((restoreFocus = false) => {
        setOpen(false);
        setActionStatus(
            restoreFocus
                ? `Command palette closed. Focus returned to ${triggerLabel}.`
                : 'Command palette closed.'
        );

        if (restoreFocus) {
            window.setTimeout(() => triggerRef.current?.focus(), 0);
        }
    }, [triggerLabel]);

    const openPalette = () => {
        setOpen(true);
        setActionStatus(`Command palette opened. ${ITEMS.length} Nexus commands available.`);
    };

    const handleQueryChange = (nextQuery: string) => {
        const nextItems = filterItems(nextQuery);

        setQuery(nextQuery);
        setSelectedIndex(0);
        setActionStatus(
            nextItems.length === 0
                ? `No command results for "${nextQuery}".`
                : `${nextItems.length} command result${nextItems.length === 1 ? '' : 's'} available for "${nextQuery}".`
        );
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                if (open) {
                    closePalette(true);
                } else {
                    openPalette();
                }
            }

            if (event.key === 'Escape' && open) {
                event.preventDefault();
                closePalette(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closePalette, open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const timeout = window.setTimeout(() => inputRef.current?.focus(), 50);
        setQuery('');
        setSelectedIndex(0);

        return () => window.clearTimeout(timeout);
    }, [open]);

    useEffect(() => {
        const handleNav = (event: KeyboardEvent) => {
            if (!open || filteredItems.length === 0) {
                return;
            }

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                const nextIndex = (selectedIndex + 1) % filteredItems.length;
                const nextItem = filteredItems[nextIndex];
                setSelectedIndex(nextIndex);
                if (nextItem) {
                    setActionStatus(`Selected ${nextItem.label}. ${nextItem.description ?? nextItem.category}.`);
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                const nextIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
                const nextItem = filteredItems[nextIndex];
                setSelectedIndex(nextIndex);
                if (nextItem) {
                    setActionStatus(`Selected ${nextItem.label}. ${nextItem.description ?? nextItem.category}.`);
                }
            } else if (event.key === 'Enter') {
                event.preventDefault();
                const selected = filteredItems[selectedIndex];
                if (selected) {
                    setActionStatus(`Opening ${selected.label}.`);
                    setOpen(false);
                    router.push(selected.href ?? NEXUS_COMMAND_FALLBACK_HREF);
                    window.scrollTo(0, 0);
                }
            }
        };

        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [filteredItems, open, router, selectedIndex]);

    const groups: CommandCategory[] = ['Modules', 'Access', 'System'];

    const executeItem = (item: CommandItem) => {
        setActionStatus(`Opening ${item.label}.`);
        setOpen(false);
        router.push(item.href ?? NEXUS_COMMAND_FALLBACK_HREF);
        window.scrollTo(0, 0);
    };

    return (
        <>
            <button
                ref={triggerRef}
                type="button"
                onClick={openPalette}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls="nexus-command-palette"
                aria-describedby={NEXUS_COMMAND_PALETTE_ACTION_STATUS_ID}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.045] px-3 py-2 text-xs font-medium text-slate-200 transition-colors hover:border-cyan-400/[0.28] hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
            >
                <Search className="h-4 w-4 text-cyan-200" aria-hidden="true" />
                <span>{triggerLabel}</span>
                <kbd className="hidden rounded border border-white/[0.10] bg-slate-950/[0.62] px-1.5 py-0.5 text-[10px] font-semibold text-slate-300 md:inline-flex">
                    Ctrl K
                </kbd>
            </button>
            <p
                id={NEXUS_COMMAND_PALETTE_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Nexus command palette action status"
                className="sr-only"
            >
                {actionStatus}
            </p>

            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[20vh]">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => closePalette(true)}
                            className="fixed inset-0 bg-slate-950/[0.72] backdrop-blur-sm"
                        />

                        <motion.div
                            id="nexus-command-palette"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Nexus command palette"
                            initial={{ scale: 0.96, opacity: 0, y: -16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: -16 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                            className="relative flex max-h-[60vh] w-full max-w-xl flex-col overflow-hidden rounded-lg border border-white/[0.10] bg-slate-950/[0.94] text-slate-100 shadow-none"
                        >
                            <div className="flex items-center border-b border-white/[0.10] px-4 py-4">
                                <Search className="mr-3 h-5 w-5 text-cyan-200" aria-hidden="true" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search modules, access, or pages..."
                                    aria-label="Search Nexus modules"
                                    aria-controls="nexus-command-palette-results"
                                    aria-activedescendant={
                                        filteredItems[selectedIndex]
                                            ? `nexus-command-item-${filteredItems[selectedIndex].id}`
                                            : undefined
                                    }
                                    aria-describedby={NEXUS_COMMAND_PALETTE_ACTION_STATUS_ID}
                                    className="flex-1 border-none bg-transparent text-lg text-slate-100 outline-none placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                    value={query}
                                    onChange={(event) => handleQueryChange(event.target.value)}
                                />
                                <div className="rounded border border-white/[0.10] bg-white/[0.045] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                                    ESC
                                </div>
                            </div>

                            <div
                                id="nexus-command-palette-results"
                                role="listbox"
                                aria-label="Nexus command results"
                                className="flex-1 overflow-y-auto p-2"
                            >
                                {filteredItems.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400">
                                        <Command className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                        <p>No results found for "{query}"</p>
                                    </div>
                                ) : (
                                    groups.map((group) => {
                                        const groupItems = filteredItems.filter((item) => item.category === group);
                                        if (groupItems.length === 0) {
                                            return null;
                                        }

                                        return (
                                            <div key={group} className="mb-2">
                                                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                                    {group}
                                                </div>
                                                {groupItems.map((item) => {
                                                    const globalIndex = filteredItems.indexOf(item);
                                                    const isSelected = globalIndex === selectedIndex;

                                                    return (
                                                        <button
                                                            key={item.id}
                                                            id={`nexus-command-item-${item.id}`}
                                                            role="option"
                                                            aria-selected={isSelected}
                                                            aria-describedby={NEXUS_COMMAND_PALETTE_ACTION_STATUS_ID}
                                                            type="button"
                                                            onClick={() => executeItem(item)}
                                                            onMouseEnter={() => {
                                                                setSelectedIndex(globalIndex);
                                                                setActionStatus(`Selected ${item.label}. ${item.description ?? item.category}.`);
                                                            }}
                                                            className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none ${
                                                                isSelected
                                                                    ? 'border-cyan-400/[0.25] bg-cyan-400/[0.12]'
                                                                    : 'border-transparent hover:border-white/[0.10] hover:bg-white/[0.045]'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`rounded p-2 ${
                                                                    isSelected
                                                                        ? 'border border-cyan-400/[0.25] bg-cyan-400/[0.16] text-cyan-100'
                                                                        : 'border border-white/[0.10] bg-white/[0.045] text-slate-300'
                                                                }`}
                                                            >
                                                                <item.icon className="h-4 w-4" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div
                                                                    className={`pr-8 text-sm font-medium ${
                                                                        isSelected ? 'text-cyan-50' : 'text-white'
                                                                    }`}
                                                                >
                                                                    {item.label}
                                                                </div>
                                                                {item.description ? (
                                                                    <div
                                                                        className={`break-words text-xs ${
                                                                            isSelected ? 'text-cyan-100' : 'text-slate-300'
                                                                        }`}
                                                                    >
                                                                        {item.description}
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                            {isSelected ? (
                                                                <CornerDownLeft className="h-4 w-4 text-cyan-200" />
                                                            ) : null}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-white/[0.10] bg-slate-950/[0.78] px-4 py-2 text-[10px] text-slate-400">
                                <div className="flex gap-4">
                                    <span>
                                        <strong className="text-slate-200">Up/Down</strong> Navigate
                                    </span>
                                    <span>
                                        <strong className="text-slate-200">Enter</strong> Open
                                    </span>
                                </div>
                                <div>Hylono Nexus</div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
