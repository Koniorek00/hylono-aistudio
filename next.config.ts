import type { NextConfig } from 'next';
import path from 'node:path';
import { seoRedirects } from './config/seo-redirects';
import { env } from './lib/env';

const DEFAULT_DIST_DIR = '.next';

const resolveDistDir = () => {
  const requestedDistDir = process.env.NEXT_DIST_DIR?.trim();

  if (!requestedDistDir) {
    return DEFAULT_DIST_DIR;
  }

  const resolvedDistDir = path.resolve(process.cwd(), requestedDistDir);
  const relativeToRoot = path.relative(process.cwd(), resolvedDistDir);

  if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
    return DEFAULT_DIST_DIR;
  }

  return relativeToRoot || DEFAULT_DIST_DIR;
};

const distDir = resolveDistDir();

const nextConfig: NextConfig = {
  distDir,
  cacheComponents: true,
  reactCompiler: true,
  outputFileTracingIncludes: {
    '/': ['./public/styles/landing-2026.css', './public/images/landing-2026/room-mobile.avif'],
  },
  compress: true,
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  cacheLife: {
    feed: { stale: 30, revalidate: 60, expire: 300 },
    session: { stale: 0, revalidate: 0, expire: 3600 },
    static: { stale: 86400, revalidate: 3600, expire: 604800 },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
      },
    ],
  },
  async redirects() {
    return [...seoRedirects];
  },
};

let exportedConfig: NextConfig = nextConfig;
if (process.env.NODE_ENV === 'production' && env.SENTRY_AUTH_TOKEN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { withSentryConfig: sentryWrap } = require('@sentry/nextjs');
    if (typeof sentryWrap === 'function') {
      exportedConfig = sentryWrap(nextConfig, {
        authToken: env.SENTRY_AUTH_TOKEN,
        silent: true,
        widenClientFileUpload: true,
      });
    }
  } catch {
    exportedConfig = nextConfig;
  }
}

export default exportedConfig;
