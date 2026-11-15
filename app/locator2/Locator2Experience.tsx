import {
  partnerDirectoryMeta,
  partnerRequestChecklist,
  partnerTypeDescriptions,
  partnerTypeLabels,
  type PartnerType,
} from '@/content/partners';
import { siteEntity } from '@/content/site-entity';
import { buildLocatorContactHref } from '@/lib/contact-prefill';
import {
  LOCATOR2_ROUTE_ACTION_READY_STATUS_MESSAGE,
  LOCATOR2_ROUTE_ACTION_STATUS_ID,
  Locator2TrackedLink,
} from './Locator2TrackedLink';
import styles from './locator2.module.css';

const introductionTypes = (Object.keys(partnerTypeLabels) as PartnerType[]).map((type) => ({
  type,
  label: partnerTypeLabels[type],
  description: partnerTypeDescriptions[type],
}));

const formattedPartnerReviewDate = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'long',
}).format(new Date(`${partnerDirectoryMeta.lastReviewed}T00:00:00.000Z`));

const supportRoutes = [
  { href: '/about', label: 'About Hylono' },
  { href: '/help', label: 'Help' },
  { href: '/contact', label: 'Contact' },
  { href: '/rental', label: 'Rental' },
] as const;

const requestSteps = [
  {
    title: 'Directory posture',
    body: partnerDirectoryMeta.verificationLabel,
    detail: partnerDirectoryMeta.supportScopeLabel,
  },
  {
    title: 'What changed',
    body: partnerDirectoryMeta.coverageLabel,
    detail: partnerDirectoryMeta.nextStepLabel,
  },
  {
    title: 'Support context',
    body: siteEntity.description,
    detail:
      'Use contact for introductions, then keep help and policy pages visible while you compare next steps.',
  },
] as const;

const supportFacts = [
  { label: 'Page status', value: 'Public locator while partner records are reviewed' },
  { label: 'Service area', value: siteEntity.serviceArea },
  { label: 'Support hours', value: siteEntity.supportHours },
] as const;

