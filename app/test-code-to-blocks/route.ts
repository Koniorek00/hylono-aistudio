const goneHeaders = {
  'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
} as const;

const gone = () => new Response(null, { status: 410, headers: goneHeaders });

// [DECISION: removed because /test-code-to-blocks is a legacy WordPress/Divi test artifact with no valid public business role.]
// Rendering strategy: route handler returning a constant 410 Gone response with crawl-removal headers, so crawlers and users cannot receive a renderable legacy page from the modern app.
export function GET() {
  return gone();
}

export function HEAD() {
  return gone();
}
