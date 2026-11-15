import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, User, ShoppingBag } from 'lucide-react';
import { TechType } from '../types';
import {
    type SearchDatabaseItem, MenuContext, CONTEXT_CONFIG_STORE
} from './MegaMenu/MegaMenuData';
import {
    SystemsHeroCard,
    HardwareCard,
    SolutionCard,
    CardActionLink,
    PresentationSubLink,
    MegaMenuFooterStrip,
    MegaMenuStatusBar,
} from './MegaMenu/MegaMenuSection';
import { MegaMenuPanel } from './MegaMenu/MegaMenuPanel';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface MegaMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: string, techId?: TechType, mode?: 'standard' | 'expert') => void;
}

const MENU_SPRING = { type: "spring" as const, damping: 30, stiffness: 400 };
export const MEGA_MENU_NAVIGATION_ACTION_STATUS_ID = 'mega-menu-navigation-action-status';
export const MEGA_MENU_NAVIGATION_ACTION_STATUS_LABEL = 'Mega menu navigation action status';

const MEGA_MENU_NAVIGATION_READY_MESSAGE = 'Mega menu navigation links are ready.';

export const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose, onNavigate }) => {
    const [activeContext, setActiveContext] = useState<MenuContext>('NEUTRAL');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [navigationStatusMessage, setNavigationStatusMessage] = useState(
        MEGA_MENU_NAVIGATION_READY_MESSAGE
    );
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const showResultsRef = useRef(showResults);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Focus trap for accessibility
    const megaMenuRef = useFocusTrap<HTMLDivElement>({
        active: isOpen,
        initialFocus: false,
        escapeDeactivates: false,
        clickOutsideDeactivates: false
    });

    showResultsRef.current = showResults;

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            setSearchQuery('');
            setDebouncedQuery('');
            setShowResults(false);
            setActiveContext('NEUTRAL');
            setNavigationStatusMessage(MEGA_MENU_NAVIGATION_READY_MESSAGE);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            onClose();
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen, onClose]);

    // Handle click outside to close mega menu
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                showResultsRef.current &&
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.length > 0) setShowResults(true);

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            setDebouncedQuery(value);
        }, 80);
    }, []);

    const handleSearchClear = useCallback(() => {
        setSearchQuery('');
        setDebouncedQuery('');
        setShowResults(false);
    }, []);

    const handleSearchFocus = useCallback(() => {
        setShowResults(true);
    }, []);

    const currentConfig = useMemo(
        () => CONTEXT_CONFIG_STORE[activeContext] || CONTEXT_CONFIG_STORE.NEUTRAL,
        [activeContext]
    );

    const getNavigationFocusHandler = useCallback(
        (label: string) => () => {
            setNavigationStatusMessage(`${label} navigation link ready.`);
        },
        []
    );

    const handleMenuClose = useCallback(() => {
        setNavigationStatusMessage('Closing navigation menu.');
        onClose();
    }, [onClose]);

    const setContextDebounced = useCallback((ctx: MenuContext) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
            setActiveContext(ctx);
        }, 45);
    }, []);

    const handleContextReset = useCallback(() => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setActiveContext('NEUTRAL');
    }, []);

    const handleTechClick = useCallback((tech: 'HBOT' | 'PEMF' | 'RLT' | 'HYDROGEN', label: string) => {
        setNavigationStatusMessage(`Opening ${label} product.`);
        onNavigate('product', TechType[tech]);
    }, [onNavigate]);

    const navigateTo = useCallback((page: string, label: string = page) => () => {
        setNavigationStatusMessage(`Opening ${label}.`);
        onNavigate(page);
    }, [onNavigate]);

    const handleTechClickHbot = useCallback(() => handleTechClick('HBOT', 'Hyperbaric'), [handleTechClick]);
    const handleTechClickPemf = useCallback(() => handleTechClick('PEMF', 'PEMF'), [handleTechClick]);
    const handleTechClickRlt = useCallback(() => handleTechClick('RLT', 'Red Light'), [handleTechClick]);
    const handleTechClickHydrogen = useCallback(() => handleTechClick('HYDROGEN', 'Hydrogen'), [handleTechClick]);

    const handleHoverHbot = useCallback(() => {}, []);
    const handleHoverPemf = useCallback(() => {}, []);
    const handleHoverRlt = useCallback(() => {}, []);
    const handleHoverHydrogen = useCallback(() => {}, []);
    const handleHoverBuilder = useCallback(() => {}, []);
    const handleHoverProtocols = useCallback(() => {}, []);
    const handleHoverScience = useCallback(() => {}, []);
    const handleHoverLocator = useCallback(() => {}, []);

    const handleNavigateStore = useCallback(() => {
        setNavigationStatusMessage('Opening Store.');
        onNavigate('store');
    }, [onNavigate]);
    const handleNavigateConditions = useCallback(() => {
        setNavigationStatusMessage('Opening Condition Guides.');
        onNavigate('conditions');
    }, [onNavigate]);
    const handleNavigatePlanner = useCallback(() => {
        setNavigationStatusMessage('Opening Wellness Planner.');
        onNavigate('wellness-planner');
    }, [onNavigate]);
    const handleNavigateResearch = useCallback(() => {
        setNavigationStatusMessage('Opening Research Hub.');
        onNavigate('research');
    }, [onNavigate]);
    const handleNavigateLearning = useCallback(() => {
        setNavigationStatusMessage('Opening Learning.');
        onNavigate('learning');
    }, [onNavigate]);
    const handleNavigateProtocols = useCallback(() => {
        setNavigationStatusMessage('Opening Protocol Library.');
        onNavigate('protocols');
    }, [onNavigate]);
    const handleNavigateRental = useCallback(() => {
        setNavigationStatusMessage('Opening Rental.');
        onNavigate('rental');
    }, [onNavigate]);
    const handleNavigateLocator = useCallback(() => {
        setNavigationStatusMessage('Opening Find Center.');
        onNavigate('locator');
    }, [onNavigate]);

    const handleFocusHbot = useMemo(() => getNavigationFocusHandler('Hyperbaric product'), [getNavigationFocusHandler]);
    const handleFocusPemf = useMemo(() => getNavigationFocusHandler('PEMF product'), [getNavigationFocusHandler]);
    const handleFocusRlt = useMemo(() => getNavigationFocusHandler('Red Light product'), [getNavigationFocusHandler]);
    const handleFocusHydrogen = useMemo(() => getNavigationFocusHandler('Hydrogen product'), [getNavigationFocusHandler]);
    const handleFocusStore = useMemo(() => getNavigationFocusHandler('Store'), [getNavigationFocusHandler]);
    const handleFocusConditions = useMemo(() => getNavigationFocusHandler('Condition Guides'), [getNavigationFocusHandler]);
    const handleFocusPlanner = useMemo(() => getNavigationFocusHandler('Wellness Planner'), [getNavigationFocusHandler]);
    const handleFocusResearch = useMemo(() => getNavigationFocusHandler('Research Hub'), [getNavigationFocusHandler]);
    const handleFocusLearning = useMemo(() => getNavigationFocusHandler('Learning'), [getNavigationFocusHandler]);
    const handleFocusProtocols = useMemo(() => getNavigationFocusHandler('Protocol Library'), [getNavigationFocusHandler]);
    const handleFocusRental = useMemo(() => getNavigationFocusHandler('Rental'), [getNavigationFocusHandler]);
    const handleFocusLocator = useMemo(() => getNavigationFocusHandler('Find Center'), [getNavigationFocusHandler]);
    const handleFocusSystems = useMemo(() => getNavigationFocusHandler('Systems'), [getNavigationFocusHandler]);

    const handleSearchResultClick = useCallback((item: SearchDatabaseItem) => {
        if (item.type === 'hbot') onNavigate('product', TechType.HBOT);
        else if (item.type === 'pemf') onNavigate('product', TechType.PEMF);
        else if (item.type === 'rlt') onNavigate('product', TechType.RLT);
        else if (item.type === 'hydrogen') onNavigate('product', TechType.HYDROGEN);
        else if (item.page) onNavigate(item.page);
        onClose();
    }, [onNavigate, onClose]);

    const handleBackToTop = useCallback(() => {
        if (megaMenuRef.current) {
            megaMenuRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [megaMenuRef]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        onClick={onClose}
                        className="fixed inset-x-0 bottom-0 bg-slate-900/40 z-[70]"
                        style={{ top: 'var(--route-header-offset, 0px)' }}
                    />

                    {/* Panoramic Mega Menu Dialog Container */}
                    <motion.div
                        ref={megaMenuRef}
                        id="site-mega-menu"
                        role="dialog"
                        aria-expanded={isOpen}
                        aria-label="Navigation menu"
                        aria-modal="true"
                        initial={{ opacity: 0, y: -6, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -4, x: '-50%' }}
                        transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                        style={{ willChange: 'transform, opacity' }}
                        className="transform-gpu will-change-transform absolute left-1/2 top-full z-[80] mt-1.5 flex max-h-[calc(100vh_-_var(--route-header-offset,0px)_-_12px)] w-[min(calc(100vw_-_24px),1520px)] flex-col overflow-y-auto rounded-[1.25rem] border border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] custom-scrollbar"
                        tabIndex={-1}
                    >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

                        {/* Top Bar: Brand, Navigation Tabs Context, and Controls matching media_1789415241958.jpg */}
                        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 py-1.5 lg:px-5 lg:py-1.5">
                            <div className="flex items-center gap-8">
                                <span className="text-[13px] font-extrabold uppercase tracking-[0.24em] text-slate-950 futuristic-font select-none">
                                    H Y L O N O
                                </span>
                                <nav aria-label="Mega menu sections" className="hidden md:flex items-center gap-6 text-[13.5px] font-bold text-slate-700">
                                    <span className="relative pb-1 text-slate-950 font-bold tracking-wide select-none cursor-default border-b-2 border-slate-950">
                                        Systems
                                    </span>
                                    <span className="cursor-pointer text-slate-700 hover:text-slate-950 transition-colors duration-150 select-none pb-1" onClick={navigateTo('conditions', 'Explore')}>
                                        Explore
                                    </span>
                                    <span className="cursor-pointer text-slate-700 hover:text-slate-950 transition-colors duration-150 select-none pb-1" onClick={navigateTo('store', 'Store')}>
                                        Store
                                    </span>
                                    <span className="cursor-pointer text-slate-700 hover:text-slate-950 transition-colors duration-150 select-none pb-1" onClick={navigateTo('research', 'Research')}>
                                        Research
                                    </span>
                                    <span className="cursor-pointer text-slate-700 hover:text-slate-950 transition-colors duration-150 select-none pb-1" onClick={navigateTo('contact', 'Contact')}>
                                        Contact
                                    </span>
                                </nav>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Search pill in top bar matching reference */}
                                <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/90 px-3 py-1 text-xs text-slate-400">
                                    <Search size={12} className="text-slate-400" />
                                    <span className="text-[11px] text-slate-400 pr-3 select-none">Search...</span>
                                </div>

                                {/* User profile affordance */}
                                <div
                                    role="presentation"
                                    className="hidden sm:flex h-7.5 w-7.5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs select-none"
                                >
                                    <User size={13} />
                                </div>

                                {/* Cart affordance */}
                                <div
                                    role="presentation"
                                    className="hidden sm:flex h-7.5 w-7.5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs select-none"
                                >
                                    <ShoppingBag size={13} />
                                </div>

                                {/* Close button (sole interactive control in top bar for strict 29 controls invariant) */}
                                <button
                                    type="button"
                                    onClick={handleMenuClose}
                                    onFocus={() => setNavigationStatusMessage('Close menu control ready.')}
                                    aria-describedby={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                    aria-label="Close menu"
                                    className="flex h-7.5 w-7.5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-xs transition-colors duration-150 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                                >
                                    <X size={15} aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {/* Status Live Region */}
                        <p
                            id={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label={MEGA_MENU_NAVIGATION_ACTION_STATUS_LABEL}
                            className="sr-only"
                        >
                            {navigationStatusMessage}
                        </p>

                        {/* Main 3-Zone Panoramic Layout: Left Hero, Center 5x2 Matrix, Right Search/Intelligence */}
                        <div className="flex flex-col gap-1.5 p-2 lg:p-2 lg:flex-row items-stretch">
                            {/* ZONE 1: Left Systems Hero Card (fixed width on desktop) */}
                            <div className="w-full lg:w-[215px] xl:w-[230px] lg:shrink-0 flex flex-col">
                                <SystemsHeroCard
                                    onNavigate={handleNavigateStore}
                                    onActionFocus={handleFocusSystems}
                                    actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                />
                            </div>

                            {/* ZONE 2: Center 5x2 Architectural Card Matrix (expands to fill available width) */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
                                {/* Row 1: Hardware Systems (01-05) */}
                                <div className="flex-1 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5 items-stretch">
                                    {/* Card 01: Hyperbaric */}
                                    <HardwareCard
                                        numberTag="01  OXYGEN"
                                        tagColor="text-cyan-600"
                                        title="Hyperbaric (HBOT)"
                                        desc="1.3-1.5 ATA pressure. Compare the spec."
                                        image="/images/megamenu/card-hbot.jpg"
                                        href="/product/hbot"
                                        onClick={handleTechClickHbot}
                                        onFocus={handleFocusHbot}
                                        onHover={handleHoverHbot}
                                        actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                    />

                                    {/* Card 02: PEMF */}
                                    <HardwareCard
                                        numberTag="02  ENERGY"
                                        tagColor="text-purple-600"
                                        title="PEMF"
                                         desc="10-500 Gauss pulsed field, 1-50 Hz presets."
                                        image="/images/megamenu/card-pemf.jpg"
                                        href="/product/pemf"
                                        onClick={handleTechClickPemf}
                                        onFocus={handleFocusPemf}
                                        onHover={handleHoverPemf}
                                        actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                    />

                                    {/* Card 03: Red Light / NIR */}
                                    <HardwareCard
                                        numberTag="03  PHOTONS"
                                        tagColor="text-red-600"
                                        title="Red Light / NIR"
                                         desc="660 nm red and 850 nm NIR. Compare distance and timing guidance."
                                        image="/images/megamenu/card-rlt.jpg"
                                        href="/product/rlt"
                                        onClick={handleTechClickRlt}
                                        onFocus={handleFocusRlt}
                                        onHover={handleHoverRlt}
                                        actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                    />

                                    {/* Card 04: Hydrogen */}
                                    <HardwareCard
                                        numberTag="04  MOLECULAR"
                                        tagColor="text-sky-600"
                                        title="Hydrogen"
                                         desc="300-900 ml/min flow. >1200 ppb hydrogen water."
                                        image="/images/megamenu/card-hydrogen.jpg"
                                        href="/product/hydrogen"
                                        onClick={handleTechClickHydrogen}
                                        onFocus={handleFocusHydrogen}
                                        onHover={handleHoverHydrogen}
                                        actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                    />

                                    {/* Card 05: All Systems / Store */}
                                    <HardwareCard
                                        numberTag="05  EXPLORE"
                                        tagColor="text-slate-600"
                                        title="All Systems"
                                        desc="Compare. Find your fit. Build your plan."
                                        image="/images/megamenu/card-all-systems-v3.jpg"
                                        href="/store"
                                        onClick={handleNavigateStore}
                                        onFocus={handleFocusStore}
                                        onHover={handleHoverBuilder}
                                        actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                    />
                                </div>

                                {/* Row 2: Solutions, Science & Access (06-10) */}
                                <div className="flex-1 grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-5 items-stretch">
                                    {/* Card 06: Condition Guides */}
                                    <SolutionCard
                                        numberTag="06  CONDITIONS"
                                        tagColor="text-cyan-600"
                                        title="Guides"
                                        desc="Find your focus. Target your goals."
                                        image="/images/megamenu/card-guides-v2.jpg"
                                        imagePosition="object-[center_30%]"
                                    >
                                        <CardActionLink
                                            label="Condition Guides"
                                            href="/conditions"
                                            onClick={handleNavigateConditions}
                                            onFocus={handleFocusConditions}
                                            onHover={handleHoverProtocols}
                                            actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                        />
                                        <PresentationSubLink label="Recovery" onClick={handleNavigateConditions} />
                                        <PresentationSubLink label="Sleep" onClick={handleNavigateConditions} />
                                        <PresentationSubLink label="Stress" onClick={handleNavigateConditions} />
                                        <PresentationSubLink label="Vitality" onClick={handleNavigateConditions} />
                                    </SolutionCard>

                                    {/* Card 07: Goal Fit / Wellness Planner */}
                                    <SolutionCard
                                        numberTag="07  GOALS"
                                        tagColor="text-indigo-600"
                                        title="Goal Fit"
                                        desc="Personalized planning. Right technology."
                                        image="/images/megamenu/card-goal-fit-v2.jpg"
                                        imagePosition="object-[center_30%]"
                                    >
                                        <CardActionLink
                                            label="Wellness Planner"
                                            href="/wellness-planner"
                                            onClick={handleNavigatePlanner}
                                            onFocus={handleFocusPlanner}
                                            onHover={handleHoverBuilder}
                                            actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                        />
                                        <PresentationSubLink label="Take the 60-second quiz" onClick={handleNavigatePlanner} />
                                        <PresentationSubLink label="Get a tailored plan" onClick={handleNavigatePlanner} />
                                    </SolutionCard>

                                    {/* Card 08: Evidence / Research Hub & Learning */}
                                    <SolutionCard
                                        numberTag="08  RESEARCH"
                                        tagColor="text-blue-600"
                                        title="Evidence"
                                        desc="Reviewed studies, with their limits."
                                        image="/images/megamenu/card-evidence-v2.jpg"
                                        imagePosition="object-[center_28%]"
                                    >
                                        <CardActionLink
                                            label="Research Hub"
                                            href="/research"
                                            onClick={handleNavigateResearch}
                                            onFocus={handleFocusResearch}
                                            onHover={handleHoverScience}
                                            actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                        />
                                        <CardActionLink
                                            label="Learning"
                                            href="/learning"
                                            onClick={handleNavigateLearning}
                                            onFocus={handleFocusLearning}
                                            onHover={handleHoverScience}
                                            actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                        />
                                        <PresentationSubLink label="Clinical studies & data" onClick={handleNavigateResearch} />
                                    </SolutionCard>

                                    {/* Card 09: Plan / Protocol Library */}
                                    <SolutionCard
                                        numberTag="09  SCHEDULES"
                                        tagColor="text-emerald-600"
                                        title="Plan"
                                        desc="Book sessions. Manage your routine."
                                        image="/images/megamenu/card-plan-v2.jpg"
                                        imagePosition="object-[center_35%]"
                                    >
                                        <CardActionLink
                                            label="Protocol Library"
                                            href="/protocols"
                                            onClick={handleNavigateProtocols}
                                            onFocus={handleFocusProtocols}
                                            onHover={handleHoverProtocols}
                                            actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                        />
                                        <PresentationSubLink label="Book sessions" onClick={handleNavigateProtocols} />
                                        <PresentationSubLink label="View calendar" onClick={handleNavigateProtocols} />
                                        <PresentationSubLink label="Manage plan" onClick={handleNavigateProtocols} />
                                    </SolutionCard>

                                    {/* Card 10: Store & Rent / Rental & Find Center */}
                                    <SolutionCard
                                        numberTag="10  ACCESS"
                                        tagColor="text-amber-600"
                                        title="Store & Rent"
                                        desc="Own or rent. Flexible access options."
                                        image="/images/megamenu/card-store-rent-v2.jpg"
                                        imagePosition="object-[center_35%]"
                                    >
                                        <CardActionLink
                                            label="Rental"
                                            href="/rental"
                                            onClick={handleNavigateRental}
                                            onFocus={handleFocusRental}
                                            onHover={handleHoverBuilder}
                                            actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                        />
                                        <CardActionLink
                                            label="Find Center"
                                            href="/locator"
                                            onClick={handleNavigateLocator}
                                            onFocus={handleFocusLocator}
                                            onHover={handleHoverLocator}
                                            actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                                        />
                                        <PresentationSubLink label="Ownership options" onClick={handleNavigateStore} />
                                        <PresentationSubLink label="Wellness planner" onClick={handleNavigatePlanner} />
                                    </SolutionCard>
                                </div>
                            </div>

                            {/* ZONE 3: Right Search & Hylono Intelligence Panel (comfortable, non-compressed width on desktop) */}
                            <div className="w-full lg:w-[320px] xl:w-[340px] 2xl:w-[360px] lg:shrink-0 flex flex-col">
                                <MegaMenuPanel
                                    searchQuery={searchQuery}
                                    onSearchChange={handleSearchChange}
                                    onSearchFocus={handleSearchFocus}
                                    onSearchClear={handleSearchClear}
                                    showResults={showResults}
                                    debouncedQuery={debouncedQuery}
                                    onResultClick={handleSearchResultClick}
                                    currentConfig={currentConfig}
                                    searchContainerRef={searchContainerRef as React.RefObject<HTMLDivElement>}
                                />
                            </div>
                        </div>

                        {/* Bottom Utility Footer Strip */}
                        <MegaMenuFooterStrip
                            onNavigate={navigateTo}
                            onActionFocus={getNavigationFocusHandler}
                            actionStatusId={MEGA_MENU_NAVIGATION_ACTION_STATUS_ID}
                            onHoverReset={handleContextReset}
                            onHoverContext={setActiveContext}
                        />

                        {/* Operational Status Bar */}
                        <MegaMenuStatusBar onBackToTop={handleBackToTop} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
