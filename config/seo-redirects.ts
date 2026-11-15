import {
  getHydrogenPremiumPath,
  hydrogenPremiumAliasToSlug,
} from '../content/hydrogen-premium-2026';

const hydrogenModelAliasRedirects = Object.entries(hydrogenPremiumAliasToSlug).map(
  ([model, targetSlug]) => ({
    source: `/product/hydrogen/${model}`,
    destination: getHydrogenPremiumPath(targetSlug),
    permanent: true,
  })
);

export const seoRedirects = [
  { source: '/products', destination: '/store', permanent: true },
  { source: '/products/:tech', destination: '/product/:tech', permanent: true },
  { source: '/product/hydrogen2', destination: '/product/hydrogen', permanent: true },
  ...hydrogenModelAliasRedirects,
  { source: '/product/offer', destination: '/store', permanent: true },
  { source: '/product/offer/:path*', destination: '/store', permanent: true },
  { source: '/shop', destination: '/store', permanent: true },
  { source: '/cart', destination: '/checkout', permanent: true },
  { source: '/cart/:path*', destination: '/checkout', permanent: true },
  { source: '/catalog/omega-3', destination: '/store', permanent: true },
  { source: '/journal', destination: '/blog', permanent: true },
  { source: '/journal/:slug', destination: '/blog/:slug', permanent: true },
  { source: '/science', destination: '/research', permanent: true },
  { source: '/sign-in', destination: '/login', permanent: true },
  { source: '/signin', destination: '/login', permanent: true },
  { source: '/account/login', destination: '/login', permanent: true },
  { source: '/partner', destination: '/nexus', permanent: true },
  { source: '/partner/dashboard', destination: '/nexus', permanent: true },
  { source: '/partner/nexus', destination: '/nexus/clients', permanent: true },
  { source: '/partner/fleet', destination: '/nexus/fleet', permanent: true },
  { source: '/partner/service', destination: '/nexus/service', permanent: true },
  { source: '/partner/docs', destination: '/nexus/docs', permanent: true },
  { source: '/partner/studio', destination: '/nexus/studio', permanent: true },
  { source: '/partner/team', destination: '/nexus/team', permanent: true },
  { source: '/partner/academy', destination: '/nexus/academy', permanent: true },
  { source: '/partner/shop', destination: '/nexus/supplies', permanent: true },
  { source: '/nexus/dashboard', destination: '/nexus', permanent: true },
  { source: '/nexus/nexus', destination: '/nexus/clients', permanent: true },
  { source: '/nexus/shop', destination: '/nexus/supplies', permanent: true },
  { source: '/support', destination: '/help', permanent: true },
  { source: '/guarantee', destination: '/returns', permanent: true },
  { source: '/builder', destination: '/wellness-planner', permanent: true },
  { source: '/compare', destination: '/compare/rent-vs-buy', permanent: true },
];
