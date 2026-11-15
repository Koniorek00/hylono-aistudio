import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, X, Clock, ArrowRight, FileText, Target, Package, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '../content/products';
import { protocols } from '../content/protocols';
import { goals } from '../content/goals';
import { goalSearchTerms, synonymGroups } from '../config/searchSynonyms';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import {
  addRecentSearch,
  getAutocompleteSuggestions,
  getRecentPages,
  getRecentSearches,
  type RecentPage,
} from '../utils/searchStorage';
import { priceBookMonthlyText } from '@/lib/money';

interface GlobalSearchProps {
  onNavigate: (page: string) => void;
  onOpen?: () => void;
}

type SearchResultType = 'product' | 'protocol' | 'goal' | 'page';
type SearchFilterTag = 'all' | 'product' | 'protocol' | 'goal';

interface BaseSearchItem {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  keywords: string[];
}

interface ProductSearchItem extends BaseSearchItem {
  type: 'product';
  image?: string;
  rentalFrom?: string;
}

interface ProtocolSearchItem extends BaseSearchItem {
  type: 'protocol';
}

interface GoalSearchItem extends BaseSearchItem {
  type: 'goal';
}

interface PageSearchItem extends BaseSearchItem {
  type: 'page';
}

type SearchItem = ProductSearchItem | ProtocolSearchItem | GoalSearchItem | PageSearchItem;

interface ScoredSearchItem {
  item: SearchItem;
  score: number;
}

const normalize = (value: string): string => value.toLowerCase().trim();

const splitTerms = (value: string): string[] =>
  normalize(value)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 1);

const modalityRouteByProduct = {
  HBOT: 'product/HBOT',
  H2_inhalation: 'product/HYDROGEN',
  H2_water: 'product/HYDROGEN',
  RLT_NIR: 'product/RLT',
  PEMF: 'product/PEMF',
  VNS: 'product/VNS',
  O2: 'store',
} as const;

const searchPages: PageSearchItem[] = [
  {
    id: 'page-store',
    type: 'page',
    title: 'Store',
    description: 'Browse all technologies and compare purchase and rental paths',
    url: 'store',
    keywords: ['store', 'shop', 'products', 'buy', 'rent'],
  },
  {
    id: 'page-builder',
    type: 'page',
    title: 'Wellness Planner',
    description: 'Configure a stack based on your goal and routine',
    url: 'wellness-planner',
    keywords: ['builder', 'planner', 'stack', 'configure', 'protocol', 'wellness'],
  },
  {
    id: 'page-advisors',
    type: 'page',
    title: 'Contact Hylono',
    description: 'Ask the support team about fit, delivery, rental, or clinic planning',
    url: 'contact',
    keywords: ['advisor', 'consultation', 'support', 'help'],
  },
];

const typeBadgeStyles: Record<SearchResultType, string> = {
  product: 'border border-cyan-300/30 bg-cyan-400/15 text-cyan-100',
  protocol: 'border border-violet-300/30 bg-violet-400/15 text-violet-100',
  goal: 'border border-emerald-300/30 bg-emerald-400/15 text-emerald-100',
  page: 'border border-white/10 bg-white/[0.045] text-slate-200',
};

const filterTagStyles: Record<SearchFilterTag, { active: string; inactive: string }> = {
  all: {
    active: 'border-cyan-300 bg-cyan-300 text-slate-950',
    inactive: 'border-white/10 bg-white/[0.045] text-slate-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white',
  },
  product: {
    active: 'border-cyan-300 bg-cyan-400 text-slate-950',
    inactive: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100 hover:border-cyan-300/50 hover:bg-cyan-400/15',
  },
  protocol: {
    active: 'border-violet-300 bg-violet-400 text-slate-950',
    inactive: 'border-violet-300/30 bg-violet-400/10 text-violet-100 hover:border-violet-300/50 hover:bg-violet-400/15',
  },
  goal: {
    active: 'border-emerald-300 bg-emerald-400 text-slate-950',
    inactive: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100 hover:border-emerald-300/50 hover:bg-emerald-400/15',
  },
};

const FILTER_TAGS: { value: SearchFilterTag; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'product', label: 'Product' },
  { value: 'protocol', label: 'Protocol' },
  { value: 'goal', label: 'Goal' },
];

