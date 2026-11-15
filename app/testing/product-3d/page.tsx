import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import { siteEntity } from '@/content/site-entity';
import { buildProduct3DLabContactHref } from '@/lib/contact-prefill';
import { createBreadcrumbSchema, createWebPageSchema } from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import Product3DAssetLab from './Product3DAssetLab';
import { Product3DLabRouteActionStatus, Product3DLabTrackedLink } from './Product3DLabTrackedLink';

const strongerRoutes = [
  {
    description:
      'Use the supported product hub when you need a published page for comparison, pricing context, or next-step guidance.',
    href: '/store',
    title: 'Supported product pages',
  },
  {
    description:
      'Use the help center when the question is operational, support-led, or policy-related rather than experimental.',
    href: '/help',
    title: 'Help center',
  },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: 'Product 3D Asset Lab | Hylono secondary utility',
  description:
    'Use this secondary Hylono utility to inspect a single-image pseudo-3D product asset experiment, then continue to the supported product or support pages.',
  path: '/testing/product-3d',
  forceNoIndex: true,
});

// [DECISION: SSG because /testing/product-3d is a public noindex utility route that should explain the lab clearly on the server before handing interaction to an isolated client leaf.]
// Rendering strategy: server-rendered noindex lab shell with stronger-page guidance, a contact handoff, and a client-only viewer experiment below the fold.
export default function Product3DTestPage() {
  const contactHref = buildProduct3DLabContactHref();
  const webPageSchema = createWebPageSchema({
    name: 'Product 3D Asset Lab',
    description:
      'Use this secondary Hylono utility to inspect a single-image pseudo-3D product asset experiment, then continue to the supported product or support pages.',
    path: '/testing/product-3d',
  });
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Product 3D Asset Lab', path: '/testing/product-3d' },
  ]);

  return (
    <>
      <StructuredData id="jsonld-product-3d-lab-page" data={webPageSchema} />
      <StructuredData id="jsonld-product-3d-lab-breadcrumb" data={breadcrumbSchema} />
      <section className="mx-auto max-w-6xl px-6 py-16 text-slate-900">
        <Product3DLabRouteActionStatus />
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Secondary utility
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Review the product 3D asset lab
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            This page shows a single-image pseudo-3D viewer experiment for a product render. It is
            useful for checking presentation behavior, but it is not the supported destination for
            product guidance, pricing context, or policy questions.
          </p>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Use the viewer below when you need to inspect the lab output, then continue to a
            published Hylono product or support page for the next step.
          </p>
        </header>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Product3DLabTrackedLink
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            href="/store"
            label="supported product pages"
          >
            Open supported product pages
          </Product3DLabTrackedLink>
          <Product3DLabTrackedLink
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            href={contactHref}
            label="contact handoff"
          >
            Contact Hylono about this asset lab
          </Product3DLabTrackedLink>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>
            Support coverage: {siteEntity.serviceArea} | {siteEntity.supportHours}
          </span>
          <Product3DLabTrackedLink
            className="font-semibold text-slate-900 underline decoration-cyan-300/70 underline-offset-4"
            href="/help"
            label="help center"
          >
            Open help center
          </Product3DLabTrackedLink>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {strongerRoutes.map((route) => (
            <article key={route.href} className="rounded-lg border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900">{route.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{route.description}</p>
              <Product3DLabTrackedLink
                className="mt-4 inline-flex text-sm font-semibold text-slate-900 underline decoration-cyan-300/70 underline-offset-4"
                href={route.href}
                label={route.title}
              >
                Browse {route.title.toLowerCase()}
              </Product3DLabTrackedLink>
            </article>
          ))}
        </div>
      </section>

      <noscript>
        <section
          aria-label="Product 3D lab no-script summary"
          className="mx-auto max-w-4xl px-6 pb-8 text-slate-900"
        >
          <p className="text-2xl font-semibold">Product 3D asset lab</p>
          <p className="mt-3 text-base leading-7">
            This page uses JavaScript for the rotatable viewer. For supported product and support
            guidance, continue to the store hub, help center, or contact instead of treating
            this page as the main destination.
          </p>
        </section>
      </noscript>

      <Product3DAssetLab />
    </>
  );
}
