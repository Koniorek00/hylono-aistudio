import { siteEntity } from '@/content/site-entity';
import styles from './styles';
import { LandingLink } from './LandingLink';
import { CookiePreferencesButton } from './LandingConsent';

export function LandingHeader() {
  return (
    <>
      <header className={styles.header}>
        <a className={styles.wordmark} href="/" aria-label="Hylono home">
          <span className={styles.brandMark} aria-hidden="true" />
          hylono<span className={styles.wordmarkDot}>.</span>
        </a>
        <nav className={styles.desktopNav} aria-label="Main navigation">
          <a href="#technologies">The technologies</a>
          <a href="/research">The evidence</a>
          <a href="/rental">Rental & purchase</a>
          <a href="/about">Our approach</a>
        </nav>
        <LandingLink href="/consultation" source="header" className={styles.headerCta}>
          Let’s find your fit <span aria-hidden="true">↗</span>
        </LandingLink>
        <details className={styles.mobileNav}>
          <summary aria-label="Menu — open navigation">
            Menu <span aria-hidden="true">+</span>
          </summary>
          <nav aria-label="Mobile navigation">
            <a href="#technologies">The technologies</a>
            <a href="/research">The evidence</a>
            <a href="/rental">Rental & purchase</a>
            <a href="/about">Our approach</a>
            <a href="/consultation">Start a consultation ↗</a>
          </nav>
        </details>
      </header>
      <div className={styles.headerSpace} aria-hidden="true" />
    </>
  );
}

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div>
          <a href="/" className={styles.footerBrand}>
            hylono.
          </a>
          <p>
            Considered technology.
            <br />
            Room for everyday life.
          </p>
        </div>
        <nav aria-label="Explore Hylono">
          <span>Explore</span>
          <a href="/store">All equipment</a>
          <a href="/conditions">Wellness goals</a>
          <a href="/protocols">Routine guidance</a>
          <a href="/research">Research library</a>
        </nav>
        <nav aria-label="Help and trust">
          <span>Here to help</span>
          <a href="/contact">Contact us</a>
          <a href="/help">Support centre</a>
          <a href="/faq">Your questions</a>
          <a href="/safety-and-standards">Safety & standards</a>
        </nav>
        <div className={styles.footerContact}>
          <span>A real conversation</span>
          <a href={`mailto:${siteEntity.contactEmail}`}>{siteEntity.contactEmail}</a>
          <a href={siteEntity.phoneHref}>{siteEntity.phone}</a>
          <p>
            {siteEntity.supportHours}
            <br />
            {siteEntity.serviceArea}
          </p>
        </div>
      </div>
      <nav className={styles.policyNav} aria-label="Policies">
        <a href="/shipping">Delivery</a>
        <a href="/returns">Returns</a>
        <a href="/warranty">Warranty</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/cookie-policy">Cookies</a>
        <CookiePreferencesButton />
        <a href="/policies">Policies hub</a>
      </nav>
      <div className={styles.footerBottom}>
        <span>© 2026 Hylono · {siteEntity.legalName}</span>
        <span>Where mind connects with matter.</span>
        <a href="#main-content">Back to top ↑</a>
      </div>
    </footer>
  );
}
