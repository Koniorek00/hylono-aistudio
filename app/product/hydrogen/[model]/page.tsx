import { connection } from 'next/server';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  getHydrogenPremiumPath,
  hydrogenPremiumAliasToSlug,
} from '@/content/hydrogen-premium-2026';

type Params = Promise<{ model: string }>;

// [DECISION: keep this page as a server-side fallback for hydrogen model aliases, while next.config.ts handles the request-time 308 redirect contract through config/seo-redirects.ts.]
// [DECISION: route at request time via `connection()` because this page only ever redirects or 404s, so there is no content to prerender and prerendering it is what broke the production build.]
// Rendering strategy: request-time server routing. Cache Components are enabled, and
// `permanentRedirect()` reaches for `crypto.randomUUID()` internally; under Cache
// Components a Server Component may not consume random cryptographic values during
// prerender unless Request data was read first. Reading `connection()` marks this
// route dynamic, which is correct on its own terms - a redirect has no cacheable
// output - and matches the other request-time routes in this app.
//
// `generateStaticParams` is deliberately KEPT even though a dynamic route does not
// prerender from it: `tests/app/product-hydrogen-model-alias-contract.test.ts` and
// `tests/app/product-hydrogen-model-route.test.ts` read it to prove every alias in
// the content model is covered. Deleting it would silently drop that contract.
export function generateStaticParams() {
  return Object.keys(hydrogenPremiumAliasToSlug).map((model) => ({ model }));
}

export default async function HydrogenModelAliasPage({ params }: { params: Params }) {
  await connection();

  const { model } = await params;
  const targetSlug = hydrogenPremiumAliasToSlug[model.toLowerCase()];

  if (!targetSlug) {
    notFound();
  }

  permanentRedirect(getHydrogenPremiumPath(targetSlug));
}
