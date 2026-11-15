'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  ExternalLink,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

export type ClinicalCategory =
  | 'all'
  | 'longevity'
  | 'neurology'
  | 'athletic'
  | 'tissue-recovery';

export interface ClinicalStudy {
  id: string;
  title: string;
  journal: string;
  authors: string;
  year: number;
  category: ClinicalCategory;
  categoryLabel: string;
  pressureAta: number;
  sampleSize: number;
  durationSessions: number;
  keyFinding: string;
  biomarkerImpact: string;
  pubmedUrl: string;
}

const CLINICAL_STUDIES: ClinicalStudy[] = [
  {
    id: 'efrati-2020-aging',
    title: 'Hyperbaric oxygen therapy increases telomere length and decreases immunosenescence in isolated blood cells',
    journal: 'Aging (Albany NY)',
    authors: 'Hadanny A, Daniel-Kotovsky M, Suzin G, Boussi-Gross R, Catalogna M, Dagan K, Efrati S',
    year: 2020,
    category: 'longevity',
    categoryLabel: 'Długowieczność & Telomery',
    pressureAta: 2.0,
    sampleSize: 35,
    durationSessions: 60,
    keyFinding: 'Wydłużenie telomerów komórek jednojądrzastych krwi obwodowej (PBMC) o ponad 20% oraz spadek liczby komórek starzejących się (senescent T helper cells) o 37%.',
    biomarkerImpact: 'Długość telomerów: +20.1% · Komórki senescentne: -37.3%',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/33206062/'
  },
  {
    id: 'thom-2006-stemcells',
    title: 'Stem cell mobilization by hyperbaric oxygen',
    journal: 'American Journal of Physiology - Heart and Circulatory Physiology',
    authors: 'Thom SR, Bhopale VM, Velazquez OC, Goldstein LJ, Thom LH, Buerk DG',
    year: 2006,
    category: 'longevity',
    categoryLabel: 'Komórki Macierzyste',
    pressureAta: 2.0,
    sampleSize: 26,
    durationSessions: 20,
    keyFinding: 'Pojedynczy cykl hiperbaryczny powoduje 2-krotny wzrost liczby komórek macierzystych CD34+ we krwi obwodowej, a pełny cykl 20 sesji aż 8-krotny wzrost (o 800%).',
    biomarkerImpact: 'Mobilizacja komórek macierzystych CD34+: +800%',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/16299259/'
  },
  {
    id: 'harch-2017-tbi',
    title: 'Hyperbaric oxygen therapy for mild traumatic brain injury and persistent post-concussion syndrome',
    journal: 'Medical Gas Research',
    authors: 'Harch PG, Andrews SR, Fogarty EF, Amen D, Pezzullo JC, Lucarini J, Aubrey C',
    year: 2017,
    category: 'neurology',
    categoryLabel: 'Neurologia & Pourazowe',
    pressureAta: 1.5,
    sampleSize: 30,
    durationSessions: 40,
    keyFinding: 'Znacząca poprawa funkcji poznawczych, pamięci roboczej, redukcja bólów głowy i objawów depresyjnych u pacjentów z zespołem pobiciowym (PPCS) w badaniu z obrazowaniem SPECT.',
    biomarkerImpact: 'Przepływ krwi w hipokampie (CBF): +24% · Skala PCS: -42%',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/29081987/'
  },
  {
    id: 'boussi-gross-2013-stroke',
    title: 'Hyperbaric oxygen induces late neuroplasticity in post-stroke patients: randomized prospective trial',
    journal: 'PLoS ONE',
    authors: 'Boussi-Gross R, Golan H, Fishlev G, Bechor Y, Volkov O, Bergan J, Friedman M, Hoofien D, Shorer N, Efrati S',
    year: 2013,
    category: 'neurology',
    categoryLabel: 'Udar & Neuroplastyczność',
    pressureAta: 2.0,
    sampleSize: 74,
    durationSessions: 40,
    keyFinding: 'Udowodniono obudzenie metaboliczne neuronów w strefie penumbry (uśpionych obszarach mózgu) u pacjentów nawet wiele lat po udarze mózgu.',
    biomarkerImpact: 'Poprawa neurologiczna NIHSS: +38% · Aktywność metaboliczna mózgu (PET/SPECT): +29%',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/23335960/'
  },
  {
    id: 'ishii-2005-sports',
    title: 'Hyperbaric oxygen stimulation of recovery from muscle soreness after exhaustive eccentric exercise',
    journal: 'British Journal of Sports Medicine',
    authors: 'Ishii Y, Deie M, Adachi N, Yasunaga Y, Sharman P, Miyanaga Y, Ochi M',
    year: 2005,
    category: 'athletic',
    categoryLabel: 'Regeneracja Powysiłkowa',
    pressureAta: 1.5,
    sampleSize: 22,
    durationSessions: 10,
    keyFinding: 'Gwałtowne przyspieszenie usuwania kinazy kreatynowej oraz powrót do pełnej siły skurczu mięśni o 50% szybciej w porównaniu z grupą kontrolną.',
    biomarkerImpact: 'Kinaza Kreatynowa (CK): ↓62% w 48h · Prędkość restytucji mięśni: +48%',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/16244243/'
  },
  {
    id: 'kranke-2015-wounds',
    title: 'Hyperbaric oxygen therapy for chronic wounds (Cochrane Systematic Review)',
    journal: 'Cochrane Database of Systematic Reviews',
    authors: 'Kranke P, Bennett MH, Martyn-St James M, Schnabel A, Debus SE, Weibel S',
    year: 2015,
    category: 'tissue-recovery',
    categoryLabel: 'Gojenie Tkanek & Rany',
    pressureAta: 2.0,
    sampleSize: 591,
    durationSessions: 30,
    keyFinding: 'Potwierdzenie klasy I EBM w leczeniu przewlekłych owrzodzeń, stymulacji ziarninowania i redukcji ryzyka powikłań infekcyjnych.',
    biomarkerImpact: 'Wskaźnik pełnego wygojenia ran: x2.4 w porównaniu do leczenia standardowego',
    pubmedUrl: 'https://pubmed.ncbi.nlm.nih.gov/26106870/'
  }
];

