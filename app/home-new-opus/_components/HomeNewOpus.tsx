import Image from 'next/image';
import { siteOwnership } from '@/content/site-entity';
import { journey, ledger, modalities, questions } from './content';
import { editorial, identity } from './fonts';
import { ModalityAtlas } from './ModalityAtlas';
import { OpusFooter, OpusHeader } from './OpusChrome';
import { OpusLink } from './OpusLink';
import { Pathfinder } from './Pathfinder';
import s from './opus.module.css';

const reviewed = { iso: '2026-10-30', label: '30 October 2026' };

export function HomeNewOpus() {
  return (
    <div className={`${s.root} ${editorial.variable} ${identity.variable}`}>
      <OpusHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={s.hero} aria-labelledby="opus-hero-title">
        <div className={s.heroMedia}>
          <Image
            src="/images/landing/hero-lake-villa-v2.jpg"
            alt="Concept interior: a person in a robe sits in a wooden chair facing a misty mountain lake through floor-to-ceiling glass."
            fill
            preload
            sizes="100vw"
            className={s.heroImage}
          />
        </div>
        <div className={s.heroScrim} aria-hidden="true" />

        <div className={s.heroContent}>
          <p className={s.heroEyebrow}>
            <span className={s.pulseDot} aria-hidden="true" /> Wellness technology, considered
          </p>
          <h1 id="opus-hero-title" className={s.heroTitle}>
            Wellness technology,
            <br />
            <em>without the noise.</em>
          </h1>
          <p id="opus-hero-copy" className={s.heroCopy}>
            Hyperbaric oxygen, molecular hydrogen, red light and pulsed fields. Explained plainly,
            compared fairly and planned around your home or practice.
          </p>
          <div className={s.heroActions}>
            <OpusLink href="/consultation" source="hero" primary className={s.buttonLight}>
              Find your starting point <span aria-hidden="true">↗</span>
            </OpusLink>
            <OpusLink href="#route" source="hero" className={s.buttonGhost}>
              Build your route in 3 answers <span aria-hidden="true">↓</span>
            </OpusLink>
          </div>
        </div>

        <div className={s.breath} aria-hidden="true">
          <span className={s.breathRing} />
          <span className={s.breathLabel}>
            <span className={s.breathIn}>Breathe in</span>
            <span className={s.breathOut}>Breathe out</span>
          </span>
        </div>

        <nav className={s.spectrum} aria-label="Jump to a technology">
          {modalities.map((m) => (
            <a key={m.id} href={`#atlas-${m.id}`} className={s.spectrumItem} data-modality={m.id}>
              <span className={s.spectrumSymbol} aria-hidden="true">
                {m.symbol}
              </span>
              <span className={s.spectrumName}>{m.name}</span>
            </a>
          ))}
        </nav>
        <p className={s.heroCaption}>Concept imagery · AI-generated</p>
      </section>

      {/* ── 01 Atlas ─────────────────────────────────────────────────────── */}
      <section
        id="atlas"
        className={`${s.section} ${s.atlasSection}`}
        aria-labelledby="atlas-title"
      >
        <span id="atlas-hbot" className={s.anchor} />
        <span id="atlas-hydrogen" className={s.anchor} />
        <span id="atlas-rlt" className={s.anchor} />
        <span id="atlas-pemf" className={s.anchor} />
        <header className={`${s.sectionHead} ${s.reveal}`}>
          <div>
            <p className={s.eyebrow}>01 / The technology atlas</p>
            <h2 id="atlas-title" className={s.sectionTitle}>
              Four technologies.
              <br />
              <em>Four different conversations.</em>
            </h2>
          </div>
          <p className={s.sectionLead}>
            Each one differs in equipment, operating parameters and evidence. Choose a technology to
            see what it is, what to check and what the research can and cannot tell you.
          </p>
        </header>
        <ModalityAtlas />
      </section>

      {/* ── 02 Pathfinder ────────────────────────────────────────────────── */}
      <section
        id="route"
        className={`${s.section} ${s.routeSection}`}
        aria-labelledby="route-title"
      >
        <header className={`${s.sectionHead} ${s.reveal}`}>
          <div>
            <p className={s.eyebrow}>02 / Pathfinder</p>
            <h2 id="route-title" className={s.sectionTitle}>
              Three answers.
              <br />
              <em>One clear route.</em>
            </h2>
          </div>
          <p className={s.sectionLead}>
            No account and no sales call required. Tell us where, what and how, and the page
            arranges the next pages worth reading, in order.
          </p>
        </header>
        <Pathfinder />
      </section>

      {/* ── 03 Evidence ledger ───────────────────────────────────────────── */}
      <section
        id="evidence"
        className={`${s.section} ${s.ledgerSection}`}
        aria-labelledby="evidence-title"
      >
        <header className={`${s.sectionHead} ${s.reveal}`}>
          <div>
            <p className={s.eyebrow}>03 / The evidence ledger</p>
            <h2 id="evidence-title" className={s.sectionTitle}>
              Evidence,
              <br />
              <em>with its limits.</em>
            </h2>
          </div>
          <p className={s.sectionLead}>
            Published research explores specific parameters and populations. Individual responses
            vary. Here is how we handle that, in writing.
          </p>
        </header>
        <div className={s.ledger}>
          {ledger.map((column) => (
            <article
              key={column.tone}
              className={`${s.ledgerColumn} ${s.reveal}`}
              data-tone={column.tone}
            >
              <h3 className={s.ledgerTitle}>{column.title}</h3>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className={s.ledgerFoot}>
          <p>
            Hylono provides wellness technology education and equipment guidance. It does not
            replace professional care. Discuss personal suitability with an appropriately qualified
            professional.
          </p>
          <div className={s.ledgerLinks}>
            <OpusLink href="/research" source="evidence-ledger" className={s.buttonLight}>
              Open the research library <span aria-hidden="true">↗</span>
            </OpusLink>
            <OpusLink
              href="/safety-and-standards"
              source="evidence-ledger"
              className={s.textLinkLight}
            >
              Read the safety guidance <span aria-hidden="true">↗</span>
            </OpusLink>
          </div>
        </div>
      </section>

      {/* ── 04 Journey ───────────────────────────────────────────────────── */}
      <section id="journey" className={s.section} aria-labelledby="journey-title">
        <header className={`${s.sectionHead} ${s.reveal}`}>
          <div>
            <p className={s.eyebrow}>04 / How it works</p>
            <h2 id="journey-title" className={s.sectionTitle}>
              From first question
              <br />
              <em>to a working routine.</em>
            </h2>
          </div>
          <p className={s.sectionLead}>
            Five steps, each with the details in writing before you move on to the next one.
          </p>
        </header>
        <ol className={s.journey}>
          {journey.map((item) => (
            <li key={item.step} className={`${s.journeyStep} ${s.reveal}`}>
              <span className={s.journeyIndex} aria-hidden="true">
                {item.step}
              </span>
              <h3 className={s.journeyTitle}>{item.title}</h3>
              <p>{item.copy}</p>
              <OpusLink href={item.href} source="journey" className={s.textLink}>
                {item.label} <span aria-hidden="true">↗</span>
              </OpusLink>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 05 Spaces ────────────────────────────────────────────────────── */}
      <section
        id="spaces"
        className={`${s.section} ${s.spacesSection}`}
        aria-labelledby="spaces-title"
      >
        <header className={`${s.sectionHead} ${s.reveal}`}>
          <div>
            <p className={s.eyebrow}>05 / Your space. Your pace.</p>
            <h2 id="spaces-title" className={s.sectionTitle}>
              Wherever you begin,
              <br />
              <em>begin with the room.</em>
            </h2>
          </div>
        </header>
        <div className={s.spaces}>
          <article className={`${s.spaceCard} ${s.spaceHome} ${s.reveal}`}>
            <Image
              src="/images/landing-2026/room-1440.webp"
              width={1440}
              height={960}
              alt="Concept interior: a sunlit travertine room with an ivory chaise overlooking a lake."
              sizes="(max-width: 900px) 100vw, 58vw"
              className={s.spaceImage}
            />
            <div className={s.spaceBody}>
              <p className={s.eyebrow}>For your home</p>
              <h3 className={s.spaceTitle}>Your own space. Your everyday rhythm.</h3>
              <p>
                Understand the footprint, setup and operating requirements, then find equipment that
                fits the room and the time you have.
              </p>
              <OpusLink href="/for-home" source="spaces-home" className={s.buttonLight}>
                Plan a home setup <span aria-hidden="true">↗</span>
              </OpusLink>
            </div>
          </article>
          <article className={`${s.spaceCard} ${s.spacePro} ${s.reveal}`}>
            <div className={s.spaceGlyphs} aria-hidden="true">
              {modalities.map((m) => (
                <span key={m.id} data-modality={m.id}>
                  {m.symbol}
                </span>
              ))}
            </div>
            <div className={s.spaceBody}>
              <p className={s.eyebrow}>For professionals</p>
              <h3 className={s.spaceTitle}>A thoughtful addition to your practice.</h3>
              <p>
                Compare documentation, onboarding and support for your professional setting, and
                discuss the practical requirements with Hylono.
              </p>
              <OpusLink
                href="/for-professionals"
                source="spaces-professional"
                className={s.buttonLight}
              >
                Explore professional access <span aria-hidden="true">↗</span>
              </OpusLink>
            </div>
          </article>
        </div>
        <div className={`${s.rentalRow} ${s.reveal}`}>
          <div>
            <p className={s.eyebrow}>Rental or ownership</p>
            <h3 className={s.rentalTitle}>Choose the commitment that fits.</h3>
          </div>
          <p>
            Ask about model availability, rental terms and purchase options. Clear details first,
            your decision after.
          </p>
          <nav aria-label="Equipment access options" className={s.rentalLinks}>
            <a href="/compare/rent-vs-buy">Rent vs buy ↗</a>
            <a href="/rental">Rental pathway ↗</a>
            <a href="/financing">Financing ↗</a>
          </nav>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className={`${s.section} ${s.faqSection}`} aria-labelledby="faq-title">
        <div className={s.faqIntro}>
          <p className={s.eyebrow}>Clarity before commitment</p>
          <h2 id="faq-title" className={s.sectionTitle}>
            Good questions.
            <br />
            <em>Straight answers.</em>
          </h2>
          <a href="/faq" className={s.textLink}>
            Visit the full FAQ <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className={s.faqList}>
          {questions.map((item, i) => (
            <details key={item.question} className={s.faqItem} name="opus-faq" open={i === 0}>
              <summary>
                {item.question}
                <span className={s.faqIcon} aria-hidden="true" />
              </summary>
              <div className={s.faqAnswer}>
                <p>{item.answer}</p>
                <a href={item.href} className={s.textLink}>
                  {item.label} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ── Closing ──────────────────────────────────────────────────────── */}
      <section className={s.closing} aria-labelledby="closing-title">
        <div className={s.closingGlow} aria-hidden="true" />
        <p className={s.eyebrow}>Your next step can be a small one</p>
        <h2 id="closing-title" className={s.closingTitle}>
          Let’s find
          <br />
          <em>your starting point.</em>
        </h2>
        <p className={s.closingCopy}>
          Tell us about your space and what you’re exploring. We’ll help you understand the options.
        </p>
        <div className={s.closingActions}>
          <OpusLink href="/consultation" source="closing" primary className={s.buttonLight}>
            Start a conversation <span aria-hidden="true">↗</span>
          </OpusLink>
          <OpusLink href="/contact" source="closing" className={s.buttonGhost}>
            Contact us directly
          </OpusLink>
        </div>
        <dl className={s.accountability}>
          <div>
            <dt>Editorial ownership</dt>
            <dd>{siteOwnership.editorial.team}</dd>
          </div>
          <div>
            <dt>Equipment enquiries</dt>
            <dd>{siteOwnership.commerce.team}</dd>
          </div>
          <div>
            <dt>Last reviewed</dt>
            <dd>
              <time dateTime={reviewed.iso}>{reviewed.label}</time>
            </dd>
          </div>
        </dl>
      </section>

      <OpusFooter />
    </div>
  );
}
