export type PartnerType = 'clinic' | 'distributor' | 'showroom';

export const partnerTypeLabels: Record<PartnerType, string> = {
  clinic: 'Clinic access inquiry',
  distributor: 'Distributor inquiry',
  showroom: 'Demo visit inquiry',
};

export const partnerTypeDescriptions: Record<PartnerType, string> = {
  clinic: 'Use this option when you want a clinic-style introduction for guided access or appointment-led support.',
  distributor:
    'Use this option when you need product access, rollout planning, or regional purchasing guidance.',
  showroom:
    'Use this option when you want a demo-led visit, a walkthrough, or a first comparison before choosing the next step.',
};

export const partnerDirectoryMeta = {
  lastReviewed: '2026-04-14',
  verificationLabel:
    'Public partner cards are paused while partner records are reviewed before publication.',
  coverageLabel:
    'The locator now handles guided introduction requests instead of publishing unsupported partner listings.',
  nextStepLabel:
    'Use contact for a manual next-step request by city, technology, and access format.',
  supportScopeLabel: 'This page remains public while partner coverage is reviewed.',
} as const;

export const partnerRequestChecklist = [
  'City or region where you need the introduction',
  'Technology or protocol you want to explore',
  'Whether you need a demo visit, guided access, rental, or purchase support',
  'Any timing, installation, or support constraints the team should know about',
] as const;