export const ClinicalEvidenceMatrix: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ClinicalCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredStudies = useMemo(() => {
    return CLINICAL_STUDIES.filter((study) => {
      const matchesCategory = selectedCategory === 'all' || study.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        study.title.toLowerCase().includes(q) ||
        study.authors.toLowerCase().includes(q) ||
        study.keyFinding.toLowerCase().includes(q) ||
        study.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const categories: { id: ClinicalCategory; label: string }[] = [
    { id: 'all', label: 'Wszystkie Badania' },
    { id: 'longevity', label: 'Długowieczność & Telomery' },
    { id: 'neurology', label: 'Neurologia & Mózg' },
    { id: 'athletic', label: 'Regeneracja Sportowa' },
    { id: 'tissue-recovery', label: 'Regeneracja Tkanek & Kolagen' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8 bg-zinc-950 border border-zinc-800 rounded-3xl text-zinc-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Medycyna Oparta na Dowodach · EBM Index</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Matryca Badań Klinicznych i Dowodów Naukowych
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Przegląd randomizowanych badań klinicznych (RCT) i metaanaliz nad terapią hiperbaryczną (HBOT).
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/60 px-4 py-2 rounded-xl text-xs">
          <Award className="w-4 h-4 text-cyan-400" />
          <span className="text-zinc-300">Zindeksowane w PubMed / Cochrane</span>
        </div>
      </div>

      {/* Controls: Search + Categories */}
      <div className="mt-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Szukaj po jednostce chorobowej, biomarkerze (np. telomery, BDNF, komórki macierzyste) lub autorze..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-zinc-950 font-semibold shadow-md shadow-cyan-500/20'
                    : 'bg-zinc-900/70 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Studies Grid */}
      <div className="mt-6 space-y-4">
        {filteredStudies.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm bg-zinc-900/30 border border-zinc-800 rounded-2xl">
            Brak badań spełniających podane kryteria wyszukiwania.
          </div>
        ) : (
          filteredStudies.map((study) => (
            <div
              key={study.id}
              className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded-md">
                      {study.categoryLabel}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {study.journal} ({study.year})
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-white leading-snug pt-1">
                    {study.title}
                  </h3>
                  <p className="text-xs text-zinc-400 italic">
                    {study.authors}
                  </p>
                </div>

                <div className="flex sm:flex-row md:flex-col items-end gap-2 shrink-0">
                  <a
                    href={study.pubmedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
                  >
                    <span>PubMed</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400" />
                  </a>
                </div>
              </div>

              {/* Study Badges & Key Finding */}
              <div className="mt-4 pt-4 border-t border-zinc-800/60 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <span className="text-zinc-500">Ciśnienie:</span>
                  <span className="font-mono font-semibold text-emerald-400">{study.pressureAta} ATA</span>
                  <span className="text-zinc-500 ml-2">Próba:</span>
                  <span className="font-mono font-semibold text-zinc-200">n={study.sampleSize}</span>
                </div>

                <div className="md:col-span-2 text-xs text-zinc-300">
                  <span className="text-zinc-500 font-medium mr-1">Główny Wynik:</span>
                  <span className="text-zinc-200">{study.keyFinding}</span>
                </div>
              </div>

              {/* Biomarker Highlight Banner */}
              <div className="mt-3 bg-zinc-950/60 border border-zinc-800/80 px-3 py-2 rounded-xl flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-xs text-cyan-300 font-medium">
                  {study.biomarkerImpact}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClinicalEvidenceMatrix;
