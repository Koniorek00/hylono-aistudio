import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { Search, X, Pointer, FileText, ArrowRight, Filter, SlidersHorizontal, Settings, Atom, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SEARCH_DATABASE, SEARCH_SYNONYMS, SearchDatabaseItem } from '@/components/MegaMenu/MegaMenuData';
import { getRecentSearches, addRecentSearch, POPULAR_SEARCHES, getRecentPages, RecentPage } from '@/utils/searchStorage';

const SEARCH_TRANSITION = { duration: 0.12, ease: "easeOut" as const };
const CONTEXT_TRANSITION = { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as const };
export const MEGA_MENU_SEARCH_ACTION_STATUS_ID = 'mega-menu-search-action-status';
export const MEGA_MENU_SEARCH_ACTION_STATUS_LABEL = 'Mega menu search action status';

// Filter tag types
type MegaMenuFilterTag = 'all' | 'Products' | 'Protocols' | 'Science' | 'Resources' | 'Tools';

const FILTER_TAGS: { value: MegaMenuFilterTag; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'Products', label: 'Products' },
    { value: 'Protocols', label: 'Protocols' },
    { value: 'Science', label: 'Science' },
    { value: 'Resources', label: 'Resources' },
    { value: 'Tools', label: 'Tools' },
];

