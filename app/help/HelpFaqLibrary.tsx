'use client';

import React, { useState, useId } from 'react';
import Image from 'next/image';
import { Search, ChevronRight, ChevronDown, ArrowRight } from 'lucide-react';
import { HELP_FAQ_DATA } from '@/content/help-faq';
import { SmartText } from '@/components/SmartText';

interface HelpFaqLibraryProps {
  onOpenContact?: () => void;
}

export function HelpFaqLibrary({ onOpenContact }: HelpFaqLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const searchInputId = useId();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCategories = HELP_FAQ_DATA.map((cat) => {
    const isCategorySelected = !selectedCategory || cat.category === selectedCategory;
    const items = cat.items.filter((item) => {
      if (!isCategorySelected) return false;
      if (!normalizedQuery) return true;
      return (
        item.q.toLowerCase().includes(normalizedQuery) ||
        item.a.toLowerCase().includes(normalizedQuery)
      );
    });
    return { ...cat, items };
  }).filter((cat) => cat.items.length > 0);

  const totalFilteredCount = filteredCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCategoryClick = (catName: string) => {
    if (selectedCategory === catName) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(catName);
    }
  };

  return (
    <section className="border-t border-slate-200/80 bg-[#F8F9FA] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Column 1: Search Form (approx 4.5 cols) */}
          <div className="lg:col-span-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
              FAQ
            </p>
            <h2
              className="font-editorial mt-2 text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl"
              style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
            >
              Search the FAQ library
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Find public support answers before opening a contact request.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-6"
              role="search"
            >
              <div className="relative flex items-center">
                <Search
                  className="pointer-events-none absolute left-4 text-slate-400"
                  size={18}
                  aria-hidden="true"
                />
                <input
                  id={searchInputId}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQ questions..."
                  className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-xs"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white transition hover:bg-slate-800"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>

            <p className="mt-3 text-xs text-slate-500">
              {searchQuery.trim()
                ? `${totalFilteredCount} public FAQ answer${totalFilteredCount === 1 ? '' : 's'} match your search.`
                : '16 public FAQ answers are ready to search.'}
            </p>
          </div>

          {/* Column 2: Category Selectors (approx 4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
              {HELP_FAQ_DATA.map((cat) => {
                const isSelected = selectedCategory === cat.category;
                return (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => handleCategoryClick(cat.category)}
                    className={`flex w-full items-center justify-between px-6 py-4.5 text-left text-sm font-medium transition ${
                      isSelected
                        ? 'bg-slate-50 text-slate-950 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50/70 hover:text-slate-950'
                    }`}
                  >
                    <span>{cat.category}</span>
                    <span className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{cat.items.length}</span>
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isSelected ? 'rotate-90 text-slate-900' : ''}`}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="mt-3 self-start text-xs font-medium text-slate-500 hover:text-slate-900 underline"
              >
                Reset category filter
              </button>
            )}
          </div>

          {/* Column 3: Tailored Answer Promo Card (approx 3.5 cols) */}
          <div className="lg:col-span-4">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/60 p-7 shadow-xs">
              <div>
                <div className="relative mb-5 h-28 w-full overflow-hidden rounded-xl bg-slate-100/50">
                  <Image
                    src="/images/help/faq-torus.png"
                    alt="Abstract fluid ring sculpture"
                    fill
                    className="object-contain object-center opacity-90 transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <h3
                  className="font-editorial text-xl font-normal text-slate-900"
                  style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
                >
                  Need a tailored answer?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Use the contact tab for product matching, delivery questions, or support triage.
                </p>
              </div>

              <div className="mt-6">
                <a
                  href="#help-center-tabs"
                  onClick={onOpenContact}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                >
                  <span>Open contact options</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion List (Displays when searching or expanding) */}
        {(searchQuery.trim() !== '' || selectedCategory !== null) && (
          <div className="mt-12 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            <h3
              className="font-editorial text-2xl font-normal text-slate-900"
              style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif', fontWeight: 400 }}
            >
              {selectedCategory ? `${selectedCategory} Answers` : 'Matching Answers'}
            </h3>
            <div className="mt-6 space-y-3">
              {filteredCategories.flatMap((cat) =>
                cat.items.map((item, idx) => {
                  const key = `${cat.category}-${idx}`;
                  const isOpen = !!openItems[key];
                  return (
                    <div
                      key={key}
                      className="overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50 transition hover:bg-slate-50"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(key)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium text-slate-900 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
                      >
                        <span className="pr-4">{item.q}</span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-slate-900' : ''}`}
                        />
                      </button>
                      {isOpen && (
                        <div className="border-t border-slate-200/60 px-6 py-4 text-sm leading-relaxed text-slate-700 bg-white">
                          <SmartText>{item.a}</SmartText>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
