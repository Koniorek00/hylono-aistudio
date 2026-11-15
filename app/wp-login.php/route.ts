const goneHeaders = {
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
} as const;

const gone = () => new Response(null, { status: 410, headers: goneHeaders });

// [DECISION: removed because /wp-login.php is a legacy WordPress login artifact and the canonical auth surface is /login.]
// Rendering strategy: route handler returning a constant 410 Gone response with crawl-removal headers, so the modern app cannot expose or endorse a WordPress login surface.
export function GET() {
  return gone();
}

export function HEAD() {
  return gone();
}
