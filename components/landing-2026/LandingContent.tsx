import { siteOwnership } from '@/content/site-entity';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LandingLink } from './LandingLink';
import { LandingPicture } from './LandingPicture';
import styles from './styles';
const updated = '2026-10-02';
// Inline only this page's small critical visual system; the shared site CSS stays separate.
const landingCss = readFileSync(join(process.cwd(), 'public/styles/landing-2026.css'), 'utf8');
// The compact mobile hero arrives with HTML, avoiding a separate high-latency image request.
const mobileHero = `data:image/avif;base64,${readFileSync(join(process.cwd(), 'public/images/landing-2026/room-mobile.avif')).toString('base64')}`;

const technologies = [
  {
    number: '01',
    symbol: 'O₂',
    name: 'Hyperbaric oxygen',
    short: 'HBOT',
    color: 'oxygen',
    copy: 'A chamber-based session with a controlled pressure environment. Start with the equipment, space and operating requirements.',
    path: '/product/hbot',
    action: 'Explore oxygen systems',
    detail: 'Chamber systems · Guided setup',
  },
  {
    number: '02',
    symbol: 'H₂',
    name: 'Molecular hydrogen',
    short: 'HYDROGEN',
    color: 'hydrogen',
    copy: 'Hydrogen-generation equipment for dedicated wellness routines. Compare formats, output specifications and everyday use.',
    path: '/product/hydrogen',
    action: 'Explore hydrogen systems',
    detail: 'Generation systems · Format comparison',
  },
  {
    number: '03',
    symbol: 'Light',
    name: 'Red & near-infrared light',
    short: 'RLT',
    color: 'light',
    copy: 'Light-based equipment defined by wavelength, exposure and placement. Get to know the technology before choosing a system.',
    path: '/product/rlt',
    action: 'Understand light technology',
    detail: 'Technology guide · Research context',
  },
  {
    number: '04',
    symbol: 'Field',
    name: 'Pulsed electromagnetic fields',
    short: 'PEMF',
    color: 'field',
    copy: 'An introduction to pulsed-field devices and the parameters that distinguish them. Explore the evidence and its limits.',
    path: '/product/pemf',
    action: 'Understand pulsed fields',
    detail: 'Technology guide · Research context',
  },
] as const;

const questions = [
  {
    question: 'Where do I start if I’m new to this?',
    answer:
      'Start with your available space, the time you can set aside and what you want to understand. A Hylono consultation helps you compare equipment and access options; suitability questions should also be discussed with an appropriately qualified professional.',
    href: '/consultation',
    label: 'Start a conversation',
  },
  {
    question: 'Can I rent before considering a purchase?',
    answer:
      'Explore the rental pathway and ask about the equipment you are considering. Availability, duration, delivery and costs depend on the model and your location. Confirm the written terms before making a commitment.',
    href: '/rental',
    label: 'Review the rental pathway',
  },
  {
    question: 'What does the research actually tell me?',
    answer:
      'Research examines particular devices, parameters and populations. A study of a modality does not establish an outcome for every device or person. The library presents source records and limitations so you can make a more informed decision.',
    href: '/research',
    label: 'Read the research library',
  },
  {
    question: 'What should I check before equipment arrives?',
    answer:
      'Check dimensions, access to your room, power requirements and the operating instructions for the chosen system. Discuss delivery, installation, onboarding and ongoing support with Hylono before confirming your order.',
    href: '/delivery-installation-onboarding',
    label: 'Plan delivery and setup',
  },
] as const;

