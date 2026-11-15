'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { priceBookText } from '@/lib/money';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  ExternalLink,
  FlaskConical,
  Phone,
  Package,
  Shield,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { batch3DocumentsByTech, batch3PdpContent } from '@/content/batch3';
import { disclaimers } from '@/content/disclaimers';
import { productById } from '@/content/products';
import { protocols } from '@/content/protocols';
import { toProtocolCardView } from '@/content/protocolView';
import { getProductTopicalLinks } from '@/content/topical-graph';
import { TECH_DETAILS } from '@/constants';
import { RESEARCH_STUDIES } from '@/constants/content';
import { useCart } from '@/components/Cart';
import { resolveTechHeroConfig } from '@/components/product/detail/TechHero';
import { HbotChamberMediaFallback } from '@/components/product/detail/HbotChamberMediaFallback';
import { TechDetailTimelineSection } from '@/components/product/detail/TechDetailTimelineSection';
import { RESULT_TIMELINES } from '@/components/product/detail/resultTimelines';
import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { MedicalDisclaimer } from '@/components/shared/MedicalDisclaimer';
import { pdpCommerceContent } from '@/content/pdpCommerce';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useTech } from '@/hooks/useTech';
import { navigateToPage } from '@/src/lib/navigation';
import { ChamberProduct, TechType, ViewMode } from '@/types';
import { ALL_CHAMBERS, getChamberBySlug } from '@/constants/chambers';
import analytics from '@/src/lib/analytics';
import {
  buildProductDetailActionPayload,
  type ProductDetailAction,
  PRODUCT_DETAIL_ACTION_EVENT,
} from '@/src/lib/product-detail-analytics';
import {
  Hbot2EvidenceSection,
  Hbot2HowToUseSection,
  Hbot2ProtocolEcosystemSection,
  Hbot2AddonsSection,
  Hbot2TrustSection,
  Hbot2SupportOperationsSection,
  Hbot2SafetyResourcesSection,
  Hbot2FinancingDrawer,
  Hbot2BrowseNavSection,
  Hbot2SpecificationsSection,
  Hbot2NarrativeSection,
  Hbot2CompareModal,
} from './sections';

const HBOT_DEFAULT_CHAMBER_SLUG = 'oxylife-i-90';
const HBOT2_CHAMBER_ACTION_STATUS_ID = 'hbot2-chamber-action-status';
const HBOT2_CHAMBER_ACTION_STATUS_LABEL = 'HBOT2 chamber action status';
const HBOT2_ADDON_ACTION_STATUS_ID = 'hbot2-addon-action-status';
const HBOT2_ADDON_ACTION_STATUS_LABEL = 'HBOT2 addon action status';
const HBOT2_FINANCING_ACTION_STATUS_ID = 'hbot2-financing-action-status';
const HBOT2_FINANCING_ACTION_STATUS_LABEL = 'HBOT2 financing action status';
const HBOT2_OFFER_ACTION_STATUS_ID = 'hbot2-offer-action-status';
const HBOT2_OFFER_ACTION_STATUS_LABEL = 'HBOT2 offer action status';
const HBOT2_PAGE_ACTION_STATUS_ID = 'hbot2-page-action-status';
const HBOT2_PAGE_ACTION_STATUS_LABEL = 'HBOT2 page action status';
const FALLBACK_INSTALLMENT_MONTHS = [12, 24, 36, 48] as const;
const focusRing =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const COMPARISON_ROWS: Array<{
  label: string;
  extractor: (chamber: ChamberProduct) => string;
}> = [
  {
    label: 'Type',
    extractor: (chamber) => chamber.type.charAt(0).toUpperCase() + chamber.type.slice(1),
  },
  {
    label: 'Brand',
    extractor: (chamber) => chamber.brandLabel,
  },
  {
    label: 'Variant',
    extractor: (chamber) => chamber.variantLabel,
  },
  {
    label: 'Max Pressure',
    extractor: (chamber) =>
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('pressure'))
        ?.value ?? '—',
  },
  {
    label: 'Diameter / Size',
    extractor: (chamber) =>
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('diameter'))
        ?.value ??
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('dimension'))
        ?.value ??
      '—',
  },
  {
    label: 'Weight',
    extractor: (chamber) =>
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('weight'))
        ?.value ?? '—',
  },
  {
    label: 'Control',
    extractor: (chamber) =>
      chamber.specifications.find((spec) => spec.label.toLowerCase().includes('control'))
        ?.value ?? '—',
  },
  {
    label: 'Purchase',
    extractor: (chamber) =>
      // Was `EUR ${...toLocaleString('de-DE')}` — which renders a 24900 chamber as
      // "EUR 24.900". A reader who takes the period as a decimal separator reads
      // that as twenty-four euros ninety, and the SAME page's price label already
      // rendered "€24,900" through a local euro formatter. Both are now the price
      // book currency, via lib/money.ts.
      chamber.pricing.buy ? formatPrice(chamber.pricing.buy) : 'Contact us',
  },
  {
    label: 'Monthly Rental',
    extractor: (chamber) =>
      chamber.pricing.rent?.monthly
        ? `${formatPrice(chamber.pricing.rent.monthly)}/mo`
        : chamber.transactionModes.includes('rent')
          ? 'Contact us'
          : 'N/A',
  },
];

// Was a local Intl formatter hardcoded to EUR at en-IE, used for every price on
// this page while the price book is denominated in PLN — publishing a five-figure
// zloty figure as a five-figure euro one. Delegates to the single money source so
// this page cannot disagree with the checkout that charges the customer.
const formatPrice = (value: number): string => priceBookText(value);

const parseNumericAmount = (value: string | undefined): number => {
  if (!value) return 0;
  const normalized = Number(value.replace(/[^0-9]/g, ''));
  return Number.isFinite(normalized) ? normalized : 0;
};

const parsePeriodToMonths = (period: string): number => {
  const match = period.match(/(\d+)/);
  if (!match) return 1;
  const numeric = Number(match[1]);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
};

const getCompareGuidance = (compareCount: number): string => {
  if (compareCount === 0) return 'Add two chambers to enable comparison.';
  if (compareCount === 1) return 'Add one more chamber to enable comparison.';
  return 'Comparison is ready.';
};

const getChamberActionFallback = (activeChamberName: string, compareCount: number): string =>
  `${activeChamberName} is the active HBOT chamber. ${compareCount} of 3 chambers selected for comparison; ${getCompareGuidance(compareCount)}`;

