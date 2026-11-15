import type { Metadata } from 'next';
import { Suspense } from 'react';
import { siteEntity } from '@/content/site-entity';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { PolishTrackedLink } from '../_components/PolishTrackedLink';
import { PolishContactForm } from './PolishContactForm';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const description =
  'Polski formularz kontaktowy Hylono dla pytan o HBOT, H2, wynajem, zakup lub wdrozenie profesjonalne.';
const focusClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';

export const metadata: Metadata = createPageMetadata({
  title: 'Kontakt po polsku | Hylono',
  description,
  path: '/pl/contact',
  forceNoIndex: true,
  locale: 'pl_PL',
});

function PolishContactFallback() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-slate-950/20">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
        Formularz kontaktowy
      </p>
      <h2 className="mt-3 text-2xl font-black text-white">Formularz jest wczytywany</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Jezeli formularz sie nie pojawi, napisz bezposrednio na{' '}
        <PolishTrackedLink
          href={`mailto:${siteEntity.contactEmail}`}
          label="Adres email Hylono"
          className={`font-semibold text-white underline decoration-white/20 underline-offset-4 ${focusClass}`}
        >
          {siteEntity.contactEmail}
        </PolishTrackedLink>
        .
      </p>
    </div>
  );
}

// [DECISION: SSG noindex because this is a Polish duplicate contact entry that reuses the existing validated contact dispatch path.]
// Rendering strategy: server-rendered Polish contact context and ownership details with a Suspense-wrapped client form leaf for submission.
export default function PolishContactPage() {
  const webPageSchema = {
    ...createWebPageSchema({
      name: 'Kontakt po polsku',
      description,
      path: '/pl/contact',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    '@type': 'ContactPage',
    inLanguage: 'pl-PL',
    about: { '@id': ORGANIZATION_ID() },
    mainEntity: { '@id': ORGANIZATION_ID() },
    relatedLink: [`${SITE_URL}/pl`, `${SITE_URL}/pl/product/hbot`, `${SITE_URL}/pl/product/hydrogen`],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#pl-contact-headline', '#pl-contact-description'],
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-pl-contact-page" data={webPageSchema} />
        <StructuredData
          id="jsonld-pl-contact-breadcrumb"
          data={{
            ...createBreadcrumbSchema([
              { name: 'Hylono po polsku', path: '/pl' },
              { name: 'Kontakt', path: '/pl/contact' },
            ]),
            inLanguage: 'pl-PL',
          }}
        />
      </Suspense>
      <div className="bg-[#070b12] text-white">
        <section className="border-b border-white/10 bg-slate-950">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:px-8 lg:py-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Kontakt Hylono
              </p>
              <h1
                id="pl-contact-headline"
                className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl"
              >
                Kontakt po polsku dla HBOT, H2 i planowania dostepu
              </h1>
              <p
                id="pl-contact-description"
                className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
              >
                Wyslij zapytanie, gdy chcesz porownac technologie, omowic wynajem, przygotowac
                wdrozenie profesjonalne albo zebrac pytania przed decyzja.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2">
                  Poniedzialek-piatek, 09:00-18:00 CET
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-4 py-2">
                  Obszar wsparcia: Unia Europejska
                </span>
                <PolishTrackedLink
                  href={`mailto:${siteEntity.contactEmail}`}
                  label="Adres email Hylono"
                  className={`rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 font-semibold text-white hover:border-cyan-300/45 ${focusClass}`}
                >
                  {siteEntity.contactEmail}
                </PolishTrackedLink>
              </div>
            </div>
            <aside className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Zakres odpowiedzi
              </p>
              <h2 className="mt-3 text-2xl font-black">Kiedy uzyc formularza</h2>
              <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-200">
                <li>Gdy potrzebujesz pomocy w porownaniu HBOT i H2.</li>
                <li>Gdy chcesz zapytac o wynajem, zakup, logistyke lub wdrozenie B2B.</li>
                <li>
                  Gdy sprawa jest pilna medycznie, uzyj lokalnych sluzb ratunkowych zamiast
                  formularza.
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)] lg:px-8">
          <Suspense fallback={<PolishContactFallback />}>
            <PolishContactForm />
          </Suspense>
          <aside className="space-y-5">
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-slate-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Przed wyslaniem
              </p>
              <h2 className="mt-3 text-2xl font-black text-white">
                Co warto dopisac w wiadomosci
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
                <li>Technologia: HBOT, H2 albo porownanie obu.</li>
                <li>Kontekst: dom, studio, klinika, zespol lub inna organizacja.</li>
                <li>Sciezka: wynajem, zakup, konsultacja albo ogolne pytanie.</li>
                <li>Ograniczenia: miejsce, budzet, termin, pytania bezpieczenstwa.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-slate-950/20">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Polska sekcja
              </p>
              <h2 className="mt-3 text-2xl font-black text-white">Wroc do produktu</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <PolishTrackedLink
                  href="/pl/product/hbot"
                  label="HBOT"
                  className={`inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-semibold text-white hover:border-cyan-300/45 hover:bg-white/[0.07] ${focusClass}`}
                >
                  HBOT
                </PolishTrackedLink>
                <PolishTrackedLink
                  href="/pl/product/hydrogen"
                  label="H2"
                  className={`inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-semibold text-white hover:border-cyan-300/45 hover:bg-white/[0.07] ${focusClass}`}
                >
                  H2
                </PolishTrackedLink>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
}
