import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Home,
  PackageCheck,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react';

type PreviewPageType = 'Home' | 'Rental' | 'Store';

interface ThemePanel {
  type: PreviewPageType;
  title: string;
  eyebrow: string;
  body: string;
  image: string;
  alt: string;
  primary: string;
  support: string;
}

interface ThemeExample {
  id: string;
  name: string;
  label: string;
  sourceBundles: readonly string[];
  pluginCues: readonly string[];
  signature: string;
  shellClass: string;
  mastheadClass: string;
  accentClass: string;
  buttonClass: string;
  panelClass: string;
  mediaClass: string;
  metricClass: string;
  panels: readonly ThemePanel[];
}

const defaultPanels: readonly ThemePanel[] = [
  {
    type: 'Home',
    title: 'Guided access to oxygen, hydrogen, light, and signal systems',
    eyebrow: 'Main page',
    body: 'A first-screen orientation page that keeps technology paths, evidence, rental, and support visible without turning the hero into a slogan.',
    image: '/images/chambers/oxyhelp-chambers-hero.jpg',
    alt: 'Hyperbaric chamber room used as Hylono oxygen-system preview media',
    primary: 'Start planning',
    support: 'Research, products, rental, contact',
  },
  {
    type: 'Rental',
    title: 'Rent the right system before a purchase decision',
    eyebrow: 'Renting page',
    body: 'A rental-first surface for monthly terms, setup checks, deposit review, delivery fit, and policy context before a request starts.',
    image: '/images/catalog/omega3/2026/za-ho6000.png',
    alt: 'Hydrogen system product image used for rental preview media',
    primary: 'Compare rental paths',
    support: 'Manual availability and support review',
  },
  {
    type: 'Store',
    title: 'Compare devices with product, rental, and policy exits',
    eyebrow: 'Shop page',
    body: 'A catalog surface that keeps real product entry points, rental pricing context, specifications, and support links crawlable.',
    image: '/images/catalog/omega3/GY-HX6000.jpg',
    alt: 'Hydrogen device product image used for store preview media',
    primary: 'Open catalog',
    support: 'Product hub, warranty, returns, shipping',
  },
];

