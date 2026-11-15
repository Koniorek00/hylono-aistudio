import { HydrogenPremiumPage, buildHydrogenPremiumMetadata } from '@/components/product/hydrogen-premium/HydrogenPremiumPage';

// [DECISION: SSG because this product page is a fixed, indexable hydrogen PDP with stable product data.]
// Rendering strategy: server-rendered fixed PDP wrapper with metadata generated from the hydrogen premium content model.

export function generateMetadata() {
  return buildHydrogenPremiumMetadata('wo-pw3000');
}

export default function WoPw3000Page() {
  return <HydrogenPremiumPage slug="wo-pw3000" />;
}