// Category colors for headers and dots
const categoryColors: Record<string, { text: string; dot: string }> = {
    Products: { text: 'text-cyan-400', dot: 'bg-cyan-400' },
    Protocols: { text: 'text-violet-400', dot: 'bg-violet-400' },
    Science: { text: 'text-blue-400', dot: 'bg-blue-400' },
    Resources: { text: 'text-amber-400', dot: 'bg-amber-400' },
    Tools: { text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

const filterTagStyles: Record<MegaMenuFilterTag, { active: string; inactive: string }> = {
    all: {
        active: 'bg-slate-950 text-white border-slate-950',
        inactive: 'bg-white text-slate-600 border-[var(--border-soft)] hover:border-cyan-500/30 hover:bg-cyan-50',
    },
    Products: {
        active: 'bg-cyan-400 text-slate-900 border-cyan-400',
        inactive: 'bg-white text-cyan-700 border-cyan-500/25 hover:border-cyan-500/45 hover:bg-cyan-50',
    },
    Protocols: {
        active: 'bg-violet-400 text-slate-900 border-violet-400',
        inactive: 'bg-white text-violet-700 border-violet-500/25 hover:border-violet-500/45 hover:bg-violet-50',
    },
    Science: {
        active: 'bg-blue-400 text-slate-900 border-blue-400',
        inactive: 'bg-white text-blue-700 border-blue-500/25 hover:border-blue-500/45 hover:bg-blue-50',
    },
    Resources: {
        active: 'bg-amber-400 text-slate-900 border-amber-400',
        inactive: 'bg-white text-amber-700 border-amber-500/25 hover:border-amber-500/45 hover:bg-amber-50',
    },
    Tools: {
        active: 'bg-emerald-400 text-slate-900 border-emerald-400',
        inactive: 'bg-white text-emerald-700 border-emerald-500/25 hover:border-emerald-500/45 hover:bg-emerald-50',
    },
};

interface FilterTagBarProps {
    activeFilter: MegaMenuFilterTag;
    actionStatusId: string;
    onFilterChange: (filter: MegaMenuFilterTag) => void;
    resultCounts: Record<MegaMenuFilterTag, number>;
}

const FilterTagBar: React.FC<FilterTagBarProps> = ({ activeFilter, actionStatusId, onFilterChange, resultCounts }) => {
    const tagRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback((event: React.KeyboardEvent, currentIndex: number) => {
        let newIndex = currentIndex;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
            event.preventDefault();
            newIndex = (currentIndex + 1) % FILTER_TAGS.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
            event.preventDefault();
            newIndex = currentIndex === 0 ? FILTER_TAGS.length - 1 : currentIndex - 1;
        } else if (event.key === 'Home') {
            event.preventDefault();
            newIndex = 0;
        } else if (event.key === 'End') {
            event.preventDefault();
            newIndex = FILTER_TAGS.length - 1;
        }

        if (newIndex !== currentIndex) {
            const nextTag = FILTER_TAGS[newIndex];
            if (!nextTag) return;

            onFilterChange(nextTag.value);
            const buttons = tagRef.current?.querySelectorAll('button');
            buttons?.[newIndex]?.focus();
        }
    }, [onFilterChange]);

    return (
        <div
            ref={tagRef}
            className="py-2 mb-4"
            role="radiogroup"
            aria-label="Filter search results by category"
        >
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-500 flex items-center gap-1.5 shrink-0 mb-2">
                <Filter size={10} /> Filter
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
                {FILTER_TAGS.map((tag, index) => {
                    const isActive = activeFilter === tag.value;
                    const count = resultCounts[tag.value];

                    return (
                        <button
                            key={tag.value}
                            type="button"
                            role="radio"
                            aria-checked={isActive}
                            aria-describedby={actionStatusId}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => onFilterChange(tag.value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`
                                inline-flex min-h-11 items-center gap-1 px-3 py-1.5
                                rounded-lg border text-xs font-semibold
                                transition-all duration-300 ease-in-out hover:-translate-y-0.5
                                focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white
                                ${isActive ? filterTagStyles[tag.value].active : filterTagStyles[tag.value].inactive}
                            `}
                        >
                            <span>{tag.label}</span>
                            {count > 0 && (
                                <span
                                    className={`
                                        text-[9px] px-1 py-0.2 rounded min-w-[14px] text-center
                                        ${isActive ? 'bg-black/20' : 'bg-current/10'}
                                    `}
                                    aria-label={`${count} result${count !== 1 ? 's' : ''}`}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Type definitions
interface SearchResultItem {
    id: number;
    title: string;
    category: string;
    desc: string;
    type: string;
    page?: string;
}

interface FeaturedConfig {
    title: string;
    badge: string;
    badgeColor: string;
    desc: string;
    scienceScore?: number;
    points?: string[];
    action: string;
}

interface TechColorConfig {
    activeBg: string;
    activeBorder: string;
    activeShadow: string;
    iconActiveBg: string;
    iconActiveShadow: string;
    iconDefaultBg: string;
    iconDefaultText: string;
    subtitleActive: string;
    subtitleDefault: string;
    barActive: string;
    arrowActive: string;
    shimmer: string;
    featured: FeaturedConfig;
    trendingTags: string[];
}

interface MegaMenuPanelProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearchFocus: () => void;
    onSearchClear: () => void;
    showResults: boolean;
    debouncedQuery: string;
    onResultClick: (item: SearchResultItem) => void;
    currentConfig: TechColorConfig;
    searchContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const MegaMenuPanel: React.FC<MegaMenuPanelProps> = ({
    searchQuery, onSearchChange, onSearchFocus, onSearchClear,
    showResults, debouncedQuery, onResultClick, currentConfig,
    searchContainerRef
}) => {
    // Filter state
    const [activeFilter, setActiveFilter] = useState<MegaMenuFilterTag>('all');
    const [actionStatus, setActionStatus] = useState('Navigation search ready.');
    // Recent searches state
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    // Recent pages state
    const [recentPages, setRecentPages] = useState<RecentPage[]>([]);

    // Load recent searches and pages on mount
    useEffect(() => {
        setRecentSearches(getRecentSearches());
        setRecentPages(getRecentPages());
    }, []);

    // Refresh recent searches when dropdown opens
    useEffect(() => {
        if (showResults) {
            setRecentSearches(getRecentSearches());
            setRecentPages(getRecentPages());
        }
    }, [showResults]);

    // Handle result click with recent search save
    const handleResultClick = (item: SearchResultItem) => {
        addRecentSearch(searchQuery || item.title);
        setActionStatus(`Opening ${item.title}.`);
        onResultClick(item);
    };

    const handleRecentPageClick = (page: RecentPage) => {
        setActionStatus(`Opening recent page: ${page.title}.`);
        onResultClick({
            id: 0,
            title: page.title,
            category: 'Recent pages',
            desc: 'Recently visited page',
            type: 'page',
            page: page.url,
        });
    };

    const handlePresetSearch = useCallback((term: string) => {
        const event = { target: { value: term } } as React.ChangeEvent<HTMLInputElement>;
        setActionStatus(`Suggested search selected: ${term}.`);
        onSearchChange(event);
    }, [onSearchChange]);

    const handlePanelSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.currentTarget.value;
        setActionStatus(value.trim() ? `Navigation search updated for "${value}".` : 'Navigation search cleared.');
        onSearchChange(event);
    }, [onSearchChange]);

    const handlePanelSearchFocus = useCallback(() => {
        setActionStatus('Navigation search ready.');
        onSearchFocus();
    }, [onSearchFocus]);

    const handlePanelSearchClear = useCallback(() => {
        setActionStatus('Navigation search cleared.');
        onSearchClear();
    }, [onSearchClear]);

    /**
     * Smart fuzzy search with synonym expansion and relevance scoring
     * Matches against: title, category, desc, keywords, and related terms
     * Also expands query using synonyms for intelligent matching
     */
    const filteredResults = useMemo((): (SearchDatabaseItem & { score: number })[] => {
        if (debouncedQuery.length === 0) return [];

        const query = debouncedQuery.toLowerCase().trim();
        const queryWords = query.split(/\s+/).filter(w => w.length > 0);

        // Expand query with synonyms
        const expandedTerms = new Set<string>([query, ...queryWords]);
        queryWords.forEach(word => {
            const synonyms = SEARCH_SYNONYMS[word];
            if (synonyms) {
                synonyms.forEach(s => expandedTerms.add(s));
            }
        });

        // Score and filter items
        const scored = SEARCH_DATABASE.map(item => {
            let score = 0;
            const titleLower = item.title.toLowerCase();
            const categoryLower = item.category.toLowerCase();
            const descLower = item.desc.toLowerCase();
            const keywords = item.keywords || [];
            const relatedTerms = item.relatedTerms || [];

            // Check each query word and its synonyms
            queryWords.forEach(word => {
                // Exact title match (highest priority)
                if (titleLower === word) score += 100;
                else if (titleLower.startsWith(word)) score += 80;
                else if (titleLower.includes(word)) score += 60;

                // Category match
                if (categoryLower.includes(word)) score += 40;

                // Description match
                if (descLower.includes(word)) score += 20;

                // Keywords match (important for product discovery)
                keywords.forEach(kw => {
                    if (kw === word) score += 50;
                    else if (kw.startsWith(word)) score += 35;
                    else if (kw.includes(word)) score += 25;
                });

                // Related terms match
                relatedTerms.forEach(rt => {
                    if (rt.includes(word)) score += 15;
                });
            });

            // Check expanded synonyms (lower weight - these are inferred matches)
            expandedTerms.forEach(term => {
                if (!queryWords.includes(term)) {
                    if (keywords.some(kw => kw.includes(term))) score += 10;
                    if (relatedTerms.some(rt => rt.includes(term))) score += 5;
                }
            });

            // Prefix matching for partial words (e.g., "hyper" matches "hyperbaric")
            queryWords.forEach(word => {
                if (word.length >= 3) {
                    keywords.forEach(kw => {
                        if (kw.startsWith(word) && !kw.includes(word)) score += 20;
                    });
                }
            });

            return { ...item, score };
        });

        // Filter items with score > 0 and sort by relevance
        return scored
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
    }, [debouncedQuery]);

    const groupedResults = useMemo(() => {
        if (filteredResults.length === 0) return [];
        const categories = Array.from(new Set(filteredResults.map(i => i.category)));
        return categories.map(cat => ({
            category: cat,
            items: filteredResults.filter(i => i.category === cat),
        }));
    }, [filteredResults]);

    // Result counts per category for filter badges
    const resultCounts = useMemo((): Record<MegaMenuFilterTag, number> => {
        const counts: Record<string, number> = {};
        filteredResults.forEach(item => {
            counts[item.category] = (counts[item.category] || 0) + 1;
        });
        return {
            all: filteredResults.length,
            Products: counts['Products'] || 0,
            Protocols: counts['Protocols'] || 0,
            Science: counts['Science'] || 0,
            Resources: counts['Resources'] || 0,
            Tools: counts['Tools'] || 0,
        };
    }, [filteredResults]);

    const handleFilterChange = useCallback((filter: MegaMenuFilterTag) => {
        const label = FILTER_TAGS.find((tag) => tag.value === filter)?.label ?? filter;
        const count = resultCounts[filter];
        setActionStatus(`${label} filter applied with ${count} result${count === 1 ? '' : 's'}.`);
        setActiveFilter(filter);
    }, [resultCounts]);

    // Filtered grouped results based on active filter
    const displayResults = useMemo(() => {
        if (activeFilter === 'all') {
            return groupedResults;
        }
        return groupedResults.filter(group => group.category === activeFilter);
    }, [groupedResults, activeFilter]);

    // Reset filter when search changes
    useEffect(() => {
        setActiveFilter('all');
    }, [debouncedQuery]);

    return (
        <div className="relative col-span-full flex min-h-[360px] flex-col overflow-hidden border-l border-[var(--border-soft)] bg-white/55 p-3 lg:p-3.5 group/panel lg:col-span-3 lg:min-h-0">
            {/* Quick Search Bar */}
            <div className="relative z-40 mb-2.5" ref={searchContainerRef}>
                <p
                    id={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={MEGA_MENU_SEARCH_ACTION_STATUS_LABEL}
                    className="sr-only"
                >
                    {actionStatus}
                </p>
                <div className="relative group/search">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within/search:text-[var(--accent-oxygen)]" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handlePanelSearchChange}
                        onFocus={handlePanelSearchFocus}
                        placeholder={'Search products, protocols, evidence\u2026'}
                        aria-label="Search"
                        aria-describedby={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                        className="w-full min-h-11 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-9 text-[13.5px] font-medium text-slate-950 placeholder:text-slate-500 placeholder:text-[12.5px] transition-colors duration-150 focus:border-cyan-500/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 hover:border-cyan-400/50"
                    />
                    {searchQuery.length > 0 ? (
                        <button
                            type="button"
                            onClick={handlePanelSearchClear}
                            className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                            aria-label="Clear search"
                            aria-describedby={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                        >
                            <X size={15} />
                        </button>
                    ) : (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <SlidersHorizontal size={13} />
                        </div>
                    )}
                </div>

                {/* Instant Results Dropdown */}
                <AnimatePresence>
                    {/* Show recent/popular when focused with empty query */}
                    {showResults && searchQuery.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.98 }}
                            transition={SEARCH_TRANSITION}
                            className="absolute top-full left-0 right-0 mt-2.5 z-50 overflow-hidden rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xl transition-all duration-200"
                        >
                            {/* Recent Pages */}
                            {recentPages.length > 0 && (
                                <div className="mb-3.5">
                                    <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-500 block mb-1.5 futuristic-font">
                                        Recent pages
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {recentPages.slice(0, 4).map(page => (
                                            <button
                                                key={page.url}
                                                type="button"
                                                aria-describedby={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                                                onClick={() => handleRecentPageClick(page)}
                                                className="min-h-11 rounded-lg border border-[var(--border-soft)] bg-white px-2.5 py-1 text-xs font-semibold text-slate-950 transition-colors hover:border-cyan-500/30 hover:bg-cyan-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                            >
                                                {page.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="mb-3.5">
                                    <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-500 block mb-1.5 futuristic-font">
                                        Recent searches
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {recentSearches.slice(0, 4).map(term => (
                                            <button
                                                key={term}
                                                type="button"
                                                aria-describedby={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                                                onClick={() => handlePresetSearch(term)}
                                                className="min-h-11 rounded-lg border border-[var(--border-soft)] bg-white px-2.5 py-1 text-xs font-semibold text-slate-950 transition-colors hover:border-cyan-500/30 hover:bg-cyan-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular Searches */}
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-slate-500 block mb-1.5 futuristic-font">
                                    Popular searches
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {POPULAR_SEARCHES.map(term => (
                                        <button
                                            key={term}
                                            type="button"
                                            aria-describedby={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                                            onClick={() => handlePresetSearch(term)}
                                            className="min-h-11 rounded-lg border border-cyan-500/20 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 transition-colors hover:border-cyan-500/40 hover:bg-cyan-100 hover:text-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Show results when there's a query */}
                    {showResults && searchQuery.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.98 }}
                            transition={SEARCH_TRANSITION}
                            className="absolute top-full left-0 right-0 mt-2.5 z-50 max-h-[420px] overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xl transition-all duration-200 custom-scrollbar"
                        >
                            {/* Filter Tag Bar */}
                            <FilterTagBar
                                activeFilter={activeFilter}
                                actionStatusId={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                                onFilterChange={handleFilterChange}
                                resultCounts={resultCounts}
                            />

                            {displayResults.length > 0 ? (
                                <div className="p-1 space-y-4">
                                    {displayResults.map(group => {
                                        const colors = categoryColors[group.category] || { text: 'text-cyan-400', dot: 'bg-cyan-400' };
                                        return (
                                            <div key={group.category}>
                                                <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${colors.text} mb-2 px-2 flex items-center gap-1.5 futuristic-font`}>
                                                    <div className={`w-1 h-1 rounded-sm ${colors.dot}`} />
                                                    {group.category}
                                                </div>
                                            <div className="space-y-1">
                                                {group.items.map(item => (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        aria-describedby={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                                                        onClick={() => handleResultClick(item)}
                                                        className="group/res flex min-h-14 w-full items-center justify-between gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-xs font-semibold text-slate-800 transition-colors group-hover/res:text-slate-950 futuristic-font break-words">{item.title}</div>
                                                            <div className="text-[11px] text-slate-500 leading-snug mt-0.5 break-words">{item.desc}</div>
                                                        </div>
                                                        <ArrowRight size={13} className="shrink-0 text-slate-400 opacity-0 transition-[opacity,transform] group-hover/res:translate-x-0.5 group-hover/res:opacity-100 ml-auto" />
                                                    </button>
                                                ))}
                                            </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-5 text-center">
                                    <Pointer size={20} className="opacity-25 mx-auto mb-2 text-slate-500" />
                                    <div className="text-xs text-slate-500 mb-3">No intelligence match for &ldquo;<span className="text-slate-700 font-medium">{searchQuery}</span>&rdquo;</div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            aria-describedby={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                                            onClick={() =>
                                                handleResultClick({
                                                    id: 0,
                                                    title: 'Contact',
                                                    category: '',
                                                    desc: '',
                                                    type: 'contact',
                                                    page: 'contact',
                                                })
                                            }
                                            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-50 px-3.5 py-1.5 text-xs font-semibold text-cyan-700 transition-colors hover:bg-cyan-100 hover:text-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                                        >
                                            Contact us <ArrowRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Context Dynamic View - Stable Reference Layout matching media_1789415241958.jpg */}
            <div className="custom-scrollbar relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto pr-1">
                <div className="space-y-2.5">
                    {/* NAVIGATION SEARCH Feature Card */}
                    <div className="rounded-xl border border-[var(--border-soft)] bg-white/70 p-3 sm:p-3.5 shadow-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Settings size={14} className="text-slate-950" />
                            <span className="text-[13px] sm:text-[13.5px] font-black uppercase tracking-[0.16em] text-slate-950 futuristic-font">
                                NAVIGATION SEARCH
                            </span>
                        </div>
                        <p className="text-[12px] sm:text-[12.5px] text-slate-800 leading-snug font-medium">
                            Search across systems, protocols, research, support and more.
                        </p>

                        {/* Dark Pill CTA */}
                        <button
                            type="button"
                            aria-describedby={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                            onClick={() => handlePresetSearch('')}
                            className="mt-2.5 flex min-h-[34px] w-full items-center justify-between rounded-full bg-slate-900 px-4 py-1 text-[12.5px] sm:text-[13px] font-bold text-white shadow-xs transition-colors hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                            <span>Search Hylono Intelligence...</span>
                            <ArrowRight size={13} className="text-slate-300" />
                        </button>

                        {/* Indicators: INSTANT & CONTEXT */}
                        <div className="mt-2.5 space-y-1.5">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-xs">
                                    <Settings size={12} />
                                </div>
                                <div>
                                    <div className="text-[11px] sm:text-[11.5px] font-black uppercase tracking-wider text-slate-950 leading-tight">INSTANT</div>
                                    <div className="text-[11.5px] sm:text-[12px] text-slate-700 leading-tight font-medium">Get results as you type.</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-xs">
                                    <Compass size={12} />
                                </div>
                                <div>
                                    <div className="text-[11px] sm:text-[11.5px] font-black uppercase tracking-wider text-slate-950 leading-tight">CONTEXT</div>
                                    <div className="text-[11.5px] sm:text-[12px] text-slate-700 leading-tight font-medium">See related systems, protocols and guidance.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUGGESTED SEARCHES */}
                    <div>
                        <p className="mb-1.5 text-[11px] sm:text-[11.5px] font-black uppercase tracking-[0.18em] text-slate-950">
                            SUGGESTED SEARCHES
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {['Wellness Tech', 'Guided Access', 'Recovery'].map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    aria-describedby={MEGA_MENU_SEARCH_ACTION_STATUS_ID}
                                    onClick={() => handlePresetSearch(tag)}
                                    className="min-h-[28px] sm:min-h-[30px] rounded-full border border-[var(--border-soft)] bg-white px-3.5 py-1 text-[12px] font-bold text-slate-950 shadow-xs transition-colors hover:border-cyan-500/35 hover:bg-cyan-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* HYLONO INTELLIGENCE Card */}
                    <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-white/70 p-3 sm:p-3.5 shadow-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Atom size={14} className="text-slate-950" />
                            <h2 className="text-[12.5px] sm:text-[13px] font-black uppercase tracking-[0.14em] text-slate-950 font-sans">
                                HYLONO INTELLIGENCE
                            </h2>
                        </div>
                        <p className="text-[12px] sm:text-[12.5px] text-slate-700 leading-snug mb-2 break-words font-medium">
                            Navigate Hylono&apos;s guided wellness technology map. Hover over any technology or tool to review structured context.
                        </p>
                        <div className="relative h-[85px] sm:h-[95px] lg:h-[105px] w-full overflow-hidden rounded-xl border border-slate-200/80 shadow-xs">
                            <Image
                                src="/images/megamenu/intelligence-thumb.jpg"
                                alt="Hylono Intelligence Portal"
                                fill
                                priority
                                sizes="350px"
                                className="object-cover transform-gpu will-change-transform"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