export const themeExamples: readonly ThemeExample[] = [
  {
    id: 'divi-clinical-studio',
    name: 'Divi Clinical Studio',
    label: 'Modular landing system',
    sourceBundles: ['divi-581', 'animationaddons264', 'motionpage241n'],
    pluginCues: ['reveal blocks', 'CTA module', 'guided modal'],
    signature: 'A chamber-led hero with modular reveal strips and a compact evidence rail.',
    shellClass: 'bg-[#07111f] text-white',
    mastheadClass: 'border-cyan-200/20 bg-[#0d1d31]',
    accentClass: 'text-cyan-200',
    buttonClass: 'bg-cyan-200 text-[#07111f] hover:bg-white',
    panelClass: 'border-cyan-200/20 bg-[#0a1727]',
    mediaClass: 'border-cyan-100/20 bg-cyan-200/10',
    metricClass: 'border-cyan-200/20 bg-cyan-200/10 text-cyan-50',
    panels: defaultPanels,
  },
  {
    id: 'flatsome-commerce-shelf',
    name: 'Flatsome Commerce Shelf',
    label: 'Catalog-first storefront',
    sourceBundles: ['flatsome-3207', 'barnproductfilters211', 'barnwooproducttable439'],
    pluginCues: ['filter shelf', 'product table', 'quick category rail'],
    signature: 'A bright merchant shelf with chunky product cards and visible policy exits.',
    shellClass: 'bg-[#fbfaf4] text-[#17211b]',
    mastheadClass: 'border-[#173f2f]/15 bg-[#f3eddd]',
    accentClass: 'text-[#9a4f18]',
    buttonClass: 'bg-[#173f2f] text-white hover:bg-[#9a4f18]',
    panelClass: 'border-[#173f2f]/15 bg-white',
    mediaClass: 'border-[#173f2f]/15 bg-[#efe6d2]',
    metricClass: 'border-[#e2b45f]/45 bg-[#fff5d6] text-[#3f2a0f]',
    panels: defaultPanels,
  },
  {
    id: 'woodmart-rental-marketplace',
    name: 'Woodmart Rental Marketplace',
    label: 'Dense product decision grid',
    sourceBundles: ['woodmart-852', 'superwooprodfilter145', 'wooextraprodoptions7571'],
    pluginCues: ['product filter', 'option matrix', 'stock-status strip'],
    signature: 'A marketplace grid where rental price, fit checks, and device families sit above the fold.',
    shellClass: 'bg-[#151817] text-[#f4f1e8]',
    mastheadClass: 'border-[#f59e0b]/25 bg-[#202522]',
    accentClass: 'text-[#f7b955]',
    buttonClass: 'bg-[#f7b955] text-[#151817] hover:bg-[#53d6b5]',
    panelClass: 'border-[#f7b955]/20 bg-[#1e2421]',
    mediaClass: 'border-[#53d6b5]/20 bg-[#0f2a26]',
    metricClass: 'border-[#53d6b5]/25 bg-[#53d6b5]/10 text-[#d9fff6]',
    panels: defaultPanels,
  },
  {
    id: 'medizin-trust-clinic',
    name: 'Medizin Trust Clinic',
    label: 'Appointment and proof flow',
    sourceBundles: ['medizin-196', 'booklypro101', 'betterdocspro392'],
    pluginCues: ['booking panel', 'support docs', 'review ownership'],
    signature: 'A clinic-style layout with calm appointment blocks and visible ownership metadata.',
    shellClass: 'bg-[#f6fbfa] text-[#102331]',
    mastheadClass: 'border-[#95d6c8]/45 bg-white',
    accentClass: 'text-[#0d7d73]',
    buttonClass: 'bg-[#0d7d73] text-white hover:bg-[#16324f]',
    panelClass: 'border-[#95d6c8]/45 bg-white',
    mediaClass: 'border-[#95d6c8]/45 bg-[#e7f6f2]',
    metricClass: 'border-[#16324f]/15 bg-[#eff7ff] text-[#16324f]',
    panels: defaultPanels,
  },
  {
    id: 'arolax-motion-agency',
    name: 'Arolax Motion Agency',
    label: 'Editorial motion pitch',
    sourceBundles: ['arolax-405', 'animationaddons264', 'revslider712'],
    pluginCues: ['motion stage', 'split headline', 'timeline reveal'],
    signature: 'A bold editorial stage with oversized type, diagonal rhythm, and a rental timeline.',
    shellClass: 'bg-[#111111] text-white',
    mastheadClass: 'border-[#f15a3b]/35 bg-[#191919]',
    accentClass: 'text-[#b7f34a]',
    buttonClass: 'bg-[#b7f34a] text-[#111111] hover:bg-[#f15a3b] hover:text-white',
    panelClass: 'border-[#f15a3b]/35 bg-[#181818]',
    mediaClass: 'border-[#b7f34a]/25 bg-[#232811]',
    metricClass: 'border-[#f15a3b]/35 bg-[#f15a3b]/10 text-[#ffd8ce]',
    panels: defaultPanels,
  },
  {
    id: 'zeyna-boutique-support',
    name: 'Zeyna Boutique Support',
    label: 'Premium guided concierge',
    sourceBundles: ['zeyna-131', 'chatypro355', 'fluentsupportpro221'],
    pluginCues: ['floating contact', 'support lane', 'curated offer'],
    signature: 'A concierge-style page with soft product media, advisor prompts, and support context.',
    shellClass: 'bg-[#fcf7f7] text-[#2f1729]',
    mastheadClass: 'border-[#7d2e5f]/15 bg-[#fffdf8]',
    accentClass: 'text-[#2e7d61]',
    buttonClass: 'bg-[#7d2e5f] text-white hover:bg-[#2e7d61]',
    panelClass: 'border-[#7d2e5f]/15 bg-[#fffdf8]',
    mediaClass: 'border-[#2e7d61]/20 bg-[#e9f5ee]',
    metricClass: 'border-[#7d2e5f]/20 bg-[#f9e9f2] text-[#5c2146]',
    panels: defaultPanels,
  },
  {
    id: 'shoptimizer-conversion-checkout',
    name: 'Shoptimizer Conversion Checkout',
    label: 'Fast purchase path',
    sourceBundles: ['shoptimizer295', 'fluentform624', 'woodeposits4610'],
    pluginCues: ['deposit cue', 'request form', 'policy badge'],
    signature: 'A direct conversion surface with payment checkpoints and friction-free next actions.',
    shellClass: 'bg-[#f8fbff] text-[#101828]',
    mastheadClass: 'border-[#1d4ed8]/15 bg-white',
    accentClass: 'text-[#b45309]',
    buttonClass: 'bg-[#1d4ed8] text-white hover:bg-[#b45309]',
    panelClass: 'border-[#1d4ed8]/15 bg-white',
    mediaClass: 'border-[#facc15]/40 bg-[#fff8cc]',
    metricClass: 'border-[#1d4ed8]/20 bg-[#e7f0ff] text-[#123c8c]',
    panels: defaultPanels,
  },
  {
    id: 'greenshift-research-editorial',
    name: 'Greenshift Research Editorial',
    label: 'Evidence magazine hub',
    sourceBundles: ['greenshift12', 'real3dflipbook420', 'betterdocspro392'],
    pluginCues: ['document rail', 'evidence notes', 'accordion FAQ'],
    signature: 'A research-led visual system where product choices follow an evidence and document rail.',
    shellClass: 'bg-[#eff5ef] text-[#13231a]',
    mastheadClass: 'border-[#234c36]/20 bg-[#fbfffb]',
    accentClass: 'text-[#b42318]',
    buttonClass: 'bg-[#234c36] text-white hover:bg-[#b42318]',
    panelClass: 'border-[#234c36]/20 bg-[#fbfffb]',
    mediaClass: 'border-[#234c36]/20 bg-[#dcebdd]',
    metricClass: 'border-[#b42318]/20 bg-[#ffe9e6] text-[#7a1c15]',
    panels: defaultPanels,
  },
  {
    id: 'bricks-architect-configurator',
    name: 'Bricks Architect Configurator',
    label: 'Build-your-stack interface',
    sourceBundles: ['bricksthemer3315', 'fancyproductdesigner651', 'lumise211'],
    pluginCues: ['stack builder', 'option swatches', 'configuration summary'],
    signature: 'A technical configurator with grid lines, swatches, and route-specific summary panels.',
    shellClass: 'bg-[#0b1220] text-[#e6edf7]',
    mastheadClass: 'border-[#7dd3fc]/25 bg-[#111c2f]',
    accentClass: 'text-[#a3e635]',
    buttonClass: 'bg-[#a3e635] text-[#0b1220] hover:bg-[#7dd3fc]',
    panelClass: 'border-[#7dd3fc]/25 bg-[#101a2c]',
    mediaClass: 'border-[#a3e635]/25 bg-[#16251c]',
    metricClass: 'border-[#7dd3fc]/25 bg-[#7dd3fc]/10 text-[#d8f3ff]',
    panels: defaultPanels,
  },
  {
    id: 'elementor-booking-concierge',
    name: 'Elementor Booking Concierge',
    label: 'Service and affiliate funnel',
    sourceBundles: ['elementorpro412', 'ameliabooking962', 'affiliatewp2341'],
    pluginCues: ['booking strip', 'partner path', 'advisor funnel'],
    signature: 'A service-booking surface where advisor slots, partner paths, and product routes share the first screen.',
    shellClass: 'bg-[#111827] text-white',
    mastheadClass: 'border-[#f472b6]/25 bg-[#192235]',
    accentClass: 'text-[#5eead4]',
    buttonClass: 'bg-[#f472b6] text-[#111827] hover:bg-[#5eead4]',
    panelClass: 'border-[#f472b6]/25 bg-[#151f32]',
    mediaClass: 'border-[#5eead4]/25 bg-[#123333]',
    metricClass: 'border-[#f472b6]/25 bg-[#f472b6]/10 text-[#ffe0f0]',
    panels: defaultPanels,
  },
] as const;

