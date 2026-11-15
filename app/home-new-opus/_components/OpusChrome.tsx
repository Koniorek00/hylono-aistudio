import { siteEntity } from '@/content/site-entity';
import { OpusLink } from './OpusLink';
import s from './opus.module.css';

const navItems = [
  { href: '#atlas', label: 'Technologies' },
  { href: '#route', label: 'Find your route' },
  { href: '#evidence', label: 'Evidence' },
  { href: '#journey', label: 'How it works' },
] as const;

export function OpusHeader() {
  return (
    <header className={s.header}>
      <div className={s.headerInner}>
        <a className={s.wordmark} href="/" aria-label="Hylono home">
          <span className={s.wordmarkMark} aria-hidden="true" />
          hylono
        </a>
        <nav className={s.headerNav} aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a href="/store">Equipment</a>
        </nav>
        <OpusLink href="/consultation" source="header" className={s.headerCta}>
          Find your fit <span aria-hidden="true">↗</span>
        </OpusLink>
        <details className={s.mobileMenu}>
          <summary>
            <span className={s.srOnly}>Open navigation</span>
            <span className={s.menuIcon} aria-hidden="true" />
          </summary>
          <nav aria-label="Mobile navigation" className={s.mobileNav}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
            <a href="/store">Equipment</a>
            <a href="/consultation" className={s.mobileNavCta}>
              Start a consultation ↗
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}

const footerColumns = [
  {
    title: 'Explore',
    links: [
      { href: '/store', label: 'All equipment' },
      { href: '/conditions', label: 'Wellness goals' },
      { href: '/protocols', label: 'Routine guidance' },
      { href: '/research', label: 'Research library' },
    ],
  },
  {
    title: 'Access',
    links: [
      { href: '/rental', label: 'Rental pathway' },
      { href: '/financing', label: 'Financing' },
      { href: '/for-home', label: 'For your home' },
      { href: '/for-professionals', label: 'For professionals' },
    ],
  },
  {
    title: 'Here to help',
    links: [
      { href: '/contact', label: 'Contact us' },
      { href: '/help', label: 'Support centre' },
      { href: '/faq', label: 'Your questions' },
      { href: '/safety-and-standards', label: 'Safety & standards' },
    ],
  },
] as const;

const policyLinks = [
  { href: '/shipping', label: 'Shipping' },
  { href: '/returns', label: 'Returns' },
  { href: '/warranty', label: 'Warranty' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookie-policy', label: 'Cookies' },
] as const;

export function OpusFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <div className={s.footerBrand}>
          <a href="/" className={s.footerWordmark}>
            hylono
          </a>
          <p>Considered technology. Room for everyday life.</p>
        </div>
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title} className={s.footerColumn}>
            <p className={s.footerTitle}>{column.title}</p>
            {column.links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        ))}
        <address className={s.footerContact}>
          <p className={s.footerTitle}>A real conversation</p>
          <a href={`mailto:${siteEntity.contactEmail}`}>{siteEntity.contactEmail}</a>
          <a href={siteEntity.phoneHref}>{siteEntity.phone}</a>
          <span>{siteEntity.supportHours}</span>
          <span>{siteEntity.serviceArea}</span>
        </address>
      </div>
      <div className={s.footerBase}>
        <p>
          © {siteEntity.name} · {siteEntity.legalName}. Wellness technology education and equipment
          guidance. Not a substitute for professional care.
        </p>
        <nav aria-label="Policies" className={s.footerPolicies}>
          {policyLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
