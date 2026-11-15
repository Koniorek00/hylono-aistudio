import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const infrastructureDisallow = ['/api/', '/admin/', '/dashboard/'];
const privateUtilityDisallow = [
  '/account',
  '/checkout',
  '/login',
  '/onboarding',
  '/rental/checkout',
  '/rental/checkout/success',
  '/wishlist',
];

// [DECISION: /robots.txt is the public crawler-policy MetadataRoute for infrastructure and private utility boundaries.]
// Rendering strategy: deterministic Next MetadataRoute output from canonical disallow lists and the configured public site URL.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...infrastructureDisallow, ...privateUtilityDisallow],
      },
      {
        userAgent: [
          'OAI-SearchBot',
          'GPTBot',
          'ChatGPT-User',
          'Claude-Web',
          'ClaudeBot',
          'Anthropic-AI',
          'Google-Extended',
          'PerplexityBot',
          'YouBot',
          'Applebot-Extended',
          'Googlebot-News',
          'CCBot',
          'Bytespider',
          'Meta-ExternalAgent',
          'cohere-ai',
        ],
        allow: '/',
        disallow: [...infrastructureDisallow, ...privateUtilityDisallow],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
