'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X, Check, ChevronDown, RotateCcw } from 'lucide-react';
import { priceBookCurrencySymbol, priceBookMonthlyText, priceBookText } from '@/lib/money';

export interface FilterState {
    priceRange: [number, number];
    rentalPriceRange: [number, number];
    technologies: string[];
    goals: string[];
    categories: string[];
    pressureRating: string[];
    availability: string;
    sortBy: string;
}

const defaultFilters: FilterState = {
    priceRange: [0, 100000],
    rentalPriceRange: [0, 3000],
    technologies: [],
    goals: [],
    categories: [],
    pressureRating: [],
    availability: 'all',
    sortBy: 'featured'
};

const PRICE_PRESETS: Array<[number, number]> = [
    [0, 10000],
    [10000, 30000],
    [30000, 60000],
    [60000, 100000],
];

const RENTAL_PRICE_PRESETS: Array<[number, number]> = [
    [0, 300],
    [300, 800],
    [800, 1500],
    [1500, 3000],
];

const availabilityOptions = [
    { value: 'all', label: 'All products' },
    { value: 'rental', label: 'Rental planning' },
];

const STORE_PRODUCT_FILTER_STATUS_ID = 'store-product-filter-status';

interface ProductFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    productCount?: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ onFilterChange, productCount = 0 }) => {
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    const [isOpen, setIsOpen] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('technology');
    const [filterActionStatus, setFilterActionStatus] = useState('Filter controls are ready.');