const panelIcon = (type: PreviewPageType) => {
  if (type === 'Home') {
    return <Home aria-hidden="true" size={16} />;
  }

  if (type === 'Rental') {
    return <CalendarClock aria-hidden="true" size={16} />;
  }

  return <ShoppingBag aria-hidden="true" size={16} />;
};

export function ThemeExamplesLab() {
  return (
    <div className="min-h-screen bg-[#f4f6f8] text-[#111827]">
      <section className="border-b border-[#d8dee8] bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0d766e]">
                Hylono theme example lab
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-[#111827] sm:text-5xl">
                Ten selectable theme directions for Main, Renting, and Shop
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#4b5563]">
                Each direction translates the local WordPress theme and plugin bundle into a
                Hylono-native preview system. The live production pages stay unchanged while these
                examples remain inside the noindex preview area.
              </p>
            </div>
            <div className="border border-[#d8dee8] bg-[#f8fafc] p-5">
              <p className="text-sm font-semibold text-[#111827]">Source bundle read-back</p>
              <p className="mt-2 text-sm leading-6 text-[#4b5563]">
                Local source folder: /home/wiktor/mnt/mainpc/C:/Users/wikto/OneDrive/Pulpit/nowe auto.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-[#111827]">
                <span className="border border-[#d8dee8] bg-white px-2 py-2">10 themes</span>
                <span className="border border-[#d8dee8] bg-white px-2 py-2">3 pages</span>
                <span className="border border-[#d8dee8] bg-white px-2 py-2">30 panels</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {themeExamples.map((theme, index) => (
              <a
                key={theme.id}
                href={`#${theme.id}`}
                className="inline-flex min-h-11 items-center gap-2 border border-[#d8dee8] bg-white px-3 text-sm font-semibold text-[#111827] transition-colors hover:border-[#0d766e] hover:text-[#0d766e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d766e]"
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {theme.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {themeExamples.map((theme, index) => (
        <section key={theme.id} id={theme.id} className={`${theme.shellClass} scroll-mt-6 px-4 py-12 sm:px-6 lg:px-8`}>
          <div className="mx-auto max-w-7xl">
            <header className={`${theme.mastheadClass} border p-5`}>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                <div>
                  <p className={`${theme.accentClass} text-xs font-bold uppercase tracking-[0.18em]`}>
                    Theme {String(index + 1).padStart(2, '0')} / {theme.label}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{theme.name}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 opacity-80">{theme.signature}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">
                    Source themes and plugins
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {theme.sourceBundles.map((source) => (
                      <span key={source} className={`${theme.metricClass} border px-2 py-1 text-xs font-semibold`}>
                        {source}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {theme.pluginCues.map((cue) => (
                      <span key={cue} className="inline-flex items-center gap-1 border border-current/20 px-2 py-1 text-xs opacity-80">
                        <CheckCircle2 aria-hidden="true" size={13} />
                        {cue}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </header>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {theme.panels.map((panel) => (
                <article key={`${theme.id}-${panel.type}`} className={`${theme.panelClass} border`}>
                  <div className={`${theme.mediaClass} border-b p-3`}>
                    <div className="relative aspect-[16/9] overflow-hidden border border-current/10 bg-black/5">
                      <img
                        src={panel.image}
                        alt={panel.alt}
                        width={720}
                        height={405}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 border border-white/25 bg-black/55 px-3 py-2 text-white">
                        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
                          {panelIcon(panel.type)}
                          {panel.eyebrow}
                        </span>
                        <SlidersHorizontal aria-hidden="true" size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold leading-tight">{panel.title}</h3>
                    <p className="mt-3 text-sm leading-6 opacity-80">{panel.body}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className={`${theme.metricClass} inline-flex items-center gap-2 border px-3 py-2 text-xs font-semibold`}>
                        <PackageCheck aria-hidden="true" size={14} />
                        {panel.support}
                      </span>
                    </div>
                    <a
                      href={panel.type === 'Home' ? '/preview' : panel.type === 'Rental' ? '/rental' : '/store'}
                      className={`${theme.buttonClass} mt-5 inline-flex min-h-11 items-center gap-2 px-4 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}
                    >
                      {panel.primary}
                      <ArrowRight aria-hidden="true" size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
