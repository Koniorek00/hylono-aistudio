'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  Activity,
  Target,
  Sliders,
  Heart,
  Shield,
  FileText,
  Moon,
} from 'lucide-react';
import { ALL_CHAMBERS, OXYLIFE_I_80, OXYLIFE_I_90 } from '@/constants/chambers';
import { ChamberCompare5 } from '@/components/ChamberCompare5';
import { priceBookText } from '@/lib/money';
import { TECH_DETAILS } from '@/constants';
import { TechType } from '@/types';

interface HbotRedesignClientProps {
  initialChamberSlug?: string;
}

type TabCategory = 'monoplace' | 'multiplace' | 'soft';

/**
 * Accessory prices are read from the catalogue, never typed as display strings.
 *
 * The rendered figure used to be a hardcoded '+1,299 zł' literal, which duplicated
 * `constants.ts` and could drift from it independently. `priceBookText` supplies the
 * currency from `PRICE_BOOK_CURRENCY`, so the amount and its currency have one source.
 */
const addonPrices = TECH_DETAILS[TechType.HBOT].addons ?? [];
const priceOfAddon = (id: string): string => {
  const addon = addonPrices.find((entry) => entry.id === id);
  return addon ? `+${priceBookText(addon.price)}` : '';
};

const ACCORDION_DATA = [
  {
    id: 'extra10cm',
    title: 'Why the extra 10 cm matters',
    content:
      'At hyperbaric pressures, the body naturally tenses slightly during the first few minutes of pressurisation. The additional 10 cm of diameter in the I/90 meaningfully reduces this sensation, allowing users to recline with arms at their sides without any wall contact. For seniors or users with mobility limitations, the difference in ease of entry and comfort during the full session is significant.',
  },
  {
    id: 'smartFeatures',
    title: 'SMART features (same as I/80)',
    content:
      'The I/90 shares every technical and software feature of the I/80: the same EU-manufactured aluminium body (tested to 2.5 ATA), the same Japanese polycarbonate window, the same dual touchscreen system with mirrored inside/outside controls, the same Airsep Intensity oxygen concentrator, the same five-layer safety architecture, and the same suite of automated Smart Protocols.',
  },
  {
    id: 'performance',
    title: 'Performance',
    content:
      'The slightly larger chamber volume means the compressors work marginally harder to achieve the same pressure, but ventilation performance is equivalent, with CO₂ maintained below the same 1,800 ppm threshold. Noise levels remain below 38 dB — quieter than a normal room conversation.',
  },
  {
    id: 'idealFor',
    title: 'Ideal for',
    content:
      'Individuals who value maximum personal space, users with broader shoulder width, clinical facilities serving diverse user groups, and anyone with mild claustrophobia who desires an expansive, open session atmosphere.',
  },
];

