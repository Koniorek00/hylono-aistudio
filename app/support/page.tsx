import { permanentRedirect } from 'next/navigation';
import { connection } from 'next/server';

// [DECISION: redirect because /support is a duplicate trust alias and should resolve to the canonical help center.]
// [DECISION: route at request time via `connection()` because this page only ever redirects, so there is no content to prerender and prerendering it broke the production build.]
// Rendering strategy: request-time server redirect to /help. Cache Components are
// enabled, and `permanentRedirect()` reaches for `crypto.randomUUID()` internally;
// under Cache Components a Server Component may not consume random cryptographic
// values during prerender unless Request data was read first. Reading `connection()`
// marks this route dynamic, which is correct on its own terms - a redirect has no
// cacheable output. `/support` is also declared in `config/seo-redirects.ts`, so this
// page is the App Router fallback, not the primary redirect contract.
export default async function SupportPageRoute() {
  await connection();

  permanentRedirect('/help');
}