export function LandingContent() {
  return (
    <>
      <style id="landing-2026-styles" dangerouslySetInnerHTML={{ __html: landingCss }} />
      <link
        rel="preload"
        as="font"
        type="font/woff2"
        href="/fonts/landing-2026/cormorant-latin-regular.woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        as="font"
        type="font/woff2"
        href="/fonts/landing-2026/cormorant-latin-italic.woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        as="image"
        media="(min-width: 761px)"
        type="image/avif"
        href="/images/landing-2026/room-1440.avif"
        imageSrcSet="/images/landing-2026/room-640.avif 640w, /images/landing-2026/room-960.avif 960w, /images/landing-2026/room-1440.avif 1440w, /images/landing-2026/room-1920.avif 1920w"
        imageSizes="(max-width: 760px) calc(100vw - 32px), (max-width: 1440px) calc(100vw - 96px), 1344px"
        fetchPriority="high"
      />
      <div className={styles.landing}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroIntro}>
            <div>
              <p className={styles.eyebrow}>
                <span className={styles.liveDot} aria-hidden="true" /> A considered approach to
                wellness
              </p>
              <h1 id="hero-title">
                Make room for <br />
                <em>a better routine.</em>
              </h1>
            </div>
            <div className={styles.heroAside}>
              <p id="hero-copy">
                Wellness technology, made approachable. Equipment, research and guidance for your
                home or professional space.
              </p>
              <LandingLink href="/consultation" source="hero" primary className={styles.primary}>
                Find your starting point <span aria-hidden="true">↗</span>
              </LandingLink>
              <LandingLink href="#technologies" source="hero" className={styles.textLink}>
                Explore technologies <span aria-hidden="true">↓</span>
              </LandingLink>
            </div>
          </div>
          <figure className={styles.heroFigure}>
            <LandingPicture
              name="room"
              hero
              mobileHero={mobileHero}
              alt="Concept interior: a sunlit stone wellness room with an ivory chaise overlooking a quiet lake."
            />
            <div className={styles.photoNote}>
              <span>
                Technology has a place.
                <br />
                So do you.
              </span>
              <a href="/for-home">
                Explore the home pathway <span aria-hidden="true">↗</span>
              </a>
            </div>
            <figcaption className={styles.heroCaption}>
              <span>01 / Room to begin</span>
              <span>Concept interior · AI-generated</span>
            </figcaption>
          </figure>
          <nav className={styles.pageIndex} aria-label="On this page">
            <a href="#technologies">
              <span>01</span> Find your technology <span aria-hidden="true">↗</span>
            </a>
            <a href="#your-routine">
              <span>02</span> Build your understanding <span aria-hidden="true">↗</span>
            </a>
            <a href="#your-space">
              <span>03</span> Choose your way in <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </section>

        <section id="technologies" className={styles.atlas} aria-labelledby="atlas-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>01 / The technology atlas</p>
              <h2 id="atlas-title">
                Different by design.
                <br />
                <em>Chosen with care.</em>
              </h2>
            </div>
            <div>
              <p>
                Four technologies. Different equipment, operating parameters and evidence.
                Understand what sets each apart.
              </p>
              <a href="/store" className={styles.textLink}>
                Browse the equipment collection <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
          <div className={styles.technologyGrid}>
            {technologies.map((tech) => (
              <article key={tech.short} className={`${styles.technology} ${styles[tech.color]}`}>
                <div className={styles.techTop}>
                  <span className={styles.eyebrow}>
                    {tech.number} / {tech.short}
                  </span>
                  <span className={styles.techSymbol} aria-hidden="true">
                    {tech.symbol}
                  </span>
                </div>
                <h3>{tech.name}</h3>
                <p>{tech.copy}</p>
                <div className={styles.techBottom}>
                  <span>{tech.detail}</span>
                  <LandingLink href={tech.path} source="technology-atlas">
                    {tech.action}
                    <span className={styles.circleArrow} aria-hidden="true">
                      ↗
                    </span>
                  </LandingLink>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="your-routine" className={styles.routine} aria-labelledby="routine-title">
          <figure className={styles.routineFigure}>
            <LandingPicture
              name="ritual"
              alt="Concept still life: a glass of water and folded linen on sunlit travertine beside a lake."
            />
            <figcaption>
              02 / A moment, made intentional
              <br />
              <span>Concept still life · AI-generated</span>
            </figcaption>
          </figure>
          <div className={styles.routineCopy}>
            <p className={styles.eyebrow}>02 / More than the equipment</p>
            <h2 id="routine-title">
              Begin with your life.
              <br />
              <em>Then the technology.</em>
            </h2>
            <p className={styles.lead}>
              The right starting point is a routine you can make space for.
            </p>
            <p>
              Consider your priorities, understand the research and compare equipment before
              committing. Hylono connects those decisions, so your next step feels clear.
            </p>
            <ol className={styles.steps}>
              <li>
                <span>01</span>
                <div>
                  <h3>Name your priority.</h3>
                  <p>Explore wellness goals and the questions worth asking.</p>
                  <a href="/conditions">Explore your goals ↗</a>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>Look beneath the promise.</h3>
                  <p>Read the sources, studied settings and limitations.</p>
                  <a href="/research">Explore the evidence ↗</a>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>Give it a practical place.</h3>
                  <p>Review usage guidance and how equipment fits daily life.</p>
                  <a href="/protocols">Explore routine guidance ↗</a>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section id="your-space" className={styles.access} aria-labelledby="access-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>03 / Your space. Your pace.</p>
              <h2 id="access-title">
                A considered way in.
                <br />
                <em>For wherever you begin.</em>
              </h2>
            </div>
            <p>
              Start with a conversation about your space, equipment and access options. Confirm the
              details before you make a commitment.
            </p>
          </div>
          <div className={styles.accessGrid}>
            <article>
              <span className={styles.eyebrow}>For your home</span>
              <h3>
                Your own space.
                <br />
                Your everyday rhythm.
              </h3>
              <p>
                Understand the footprint, setup and operating requirements. Find equipment that fits
                the room—and the time you have.
              </p>
              <LandingLink source="home-pathway" className={styles.secondary} href="/for-home">
                Plan a home setup <span aria-hidden="true">↗</span>
              </LandingLink>
            </article>
            <article>
              <span className={styles.eyebrow}>For professionals</span>
              <h3>
                A thoughtful addition
                <br />
                to your practice.
              </h3>
              <p>
                Compare documentation, onboarding and support for your professional setting. Discuss
                the practical requirements with Hylono.
              </p>
              <LandingLink
                source="professional-pathway"
                className={styles.secondary}
                href="/for-professionals"
              >
                Explore professional access <span aria-hidden="true">↗</span>
              </LandingLink>
            </article>
          </div>
          <div className={styles.rentalRow}>
            <div>
              <p className={styles.eyebrow}>Rental or ownership</p>
              <h3>Choose the commitment that fits.</h3>
            </div>
            <p>
              Ask about model availability, rental terms and purchase options. Clear details first.
              Your decision after.
            </p>
            <LandingLink
              source="rental-comparison"
              href="/compare/rent-vs-buy"
              className={styles.textLink}
            >
              Compare your options ↗
            </LandingLink>
          </div>
          <nav className={styles.supportPaths} aria-label="Plan your equipment access">
            <a href="/rental">Rental pathway ↗</a>
            <a href="/delivery-installation-onboarding">Delivery & onboarding ↗</a>
            <a href="/service-and-support">Ongoing support ↗</a>
          </nav>
        </section>

        <section className={styles.questions} aria-labelledby="questions-title">
          <div>
            <p className={styles.eyebrow}>Clarity before commitment</p>
            <h2 id="questions-title">
              Good questions.
              <br />
              <em>Clear starting points.</em>
            </h2>
            <a href="/faq" className={styles.textLink}>
              Visit the full FAQ ↗
            </a>
          </div>
          <div className={styles.questionList}>
            {questions.map((item, i) => (
              <details key={item.question} open={i === 0}>
                <summary>
                  {item.question}
                  <span className={styles.questionPlus} aria-hidden="true">
                    +
                  </span>
                </summary>
                <div>
                  <p>{item.answer}</p>
                  <a href={item.href}>{item.label} ↗</a>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section
          className={styles.trust}
          id="home-medical-disclaimer"
          aria-labelledby="trust-title"
        >
          <div>
            <p className={styles.eyebrow}>Perspective matters</p>
            <h2 id="trust-title">
              An informed choice
              <br />
              <em>starts with context.</em>
            </h2>
            <p>
              Published research explores specific parameters and populations. Individual responses
              vary, and evidence for a modality does not establish results for every device or
              routine.
            </p>
            <p>
              Hylono provides wellness technology education and equipment guidance. It does not
              replace professional care. Discuss personal suitability with an appropriately
              qualified professional.
            </p>
            <a href="/safety-and-standards" className={styles.textLink}>
              Read the safety guidance ↗
            </a>
          </div>
          <aside aria-label="Ownership and freshness" className={styles.ownership}>
            <span className={styles.eyebrow}>Accountability, in the open</span>
            <dl>
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
                  <time dateTime={updated}>2 October 2026</time>
                  <small>Landing-page content and presentation</small>
                </dd>
              </div>
            </dl>
            <a href="/research">Explore the evidence ↗</a>
            <a href="/about">Meet Hylono ↗</a>
          </aside>
        </section>

        <section className={styles.closing} aria-labelledby="closing-title">
          <span className={styles.eyebrow}>Your next step can be a small one</span>
          <h2 id="closing-title">
            Let’s find
            <br />
            <em>your starting point.</em>
          </h2>
          <p>
            Tell us about your space and what you’re exploring.
            <br />
            We’ll help you understand the options.
          </p>
          <LandingLink href="/consultation" source="closing" primary className={styles.primary}>
            Start a conversation <span aria-hidden="true">↗</span>
          </LandingLink>
          <a href="/contact" className={styles.textLink}>
            Or contact us directly ↗
          </a>
        </section>
      </div>
    </>
  );
}
