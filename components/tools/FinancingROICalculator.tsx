'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Building2,
  Home,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { priceBookText } from '@/lib/money';
import { productById } from '@/content/products';

export type CustomerSegment = 'clinic' | 'home';
export type FinancingType = 'lease' | 'purchase';

/**
 * Every device figure below is read from the published price book.
 *
 * The monthly lease cost used to be a hardcoded 4900 "Turnkey B2B commercial lease
 * package" and the purchase figure a hardcoded 119000 PLN. Neither appears in
 * content/products.ts, neither matches any rental plan (1499/1299/1099 or
 * 199/179/159), and a payback figure derived from them was a commercial commitment
 * published outside the approved price book. Both now come from the catalogue.
 */
const hbotCatalogue = productById['hbot-st1700'];
const hbotRentalPlans = hbotCatalogue?.rentalPlans ?? [];
if (!hbotCatalogue || hbotRentalPlans.length === 0) {
  throw new Error(
    'FinancingROICalculator: content/products.ts must publish the hbot-st1700 record with rental plans. ' +
      'This calculator derives its device figures from the catalogue and will not fall back to an estimate.',
  );
}
const publishedRentalMonthlyPln = Math.min(
  ...hbotRentalPlans.map((plan) => plan.monthlyPrice)
);
const publishedPurchasePln = hbotCatalogue.purchasePrice;

