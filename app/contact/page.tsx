import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Headphones,
  MapPin,
  ShoppingCart,
} from 'lucide-react';
import { PageOwnership } from '@/components/content/PageOwnership';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import StructuredData from '@/src/components/StructuredData';
import {
  ORGANIZATION_ID,
  createBreadcrumbSchema,
  createWebPageSchema,
  SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import { ContactClient } from './ContactClient';
import {
  CONTACT_ROUTE_ACTION_STATUS_ID,
  ContactRouteActionStatus,
  ContactTrackedLink,
} from './ContactTrackedLink';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const displayReviewDate = new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`).toLocaleDateString(
  'en-US',
  {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
);

const heroPrimaryStyle =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-medium text-white transition-all hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 shadow-sm';
const heroSecondaryStyle =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-white/70 backdrop-blur-sm px-6 py-3.5 text-sm font-medium text-slate-800 transition-all hover:bg-white hover:border-slate-400 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950';
const darkBannerCtaStyle =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/40 bg-slate-950/60 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
const exploreCardLinkStyle =
  'group flex flex-col justify-between min-h-[160px] rounded-2xl border border-slate-200/80 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950';
const stewardshipLinkStyle =
  'inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950';

const requestDetails = [
  { title: 'Product guidance', description: 'Tell us which technology interests you, where you would use it, and what you want to understand before choosing.' },
  { title: 'Rental planning', description: 'Include the device, delivery country, preferred start date, and any questions about installation or rental terms.' },
  { title: 'Existing device support', description: 'Share the model, order or rental reference, when the issue started, and what you have already tried.' },
  { title: 'Clinic / B2B', description: 'Include your organization, location, available space, and the scale and timing of your project.' },
];

function ContactFormFallback() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
      <div id="contact-form" className="scroll-mt-28 rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-sm">
        <h2 className="font-editorial text-2xl font-normal text-slate-900">Send your request</h2>
        <p className="mt-4 text-sm leading-7 text-slate-500">
          The contact form is loading. You can also email{' '}
          <a className="text-slate-900 underline underline-offset-4 hover:text-cyan-600" href={`mailto:${siteEntity.contactEmail}`} aria-describedby={CONTACT_ROUTE_ACTION_STATUS_ID}>{siteEntity.contactEmail}</a>.
        </p>
      </div>
    </section>
  );
}

function ContactRouteShell() {
  return (
    <>
      <ContactRouteActionStatus />

      {/* Hero Section — Sunlit Alpine Lake Glass Villa */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white pt-6 pb-16 sm:pt-8 sm:pb-24 lg:pt-10 lg:pb-32">
        {/* Background Panorama with smooth gradient fade to white */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-full sm:w-[70%] lg:w-[62%] bg-[url('/images/contact/hero-villa-clean.jpg')] bg-cover bg-[right_top] sm:bg-right [mask-image:linear-gradient(to_left,black_60%,transparent_100%)] opacity-95"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-white/85 to-transparent sm:hidden"
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-slate-600">
            <Link href="/" className="text-slate-600 hover:text-slate-900 transition-colors">
              Home
            </Link>
            <span className="text-slate-400" aria-hidden="true">›</span>
            <span className="text-slate-900 font-medium">Contact</span>
          </nav>

          {/* Technical Metadata Tag */}
          <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            <span>INTAKE GATEWAY v2.4 / EU</span>
          </div>

          {/* Editorial Display Heading */}
          <h1
            id="contact-hero-headline"
            className="font-editorial mt-4 max-w-2xl break-words text-4xl font-normal leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
          >
            Let’s find your
            <br className="hidden sm:block" /> next step.
          </h1>

          {/* Subtitle / Description */}
          <p
            id="contact-hero-description"
            className="mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600"
          >
            Choosing a system, planning a rental, or looking for device support? Tell us what you
            need. The Hylono team will help you explore your options.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ContactTrackedLink
              href="#contact-form"
              eventName="contact_route_cta_clicked"
              ctaRole="primary"
              source="hero"
              className={heroPrimaryStyle}
            >
              <span>Send a message</span>
              <ArrowRight size={15} aria-hidden="true" />
            </ContactTrackedLink>
            <ContactTrackedLink
              href="/help"
              eventName="contact_support_route_clicked"
              ctaRole="supporting"
              source="hero_self_serve"
              className={heroSecondaryStyle}
            >
              <span>Visit the help center</span>
              <ExternalLink size={14} className="text-slate-500" aria-hidden="true" />
            </ContactTrackedLink>
          </div>
        </div>
      </section>

      {/* Main Interactive Form & Channels Section */}
      <section
        aria-label="Contact form and direct channels"
        className="bg-white"
      >
        <Suspense fallback={<ContactFormFallback />}>
          <ContactClient />
        </Suspense>
      </section>

      {/* Guidance Section — Contained Protocol Card */}
      <section id="contact-guidance" className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-xs grid lg:grid-cols-12 items-stretch">
            {/* Left Column: Atmospheric Lake Image */}
            <div className="relative lg:col-span-6 flex flex-col justify-between overflow-hidden bg-slate-950 bg-[url('/images/contact/guidance-lake-dark.jpg')] bg-cover bg-center text-white p-8 sm:p-10 lg:p-12 min-h-[380px]">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-slate-950/15" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                  <span>SPEC // GUIDANCE PROTOCOL</span>
                </div>
                <h2 className="font-editorial mt-3 text-2xl sm:text-3xl lg:text-[34px] font-normal leading-[1.15] tracking-tight text-white">
                  A few details go a long way.
                </h2>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-200">
                  Start with your country and the question you would like answered. <span className="underline underline-offset-4 decoration-slate-400">Open</span> a topic for
                  a few useful details to include.
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <ContactTrackedLink
                  href="#contact-form"
                  eventName="contact_route_cta_clicked"
                  ctaRole="primary"
                  source="routing_checklist"
                  className={darkBannerCtaStyle}
                >
                  <span>Add these details</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </ContactTrackedLink>
              </div>
            </div>

            {/* Right Column: Clean Light Numbered Protocol List */}
            <div className="lg:col-span-6 flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-10">
              <div className="divide-y divide-slate-100 w-full">
                {requestDetails.map((item, idx) => (
                  <details key={item.title} className="group py-3.5 first:pt-0 last:pb-0 transition-colors">
                    <summary className="flex min-h-11 cursor-pointer items-center justify-between text-sm font-medium text-slate-800 transition-colors hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-950 list-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center gap-3.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[11px] font-normal text-slate-600">
                          0{idx + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-900">{item.title}</span>
                      </span>
                      <span className="ml-auto text-slate-400 transition-transform duration-200 group-open:rotate-90 group-hover:text-slate-950">
                        →
                      </span>
                    </summary>
                    <p className="mt-2 pl-9.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </details>
                ))}

                <details className="group py-3.5 last:pb-0 transition-colors">
                  <summary className="flex min-h-11 cursor-pointer items-center justify-between text-sm font-medium text-slate-800 transition-colors hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-950 list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center gap-3.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 font-mono text-[11px] font-normal text-slate-600">
                        05
                      </span>
                      <span className="text-sm font-medium text-slate-900">Prefer a callback?</span>
                    </span>
                    <span className="ml-auto text-slate-400 transition-transform duration-200 group-open:rotate-90 group-hover:text-slate-900">
                      →
                    </span>
                  </summary>
                  <p className="mt-2 pl-9.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                    Choose a preferred time in the form, and include your timezone and phone number in
                    your message. Your selection is a request. The team must confirm availability
                    before a call is booked.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "Other ways to get started" Section */}
      <section className="border-b border-slate-100 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600">
              STILL EXPLORING?
            </p>
            <h2 className="font-editorial mt-1 text-2xl sm:text-3xl font-normal tracking-tight text-slate-900">
              Other ways to get started
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {/* Card 1: Compare Systems */}
            <ContactTrackedLink
              href="/store"
              eventName="contact_support_route_clicked"
              ctaRole="supporting"
              source="hero_self_serve"
              aria-label="Compare systems"
              className="group flex flex-col justify-between min-h-[220px] h-full rounded-2xl border border-slate-200/80 bg-[#fbfbfb] p-6 sm:p-7 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs"
            >
              <div>
                <div className="text-slate-700 mb-5">
                  <ShoppingCart size={22} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="!font-sans text-base font-medium text-slate-900 normal-case tracking-normal">Compare systems</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Explore devices and features.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <span className="text-sm font-normal text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" aria-hidden="true">→</span>
              </div>
            </ContactTrackedLink>

            {/* Card 2: Explore Rentals */}
            <ContactTrackedLink
              href="/rental"
              eventName="contact_support_route_clicked"
              ctaRole="supporting"
              source="hero_self_serve"
              aria-label="Explore rentals"
              className="group flex flex-col justify-between min-h-[220px] h-full rounded-2xl border border-slate-200/80 bg-[#fbfbfb] p-6 sm:p-7 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs"
            >
              <div>
                <div className="text-slate-700 mb-5">
                  <Calendar size={22} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="!font-sans text-base font-medium text-slate-900 normal-case tracking-normal">Explore rentals</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Flexible terms and delivery options.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <span className="text-sm font-normal text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" aria-hidden="true">→</span>
              </div>
            </ContactTrackedLink>

            {/* Card 3: Review Public Evidence */}
            <ContactTrackedLink
              href="/research"
              eventName="contact_support_route_clicked"
              ctaRole="supporting"
              source="support_proof_request"
              aria-label="Review public evidence first"
              className="group flex flex-col justify-between min-h-[220px] h-full rounded-2xl border border-slate-200/80 bg-[#fbfbfb] p-6 sm:p-7 transition-all hover:bg-white hover:border-slate-300 hover:shadow-xs"
            >
              <div>
                <div className="text-slate-700 mb-5">
                  <BookOpen size={22} strokeWidth={1.5} aria-hidden="true" />
                </div>
                <h3 className="!font-sans text-base font-medium text-slate-900 normal-case tracking-normal">Review public evidence first</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Research and protocol library.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <span className="text-sm font-normal text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" aria-hidden="true">→</span>
              </div>
            </ContactTrackedLink>

            {/* Card 4: Need immediate help? (Alpine Mountain Night Plate) */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[url('/images/contact/help-mountain-card.jpg')] bg-cover bg-center p-6 sm:p-7 text-white min-h-[220px] h-full">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-slate-950/35" />
              <div className="relative z-10">
                <h3 className="font-editorial text-xl sm:text-2xl font-normal text-white">
                  Need immediate help?
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-200 max-w-xs">
                  Visit our help center for common questions, guides and support resources.
                </p>
              </div>

              <div className="relative z-10 mt-6">
                <ContactTrackedLink
                  href="/help"
                  eventName="contact_support_route_clicked"
                  ctaRole="supporting"
                  source="hero_self_serve"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-xs px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>Go to help center</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </ContactTrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stewardship & Institutional Ownership Section */}
      <section id="contact-ownership" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4 items-start">
            {/* Column 1: Institutional Stewardship */}
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600">
                INSTITUTIONAL STEWARDSHIP
              </p>
              <h2 className="font-editorial mt-2 text-2xl font-normal tracking-tight text-slate-900">
                Here to help.
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Hylono is a brand operated by {siteEntity.legalName}. Our team handles product
                guidance, rental planning, device support, and clinic enquiries.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                For personal health decisions, speak with a qualified healthcare professional. In an
                emergency, contact local emergency services.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-3 pt-2 md:pt-6">
              <div>
                <ContactTrackedLink
                  href={`mailto:${siteEntity.contactEmail}`}
                  eventName="contact_route_cta_clicked"
                  ctaRole="primary"
                  source="ownership_answer"
                  aria-label="Email Hylono"
                  className={stewardshipLinkStyle}
                >
                  <span>Email Hylono</span>
                  <span aria-hidden="true">→</span>
                </ContactTrackedLink>
              </div>
              <div>
                <ContactTrackedLink
                  href="/about"
                  eventName="contact_support_route_clicked"
                  ctaRole="supporting"
                  source="ownership_answer"
                  aria-label="About Hylono"
                  className={stewardshipLinkStyle}
                >
                  <span>About Hylono</span>
                  <span aria-hidden="true">→</span>
                </ContactTrackedLink>
              </div>
              <div>
                <ContactTrackedLink
                  href="/policies"
                  eventName="contact_support_route_clicked"
                  ctaRole="supporting"
                  source="ownership_answer"
                  aria-label="Policy center"
                  className={stewardshipLinkStyle}
                >
                  <span>Policy center</span>
                  <span aria-hidden="true">→</span>
                </ContactTrackedLink>
              </div>
            </div>

            {/* Column 3: Ownership & Trust Metadata */}
            <div className="pt-2 md:pt-0">
              <h3 className="!font-sans text-sm font-semibold text-slate-900 normal-case tracking-normal">Ownership & trust</h3>
              <p className="text-[11px] text-slate-600 mt-0.5 mb-4">How contact requests are handled</p>

              <ul className="space-y-3 text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 mt-0.5">
                    <Headphones size={11} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block text-[11px] text-slate-600">Commerce support</span>
                    <span className="font-medium text-slate-800">{siteOwnership.commerce.team}</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 mt-0.5">
                    <Clock size={11} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block text-[11px] text-slate-600">Support hours</span>
                    <span className="font-medium text-slate-800">{siteEntity.supportHours}</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 mt-0.5">
                    <MapPin size={11} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block text-[11px] text-slate-600">Service area</span>
                    <span className="font-medium text-slate-800">{siteEntity.serviceArea}</span>
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 mt-0.5">
                    <Clock size={11} aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block text-[11px] text-slate-600">Last reviewed</span>
                    <span className="font-medium text-slate-800">{displayReviewDate}</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Column 4: Support Handoff Links */}
            <div className="space-y-3 pt-2 md:pt-6 md:border-l md:border-slate-100 md:pl-8">
              <div>
                <ContactTrackedLink
                  href="/help"
                  eventName="contact_support_route_clicked"
                  ctaRole="supporting"
                  source="ownership_answer"
                  className={stewardshipLinkStyle}
                >
                  <span>Help center</span>
                  <span>→</span>
                </ContactTrackedLink>
              </div>
              <div>
                <ContactTrackedLink
                  href="/faq"
                  eventName="contact_support_route_clicked"
                  ctaRole="supporting"
                  source="ownership_answer"
                  className={stewardshipLinkStyle}
                >
                  <span>FAQ</span>
                  <span>→</span>
                </ContactTrackedLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export const metadata: Metadata = createPageMetadata({
  title: 'Contact Hylono | Support, Rentals, and Product Guidance',
  description:
    'Contact Hylono support for rental planning, product guidance, logistics questions, and general customer assistance.',
  path: '/contact',
});

// [DECISION: SSG because contact details and form shell are static route content.]
// Rendering strategy: server-rendered contact route with ownership/schema in the route shell and the form isolated in a client leaf.
export default function ContactPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-contact-page"
          data={{
            ...createWebPageSchema({
              name: 'Contact Hylono',
              description:
                'Contact Hylono support for rental planning, product guidance, logistics questions, and general customer assistance.',
              path: '/contact',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            '@type': 'ContactPage',
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': ORGANIZATION_ID() },
            keywords: 'contact Hylono, customer support, wellness device rental support, product guidance, logistics questions',
            relatedLink: [`${SITE_URL}/help`, `${SITE_URL}/faq`, `${SITE_URL}/about`],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#contact-hero-headline', '#contact-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-contact-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ])}
        />
      </Suspense>
      <div id="contact-page" className="bg-white text-slate-900 selection:bg-cyan-200 selection:text-slate-950 min-h-screen">
        <ContactRouteShell />
      </div>
    </>
  );
}