export function Locator2Experience() {
  return (
    <div className={styles.pageShell}>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>Partner introductions</p>
              <h1 id="locator-hero-headline" className={styles.headline}>
                Request a Hylono partner introduction
              </h1>
              <p id="locator-hero-description" className={styles.summary}>
                Tell Hylono where you are, which technology you want to explore, and whether you
                need a demo, guided access, rental, or purchase support. The public locator stays
                focused on manual introduction requests while partner records are reviewed.
              </p>
              <p
                id={LOCATOR2_ROUTE_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Locator2 route action status"
                className="sr-only"
              >
                {LOCATOR2_ROUTE_ACTION_READY_STATUS_MESSAGE}
              </p>

              <div className={styles.signalGrid}>
                <article className={styles.signalCard}>
                  <p className={styles.signalLabel}>Last reviewed</p>
                  <p className={styles.signalValue}>{formattedPartnerReviewDate}</p>
                </article>
                <article className={styles.signalCard}>
                  <p className={styles.signalLabel}>Coverage</p>
                  <p className={styles.signalValue}>{siteEntity.supportCoverageLabel}</p>
                </article>
                <article className={styles.signalCard}>
                  <p className={styles.signalLabel}>Support email</p>
                  <a
                    className={styles.inlineSignalLink}
                    href={`mailto:${siteEntity.supportEmail}`}
                    aria-describedby={LOCATOR2_ROUTE_ACTION_STATUS_ID}
                  >
                    {siteEntity.supportEmail}
                  </a>
                </article>
              </div>

              <section
                aria-labelledby="locator-directory-status"
                className={styles.storyPanel}
              >
                <div className={styles.storyHeader}>
                  <div>
                    <p className={styles.storyEyebrow}>Directory status</p>
                    <h2 id="locator-directory-status" className={styles.sectionTitle}>
                      How introduction requests work
                    </h2>
                  </div>
                  <p className={styles.storyMeta}>Last reviewed: {formattedPartnerReviewDate}</p>
                </div>

                <div className={styles.storyGrid}>
                  {requestSteps.map((step, index) => (
                    <article key={step.title} className={styles.storyCard}>
                      <span className={styles.storyIndex}>{`0${index + 1}`}</span>
                      <h3 className={styles.storyTitle}>{step.title}</h3>
                      <p className={styles.storyBody}>{step.body}</p>
                      <p className={styles.storyDetail}>{step.detail}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.requestRail}>
              <p className={styles.railEyebrow}>Hylono support context</p>
              <h2 className={styles.railTitle}>Choose one clear request path</h2>
              <p className={styles.railCopy}>
                Coverage: {siteEntity.supportCoverageLabel}. Support hours: {siteEntity.supportHours}
                .
              </p>

              <dl className={styles.factGrid}>
                {supportFacts.map((fact) => (
                  <div key={fact.label} className={styles.factCard}>
                    <dt className={styles.factLabel}>{fact.label}</dt>
                    <dd className={styles.factValue}>{fact.value}</dd>
                  </div>
                ))}
                <div className={styles.factCard}>
                  <dt className={styles.factLabel}>Support email</dt>
                  <dd className={styles.factValue}>
                    <a
                      className={styles.railEmail}
                      href={`mailto:${siteEntity.supportEmail}`}
                      aria-describedby={LOCATOR2_ROUTE_ACTION_STATUS_ID}
                    >
                      {siteEntity.supportEmail}
                    </a>
                  </dd>
                </div>
              </dl>

              <Locator2TrackedLink
                href={buildLocatorContactHref({ intent: 'curious' })}
                className={styles.primaryAction}
                ctaRole="primary"
                eventName="locator2_route_cta_clicked"
                primaryCta
                source="hero"
                statusMessage="Opening contact with guided locator introduction context."
              >
                Request guided introduction
              </Locator2TrackedLink>

              <div className={styles.secondaryActions}>
                <Locator2TrackedLink
                  href="/help"
                  className={styles.secondaryAction}
                  ctaRole="supporting"
                  eventName="locator2_route_transition_clicked"
                  source="hero"
                  statusMessage="Opening help from the locator introduction route."
                >
                  Review support options
                </Locator2TrackedLink>
                <Locator2TrackedLink
                  href={buildLocatorContactHref({ intent: 'rental' })}
                  className={styles.secondaryAction}
                  ctaRole="supporting"
                  eventName="locator2_route_cta_clicked"
                  source="hero"
                  statusMessage="Opening contact with rental alternatives context."
                >
                  Ask about rental alternatives
                </Locator2TrackedLink>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.routesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Choose the option you need</h2>
            <p className={styles.sectionCopy}>
              Each option uses the same contact path, but it preserves the request type in
              the request context so the team can direct you faster.
            </p>
          </div>

          <div className={styles.routesGrid}>
            {introductionTypes.map(({ type, label, description }) => (
              <article key={type} className={styles.routeCard}>
                <p className={styles.routeLabel}>{label}</p>
                <h3 className={styles.routeTitle}>{label} introduction</h3>
                <p className={styles.routeDescription}>{description}</p>
                <Locator2TrackedLink
                  href={buildLocatorContactHref({
                    intent: 'curious',
                    partnerType: label,
                  })}
                  className={styles.routeAction}
                  ctaRole="contextual"
                  eventName="locator2_route_cta_clicked"
                  source="partner_type"
                  statusMessage={`Opening contact with ${label} introduction context.`}
                >
                  Start {label}
                </Locator2TrackedLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.detailSection}>
        <div className={styles.container}>
          <div className={styles.detailGrid}>
            <article className={styles.checklistCard}>
              <h2 className={styles.sectionTitle}>What to include in your request</h2>
              <p className={styles.sectionCopy}>
                The more precise the request, the easier it is to move you toward the right manual
                next step without publishing unreviewed partner listings.
              </p>

              <ul className={styles.checklist}>
                {partnerRequestChecklist.map((item, index) => (
                  <li key={item} className={styles.checklistItem}>
                    <span className={styles.checklistIndex}>{`0${index + 1}`}</span>
                    <span className={styles.checklistText}>{item}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.inlineActions}>
                <Locator2TrackedLink
                  href={buildLocatorContactHref({ intent: 'curious' })}
                  className={styles.inlineAction}
                  ctaRole="primary"
                  eventName="locator2_route_cta_clicked"
                  source="request_checklist"
                  statusMessage="Opening contact with locator introduction request context."
                >
                  Start introduction request
                </Locator2TrackedLink>
                <Locator2TrackedLink
                  href="/help"
                  className={styles.inlineAction}
                  ctaRole="supporting"
                  eventName="locator2_route_transition_clicked"
                  source="request_checklist"
                  statusMessage="Opening help from the locator introduction checklist."
                >
                  Review support options
                </Locator2TrackedLink>
              </div>
            </article>

            <aside className={styles.contextCard}>
              <h2 className={styles.sectionTitle}>Hylono support context</h2>
              <p className={styles.sectionCopy}>{siteEntity.description}</p>

              <dl className={styles.contextFacts}>
                <div>
                  <dt className={styles.contextLabel}>Support email</dt>
                  <dd>
                    <a
                      className={styles.contextLink}
                      href={`mailto:${siteEntity.supportEmail}`}
                      aria-describedby={LOCATOR2_ROUTE_ACTION_STATUS_ID}
                    >
                      {siteEntity.supportEmail}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className={styles.contextLabel}>Support hours</dt>
                  <dd>{siteEntity.supportHours}</dd>
                </div>
                <div>
                  <dt className={styles.contextLabel}>Service area</dt>
                  <dd>{siteEntity.serviceArea}</dd>
                </div>
              </dl>

              <div className={styles.contextFooter}>
                <p className={styles.contextLabel}>Related support pages</p>
                <ul className={styles.supportRouteList}>
                  {supportRoutes.map((route) => (
                    <li key={route.href}>
                      <Locator2TrackedLink
                        href={route.href}
                        className={styles.contextLink}
                        ctaRole="supporting"
                        eventName="locator2_route_transition_clicked"
                        source="support_context"
                        statusMessage={`Opening ${route.label} from the locator introduction route.`}
                      >
                        {route.label}
                      </Locator2TrackedLink>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