const getAddonActionFallback = (selectedAddonCount: number): string => {
  if (selectedAddonCount === 0) return 'No HBOT2 add-ons selected for setup review.';
  if (selectedAddonCount === 1) return '1 HBOT2 add-on selected for setup review.';
  return `${selectedAddonCount} HBOT2 add-ons selected for setup review.`;
};

const getFinancingActionStatus = (months: number, monthlyAmount: number): string =>
  `${months} payment financing selected at ${formatPrice(monthlyAmount)} per month.`;

const getOfferTrackActionStatus = (track: PurchaseTrack): string =>
  track === 'purchase'
    ? 'Purchase track selected. The offer panel shows purchase price, financing context, and add-to-cart action.'
    : 'Rental track selected. The offer panel shows monthly rental terms and rental request action.';

const getRentalPlanActionStatus = (period: string, monthlyPrice: number): string =>
  `${period} rental plan selected at ${formatPrice(monthlyPrice)} per month.`;

function renderRichTextSegments(text: string, keyPrefix: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, partIndex) =>
    partIndex % 2 === 1 ? <strong key={`${keyPrefix}-${partIndex}`}>{part}</strong> : part
  );
}

function renderChamberDescription(text: string) {
  const lines = text.split('\n');
  const blocks: Array<{ type: 'paragraph'; text: string } | { type: 'list'; items: string[] }> =
    [];
  let bulletBuffer: string[] = [];

  const flushBulletBuffer = () => {
    if (bulletBuffer.length === 0) return;
    blocks.push({ type: 'list', items: bulletBuffer });
    bulletBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushBulletBuffer();
      continue;
    }

    if (trimmed.startsWith('- ')) {
      bulletBuffer.push(trimmed.slice(2));
      continue;
    }

    flushBulletBuffer();
    blocks.push({ type: 'paragraph', text: trimmed });
  }

  flushBulletBuffer();

  return blocks.map((block, index) => {
    if (block.type === 'list') {
      return (
        <ul key={`list-${index}`} className="space-y-2">
          {block.items.map((item, itemIndex) => (
            <li key={`item-${index}-${itemIndex}`} className="flex gap-2 text-sm leading-7 text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
              <span>{renderRichTextSegments(item, `item-${index}-${itemIndex}`)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`line-${index}`} className="text-sm leading-7 text-slate-300">
        {renderRichTextSegments(block.text, `line-${index}`)}
      </p>
    );
  });
}

type PurchaseTrack = 'purchase' | 'rental';

function makeProtocolHref(slug: string) {
  return `/protocols/${slug}`;
}

export function Hbot2ProductDetail() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { getTechDetails, getTechKnowledge } = useTech();
  const data = getTechDetails(TechType.HBOT);
  const knowledge = getTechKnowledge(TechType.HBOT);
  const heroConfig = resolveTechHeroConfig(data);
  const { addItem } = useCart();
  const product = productById.hbot_st1700 ?? productById['hbot-st1700'];

  const pdpDocumentsEnabled = useFeatureFlag('feature_pdp_documents');
  const pdpProtocolsEnabled = useFeatureFlag('feature_pdp_protocols');
  const pdpFinancingDrawerEnabled = useFeatureFlag('feature_pdp_financing_drawer');
  const pdpDualTrackEnabled = useFeatureFlag('feature_pdp_dual_track');

  const [mode, setMode] = useState<ViewMode>(ViewMode.STANDARD);
  const [activeTrack, setActiveTrack] = useState<PurchaseTrack>(
    searchParams.get('mode')?.toLowerCase() === 'rental' ? 'rental' : 'purchase'
  );
  const [selectedRentalPeriod, setSelectedRentalPeriod] = useState('');
  const [selectedHbotChamberSlug, setSelectedHbotChamberSlug] = useState(
    HBOT_DEFAULT_CHAMBER_SLUG
  );
  const [compareChamberIds, setCompareChamberIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showFinancing, setShowFinancing] = useState(false);
  const [loanTerm, setLoanTerm] = useState(24);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showFaqId, setShowFaqId] = useState<number | null>(null);
  const [showSafety, setShowSafety] = useState(false);
  const [expandedContraindication, setExpandedContraindication] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isOfferPanelInView, setIsOfferPanelInView] = useState(true);
  const [chamberActionStatus, setChamberActionStatus] = useState('');
  const [addonActionStatus, setAddonActionStatus] = useState('');
  const [financingActionStatus, setFinancingActionStatus] = useState('');
  const [offerActionStatus, setOfferActionStatus] = useState('');
  const [pageActionStatus, setPageActionStatus] = useState('');

  const offerPanelRef = useRef<HTMLDivElement | null>(null);

  const purchasePriceValue = product?.purchasePrice ?? 0;
  const purchasePriceLabel = product ? formatPrice(purchasePriceValue) : 'Request / verify';
  const rentalPlans = product?.rentalPlans ?? [];
  const installmentOptions = product?.installmentOptions ?? [];
  const financingHint =
    product?.financingEligible && product.financingMonthlyFrom
      ? `or from ${formatPrice(product.financingMonthlyFrom)}/mo`
      : data.financing
        ? `or ${data.financing}`
        : null;
  const productDocuments = batch3DocumentsByTech[TechType.HBOT] ?? [];
  const relatedStudy =
    RESEARCH_STUDIES.find((study) => study.trace_id === 'HBOT-SPEC-001') ?? null;
  const guidanceUpdatedLabel = data.lastReviewed
    ? new Date(data.lastReviewed).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const relatedProtocolCards = useMemo(() => {
    return protocols
      .map((protocol) => toProtocolCardView(protocol.slug))
      .filter((card): card is NonNullable<typeof card> => Boolean(card))
      .filter((card) => card.modalities.includes('HBOT'));
  }, []);

  const routeClusterLinks = useMemo(() => {
    return getProductTopicalLinks(
      'hbot',
      relatedProtocolCards.slice(0, 2).map((protocolCard) => protocolCard.slug)
    );
  }, [relatedProtocolCards]);

  const selectedHbotChamber = useMemo(() => {
    return (
      getChamberBySlug(selectedHbotChamberSlug) ??
      getChamberBySlug(HBOT_DEFAULT_CHAMBER_SLUG) ??
      ALL_CHAMBERS[0] ??
      null
    );
  }, [selectedHbotChamberSlug]);

  const selectedHbotHeroImage = useMemo(() => {
    if (!selectedHbotChamber) return null;
    return (
      selectedHbotChamber.images.find((image) => image.role === 'hero')?.url ??
      selectedHbotChamber.images[0]?.url ??
      null
    );
  }, [selectedHbotChamber]);

  const selectedCompareChambers = useMemo(() => {
    if (compareChamberIds.length === 0) return [];
    return ALL_CHAMBERS.filter((chamber) => compareChamberIds.includes(chamber.id));
  }, [compareChamberIds]);
  const chamberActionFallback = getChamberActionFallback(
    selectedHbotChamber?.fullName ?? 'Selected HBOT chamber',
    selectedCompareChambers.length
  );
  const chamberActionStatusMessage = chamberActionStatus || chamberActionFallback;
  const addonActionFallback = getAddonActionFallback(selectedAddons.length);
  const addonActionStatusMessage = addonActionStatus || addonActionFallback;

  const selectedRentalPlan = useMemo(() => {
    if (rentalPlans.length === 0) return undefined;
    return rentalPlans.find((plan) => plan.period === selectedRentalPeriod) ?? rentalPlans[0];
  }, [rentalPlans, selectedRentalPeriod]);

  const fallbackInstallmentOptions = useMemo(() => {
    if (!purchasePriceValue) return [];

    return FALLBACK_INSTALLMENT_MONTHS.map((months) => ({
      months,
      monthlyAmount: Math.round(purchasePriceValue / months),
      interestRate: months <= 24 ? 0 : 3.9,
    }));
  }, [purchasePriceValue]);

  const availableInstallmentOptions =
    installmentOptions.length > 0 ? installmentOptions : fallbackInstallmentOptions;
  const activeInstallment =
    availableInstallmentOptions.find((option) => option.months === loanTerm) ??
    availableInstallmentOptions[0];
  const financingActionStatusMessage = activeInstallment
    ? financingActionStatus ||
      getFinancingActionStatus(activeInstallment.months, activeInstallment.monthlyAmount)
    : financingActionStatus;
  const offerActionStatusMessage = offerActionStatus || getOfferTrackActionStatus(activeTrack);
  const pageActionStatusMessage =
    pageActionStatus || 'HBOT2 page links and disclosure controls are ready.';

  const rentalBaselineMonthly = rentalPlans[0]?.monthlyPrice ?? 0;
  const activeRentalMonthly = selectedRentalPlan?.monthlyPrice ?? rentalBaselineMonthly;
  const rentalPriceLabel = activeRentalMonthly > 0 ? `${formatPrice(activeRentalMonthly)}/mo` : null;
  const rentalDepositLabel = selectedRentalPlan?.deposit
    ? formatPrice(selectedRentalPlan.deposit)
    : null;
  const rentalMinimumPeriod = selectedRentalPlan?.minPeriod ?? data.rentalTerms ?? '1 month';
  const anxietyBufferItems =
    activeTrack === 'purchase'
      ? pdpCommerceContent.anxietyBuffers.purchase
      : pdpCommerceContent.anxietyBuffers.rental;

  const resultTimeline = RESULT_TIMELINES[TechType.HBOT];
  const productRentalHref = '/rental?device=hbot';
  const productContactHref = '/contact?tech=hbot';
  const stickyLabel =
    activeTrack === 'purchase'
      ? pdpCommerceContent.cta.stickyAddToCart
      : pdpCommerceContent.cta.stickyTryIt;

  const calculateRentalSavings = (monthlyPrice: number, period: string): number => {
    if (!rentalBaselineMonthly || rentalBaselineMonthly <= monthlyPrice) return 0;
    const months = parsePeriodToMonths(period);
    return Math.max(0, (rentalBaselineMonthly - monthlyPrice) * months);
  };

  const toAnonymousChamberSlug = (chamberIdOrSlug: string): string => {
    const chamberIndex = ALL_CHAMBERS.findIndex(
      (chamber) => chamber.id === chamberIdOrSlug || chamber.slug === chamberIdOrSlug
    );

    return `hbot_chamber_${chamberIndex >= 0 ? chamberIndex + 1 : 0}`;
  };

  const captureProductDetailAction = ({
    action,
    activeTrackOverride,
    chamberSlug,
    compareCount,
    destinationPath,
    isSelected,
    loanTermMonths,
    selectedTrack,
    source,
  }: {
    action: ProductDetailAction;
    activeTrackOverride?: PurchaseTrack;
    chamberSlug?: string;
    compareCount?: number;
    destinationPath?: string;
    isSelected?: boolean;
    loanTermMonths?: number;
    selectedTrack?: PurchaseTrack;
    source: string;
  }) => {
    analytics.capture(
      PRODUCT_DETAIL_ACTION_EVENT,
      buildProductDetailActionPayload({
        action,
        activeTrack: activeTrackOverride ?? activeTrack,
        canonicalProductSlug: 'hbot',
        chamberSlug,
        compareCount,
        destinationPath,
        isSelected,
        loanTermMonths,
        productSlug: 'hbot2',
        routeVariant: 'clone_route',
        selectedTrack,
        source,
        techId: 'hbot',
      })
    );
  };

  const syncPathQuery = (mutator: (params: URLSearchParams) => void) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    mutator(nextParams);
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleSelectChamber = (slug: string) => {
    const nextChamber = getChamberBySlug(slug);
    setChamberActionStatus(
      `${nextChamber?.fullName ?? 'Selected HBOT chamber'} is now active. ${selectedCompareChambers.length} of 3 chambers selected for comparison; ${getCompareGuidance(selectedCompareChambers.length)}`
    );
    setSelectedHbotChamberSlug(slug);
    syncPathQuery((params) => {
      params.set('chamber', slug);
    });
  };

  const handleModeChange = (nextMode: ViewMode) => {
    setPageActionStatus(
      nextMode === ViewMode.EXPERT
        ? 'Science view selected for the HBOT2 narrative layer.'
        : 'Plain language view selected for the HBOT2 narrative layer.'
    );
    setMode(nextMode);
    syncPathQuery((params) => {
      if (nextMode === ViewMode.EXPERT) {
        params.set('view', 'science');
      } else {
        params.delete('view');
      }
    });
  };

  const handleTrackChange = (track: PurchaseTrack) => {
    captureProductDetailAction({
      action: 'track_selected',
      selectedTrack: track,
      source: 'dual_track_panel',
    });
    setOfferActionStatus(getOfferTrackActionStatus(track));
    setActiveTrack(track);
    syncPathQuery((params) => {
      if (track === 'rental') {
        params.set('mode', 'rental');
      } else {
        params.delete('mode');
      }
    });
  };

  const handlePrimaryAction = () => {
    captureProductDetailAction({
      action: 'primary_action_clicked',
      selectedTrack: activeTrack,
      source: 'offer_panel',
    });

    if (activeTrack === 'purchase') {
      // The price label already refuses to quote a number when the catalog lookup
      // misses ('Request / verify'), but `purchasePriceValue` falls back to 0, so an
      // unguarded add put a zero-price device in the cart. Mirrors the guard in
      // components/TechDetail.tsx.
      if (!product) {
        setOfferActionStatus('Product pricing requires manual review before checkout.');
        return;
      }

      setOfferActionStatus('Adding HBOT purchase option to the cart.');
      addItem({
        id: 'tech-hbot',
        name: data.name,
        price: purchasePriceValue,
        image: 'from-cyan-500 to-blue-500',
      });
      captureProductDetailAction({
        action: 'add_to_cart_clicked',
        source: 'offer_panel',
      });
      return;
    }

    setOfferActionStatus('Opening HBOT rental request from the offer panel.');
    captureProductDetailAction({
      action: 'rental_request_clicked',
      destinationPath: productRentalHref,
      source: 'offer_panel',
    });
    router.push(productRentalHref);
  };

  const handleNavigate = (page: string) => {
    navigateToPage(router, page);
  };

  const toggleCompareChamber = (chamberId: string) => {
    setCompareChamberIds((current) => {
      const chamberName =
        ALL_CHAMBERS.find((chamber) => chamber.id === chamberId)?.fullName ??
        'Selected HBOT chamber';
      if (current.includes(chamberId)) {
        const next = current.filter((id) => id !== chamberId);
        captureProductDetailAction({
          action: 'compare_chamber_toggled',
          chamberSlug: toAnonymousChamberSlug(chamberId),
          compareCount: next.length,
          isSelected: false,
          source: 'chamber_selector',
        });
        setChamberActionStatus(
          `${chamberName} removed from comparison. ${next.length} of 3 chambers selected; ${getCompareGuidance(next.length)}`
        );
        return next;
      }

      if (current.length >= 3) {
        setChamberActionStatus(
          `${chamberName} was not added. Comparison is full with 3 of 3 chambers selected; remove one before adding another.`
        );
        return current;
      }

      const next = [...current, chamberId];
      captureProductDetailAction({
        action: 'compare_chamber_toggled',
        chamberSlug: toAnonymousChamberSlug(chamberId),
        compareCount: next.length,
        isSelected: true,
        source: 'chamber_selector',
      });
      setChamberActionStatus(
        `${chamberName} added to comparison. ${next.length} of 3 chambers selected; ${getCompareGuidance(next.length)}`
      );
      return next;
    });
  };

  const removeCompareChamber = (chamberId: string) => {
    setCompareChamberIds((current) => {
      const next = current.filter((id) => id !== chamberId);
      const chamberName =
        ALL_CHAMBERS.find((chamber) => chamber.id === chamberId)?.fullName ??
        'Selected HBOT chamber';
      setChamberActionStatus(
        `${chamberName} removed from comparison. ${next.length} of 3 chambers selected; ${getCompareGuidance(next.length)}`
      );
      return next;
    });
  };

  const toggleAddon = (id: string) => {
    const addonName = data.addons?.find((addon) => addon.id === id)?.name ?? 'Selected HBOT2 add-on';
    setSelectedAddons((current) => {
      const isSelected = current.includes(id);
      const next = isSelected ? current.filter((addonId) => addonId !== id) : [...current, id];
      setAddonActionStatus(
        `${addonName} ${
          isSelected ? 'removed from setup review' : 'selected for setup review'
        }. ${getAddonActionFallback(next.length)}`
      );
      return next;
    });
  };

  const handleOpenFinancing = () => {
    if (!pdpFinancingDrawerEnabled) {
      setOfferActionStatus('Financing options are not available in this local offer panel state.');
      return;
    }

    setOfferActionStatus('Opening financing options from the offer panel.');
    captureProductDetailAction({
      action: 'financing_drawer_opened',
      source: 'offer_panel',
    });
    if (activeInstallment) {
      setFinancingActionStatus(
        getFinancingActionStatus(activeInstallment.months, activeInstallment.monthlyAmount)
      );
    }
    setShowFinancing(true);
  };

  const handleSelectFinancingTerm = (option: {
    months: number;
    monthlyAmount: number;
    interestRate: number;
  }) => {
    captureProductDetailAction({
      action: 'financing_term_selected',
      loanTermMonths: option.months,
      source: 'financing_drawer',
    });
    setLoanTerm(option.months);
    setFinancingActionStatus(getFinancingActionStatus(option.months, option.monthlyAmount));
  };

  const handleCloseFinancing = () => {
    setFinancingActionStatus('Closing financing options.');
    setShowFinancing(false);
  };

  const handleFinancingLearnMore = () => {
    setFinancingActionStatus('Opening financing details for the selected payment term.');
    captureProductDetailAction({
      action: 'financing_learn_more_clicked',
      destinationPath: '/financing',
      source: 'financing_drawer',
    });
  };

  const handleSelectRentalPlan = (period: string, monthlyPrice: number) => {
    setSelectedRentalPeriod(period);
    setOfferActionStatus(getRentalPlanActionStatus(period, monthlyPrice));
  };

  const handlePageLinkAction = (label: string) => {
    setPageActionStatus(`Opening ${label}.`);
  };

  const handleToggleDelivery = () => {
    setShowDelivery((current) => {
      const next = !current;
      setPageActionStatus(
        next ? 'Opening delivery and installation details.' : 'Closing delivery and installation details.'
      );
      return next;
    });
  };

  const handleToggleFaq = (index: number, question: string) => {
    setShowFaqId((current) => {
      const next = current === index ? null : index;
      setPageActionStatus(next === index ? `Opening FAQ: ${question}.` : `Closing FAQ: ${question}.`);
      return next;
    });
  };

  const handleToggleSafety = () => {
    setShowSafety((current) => {
      const next = !current;
      setPageActionStatus(
        next
          ? 'Opening safety and compliance details.'
          : 'Closing safety and compliance details.'
      );
      return next;
    });
  };

  const handleToggleContraindication = (condition: string) => {
    setExpandedContraindication((current) => {
      const next = current === condition ? null : condition;
      setPageActionStatus(
        next === condition
          ? `Opening contraindication detail for ${condition}.`
          : `Closing contraindication detail for ${condition}.`
      );
      return next;
    });
  };

  useEffect(() => {
    if (searchParams.get('view') === 'science') {
      setMode(ViewMode.EXPERT);
      return;
    }

    setMode(ViewMode.STANDARD);
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.get('mode')?.toLowerCase() === 'rental') {
      setActiveTrack('rental');
      return;
    }

    if (typeof document !== 'undefined' && document.referrer.includes('/rental')) {
      setActiveTrack('rental');
      return;
    }

    setActiveTrack('purchase');
  }, [searchParams]);

  useEffect(() => {
    const chamberSlug = searchParams.get('chamber');

    if (chamberSlug && getChamberBySlug(chamberSlug)) {
      setSelectedHbotChamberSlug(chamberSlug);
      return;
    }

    setSelectedHbotChamberSlug(HBOT_DEFAULT_CHAMBER_SLUG);
  }, [searchParams]);

  useEffect(() => {
    if (rentalPlans.length === 0) {
      setSelectedRentalPeriod('');
      return;
    }

    setSelectedRentalPeriod((current) => {
      if (current && rentalPlans.some((plan) => plan.period === current)) {
        return current;
      }

      return rentalPlans[0]?.period ?? '';
    });
  }, [rentalPlans]);

  useEffect(() => {
    if (availableInstallmentOptions.length === 0) return;

    setLoanTerm((current) => {
      if (availableInstallmentOptions.some((option) => option.months === current)) {
        return current;
      }

      return availableInstallmentOptions[0]?.months ?? current;
    });
  }, [availableInstallmentOptions]);

  useEffect(() => {
    const node = offerPanelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOfferPanelInView(entry?.isIntersecting ?? false);
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!(showCompareModal || showFinancing)) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showCompareModal, showFinancing]);

  const pageSupportCards = [
    {
      title: 'Planning guidance',
      text:
        batch3PdpContent.socialProof.belowThresholdMessage ??
        `${data.name} pages prioritize setup clarity, support paths, and policy visibility over synthetic review widgets.`,
    },
    {
      title: 'Policy access',
      text: 'Shipping, returns, warranty, and contact pages stay directly linked so commercial details remain visible.',
    },
    {
      title: 'Next step',
      text: 'Use rental and contact pages to compare ownership options before moving toward checkout.',
    },
  ];

  const compareOpenDisabled = selectedCompareChambers.length < 2;
  const handleOpenCompare = () => {
    captureProductDetailAction({
      action: 'compare_modal_opened',
      compareCount: selectedCompareChambers.length,
      source: 'chamber_selector',
    });
    setChamberActionStatus(
      `Opening comparison for ${selectedCompareChambers.length} chambers. ${selectedHbotChamber?.fullName ?? 'Selected HBOT chamber'} remains active.`
    );
    setShowCompareModal(true);
  };

  const handleCloseCompare = () => {
    setChamberActionStatus(
      `Comparison closed. ${selectedHbotChamber?.fullName ?? 'Selected HBOT chamber'} remains active with ${selectedCompareChambers.length} of 3 chambers selected for comparison.`
    );
    setShowCompareModal(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <section
        id="product-hero"
        data-testid="hbot2-hero-addon-surface"
        className="relative overflow-hidden border-b border-white/10 bg-slate-950 text-white"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.emerald.300/8%)_1px,transparent_1px)] bg-[size:72px_72px] opacity-60" />
          <div className="absolute left-8 top-16 h-56 w-56 rounded-lg border border-cyan-300/10 bg-cyan-300/[0.03]" />
          <div className="absolute right-10 top-24 h-64 w-64 rounded-lg border border-emerald-300/10 bg-emerald-300/[0.03]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Link
            href="/store"
            onFocus={() => setPageActionStatus('Back to store link is ready.')}
            onClick={() => handlePageLinkAction('store page')}
            aria-describedby={HBOT2_PAGE_ACTION_STATUS_ID}
            className={`${focusRing} inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.07]`}
          >
            <ArrowLeft size={16} />
            Back to store
          </Link>
          <p
            id={HBOT2_PAGE_ACTION_STATUS_ID}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={HBOT2_PAGE_ACTION_STATUS_LABEL}
            className="sr-only"
          >
            {pageActionStatusMessage}
          </p>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_400px]">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                    {heroConfig.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">
                      Target use
                    </p>
                    <p className="text-sm font-semibold text-white">{heroConfig.tagline}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-[12ch] text-balance text-5xl font-black tracking-tight text-white md:text-6xl">
                    {heroConfig.title}
                  </h1>
                  <p className="max-w-[64ch] text-lg leading-8 text-slate-300">
                    {data.plainDescription}
                  </p>
                  <p className="max-w-[70ch] text-sm leading-7 text-slate-400">
                    {selectedHbotChamber?.shortDescription ?? data.descriptionStandard}
                  </p>
                  <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                    <Link
                      href={productContactHref}
                      onFocus={() => setPageActionStatus('Planning guidance link is ready.')}
                      onClick={() => {
                        handlePageLinkAction('planning guidance');
                        captureProductDetailAction({
                          action: 'support_exit_clicked',
                          destinationPath: productContactHref,
                          source: 'hero',
                        });
                      }}
                      aria-describedby={HBOT2_PAGE_ACTION_STATUS_ID}
                      className={`${focusRing} inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 text-sm font-bold uppercase tracking-[0.16em] text-slate-950 transition-colors hover:bg-cyan-200`}
                    >
                      Request planning guidance
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      href={productRentalHref}
                      onFocus={() => setPageActionStatus('Rental options link is ready.')}
                      onClick={() => {
                        handlePageLinkAction('rental options');
                        captureProductDetailAction({
                          action: 'rental_request_clicked',
                          destinationPath: productRentalHref,
                          source: 'hero',
                        });
                      }}
                      aria-describedby={HBOT2_PAGE_ACTION_STATUS_ID}
                      className={`${focusRing} inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] px-5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.07] hover:text-cyan-100`}
                    >
                      Explore rental options
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {data.technicalSpecs.slice(0, 3).map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                      {spec.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">{spec.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045]">
                  <div className="border-b border-white/10 px-5 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                      Active HBOT Configuration
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      {selectedHbotChamber?.fullName ?? 'HBOT Chamber'}
                    </h2>
                  </div>
                  <div className="bg-slate-950/55 p-6">
                    {selectedHbotHeroImage ? (
                      <OptimizedImage
                        src={selectedHbotHeroImage}
                        alt={selectedHbotChamber?.fullName ?? data.name}
                        width={960}
                        height={720}
                        priority
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="h-[280px] w-full object-contain md:h-[360px]"
                      />
                    ) : (
                      <HbotChamberMediaFallback
                        title={selectedHbotChamber?.fullName ?? data.name}
                        specifications={selectedHbotChamber?.specifications}
                        className="min-h-[280px] md:min-h-[360px]"
                      />
                    )}
                  </div>
                  <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2">
                    {(selectedHbotChamber?.highlights ?? selectedHbotChamber?.features ?? [])
                      .slice(0, 4)
                      .map((item) => (
                        <div
                          key={item}
                          className="rounded-lg border border-white/10 bg-slate-950/55 px-4 py-3 text-sm font-medium text-slate-300"
                        >
                          {item}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                          Chamber Selector
                        </p>
                        <h2 className="mt-2 text-lg font-bold text-white">
                          Compare the HBOT lineup
                        </h2>
                        <p
                          id={HBOT2_CHAMBER_ACTION_STATUS_ID}
                          role="status"
                          aria-live="polite"
                          aria-atomic="true"
                          aria-label={HBOT2_CHAMBER_ACTION_STATUS_LABEL}
                          className="mt-3 text-sm leading-6 text-slate-300"
                        >
                          {chamberActionStatusMessage}
                        </p>
                      </div>
                      <button
                        type="button"
                        data-testid="hbot2-open-compare"
                        disabled={compareOpenDisabled}
                        onClick={handleOpenCompare}
                        aria-describedby={HBOT2_CHAMBER_ACTION_STATUS_ID}
                        className={`${focusRing} inline-flex min-h-11 items-center rounded-lg border px-4 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                          compareOpenDisabled
                            ? 'cursor-not-allowed border-white/10 bg-slate-950/55 text-slate-500'
                            : 'border-white/10 bg-slate-950/55 text-cyan-100 hover:border-cyan-300/45 hover:bg-white/[0.045]'
                        }`}
                      >
                        Compare {selectedCompareChambers.length}/3
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {ALL_CHAMBERS.map((chamber) => {
                        const isSelected = selectedHbotChamber?.id === chamber.id;
                        const isCompared = compareChamberIds.includes(chamber.id);

                        return (
                          <div
                            key={chamber.id}
                            className={`rounded-lg border p-3 transition-colors ${
                              isSelected
                                ? 'border-cyan-300/45 bg-cyan-300/10'
                                : 'border-white/10 bg-slate-950/55'
                            }`}
                          >
                            <button
                              type="button"
                              data-testid={`hbot2-chamber-${chamber.slug}`}
                              onClick={() => handleSelectChamber(chamber.slug)}
                              aria-describedby={HBOT2_CHAMBER_ACTION_STATUS_ID}
                              className={`${focusRing} flex w-full items-start justify-between gap-4 text-left`}
                            >
                              <div>
                                <p className="text-sm font-semibold text-white">{chamber.fullName}</p>
                                <p className="mt-1 text-xs leading-6 text-slate-300">
                                  {chamber.shortDescription}
                                </p>
                              </div>
                              <span
                                className={`rounded-lg px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                                  isSelected
                                    ? 'border border-cyan-300/30 bg-cyan-300/15 text-cyan-100'
                                    : 'border border-white/10 bg-white/[0.045] text-slate-300'
                                }`}
                              >
                                {isSelected ? 'Active' : 'Select'}
                              </span>
                            </button>
                            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">
                                {chamber.variantLabel}
                              </p>
                              <button
                                type="button"
                                onClick={() => toggleCompareChamber(chamber.id)}
                                aria-describedby={HBOT2_CHAMBER_ACTION_STATUS_ID}
                                className={`${focusRing} inline-flex min-h-11 items-center rounded-lg border px-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                                  isCompared
                                    ? 'border-cyan-300/45 bg-cyan-300/15 text-cyan-100'
                                    : 'border-white/10 bg-slate-950/55 text-slate-300 hover:border-cyan-300/45 hover:bg-white/[0.045] hover:text-cyan-100'
                                }`}
                              >
                                {isCompared ? 'Comparing' : 'Add to compare'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 text-white">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                      Best for
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-200">
                      {selectedHbotChamber?.idealFor ?? 'Home wellness routines that need daily oxygen support.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(selectedHbotChamber?.useCases ?? data.benefits).slice(0, 4).map((item) => (
                        <span
                          key={item}
                          className="rounded-lg border border-white/10 bg-slate-950/55 px-3 py-1 text-[11px] font-semibold text-slate-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={offerPanelRef}
              data-testid="hbot2-offer-panel"
              className="xl:sticky xl:top-24"
            >
              <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur">
                <p
                  id={HBOT2_OFFER_ACTION_STATUS_ID}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={HBOT2_OFFER_ACTION_STATUS_LABEL}
                  className="sr-only"
                >
                  {offerActionStatusMessage}
                </p>
                {pdpDualTrackEnabled ? (
                  <div className="mb-5 inline-flex w-full rounded-lg border border-white/10 bg-slate-950/70 p-1">
                    <button
                      type="button"
                      data-testid="hbot2-track-buy"
                      onClick={() => handleTrackChange('purchase')}
                      onFocus={() => setOfferActionStatus(getOfferTrackActionStatus('purchase'))}
                      aria-pressed={activeTrack === 'purchase'}
                      aria-describedby={HBOT2_OFFER_ACTION_STATUS_ID}
                      className={`${focusRing} min-h-11 flex-1 rounded-lg px-4 text-xs font-bold uppercase tracking-[0.16em] transition-all ${
                        activeTrack === 'purchase'
                          ? 'bg-cyan-300 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {pdpCommerceContent.trackLabels.buy}
                    </button>
                    <button
                      type="button"
                      data-testid="hbot2-track-rent"
                      onClick={() => handleTrackChange('rental')}
                      onFocus={() => setOfferActionStatus(getOfferTrackActionStatus('rental'))}
                      aria-pressed={activeTrack === 'rental'}
                      aria-describedby={HBOT2_OFFER_ACTION_STATUS_ID}
                      className={`${focusRing} min-h-11 flex-1 rounded-lg px-4 text-xs font-bold uppercase tracking-[0.16em] transition-all ${
                        activeTrack === 'rental'
                          ? 'bg-cyan-300 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {pdpCommerceContent.trackLabels.rent}
                    </button>
                  </div>
                ) : null}

                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                      Primary decision
                    </p>
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                      <span className="text-4xl font-black tracking-tight text-white">
                        {activeTrack === 'purchase'
                          ? purchasePriceLabel
                          : rentalPriceLabel ?? pdpCommerceContent.pricing.rentalUnavailable}
                      </span>
                      <span className="pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
                        {activeTrack === 'purchase'
                          ? pdpCommerceContent.trackLabels.purchaseBadge
                          : pdpCommerceContent.trackLabels.rentalBadge}
                      </span>
                    </div>

                    {activeTrack === 'purchase' ? (
                      financingHint ? (
                        <button
                          type="button"
                          onClick={handleOpenFinancing}
                          onFocus={() =>
                            setOfferActionStatus('Financing options are ready from the offer panel.')
                          }
                          aria-describedby={HBOT2_OFFER_ACTION_STATUS_ID}
                          className={`${focusRing} mt-3 inline-flex min-h-11 items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/15`}
                        >
                          <CreditCard size={16} className="mr-2" />
                          {financingHint}
                        </button>
                      ) : null
                    ) : (
                      <div className="mt-3 space-y-1 text-sm text-slate-300">
                        <p>
                          {pdpCommerceContent.pricing.minimumPeriodPrefix} {rentalMinimumPeriod}
                        </p>
                        {rentalDepositLabel ? (
                          <p>
                            {pdpCommerceContent.pricing.refundableDepositPrefix}{' '}
                            {rentalDepositLabel}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {activeTrack === 'rental' && rentalPlans.length > 0 ? (
                    <div className="space-y-2">
                      {rentalPlans.map((plan) => {
                        const isSelected = selectedRentalPlan?.period === plan.period;
                        const savings = calculateRentalSavings(plan.monthlyPrice, plan.period);
                        return (
                          <button
                            key={plan.period}
                            type="button"
                            onClick={() => handleSelectRentalPlan(plan.period, plan.monthlyPrice)}
                            onFocus={() =>
                              setOfferActionStatus(
                                getRentalPlanActionStatus(plan.period, plan.monthlyPrice)
                              )
                            }
                            aria-describedby={HBOT2_OFFER_ACTION_STATUS_ID}
                            className={`${focusRing} flex w-full min-h-11 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                              isSelected
                                ? 'border-cyan-300/45 bg-cyan-300/10'
                                : 'border-white/10 bg-slate-950/55 hover:border-cyan-300/35'
                            }`}
                          >
                            <span className="text-sm font-semibold text-white">
                              {plan.period} — {formatPrice(plan.monthlyPrice)}/mo
                            </span>
                            {savings > 0 ? (
                              <span className="text-xs font-semibold text-emerald-600">
                                {pdpCommerceContent.pricing.savingsPrefix} {formatPrice(savings)}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    data-testid="hbot2-primary-cta"
                    onClick={handlePrimaryAction}
                    onFocus={() =>
                      setOfferActionStatus(
                        activeTrack === 'purchase'
                          ? 'Add-to-cart action is ready for the purchase track.'
                          : 'Rental request action is ready for the rental track.'
                      )
                    }
                    aria-describedby={HBOT2_OFFER_ACTION_STATUS_ID}
                    className={`${focusRing} inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-6 text-sm font-bold uppercase tracking-[0.18em] text-slate-950 transition-transform transition-colors hover:bg-cyan-200 active:scale-[0.99]`}
                  >
                    {activeTrack === 'purchase'
                      ? pdpCommerceContent.cta.addToCart
                      : pdpCommerceContent.cta.tryIt}
                    <ArrowRight size={16} />
                  </button>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <Link
                      href="/warranty"
                      onFocus={() => setPageActionStatus('Warranty link is ready.')}
                      onClick={() => handlePageLinkAction('warranty page')}
                      aria-describedby={HBOT2_PAGE_ACTION_STATUS_ID}
                      className={`${focusRing} inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.045]`}
                    >
                      Warranty
                    </Link>
                    <Link
                      href="/returns"
                      onFocus={() => setPageActionStatus('Returns link is ready.')}
                      onClick={() => handlePageLinkAction('returns page')}
                      aria-describedby={HBOT2_PAGE_ACTION_STATUS_ID}
                      className={`${focusRing} inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.045]`}
                    >
                      Returns
                    </Link>
                    <Link
                      href={productContactHref}
                      onFocus={() => setPageActionStatus('Contact link is ready.')}
                      onClick={() => {
                        handlePageLinkAction('contact page');
                        captureProductDetailAction({
                          action: 'support_exit_clicked',
                          destinationPath: productContactHref,
                          source: 'offer_panel',
                        });
                      }}
                      aria-describedby={HBOT2_PAGE_ACTION_STATUS_ID}
                      className={`${focusRing} inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:border-cyan-300/45 hover:bg-white/[0.045]`}
                    >
                      Contact
                    </Link>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
                    <ul className="space-y-2">
                      {anxietyBufferItems.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm leading-6 text-slate-300"
                        >
                          <CheckCircle size={14} className="mt-1 shrink-0 text-emerald-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-[11px] leading-6 text-slate-400">
                      {disclaimers.pdp}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {!isOfferPanelInView && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-3 bottom-4 z-40 rounded-lg border border-white/10 bg-slate-950/95 p-3 text-white backdrop-blur xl:hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-bold text-white">{data.name}</p>
                <p className="text-xs text-slate-300">
                  {activeTrack === 'purchase'
                    ? purchasePriceLabel
                    : rentalPriceLabel ?? pdpCommerceContent.pricing.rentalUnavailable}
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrimaryAction}
                onFocus={() =>
                  setOfferActionStatus(
                    activeTrack === 'purchase'
                      ? 'Sticky add-to-cart action is ready for the purchase track.'
                      : 'Sticky rental request action is ready for the rental track.'
                  )
                }
                aria-describedby={HBOT2_OFFER_ACTION_STATUS_ID}
                className={`${focusRing} inline-flex min-h-12 items-center rounded-lg bg-slate-950 px-5 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-slate-800`}
              >
                {stickyLabel}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Hbot2BrowseNavSection
        routeClusterLinks={routeClusterLinks}
        guidanceUpdatedLabel={guidanceUpdatedLabel}
        focusRing={focusRing}
        pageActionStatusId={HBOT2_PAGE_ACTION_STATUS_ID}
        onLinkFocus={(label) => setPageActionStatus(`${label} link is ready.`)}
        onLinkClick={(label) => handlePageLinkAction(label)}
      />

      <Hbot2CompareModal
        selectedCompareChambers={selectedCompareChambers}
        compareOpenDisabled={compareOpenDisabled}
        showCompareModal={showCompareModal}
        focusRing={focusRing}
        chamberActionStatusId={HBOT2_CHAMBER_ACTION_STATUS_ID}
        onRemoveCompareChamber={removeCompareChamber}
        onOpenCompare={handleOpenCompare}
        onCloseCompare={handleCloseCompare}
        onActivateChamber={(chamber) => {
          captureProductDetailAction({
            action: 'compare_chamber_activated',
            chamberSlug: toAnonymousChamberSlug(chamber.id),
            compareCount: selectedCompareChambers.length,
            source: 'compare_modal',
          });
          captureProductDetailAction({
            action: 'chamber_selected',
            chamberSlug: toAnonymousChamberSlug(chamber.id),
            source: 'compare_modal',
          });
          handleSelectChamber(chamber.slug);
          setShowCompareModal(false);
          setChamberActionStatus(
            `${chamber.fullName} is now active from comparison. ${selectedCompareChambers.length} of 3 chambers selected for comparison.`
          );
        }}
      />

      <Hbot2SpecificationsSection
        selectedHbotChamber={selectedHbotChamber}
        renderChamberDescription={renderChamberDescription}
      />

      <Hbot2NarrativeSection
        mode={mode}
        descriptionExpert={data.descriptionExpert}
        descriptionStandard={data.descriptionStandard}
        guidanceUpdatedLabel={guidanceUpdatedLabel}
        selectionRationale={product?.selectionRationale ?? undefined}
        trustHierarchyWhySelected={batch3PdpContent.trustHierarchy.whySelected}
        protocolSignal={batch3PdpContent.trustHierarchy.protocolSignal}
        focusRing={focusRing}
        pageActionStatusId={HBOT2_PAGE_ACTION_STATUS_ID}
        onModeChange={handleModeChange}
        onSetPageActionStatus={setPageActionStatus}
      />

      <Hbot2EvidenceSection
        relatedStudy={relatedStudy}
        benefits={data.benefits}
        focusRing={focusRing}
        pageActionStatusId={HBOT2_PAGE_ACTION_STATUS_ID}
        onOpenStudyFocus={() => setPageActionStatus('Open study link is ready.')}
        onOpenStudyClick={() => handlePageLinkAction('study in a new tab')}
      />

      <Hbot2HowToUseSection steps={data.protocolSteps} />

      <div className="[&_p.text-slate-400]:text-slate-700 [&_span.text-cyan-600]:text-cyan-800">
        <TechDetailTimelineSection
          phases={resultTimeline}
          accentColor={data.accentColor}
          themeColor={data.themeColor}
        />
      </div>

      <Hbot2ProtocolEcosystemSection
        pdpProtocolsEnabled={pdpProtocolsEnabled}
        relatedProtocolCards={relatedProtocolCards}
        focusRing={focusRing}
        pageActionStatusId={HBOT2_PAGE_ACTION_STATUS_ID}
        onProtocolFocus={(title) => setPageActionStatus(`${title} protocol link is ready.`)}
        onProtocolClick={(title) => handlePageLinkAction(`${title} protocol`)}
        makeProtocolHref={makeProtocolHref}
      />

      <Hbot2AddonsSection
        addons={data.addons}
        selectedAddons={selectedAddons}
        addonActionStatusId={HBOT2_ADDON_ACTION_STATUS_ID}
        addonActionStatusLabel={HBOT2_ADDON_ACTION_STATUS_LABEL}
        addonActionStatusMessage={addonActionStatusMessage}
        aria-describedby={HBOT2_ADDON_ACTION_STATUS_ID}
        focusRing={focusRing}
        toggleAddon={toggleAddon}
        formatPrice={formatPrice}
      />

      <Hbot2TrustSection
        productContactHref={productContactHref}
        pageActionStatusId={HBOT2_PAGE_ACTION_STATUS_ID}
        focusRing={focusRing}
        pageSupportCards={pageSupportCards}
        onContactFocus={() => setPageActionStatus('Contact support link is ready.')}
        onContactClick={() => handlePageLinkAction('contact support')}
      />

      <Hbot2SupportOperationsSection
        showDelivery={showDelivery}
        onToggleDelivery={handleToggleDelivery}
        onDeliveryFocus={() => setPageActionStatus('Delivery and installation details are ready.')}
        faqs={data.faqs}
        showFaqId={showFaqId}
        onToggleFaq={handleToggleFaq}
        onFaqFocus={(question) => setPageActionStatus(`FAQ ready: ${question}.`)}
        focusRing={focusRing}
        pageActionStatusId={HBOT2_PAGE_ACTION_STATUS_ID}
      />

      <Hbot2SafetyResourcesSection
        showSafety={showSafety}
        onToggleSafety={handleToggleSafety}
        onSafetyFocus={() => setPageActionStatus('Safety and compliance details are ready.')}
        approvedClaims={knowledge?.approvedClaims}
        contraindications={data.contraindications}
        expandedContraindication={expandedContraindication}
        onToggleContraindication={handleToggleContraindication}
        onContraindicationFocus={(condition) =>
          setPageActionStatus(`Contraindication detail ready for ${condition}.`)
        }
        drugInteractions={data.drugInteractions}
        disclaimerText={knowledge?.disclaimers[0] ?? disclaimers.pdp}
        pdpDocumentsEnabled={pdpDocumentsEnabled}
        productDocuments={productDocuments}
        onDocumentFocus={(title) => setPageActionStatus(`${title} resource link is ready.`)}
        onDocumentClick={(title) => handlePageLinkAction(`${title} resource`)}
        productContactHref={productContactHref}
        productRentalHref={productRentalHref}
        onGuidanceFocus={() => setPageActionStatus('Request guidance link is ready.')}
        onGuidanceClick={() => {
          handlePageLinkAction('guidance request');
          captureProductDetailAction({
            action: 'support_exit_clicked',
            destinationPath: productContactHref,
            source: 'resource_panel',
          });
        }}
        onRentalFocus={() => setPageActionStatus('Review rental link is ready.')}
        onRentalClick={() => {
          handlePageLinkAction('rental review');
          captureProductDetailAction({
            action: 'rental_exit_clicked',
            destinationPath: productRentalHref,
            source: 'resource_panel',
          });
        }}
        focusRing={focusRing}
        pageActionStatusId={HBOT2_PAGE_ACTION_STATUS_ID}
      />

      <Hbot2FinancingDrawer
        showFinancing={showFinancing}
        activeInstallment={activeInstallment}
        loanTerm={loanTerm}
        availableInstallmentOptions={availableInstallmentOptions}
        financingActionStatusMessage={financingActionStatusMessage}
        focusRing={focusRing}
        financingActionStatusId={HBOT2_FINANCING_ACTION_STATUS_ID}
        financingActionStatusLabel={HBOT2_FINANCING_ACTION_STATUS_LABEL}
        aria-describedby={HBOT2_FINANCING_ACTION_STATUS_ID}
        formatPrice={formatPrice}
        onClose={handleCloseFinancing}
        onSelectTerm={handleSelectFinancingTerm}
        onLearnMore={handleFinancingLearnMore}
      />
    </div>
  );
}