export const FinancingROICalculator: React.FC = () => {
  const [segment, setSegment] = useState<CustomerSegment>('clinic');
  const [sessionsPerDay, setSessionsPerDay] = useState<number>(4);
  const [pricePerSessionPln, setPricePerSessionPln] = useState<number>(250);
  const [operatingDaysPerMonth, setOperatingDaysPerMonth] = useState<number>(22);
  const [financingType, setFinancingType] = useState<FinancingType>('lease');
  const [leadEmail, setLeadEmail] = useState<string>('');

  // Financial Calculations
  const calculations = useMemo(() => {
    const totalSessionsMonth = sessionsPerDay * operatingDaysPerMonth;
    const grossRevenueMonthly = totalSessionsMonth * pricePerSessionPln;
    const grossRevenueYearly = grossRevenueMonthly * 12;

    // Monthly equipment cost, taken from the published rental plan.
    const monthlyEquipmentCost =
      financingType === 'lease' ? publishedRentalMonthlyPln : 0;

    // Purchase model has no monthly rental charge; the capital outlay is the
    // published catalogue purchase price and is deliberately NOT turned into a
    // payback-months commitment anywhere on this page.
    const upfrontCapitalPln =
      financingType === 'purchase' ? publishedPurchasePln : 0;

    // Model assumption, stated as an assumption: electricity, cannula/mask
    // consumables and a staff buffer per session.
    const consumablePerSession = 25;
    const monthlyConsumablesCost = totalSessionsMonth * consumablePerSession;

    const totalMonthlyCost = monthlyEquipmentCost + monthlyConsumablesCost;
    const netProfitMonthly = Math.max(0, grossRevenueMonthly - totalMonthlyCost);
    const netProfitYearly = netProfitMonthly * 12;

    // Sessions needed to cover one published rental month at the entered session
    // price. This is arithmetic on the price book, not a payback promise.
    const contributionPerSession = pricePerSessionPln - consumablePerSession;
    const breakEvenSessionsPerMonth = Math.ceil(
      publishedRentalMonthlyPln / (contributionPerSession || 1)
    );

    return {
      totalSessionsMonth,
      grossRevenueMonthly,
      grossRevenueYearly,
      monthlyEquipmentCost,
      monthlyConsumablesCost,
      totalMonthlyCost,
      netProfitMonthly,
      netProfitYearly,
      upfrontCapitalPln,
      breakEvenSessionsPerMonth
    };
  }, [sessionsPerDay, pricePerSessionPln, operatingDaysPerMonth, financingType]);

  /**
   * No delivery is simulated.
   *
   * The previous handler only flipped local state and then rendered "Model
   * przesłany na adres e-mail!" — no request, no storage, no e-mail, and no file
   * behind the promised spreadsheet. Rather than fake a fulfilment, the submit
   * hands the visitor to the real, consented contact path where a request
   * actually reaches the team.
   */
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;
    window.location.assign('/contact');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-8 bg-zinc-950 border border-zinc-800 rounded-3xl text-zinc-100 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Ekonomia Inwestycji · B2B Fleet & Home ROI</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Kalkulator Rentowności i Finansowania HBOT
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Prognoza przychodów i marży operacyjnej przy stawkach z cennika Hylono i wartościach wejściowych, które sam ustawiasz.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/60 px-4 py-2 rounded-xl text-xs">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-zinc-300">Stawka urządzenia z cennika Hylono (PLN); pozostałe wartości to założenia własne</span>
        </div>
      </div>

      {/* Segment Switcher */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => setSegment('clinic')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
            segment === 'clinic'
              ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>Dla Gabinetu, Kliniki lub Centrum Medycznego</span>
        </button>
        <button
          onClick={() => setSegment('home')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${
            segment === 'home'
              ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span>Dla Rezydencji i Użytkownika Prywatnego</span>
        </button>
      </div>

      {/* Inputs Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800/80">
        {/* Sessions per day */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Zabiegów dziennie</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{sessionsPerDay} sesji/dzień</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={sessionsPerDay}
            onChange={(e) => setSessionsPerDay(parseInt(e.target.value))}
            className="w-full accent-emerald-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
            <span>1 (Kameralny)</span>
            <span>5 (Średni)</span>
            <span>10 (Pełne obłożenie)</span>
          </div>
        </div>

        {/* Price per session */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Cena 1 zabiegu</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{priceBookText(pricePerSessionPln)}</span>
          </div>
          <input
            type="range"
            min="120"
            max="450"
            step="10"
            value={pricePerSessionPln}
            onChange={(e) => setPricePerSessionPln(parseInt(e.target.value))}
            className="w-full accent-cyan-400 bg-zinc-800 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
            <span>120 PLN (1.3 ATA)</span>
            <span>250 PLN (Średnia)</span>
            <span>450 PLN (Wysoki zakres)</span>
          </div>
        </div>

        {/* Financing Model */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Model Rozliczenia</span>
            <span className="text-sm font-semibold text-white">
              {financingType === 'lease' ? 'Wynajem B2B (Leasing)' : 'Zakup na Własność'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => setFinancingType('lease')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                financingType === 'lease'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              Leasing B2B
            </button>
            <button
              onClick={() => setFinancingType('purchase')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                financingType === 'purchase'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              Zakup (CAPEX)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
          <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Miesięczny Przychód</div>
          <div className="text-2xl font-bold text-white font-mono">
            {calculations.grossRevenueMonthly.toLocaleString('pl-PL')} <span className="text-xs text-zinc-400 font-normal">PLN</span>
          </div>
          <div className="text-xs text-zinc-500 mt-1">Przy {calculations.totalSessionsMonth} sesjach/msc</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl">
          <div className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Koszty Operacyjne</div>
          <div className="text-2xl font-bold text-zinc-300 font-mono">
            {calculations.totalMonthlyCost.toLocaleString('pl-PL')} <span className="text-xs text-zinc-400 font-normal">PLN</span>
          </div>
          <div className="text-xs text-zinc-500 mt-1">Rata + materiały eksploatacyjne</div>
        </div>

        <div className="bg-emerald-950/30 border border-emerald-500/30 p-5 rounded-2xl">
          <div className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-1">Czysty Zysk Miesięcznie</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            +{calculations.netProfitMonthly.toLocaleString('pl-PL')} <span className="text-xs text-emerald-300 font-normal">PLN</span>
          </div>
          <div className="text-xs text-emerald-500 mt-1">
            Rocznie: +{priceBookText(calculations.netProfitYearly)}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/30 border border-emerald-500/40 p-5 rounded-2xl">
          <div className="text-zinc-300 text-xs font-medium uppercase tracking-wider mb-1">
            {financingType === 'lease' ? 'Sesje na jedną ratę cennika' : 'Nakład kapitałowy z cennika'}
          </div>
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-mono">
            {financingType === 'lease'
              ? `${calculations.breakEvenSessionsPerMonth} sesji/msc`
              : priceBookText(calculations.upfrontCapitalPln)}
          </div>
          <div className="text-xs text-emerald-300/80 mt-1">
            {financingType === 'lease'
              ? `Aby pokryć ${priceBookText(publishedRentalMonthlyPln)} z cennika`
              : 'Nie publikujemy czasu zwrotu z zakupu'}
          </div>
        </div>
      </div>

      {/* Request-for-contact path — nothing is generated or emailed automatically */}
      <div className="mt-8 bg-zinc-900/70 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-white text-base">
                Zapytaj o wyliczenie dla Twojej lokalizacji
              </h3>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              Ten kalkulator nie generuje arkusza ani pliku do pobrania — nic nie jest wysyłane na e-mail automatycznie. Wpisz adres, a zespół Hylono przygotuje wyliczenie dla Twoich warunków i odpowie w godzinach wsparcia.
            </p>
          </div>

          <form onSubmit={handleLeadSubmit} className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              required
              placeholder="Wpisz firmowy e-mail..."
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-200 placeholder-zinc-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500 w-64"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-semibold text-xs hover:bg-emerald-400 transition-colors whitespace-nowrap"
            >
              Przejdź do kontaktu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FinancingROICalculator;
