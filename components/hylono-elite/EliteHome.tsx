import Image from 'next/image';
import type { ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, KeyRound, MessagesSquare, Plus, Truck } from 'lucide-react';
import { siteOwnership } from '@/content/site-entity';
import { EliteAtlas, EliteHeroStage, EliteLink } from './EliteInteractive';
import { eliteUpdated, questions, ribbon, steps, supportPaths, technologies } from './content';
import styles from './elite.module.css';

const cx = (...names: Array<string | false | null | undefined>) => names.filter(Boolean).join(' ');

const ribbonIcons = {
  consult: MessagesSquare,
  research: BookOpen,
  rental: KeyRound,
  delivery: Truck,
} as const;

const primaryPill =
  'group inline-flex min-h-12 items-center gap-3 rounded-full bg-[#143D34] py-1.5 pl-6 pr-1.5 text-sm font-semibold text-white shadow-[0_18px_40px_-18px_rgba(20,61,52,0.65)] transition-colors hover:bg-[#0F2F28] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300';
const primaryPillIcon =
  'flex h-9 w-9 items-center justify-center rounded-full bg-white/15 transition-transform duration-500 group-hover:rotate-45';
const secondaryPill =
  'inline-flex min-h-12 items-center gap-2 rounded-full border border-[#DDD6C8] bg-white/85 px-6 text-sm font-semibold text-slate-800 backdrop-blur-sm transition-colors hover:border-[#C4B7A0] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300';
const textLink =
  'group inline-flex min-h-11 items-center gap-2 border-b border-[#C4B7A0] text-sm font-semibold text-[#141716] transition-colors hover:border-[#143D34] hover:text-[#143D34] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300';

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx('flex items-center gap-3', className)}>
      <span className={cx(styles.identity, 'text-[10.5px] text-[#966D48]')}>{children}</span>
      <span className="hidden h-px w-8 shrink-0 bg-[#C8BFB0] sm:block" aria-hidden="true" />
    </p>
  );
}

function HeroCopy() {
  return (
    <>
      <div className={cx(styles.rise, styles.rise1)}>
        <Eyebrow>A considered approach to wellness</Eyebrow>
      </div>
      <h1
        id="elite-hero-title"
        className={cx(
          styles.displayXL,
          styles.rise,
          styles.rise2,
          'mt-6 text-[3.4rem] text-[#141716] sm:text-[4.8rem] lg:text-[6.6rem]'
        )}
      >
        Make room for
        <br />
        <em className="text-[#966D48]">a better routine.</em>
      </h1>
      <p
        id="elite-hero-copy"
        className={cx(styles.rise, styles.rise3, 'mt-7 max-w-xl text-lg leading-relaxed text-slate-700')}
      >
        Wellness technology, made approachable. Equipment, research and guidance for your home or
        professional space.
      </p>
      <div className={cx(styles.rise, styles.rise4, 'mt-9 flex flex-wrap items-center gap-3')}>
        <EliteLink href="/consultation" source="hero" className={primaryPill}>
          Find your starting point
          <span className={primaryPillIcon}>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </EliteLink>
        <EliteLink href="#technologies" source="hero" className={secondaryPill}>
          Explore technologies
          <ArrowRight className="h-4 w-4 rotate-90 text-[#966D48]" aria-hidden="true" />
        </EliteLink>
      </div>
    </>
  );
}

