"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ViewMode, TechType } from '../types';
import { HbotVisual, PemfVisual, RltVisual, HydrogenVisual } from './Visualizations';
import { ArrowLeft, ArrowRight, CheckCircle, Shield, Zap, Brain, Activity, Wind, Sun, Droplets, Sparkles, ChevronDown, ChevronUp, Clock, AlertTriangle, Phone, Star, Quote, Moon, Sunrise, Building2, Users, Pill, BarChart2, Target, FlaskConical, BookOpen, Video, ChevronRight, Flame, Thermometer, Radio, Mountain, Snowflake, Package, Headphones, Eye, Ear, Leaf, Heart, X } from 'lucide-react';
import { SmartText } from './SmartText';
import { motion, AnimatePresence } from 'motion/react';
import { useTech } from '../hooks/useTech';
import { TechAddons } from './product/detail/TechAddons';
import { TechHero } from './product/detail/TechHero';
import { productById } from '../content/products';
import { disclaimers } from '../content/disclaimers';
import { protocols } from '../content/protocols';
import { toProtocolCardView } from '../content/protocolView';
import { RESEARCH_STUDIES } from '../constants/content';
import { ReviewsSection } from './ReviewSystem';
import { ALL_CHAMBERS, getChamberBySlug } from '../constants/chambers';
import { batch3DocumentsByTech, batch3PdpContent, getBatch3SpecAnnotation } from '../content/batch3';
import { ProtocolCard } from './protocols/ProtocolCard';
import { FeatureGate } from './FeatureGate';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { pdpCommerceContent } from '../content/pdpCommerce';
import { getProductTopicalLinks } from '../content/topical-graph';
import { ChamberCompare5, ChamberCompareDock5 } from './ChamberCompare5';
import { OptimizedImage } from './shared/OptimizedImage';
import { MedicalDisclaimer } from './shared/MedicalDisclaimer';
import { useCart } from './Cart';
import { HbotChamberMediaFallback } from './product/detail/HbotChamberMediaFallback';
import { ResearchOverviewSection } from './product/detail/ResearchOverviewSection';
import { PemfSettingsSection } from './product/detail/PemfSettingsSection';
import { RltContextSection } from './product/detail/RltContextSection';
import { RltWavelengthSection } from './product/detail/RltWavelengthSection';
import { TechDetailDeliverySection } from './product/detail/TechDetailDeliverySection';
import { TechDetailTimelineSection } from './product/detail/TechDetailTimelineSection';
import { RESULT_TIMELINES } from './product/detail/resultTimelines';
import analytics from '../src/lib/analytics';
import {
    buildProductDetailActionPayload,
    type ProductDetailAction,
    type ProductDetailAnalyticsInput,
    PRODUCT_DETAIL_ACTION_EVENT,
} from '../src/lib/product-detail-analytics';

import {
    type PurchaseTrack,
    type ProductDetailActionExtra,
    TECH_ICONS,
    TECH_GRADIENTS,
    CART_ITEM_GRADIENTS,
    HBOT_DEFAULT_CHAMBER_SLUG,
    PDP_CART_STATUS_ID,
    PDP_CART_STATUS_LABEL,
    PDP_TRACK_STATUS_ID,
    PDP_TRACK_STATUS_LABEL,
    PDP_DETAIL_ACTION_STATUS_ID,
    PDP_DETAIL_ACTION_STATUS_LABEL,
    TECH_TO_CONTENT_PRODUCT_ID,
    FALLBACK_INSTALLMENT_MONTHS,
    formatPrice,
    parseNumericAmount,
    parsePeriodToMonths,
    getSafeHbotChamberKey,
    renderChamberDescription,
} from './product/detail/TechDetailData';
import { priceBookMonthlyText } from '@/lib/money';

interface TechDetailProps {
    techId: TechType;
    onBack: () => void;
    onJumpToTech: (id: TechType) => void;
    onNavigate?: (page: string) => void;
    ownedTech?: TechType[];
    serverIntroRendered?: boolean;
}