const GLOBAL_SEARCH_ACTION_STATUS_ID = 'global-search-action-status';
const GLOBAL_SEARCH_ACTION_STATUS_LABEL = 'Global search action status';
const GLOBAL_SEARCH_READY_STATUS = 'Global search ready.';

const noResultRecoveryLinks = [
  {
    href: '/wellness-planner',
    label: 'Configure a stack',
    target: 'wellness-planner',
    className: 'text-cyan-100 hover:text-cyan-50',
  },
  {
    href: '/advisors',
    label: 'Request guidance',
    target: 'advisors',
    className: 'text-slate-200 hover:text-white',
  },
  {
    href: '/contact',
    label: 'Contact us',
    target: 'contact',
    className: 'text-violet-100 hover:text-violet-50',
  },
] as const;

const noResultRecoveryLinkClassName =
  'inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 motion-reduce:transition-none';

interface FilterTagBarProps {
  activeFilter: SearchFilterTag;
  onFilterChange: (filter: SearchFilterTag) => void;
  resultCounts: { product: number; protocol: number; goal: number };
  statusId: string;
}

const FilterTagBar: React.FC<FilterTagBarProps> = ({
  activeFilter,
  onFilterChange,
  resultCounts,
  statusId,
}) => {
  const tagRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, currentIndex: number) => {
    const tags = FILTER_TAGS;
    let newIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      newIndex = (currentIndex + 1) % tags.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      newIndex = currentIndex === 0 ? tags.length - 1 : currentIndex - 1;
    } else if (event.key === 'Home') {
      event.preventDefault();
      newIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      newIndex = tags.length - 1;
    }

    if (newIndex !== currentIndex) {
      const nextTag = tags[newIndex];
      if (!nextTag) return;

      onFilterChange(nextTag.value);
      const buttons = tagRef.current?.querySelectorAll('button');
      buttons?.[newIndex]?.focus();
    }
  }, [onFilterChange]);

  return (
    <div
      ref={tagRef}
      className="flex items-center gap-2 overflow-x-auto border-b border-white/10 px-4 py-3 scrollbar-hide"
      role="radiogroup"
      aria-label="Filter search results by category"
    >
      <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
        <Filter size={12} /> Filter
      </span>
      <div className="flex items-center gap-2">
        {FILTER_TAGS.map((tag, index) => {
          const isActive = activeFilter === tag.value;
          const count = tag.value === 'all'
            ? resultCounts.product + resultCounts.protocol + resultCounts.goal
            : resultCounts[tag.value];

          return (
            <button
              key={tag.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              tabIndex={isActive ? 0 : -1}
              aria-describedby={statusId}
              onClick={() => onFilterChange(tag.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px]
                rounded-full border text-sm font-semibold
                transition-[color,background-color,border-color,box-shadow] duration-150 ease-in-out
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:ring-cyan-300
                ${isActive ? filterTagStyles[tag.value].active : filterTagStyles[tag.value].inactive}
              `}
            >
              <span>{tag.label}</span>
              {count > 0 && (
                <span
                  className={`
                    text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center
                    ${isActive ? 'bg-white/20' : 'bg-current/10'}
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

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate, onOpen }) => {
  const searchEnhancedEnabled = useFeatureFlag('feature_search_enhanced');
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilterTag>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const [isCompactResults, setIsCompactResults] = useState(false);
  const [searchActionStatus, setSearchActionStatus] = useState(GLOBAL_SEARCH_READY_STATUS);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchDialogRef = useFocusTrap<HTMLDivElement>({
    active: isOpen,
    initialFocus: '#global-search-input',
    clickOutsideDeactivates: false,
    escapeDeactivates: false,
  });

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    setRecentPages(getRecentPages());
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (typeof window.matchMedia !== 'function') {
      setIsCompactResults(false);
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncCompactResults = (matches: boolean) => setIsCompactResults(matches);
    const handleChange = (event: MediaQueryListEvent) => syncCompactResults(event.matches);

    syncCompactResults(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset filter when search closes
  useEffect(() => {
    if (!isOpen) {
      setActiveFilter('all');
    }
  }, [isOpen]);

  const synonymLookup = useMemo(() => {
    const lookup = new Map<string, Set<string>>();

    synonymGroups.forEach((group) => {
      const normalizedGroup = Array.from(new Set(group.map((term) => normalize(term))));
      normalizedGroup.forEach((term) => {
        if (!lookup.has(term)) lookup.set(term, new Set<string>());
        const targetSet = lookup.get(term);
        if (!targetSet) return;

        normalizedGroup.forEach((candidate) => {
          if (candidate !== term) targetSet.add(candidate);
        });
      });
    });

    return lookup;
  }, []);

  const searchableProducts = useMemo<ProductSearchItem[]>(
    () =>
      products.map((product) => ({
        id: product.id,
        type: 'product',
        title: product.title,
        description: product.shortDescription,
        url: modalityRouteByProduct[product.modality],
        image: product.images[0],
        rentalFrom: product.rentalPlans?.[0]?.monthlyPrice
            ? priceBookMonthlyText(product.rentalPlans[0].monthlyPrice)
            : undefined,
        keywords: [
          product.modality,
          ...product.goalTags,
          ...product.protocolIds,
          ...product.contraindications,
          ...product.safetyNotes,
          ...splitTerms(product.title),
          ...splitTerms(product.shortDescription),
        ],
      })),
    []
  );

  const searchableProtocols = useMemo<ProtocolSearchItem[]>(
    () =>
      protocols.map((protocol) => ({
        id: protocol.slug,
        type: 'protocol',
        title: protocol.title,
        description: protocol.shortDescription,
        url: `protocols/${protocol.slug}`,
        keywords: [
          protocol.goal,
          protocol.goalTag,
          protocol.targetAudience,
          ...protocol.evidenceIds,
          ...splitTerms(protocol.title),
          ...splitTerms(protocol.shortDescription),
        ],
      })),
    []
  );

  const searchableGoals = useMemo<GoalSearchItem[]>(
    () =>
      goals.map((goal) => ({
        id: goal.slug,
        type: 'goal',
        title: goal.title,
        description: goal.subtitle,
        url: `conditions/${goal.slug}`,
        keywords: [
          goal.slug,
          ...goal.evidenceIds,
          ...goal.modalities.map((modality) => modality.shortName),
          ...splitTerms(goal.title),
          ...splitTerms(goal.description),
          ...(goalSearchTerms[goal.slug] ?? []),
        ],
      })),
    []
  );

  const allSearchItems = useMemo<SearchItem[]>(
    () => [...searchableProducts, ...searchableProtocols, ...searchableGoals, ...searchPages],
    [searchableProducts, searchableProtocols, searchableGoals]
  );

  const expandedTerms = useMemo(() => {
    const queryTrimmed = normalize(query);
    if (!queryTrimmed) return [] as string[];

    const terms = new Set<string>([queryTrimmed, ...splitTerms(queryTrimmed)]);

    const goalEntries = Object.entries(goalSearchTerms).map(([goalKey, termsList]) => ({
      goalKey: normalize(goalKey),
      terms: termsList.map((term) => normalize(term)),
    }));

    Array.from(terms).forEach((term) => {
      synonymLookup.forEach((related, key) => {
        if (key === term || key.includes(term) || term.includes(key)) {
          terms.add(key);
          related.forEach((relatedTerm) => terms.add(relatedTerm));
        }
      });

      goalEntries.forEach((entry) => {
        const matchesGoalTerm = entry.terms.some(
          (goalTerm) => goalTerm === term || goalTerm.includes(term) || term.includes(goalTerm)
        );
        if (matchesGoalTerm) {
          terms.add(entry.goalKey);
          entry.terms.forEach((goalTerm) => terms.add(goalTerm));
        }
      });
    });

    return Array.from(terms).filter((term) => term.length > 1);
  }, [query, synonymLookup]);

  const scoredResults = useMemo<ScoredSearchItem[]>(() => {
    if (!query.trim()) return [];

    const normalizedQuery = normalize(query);

    return allSearchItems
      .map((item) => {
        const title = normalize(item.title);
        const description = normalize(item.description);
        const keywords = item.keywords.map((keyword) => normalize(keyword));

        let score = 0;

        if (title === normalizedQuery) score += 120;
        else if (title.startsWith(normalizedQuery)) score += 90;
        else if (title.includes(normalizedQuery)) score += 65;

        if (description.includes(normalizedQuery)) score += 30;

        expandedTerms.forEach((term) => {
          if (title.includes(term)) score += term === normalizedQuery ? 35 : 18;
          if (description.includes(term)) score += 12;
          if (keywords.some((keyword) => keyword.includes(term))) score += 22;
        });

        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [allSearchItems, expandedTerms, query]);

  const groupedResults = useMemo(() => {
    const productsGroup = scoredResults.filter((entry) => entry.item.type === 'product').map((entry) => entry.item as ProductSearchItem);
    const protocolsGroup = scoredResults
      .filter((entry) => entry.item.type === 'protocol')
      .map((entry) => entry.item as ProtocolSearchItem);
    const goalsGroup = scoredResults.filter((entry) => entry.item.type === 'goal').map((entry) => entry.item as GoalSearchItem);

    return {
      products: productsGroup,
      protocols: protocolsGroup,
      goals: goalsGroup,
      total: productsGroup.length + protocolsGroup.length + goalsGroup.length,
    };
  }, [scoredResults]);

  // Result counts for filter badges
  const resultCounts = useMemo(
    () => ({
      product: groupedResults.products.length,
      protocol: groupedResults.protocols.length,
      goal: groupedResults.goals.length,
    }),
    [groupedResults]
  );

  // Filtered results based on active filter
  const filteredResults = useMemo(() => {
    if (activeFilter === 'all') {
      // Return mixed results prioritized by relevance
      return {
        products: groupedResults.products.slice(0, isCompactResults ? 3 : 4),
        protocols: groupedResults.protocols.slice(0, isCompactResults ? 2 : 3),
        goals: groupedResults.goals.slice(0, isCompactResults ? 2 : 3),
        showProducts: groupedResults.products.length > 0,
        showProtocols: groupedResults.protocols.length > 0,
        showGoals: groupedResults.goals.length > 0,
      };
    }

    // Return only results matching the active filter
    if (activeFilter === 'product') {
      return {
        products: groupedResults.products.slice(0, isCompactResults ? 6 : 10),
        protocols: [],
        goals: [],
        showProducts: true,
        showProtocols: false,
        showGoals: false,
      };
    }
    if (activeFilter === 'protocol') {
      return {
        products: [],
        protocols: groupedResults.protocols.slice(0, isCompactResults ? 6 : 10),
        goals: [],
        showProducts: false,
        showProtocols: true,
        showGoals: false,
      };
    }
    if (activeFilter === 'goal') {
      return {
        products: [],
        protocols: [],
        goals: groupedResults.goals.slice(0, isCompactResults ? 6 : 10),
        showProducts: false,
        showProtocols: false,
        showGoals: true,
      };
    }

    return {
      products: [],
      protocols: [],
      goals: [],
      showProducts: false,
      showProtocols: false,
      showGoals: false,
    };
  }, [activeFilter, groupedResults, isCompactResults]);

  const legacyResults = useMemo(() => scoredResults.slice(0, 8).map((entry) => entry.item), [scoredResults]);

  const saveRecentSearch = (value: string) => {
    addRecentSearch(value);
    setRecentSearches(getRecentSearches());
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setSearchActionStatus(
      value.trim()
        ? `Search query updated for "${value.trim()}".`
        : 'Search query cleared.'
    );
  };

  const applySuggestedQuery = (value: string, source: 'suggestion' | 'recent' | 'popular') => {
    setQuery(value);
    const sourceLabel = source === 'suggestion' ? 'Suggestion' : source === 'recent' ? 'Recent search' : 'Popular search';
    setSearchActionStatus(`${sourceLabel} selected for "${value}".`);
  };

  const clearQuery = () => {
    setQuery('');
    setSearchActionStatus('Search query cleared.');
  };

  const announceResultAction = (item: SearchItem) => {
    setSearchActionStatus(`${item.type.charAt(0).toUpperCase()}${item.type.slice(1)} result "${item.title}" ready. Opens ${item.url}.`);
  };

  const announceRecentPageAction = (page: RecentPage) => {
    setSearchActionStatus(`Recent page "${page.title}" ready. Opens ${page.url}.`);
  };

  const announceRecoveryLinkAction = (label: string, target: string) => {
    setSearchActionStatus(`${label} recovery link ready. Opens ${target}.`);
  };

  const updateFilter = (filter: SearchFilterTag) => {
    setActiveFilter(filter);
    setSearchActionStatus(
      filter === 'all'
        ? 'All result categories shown.'
        : `${filter.charAt(0).toUpperCase()}${filter.slice(1)} results filter selected.`
    );
  };

  const navigateToResult = (item: SearchItem) => {
    setSearchActionStatus(`Opening ${item.title}.`);
    saveRecentSearch(query || item.title);
    setIsOpen(false);
    setQuery('');
    onNavigate(item.url);
  };

  // Autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    return getAutocompleteSuggestions(query, 5);
  }, [query]);

  const popularTerms = ['HBOT', 'Hydrogen', 'Protocols', 'Recovery', 'Financing'];

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onOpen?.();
          setSearchActionStatus(GLOBAL_SEARCH_READY_STATUS);
          setIsOpen(true);
        }}
        className="flex min-h-11 min-w-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-sm text-[var(--text-secondary)] shadow-xs transition-colors hover:bg-white/[0.08] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        aria-label="Open global search"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'global-search-dialog' : undefined}
      >
        <Search size={16} />
        <span className="hidden lg:inline">Search...</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[85] bg-slate-950/75 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              ref={searchDialogRef}
              id="global-search-dialog"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-[8%] sm:top-[10%] z-[86] flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-950 text-white shadow-[0_30px_80px_rgba(2,6,23,0.55)]"
              role="dialog"
              aria-modal="true"
              aria-label="Global search"
              tabIndex={-1}
            >
              <p
                id={GLOBAL_SEARCH_ACTION_STATUS_ID}
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={GLOBAL_SEARCH_ACTION_STATUS_LABEL}
              >
                {searchActionStatus}
              </p>

              <div className="flex items-center gap-3 border-b border-white/10 p-4">
                <Search size={18} className="text-cyan-200" />
                <input
                  id="global-search-input"
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => updateQuery(event.target.value)}
                  placeholder="Search products, protocols, goals..."
                  className="flex-1 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
                  aria-label="Search input"
                  aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearQuery}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] p-1.5 text-slate-200 transition-colors hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    aria-label="Clear search"
                    aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Filter Tag Bar - only show when there's a query and results */}
              {query.trim() && searchEnhancedEnabled && groupedResults.total > 0 && (
                <FilterTagBar
                  activeFilter={activeFilter}
                  onFilterChange={updateFilter}
                  resultCounts={resultCounts}
                  statusId={GLOBAL_SEARCH_ACTION_STATUS_ID}
                />
              )}

              <div className="flex-1 max-h-[calc(90vh-8rem)] overflow-y-auto overscroll-contain p-3">
                {query.trim() ? (
                  searchEnhancedEnabled ? (
                    <div className="space-y-4">
                      {/* Autocomplete Suggestions - show when typing but before results */}
                      {autocompleteSuggestions.length > 0 && groupedResults.total === 0 && (
                        <section aria-labelledby="autocomplete-heading">
                          <h4 id="autocomplete-heading" className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">Suggestions</h4>
                          <div className="space-y-1">
                            {autocompleteSuggestions.map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => applySuggestedQuery(suggestion, 'suggestion')}
                                aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                                className="flex min-h-11 w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
                              >
                                <Search size={14} className="text-slate-500" />
                                <span className="text-sm text-slate-200">{suggestion}</span>
                              </button>
                            ))}
                          </div>
                        </section>
                      )}

                      {filteredResults.showProducts && filteredResults.products.length > 0 && (
                        <section aria-labelledby="products-heading">
                          <h4 id="products-heading" className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">Products</h4>
                          <div className="space-y-1">
                            {filteredResults.products.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                                onFocus={() => announceResultAction(product)}
                                onClick={() => navigateToResult(product)}
                                className="flex min-h-14 w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
                              >
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt=""
                                    aria-hidden="true"
                                    width={44}
                                    height={44}
                                    className="h-11 w-11 rounded-lg border border-white/10 object-cover"
                                  />
                                ) : (
                                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/[0.045] text-slate-300">
                                    <Package size={16} aria-hidden="true" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-white">{product.title}</p>
                                  <p className="truncate text-xs text-slate-400">{product.description}</p>
                                </div>
                                {product.rentalFrom && <span className="text-xs font-semibold text-slate-400">{product.rentalFrom}</span>}
                              </button>
                            ))}
                          </div>
                        </section>
                      )}

                      {filteredResults.showProtocols && filteredResults.protocols.length > 0 && (
                        <section aria-labelledby="protocols-heading">
                          <h4 id="protocols-heading" className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-100">Protocols</h4>
                          <div className="space-y-1">
                            {filteredResults.protocols.map((protocol) => (
                              <button
                                key={protocol.id}
                                type="button"
                                aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                                onFocus={() => announceResultAction(protocol)}
                                onClick={() => navigateToResult(protocol)}
                                className="flex min-h-14 w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-300"
                              >
                                <FileText size={16} className="text-violet-500" aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-white">{protocol.title}</p>
                                  <p className="truncate text-xs text-slate-400">{protocol.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </section>
                      )}

                      {filteredResults.showGoals && filteredResults.goals.length > 0 && (
                        <section aria-labelledby="goals-heading">
                          <h4 id="goals-heading" className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-100">Goals</h4>
                          <div className="space-y-1">
                            {filteredResults.goals.map((goal) => (
                              <button
                                key={goal.id}
                                type="button"
                                aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                                onFocus={() => announceResultAction(goal)}
                                onClick={() => navigateToResult(goal)}
                                className="flex min-h-14 w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300"
                              >
                                <Target size={16} className="text-emerald-500" aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-white">{goal.title}</p>
                                  <p className="truncate text-xs text-slate-400">{goal.description}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* No results for active filter */}
                      {groupedResults.total > 0 && activeFilter !== 'all' && resultCounts[activeFilter] === 0 && (
                        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4 text-center">
                          <p className="mb-3 text-sm text-slate-300">
                            No <span className="font-semibold">{activeFilter}</span> results found for "{query}"
                          </p>
                          <button
                            type="button"
                            onClick={() => updateFilter('all')}
                            aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                          >
                            <X size={14} /> Clear filter
                          </button>
                        </div>
                      )}

                      {/* No results at all */}
                      {groupedResults.total === 0 && query.trim().length > 2 && (
                        <div className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                          <p className="mb-3 text-sm text-slate-300">No results found for "{query}"</p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {noResultRecoveryLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                prefetch={false}
                                aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                                onFocus={() => announceRecoveryLinkAction(link.label, link.target)}
                                onClick={() => {
                                  announceRecoveryLinkAction(link.label, link.target);
                                  setIsOpen(false);
                                  onNavigate(link.target);
                                }}
                                className={`${noResultRecoveryLinkClassName} ${link.className}`}
                              >
                                {link.label} <ArrowRight size={14} aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {legacyResults.length > 0 ? (
                        legacyResults.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                            onFocus={() => announceResultAction(item)}
                            onClick={() => navigateToResult(item)}
                            className="flex min-h-14 w-full items-start justify-between gap-3 rounded-lg p-3 text-left transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                              <p className="truncate text-xs text-slate-400">{item.description}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider ${typeBadgeStyles[item.type]}`}>
                              {item.type}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-slate-400">No results for "{query}".</p>
                      )}
                    </div>
                  )
                ) : (
                  <div className="space-y-4 p-1">
                    {/* Recent Pages - recently visited */}
                    {recentPages.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                          <FileText size={12} /> Recent pages
                        </p>
                        <div className="space-y-1">
                          {recentPages.slice(0, 3).map((page) => (
                            <button
                              key={page.url}
                              type="button"
                              aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                              onFocus={() => announceRecentPageAction(page)}
                              onClick={() => {
                                announceRecentPageAction(page);
                                setIsOpen(false);
                                onNavigate(page.url);
                              }}
                              className="flex min-h-11 w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-300"
                            >
                              <ArrowRight size={12} className="text-slate-500" />
                              <span className="text-sm text-slate-200">{page.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {recentSearches.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                          <Clock size={12} /> Recent searches
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((recent) => (
                            <button
                              key={recent}
                              type="button"
                              onClick={() => applySuggestedQuery(recent, 'recent')}
                              aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                              className="min-h-11 rounded-full border border-white/10 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                            >
                              {recent}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">Popular searches</p>
                      <div className="flex flex-wrap gap-2">
                        {popularTerms.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => applySuggestedQuery(term, 'popular')}
                            aria-describedby={GLOBAL_SEARCH_ACTION_STATUS_ID}
                            className="min-h-11 rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-400/25 hover:text-cyan-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