    const technologies = [
        { value: 'HBOT', label: 'Hyperbaric chambers' },
        { value: 'H2', label: 'Hydrogen' },
        { value: 'RLT', label: 'Red light / NIR' },
        { value: 'PEMF', label: 'PEMF' },
        { value: 'O2', label: 'Oxygen concentrators' },
    ];
    const goals = [
        { value: 'recovery', label: 'Sports recovery' },
        { value: 'sleep', label: 'Sleep' },
        { value: 'stress', label: 'Stress' },
        { value: 'comfort', label: 'Comfort planning' },
    ];
    const categories = ['Chambers', 'Mats & Pads', 'Panels', 'Generators', 'Accessories'];
    const pressureRatings = ['1.3 ATA', '1.5 ATA', '2.0 ATA', '2.4 ATA'];
    const sortOptions = [
        { value: 'featured', label: 'Featured' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
    ];

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.technologies.length) count++;
        if (filters.goals.length) count++;
        if (filters.categories.length) count++;
        if (filters.pressureRating.length) count++;
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) count++;
        if (filters.rentalPriceRange[0] > 0 || filters.rentalPriceRange[1] < 3000) count++;
        if (filters.availability !== 'all') count++;
        return count;
    }, [filters]);
    const selectedSortLabel = sortOptions.find((option) => option.value === filters.sortBy)?.label ?? filters.sortBy;
    const productCountCopy = productCount === 1 ? 'product is' : 'products are';
    const activeFilterCopy = activeFilterCount === 1 ? '1 active filter' : `${activeFilterCount} active filters`;
    const filterStatus =
        activeFilterCount === 0
            ? `${productCount} ${productCountCopy} shown with no active filters. Sorted by ${selectedSortLabel}.`
            : `${productCount} ${productCountCopy} shown with ${activeFilterCopy}. Sorted by ${selectedSortLabel}.`;
    const combinedFilterStatus = `${filterStatus} ${filterActionStatus}`;

    const openFilterDrawer = () => {
        setIsOpen(true);
        setFilterActionStatus('Filter drawer opened.');
    };

    const closeFilterDrawer = () => {
        setIsOpen(false);
        setFilterActionStatus('Filter drawer closed.');
    };

    const toggleFilterSection = (id: string, title: string) => {
        const willCollapse = expandedSection === id;
        setExpandedSection(willCollapse ? null : id);
        setFilterActionStatus(`${title} filter section ${willCollapse ? 'collapsed' : 'expanded'}.`);
    };

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        setFilterActionStatus('Filter selection updated.');
        onFilterChange(newFilters);
    };

    const toggleArrayFilter = (key: 'technologies' | 'goals' | 'categories' | 'pressureRating', value: string) => {
        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter(v => v !== value)
            : [...current, value];
        updateFilter(key, updated);
    };

    const resetFilters = () => {
        setFilters(defaultFilters);
        setFilterActionStatus('Filters reset.');
        onFilterChange(defaultFilters);
    };

    const FilterSection: React.FC<{ title: string; id: string; children: React.ReactNode }> = ({ title, id, children }) => (
        <div className="border-b border-white/10 last:border-0">
            <button
                type="button"
                aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                onClick={() => toggleFilterSection(id, title)}
                className="flex w-full items-center justify-between py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                aria-expanded={expandedSection === id}
            >
                <span className="font-medium text-white">{title}</span>
                <ChevronDown
                    className={`text-slate-300 ui-transition-fast ${expandedSection === id ? 'rotate-180' : ''}`}
                    size={18}
                />
            </button>
            <div className="ui-accordion-grid" data-open={expandedSection === id}>
                <div className="pb-4">{children}</div>
            </div>
        </div>
    );

    const CheckboxOption: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
        <button
            type="button"
            aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
            onClick={onChange}
            className="-mx-2 flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-slate-300 transition-colors hover:bg-white/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
            <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${checked ? 'border-cyan-300 bg-cyan-300 text-[#020617]' : 'border-white/20 bg-slate-950/60'
                }`}>
                {checked && <Check size={12} className="text-[#020617]" />}
            </div>
            <span>{label}</span>
        </button>
    );

    return (
        <>
            {/* Filter Bar (Desktop) */}
            <div data-testid="store-product-filters-surface" className="mb-6 rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-slate-950/20">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Filter Toggle */}
                    <button
                        type="button"
                        aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                        onClick={openFilterDrawer}
                        className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-cyan-300/45 hover:bg-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    >
                        <SlidersHorizontal size={18} />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-xs text-cyan-100">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    {/* Quick Filters */}
                    <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                        {technologies.map(tech => (
                            <button
                                type="button"
                                key={tech.value}
                                aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                onClick={() => toggleArrayFilter('technologies', tech.value)}
                                className={`min-h-11 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${filters.technologies.includes(tech.value)
                                        ? 'border-cyan-300/35 bg-cyan-300/10 text-cyan-100'
                                        : 'border-white/10 bg-[var(--surface-ink)] text-slate-300 hover:border-white/20 hover:bg-white/[0.045]'
                                    }`}
                            >
                                {tech.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <label htmlFor="store-product-sort" className="sr-only">
                        Sort products
                    </label>
                    <select
                        id="store-product-sort"
                        aria-label="Sort products"
                        aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                        value={filters.sortBy}
                        onChange={(e) => updateFilter('sortBy', e.target.value)}
                        className="min-h-11 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-2 text-sm font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    >
                        {sortOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    {/* Reset */}
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                            onClick={resetFilters}
                            className="flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            <RotateCcw size={14} /> Reset
                        </button>
                    )}
                </div>

                {/* Active Filters */}
                {(filters.technologies.length > 0 || filters.goals.length > 0 || filters.categories.length > 0 || filters.pressureRating.length > 0 || filters.availability !== 'all' || filters.priceRange[0] > 0 || filters.priceRange[1] < 100000 || filters.rentalPriceRange[0] > 0 || filters.rentalPriceRange[1] < 3000) && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active:</span>
                        {filters.technologies.map(t => (
                            <span key={t} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
                                {technologies.find((tech) => tech.value === t)?.label ?? t}
                                <button
                                    type="button"
                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                    onClick={() => toggleArrayFilter('technologies', t)}
                                    aria-label={`Remove ${technologies.find((tech) => tech.value === t)?.label ?? t} filter`}
                                    className="flex min-h-7 min-w-7 items-center justify-center rounded-lg hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                        {filters.goals.map(g => (
                            <span key={g} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-sm font-medium text-emerald-100">
                                {goals.find((goal) => goal.value === g)?.label ?? g}
                                <button
                                    type="button"
                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                    onClick={() => toggleArrayFilter('goals', g)}
                                    aria-label={`Remove ${goals.find((goal) => goal.value === g)?.label ?? g} filter`}
                                    className="flex min-h-7 min-w-7 items-center justify-center rounded-lg hover:bg-emerald-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                        {filters.categories.map(c => (
                            <span key={c} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300/25 bg-purple-300/10 px-3 py-1 text-sm font-medium text-purple-100">
                                {c}
                                <button
                                    type="button"
                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                    onClick={() => toggleArrayFilter('categories', c)}
                                    aria-label={`Remove ${c} filter`}
                                    className="flex min-h-7 min-w-7 items-center justify-center rounded-lg hover:bg-purple-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                        {filters.pressureRating.map(p => (
                            <span key={p} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
                                {p}
                                <button
                                    type="button"
                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                    onClick={() => toggleArrayFilter('pressureRating', p)}
                                    aria-label={`Remove ${p} filter`}
                                    className="flex min-h-7 min-w-7 items-center justify-center rounded-lg hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                        {filters.availability !== 'all' && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-sm font-medium text-amber-100">
                                {availabilityOptions.find((opt) => opt.value === filters.availability)?.label ?? filters.availability}
                                <button
                                    type="button"
                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                    onClick={() => updateFilter('availability', 'all')}
                                    aria-label="Remove availability filter"
                                    className="flex min-h-7 min-w-7 items-center justify-center rounded-lg hover:bg-amber-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100000) && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
                                {priceBookText(filters.priceRange[0])} - {priceBookText(filters.priceRange[1])}
                                <button
                                    type="button"
                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                    onClick={() => updateFilter('priceRange', defaultFilters.priceRange)}
                                    aria-label="Reset price filter"
                                    className="flex min-h-7 min-w-7 items-center justify-center rounded-lg hover:bg-cyan-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {(filters.rentalPriceRange[0] > 0 || filters.rentalPriceRange[1] < 3000) && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-sm font-medium text-emerald-100">
                                Rental {priceBookText(filters.rentalPriceRange[0])} - {priceBookMonthlyText(filters.rentalPriceRange[1])}
                                <button
                                    type="button"
                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                    onClick={() => updateFilter('rentalPriceRange', defaultFilters.rentalPriceRange)}
                                    aria-label="Reset rental price filter"
                                    className="flex min-h-7 min-w-7 items-center justify-center rounded-lg hover:bg-emerald-300/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                <p
                    id={STORE_PRODUCT_FILTER_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label="Store product filter status"
                    className="mt-4 rounded-lg border border-white/10 bg-[var(--surface-ink)] px-4 py-3 text-sm leading-6 text-slate-300"
                >
                    {combinedFilterStatus}
                </p>
            </div>

            {/* Filter Drawer (Mobile/Full) */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm"
                            onClick={closeFilterDrawer}
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="product-filters-title"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="fixed bottom-0 right-0 top-0 z-50 flex h-full max-h-screen w-full max-w-md flex-col border-l border-white/10 bg-slate-950 text-white"
                        >
                            {/* Drawer Header */}
                            <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-6">
                                <h2 id="product-filters-title" className="text-xl font-bold text-white">Filters</h2>
                                <button
                                    type="button"
                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                    onClick={closeFilterDrawer}
                                    aria-label="Close filters"
                                    className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/[0.045] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <X size={24} aria-hidden="true" />
                                </button>
                            </div>

                            {/* Scrollable Filter Body */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <FilterSection title="Technology" id="technology">
                                    {technologies.map(tech => (
                                        <CheckboxOption
                                            key={tech.value}
                                            label={tech.label}
                                            checked={filters.technologies.includes(tech.value)}
                                            onChange={() => toggleArrayFilter('technologies', tech.value)}
                                        />
                                    ))}
                                </FilterSection>

                                <FilterSection title="Goal" id="goal">
                                    {goals.map(goal => (
                                        <CheckboxOption
                                            key={goal.value}
                                            label={goal.label}
                                            checked={filters.goals.includes(goal.value)}
                                            onChange={() => toggleArrayFilter('goals', goal.value)}
                                        />
                                    ))}
                                </FilterSection>

                                <FilterSection title="Category" id="category">
                                    {categories.map(cat => (
                                        <CheckboxOption
                                            key={cat}
                                            label={cat}
                                            checked={filters.categories.includes(cat)}
                                            onChange={() => toggleArrayFilter('categories', cat)}
                                        />
                                    ))}
                                </FilterSection>

                                <FilterSection title="Pressure Rating (HBOT)" id="pressure">
                                    {pressureRatings.map(pr => (
                                        <CheckboxOption
                                            key={pr}
                                            label={pr}
                                            checked={filters.pressureRating.includes(pr)}
                                            onChange={() => toggleArrayFilter('pressureRating', pr)}
                                        />
                                    ))}
                                </FilterSection>

                                <FilterSection title="Price Range" id="price">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                                value={filters.priceRange[0]}
                                                onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                                                className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                                placeholder="Min"
                                            />
                                            <span className="text-slate-400">-</span>
                                            <input
                                                type="number"
                                                aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                                value={filters.priceRange[1]}
                                                onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                                                className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                                placeholder="Max"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {PRICE_PRESETS.map(([min, max]) => (
                                                <button
                                                    type="button"
                                                    key={`${min}-${max}`}
                                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                                    onClick={() => updateFilter('priceRange', [min, max])}
                                                    className="min-h-11 flex-1 rounded-lg border border-white/10 bg-slate-950/55 py-2 text-xs text-slate-300 hover:border-cyan-300/35 hover:bg-white/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                                >
                                                    {min / 1000}k-{max / 1000}k
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </FilterSection>

                                <FilterSection title="Availability" id="availability">
                                    {availabilityOptions.map((option) => (
                                        <CheckboxOption
                                            key={option.value}
                                            label={option.label}
                                            checked={filters.availability === option.value}
                                            onChange={() => updateFilter('availability', option.value)}
                                        />
                                    ))}
                                </FilterSection>

                                <FilterSection title="Rental price" id="rental-price">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                                value={filters.rentalPriceRange[0]}
                                                onChange={(e) =>
                                                    updateFilter('rentalPriceRange', [Number(e.target.value), filters.rentalPriceRange[1]])
                                                }
                                                className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                                placeholder={`Min ${priceBookCurrencySymbol()}/mo`}
                                            />
                                            <span className="text-slate-400">-</span>
                                            <input
                                                type="number"
                                                aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                                value={filters.rentalPriceRange[1]}
                                                onChange={(e) =>
                                                    updateFilter('rentalPriceRange', [filters.rentalPriceRange[0], Number(e.target.value)])
                                                }
                                                className="min-h-11 w-full rounded-lg border border-white/10 bg-slate-950/60 px-4 py-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                                placeholder={`Max ${priceBookCurrencySymbol()}/mo`}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            {RENTAL_PRICE_PRESETS.map(([min, max]) => (
                                                <button
                                                    type="button"
                                                    key={`${min}-${max}`}
                                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                                    onClick={() => updateFilter('rentalPriceRange', [min, max])}
                                                    className="min-h-11 flex-1 rounded-lg border border-white/10 bg-slate-950/55 py-2 text-xs text-slate-300 hover:border-cyan-300/35 hover:bg-white/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                                >
                                                    {priceBookText(min)}-{priceBookText(max)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </FilterSection>
                            </div>

                            {/* Apply Button */}
                            <div className="shrink-0 border-t border-white/10 bg-slate-950 p-6">
                                <button
                                    type="button"
                                    aria-describedby={STORE_PRODUCT_FILTER_STATUS_ID}
                                    onClick={closeFilterDrawer}
                                    className="w-full min-h-11 rounded-lg bg-cyan-300 py-3.5 text-sm font-bold uppercase tracking-[0.16em] text-[#020617] transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    Show {productCount} Products
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

// Export filter hook for use in store
export const useProductFilters = () => {
    const [filters, setFilters] = useState<FilterState>(defaultFilters);
    return { filters, setFilters };
};
