const goneHeaders = {
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
} as const;

const gone = () => new Response(null, { status: 410, headers: goneHeaders });

// [DECISION: removed because /quote-checkout-redirect is a legacy commercial utility slug with no active local quote-flow dependency.]
// Rendering strategy: route handler returning a constant 410 Gone response with crawl-removal headers, so the modern app cannot expose a placeholder quote handoff page.
export function GET() {
  return gone();
}

export function HEAD() {
  return gone();
}
