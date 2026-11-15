import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  Activity,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Atom,
} from 'lucide-react';

export const metadata: Metadata = createPageMetadata({
  title: 'Narzędzia Bio-Optymalizacji & Fizjologii Hiperbarycznej | Hylono',
  description: 'Zestaw interaktywnych narzędzi klinicznych, kalkulatorów pO2 i modeli rentowności dla użytkowników komór hiperbarycznych Hylono.',
  path: '/tools',
  forceNoIndex: true,
});

// [DECISION: /tools stays noindex,follow because the hub is an interactive utility surface whose mounted calculators duplicate canonical product/research guidance.]
// Rendering strategy: server-rendered utility hub shell with calculation and evidence interactions isolated in client leaves.

const TOOLS = [
  {
    href: '/tools/calculator',
    title: 'Kalkulator Protokołów & Prawa Henry\'ego',
    subtitle: 'Fizjologia Hiperbaryczna',
    description: 'Precyzyjne wyliczenie rozpuszczalności tlenu w osoczu krwi (pO2 w mmHg) i parametrów komórkowych dla ciśnień 1.3 - 2.0 ATA.',
    badge: 'Fizjologia Kliniczna',
    icon: Activity,
    accent: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    border: 'border-emerald-500/40',
    textAccent: 'text-emerald-400'
  },
  {
    href: '/tools/evidence',
    title: 'Matryca Badań Klinicznych (EBM Index)',
    subtitle: 'Dowody Naukowe PubMed',
    description: 'Zbiór recenzowanych badań klinicznych (RCT): wydłużenie telomerów o 20% (Efrati 2020), neurogeneza w udarach i urazach TBI.',
    badge: 'Medycyna Oparta na Dowodach',
    icon: BookOpen,
    accent: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    border: 'border-cyan-500/40',
    textAccent: 'text-cyan-400'
  },
  {
    href: '/tools/safety',
    title: 'Kwalifikator Bezpieczeństwa & Przegląd Przeciwwskazań',
    subtitle: 'Ocena Gotowości',
    description: 'Ustrukturyzowany pięcioetapowy przegląd czynników bezpieczeństwa przed rezerwacją konsultacji lub sesji 1.3 - 2.0 ATA.',
    badge: 'Przegląd Bezpieczeństwa',
    icon: ShieldCheck,
    accent: 'from-amber-500/20 via-amber-500/5 to-transparent',
    border: 'border-amber-500/40',
    textAccent: 'text-amber-400'
  },
  {
    href: '/tools/roi',
    title: 'Kalkulator Rentowności & Finansowania',
    subtitle: 'B2B Fleet & Leasing',
    description: 'Biznesplan wdrożenia komory dla gabinetów i klinik: kalkulacja przychodu, zysku netto i progu rentowności (Break-even).',
    badge: 'Ekonomia Inwestycji',
    icon: TrendingUp,
    accent: 'from-blue-500/20 via-blue-500/5 to-transparent',
    border: 'border-blue-500/40',
    textAccent: 'text-blue-400'
  }
];

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Atom className="w-3.5 h-3.5" />
            <span>Pakiet Narzędzi Klinicznych & B2B</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
            Inżynieria Tlenowa & Narzędzia Analityczne
          </h1>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
            Niezbędnik pacjenta, biohakera i operatora klinicznego. Przejdź od teorii do twardych liczb, fizjologii i dowodów medycznych.
          </p>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`group flex flex-col justify-between p-6 rounded-3xl bg-zinc-950 border ${tool.border} hover:border-zinc-500 transition-all duration-300 relative overflow-hidden shadow-xl`}
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${tool.accent} opacity-40 pointer-events-none`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                      <Icon className={`w-6 h-6 ${tool.textAccent}`} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-300">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${tool.textAccent}`}>
                      {tool.subtitle}
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1 group-hover:text-zinc-100 transition-colors">
                      {tool.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  <span>Uruchom Narzędzie</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