export function HbotRedesignClient({
  initialChamberSlug = 'oxylife-i-90',
}: HbotRedesignClientProps) {
  const router = useRouter();
  const [selectedSlug, setSelectedSlug] = useState<string>(initialChamberSlug);
  const [activeTab, setActiveTab] = useState<TabCategory>('monoplace');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    extra10cm: false,
    smartFeatures: false,
    performance: false,
    idealFor: false,
  });
  const [scienceMode, setScienceMode] = useState<'simple' | 'science'>('simple');
  const [activeThumbIndex, setActiveThumbIndex] = useState<number>(0);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);

  const selectedChamber = useMemo(() => {
    return (
      ALL_CHAMBERS.find((c) => c.slug === selectedSlug) ||
      OXYLIFE_I_90
    );
  }, [selectedSlug]);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectChamber = (slug: string) => {
    setSelectedSlug(slug);
  };

  const monoplaceChambers = useMemo(() => {
    return [
      {
        slug: 'oxylife-i-90',
        name: 'OxyLife I / 90',
        subtitle: 'Maximum personal space — the widest monoplace SMART chamber.',
        image: '/images/chambers/hbot-redesign/chamber-oxylife-90.png',
        tags: [
          { text: 'EU', variant: 'neutral' },
          { text: 'SMART', variant: 'accent' },
          { text: 'Rental', variant: 'outline' },
        ],
      },
      {
        slug: 'oxylife-i-80',
        name: 'OxyLife I / 80',
        subtitle: 'SMART chamber controls — built-in automated protocol settings.',
        image: '/images/chambers/hbot-redesign/chamber-oxylife-80.png',
        tags: [
          { text: 'EU', variant: 'neutral' },
          { text: 'SMART', variant: 'accent' },
          { text: 'Rental', variant: 'outline' },
        ],
      },
      {
        slug: 'monoplace-pro-standard',
        name: 'Monoplace Pro — Standard',
        subtitle: 'Hard monoplace chamber. Structured controls, accessible quote path.',
        image: '/images/chambers/hbot-redesign/chamber-monoplace-pro.png',
        tags: [
          { text: 'EU', variant: 'neutral' },
          { text: 'Standard', variant: 'outline' },
          { text: 'Rental', variant: 'outline' },
        ],
      },
      {
        slug: 'oxylife-soft',
        name: 'OxyLife Soft',
        subtitle: 'Comfortable, flexible, portable option for home or clinical use.',
        image: '/images/chambers/hbot-redesign/chamber-oxylife-soft.png',
        tags: [
          { text: 'EU', variant: 'neutral' },
          { text: 'Portable', variant: 'outline' },
          { text: 'Rental', variant: 'outline' },
        ],
      },
    ];
  }, []);

  const galleryImages = [
    '/images/chambers/hbot-redesign/interior-chamber-view.png',
    '/images/chambers/hbot-redesign/interior-thumb-2.png',
    '/images/chambers/hbot-redesign/interior-thumb-3.png',
    '/images/chambers/hbot-redesign/interior-thumb-4.png',
  ];

  return (
    <div className="w-full bg-[#FAF8F5] text-stone-900 font-sans selection:bg-stone-200">
      {/* ─── SECTION 01B: CHAMBER SELECTOR CAROUSEL ────────────────────────── */}
      <section
        id="hbot-configure"
        aria-labelledby="hbot-configure-title"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-14 border-b border-stone-200/80"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-8 border-b border-stone-200/60 sm:border-0 pb-2 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('monoplace')}
              className={`text-sm pb-1.5 transition-colors cursor-pointer ${
                activeTab === 'monoplace'
                  ? 'border-b-2 border-stone-900 text-stone-900 font-semibold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              Monoplace (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('multiplace')}
              className={`text-sm pb-1.5 transition-colors cursor-pointer ${
                activeTab === 'multiplace'
                  ? 'border-b-2 border-stone-900 text-stone-900 font-semibold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              Multiplace (3)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('soft')}
              className={`text-sm pb-1.5 transition-colors cursor-pointer ${
                activeTab === 'soft'
                  ? 'border-b-2 border-stone-900 text-stone-900 font-semibold'
                  : 'text-stone-500 hover:text-stone-800 font-medium'
              }`}
            >
              Soft Chamber (2)
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2" aria-hidden="true">
            <span className="h-8 w-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-500 hover:bg-stone-100 text-xs transition-colors cursor-pointer">
              <ChevronLeft size={16} />
            </span>
            <span className="h-8 w-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-800 hover:bg-stone-100 text-xs transition-colors cursor-pointer">
              <ChevronRight size={16} />
            </span>
          </div>
        </div>

        <h2 id="hbot-configure-title" className="sr-only">
          Select Hyperbaric Chamber Configuration
        </h2>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {monoplaceChambers.map((card) => {
            const isSelected = selectedSlug === card.slug;
            return (
              <button
                key={card.slug}
                type="button"
                onClick={() => handleSelectChamber(card.slug)}
                aria-label={`Select ${card.name}`}
                className={`group relative text-left rounded-2xl bg-white p-5 transition-all duration-200 flex flex-col justify-between h-full border cursor-pointer ${
                  isSelected
                    ? 'border-stone-800 shadow-sm ring-1 ring-stone-800/10'
                    : 'border-stone-200/90 hover:border-stone-300 hover:shadow-xs'
                }`}
                aria-pressed={isSelected}
              >
                <div>
                  {isSelected ? (
                    <div className="absolute top-3.5 left-3.5 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#132A2E] px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-xs">
                      <Check size={11} strokeWidth={2.5} />
                      <span>Selected</span>
                    </div>
                  ) : null}

                  <div className="relative w-full h-28 flex items-center justify-center pt-1 pb-1">
                    <Image
                      src={card.image}
                      alt={card.name}
                      width={234}
                      height={87}
                      className="max-h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
                    />
                  </div>

                  <h3 className="mt-3 text-[15px] sm:text-base font-medium font-serif text-stone-900 leading-snug">
                    {card.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">
                    {card.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => {
                    let badgeClass = 'rounded-full px-2.5 py-0.5 text-[10px] font-medium ';
                    if (tag.variant === 'accent') {
                      badgeClass += 'bg-[#D1E2DD]/80 text-stone-800 border border-teal-200/50';
                    } else if (tag.variant === 'neutral') {
                      badgeClass += 'bg-[#E5DFD5]/70 text-stone-700 border border-stone-300/40';
                    } else {
                      badgeClass += 'border border-stone-300 bg-white/50 text-stone-700';
                    }
                    return (
                      <span key={tag.text} className={badgeClass}>
                        {tag.text}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── SECTION 02: WHAT IT DOES ───────────────────────────────────────── */}
      <section
        id="description"
        aria-labelledby="what-it-does-title"
        className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-stone-200/80 overflow-hidden"
      >
        {/* Seamless ambient glass/bubble sculpture on right side */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[62%] pointer-events-none z-0 opacity-90 hidden sm:block">
          <Image
            src="/images/chambers/hbot-redesign/sec02-sculpture.png"
            alt=""
            aria-hidden="true"
            fill
            className="object-cover object-left"
          />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 items-center">
          {/* Left Column: Eyebrow, Pill Toggle, Heading, Body, Freshness */}
          <div className="max-w-xl">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-stone-500">
              02 · WHAT IT DOES
            </p>

            {/* Pill Toggle directly below tag on left */}
            <div className="mt-3.5 inline-flex rounded-full bg-stone-200/60 p-0.5 border border-stone-300/60">
              <button
                type="button"
                onClick={() => setScienceMode('simple')}
                className={`rounded-full px-4 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  scienceMode === 'simple'
                    ? 'bg-[#132A2E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                SimpleScience
              </button>
              <button
                type="button"
                onClick={() => setScienceMode('science')}
                className={`rounded-full px-4 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  scienceMode === 'science'
                    ? 'bg-[#132A2E] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Science
              </button>
            </div>

            <h2
              id="what-it-does-title"
              className="editorial-section font-serif text-stone-900 tracking-tight mt-4"
            >
              What it does.
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-stone-600 font-sans">
              {scienceMode === 'simple'
                ? 'Mild Hyperbaric Oxygen Therapy planning focuses on chamber pressure, oxygen delivery, session tolerance, and safety screening. Operating around 1.3–1.5 ATA, the system should be reviewed as a wellness access path with professional guidance, not as a promise of specific physiological change or disease management.'
                : "Under elevated atmospheric pressure, dissolved plasma oxygen content increases in accordance with Henry's Law. At 1.3–1.5 ATA, this supports enhanced tissue microcirculation and cellular metabolic efficiency. Consultation with a medical professional remains essential for individual qualification and protocol development."}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-stone-500">
              <Clock size={14} className="text-stone-400" />
              <span>Guidance updated: January 2026</span>
            </div>
          </div>

          {/* Right Column: 3 Metric Columns with subtle vertical rules */}
          <div className="flex flex-col justify-end h-full pt-6 lg:pt-16">
            <div className="grid grid-cols-3 gap-6 sm:gap-8">
              <div className="border-l border-stone-400/80 pl-4">
                <span className="block text-xs font-mono font-medium text-stone-600">01</span>
                <span className="block text-xs font-medium text-stone-700 mt-1">Pressure</span>
                <span className="block text-sm sm:text-base font-bold text-stone-900 mt-0.5 whitespace-nowrap">
                  1.3 – 1.5 ATA
                </span>
              </div>
              <div className="border-l border-stone-400/80 pl-4">
                <span className="block text-xs font-mono font-medium text-stone-600">02</span>
                <span className="block text-xs font-medium text-stone-700 mt-1">Oxygen</span>
                <span className="block text-sm sm:text-base font-bold text-stone-900 mt-0.5 whitespace-nowrap">
                  High purity O₂
                </span>
              </div>
              <div className="border-l border-stone-400/80 pl-4">
                <span className="block text-xs font-mono font-medium text-stone-600">03</span>
                <span className="block text-xs font-medium text-stone-700 mt-1">Safety</span>
                <span className="block text-sm sm:text-base font-bold text-stone-900 mt-0.5 whitespace-nowrap">
                  5 layer system
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 03: SELECTED MODEL DEEP DIVE (4-COLUMN LAYOUT) ──────────── */}
      <section
        id="model-detail"
        data-testid="product-detail-hbot-spotlight-surface"
        aria-labelledby="model-detail-title"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-stone-200/80"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.05fr_1.15fr_0.9fr] gap-6 xl:gap-8 items-start">
          {/* Column 1: Model profile & accordion */}
          <div>
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-stone-500">
              03 · SELECTED MODEL
            </p>
            <h2
              id="model-detail-title"
              className="editorial-section font-serif text-stone-900 mt-2"
            >
              {selectedChamber.fullName || 'OxyLife I / 90'}
            </h2>
            <p className="mt-1.5 text-sm font-semibold text-stone-800">
              {selectedSlug === 'oxylife-i-90'
                ? 'The roomier choice for greater comfort.'
                : selectedChamber.tagline}
            </p>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-600">
              {selectedSlug === 'oxylife-i-90'
                ? 'The OxyLife I/90 delivers the same SMART protocol controls as the I/80, in a roomier 90 cm diameter chamber. At 1,463 litres of internal volume, it is designed for users who value comfort or have limited mobility, while preserving controlled pressure management, pleasure management.'
                : selectedChamber.shortDescription}
            </p>

            <div className="mt-4 flex items-center gap-1.5 text-xs text-stone-500">
              <Clock size={13} className="text-stone-400" />
              <span>Guidance updated: January 2026</span>
            </div>

            {/* Accordion */}
            <div className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
              {ACCORDION_DATA.map((item) => {
                const isOpen = openAccordions[item.id];
                return (
                  <div key={item.id} className="py-3">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.id)}
                      className="flex w-full items-center justify-between text-left text-xs sm:text-sm font-medium text-stone-800 hover:text-stone-950 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span>{item.title}</span>
                      <span className="ml-2 text-stone-500">
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </span>
                    </button>
                    {isOpen ? (
                      <p className="mt-2 text-xs leading-relaxed text-stone-600 pr-2">
                        {item.content}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedSlug(
                    selectedSlug === 'oxylife-i-90' ? 'oxylife-i-80' : 'oxylife-i-90'
                  );
                }}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                <span>
                  Compare with{' '}
                  {selectedSlug === 'oxylife-i-90' ? 'OxyLife I / 80' : 'OxyLife I / 90'}
                </span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Column 2: Center Gallery */}
          <div className="flex flex-col items-center">
            <div className="w-full aspect-[3/4] max-w-sm rounded-2xl overflow-hidden border border-stone-200/80 bg-white shadow-xs relative">
              <Image
                src={galleryImages[activeThumbIndex] || galleryImages[0]!}
                alt={`${selectedChamber.fullName} interior perspective`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
            </div>

            {/* Thumbnails */}
            <div className="mt-3 grid grid-cols-4 gap-2 w-full max-w-sm">
              {galleryImages.map((thumb, idx) => (
                <button
                  key={thumb}
                  type="button"
                  onClick={() => setActiveThumbIndex(idx)}
                  className={`relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    activeThumbIndex === idx
                      ? 'border-stone-900 ring-2 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <Image
                    src={thumb}
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Column 3: Specifications */}
          <div className="pr-0 xl:pr-2">
            <div className="border-b border-stone-200/90 pb-2 mb-3.5 flex items-center gap-1.5">
              <span className="text-stone-500 font-serif text-base font-normal">)</span>
              <h3 className="font-serif text-base font-normal text-stone-900">
                Specifications
              </h3>
            </div>

            {/* Compact Spec Groups */}
            <div className="space-y-3.5 text-xs">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                  Dimensions
                </p>
                <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 text-stone-600">
                  <span>Internal Diameter</span>
                  <span className="font-semibold text-stone-900 text-right">
                    {selectedSlug === 'oxylife-i-90' ? 'Ø 90 cm' : 'Ø 80 cm'}
                  </span>
                  <span>Length</span>
                  <span className="font-semibold text-stone-900 text-right">220 cm</span>
                  <span>Internal Volume</span>
                  <span className="font-semibold text-stone-900 text-right">
                    {selectedSlug === 'oxylife-i-90' ? '1,463 litres' : '1,156 litres'}
                  </span>
                  <span>Chamber Weight</span>
                  <span className="font-semibold text-stone-900 text-right">
                    {selectedSlug === 'oxylife-i-90' ? '105 kg' : '90 kg'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/70">
                <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                  Materials
                </p>
                <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 text-stone-600">
                  <span>Body Material</span>
                  <span className="font-semibold text-stone-900 text-right">
                    Aluminium alloy, 4 mm
                  </span>
                  <span>Window Material</span>
                  <span className="font-semibold text-stone-900 text-right">
                    Polycarbonate (Japanese)
                  </span>
                  <span>Window Thickness</span>
                  <span className="font-semibold text-stone-900 text-right">
                    10 mm / 15 mm (options)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/70">
                <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                  Pressure & Air
                </p>
                <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 text-stone-600">
                  <span>Max Operating Pressure</span>
                  <span className="font-semibold text-stone-900 text-right">
                    1.5 ATA (software-limited)
                  </span>
                  <span>CO₂ Level (internal)</span>
                  <span className="font-semibold text-stone-900 text-right">&lt;1,800 ppm</span>
                  <span>Noise Level</span>
                  <span className="font-semibold text-stone-900 text-right">&lt;38 dB</span>
                  <span>Compressors</span>
                  <span className="font-semibold text-stone-900 text-right">2 × 140 L/min</span>
                  <span>Air Filtration</span>
                  <span className="font-semibold text-stone-900 text-right">
                    2 stages: 0.05 µm + 0.01 µm
                  </span>
                  <span>O₂ Concentrator</span>
                  <span className="font-semibold text-stone-900 text-right">
                    Airsep (96% @ 10 L/min)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/70">
                <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                  Systems
                </p>
                <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 text-stone-600">
                  <span>Session Duration</span>
                  <span className="font-semibold text-stone-900 text-right">30 – 600 min</span>
                  <span>Safety Systems</span>
                  <span className="font-semibold text-stone-900 text-right">5 independent</span>
                  <span>Control Interface</span>
                  <span className="font-semibold text-stone-900 text-right">Dual touchscreens</span>
                  <span>Smart Protocols</span>
                  <span className="font-semibold text-stone-900 text-right">4 preset programs</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/70">
                <p className="font-mono text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
                  Commercial
                </p>
                <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 text-stone-600">
                  <span>Warranty</span>
                  <span className="font-semibold text-stone-900 text-right">
                    2 years (ext. to 5)
                  </span>
                  <span>Origin</span>
                  <span className="font-semibold text-stone-900 text-right">EU (Romania)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Compare Card */}
          <div className="relative h-full">
            {/* Eucalyptus leaves peeking behind the right edge */}
            <div className="absolute -right-6 top-0 bottom-0 w-24 pointer-events-none z-0 hidden xl:block opacity-90">
              <Image
                src="/images/chambers/hbot-redesign/leaf-decoration.png"
                alt=""
                aria-hidden="true"
                fill
                className="object-contain object-right"
              />
            </div>

            <div className="relative z-10 rounded-[2rem] border border-stone-300/80 bg-[#FAF7F2] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="border-b border-stone-200/80 pb-3">
                  <h3 className="editorial-card font-serif text-lg text-stone-900 font-normal">
                    Compare
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">vs. OxyLife I / 80</p>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-stone-300/80 pb-1.5 text-[11px] text-stone-700 font-mono font-bold">
                    <span className="w-16"></span>
                    <div className="flex items-center gap-3 pr-1">
                      <span className="text-stone-400 font-normal">+</span>
                      <span className="text-stone-900">I / 80</span>
                      <span className="text-stone-500 text-[9px]">▸</span>
                      <span className="text-stone-900">I / 90</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-stone-800 py-0.5">
                    <span className="font-medium text-stone-600">Diameter</span>
                    <div className="flex items-center gap-8 pr-1 font-mono">
                      <span className="w-12 text-center text-stone-700 font-normal">80 cm</span>
                      <span className="w-12 text-right font-bold text-stone-950">90 cm</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-stone-800 py-0.5">
                    <span className="font-medium text-stone-600">Volume</span>
                    <div className="flex items-center gap-8 pr-1 font-mono">
                      <span className="w-12 text-center text-stone-700 font-normal">1,156 L</span>
                      <span className="w-12 text-right font-bold text-stone-950">1,463 L</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-stone-800 py-0.5">
                    <span className="font-medium text-stone-600">Weight</span>
                    <div className="flex items-center gap-8 pr-1 font-mono">
                      <span className="w-12 text-center text-stone-700 font-normal">95 kg</span>
                      <span className="w-12 text-right font-bold text-stone-950">105 kg</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-stone-800 py-0.5">
                    <span className="font-medium text-stone-600">Comfort</span>
                    <div className="flex items-center gap-8 pr-1">
                      <span className="w-12 text-center text-stone-700 font-normal">Standard</span>
                      <span className="w-12 text-right font-bold text-stone-950">+10 cm</span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-stone-600 font-medium leading-relaxed">
                  More space. Same SMART features.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCompareModal(true)}
                className="mt-6 w-full rounded-full border border-stone-300 bg-white py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View full comparison</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTIONS 04, 05, 06: FUNCTIONAL TRIAD GRID (UNIFIED 3 COLUMNS) ─ */}
      <section
        id="benefits"
        aria-labelledby="functional-triad-title"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-b border-stone-200/80"
      >
        <h2 id="functional-triad-title" className="sr-only">
          HBOT Protocol, Suitability, and Complete Setup
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-stone-200/80 items-start">
          {/* Column 1 (Section 04: The session protocol) */}
          <div id="session-protocol" className="pt-2 lg:pt-0 pr-0 lg:pr-6">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-stone-500">
              04 · HOW TO USE IT
            </p>
            <h3 className="editorial-card font-serif text-stone-900 text-xl mt-2 font-normal">
              The session protocol.
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Total session time: 70 min · Optimal timing: afternoon
            </p>

            {/* 3 Horizontal Steps with Arrow Line */}
            <div className="mt-8 relative">
              <div className="relative z-10 grid grid-cols-3 gap-2 text-left">
                {/* Step 1 */}
                <div className="relative">
                  {/* Line from 1 to 2 */}
                  <div className="absolute top-4 left-[38px] right-[-10px] h-px flex items-center z-0 pointer-events-none" aria-hidden="true">
                    <div className="h-px bg-stone-300 flex-1" />
                    <span className="text-stone-400 text-[9px] leading-none ml-[-2px]">▸</span>
                  </div>

                  <div className="relative z-10 h-9 w-9 rounded-full overflow-hidden border border-stone-300/80 bg-[#EFE9DF] flex items-center justify-center shadow-xs">
                    <Image
                      src="/images/chambers/hbot-redesign/step-1-circle.png"
                      alt=""
                      aria-hidden="true"
                      width={34}
                      height={34}
                      className="object-cover"
                    />
                  </div>
                  <span className="block font-mono text-xs font-bold text-stone-900 mt-2.5">
                    1
                  </span>
                  <h4 className="text-xs font-bold text-stone-900 mt-0.5">
                    Acclimatise
                  </h4>
                  <p className="text-[11px] text-stone-500">5 min</p>
                  <p className="mt-1 text-[11px] leading-snug text-stone-600">
                    Gentle compression to 1.3 ATA.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  {/* Line from 2 to 3 */}
                  <div className="absolute top-4 left-[38px] right-[-10px] h-px flex items-center z-0 pointer-events-none" aria-hidden="true">
                    <div className="h-px bg-stone-300 flex-1" />
                    <span className="text-stone-400 text-[9px] leading-none ml-[-2px]">▸</span>
                  </div>

                  <div className="relative z-10 h-9 w-9 rounded-full overflow-hidden border border-stone-300/80 bg-[#EFE9DF] flex items-center justify-center shadow-xs">
                    <Image
                      src="/images/chambers/hbot-redesign/step-2-circle.png"
                      alt=""
                      aria-hidden="true"
                      width={34}
                      height={34}
                      className="object-cover"
                    />
                  </div>
                  <span className="block font-mono text-xs font-bold text-stone-900 mt-2.5">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-stone-900 mt-0.5">
                    Immerse
                  </h4>
                  <p className="text-[11px] text-stone-500">60 min</p>
                  <p className="mt-1 text-[11px] leading-snug text-stone-600">
                    Relax, meditate, or read.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="relative z-10 h-9 w-9 rounded-full overflow-hidden border border-stone-300/80 bg-[#EFE9DF] flex items-center justify-center shadow-xs">
                    <Image
                      src="/images/chambers/hbot-redesign/step-3-circle.png"
                      alt=""
                      aria-hidden="true"
                      width={34}
                      height={34}
                      className="object-cover"
                    />
                  </div>
                  <span className="block font-mono text-xs font-bold text-stone-900 mt-2.5">
                    3
                  </span>
                  <h4 className="text-xs font-bold text-stone-900 mt-0.5">
                    Integrate
                  </h4>
                  <p className="text-[11px] text-stone-500">5–10 min</p>
                  <p className="mt-1 text-[11px] leading-snug text-stone-600">
                    Gradual decompression. Hydrate after.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 (Section 05: Fit & planning) */}
          <div className="pt-8 lg:pt-0 px-0 lg:px-6">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-stone-500">
              05 · FIT & PLANNING
            </p>
            <h3 className="editorial-card font-serif text-stone-900 text-xl mt-2 font-normal">
              Where it may fit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_0.8fr] gap-4 mt-6 items-start">
              {/* Sliders on Left */}
              <div>
                <div className="space-y-2">
                  {[
                    { label: 'Recovery', score: 95, icon: Activity },
                    { label: 'Focus', score: 90, icon: Target },
                    { label: 'Device Fit', score: 85, icon: Sliders },
                    { label: 'Comfort', score: 70, icon: Heart },
                    { label: 'Daily Wellness', score: 90, icon: Shield },
                  ].map((gauge) => {
                    const Icon = gauge.icon;
                    return (
                      <div key={gauge.label} className="flex items-center justify-between text-xs py-0.5">
                        <span className="flex items-center gap-1.5 text-stone-700 font-medium w-24 shrink-0 text-[11px]">
                          <Icon size={12} className="text-stone-400" />
                          {gauge.label}
                        </span>
                        <div className="flex-1 mx-2 flex items-center">
                          <div className="h-0.5 bg-stone-800 rounded-full" style={{ width: `${gauge.score}%` }} />
                          <span className="text-stone-700 text-[10px] leading-none ml-[-1px]">▸</span>
                          <div className="h-px bg-stone-200 flex-1" />
                        </div>
                        <span className="font-mono font-bold text-stone-900 text-xs w-5 text-right">
                          {gauge.score}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Horizontal divider between sliders and pills */}
                <div className="my-4 border-t border-stone-200/80" />

                {/* Guide Pills with Icons */}
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    href="/conditions/recovery"
                    className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-800 hover:bg-stone-50 transition-colors"
                  >
                    <FileText size={11} className="text-stone-500" />
                    <span>Recovery Guide</span>
                  </Link>
                  <Link
                    href="/conditions/sleep"
                    className="inline-flex items-center gap-1 rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-800 hover:bg-stone-50 transition-colors"
                  >
                    <Moon size={11} className="text-stone-500" />
                    <span>Sleep Guide</span>
                  </Link>
                </div>

                <div className="mt-3.5">
                  <Link
                    href="/protocols"
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
                  >
                    <span>View all conditions & protocols</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {/* Pairs Well With on Right */}
              <div className="border-l border-stone-200/80 pl-4 sm:pl-5">
                <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold mb-2.5">
                  Pairs well with
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/product/hydrogen"
                    className="group flex flex-col items-center text-center p-1.5 rounded-xl border border-stone-200 bg-white hover:border-stone-400 transition-colors"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-stone-100">
                      <Image
                        src="/images/chambers/hbot-redesign/pairs-h2.png"
                        alt=""
                        aria-hidden="true"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="block text-[10px] font-bold text-stone-900 mt-1.5 group-hover:underline">
                      Hydrogen (H2)
                    </span>
                  </Link>

                  <Link
                    href="/product/pemf"
                    className="group flex flex-col items-center text-center p-1.5 rounded-xl border border-stone-200 bg-white hover:border-stone-400 transition-colors"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-stone-100">
                      <Image
                        src="/images/chambers/hbot-redesign/pairs-pemf.png"
                        alt=""
                        aria-hidden="true"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="block text-[10px] font-bold text-stone-900 mt-1.5 group-hover:underline">
                      PEMF
                    </span>
                  </Link>
                </div>

                <div className="mt-4">
                  <Link
                    href="/store"
                    className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
                  >
                    <span>Compare devices</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 (Section 06: Accessories & packages) */}
          <div className="pt-8 lg:pt-0 pl-0 lg:pl-6">
            <p className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-stone-500">
              06 · ACCESSORIES & PACKAGES
            </p>
            <h3 className="editorial-card font-serif text-stone-900 text-xl mt-2 font-normal">
              Complete your setup.
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Premium accessories and support packages.
            </p>

            {/* 3 Accessory Cards Side-by-Side */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-stone-200/80 p-2.5 flex flex-col items-center text-center bg-[#FAF7F2] shadow-xs">
                <div className="relative h-11 w-full max-w-[55px] overflow-hidden">
                  <Image
                    src="/images/chambers/hbot-redesign/acc-cooling.png"
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-[10px] font-medium text-stone-800 mt-1.5 leading-tight break-words">
                  Air Cooling System
                </h4>
                <span className="font-mono text-[11px] font-bold text-stone-900 mt-1">
                  +{priceOfAddon('hbot-chiller')}
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200/80 p-2.5 flex flex-col items-center text-center bg-[#FAF7F2] shadow-xs">
                <div className="relative h-11 w-full max-w-[55px] overflow-hidden">
                  <Image
                    src="/images/chambers/hbot-redesign/acc-concentrator.png"
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-[10px] font-medium text-stone-800 mt-1.5 leading-tight break-words">
                  10L Oxygen Concentrator
                </h4>
                <span className="font-mono text-[11px] font-bold text-stone-900 mt-1">
                  +{priceOfAddon('hbot-concentrator')}
                </span>
              </div>

              <div className="rounded-2xl border border-stone-200/80 p-2.5 flex flex-col items-center text-center bg-[#FAF7F2] shadow-xs">
                <div className="relative h-11 w-full max-w-[55px] overflow-hidden">
                  <Image
                    src="/images/chambers/hbot-redesign/acc-frame.png"
                    alt=""
                    aria-hidden="true"
                    fill
                    className="object-contain"
                  />
                </div>
                <h4 className="text-[10px] font-medium text-stone-800 mt-1.5 leading-tight break-words">
                  Premium Frame System
                </h4>
                <span className="font-mono text-[11px] font-bold text-stone-900 mt-1">
                  +{priceOfAddon('hbot-frame')}
                </span>
              </div>
            </div>

            {/* Support Packages Table */}
            <div className="mt-6 pt-4 border-t border-stone-200/80">
              <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold mb-2">
                Support packages
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="font-medium text-stone-800">Essential Start</span>
                  <Link
                    href="/contact?tech=hbot&package=essential"
                    className="text-stone-600 hover:text-stone-950 inline-flex items-center gap-1 font-mono text-[11px] font-medium"
                  >
                    Manual quote →
                  </Link>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-stone-100">
                  <span className="font-medium text-stone-800">Pro Protocol</span>
                  <Link
                    href="/contact?tech=hbot&package=pro"
                    className="text-stone-600 hover:text-stone-950 inline-flex items-center gap-1 font-mono text-[11px] font-medium"
                  >
                    Support review →
                  </Link>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-medium text-stone-800">Clinic Edition</span>
                  <Link
                    href="/contact?tech=hbot&package=clinic"
                    className="text-stone-600 hover:text-stone-950 inline-flex items-center gap-1 font-mono text-[11px] font-medium"
                  >
                    Manual terms →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative border border-stone-300 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-300 transition-colors z-10 cursor-pointer"
              aria-label="Close comparison"
            >
              ✕
            </button>
            <ChamberCompare5
              chambers={[selectedChamber, OXYLIFE_I_80]}
              onRemove={() => setShowCompareModal(false)}
              onClear={() => setShowCompareModal(false)}
              onNavigate={(slug) => {
                setSelectedSlug(slug);
                setShowCompareModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
