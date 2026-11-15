import type { ReactNode } from 'react';
import { PolishRouteActionStatus, PolishTrackedLink } from './PolishTrackedLink';

const focusClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';

export const polishNavItems = [
  { href: '/pl', label: 'Start' },
  { href: '/pl/product/hbot', label: 'Komory HBOT' },
  { href: '/pl/product/hydrogen', label: 'Wodor molekularny' },
  { href: '/pl/contact', label: 'Kontakt' },
] as const;

export type PolishProductSlug = 'hbot' | 'hydrogen';

export const polishProductPages: Record<
  PolishProductSlug,
  {
    accent: string;
    contactHref: string;
    description: string;
    eyebrow: string;
    facts: string[];
    image: string;
    imageAlt: string;
    intro: string;
    limits: string[];
    name: string;
    slug: PolishProductSlug;
    summary: string;
    theme: 'cyan' | 'emerald';
    title: string;
  }
> = {
  hbot: {
    accent: 'cyan',
    contactHref: '/pl/contact?tech=hbot',
    description:
      'Polska strona HBOT Hylono pomaga porownac komory hiperbaryczne, planowanie dostepu i pytania bezpieczenstwa bez obietnic medycznych rezultatow.',
    eyebrow: 'Produkt Hylono',
    facts: [
      'Rozmowa zaczyna sie od celu, miejsca instalacji, budzetu i pytan o przeciwwskazania.',
      'Planowanie obejmuje wynajem, zakup lub spokojna konsultacje przed decyzja.',
      'Komora jest przedstawiana jako element rutyny wellness, nie jako zamiennik opieki medycznej.',
    ],
    image: '/images/chambers/oxyhelp-chambers-hero.jpg',
    imageAlt: 'Komora hiperbaryczna Hylono w jasnym pomieszczeniu',
    intro:
      'HBOT w tej sekcji oznacza planowanie sesji w komorze hiperbarycznej w kontekscie wellness. Strona pomaga zebrac praktyczne pytania przed rozmowa z Hylono.',
    limits: [
      'Informacje maja charakter edukacyjny i nie sa indywidualna porada medyczna.',
      'Dowody zależą od protokolu, populacji i punktow koncowych ocenianych w badaniach.',
      'Przed uzyciem nalezy omowic istotne choroby, leki, zabiegi ucha, ciaze i inne czynniki ryzyka ze specjalista.',
    ],
    name: 'Hylono HBOT',
    slug: 'hbot',
    summary:
      'Komory hiperbaryczne dla osob, ktore chca najpierw zrozumiec dostep, ograniczenia, logistyke i bezpieczne pytania kontrolne.',
    theme: 'cyan',
    title: 'Komory HBOT do planowania rutyny wellness',
  },
  hydrogen: {
    accent: 'emerald',
    contactHref: '/pl/contact?tech=hydrogen',
    description:
      'Polska strona H2 Hylono wyjasnia inhalacje wodoru i wode wodorowa jako element rutyny wellness z widocznymi ograniczeniami badan.',
    eyebrow: 'Produkt Hylono',
    facts: [
      'Rozmowa obejmuje format: inhalacja wodoru, woda wodorowa albo porownanie obu opcji.',
      'Dobor zalezy od miejsca uzycia, czestotliwosci, obslugi, akcesoriow i oczekiwanego poziomu wsparcia.',
      'Wodor molekularny jest omawiany jako czesc rutyny wellness, nie jako leczenie chorob.',
    ],
    image: '/images/catalog/omega3/2026/pr-ho450-p.png',
    imageAlt: 'Urzadzenie Hylono do wodoru molekularnego na jasnym tle',
    intro:
      'H2 w tej sekcji oznacza wodor molekularny w formatach takich jak inhalacja lub woda wodorowa. Strona porzadkuje pytania przed wyborem urzadzenia.',
    limits: [
      'Informacje maja charakter edukacyjny i nie sa indywidualna porada medyczna.',
      'Badania nad wodorem molekularnym roznia sie populacja, dawkowaniem, czasem uzycia i ocenianymi punktami koncowymi.',
      'Przed uzyciem warto omowic ciaze, niestabilne problemy oddechowe, opieke specjalistyczna i bezpieczna obsluge sprzetu.',
    ],
    name: 'Hylono H2',
    slug: 'hydrogen',
    summary:
      'Wodor molekularny dla osob, ktore chca porownac format, logistyke, ograniczenia badan i sciezke wsparcia.',
    theme: 'emerald',
    title: 'H2 i wodor molekularny w rutynie wellness',
  },
};