export const TechDetail: React.FC<TechDetailProps> = ({
    techId,
    onBack,
    onJumpToTech,
    onNavigate,
    ownedTech = [],
    serverIntroRendered = false,
}) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const modeParam = searchParams.get('mode');
    const { getTechDetails, getTechKnowledge } = useTech();
    const data = getTechDetails(techId);
    const knowledge = getTechKnowledge(techId);
    const pdpTrustHierarchyEnabled = useFeatureFlag('feature_pdp_trust_hierarchy');
    const pdpEvidenceEnabled = useFeatureFlag('feature_pdp_evidence');
    const pdpDocumentsEnabled = useFeatureFlag('feature_pdp_documents');
    const pdpContraindicationsEnabled = useFeatureFlag('feature_pdp_contraindications');
    const pdpSpecAnnotationsEnabled = useFeatureFlag('feature_pdp_spec_annotations');
    const pdpAdvisorCtaEnabled = useFeatureFlag('feature_pdp_advisor_cta');
    const pdpTradeInEnabled = useFeatureFlag('feature_pdp_tradein');
    const pdpDualTrackEnabled = useFeatureFlag('feature_pdp_dual_track');
    const pdpStickyCtaEnabled = useFeatureFlag('feature_pdp_sticky_cta');
    const pdpFinancingDrawerEnabled = useFeatureFlag('feature_pdp_financing_drawer');
    const { addItem } = useCart();

    const [mode, setMode] = useState<ViewMode>(ViewMode.STANDARD);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [showSafety, setShowSafety] = useState(false);
    const [expandedContraindication, setExpandedContraindication] = useState<string | null>(null);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [showFinancing, setShowFinancing] = useState(false);
    const [loanTerm, setLoanTerm] = useState(24);
    const [showDelivery, setShowDelivery] = useState(false);
    const [selectedHbotChamberSlug, setSelectedHbotChamberSlug] = useState<string>(HBOT_DEFAULT_CHAMBER_SLUG);
    const [activeTrack, setActiveTrack] = useState<PurchaseTrack>(
        modeParam?.toLowerCase() === 'rental' ? 'rental' : 'purchase'
    );
    const [selectedRentalPeriod, setSelectedRentalPeriod] = useState<string>('');
    const [isCommercePanelInView, setIsCommercePanelInView] = useState(true);
    const [showMobileTrackDrawer, setShowMobileTrackDrawer] = useState(false);
    const [compareChamberIds, setCompareChamberIds] = useState<string[]>([]);
    const [showChamberCompareModal, setShowChamberCompareModal] = useState(false);
    const [cartStatusMessage, setCartStatusMessage] = useState('');
    const [detailActionStatusMessage, setDetailActionStatusMessage] = useState('');
    const dualTrackPanelRef = useRef<HTMLDivElement | null>(null);
    const cartStatusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setDetailActionStatusMessage(`${data.name} product detail controls are ready.`);
    }, [data.name]);

    const announceProductDetailAction = (message: string) => {
        setDetailActionStatusMessage(message);
    };

    const getDetailActionStatusProps = (readyMessage: string) => ({
        'aria-describedby': PDP_DETAIL_ACTION_STATUS_ID,
        onFocus: () => announceProductDetailAction(readyMessage),
    });

    const announceDetailNavigation = (label: string) => {
        announceProductDetailAction(`Opening ${label} for ${data.name}.`);
    };

    const captureProductDetailAction = (
        action: ProductDetailAction,
        source: string,
        extra: ProductDetailActionExtra = {}
    ) => {
        analytics.capture(
            PRODUCT_DETAIL_ACTION_EVENT,
            buildProductDetailActionPayload({
                action,
                activeTrack,
                canonicalProductSlug: TECH_TO_CONTENT_PRODUCT_ID[data.id] ?? techSlug,
                productSlug: techSlug,
                source,
                techId: data.id,
                ...extra,
            })
        );
    };

    const toggleAddon = (id: string) => {
        setSelectedAddons((prev) => {
            const isSelected = !prev.includes(id);
            const next = isSelected ? [...prev, id] : prev.filter(a => a !== id);
            captureProductDetailAction('addon_toggled', 'addon_selector', {
                isSelected,
                selectedAddonCount: next.length,
            });
            return next;
        });
    };

    const isExpert = mode === ViewMode.EXPERT;
    const gradientClass = TECH_GRADIENTS[data.id];
    const productDocuments = batch3DocumentsByTech[data.id] ?? [];
    const techSlug = data.id.toLowerCase();
    const productRentalHref = `/rental?device=${techSlug}`;
    const productContactHref = `/contact?tech=${techSlug}`;
    const hydrogenAccessoryContactHref = {
        pathname: '/contact',
        query: {
            source: 'product-secondary',
            intent: 'curious',
            tech: 'hydrogen',
            productName: 'Hydrogen access formats',
        },
    };
    const guidanceUpdatedLabel = data.lastReviewed
        ? new Date(data.lastReviewed).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : null;
    const rentalCommitmentMonths = parsePeriodToMonths(data.rentalTerms ?? '1 month');
    const mappedProduct = useMemo(() => {
        const productId = TECH_TO_CONTENT_PRODUCT_ID[data.id];
        return productId ? productById[productId] : undefined;
    }, [data.id]);

    const rentalPlans = mappedProduct?.rentalPlans ?? [];
    const installmentOptions = mappedProduct?.installmentOptions ?? [];
    const purchasePriceValue = mappedProduct?.purchasePrice ?? 0;
    const purchasePriceLabel = mappedProduct ? formatPrice(purchasePriceValue) : 'Request / verify';
    const financingHint = mappedProduct?.financingEligible && mappedProduct.financingMonthlyFrom
        ? `or from ${priceBookMonthlyText(mappedProduct.financingMonthlyFrom)}`
        : null;

    const selectedRentalPlan = useMemo(() => {
        if (rentalPlans.length === 0) return undefined;
        return rentalPlans.find((plan) => plan.period === selectedRentalPeriod) ?? rentalPlans[0];
    }, [rentalPlans, selectedRentalPeriod]);

    const fallbackInstallmentOptions = useMemo(() => {
        if (!purchasePriceValue) return [];

        return FALLBACK_INSTALLMENT_MONTHS.map((months) => {
            const monthlyAmount = Math.round(purchasePriceValue / months);
            const interestRate = months <= 24 ? 0 : 3.9;

            return {
                months,
                monthlyAmount,
                interestRate,
            };
        });
    }, [purchasePriceValue]);

    const availableInstallmentOptions = installmentOptions.length > 0 ? installmentOptions : fallbackInstallmentOptions;
    const rentalBaselineMonthly = rentalPlans[0]?.monthlyPrice ?? 0;
    const activeRentalMonthly = selectedRentalPlan?.monthlyPrice ?? rentalBaselineMonthly;
    const rentalPriceLabel = activeRentalMonthly > 0 ? `${priceBookMonthlyText(activeRentalMonthly)}` : null;
    const rentalDepositLabel = selectedRentalPlan?.deposit ? formatPrice(selectedRentalPlan.deposit) : null;
    const rentalMinimumPeriod = selectedRentalPlan?.minPeriod ?? (mappedProduct ? data.rentalTerms ?? '1 month' : 'reviewed before quote');
    const anxietyBufferItems = activeTrack === 'purchase' ? pdpCommerceContent.anxietyBuffers.purchase : pdpCommerceContent.anxietyBuffers.rental;
    const activeInstallment = availableInstallmentOptions.find((option) => option.months === loanTerm) ?? availableInstallmentOptions[0];

    const stickyDesktopPrice = activeTrack === 'purchase'
        ? purchasePriceLabel
        : (rentalPriceLabel ? `from ${rentalPriceLabel}` : pdpCommerceContent.trackLabels.rent);
    const stickyMobilePrice = activeTrack === 'purchase'
        ? purchasePriceLabel
        : (rentalPriceLabel ? `from ${rentalPriceLabel}` : pdpCommerceContent.pricing.rentalUnavailable);
    const activeTrackCtaLabel = activeTrack === 'purchase' ? pdpCommerceContent.cta.stickyAddToCart : pdpCommerceContent.cta.stickyTryIt;
    const mobilePrimaryLabel = activeTrack === 'purchase' ? pdpCommerceContent.cta.mobileBuy : pdpCommerceContent.cta.mobileRent;
    const alternativeTrack: PurchaseTrack = activeTrack === 'purchase' ? 'rental' : 'purchase';
    const alternativeTrackLabel = alternativeTrack === 'purchase' ? pdpCommerceContent.trackLabels.buyLower : pdpCommerceContent.trackLabels.rentLower;
    const primaryTrackActionDescribedBy = activeTrack === 'purchase'
        ? `${PDP_TRACK_STATUS_ID} ${PDP_CART_STATUS_ID}`
        : PDP_TRACK_STATUS_ID;
    const trackStatusMessage = activeTrack === 'purchase'
        ? `${data.name} buy track selected. Purchase price ${purchasePriceLabel}; add-to-cart controls are ready.`
        : `${data.name} rent track selected. ${rentalPriceLabel ? `Rental starts from ${rentalPriceLabel}` : 'Rental plan is reviewed before quote'} with ${rentalMinimumPeriod} minimum.`;

    const addCurrentTechToCart = () => {
        if (!mappedProduct) {
            setCartStatusMessage('Product pricing requires manual review before checkout.');
            return;
        }

        addItem({
            id: `tech-${data.id.toLowerCase()}`,
            name: data.name,
            price: purchasePriceValue,
            image: CART_ITEM_GRADIENTS[data.id] ?? 'from-slate-400 to-slate-600',
        });
        setCartStatusMessage(`${data.name} added to checkout cart.`);
        if (cartStatusTimeoutRef.current) {
            clearTimeout(cartStatusTimeoutRef.current);
        }
        cartStatusTimeoutRef.current = setTimeout(() => {
            setCartStatusMessage('');
        }, 4_000);
    };

    const handlePrimaryTrackAction = () => {
        captureProductDetailAction('primary_action_clicked', 'sticky_or_offer_panel', {
            selectedTrack: activeTrack,
        });

        if (activeTrack === 'purchase') {
            addCurrentTechToCart();
            captureProductDetailAction('add_to_cart_clicked', 'sticky_or_offer_panel');
            return;
        }

        captureProductDetailAction('rental_request_clicked', 'sticky_or_offer_panel', {
            destinationPath: productRentalHref,
        });
        navigateToPage(`rental?device=${techSlug}`);
    };

    const handleSwitchTrack = (track: PurchaseTrack) => {
        captureProductDetailAction('track_selected', 'mobile_track_drawer', {
            selectedTrack: track,
        });
        setActiveTrack(track);
        setShowMobileTrackDrawer(false);
    };

    const handleTrackSelect = (track: PurchaseTrack, source: string) => {
        captureProductDetailAction('track_selected', source, {
            selectedTrack: track,
        });
        setActiveTrack(track);
    };

    const handleToggleDelivery = () => {
        const nextExpanded = !showDelivery;
        captureProductDetailAction('delivery_panel_toggled', 'delivery_panel', {
            isExpanded: nextExpanded,
        });
        setShowDelivery(nextExpanded);
    };

    const handleToggleSafety = () => {
        const nextExpanded = !showSafety;
        captureProductDetailAction('safety_panel_toggled', 'safety_panel', {
            isExpanded: nextExpanded,
        });
        announceProductDetailAction(
            nextExpanded
                ? `Opening safety and use boundaries for ${data.name}.`
                : `Collapsing safety and use boundaries for ${data.name}.`
        );
        setShowSafety(nextExpanded);
    };

    const handleToggleContraindication = (condition: string) => {
        const isOpening = expandedContraindication !== condition;
        announceProductDetailAction(
            isOpening
                ? `Opening ${condition} safety detail.`
                : `Closing ${condition} safety detail.`
        );
        setExpandedContraindication(isOpening ? condition : null);
    };

    const handleToggleFaq = (index: number) => {
        setExpandedFaq((previous) => {
            const next = previous === index ? null : index;
            captureProductDetailAction('faq_toggled', 'faq_section', {
                isExpanded: next === index,
            });
            return next;
        });
    };

    const handleResourceClick = (resourceType: string, destinationPath?: string) => {
        announceProductDetailAction(`Opening ${resourceType} resource for ${data.name}.`);
        captureProductDetailAction('resource_clicked', 'resource_link', {
            destinationPath,
            resourceType,
        });
    };

    const handleSupportExitClick = (destinationPath: string, source = 'support_link', label = 'support path') => {
        announceDetailNavigation(label);
        captureProductDetailAction('support_exit_clicked', source, {
            destinationPath,
        });
    };

    const handleOpenFinancingDrawer = (source: string) => {
        if (!pdpFinancingDrawerEnabled) {
            announceProductDetailAction(`Financing options are not available in this ${data.name} view.`);
            return;
        }

        announceProductDetailAction(`Opening financing options for ${data.name}.`);
        captureProductDetailAction('financing_drawer_opened', source);
        setShowFinancing(true);
    };

    const handleCloseFinancingDrawer = () => {
        announceProductDetailAction(`Closing financing options for ${data.name}.`);
        setShowFinancing(false);
    };

    const handleFinancingTermSelect = (months: number) => {
        announceProductDetailAction(`Selected ${months} month financing term for ${data.name}.`);
        captureProductDetailAction('financing_term_selected', 'financing_drawer', {
            loanTermMonths: months,
        });
        setLoanTerm(months);
    };

    const handleFinancingLearnMore = () => {
        announceProductDetailAction(`Opening financing details for ${data.name}.`);
        setShowFinancing(false);
        captureProductDetailAction('financing_learn_more_clicked', 'financing_drawer', {
            destinationPath: '/financing',
        });
        navigateToPage('financing');
    };

    const handleFinancingCompareRental = () => {
        announceProductDetailAction(`Switching ${data.name} to rental comparison from financing options.`);
        captureProductDetailAction('financing_compare_rental_clicked', 'financing_drawer', {
            selectedTrack: 'rental',
        });
        handleTrackSelect('rental', 'financing_drawer');
        setShowFinancing(false);
    };

    const calculateRentalSavings = (monthlyPrice: number, period: string): number => {
        if (!rentalBaselineMonthly || rentalBaselineMonthly <= monthlyPrice) return 0;
        const months = parsePeriodToMonths(period);
        return Math.max(0, (rentalBaselineMonthly - monthlyPrice) * months);
    };
    const contentCommerceProductId = TECH_TO_CONTENT_PRODUCT_ID[data.id];

    // Derived: matching research study for social proof strip — mapped by trace_id for precision
    const studyTraceIdMap: Partial<Record<TechType, string>> = {
        [TechType.HBOT]: 'HBOT-SPEC-001',
        [TechType.RLT]: 'RLT-SPEC-001',
        [TechType.HYDROGEN]: 'H2-SPEC-001',
        [TechType.EWOT]: 'EWOT-SPEC-001',
        [TechType.SAUNA_BLANKET]: 'SAUNA-SPEC-001',
        [TechType.EMS]: 'EMS-SPEC-001',
        [TechType.VNS]: 'VNS-SPEC-001',
        [TechType.HYPOXIC]: 'HYPOXIC-SPEC-001',
        [TechType.CRYO]: 'CRYO-SPEC-001',
    };
    const mappedStudy = RESEARCH_STUDIES.find(s => s.trace_id === studyTraceIdMap[data.id]);
    // A card with status 'Review Required' is an EDITORIAL PLACEHOLDER: its title,
    // value and description describe the review state rather than a finding — see
    // `nonCanonicalStudyNotice` in constants/content.ts, which explains legacy editor
    // surfaces. Rendering it in the public social-proof strip showed a shopper
    // 'Review required' as a headline figure, a 'Review Required' badge, and that
    // internal note. The /research hub consumes these cards deliberately
    // (tests/app/research.test.tsx asserts the status), so the DATA stays untouched;
    // only this customer-facing strip refuses them.
    const relatedStudy = mappedStudy?.status === 'Review Required' ? undefined : mappedStudy;

    const relatedProtocolModalitiesByTech: Partial<Record<TechType, string[]>> = {
        [TechType.HBOT]: ['HBOT'],
        [TechType.HYDROGEN]: ['H2'],
        [TechType.RLT]: ['RLT'],
        [TechType.PEMF]: ['PEMF'],
        [TechType.VNS]: ['PEMF'],
    };

    const relatedProtocolCards = useMemo(() => {
        const mappedModalities = relatedProtocolModalitiesByTech[data.id] ?? [];
        if (mappedModalities.length === 0) return [];

        return protocols
            .map((protocol) => toProtocolCardView(protocol.slug))
            .filter((card): card is NonNullable<typeof card> => Boolean(card))
            .filter((card) => card.modalities.some((modality) => mappedModalities.includes(modality)));
    }, [data.id]);
    const routeClusterLinks = useMemo(() => {
        return getProductTopicalLinks(
            techSlug,
            relatedProtocolCards.slice(0, 2).map((protocolCard) => protocolCard.slug)
        );
    }, [relatedProtocolCards, techSlug]);

    const resultTimeline = RESULT_TIMELINES[data.id];

    useEffect(() => {
        return () => {
            if (cartStatusTimeoutRef.current) {
                clearTimeout(cartStatusTimeoutRef.current);
            }
        };
    }, []);

    const selectedHbotChamber = useMemo(() => {
        if (data.id !== TechType.HBOT) return null;

        return (
            getChamberBySlug(selectedHbotChamberSlug) ??
            getChamberBySlug(HBOT_DEFAULT_CHAMBER_SLUG) ??
            ALL_CHAMBERS[0] ??
            null
        );
    }, [data.id, selectedHbotChamberSlug]);

    const selectedHbotHeroImage = useMemo(() => {
        if (!selectedHbotChamber) return null;
        return selectedHbotChamber.images.find((img) => img.role === 'hero')?.url ?? null;
    }, [selectedHbotChamber]);

    const selectedCompareChambers = useMemo(() => {
        if (compareChamberIds.length === 0) return [];
        return ALL_CHAMBERS.filter((chamber) => compareChamberIds.includes(chamber.id));
    }, [compareChamberIds]);

    const toggleCompareChamber = (chamberId: string) => {
        setCompareChamberIds((prev) => {
            if (prev.includes(chamberId)) {
                captureProductDetailAction('compare_chamber_toggled', 'chamber_selector', {
                    chamberSlug: getSafeHbotChamberKey(chamberId),
                    compareCount: Math.max(0, prev.length - 1),
                    isSelected: false,
                });
                return prev.filter((id) => id !== chamberId);
            }

            if (prev.length >= 3) return prev;
            const next = [...prev, chamberId];
            captureProductDetailAction('compare_chamber_toggled', 'chamber_selector', {
                chamberSlug: getSafeHbotChamberKey(chamberId),
                compareCount: next.length,
                isSelected: true,
            });
            return next;
        });
    };

    const removeCompareChamber = (chamberId: string) => {
        captureProductDetailAction('compare_chamber_removed', 'compare_dock', {
            chamberSlug: getSafeHbotChamberKey(chamberId),
            compareCount: Math.max(0, compareChamberIds.length - 1),
        });
        setCompareChamberIds((prev) => prev.filter((id) => id !== chamberId));
    };

    const clearCompareChambers = () => {
        setCompareChamberIds([]);
        setShowChamberCompareModal(false);
    };

    const handleOpenCompareModal = () => {
        captureProductDetailAction('compare_modal_opened', 'compare_dock', {
            compareCount: compareChamberIds.length,
        });
        announceProductDetailAction(`Opening HBOT chamber comparison for ${data.name}.`);
        setShowChamberCompareModal(true);
    };

    const handleCloseCompareModal = () => {
        announceProductDetailAction(`Closing HBOT chamber comparison for ${data.name}.`);
        setShowChamberCompareModal(false);
    };

    useEffect(() => {
        if (searchParams.get('view') === 'science') {
            setMode(ViewMode.EXPERT);
            return;
        }

        setMode(ViewMode.STANDARD);
    }, [searchParams, techId]);

    useEffect(() => {
        if (modeParam?.toLowerCase() === 'rental') {
            setActiveTrack('rental');
            return;
        }

        if (typeof document !== 'undefined' && document.referrer.includes('/rental')) {
            setActiveTrack('rental');
        }
    }, [modeParam]);

    useEffect(() => {
        if (data.id !== TechType.HBOT) return;

        const urlSlug = searchParams.get('chamber');

        if (urlSlug && getChamberBySlug(urlSlug)) {
            setSelectedHbotChamberSlug(urlSlug);
            return;
        }

        setSelectedHbotChamberSlug(HBOT_DEFAULT_CHAMBER_SLUG);
    }, [data.id, searchParams]);

    useEffect(() => {
        if (rentalPlans.length === 0) {
            setSelectedRentalPeriod('');
            return;
        }

        setSelectedRentalPeriod((previous) => {
            if (previous && rentalPlans.some((plan) => plan.period === previous)) {
                return previous;
            }

            const firstPlan = rentalPlans[0];
            return firstPlan?.period ?? '';
        });
    }, [rentalPlans]);

    useEffect(() => {
        if (availableInstallmentOptions.length === 0) return;

        setLoanTerm((previous) => {
            if (availableInstallmentOptions.some((option) => option.months === previous)) {
                return previous;
            }

            const firstInstallment = availableInstallmentOptions[0];
            return firstInstallment?.months ?? previous;
        });
    }, [availableInstallmentOptions]);

    useEffect(() => {
        if (!(pdpDualTrackEnabled && pdpStickyCtaEnabled)) {
            setIsCommercePanelInView(true);
            return;
        }

        const panelNode = dualTrackPanelRef.current;
        if (!panelNode) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsCommercePanelInView(entry?.isIntersecting ?? false);
            },
            {
                threshold: 0.25,
            }
        );

        observer.observe(panelNode);

        return () => observer.disconnect();
    }, [pdpDualTrackEnabled, pdpStickyCtaEnabled, data.id]);

    useEffect(() => {
        if (!(showFinancing || showMobileTrackDrawer)) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [showFinancing, showMobileTrackDrawer]);

    const selectHbotChamber = (slug: string) => {
        captureProductDetailAction('chamber_selected', 'chamber_selector', {
            chamberSlug: getSafeHbotChamberKey(slug),
        });
        setSelectedHbotChamberSlug(slug);

        const params = new URLSearchParams(searchParams.toString());
        params.set('chamber', slug);
        router.replace(`${pathname}?${params.toString()}`);
    };

    const toggleMode = (newMode: ViewMode) => {
        announceProductDetailAction(
            `${newMode === ViewMode.EXPERT ? 'Science' : 'Simple'} view selected for ${data.name}.`
        );
        captureProductDetailAction('view_mode_selected', 'view_toggle', {
            viewMode: newMode,
        });
        setMode(newMode);
        const params = new URLSearchParams(searchParams.toString());
        if (newMode === ViewMode.EXPERT) params.set('view', 'science');
        else params.delete('view');
        const query = params.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    };

    const navigateToPage = (page: string) => {
        if (onNavigate) {
            onNavigate(page);
            return;
        }

        router.push(`/${page}`);
        window.scrollTo(0, 0);
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* === HERO SECTION === */}
            <TechHero
                data={data}
                onBack={onBack}
                onNavigate={onNavigate}
                selectedHbotChamberSlug={selectedHbotChamber?.slug}
                onSelectHbotChamber={data.id === TechType.HBOT ? selectHbotChamber : undefined}
                compareChamberIds={compareChamberIds}
                heroHeadingLevel={serverIntroRendered ? 2 : 1}
                onToggleCompareChamber={data.id === TechType.HBOT ? toggleCompareChamber : undefined}
            />
            <p
                id={PDP_DETAIL_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={PDP_DETAIL_ACTION_STATUS_LABEL}
                className="sr-only"
            >
                {detailActionStatusMessage}
            </p>

            <FeatureGate flag="feature_pdp_dual_track">
                <section
                    data-testid="product-detail-commerce-surface"
                    className="border-b border-white/10 bg-slate-950 py-12 text-white"
                >
                    <div className="max-w-5xl mx-auto px-6">
                        <div
                            ref={dualTrackPanelRef}
                            className="rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-none md:p-8"
                        >
                            <div className="inline-flex w-full rounded-lg border border-white/10 bg-slate-950/55 p-1 sm:w-auto mb-6">
                                <button
                                    type="button"
                                    onClick={() => handleTrackSelect('purchase', 'dual_track_panel')}
                                    className={`flex-1 sm:flex-none min-h-11 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.14em] transition-all ${
                                        activeTrack === 'purchase' ? 'bg-cyan-300 text-slate-950 shadow-none' : 'text-slate-300 hover:text-white'
                                    }`}
                                    aria-pressed={activeTrack === 'purchase'}
                                    aria-describedby={PDP_TRACK_STATUS_ID}
                                >
                                    {pdpCommerceContent.trackLabels.buy}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTrackSelect('rental', 'dual_track_panel')}
                                    className={`flex-1 sm:flex-none min-h-11 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-[0.14em] transition-all ${
                                        activeTrack === 'rental' ? 'bg-cyan-300 text-slate-950 shadow-none' : 'text-slate-300 hover:text-white'
                                    }`}
                                    aria-pressed={activeTrack === 'rental'}
                                    aria-describedby={PDP_TRACK_STATUS_ID}
                                >
                                    {pdpCommerceContent.trackLabels.rent}
                                </button>
                            </div>
                            <p
                                id={PDP_TRACK_STATUS_ID}
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                aria-label={PDP_TRACK_STATUS_LABEL}
                                className="sr-only"
                            >
                                {trackStatusMessage}
                            </p>

                            <AnimatePresence mode="wait">
                                {activeTrack === 'purchase' ? (
                                    <motion.div
                                        key="purchase-track"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex flex-wrap items-end gap-3 mb-2">
                                            <span className="text-3xl md:text-4xl font-black text-white">{purchasePriceLabel}</span>
                                            <span className="text-xs uppercase tracking-[0.18em] text-cyan-200 font-bold pb-1">{pdpCommerceContent.trackLabels.purchaseBadge}</span>
                                        </div>

                                        {financingHint && (
                                            <button
                                                type="button"
                                                onFocus={() => announceProductDetailAction(`Financing options are ready for ${data.name}.`)}
                                                onClick={() => handleOpenFinancingDrawer('offer_panel')}
                                                className={`text-sm font-semibold ${pdpFinancingDrawerEnabled ? 'text-cyan-100 hover:text-cyan-50 underline underline-offset-4' : 'text-slate-500 cursor-default'}`}
                                                aria-label={pdpCommerceContent.pricing.financingAriaLabel}
                                                aria-describedby={`${PDP_TRACK_STATUS_ID} ${PDP_DETAIL_ACTION_STATUS_ID}`}
                                            >
                                                {financingHint}
                                            </button>
                                        )}

                                        <div className="mt-5">
                                            <button
                                                type="button"
                                                onClick={handlePrimaryTrackAction}
                                                aria-describedby={primaryTrackActionDescribedBy}
                                                className="w-full sm:w-auto min-h-11 px-8 py-3 bg-cyan-300 text-slate-950 rounded-lg font-bold text-xs uppercase tracking-[0.18em] shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:bg-cyan-200 active:scale-[0.98]"
                                            >
                                                {pdpCommerceContent.cta.addToCart}
                                            </button>
                                            <p
                                                id={PDP_CART_STATUS_ID}
                                                role="status"
                                                aria-live="polite"
                                                aria-atomic="true"
                                                aria-label={PDP_CART_STATUS_LABEL}
                                                className={`mt-3 min-h-5 text-sm font-semibold text-emerald-300 transition-opacity ${
                                                    cartStatusMessage ? 'opacity-100' : 'opacity-0'
                                                }`}
                                            >
                                                {cartStatusMessage}
                                            </p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="rental-track"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex flex-wrap items-end gap-3 mb-1">
                                            <span className="text-3xl md:text-4xl font-black text-white">{rentalPriceLabel ?? pdpCommerceContent.pricing.rentalUnavailable}</span>
                                            <span className="text-xs uppercase tracking-[0.18em] text-cyan-200 font-bold pb-1">{pdpCommerceContent.trackLabels.rentalBadge}</span>
                                        </div>
                                        <p className="text-sm text-slate-300">{pdpCommerceContent.pricing.minimumPeriodPrefix} {rentalMinimumPeriod}</p>
                                        {rentalDepositLabel && (
                                            <p className="text-sm text-slate-300">{pdpCommerceContent.pricing.refundableDepositPrefix} {rentalDepositLabel}</p>
                                        )}

                                        {rentalPlans.length > 0 && (
                                            <div className="mt-5 space-y-2">
                                                {rentalPlans.map((plan) => {
                                                    const isSelected = selectedRentalPlan?.period === plan.period;
                                                    const savings = calculateRentalSavings(plan.monthlyPrice, plan.period);

                                                    return (
                                                        <button
                                                key={plan.period}
                                                type="button"
                                                onClick={() => {
                                                    captureProductDetailAction('rental_period_selected', 'rental_period_selector', {
                                                        rentalPeriod: plan.period,
                                                    });
                                                    setSelectedRentalPeriod(plan.period);
                                                }}
                                                className={`w-full text-left min-h-11 rounded-lg border px-4 py-3 transition-colors ${isSelected ? 'border-cyan-300/45 bg-cyan-300/10' : 'border-white/10 bg-slate-950/55 hover:border-cyan-300/45 hover:bg-white/[0.07]'}`}
                                                aria-pressed={isSelected}
                                                aria-describedby={PDP_TRACK_STATUS_ID}
                                            >
                                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                                <span className="text-sm font-semibold text-white">
                                                                    {plan.period} — {priceBookMonthlyText(plan.monthlyPrice)}
                                                                </span>
                                                                {savings > 0 && (
                                                                    <span className="text-xs font-semibold text-emerald-300">
                                                                        {pdpCommerceContent.pricing.savingsPrefix} {formatPrice(savings)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div className="mt-5">
                                            <Link
                                                href={productRentalHref}
                                                onClick={() => {
                                                    captureProductDetailAction('rental_request_clicked', 'offer_panel', {
                                                        destinationPath: productRentalHref,
                                                    });
                                                }}
                                                className="inline-flex w-full sm:w-auto min-h-11 items-center justify-center px-8 py-3 bg-cyan-300 text-slate-950 rounded-lg font-bold text-xs uppercase tracking-[0.18em] shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:bg-cyan-200 active:scale-[0.98]"
                                                aria-describedby={PDP_TRACK_STATUS_ID}
                                            >
                                                {pdpCommerceContent.cta.tryIt}
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <ul className="space-y-2">
                                    {anxietyBufferItems.map((item) => (
                                        <li key={item} className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
                                            <CheckCircle size={14} className="text-emerald-300 mt-0.5 shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">
                                    {disclaimers.pdp}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </FeatureGate>

            <section
                data-testid="product-detail-route-context-surface"
                className="border-b border-white/10 bg-slate-950 py-8 text-white"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-none md:p-7">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-200">
                            Browse this page
                        </p>
                        <h2 className="mt-2 text-xl font-bold text-white">
                            Connect this device to conditions, research, protocols, and next steps
                        </h2>
                        <p className="mt-2 max-w-3xl text-sm text-slate-300">
                            Use these direct links to move from the product detail into planning, evidence review, and practical next-step pages.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {routeClusterLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    {...getDetailActionStatusProps(`${link.label} link is ready for ${data.name}.`)}
                                    onClick={() => announceDetailNavigation(link.label)}
                                    className="inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-slate-950/55 px-4 text-sm font-semibold text-slate-200 shadow-none transition-colors duration-200 hover:border-cyan-300/45 hover:bg-white/[0.07] hover:text-white"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            {/* === HBOT TOP MODEL SPOTLIGHT === */}
            {data.id === TechType.HBOT && selectedHbotChamber && (
                <section
                    data-testid="product-detail-hbot-spotlight-surface"
                    className="border-b border-white/10 bg-slate-950 py-12 text-white"
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Active HBOT Configuration</span>
                                <h2 className="text-3xl font-black text-white mb-2 break-words">{selectedHbotChamber.fullName}</h2>
                                <p className="text-slate-300 text-sm leading-relaxed mb-6">{selectedHbotChamber.shortDescription}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedHbotChamber.specifications.slice(0, 4).map((spec) => (
                                        <div key={spec.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-4 shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-white/[0.07] min-w-0">
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1.5 truncate">{spec.label}</span>
                                            <span className="text-base font-bold text-white break-words">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] shadow-none aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">
                                {selectedHbotHeroImage ? (
                                    <OptimizedImage
                                        src={selectedHbotHeroImage}
                                        alt={selectedHbotChamber.fullName}
                                        width={720}
                                        height={540}
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="w-full h-full object-contain p-6"
                                    />
                                ) : (
                                    <HbotChamberMediaFallback
                                        title={selectedHbotChamber.fullName}
                                        specifications={selectedHbotChamber.specifications}
                                        className="w-full h-full min-h-[260px] rounded-none border-0"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <TechDetailDeliverySection
                dataName={data.name}
                showDelivery={showDelivery}
                onToggleDelivery={handleToggleDelivery}
            />

{/* === RESEARCH SOCIAL PROOF STRIP === */}
            {relatedStudy && (
                <section id="research" className="py-8 bg-slate-900 border-b border-slate-800">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                            <div className="flex items-center gap-5">
                                <div className="text-4xl font-black text-cyan-400 tabular-nums">{relatedStudy.value}</div>
                                <div>
                                    <div className="text-white font-bold text-sm">{relatedStudy.metric}</div>
                                    <div className="text-slate-400 text-xs mt-0.5">{relatedStudy.title}</div>
                                </div>
                            </div>
                            <div className="hidden md:block w-px h-10 bg-slate-700" />
                            <div className="flex items-center gap-4 text-slate-400 text-xs flex-wrap justify-center">
                                {/* A participant count is only meaningful when it exists. Printing
                                    '0 participants' next to a published record reads as a study with
                                    no subjects, which is a claim about the evidence, not a blank. */}
                                {relatedStudy.participants > 0 && (
                                    <>
                                        <span className="flex items-center gap-1.5">
                                            <Users size={13} className="text-slate-500" />
                                            <strong className="text-slate-300">{relatedStudy.participants}</strong> participants
                                        </span>
                                        <span className="text-slate-700">·</span>
                                    </>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${relatedStudy.status === 'Published' ? 'bg-emerald-900/50 text-emerald-400' : relatedStudy.status === 'Peer Review' ? 'bg-blue-900/50 text-blue-400' : 'bg-amber-900/50 text-amber-400'}`}>
                                    {relatedStudy.status}
                                </span>
                                {relatedStudy.pubmedUrl && (
                                    <a
                                        href={relatedStudy.pubmedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        {...getDetailActionStatusProps(`PubMed source is ready for ${data.name}.`)}
                                        onClick={() => handleResourceClick('PubMed source', relatedStudy.pubmedUrl)}
                                        className="inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-cyan-300 transition-colors hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                    >
                                        <BookOpen size={12} /> PubMed →
                                    </a>
                                )}
                            </div>
                            <div className="hidden md:block w-px h-10 bg-slate-700" />
                            <p className="text-slate-400 text-xs max-w-xs text-center md:text-left leading-relaxed">{relatedStudy.description}</p>
                        </div>
                    </div>
                </section>
            )}

            {/* === DESCRIPTION with inline View Toggle === */}
            <section
                id="description"
                data-testid="product-detail-description-surface"
                className="border-y border-white/10 bg-slate-950 py-20 text-white"
            >
                <div className="max-w-4xl mx-auto px-6">
                    {/* Inline Toggle */}
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-white">
                            {isExpert ? 'Mechanism of Action' : 'What It Does'}
                        </h2>
                        <div className="inline-flex rounded-lg border border-white/10 bg-slate-950/55 p-1">
                            <button
                                type="button"
                                onClick={() => toggleMode(ViewMode.STANDARD)}
                                {...getDetailActionStatusProps(`Simple view toggle is ready for ${data.name}.`)}
                                aria-pressed={!isExpert}
                                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${!isExpert ? 'bg-cyan-300 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}
                            >
                                Simple
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleMode(ViewMode.EXPERT)}
                                {...getDetailActionStatusProps(`Science view toggle is ready for ${data.name}.`)}
                                aria-pressed={isExpert}
                                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${isExpert ? 'bg-cyan-300 text-slate-950 shadow' : 'text-slate-300 hover:text-white'}`}
                            >
                                Science
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {!isExpert ? (
                            <motion.p
                                key="simple"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-xl leading-relaxed text-slate-300"
                            >
                                <SmartText variant="dark">{data.descriptionStandard}</SmartText>
                            </motion.p>
                        ) : (
                            <motion.div
                                key="science"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="rounded-lg border border-white/10 bg-white/[0.045] p-8"
                            >
                                <p className="text-lg text-cyan-100/80 font-mono leading-relaxed mb-8">
                                    <SmartText variant="dark">{data.descriptionExpert}</SmartText>
                                </p>
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {data.technicalSpecs.map((spec) => {
                                        const annotation = pdpSpecAnnotationsEnabled
                                            ? getBatch3SpecAnnotation(data.id, spec.label)
                                            : null;

                                        return (
                                            <div key={spec.label} className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
                                                <span className="text-[10px] uppercase tracking-wider text-cyan-400 block mb-1">{spec.label}</span>
                                                <span className="text-xl font-mono font-bold text-white">{spec.value}</span>
                                                {annotation && (
                                                    <p className="text-[11px] leading-relaxed text-cyan-100/70 mt-2">{annotation}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {data.molecularPathways && data.molecularPathways.length > 0 && (
                                    <div className="border-t border-white/10 pt-5">
                                        <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold block mb-3">Active Molecular Pathways</span>
                                        <div className="flex flex-wrap gap-2">
                                            {data.molecularPathways.map((pathway) => (
                                                <span key={pathway} className="text-xs bg-purple-500/10 border border-purple-500/30 text-purple-300 px-3 py-1.5 rounded-full font-mono">
                                                    {pathway}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content Freshness */}
                    {guidanceUpdatedLabel && (
                        <div className="mt-8 border-t border-white/10 pt-6">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <CheckCircle size={12} className="text-emerald-500" />
                                <span>Guidance updated: {guidanceUpdatedLabel}</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {pdpTrustHierarchyEnabled && (
                <section
                    id="trust"
                    data-testid="product-detail-trust-surface"
                    className="border-y border-white/10 bg-slate-950 py-14 text-white"
                >
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-8">
                            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Trust Signal</span>
                            <h2 className="text-2xl font-bold text-white">Why this product made our shortlist</h2>
                            <p className="text-sm text-slate-300 mt-3 max-w-2xl mx-auto">
                                {batch3PdpContent.trustHierarchy.whySelected}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-white/[0.07]">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-200 block mb-2">Documentation</span>
                                <p className="text-sm font-semibold text-white">
                                    {productDocuments.length > 0
                                        ? `${productDocuments.length} downloadable document${productDocuments.length > 1 ? 's' : ''}`
                                        : 'Documentation available on request'}
                                </p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-white/[0.07]">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-200 block mb-2">Protocol Readiness</span>
                                <p className="text-sm font-semibold text-white">{batch3PdpContent.trustHierarchy.protocolSignal}</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-white/[0.07]">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-200 block mb-2">Content Status</span>
                                <p className="text-sm font-semibold text-white">
                                    {guidanceUpdatedLabel ? `Updated ${guidanceUpdatedLabel}` : 'Evidence and policy links available on this page'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* === HBOT COMPARE DOCK + MODAL === */}
            {data.id === TechType.HBOT && selectedCompareChambers.length > 0 && (
                <>
                    <ChamberCompareDock5
                        chambers={selectedCompareChambers}
                        onRemove={removeCompareChamber}
                        onClear={clearCompareChambers}
                        onOpenCompare={handleOpenCompareModal}
                    />

                    <AnimatePresence>
                        {showChamberCompareModal && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[95]"
                                    onClick={handleCloseCompareModal}
                                />
                                <motion.div
                                    role="dialog"
                                    aria-modal="true"
                                    aria-labelledby="chamber-compare-modal-title"
                                    aria-describedby={PDP_DETAIL_ACTION_STATUS_ID}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed inset-x-3 md:inset-x-8 top-[5vh] bottom-[5vh] z-[96] overflow-hidden rounded-lg border border-white/10 bg-slate-950 shadow-none"
                                >
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                                        <h3 id="chamber-compare-modal-title" className="text-base font-bold text-white">HBOT Chamber Comparison</h3>
                                        <button
                                            type="button"
                                            onFocus={() => announceProductDetailAction(`Close HBOT chamber comparison is ready for ${data.name}.`)}
                                            onClick={handleCloseCompareModal}
                                            className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.10]"
                                            aria-label="Close comparison"
                                            aria-describedby={PDP_DETAIL_ACTION_STATUS_ID}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="h-[calc(100%-73px)] overflow-auto p-4 md:p-6">
                                        <ChamberCompare5
                                            chambers={selectedCompareChambers}
                                            onRemove={removeCompareChamber}
                                            onClear={clearCompareChambers}
                                            onNavigate={(slug) => {
                                                const selected = getChamberBySlug(slug);
                                                if (selected) {
                                                    captureProductDetailAction('compare_chamber_activated', 'compare_modal', {
                                                        chamberSlug: getSafeHbotChamberKey(slug),
                                                    });
                                                    selectHbotChamber(slug);
                                                    setShowChamberCompareModal(false);
                                                }
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* === HBOT MODEL-SPECIFIC DETAILS === */}
            {data.id === TechType.HBOT && selectedHbotChamber && (
                <section
                    data-testid="product-detail-hbot-configuration-surface"
                    className="bg-slate-950 py-20 text-white"
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Active Configuration</span>
                            <h2 className="text-3xl font-bold text-white">{selectedHbotChamber.fullName}</h2>
                            <p className="text-slate-300 mt-3 text-sm max-w-2xl mx-auto">{selectedHbotChamber.shortDescription}</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-8">
                                <h3 className="text-lg font-bold text-white mb-4">Model Description</h3>
                                <div className="space-y-2">{renderChamberDescription(selectedHbotChamber.description)}</div>
                            </div>

                            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-8 text-white">
                                <h3 className="text-lg font-bold mb-5">Specifications</h3>
                                <div className="space-y-3">
                                    {selectedHbotChamber.specifications.map((spec) => (
                                        <div key={spec.label} className="flex items-start justify-between gap-4 border-b border-white/10 pb-2">
                                            <span className="text-xs text-slate-300">{spec.label}</span>
                                            <span className="text-sm font-semibold text-right">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* === HYDROGEN: WHAT IS H2 THERAPY? === */}
            {data.id === TechType.HYDROGEN && (
                <>
                    <ResearchOverviewSection
                        themeLabel="The Science of Small"
                        themeColorClass="text-sky-200"
                        title="What is Hydrogen Therapy?"
                        intro="Molecular hydrogen is presented here as an inhalation and hydrogen-water modality for protocol planning. Hylono keeps the claim posture conservative and asks users to review cited evidence, limitations, and support guidance before choosing a routine."
                        stats={[
                            { value: 'Quote-confirmed', label: 'H₂ output', sub: 'Supplier specification reviewed before quote' },
                            { value: '>1200 ppb', label: 'Water Concentration', sub: 'Per litre, support-level concentration' },
                            { value: '300-900', label: 'Flow Range', sub: 'ml/min device context' },
                            { value: '3', label: 'Evidence Records', sub: 'Meta-analysis, RCT, and review' },
                        ]}
                        supportTitle="What Molecular Hydrogen May Support"
                        applications={[
                            { icon: <Flame size={18} />, title: 'Fatigue evidence review', desc: 'Current hydrogen records include fatigue and aerobic-capacity outcomes, with protocol variation and evidence limits visible.' },
                            { icon: <Brain size={18} />, title: 'Stress-routine support', desc: 'Use the H2 foundation protocol to place hydrogen inside a calmer daily routine rather than a specific result.' },
                            { icon: <Zap size={18} />, title: 'Recovery-context planning', desc: 'Compare hydrogen as a supporting routine alongside recovery and vitality protocols before choosing access.' },
                            { icon: <Activity size={18} />, title: 'Hydration access', desc: 'Hydrogen-water use should follow the model instructions and wider protocol context.' },
                        ]}
                        hoverBorderClass="hover:border-sky-300/40"
                        iconBgClass="bg-sky-300/10"
                        iconColorClass="text-sky-200"
                    />
                    <p className="text-center text-[10px] text-slate-400 mt-[-2rem] mb-8 italic max-w-2xl mx-auto">
                        Research citations available in the Deep Intelligence section below.
                    </p>
                </>
            )}

            {/* === HYDROGEN: DELIVERY ECOSYSTEM === */}
            {data.id === TechType.HYDROGEN && (
                <section
                    data-testid="product-detail-hydrogen-delivery-surface"
                    className="border-y border-white/10 bg-slate-950 py-20 text-white"
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center mb-14">
                            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Complete System</span>
                            <h2 className="text-4xl font-bold text-white mb-4">Four Ways to Receive H₂</h2>
                            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                The hydrogen ecosystem includes inhalation, accessory, and hydrogen-water formats. Treat each format as a practical access option that still needs protocol context and support guidance.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Card 1: HOP-450 Inhalation Unit */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="relative overflow-hidden rounded-lg border border-cyan-300/35 bg-cyan-300/10 p-8 text-white shadow-none"
                            >
                                <div className="absolute right-0 top-0 h-40 w-40 -translate-y-8 translate-x-8 rounded-full border border-cyan-300/20 bg-cyan-300/10" />
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <span className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-100">Primary Device</span>
                                            <h3 className="text-2xl font-black mt-3 mb-1">Inhalation Unit</h3>
                                            <p className="text-cyan-100 text-sm font-mono">HOP-450 · PEM Electrolysis</p>
                                        </div>
                                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
                                            <Wind size={32} />
                                        </div>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                        The HOP-450 uses PEM electrolysis with supplier-confirmed H2 output and a 300-900 ml/min flow range. Use the nasal cannula and timing guidance from the selected protocol instead of treating output as a specific outcome.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {['300-900 ml/min', 'PEM electrolysis', 'Pulse + continuous', '>1200 ppb water'].map(tag => (
                                            <span key={tag} className="rounded-lg border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[11px] font-bold text-slate-100">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-3 pt-4 border-t border-white/20 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <span className="text-2xl font-black">{purchasePriceLabel}</span>
                                            <span className="block text-slate-300 text-sm sm:ml-2 sm:inline">
                                                {rentalPriceLabel ? `or rental from ${rentalPriceLabel}` : 'rental plan confirmed before quote'}
                                            </span>
                                        </div>
                                        <Link
                                            href={productRentalHref}
                                            {...getDetailActionStatusProps(`Hydrogen rental planning link is ready for ${data.name}.`)}
                                            onClick={() => handleSupportExitClick(productRentalHref, 'hydrogen_accessory_panel', 'hydrogen rental planning')}
                                            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                        >
                                            Plan H2 rental
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Card 2: H2 Goggles */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="rounded-lg border border-white/10 bg-white/[0.045] p-8 transition-all hover:border-cyan-300/45 hover:bg-white/[0.07]"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <span className="rounded-lg border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-100">Eye &amp; Skin Add-on</span>
                                        <h3 className="text-2xl font-black text-white mt-3 mb-1">H2 Therapy Goggles</h3>
                                        <p className="text-slate-300 text-sm">Targeted periorbital delivery</p>
                                    </div>
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-teal-300/30 bg-teal-300/10 text-teal-100">
                                        <Eye size={32} />
                                    </div>
                                </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                    Precision-sealed goggles are an optional accessory for localized comfort routines. They connect directly to the HOP-450 secondary port and should not be treated as a standalone evidence claim.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {['Connects to HOP-450', 'Soft silicone seal', 'Accessory option', 'Comfort routine'].map(tag => (
                                        <span key={tag} className="rounded-lg border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[11px] font-bold text-slate-100">{tag}</span>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm font-semibold text-slate-300">Accessory fit confirmed before quote</span>
                                    <Link
                                        href={hydrogenAccessoryContactHref}
                                        {...getDetailActionStatusProps(`Hydrogen accessory fit link is ready for ${data.name}.`)}
                                        onClick={() => announceDetailNavigation('hydrogen accessory fit review')}
                                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                    >
                                        Confirm accessory fit
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Card 3: H2 Earmuffs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.15 }}
                                className="rounded-lg border border-white/10 bg-white/[0.045] p-8 transition-all hover:border-cyan-300/45 hover:bg-white/[0.07]"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <span className="rounded-lg border border-indigo-300/30 bg-indigo-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-100">Auricular Add-on</span>
                                        <h3 className="text-2xl font-black text-white mt-3 mb-1">H2 Therapy Earmuffs</h3>
                                        <p className="text-slate-300 text-sm">Targeted inner ear delivery</p>
                                    </div>
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-indigo-300/30 bg-indigo-300/10 text-indigo-100">
                                        <Ear size={32} />
                                    </div>
                                </div>
                                    <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                    Soft hydrogen-delivery earmuffs are an optional accessory for localized comfort routines, with an adjustable silicone seal that connects to the HOP-450 secondary output port.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {['Connects to HOP-450', 'Adjustable fit', 'Accessory option', 'Comfort routine'].map(tag => (
                                        <span key={tag} className="rounded-lg border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[11px] font-bold text-slate-100">{tag}</span>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm font-semibold text-slate-300">Accessory fit confirmed before quote</span>
                                    <Link
                                        href={hydrogenAccessoryContactHref}
                                        {...getDetailActionStatusProps(`Hydrogen accessory fit link is ready for ${data.name}.`)}
                                        onClick={() => announceDetailNavigation('hydrogen accessory fit review')}
                                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                    >
                                        Confirm accessory fit
                                    </Link>
                                </div>
                            </motion.div>

                            {/* Card 4: Hydrogen Water Rod */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="rounded-lg border border-white/10 bg-white/[0.045] p-8 transition-all hover:border-cyan-300/45 hover:bg-white/[0.07]"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <span className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100">Hydration Add-on</span>
                                        <h3 className="text-2xl font-black text-white mt-3 mb-1">Hydrogen Water Rod</h3>
                                        <p className="text-slate-300 text-sm">Hydrogen-rich water format</p>
                                    </div>
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/10 text-emerald-100">
                                        <FlaskConical size={32} />
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                    Titanium PEM electrolysis rod for preparing hydrogen-rich water in a glass or bottle. Use the concentration, timing, and care instructions from the product guide.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {['>1200 ppb H2', 'Any glass or bottle', 'Titanium PEM', '10 min per litre'].map(tag => (
                                        <span key={tag} className="rounded-lg border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[11px] font-bold text-slate-100">{tag}</span>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-sm font-semibold text-slate-300">Accessory fit confirmed before quote</span>
                                    <Link
                                        href={hydrogenAccessoryContactHref}
                                        {...getDetailActionStatusProps(`Hydrogen accessory fit link is ready for ${data.name}.`)}
                                        onClick={() => announceDetailNavigation('hydrogen accessory fit review')}
                                        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                    >
                                        Confirm accessory fit
                                    </Link>
                                </div>
                            </motion.div>
                        </div>

                        {/* Multi-zone session tip */}
                        <div className="mt-8 flex flex-col items-start gap-4 rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-6 md:flex-row md:items-center">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
                                <Sparkles size={22} />
                            </div>
                            <div>
                                <h4 className="font-black text-white mb-1">Pro Tip: The Full-Spectrum Session</h4>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    Choose one routine first, confirm tolerance and setup, then ask support before combining inhalation, accessories, and hydrogen-rich water in the same session.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* === RLT: WHAT IS RED LIGHT THERAPY? === */}
            {data.id === TechType.RLT && <RltContextSection />}

            {/* === RLT: WAVELENGTH COMPARISON === */}
            {data.id === TechType.RLT && <RltWavelengthSection />}

            {/* === PEMF: WHAT IS ELECTROMAGNETIC THERAPY? === */}
            {data.id === TechType.PEMF && (
                <section
                    data-testid="product-detail-pemf-context-surface"
                    className="border-y border-white/10 bg-slate-950 py-20 text-white"
                >
                    <div className="max-w-6xl mx-auto px-6">
                        {/* Header */}
                        <div className="text-center mb-14">
                            <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest block mb-2">Protocol context</span>
                            <h2 className="text-4xl font-bold text-white mb-4">Where PEMF fits</h2>
                            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                PEMF is handled here as a complementary planning option. Start with the goal, review safety limits, and decide whether the device belongs in the routine before selecting settings.
                            </p>
                        </div>

                        {/* Key Science Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                            {[
                                { value: '20-30 min', label: 'Planning Window', sub: 'Common condition-page session range' },
                                { value: 'Screen first', label: 'Implanted Devices', sub: 'Review electronic implants before use' },
                                { value: 'Goal-led', label: 'Routine Fit', sub: 'Sleep, comfort, stress, or recovery context' },
                                { value: 'Evidence-limited', label: 'Claim Posture', sub: 'No universal outcome promise' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="rounded-lg border border-purple-300/20 bg-purple-300/10 p-6 text-center shadow-none"
                                >
                                    <div className="text-3xl font-black text-purple-100 mb-1">{stat.value}</div>
                                    <div className="font-bold text-white text-sm mb-0.5">{stat.label}</div>
                                    <div className="text-xs text-slate-300">{stat.sub}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* What PEMF Helps With — 12-item grid */}
                        <div className="text-center mb-10">
                            <span className="text-[10px] text-purple-200 font-bold uppercase tracking-widest block mb-2">Decision frame</span>
                            <h3 className="text-3xl font-bold text-white">How to use this page</h3>
                            <MedicalDisclaimer type="research" compact className="mt-3 text-center max-w-lg mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { icon: <Moon size={18} />, title: 'Sleep-routine context', desc: 'Compare PEMF against the sleep guide before turning it into the main evening option.' },
                                { icon: <Target size={18} />, title: 'Comfort planning', desc: 'Use the comfort guide when the question is goal fit rather than device specifications.' },
                                { icon: <Brain size={18} />, title: 'Stress-support routines', desc: 'Keep PEMF as one possible support layer inside a broader stress-planning path.' },
                                { icon: <Activity size={18} />, title: 'Recovery scheduling', desc: 'Place sessions around workload and rest instead of relying on a universal cadence.' },
                                { icon: <Shield size={18} />, title: 'Safety screening', desc: 'Resolve implanted-device, pregnancy, seizure-history, and bleeding concerns before use.' },
                                { icon: <CheckCircle size={18} />, title: 'Access decision', desc: 'Move into rental or contact only after the fit, limits, and support path are clear.' },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="rounded-lg border border-white/10 bg-white/[0.045] p-5 transition-all hover:border-purple-300/35 hover:bg-white/[0.07]"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-purple-300/20 bg-purple-300/10 text-purple-100">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm mb-1">{item.title}</h4>
                                            <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <p className="text-center text-[10px] text-slate-400 mt-8 italic max-w-2xl mx-auto">Review the research hub and condition guides before treating PEMF as the center of a plan.</p>
                    </div>
                </section>
            )}

            {/* === PEMF: FREQUENCY GUIDE === */}
            {data.id === TechType.PEMF && <PemfSettingsSection />}

            {/* === HOW TO USE === */}
            {data.protocolSteps && data.protocolSteps.length > 0 && (
                <section
                    id="how-to-use"
                    data-testid="product-detail-how-to-surface"
                    className="border-y border-white/10 bg-slate-950 py-20 text-white"
                >
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-14">
                            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Step-By-Step</span>
                            <h2 className="text-3xl font-bold text-white">How To Use It</h2>
                        </div>
                        <div className="relative">
                            {/* Connecting line */}
                            <div className="absolute top-8 left-[calc(16.67%)] right-[calc(16.67%)] hidden h-px bg-white/[0.10] md:block" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                {data.protocolSteps.map((step, idx) => (
                                    <motion.div
                                        key={step.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.15 }}
                                        className="rounded-lg border border-white/10 bg-white/[0.045] p-8 text-center shadow-none transition-colors hover:border-cyan-300/45 hover:bg-white/[0.07]"
                                    >
                                        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg ${data.accentColor} text-xl font-black text-white shadow-lg`}>
                                            {idx + 1}
                                        </div>
                                        <h3 className="text-lg font-black text-white mb-3 uppercase tracking-wide">{step.title}</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-4">{step.desc}</p>
                                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                                            <Clock size={12} />
                                            <span>{step.duration} min</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Optimal Timing Card */}
                        {data.optimalTiming && (
                            <div className="mt-10 flex flex-col items-center gap-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 sm:flex-row">
                                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ${data.accentColor} text-white shadow-md`}>
                                    {data.optimalTiming === 'morning' && <Sun size={24} />}
                                    {data.optimalTiming === 'afternoon' && <Zap size={24} />}
                                    {data.optimalTiming === 'evening' && <Moon size={24} />}
                                    {data.optimalTiming === 'any' && <Clock size={24} />}
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Optimal Timing</span>
                                    <p className="font-black text-white text-lg capitalize">
                                        {data.optimalTiming === 'any' ? 'Any Time of Day' : data.optimalTiming}
                                    </p>
                                    <p className="text-slate-300 text-sm mt-1">{data.timingReason}</p>
                                </div>
                                <div className="sm:ml-auto text-right hidden sm:block">
                                    <span className="text-xs text-slate-400 block">Total session time</span>
                                    <div className="text-2xl font-black text-white">
                                        {data.protocolSteps.reduce((sum, s) => sum + (s.duration ?? 0), 0)} min
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* === BENEFITS === */}
            <section
                id="benefits"
                data-testid="product-detail-benefits-surface"
                className="bg-slate-950 py-20 text-white"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Key Benefits</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {data.benefits.map((benefit) => (
                            <div
                                key={benefit}
                                className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-center shadow-none transition-all hover:-translate-y-1 hover:border-cyan-300/45 hover:bg-white/[0.07]"
                            >
                                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${data.accentColor} text-white`}>
                                    <Sparkles size={20} />
                                </div>
                                <span className="font-bold text-white"><SmartText variant="dark">{benefit}</SmartText></span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {pdpEvidenceEnabled && (
                <section
                    id="evidence"
                    data-testid="product-detail-evidence-surface"
                    className="border-y border-white/10 bg-slate-950 py-16 text-white"
                >
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-8">
                            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Evidence Snapshot</span>
                            <h2 className="text-2xl font-bold text-white">What current evidence suggests</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
                                {relatedStudy ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-3xl font-black text-cyan-200">{relatedStudy.value}</span>
                                            <div>
                                                <p className="text-sm font-bold text-white">{relatedStudy.metric}</p>
                                                <p className="text-xs text-slate-400">{relatedStudy.title}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed">{relatedStudy.description}</p>
                                        {relatedStudy.pubmedUrl && (
                                            <a
                                                href={relatedStudy.pubmedUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                {...getDetailActionStatusProps(`PubMed source is ready for ${data.name}.`)}
                                                onClick={() => handleResourceClick('PubMed source', relatedStudy.pubmedUrl)}
                                                className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-lg px-1 text-sm font-semibold text-cyan-200 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                            >
                                                <BookOpen size={14} /> View source on PubMed
                                            </a>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        We are continuously expanding modality-specific evidence summaries and will publish additional peer-reviewed references here.
                                    </p>
                                )}
                            </div>

                            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Evidence and safety themes</h3>
                                <ul className="space-y-2">
                                    {(knowledge?.approvedClaims ?? []).slice(0, 4).map((claim) => (
                                        <li key={claim} className="flex items-start gap-2 text-sm text-slate-300">
                                            <CheckCircle size={14} className="text-emerald-300 mt-0.5 shrink-0" />
                                            <span>{claim}</span>
                                        </li>
                                    ))}
                                </ul>
                                <MedicalDisclaimer type="research" compact className="text-[11px] mt-4" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* === GOALS / IS THIS FOR YOU === */}
            {data.goals && data.goals.length > 0 && (
                <section
                    id="goals"
                    data-testid="product-detail-goals-surface"
                    className="bg-slate-950 py-16 text-white"
                >
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-10">
                            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Designed For</span>
                            <h2 className="text-3xl font-bold text-white">Is This Right For You?</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {data.goals.map((goal) => {
                                const goalMeta: Record<string, { icon: React.ReactNode; desc: string }> = {
                                    Rest: { icon: <Moon size={28} />, desc: 'Sleep routine planning' },
                                    Focus: { icon: <Brain size={28} />, desc: 'Focus routine context' },
                                    Repair: { icon: <Zap size={28} />, desc: 'Recovery setup review' },
                                    Life: { icon: <Sparkles size={28} />, desc: 'Daily wellness planning' },
                                };
                                const meta = goalMeta[goal] || { icon: <Target size={28} />, desc: '' };
                                return (
                                    <motion.div
                                        key={goal}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="cursor-default rounded-lg border border-white/10 bg-white/[0.045] p-6 text-center transition-all hover:border-cyan-300/45 hover:bg-white/[0.07]"
                                    >
                                        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg ${data.accentColor} text-white shadow-none`}>
                                            {meta.icon}
                                        </div>
                                        <h4 className="font-black text-white text-base mb-1">{goal}</h4>
                                        <p className="text-[11px] text-slate-300 leading-relaxed">{meta.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* === PERFORMANCE PROFILE === */}
            {data.comparisonScores && (
                <section
                    data-testid="product-detail-planning-profile-surface"
                    className="bg-slate-950 py-16 text-white"
                >
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-10">
                            <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Planning Profile</span>
                            <h2 className="text-3xl font-bold text-white">Where It May Fit</h2>
                        </div>
                        <div className="space-y-5 rounded-lg border border-white/10 bg-white/[0.045] p-8 shadow-none">
                            {(Object.entries(data.comparisonScores) as [string, number][]).map(([key, score]) => {
                                const labels: Record<string, string> = {
                                    recovery: 'Recovery Routine',
                                    cognitive: 'Focus Context',
                                    cellular: 'Device Fit',
                                    pain: 'Comfort Planning',
                                    longevity: 'Daily Wellness',
                                };
                                return (
                                    <div key={key} className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-slate-300 w-40 shrink-0">{labels[key] || key}</span>
                                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.10]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${score}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                                className={`h-full rounded-full ${data.accentColor}`}
                                            />
                                        </div>
                                        <span className="text-sm font-black text-white w-10 text-right">{score}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-4">Relative planning indicators for choosing a support path. Not a claim of outcome or brand comparison.</p>
                    </div>
                </section>
            )}

            {/* === SYNERGIES (Simplified Bar) === */}
            {data.synergies && data.synergies.length > 0 && (
                <section
                    id="synergies"
                    data-testid="product-detail-synergies-surface"
                    className="border-y border-white/10 bg-slate-950 py-12 text-white"
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex flex-col items-stretch justify-between gap-6 md:flex-row md:items-center">
                            <div className="flex min-w-0 items-center gap-4">
                                <Sparkles className="text-cyan-200" size={24} />
                                <div className="min-w-0">
                                    <h3 className="text-white font-bold text-lg">Pairs Well With</h3>
                                    <p className="text-slate-300 text-sm">Compare fit before combining devices</p>
                                </div>
                            </div>
                            <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:items-center sm:gap-4 md:w-auto">
                                {data.synergies.slice(0, 2).map((syn) => (
                                    <button
                                        key={syn.targetId}
                                        type="button"
                                        {...getDetailActionStatusProps(`${getTechDetails(syn.targetId).name} synergy link is ready for ${data.name}.`)}
                                        onClick={() => {
                                            announceDetailNavigation(`${getTechDetails(syn.targetId).name} synergy page`);
                                            onJumpToTech(syn.targetId);
                                        }}
                                        className="group flex w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.045] px-5 py-3 transition-all hover:border-cyan-300/45 hover:bg-white/[0.07] sm:w-auto"
                                    >
                                        <div className={`w-10 h-10 shrink-0 ${getTechDetails(syn.targetId).accentColor} rounded-lg flex items-center justify-center text-white`}>
                                            {TECH_ICONS[syn.targetId]}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <span className="text-white font-bold block">{getTechDetails(syn.targetId).name}</span>
                                            <span className="text-emerald-200 text-xs font-bold">Fit note</span>
                                        </div>
                                        <ArrowRight size={16} className="shrink-0 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-cyan-200" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* === USED IN THESE PROTOCOLS === */}
            <FeatureGate flag="feature_pdp_protocols">
                {relatedProtocolCards.length > 0 && (
                    <section
                        data-testid="product-detail-protocol-ecosystem-surface"
                        className="border-y border-white/10 bg-slate-950 py-20 text-white"
                    >
                        <div className="max-w-6xl mx-auto px-6">
                            <div className="text-center mb-12">
                                <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Protocol Ecosystem</span>
                                <h2 className="text-3xl font-bold text-white">Protocols using this device</h2>
                                <p className="text-slate-300 mt-3 max-w-lg mx-auto text-sm">
                                    This technology appears in these step-by-step protocols.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {relatedProtocolCards.map((protocolCard) => (
                                    <ProtocolCard
                                        key={protocolCard.slug}
                                        protocol={protocolCard}
                                        onOpen={(protocolSlug) => {
                                            if (onNavigate) {
                                                onNavigate(`protocols/${protocolSlug}`);
                                                return;
                                            }

                                            router.push(`/protocols/${protocolSlug}`);
                                            window.scrollTo(0, 0);
                                        }}
                                        compact
                                        variant="dark"
                                    />
                                ))}
                            </div>

                            {onNavigate && (
                                <div className="text-center mt-10">
                                    <Link
                                        href="/protocols"
                                        {...getDetailActionStatusProps(`Protocols overview link is ready for ${data.name}.`)}
                                        onClick={() => announceDetailNavigation('protocols overview')}
                                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 text-sm font-bold text-cyan-100 transition-colors hover:bg-cyan-300/15"
                                    >
                                        Explore all protocols <ArrowRight size={16} />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </FeatureGate>

            {/* === SYSTEM ENHANCEMENTS === */}
            <TechAddons
                data={data}
                selectedAddons={selectedAddons}
                onToggleAddon={toggleAddon}
            />

            {/* === PLANNING PACKAGES === */}
            <section
                id="bundles"
                data-testid="product-detail-support-packages-surface"
                className="border-y border-white/10 bg-slate-950 py-20 text-white"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Planning packages</span>
                        <h2 className="text-3xl font-bold text-white">Support packages</h2>
                        <p className="text-slate-400 mt-3 max-w-lg mx-auto text-sm">Core setup items for starting with {data.name}, with support and policy review before any commitment.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Bundle 1: Essential Start */}
                        <div className="flex flex-col rounded-lg border border-white/10 bg-white/[0.045] p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block mb-1">Core path</span>
                                    <h3 className="text-xl font-black text-white">Essential Start</h3>
                                </div>
                                <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-100">Manual quote</div>
                            </div>
                            <ul className="space-y-3 mb-6 flex-1">
                                {[`Full ${data.name} device`, '3-month protocol guide (digital)', '1-hour onboarding call with Hylono support', 'Quick-start digital library'].map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                                        <CheckCircle size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-white/10 pt-6">
                                <div className="mb-4 rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
                                    Quote, support scope, and policy details are reviewed before commitment.
                                </div>
                                <Link href={productContactHref} {...getDetailActionStatusProps(`Setup review link is ready for ${data.name}.`)} onClick={() => handleSupportExitClick(productContactHref, 'support_package', 'setup review')} className="block w-full rounded-lg bg-cyan-300 py-3 text-center text-sm font-bold text-slate-950 transition-all hover:bg-cyan-200">Request setup review</Link>
                            </div>
                        </div>
                        {/* Bundle 2: Pro Protocol */}
                        <div className="relative flex flex-col overflow-hidden rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-8">
                            <div className="absolute right-0 top-0 rounded-bl-lg border border-cyan-300/20 bg-cyan-300 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-950">Extended review</div>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Advanced</span>
                                    <h3 className="text-xl font-black text-white">Pro Protocol</h3>
                                </div>
                                <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-100">Support review</div>
                            </div>
                            <ul className="space-y-3 mb-6 flex-1">
                                {[`Full ${data.name} device and accessories`, '6-month setup support program', 'Priority support line (48h response)', 'Advanced protocol library (PDF + video)', 'Quarterly check-in calls with Hylono support'].map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                                        <CheckCircle size={14} className="text-cyan-200 mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-white/10 pt-6">
                                <div className="mb-4 rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
                                    Hylono confirms package contents, support scope, and terms before checkout.
                                </div>
                                <Link href={productContactHref} {...getDetailActionStatusProps(`Package review link is ready for ${data.name}.`)} onClick={() => handleSupportExitClick(productContactHref, 'support_package', 'package review')} className="block w-full rounded-lg bg-cyan-300 py-3 text-center text-sm font-bold text-slate-950 transition-all hover:bg-cyan-200">Request package review</Link>
                            </div>
                        </div>
                        {/* Bundle 3: Clinic Edition */}
                        <div className="flex flex-col rounded-lg border border-white/10 bg-white/[0.045] p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider block mb-1">Professional</span>
                                    <h3 className="text-xl font-black text-white">Clinic Edition</h3>
                                </div>
                                <div className="rounded-lg border border-purple-300/20 bg-purple-300/10 px-3 py-1.5 text-xs font-black text-purple-100">Manual terms</div>
                            </div>
                            <ul className="space-y-3 mb-6 flex-1">
                                {[`Full ${data.name} device for professional setup`, 'Staff setup training scope', 'Professional setup consultation', 'Support retainer scope review', 'Client education and protocol handoff templates', 'Technical support response path review'].map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                                        <CheckCircle size={14} className="text-purple-200 mt-0.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-white/10 pt-6">
                                <div className="mb-4 rounded-lg border border-white/10 bg-slate-950/45 p-3 text-sm leading-6 text-slate-300">
                                    Professional terms are confirmed through a manual Hylono review.
                                </div>
                                <Link href={`${productContactHref}&intent=b2b`} {...getDetailActionStatusProps(`Professional review link is ready for ${data.name}.`)} onClick={() => handleSupportExitClick(`${productContactHref}&intent=b2b`, 'support_package', 'professional review')} className="block w-full rounded-lg bg-purple-300 py-3 text-center text-sm font-bold text-slate-950 transition-all hover:bg-purple-200">Request professional review</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {(pdpAdvisorCtaEnabled || (pdpTradeInEnabled && Boolean(contentCommerceProductId))) && (
                <section
                    data-testid="product-detail-advisor-tradein-surface"
                    className="border-y border-white/10 bg-slate-950 py-12 text-white"
                >
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {pdpAdvisorCtaEnabled && (
                                <div className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-5">
                                    <h3 className="text-lg font-bold text-white">{batch3PdpContent.advisorCta.title}</h3>
                                    <p className="mt-1 text-sm text-slate-300">
                                        Get a modality recommendation based on your goals, timing, and space constraints.
                                    </p>
                                    <Link
                                        href={`/${batch3PdpContent.advisorCta.path}?tech=${techSlug}`}
                                        {...getDetailActionStatusProps(`${batch3PdpContent.advisorCta.linkLabel} link is ready for ${data.name}.`)}
                                        onClick={() => handleSupportExitClick(`/${batch3PdpContent.advisorCta.path}?tech=${techSlug}`, 'advisor_cta', batch3PdpContent.advisorCta.linkLabel)}
                                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-100 hover:text-cyan-50"
                                    >
                                        {batch3PdpContent.advisorCta.linkLabel}
                                    </Link>
                                </div>
                            )}

                            {pdpTradeInEnabled && contentCommerceProductId && (
                                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                                    <h3 className="text-lg font-bold text-white">{batch3PdpContent.tradeInCta.text}</h3>
                                    <p className="mt-1 text-sm text-slate-300">
                                        Typical rental commitment starts at {rentalCommitmentMonths} month{rentalCommitmentMonths > 1 ? 's' : ''}. Upgrade later and apply eligible value from your previous device.
                                    </p>
                                    <Link
                                        href={`/${batch3PdpContent.tradeInCta.path}?product=${contentCommerceProductId}`}
                                        {...getDetailActionStatusProps(`${batch3PdpContent.tradeInCta.linkLabel} link is ready for ${data.name}.`)}
                                        onClick={() => handleSupportExitClick(`/${batch3PdpContent.tradeInCta.path}?product=${contentCommerceProductId}`, 'trade_in_cta', batch3PdpContent.tradeInCta.linkLabel)}
                                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-100 hover:text-cyan-50"
                                    >
                                        {batch3PdpContent.tradeInCta.linkLabel}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}


            {/* === CUSTOMER REVIEWS === */}
            <section
                id="reviews"
                data-testid="product-detail-reviews-surface"
                className="border-y border-white/10 bg-slate-950 text-white"
            >
                <div className="max-w-4xl mx-auto px-6">
                    <ReviewsSection
                productName={data.name}
                minReviewCount={batch3PdpContent.socialProof.minReviewCount}
                belowThresholdMessage={batch3PdpContent.socialProof.belowThresholdMessage}
                variant="dark"
            />
                </div>
            </section>

            <TechDetailTimelineSection
                phases={resultTimeline}
                accentColor={data.accentColor}
                themeColor={data.themeColor}
            />

            {/* === SETUP REVIEW MATERIALS === */}
            <section
                data-testid="product-detail-setup-review-surface"
                className="border-y border-white/10 bg-slate-950 py-16 text-white"
            >
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-8">
                        <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-2">Setup Review</span>
                        <h2 className="text-3xl font-bold text-white">Review the setup path before you choose</h2>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white shadow-none sm:p-8">
                        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                            <div>
                                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-lg ${data.accentColor} shadow-lg`}>
                                    <Video size={24} aria-hidden="true" />
                                </div>
                                <p className="text-xl font-bold">Demo materials are shared after fit review</p>
                                <p className="mt-3 text-sm leading-7 text-slate-300">
                                    Hylono confirms the chamber configuration, room constraints, supervision model, and support scope before sending setup media or proposal materials. That keeps the demo path tied to the option a buyer is actually reviewing.
                                </p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-slate-950/45 p-5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                                    What we review first
                                </p>
                                <ul className="mt-4 space-y-3 text-sm text-slate-200">
                                    {[
                                        'Configuration and chamber access needs',
                                        'Room, delivery, and setup constraints',
                                        'Support handoff and policy boundaries',
                                    ].map((item) => (
                                        <li key={item} className="flex gap-2">
                                            <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-300" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <Link href={productContactHref} {...getDetailActionStatusProps(`Setup review link is ready for ${data.name}.`)} onClick={() => handleSupportExitClick(productContactHref, 'setup_review', 'setup review')} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-300 px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-200">
                                        Request review
                                    </Link>
                                    <Link href="/help" {...getDetailActionStatusProps(`Support path link is ready for ${data.name}.`)} onClick={() => handleSupportExitClick('/help', 'setup_review', 'support path')} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/[0.045] px-4 text-sm font-bold text-slate-100 transition-colors hover:bg-white/[0.10]">
                                        Support path
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === PROFESSIONAL PLANNING === */}
            {data.roiModel && (
                <section
                    data-testid="product-detail-professional-planning-surface"
                    className="border-y border-white/10 bg-slate-950 py-20 text-white"
                >
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">
                                        <Building2 size={20} />
                                    </div>
                                    <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest">For Professionals</span>
                                </div>
                                <h2 className="mb-6 break-words text-3xl font-bold leading-tight text-white sm:text-4xl">Professional use<br />planning review</h2>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    Use these planning numbers to discuss fit, service model, staffing, and room setup for the {data.name} system.
                                </p>
                                <div className="space-y-3 mb-8">
                                    {['Installation and staff setup review', 'Protocol planning library included', 'B2B support path available', 'Policy and handoff materials'].map(item => (
                                        <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                                            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href={`${productContactHref}&intent=b2b`}
                                    {...getDetailActionStatusProps(`Professional review link is ready for ${data.name}.`)}
                                    onClick={() => handleSupportExitClick(`${productContactHref}&intent=b2b`, 'professional_planning', 'professional review')}
                                    className="flex items-center gap-2 rounded-lg bg-cyan-300 px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-200"
                                >
                                    Request professional review <ArrowRight size={18} />
                                </Link>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-8">
                                <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                                    <Building2 size={20} className="text-cyan-100" /> Review areas
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        ['Room and workflow fit', 'Review space, supervision, and staff handoff needs.'],
                                        ['Service model context', 'Confirm whether the system belongs in a clinic, studio, or guided private setting.'],
                                        ['Policy and support terms', 'Document support, onboarding, and maintenance boundaries before commitment.'],
                                    ].map(([label, description]) => (
                                        <div key={label} className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
                                            <span className="text-slate-300 text-xs uppercase tracking-wider block">{label}</span>
                                            <span className="mt-2 block text-sm leading-6 text-white">{description}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] text-slate-400 italic mt-4">Actual pricing, utilization, and commercial terms require operator review.</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* === SAFETY (Collapsible) === */}
            <section
                id="safety"
                data-testid="product-detail-safety-surface"
                className="border-y border-white/10 bg-slate-950 py-12 text-white"
            >
                <div className="max-w-4xl mx-auto px-6">
                    <button
                        type="button"
                        onClick={handleToggleSafety}
                        onFocus={() => announceProductDetailAction(`Safety and use boundaries are ready for ${data.name}.`)}
                        aria-expanded={showSafety}
                        aria-controls="product-detail-safety-panel"
                        aria-describedby={PDP_DETAIL_ACTION_STATUS_ID}
                        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.045] p-4 text-left transition-all hover:border-cyan-300/45 hover:bg-white/[0.07]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-2 text-emerald-200">
                                <Shield size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-white">Safety &amp; Use Boundaries</span>
                                <span className="text-xs text-slate-300">Contraindications, support guidance, and claim boundaries</span>
                            </div>
                        </div>
                        {showSafety ? <ChevronUp className="text-slate-300" /> : <ChevronDown className="text-slate-300" />}
                    </button>

                    <AnimatePresence>
                        {showSafety && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div
                                    id="product-detail-safety-panel"
                                    className="mt-4 space-y-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-none"
                                >
                                    {/* Approved Claims */}
                                    {knowledge && (
                                        <div>
                                            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                                                <CheckCircle size={14} className="text-emerald-300" /> Evidence and safety themes
                                            </h4>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {knowledge.approvedClaims.map((claim) => (
                                                    <li key={claim} className="flex items-start gap-2 text-sm text-slate-300">
                                                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                                        {claim}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Contraindications — full list */}
                                    {data.contraindications && data.contraindications.length > 0 && (
                                        <div>
                                            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                                                <AlertTriangle size={14} className="text-amber-300" /> Contraindications &amp; Safety
                                            </h4>
                                            {pdpContraindicationsEnabled ? (
                                                <div className="space-y-2">
                                                    {data.contraindications.map((ci) => {
                                                        const statusBlock =
                                                            ci.status === 'safe'
                                                                ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
                                                                : ci.status === 'caution'
                                                                    ? 'border-amber-300/25 bg-amber-300/10 text-amber-100'
                                                                    : 'border-red-300/25 bg-red-300/10 text-red-100';
                                                        const statusBadge =
                                                            ci.status === 'safe'
                                                                ? 'border border-emerald-300/30 bg-emerald-300/15 text-emerald-100'
                                                                : ci.status === 'caution'
                                                                    ? 'border border-amber-300/30 bg-amber-300/15 text-amber-100'
                                                                    : 'border border-red-300/30 bg-red-300/15 text-red-100';

                                                        const isExpanded = expandedContraindication === ci.condition;

                                                        return (
                                                            <div key={ci.condition} className={`rounded-lg border ${statusBlock}`}>
                                                                <button
                                                                    type="button"
                                                                    onFocus={() => announceProductDetailAction(`${ci.condition} safety detail is ready.`)}
                                                                    onClick={() => handleToggleContraindication(ci.condition)}
                                                                    className="w-full flex items-center justify-between gap-3 p-3 text-left"
                                                                    aria-expanded={isExpanded}
                                                                    aria-describedby={PDP_DETAIL_ACTION_STATUS_ID}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${statusBadge}`}>
                                                                            {ci.status}
                                                                        </span>
                                                                        <span className="font-bold text-xs">{ci.condition}</span>
                                                                    </div>
                                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                </button>
                                                                {isExpanded && (
                                                                    <p className="px-3 pb-3 text-xs opacity-90 leading-relaxed">{ci.reason}</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                    {data.contraindications.map((ci) => (
                                                        <div key={ci.condition} className={`rounded-lg border p-3 text-xs ${ci.status === 'safe' ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' : ci.status === 'caution' ? 'border-amber-300/25 bg-amber-300/10 text-amber-100' : 'border-red-300/25 bg-red-300/10 text-red-100'}`}>
                                                            <div className="mb-0.5 flex items-center gap-2">
                                                                <span className={`rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${ci.status === 'safe' ? 'border-emerald-300/30 bg-emerald-300/15 text-emerald-100' : ci.status === 'caution' ? 'border-amber-300/30 bg-amber-300/15 text-amber-100' : 'border-red-300/30 bg-red-300/15 text-red-100'}`}>{ci.status}</span>
                                                                <span className="font-bold">{ci.condition}</span>
                                                            </div>
                                                            <span className="opacity-80">{ci.reason}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Drug Interactions */}
                                    {data.drugInteractions && data.drugInteractions.length > 0 && (
                                        <div>
                                            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                                                <Pill size={14} className="text-cyan-200" /> Drug Interactions
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {data.drugInteractions.map((di) => (
                                                    <div key={di.drugName} className={`rounded-lg border p-3 text-xs ${di.status === 'safe' ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' : di.status === 'caution' ? 'border-amber-300/25 bg-amber-300/10 text-amber-100' : 'border-red-300/25 bg-red-300/10 text-red-100'}`}>
                                                        <div className="mb-0.5 flex items-center gap-2">
                                                            <span className={`rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${di.status === 'safe' ? 'border-emerald-300/30 bg-emerald-300/15 text-emerald-100' : di.status === 'caution' ? 'border-amber-300/30 bg-amber-300/15 text-amber-100' : 'border-red-300/30 bg-red-300/15 text-red-100'}`}>{di.status}</span>
                                                            <span className="font-bold">{di.drugName}</span>
                                                        </div>
                                                        <span className="opacity-80">{di.reason}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Disclaimer */}
                                    <MedicalDisclaimer
                                        compact
                                        customText={knowledge?.disclaimers[0] ?? disclaimers.pdp}
                                        className="text-[10px]"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {pdpDocumentsEnabled && productDocuments.length > 0 && (
                <section
                    data-testid="product-detail-document-resources"
                    className="border-y border-white/10 bg-slate-950 py-12 text-white"
                >
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <span className="text-[10px] text-cyan-200 font-bold uppercase tracking-widest block mb-1">Resources</span>
                                <h2 className="text-2xl font-bold text-white">Planning and policy resources</h2>
                            </div>
                            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/35 bg-cyan-300/10 text-cyan-100">
                                <BookOpen size={20} />
                            </span>
                        </div>

                        <div className="space-y-3">
                            {productDocuments.map((document) => (
                                <a
                                    key={document.href}
                                    href={document.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    {...getDetailActionStatusProps(`${document.title} resource is ready for ${data.name}.`)}
                                    onClick={() => handleResourceClick(document.type, document.href)}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-white">{document.title}</p>
                                        <p className="text-xs text-slate-300 mt-0.5">
                                            {document.type} · {document.size}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-100">
                                        Open <ChevronRight size={14} />
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {pdpDualTrackEnabled && pdpStickyCtaEnabled ? (
                <>
                    <AnimatePresence>
                        {!isCommercePanelInView && (
                            <motion.div
                                data-testid="product-detail-desktop-sticky-commerce"
                                key="pdp-desktop-sticky"
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="hidden md:block fixed top-0 left-0 right-0 z-[70] border-b border-white/10 bg-slate-950/95 text-white shadow-none backdrop-blur-xl"
                            >
                                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-white truncate">{data.name}</p>
                                        <p className="text-xs text-slate-300">{stickyDesktopPrice}</p>
                                    </div>

                                    <div className="inline-flex rounded-lg border border-white/10 bg-slate-950/55 p-1">
                                        <button
                                            type="button"
                                             onClick={() => handleTrackSelect('purchase', 'desktop_sticky')}
                                            className={`min-h-11 rounded-lg px-4 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${activeTrack === 'purchase' ? 'bg-cyan-300 text-slate-950 shadow-none' : 'text-slate-300 hover:text-white'}`}
                                            aria-pressed={activeTrack === 'purchase'}
                                            aria-describedby={PDP_TRACK_STATUS_ID}
                                        >
                                            {pdpCommerceContent.trackLabels.buy}
                                        </button>
                                        <button
                                            type="button"
                                             onClick={() => handleTrackSelect('rental', 'desktop_sticky')}
                                            className={`min-h-11 rounded-lg px-4 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${activeTrack === 'rental' ? 'bg-cyan-300 text-slate-950 shadow-none' : 'text-slate-300 hover:text-white'}`}
                                            aria-pressed={activeTrack === 'rental'}
                                            aria-describedby={PDP_TRACK_STATUS_ID}
                                        >
                                            {pdpCommerceContent.trackLabels.rent}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handlePrimaryTrackAction}
                                        aria-describedby={primaryTrackActionDescribedBy}
                                        className="min-h-11 rounded-lg bg-cyan-300 px-6 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-950 transition-colors hover:bg-cyan-200"
                                    >
                                        {activeTrackCtaLabel}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {!isCommercePanelInView && (
                            <motion.div
                                data-testid="product-detail-mobile-sticky-commerce"
                                key="pdp-mobile-sticky"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 16 }}
                                className="md:hidden fixed left-3 right-3 bottom-[calc(var(--hylono-cookie-banner-offset,0px)+6rem)] z-[70] rounded-lg border border-white/10 bg-slate-950/95 p-3 text-white shadow-none backdrop-blur-xl"
                            >
                                <div className="flex items-center justify-between gap-3 mb-3">
                                    <span className="text-sm font-bold text-white truncate">{stickyMobilePrice}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={handlePrimaryTrackAction}
                                        aria-describedby={primaryTrackActionDescribedBy}
                                        className="min-h-11 rounded-lg bg-cyan-300 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-950"
                                    >
                                        {mobilePrimaryLabel}
                                    </button>
                                    <button
                                        type="button"
                                         onClick={() => {
                                             captureProductDetailAction('mobile_track_drawer_opened', 'mobile_sticky');
                                             setShowMobileTrackDrawer(true);
                                         }}
                                        className="min-h-11 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] text-slate-300"
                                        aria-describedby={PDP_TRACK_STATUS_ID}
                                    >
                                        {`or ${alternativeTrackLabel} ▾`}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showMobileTrackDrawer && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-slate-900/50 z-[80] md:hidden"
                                    onClick={() => setShowMobileTrackDrawer(false)}
                                />
                                 <motion.div
                                    data-testid="product-detail-mobile-track-drawer"
                                     role="dialog"
                                     aria-modal="true"
                                     aria-labelledby="mobile-track-drawer-title"
                                     aria-describedby={PDP_TRACK_STATUS_ID}
                                     initial={{ y: '100%' }}
                                     animate={{ y: 0 }}
                                     exit={{ y: '100%' }}
                                     transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                                     className="fixed inset-x-0 bottom-0 z-[81] md:hidden rounded-t-lg border-t border-white/10 bg-slate-950 p-6 text-white shadow-none"
                                 >
                                     <div className="flex items-center justify-between gap-4 mb-3">
                                         <h3 id="mobile-track-drawer-title" className="text-base font-bold text-white">{pdpCommerceContent.switchTrack.titlePrefix} {alternativeTrack === 'purchase' ? pdpCommerceContent.trackLabels.buy : pdpCommerceContent.trackLabels.rent}</h3>
                                         <button
                                             type="button"
                                             onClick={() => setShowMobileTrackDrawer(false)}
                                             className="rounded-lg border border-white/10 bg-white/[0.045] p-2 hover:bg-white/[0.07]"
                                             aria-label={pdpCommerceContent.switchTrack.drawerCloseAriaLabel}
                                             aria-describedby={PDP_TRACK_STATUS_ID}
                                         >
                                             <X size={16} className="text-slate-300" />
                                         </button>
                                     </div>

                                     <p className="text-sm text-slate-300 mb-4">
                                         {alternativeTrack === 'purchase'
                                             ? `${purchasePriceLabel} ${pdpCommerceContent.switchTrack.oneTimePurchaseSuffix}`
                                             : `${rentalPriceLabel ?? pdpCommerceContent.pricing.rentalUnavailable} · ${pdpCommerceContent.switchTrack.minimumPrefix} ${rentalMinimumPeriod}`}
                                     </p>

                                     <button
                                         type="button"
                                         onClick={() => handleSwitchTrack(alternativeTrack)}
                                         className="w-full min-h-11 rounded-lg bg-cyan-300 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-950"
                                         aria-describedby={PDP_TRACK_STATUS_ID}
                                     >
                                         {pdpCommerceContent.switchTrack.switchToPrefix} {alternativeTrack === 'purchase' ? pdpCommerceContent.trackLabels.buy : pdpCommerceContent.trackLabels.rent}
                                     </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            ) : (
                <div
                    data-testid="product-detail-fallback-sticky-commerce"
                    className="fixed bottom-[var(--hylono-cookie-banner-offset,0px)] left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 px-6 py-4 text-white shadow-none backdrop-blur-xl"
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="hidden md:flex items-center gap-4">
                            <span className="text-2xl font-bold text-white">{data.name}</span>
                            <span className="text-xl text-white/20">|</span>
                            <span className="text-2xl font-bold text-white">{purchasePriceLabel}</span>
                            {financingHint && (
                                <span className="text-sm text-cyan-200 font-bold">{financingHint}</span>
                            )}
                        </div>
                        <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:items-end">
                            <button
                                type="button"
                                onClick={addCurrentTechToCart}
                                aria-describedby={PDP_CART_STATUS_ID}
                                className="flex flex-1 items-center justify-center gap-3 rounded-lg bg-cyan-300 px-8 py-4 text-sm font-bold text-slate-950 shadow-none transition-all hover:bg-cyan-200 md:flex-none"
                            >
                                Add to Cart <ArrowRight size={18} />
                            </button>
                            <p
                                id={PDP_CART_STATUS_ID}
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                aria-label={PDP_CART_STATUS_LABEL}
                                className={`min-h-5 text-sm font-semibold text-emerald-300 transition-opacity ${
                                    cartStatusMessage ? 'opacity-100' : 'opacity-0'
                                }`}
                            >
                                {cartStatusMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {pdpDualTrackEnabled && pdpFinancingDrawerEnabled && (
                <AnimatePresence>
                    {showFinancing && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-slate-900/50 z-[90]"
                                onClick={handleCloseFinancingDrawer}
                            />
                            <motion.aside
                                data-testid="product-detail-financing-drawer"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="financing-drawer-title"
                                aria-describedby={PDP_DETAIL_ACTION_STATUS_ID}
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                                className="fixed right-0 top-0 z-[91] h-full w-full max-w-md border-l border-white/10 bg-slate-950 text-white shadow-none"
                            >
                                <div className="h-full overflow-y-auto p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 id="financing-drawer-title" className="text-xl font-bold text-white">{pdpCommerceContent.pricing.financingTitle}</h3>
                                        <button
                                            type="button"
                                            onFocus={() => announceProductDetailAction(`Close financing options is ready for ${data.name}.`)}
                                            onClick={handleCloseFinancingDrawer}
                                            className="rounded-lg border border-white/10 bg-white/[0.045] p-2 hover:bg-white/[0.07]"
                                            aria-label={pdpCommerceContent.switchTrack.closeFinancingAriaLabel}
                                            aria-describedby={PDP_DETAIL_ACTION_STATUS_ID}
                                        >
                                            <X size={18} className="text-slate-300" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {availableInstallmentOptions.map((option) => {
                                            const selected = loanTerm === option.months;
                                            const baseLabel = `${option.months} payments × ${formatPrice(option.monthlyAmount)}`;
                                            const withRate = option.interestRate === 0 ? `${baseLabel} (0%)` : `${baseLabel} (${option.interestRate.toFixed(1)}%)`;

                                            return (
                                                <button
                                                    key={option.months}
                                                    type="button"
                                                    onFocus={() => announceProductDetailAction(`${option.months} month financing term is ready for ${data.name}.`)}
                                                    onClick={() => handleFinancingTermSelect(option.months)}
                                                    className={`w-full min-h-11 rounded-lg border px-4 py-3 text-left transition-colors ${selected ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/10 bg-white/[0.045] hover:border-cyan-300/45 hover:bg-white/[0.07]'}`}
                                                    aria-describedby={PDP_DETAIL_ACTION_STATUS_ID}
                                                >
                                                    <span className="text-sm font-semibold text-white">{withRate}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {activeInstallment && (
                                        <p className="mt-4 text-sm text-slate-300">
                                            Estimated monthly amount: <span className="font-semibold text-white">{formatPrice(activeInstallment.monthlyAmount)}</span>
                                        </p>
                                    )}

                                    <p className="mt-3 text-sm text-slate-300">{pdpCommerceContent.pricing.noHiddenFees}</p>

                                    <button
                                        type="button"
                                        onFocus={() => announceProductDetailAction(`More about financing is ready for ${data.name}.`)}
                                        onClick={handleFinancingLearnMore}
                                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                                        aria-describedby={PDP_DETAIL_ACTION_STATUS_ID}
                                    >
                                        {pdpCommerceContent.pricing.financingCta} <ArrowRight size={14} />
                                    </button>

                                    <hr className="my-6 border-white/10" />

                                    <p className="text-sm text-slate-300">
                                        {pdpCommerceContent.pricing.orRentPrefix} {rentalPriceLabel ? `from ${rentalPriceLabel}` : 'available plans on request'}
                                    </p>
                                    <button
                                        type="button"
                                        onFocus={() => announceProductDetailAction(`Compare buy and rent is ready for ${data.name}.`)}
                                        onClick={handleFinancingCompareRental}
                                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-cyan-100"
                                        aria-describedby={PDP_DETAIL_ACTION_STATUS_ID}
                                    >
                                        {pdpCommerceContent.pricing.compareBuyRent} <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            )}

            {/* Bottom padding for sticky elements */}
            <div className={pdpDualTrackEnabled && pdpStickyCtaEnabled ? 'h-28 md:h-8' : 'h-24'}></div>
        </div>
    );
};
