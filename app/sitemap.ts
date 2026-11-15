import type { MetadataRoute } from 'next';
import { getCanonicalSitemapEntries } from '@/lib/canonical-sitemap';

// [DECISION: /sitemap.xml is the canonical indexable route inventory emitted from the shared sitemap model.]
// Rendering strategy: deterministic Next MetadataRoute output delegated to getCanonicalSitemapEntries so crawl promotion stays centralized.
export default function sitemap(): MetadataRoute.Sitemap {
  return getCanonicalSitemapEntries();
}