function PolishLinkButton({
  children,
  href,
  label,
  tone = 'dark',
}: {
  children: ReactNode;
  href: string;
  label?: string;
  tone?: 'dark' | 'light';
}) {
  const toneClass =
    tone === 'dark'
      ? 'border border-cyan-300/30 bg-cyan-300/15 text-cyan-50 hover:bg-cyan-300/20'
      : 'border border-white/10 bg-white/[0.045] text-white hover:border-cyan-300/45 hover:bg-white/[0.07]';

  return (
    <PolishTrackedLink
      href={href}
      label={label ?? (typeof children === 'string' ? children : href)}
      className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${toneClass} ${focusClass}`}
    >
      {children}
    </PolishTrackedLink>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
      {children}
    </p>
  );
}

export function PolishNavigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/92 text-white backdrop-blur">
      <PolishRouteActionStatus />
      <nav
        aria-label="Nawigacja po polskiej wersji Hylono"
        className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between lg:px-8"
      >
        <PolishTrackedLink
          href="/pl"
          label="Start"
          className={`text-lg font-black tracking-tight text-white ${focusClass}`}
        >
          Hylono Polska
        </PolishTrackedLink>
        <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-300">
          {polishNavItems.map((item) => (
            <PolishTrackedLink
              key={item.href}
              href={item.href}
              label={item.label}
              className={`rounded-full px-3 py-2 transition hover:bg-white/[0.07] hover:text-white ${focusClass}`}
            >
              {item.label}
            </PolishTrackedLink>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function PolishFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 text-sm text-slate-300 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-semibold text-white">Hylono Polska</p>
          <p className="mt-2 max-w-2xl leading-7">
            Polska sekcja obejmuje tylko strone startowa, HBOT, H2 oraz kontakt. Informacje sa
            edukacyjne i pomagaja przygotowac rozmowe o dostepie, logistyce i bezpiecznych
            pytaniach kontrolnych.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          {polishNavItems.map((item) => (
            <PolishTrackedLink
              key={item.href}
              href={item.href}
              label={item.label}
              className={`rounded-lg px-2 py-1 font-semibold text-slate-200 underline decoration-white/20 underline-offset-4 hover:decoration-cyan-200 ${focusClass}`}
            >
              {item.label}
            </PolishTrackedLink>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function PolishHome() {
  const products = [polishProductPages.hbot, polishProductPages.hydrogen];

  return (
    <div className="bg-[#070b12] text-white">
      <section className="overflow-hidden border-b border-white/10 bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-center lg:px-8 lg:py-20">
          <div>
            <SectionEyebrow>Polska sekcja Hylono</SectionEyebrow>
            <h1
              id="pl-home-hero-headline"
              className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl"
            >
              Hylono po polsku: HBOT, H2 i kontakt w jednym miejscu
            </h1>
            <p
              id="pl-home-hero-description"
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
            >
              Ta osobna sekcja pomaga spokojnie porownac dwie technologie Hylono, zrozumiec
              najwazniejsze pytania przed decyzja i wyslac zapytanie po polsku.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PolishLinkButton href="/pl/product/hbot" label="Sprawdz HBOT">
                Sprawdz HBOT
              </PolishLinkButton>
              <PolishLinkButton href="/pl/contact" label="Napisz do Hylono" tone="light">
                Napisz do Hylono
              </PolishLinkButton>
            </div>
          </div>
          <div className="relative">
            <img
              src="/images/chambers/oxyhelp-chambers-hero.jpg"
              alt="Komora hiperbaryczna Hylono jako przyklad technologii wellness"
              className="aspect-[4/3] w-full rounded-lg object-cover shadow-2xl shadow-slate-950/40"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="max-w-3xl">
          <SectionEyebrow>Tylko wybrane strony</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
            Polska wersja obejmuje cztery funkcjonalne widoki
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Linki w tej sekcji prowadza wylacznie do polskiej strony startowej, dwoch stron
            produktowych i polskiego formularza kontaktowego. Szersze centrum wiedzy pozostaje w
            glownej architekturze Hylono.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.slug}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-slate-950/20"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {product.eyebrow}
              </p>
              <h3 className="mt-3 text-2xl font-black text-white">{product.name}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{product.summary}</p>
              <PolishTrackedLink
                href={`/pl/product/${product.slug}`}
                label={product.name}
                className={`mt-5 inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/45 hover:bg-white/[0.07] ${focusClass}`}
              >
                Otworz strone produktu
              </PolishTrackedLink>
            </article>
          ))}
          <article className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-6 shadow-2xl shadow-slate-950/20">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              Kontakt
            </p>
            <h3 className="mt-3 text-2xl font-black text-white">Zapytanie po polsku</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Uzyj formularza, gdy chcesz porownac HBOT i H2, zapytac o dostep lub przygotowac
              rozmowe o wdrozeniu.
            </p>
            <PolishTrackedLink
              href="/pl/contact"
              label="Kontakt"
              className={`mt-5 inline-flex min-h-11 items-center rounded-lg border border-cyan-300/30 bg-cyan-300/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 ${focusClass}`}
            >
              Przejdz do kontaktu
            </PolishTrackedLink>
          </article>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-3 lg:px-8">
          {[
            {
              title: 'Najpierw dopasowanie',
              body: 'Punkt wyjscia to cel, miejsce uzycia, logistyka, budzet i pytania bezpieczenstwa.',
            },
            {
              title: 'Ostrożne informacje',
              body: 'Copy pozostaje edukacyjne, bez deklaracji leczenia, zapobiegania chorobom albo pewnych rezultatow.',
            },
            {
              title: 'Prosta sciezka',
              body: 'Po przeczytaniu stron produktu mozesz wyslac zapytanie z kontekstem, ktory pomaga zespolowi odpowiedziec konkretniej.',
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="text-xl font-black text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function PolishProductPage({
  product,
}: {
  product: (typeof polishProductPages)[PolishProductSlug];
}) {
  const themeClasses =
    product.theme === 'emerald'
      ? {
          badge: 'text-emerald-200',
          button: 'border border-emerald-300/30 bg-emerald-300/15 text-emerald-50 hover:bg-emerald-300/20',
          panel: 'bg-emerald-950',
        }
      : {
          badge: 'text-cyan-200',
          button: 'border border-cyan-300/30 bg-cyan-300/15 text-cyan-50 hover:bg-cyan-300/20',
          panel: 'bg-slate-950',
        };

  return (
    <div className="bg-[#070b12] text-white">
      <section className={`${themeClasses.panel} text-white`}>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.24em] ${themeClasses.badge}`}
            >
              {product.eyebrow}
            </p>
            <h1
              id={`pl-product-${product.slug}-headline`}
              className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-6xl"
            >
              {product.title}
            </h1>
            <p
              id={`pl-product-${product.slug}-description`}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-100"
            >
              {product.intro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PolishTrackedLink
                href={product.contactHref}
                label={`Zapytaj o ${product.name}`}
                className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${themeClasses.button} ${focusClass}`}
              >
                Zapytaj o {product.name}
              </PolishTrackedLink>
              <PolishTrackedLink
                href="/pl/contact"
                label="Porozmawiaj z Hylono"
                className={`inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07] ${focusClass}`}
              >
                Porozmawiaj z Hylono
              </PolishTrackedLink>
            </div>
          </div>
          <img
            src={product.image}
            alt={product.imageAlt}
            className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl shadow-black/30"
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] lg:px-8">
        <div>
          <SectionEyebrow>Jak czytac te strone</SectionEyebrow>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
            Decyzja produktowa zaczyna sie od kontekstu
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">{product.summary}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {product.facts.map((fact) => (
              <article key={fact} className="rounded-lg border border-white/10 bg-white/[0.045] p-5">
                <p className="text-sm leading-7 text-slate-300">{fact}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-slate-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Zakres informacji
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">
            Ograniczenia sa czescia decyzji
          </h2>
          <ul className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            {product.limits.map((limit) => (
              <li key={limit} className="border-l-2 border-white/10 pl-4">
                {limit}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <SectionEyebrow>Nastepny krok</SectionEyebrow>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white">
                Wyslij zapytanie z kontekstem, ktory juz masz
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
                Podaj, czy interesuje Cie uzycie domowe, profesjonalne, wynajem, zakup, porownanie
                technologii albo przygotowanie bezpiecznych pytan przed rozmowa ze specjalista.
              </p>
            </div>
            <PolishLinkButton href={product.contactHref} label="Przejdz do formularza">
              Przejdz do formularza
            </PolishLinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