function Ribbon() {
  return (
    <nav
      aria-label="Ways to begin"
      className="relative z-20 mx-auto -mt-14 max-w-7xl px-4 sm:px-6 lg:-mt-20 lg:px-8"
    >
      <ul className="grid overflow-hidden rounded-[2rem] border border-[#E8E2D8] bg-white/90 shadow-[0_24px_60px_-30px_rgba(20,25,23,0.3)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#EAE4D8]">
        {ribbon.map((item) => {
          const Icon = ribbonIcons[item.icon];
          return (
            <li key={item.href} className="border-b border-[#EAE4D8] last:border-b-0 sm:[&:nth-child(n+3)]:border-b-0 lg:border-b-0">
              <EliteLink
                href={item.href}
                source="ribbon"
                className="group flex h-full items-center gap-4 px-6 py-5 transition-colors hover:bg-[#FAF8F5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-cyan-300"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#DDD5C7] bg-[#F4EFEA] text-[#966D48] transition-colors group-hover:border-[#966D48]">
                  <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                  <span className="block text-xs text-slate-600">{item.copy}</span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-[#966D48] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </EliteLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Atlas() {
  return (
    <section
      id="technologies"
      aria-labelledby="elite-atlas-title"
      className="mx-auto max-w-7xl scroll-mt-28 px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pb-32 lg:pt-32"
    >
      <div className={cx(styles.reveal, 'grid gap-8 border-b border-[#EAE4D8] pb-10 lg:grid-cols-12 lg:items-end')}>
        <div className="lg:col-span-7">
          <Eyebrow>01 · The technology atlas</Eyebrow>
          <h2 id="elite-atlas-title" className={cx(styles.displayL, 'mt-5 text-[2.6rem] text-[#141716] sm:text-6xl lg:text-[4.6rem]')}>
            Different by design.
            <br />
            <em className="text-[#966D48]">Chosen with care.</em>
          </h2>
        </div>
        <div className="lg:col-span-5">
          <p className="max-w-md text-base leading-relaxed text-slate-700">
            Four technologies. Different equipment, operating parameters and evidence. Understand
            what sets each apart.
          </p>
          <EliteLink href="/store" source="technology-atlas" className={cx(textLink, 'mt-5')}>
            Browse the equipment collection
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" aria-hidden="true" />
          </EliteLink>
        </div>
      </div>
      <div className={cx(styles.reveal, 'mt-10')}>
        <EliteAtlas technologies={technologies} />
      </div>
      <p className="mt-4 text-right text-[11px] text-slate-600">
        Concept renders · AI-generated · not specific Hylono devices
      </p>
    </section>
  );
}

function Sanctuary() {
  return (
    <section aria-labelledby="elite-sanctuary-title" className="px-4 sm:px-6 lg:px-8">
      <div className="relative isolate mx-auto min-h-[620px] max-w-[88rem] overflow-hidden rounded-[2rem] border border-[#E8E2D8] lg:min-h-[680px]">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className={cx(styles.drift, 'absolute inset-0')}>
            <Image
              src="/images/store/store_hero_sanctuary.jpg"
              alt="Concept interior: a curved limestone room with a bonsai beneath a full-height window onto mountains and a lake."
              fill
              sizes="(max-width: 1408px) 100vw, 1408px"
              className="object-cover object-[70%_50%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/95 via-[#FAF8F5]/40 to-transparent lg:bg-gradient-to-r lg:from-[#FAF8F5]/95 lg:via-[#FAF8F5]/60 lg:to-transparent" />
        </div>

        <div className="flex min-h-[620px] flex-col justify-end p-6 sm:p-10 lg:min-h-[680px] lg:max-w-[54rem] lg:justify-center lg:p-16">
          <Eyebrow>Room to begin</Eyebrow>
          <h2
            id="elite-sanctuary-title"
            className={cx(styles.displayL, styles.reveal, 'mt-5 text-[2.6rem] text-[#141716] sm:text-6xl lg:text-[4.8rem]')}
          >
            Technology has a place.
            <br />
            <em className="text-[#966D48]">So do you.</em>
          </h2>
          <EliteLink href="/for-home" source="sanctuary" className={cx(secondaryPill, 'mt-8 self-start')}>
            Explore the home pathway
            <ArrowUpRight className="h-4 w-4 text-[#966D48]" aria-hidden="true" />
          </EliteLink>
        </div>

        <span className="absolute bottom-5 right-6 rounded-full bg-white/75 px-3 py-1 text-[11px] text-slate-700 backdrop-blur-md">
          Concept interior · AI-generated
        </span>
      </div>
    </section>
  );
}

function Routine() {
  return (
    <section
      id="your-routine"
      aria-labelledby="elite-routine-title"
      className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className={cx(styles.reveal, 'grid gap-8 lg:grid-cols-12 lg:items-end')}>
        <div className="lg:col-span-7">
          <Eyebrow>02 · More than the equipment</Eyebrow>
          <h2 id="elite-routine-title" className={cx(styles.displayL, 'mt-5 text-[2.6rem] text-[#141716] sm:text-6xl lg:text-[4.6rem]')}>
            Begin with your life.
            <br />
            <em className="text-[#966D48]">Then the technology.</em>
          </h2>
        </div>
        <div className="lg:col-span-5">
          <p className={cx(styles.serif, 'text-2xl italic leading-snug text-[#141716]')}>
            The right starting point is a routine you can make space for.
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-700">
            Consider your priorities, understand the research and compare equipment before
            committing. Hylono connects those decisions, so your next step feels clear.
          </p>
        </div>
      </div>

      <ol className="mt-14 grid gap-5 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.href} className={styles.reveal}>
            <EliteLink
              href={step.href}
              source="routine"
              className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#E8E2D8] bg-[#FCFBF8] shadow-[0_15px_35px_rgba(20,25,23,0.04)] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[#C4B7A0] hover:shadow-[0_30px_60px_-30px_rgba(20,25,23,0.3)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div className="relative h-72 overflow-hidden">
                <Image
                  src={step.image.src}
                  alt={step.image.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FCFBF8] via-[#FCFBF8]/60 to-transparent" />
                <span aria-hidden="true" className={cx(styles.serif, 'absolute left-5 top-4 text-4xl font-light text-white drop-shadow')}>
                  0{index + 1}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-7 pt-3">
                <h3 className={cx(styles.displayM, 'text-[1.9rem] text-[#141716] transition-colors group-hover:text-[#143D34]')}>
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{step.copy}</p>
                <span className="mt-auto flex items-center justify-between border-t border-[#EAE4D8] pt-5 text-sm font-semibold text-[#141716]">
                  <span className="mt-1">{step.label}</span>
                  <ArrowRight className="h-4 w-4 text-[#966D48] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </div>
            </EliteLink>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Access() {
  return (
    <section id="your-space" aria-labelledby="elite-access-title" className="bg-[#F3EEE6] py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cx(styles.reveal, 'grid gap-8 lg:grid-cols-12 lg:items-end')}>
          <div className="lg:col-span-7">
            <Eyebrow>03 · Your space. Your pace.</Eyebrow>
            <h2 id="elite-access-title" className={cx(styles.displayL, 'mt-5 text-[2.6rem] text-[#141716] sm:text-6xl lg:text-[4.6rem]')}>
              A considered way in.
              <br />
              <em className="text-[#966D48]">For wherever you begin.</em>
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-slate-700 lg:col-span-5">
            Start with a conversation about your space, equipment and access options. Confirm the
            details before you make a commitment.
          </p>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {[
            {
              eyebrow: 'For your home',
              title: ['Your own space.', 'Your everyday rhythm.'],
              copy: 'Understand the footprint, setup and operating requirements. Find equipment that fits the room—and the time you have.',
              href: '/for-home',
              label: 'Plan a home setup',
              source: 'home-pathway',
              image: '/images/conditions/hero-villa.jpg',
              alt: 'Concept interior: a lakeside living room with a fireplace, chaise and full-height glazing.',
            },
            {
              eyebrow: 'For professionals',
              title: ['A thoughtful addition', 'to your practice.'],
              copy: 'Compare documentation, onboarding and support for your professional setting. Discuss the practical requirements with Hylono.',
              href: '/for-professionals',
              label: 'Explore professional access',
              source: 'professional-pathway',
              image: '/images/for-professionals/card-01-context.jpg',
              alt: 'Concept interior: a quiet consultation room with two armchairs, a side table and a tall window.',
            },
          ].map((card) => (
            <article
              key={card.href}
              className={cx(
                styles.reveal,
                'group relative isolate flex min-h-[600px] flex-col justify-end overflow-hidden rounded-[2rem] border border-[#E8E2D8] p-4 shadow-[0_15px_35px_rgba(20,25,23,0.05)] sm:p-5'
              )}
            >
              <Image
                src={card.image}
                alt={card.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="-z-10 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 motion-reduce:transition-none"
              />
              <div className="rounded-[1.5rem] border border-white/80 bg-white/80 p-7 backdrop-blur-xl sm:p-9">
                <span className={cx(styles.identity, 'text-[10px] text-[#966D48]')}>{card.eyebrow}</span>
                <h3 className={cx(styles.displayM, 'mt-4 text-[2.3rem] text-[#141716] sm:text-[2.7rem]')}>
                  {card.title[0]}
                  <br />
                  <em className="text-[#966D48]">{card.title[1]}</em>
                </h3>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-700">{card.copy}</p>
                <EliteLink href={card.href} source={card.source} className={cx(primaryPill, 'mt-7')}>
                  {card.label}
                  <span className={primaryPillIcon}>
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </EliteLink>
              </div>
            </article>
          ))}
        </div>

        <div className={cx(styles.reveal, 'relative isolate mt-5 overflow-hidden rounded-[2rem] border border-[#E8E2D8] bg-white')}>
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-[58%] lg:block">
            <Image
              src="/images/megamenu/card-store-rent-portrait.jpg"
              alt=""
              fill
              sizes="45vw"
              className="object-cover object-[50%_60%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent" />
          </div>
          <div className="grid gap-6 p-8 sm:p-10 lg:max-w-[48%] lg:p-14">
            <span className={cx(styles.identity, 'text-[10px] text-[#966D48]')}>Rental or ownership</span>
            <h3 className={cx(styles.displayM, 'text-[2.4rem] text-[#141716] sm:text-[3rem]')}>
              Choose the commitment
              <br />
              <em className="text-[#966D48]">that fits.</em>
            </h3>
            <p className="text-[15px] leading-relaxed text-slate-700">
              Ask about model availability, rental terms and purchase options. Clear details first.
              Your decision after.
            </p>
            <EliteLink href="/compare/rent-vs-buy" source="rental-comparison" className={cx(textLink, 'self-start')}>
              Compare your options
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" aria-hidden="true" />
            </EliteLink>
          </div>
        </div>

        <nav aria-label="Plan your equipment access" className="mt-5 grid gap-5 md:grid-cols-3">
          {supportPaths.map((path) => (
            <EliteLink
              key={path.href}
              href={path.href}
              source="support-paths"
              className="group relative isolate flex min-h-40 items-end overflow-hidden rounded-[2rem] border border-[#E8E2D8] p-6 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300"
            >
              <Image
                src={path.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="-z-10 object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
              />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-white via-white/75 to-white/10" />
              <span className="flex w-full items-center justify-between gap-4">
                <span className={cx(styles.displayM, 'text-[1.75rem] text-[#141716]')}>{path.label}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DDD5C7] bg-white/90 text-[#966D48] transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </span>
            </EliteLink>
          ))}
        </nav>
      </div>
    </section>
  );
}

function Questions() {
  return (
    <section aria-labelledby="elite-questions-title" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Eyebrow>Clarity before commitment</Eyebrow>
            <h2 id="elite-questions-title" className={cx(styles.displayL, 'mt-5 text-[2.6rem] text-[#141716] sm:text-6xl')}>
              Good questions.
              <br />
              <em className="text-[#966D48]">Clear starting points.</em>
            </h2>
            <div className="relative mt-10 hidden aspect-[4/5] max-w-sm overflow-hidden rounded-[2rem] border border-[#E8E2D8] lg:block">
              <Image
                src="/images/megamenu/hero-systems-bg.jpg"
                alt="An alpine lake at dawn mirroring snow-capped peaks and pine forest."
                fill
                sizes="384px"
                className="object-cover"
              />
            </div>
            <EliteLink href="/faq" source="questions" className={cx(textLink, 'mt-8')}>
              Visit the full FAQ
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" aria-hidden="true" />
            </EliteLink>
          </div>
        </div>

        <div className={cx(styles.faq, 'lg:col-span-7')}>
          <div className="divide-y divide-[#EAE4D8] border-y border-[#EAE4D8]">
            {questions.map((item, index) => (
              <details key={item.question} open={index === 0} className={cx(styles.faqItem, 'group')}>
                <summary className="flex min-h-11 cursor-pointer list-none items-center gap-5 py-7 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300">
                  <span aria-hidden="true" className={cx(styles.serif, 'w-8 shrink-0 text-xl italic text-[#966D48]')}>
                    0{index + 1}
                  </span>
                  <span className={cx(styles.displayM, 'flex-1 text-[1.6rem] text-[#141716] sm:text-[1.9rem]')}>
                    {item.question}
                  </span>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#DDD5C7] bg-white text-[#966D48] transition-[transform,background-color,color] duration-500 group-open:rotate-45 group-open:bg-[#143D34] group-open:text-white">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </span>
                </summary>
                <div className="pb-8 pl-[3.25rem] pr-4 sm:pr-14">
                  <p className="text-[15px] leading-relaxed text-slate-700">{item.answer}</p>
                  <EliteLink href={item.href} source="questions" className={cx(textLink, 'mt-4')}>
                    {item.label}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" aria-hidden="true" />
                  </EliteLink>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Trust() {
  return (
    <section
      id="home-medical-disclaimer"
      aria-labelledby="elite-trust-title"
      className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-32"
    >
      <div className="grid gap-5 lg:grid-cols-12">
        <div className={cx(styles.reveal, 'rounded-[2rem] border border-[#E8E2D8] bg-white p-8 shadow-[0_15px_35px_rgba(20,25,23,0.04)] sm:p-12 lg:col-span-7')}>
          <Eyebrow>Perspective matters</Eyebrow>
          <h2 id="elite-trust-title" className={cx(styles.displayL, 'mt-5 text-[2.8rem] text-[#141716] sm:text-[3.6rem]')}>
            An informed choice
            <br />
            <em className="text-[#966D48]">starts with context.</em>
          </h2>
          <p className="mt-6 text-[15px] leading-relaxed text-slate-700">
            Published research explores specific parameters and populations. Individual responses
            vary, and evidence for a modality does not establish results for every device or routine.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
            Hylono provides wellness technology education and equipment guidance. It does not replace
            professional care. Discuss personal suitability with an appropriately qualified
            professional.
          </p>
          <div className="mt-8 rounded-[1.25rem] border border-[#FED7AA] bg-[#FFF7ED] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A3412]">Limits of generalization</p>
            <p className="mt-2 text-sm leading-relaxed text-[#7C2D12]">
              Research examines particular devices, parameters and populations. A study of a modality
              does not establish an outcome for every device or person.
            </p>
          </div>
          <EliteLink href="/safety-and-standards" source="trust" className={cx(textLink, 'mt-8')}>
            Read the safety guidance
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" aria-hidden="true" />
          </EliteLink>
        </div>

        <aside
          aria-label="Ownership and freshness"
          className={cx(styles.reveal, 'flex flex-col overflow-hidden rounded-[2rem] border border-[#E8E2D8] bg-[#FCFBF8] shadow-[0_15px_35px_rgba(20,25,23,0.04)] lg:col-span-5')}
        >
          <div className="relative h-56 shrink-0">
            <Image
              src="/images/about/botanical-editorial-book.jpg"
              alt="An open notebook with botanical sketches and an olive sprig on linen."
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FCFBF8] to-transparent" />
          </div>
          <div className="flex flex-1 flex-col p-8 pt-2 sm:p-10 sm:pt-2">
            <span className={cx(styles.identity, 'text-[10px] text-[#966D48]')}>Accountability, in the open</span>
            <dl className="mt-5 divide-y divide-[#EAE4D8]">
              <div className="py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Editorial ownership</dt>
                <dd className={cx(styles.displayM, 'mt-1 text-2xl text-[#141716]')}>{siteOwnership.editorial.team}</dd>
              </div>
              <div className="py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Equipment enquiries</dt>
                <dd className={cx(styles.displayM, 'mt-1 text-2xl text-[#141716]')}>{siteOwnership.commerce.team}</dd>
              </div>
              <div className="py-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Last reviewed</dt>
                <dd className="mt-1">
                  <time dateTime={eliteUpdated} className={cx(styles.displayM, 'block text-2xl text-[#141716]')}>
                    30 October 2026
                  </time>
                  <span className="mt-1 block text-xs text-slate-600">
                    Prototype presentation · copy from the 2 October 2026 landing page. Interior and
                    equipment imagery are concept renders.
                  </span>
                </dd>
              </div>
            </dl>
            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              <EliteLink href="/research" source="trust" className={secondaryPill}>
                Explore the evidence
                <ArrowUpRight className="h-4 w-4 text-[#966D48]" aria-hidden="true" />
              </EliteLink>
              <EliteLink href="/about" source="trust" className={secondaryPill}>
                Meet Hylono
                <ArrowUpRight className="h-4 w-4 text-[#966D48]" aria-hidden="true" />
              </EliteLink>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section aria-labelledby="elite-closing-title" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#143D34] to-[#0A201B] px-6 py-20 text-center text-white sm:px-12 lg:py-28">
        <Image
          src="/images/conditions/goal-vitality-lake.jpg"
          alt=""
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="-z-10 object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,rgba(196,183,160,0.22),transparent_70%)]" />
        <span className={cx(styles.identity, 'text-[10px] text-[#E7D9C3]')}>Your next step can be a small one</span>
        <h2 id="elite-closing-title" className={cx(styles.displayXL, 'mx-auto mt-6 max-w-4xl text-[3.2rem] sm:text-[4.6rem] lg:text-[6rem]')}>
          Let’s find
          <br />
          <em className="text-[#E7D9C3]">your starting point.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/85">
          Tell us about your space and what you’re exploring.
          <br />
          We’ll help you understand the options.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <EliteLink
            href="/consultation"
            source="closing"
            className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-white py-1.5 pl-6 pr-1.5 text-sm font-semibold text-[#143D34] transition-colors hover:bg-[#FAF8F5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300"
          >
            Start a conversation
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#143D34] text-white transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </EliteLink>
          <EliteLink
            href="/contact"
            source="closing"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/35 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300"
          >
            Or contact us directly
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </EliteLink>
        </div>
      </div>
    </section>
  );
}

export function EliteHome() {
  return (
    <div className={cx(styles.page, 'min-h-screen bg-[#FAF8F5] text-[#141716]')}>
      <EliteHeroStage technologies={technologies}>
        <HeroCopy />
      </EliteHeroStage>
      <Ribbon />
      <Atlas />
      <Sanctuary />
      <Routine />
      <Access />
      <Questions />
      <Trust />
      <Closing />
    </div>
  );
}
