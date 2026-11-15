// Copy for the /home-new-opus prototype. Wording follows the claim policy in
// policies/claim_policy.yml and docs/governance/seo-page-production-guide.md §4:
// describe equipment and decisions, never promise outcomes.

export type ModalityId = 'hbot' | 'hydrogen' | 'rlt' | 'pemf';

export interface Modality {
  id: ModalityId;
  index: string;
  symbol: string;
  short: string;
  name: string;
  line: string;
  description: string;
  checks: readonly [string, string, string];
  evidence: string;
  path: string;
  action: string;
  image: { src: string; width: number; height: number; alt: string };
}

export const modalities: readonly Modality[] = [
  {
    id: 'hbot',
    index: '01',
    symbol: 'O₂',
    short: 'HBOT',
    name: 'Hyperbaric oxygen',
    line: 'A session inside a chamber with a controlled pressure environment.',
    description:
      'Chamber systems differ in size, pressure range, access and operating requirements. Start with the room, then the equipment.',
    checks: [
      'Room footprint and the access path into it',
      'Power, ventilation and oxygen-supply requirements',
      'Operating instructions and supervision needs',
    ],
    evidence:
      'Studies examine specific pressures, durations and populations. A result for one protocol does not transfer to every chamber or person.',
    path: '/product/hbot',
    action: 'Explore oxygen systems',
    image: {
      src: '/images/landing/card-hbot.jpg',
      width: 1376,
      height: 768,
      alt: 'Concept interior: a white hyperbaric chamber with a teal light ring in a glass room overlooking a lake.',
    },
  },
  {
    id: 'hydrogen',
    index: '02',
    symbol: 'H₂',
    short: 'Hydrogen',
    name: 'Molecular hydrogen',
    line: 'Generation equipment for dedicated wellness routines.',
    description:
      'Formats range from countertop units to dedicated generation systems. Compare output specifications, maintenance and everyday use.',
    checks: [
      'Generation format and output specification',
      'Counter or floor space and maintenance routine',
      'How the unit fits a realistic daily schedule',
    ],
    evidence:
      'Research is early and varies by method and dose. Read the sources and their stated limitations before drawing conclusions.',
    path: '/product/hydrogen',
    action: 'Explore hydrogen systems',
    image: {
      src: '/images/landing/card-hydrogen-v2.jpg',
      width: 1024,
      height: 1024,
      alt: 'Concept still life: a glass hydrogen-water vessel with rising bubbles on a marble counter by a garden window.',
    },
  },
  {
    id: 'rlt',
    index: '03',
    symbol: 'λ',
    short: 'Light',
    name: 'Red & near-infrared light',
    line: 'Light-based equipment defined by wavelength, exposure and placement.',
    description:
      'Panels, beds and targeted devices behave differently. Learn the specifications that distinguish them before choosing a format.',
    checks: [
      'Wavelengths and irradiance specifications',
      'Panel, bed or targeted device format',
      'Eye protection and exposure guidance',
    ],
    evidence:
      'Findings depend on wavelength, dose and timing. Evidence for one set of parameters does not establish results for another.',
    path: '/product/rlt',
    action: 'Understand light technology',
    image: {
      src: '/images/landing/card-redlight-v2.jpg',
      width: 1024,
      height: 1024,
      alt: 'Concept interior: a curved red-light lounger in a calm room facing a bamboo courtyard.',
    },
  },
  {
    id: 'pemf',
    index: '04',
    symbol: '∿',
    short: 'PEMF',
    name: 'Pulsed electromagnetic fields',
    line: 'Devices distinguished by frequency, intensity and waveform.',
    description:
      'Pulsed-field devices vary widely in their parameters and applicators. Understanding those differences comes before comparing models.',
    checks: [
      'Field parameters and applicator type',
      'Contraindications listed by the manufacturer',
      'Session length in the operating instructions',
    ],
    evidence:
      'Evidence is mixed and parameter-specific. Treat broad claims with caution and review the cited research and its limits.',
    path: '/product/pemf',
    action: 'Understand pulsed fields',
    image: {
      src: '/images/landing/card-pemf-v2.jpg',
      width: 1024,
      height: 1024,
      alt: 'Concept still life: a circular pulsed-field device with a violet glow on a glass laboratory surface.',
    },
  },
] as const;

export const journey = [
  {
    step: '01',
    title: 'A conversation',
    copy: 'Tell us about your space, your schedule and what you want to understand.',
    href: '/consultation',
    label: 'Book a consultation',
  },
  {
    step: '02',
    title: 'A fair comparison',
    copy: 'Look at equipment side by side: footprint, specifications and requirements.',
    href: '/store',
    label: 'Browse the collection',
  },
  {
    step: '03',
    title: 'The right commitment',
    copy: 'Weigh rental against ownership with the written terms in front of you.',
    href: '/compare/rent-vs-buy',
    label: 'Compare rent and buy',
  },
  {
    step: '04',
    title: 'A planned arrival',
    copy: 'Check access, power and placement before anything is scheduled.',
    href: '/delivery-installation-onboarding',
    label: 'Plan delivery and setup',
  },
  {
    step: '05',
    title: 'Support that stays',
    copy: 'Know who to contact once the equipment is part of your routine.',
    href: '/service-and-support',
    label: 'See service and support',
  },
] as const;

export const ledger = [
  {
    tone: 'show',
    title: 'What we will show you',
    items: [
      'The source behind a statement, with its studied setting',
      'The parameters a study used and the population it involved',
      'The limitations the authors themselves report',
    ],
  },
  {
    tone: 'wont',
    title: 'What we will not do',
    items: [
      'Promise an outcome from any device or routine',
      'Treat a study of one device as proof for another',
      'Stand in for professional care or advice',
    ],
  },
  {
    tone: 'ask',
    title: 'What to ask a professional',
    items: [
      'Whether a technology is suitable for you',
      'Which contraindications apply to your situation',
      'How a routine fits alongside your current care',
    ],
  },
] as const;

export const questions = [
  {
    question: 'Where do I start if I’m new to this?',
    answer:
      'Start with your available space, the time you can set aside and what you want to understand. A Hylono consultation helps you compare equipment and access options. Discuss suitability with an appropriately qualified professional as well.',
    href: '/consultation',
    label: 'Start a conversation',
  },
  {
    question: 'Can I rent before considering a purchase?',
    answer:
      'Explore the rental pathway and ask about the equipment you are considering. Availability, duration, delivery and costs depend on the model and your location. Confirm the written terms before making a commitment.',
    href: '/rental',
    label: 'Review the rental pathway',
  },
  {
    question: 'What does the research actually tell me?',
    answer:
      'Research examines particular devices, parameters and populations. A study of a modality does not establish an outcome for every device or person. The library presents source records and limitations so you can make a more informed decision.',
    href: '/research',
    label: 'Read the research library',
  },
  {
    question: 'What should I check before equipment arrives?',
    answer:
      'Check dimensions, access to your room, power requirements and the operating instructions for the chosen system. Discuss delivery, installation, onboarding and ongoing support with Hylono before confirming your order.',
    href: '/delivery-installation-onboarding',
    label: 'Plan delivery and setup',
  },
] as const;
