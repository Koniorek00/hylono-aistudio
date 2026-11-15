import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { siteEntity } from '@/content/site-entity';
import { env } from '@/lib/env';
import { createOrganizationSchema, createWebSiteSchema } from '@/lib/seo-schema';
import { StaticStructuredData } from '@/src/components/StaticStructuredData';
import { MainShell } from '@/src/components/layout/MainShell';
import { NoScriptAccessPanel } from '@/src/components/layout/NoScriptAccessPanel';
import { SiteChrome } from '@/src/components/layout/SiteChrome';
import { RouteStyles } from '@/src/components/layout/RouteStyles';
import { ConsentAwareVercelTelemetry } from '@/src/components/providers/ConsentAwareVercelTelemetry';
import { Providers } from '@/src/components/providers/Providers';
import { isVercelTelemetryEnabled } from '@/src/lib/vercel-telemetry';

const inter = {
  className: 'font-sans',
  variable: '--font-inter',
  display: 'swap',
};

const syncopate = {
  className: 'futuristic-font',
  variable: '--font-syncopate',
};

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const DEFAULT_OG_IMAGE = '/og-image.svg';
const ROOT_LAYOUT_SKIP_LINK_ACTION_STATUS_ID = 'root-layout-skip-link-action-status';
const ROOT_LAYOUT_SKIP_LINK_ACTION_READY_STATUS = '';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06b6d4',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: siteEntity.name,
  manifest: '/site.webmanifest',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-touch-icon.svg', type: 'image/svg+xml', sizes: '180x180' }],
  },
  authors: [{ name: siteEntity.name, url: SITE_URL }],
  creator: siteEntity.name,
  publisher: siteEntity.name,
  title: {
    default: siteEntity.name,
    template: '%s | Hylono',
  },
  description: siteEntity.description,
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: siteEntity.name,
    title: siteEntity.name,
    description: siteEntity.description,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Hylono wellness technology systems',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hylono',
    creator: '@hylono',
    title: siteEntity.name,
    description: siteEntity.description,
    images: [{ url: DEFAULT_OG_IMAGE, alt: 'Hylono wellness technology systems' }],
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

interface RootLayoutContentProps {
  children: ReactNode;
}

function RootLayoutContent({ children }: RootLayoutContentProps) {
  const organizationSchema = createOrganizationSchema();
  const webSiteSchema = createWebSiteSchema();

  return (
    <>
      <RouteStyles />
      <StaticStructuredData id="jsonld-organization" data={organizationSchema} />
      <StaticStructuredData id="jsonld-website" data={webSiteSchema} />
      <Providers />
      <SiteChrome slot="top" />
      <MainShell>
        <noscript>
          <NoScriptAccessPanel />
        </noscript>
        {children}
      </MainShell>
      <SiteChrome slot="bottom" />
    </>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.className} ${syncopate.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Hylono Blog - Research Notes and Wellness Guidance"
          href={`${SITE_URL}/rss.xml`}
        />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="skip-link"
          aria-describedby={ROOT_LAYOUT_SKIP_LINK_ACTION_STATUS_ID}
        >
          Skip to main content
        </a>
        <p
          id={ROOT_LAYOUT_SKIP_LINK_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Skip link action status"
          className="sr-only"
        >
          {ROOT_LAYOUT_SKIP_LINK_ACTION_READY_STATUS}
        </p>
        <RootLayoutContent>{children}</RootLayoutContent>
        {isVercelTelemetryEnabled() && <ConsentAwareVercelTelemetry />}
      </body>
    </html>
  );
}
