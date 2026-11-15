// Copy is reused verbatim from the governed 2026 landing page (components/landing-2026).
// Imagery is reused from existing route folders and labelled as concept renders on the page.
// Do not add, soften or strengthen claim wording here; route new copy through claims review.

export type EliteTone = 'oxygen' | 'hydrogen' | 'light' | 'field';

export interface EliteImage {
  src: string;
  alt: string;
  /** CSS object-position, tuned so the subject stays clear of the text column. */
  position?: string;
}

export interface EliteTechnology {
  id: EliteTone;
  number: string;
  symbol: string;
  name: string;
  short: string;
  copy: string;
  path: string;
  action: string;
  detail: string;
  stage: EliteImage;
  card: EliteImage;
}

export const eliteUpdated = '2026-10-30';

export const technologies: readonly EliteTechnology[] = [
  {
    id: 'oxygen',
    number: '01',
    symbol: 'O₂',
    name: 'Hyperbaric oxygen',
    short: 'HBOT',
    copy: 'A chamber-based session with a controlled pressure environment. Start with the equipment, space and operating requirements.',
    path: '/product/hbot',
    action: 'Explore oxygen systems',
    detail: 'Chamber systems · Guided setup',
    stage: {
      src: '/images/landing/hero-hbot-chamber-v2.jpg',
      alt: 'Concept render: a white pressure chamber in a glass-walled room overlooking an alpine lake.',
      position: '72% 50%',
    },
    card: {
      src: '/images/for-professionals/hero-for-professionals.jpg',
      alt: 'Concept render: a white chamber system in a bright, plant-filled room with garden views.',
      position: '78% 50%',
    },
  },
  {
    id: 'hydrogen',
    number: '02',
    symbol: 'H₂',
    name: 'Molecular hydrogen',
    short: 'Hydrogen',
    copy: 'Hydrogen-generation equipment for dedicated wellness routines. Compare formats, output specifications and everyday use.',
    path: '/product/hydrogen',
    action: 'Explore hydrogen systems',
    detail: 'Generation systems · Format comparison',
    stage: {
      src: '/images/store/store_card_hydrogen.jpg',
      alt: 'Concept render: a white hydrogen-generation unit on a travertine counter beside a garden window.',
      position: '62% 50%',
    },
    card: {
      src: '/images/landing/card-hydrogen-v2.jpg',
      alt: 'Concept render: a glass hydrogen-generation vessel on white marble beside a garden window.',
      position: '50% 40%',
    },
  },
  {
    id: 'light',
    number: '03',
    symbol: 'Light',
    name: 'Red & near-infrared light',
    short: 'RLT',
    copy: 'Light-based equipment defined by wavelength, exposure and placement. Get to know the technology before choosing a system.',
    path: '/product/rlt',
    action: 'Understand light technology',
    detail: 'Technology guide · Research context',
    stage: {
      src: '/images/landing/card-redlight-v2.jpg',
      alt: 'Concept render: a curved red-light lounger in a stone courtyard room with bamboo.',
      position: '50% 55%',
    },
    card: {
      src: '/images/store/store_card_redlight.jpg',
      alt: 'Concept render: a red-light bed glowing in a dark stone room.',
      position: '55% 50%',
    },
  },
  {
    id: 'field',
    number: '04',
    symbol: 'Field',
    name: 'Pulsed electromagnetic fields',
    short: 'PEMF',
    copy: 'An introduction to pulsed-field devices and the parameters that distinguish them. Explore the evidence and its limits.',
    path: '/product/pemf',
    action: 'Understand pulsed fields',
    detail: 'Technology guide · Research context',
    stage: {
      src: '/images/store/store_card_pemf.jpg',
      alt: 'Concept render: a pulsed-field mat on a stone bench before a window onto mountains and a lake.',
      position: '50% 60%',
    },
    card: {
      src: '/images/landing/card-pemf-v2.jpg',
      alt: 'Concept render: a circular pulsed-field coil with a violet glow on a pale laboratory bench.',
      position: '50% 45%',
    },
  },
];

export const ribbon = [
  {
    title: 'Guided consultation',
    copy: 'Compare equipment and access options.',
    href: '/consultation',
    icon: 'consult',
  },
  {
    title: 'Research library',
    copy: 'Source records and limitations.',
    href: '/research',
    icon: 'research',
  },
  {
    title: 'Rental or ownership',
    copy: 'Choose the commitment that fits.',
    href: '/compare/rent-vs-buy',
    icon: 'rental',
  },
  {
    title: 'Delivery & onboarding',
    copy: 'Plan delivery and setup.',
    href: '/delivery-installation-onboarding',
    icon: 'delivery',
  },
] as const;

export const steps = [
  {
    title: 'Name your priority.',
    copy: 'Explore wellness goals and the questions worth asking.',
    href: '/conditions',
    label: 'Explore your goals',
    image: {
      src: '/images/conditions/goal-stress-dock.jpg',
      alt: 'A wooden dock with a meditation cushion reaching into a still, misty alpine lake.',
    },
  },
  {
    title: 'Look beneath the promise.',
    copy: 'Read the sources, studied settings and limitations.',
    href: '/research',
    label: 'Explore the evidence',
    image: {
      src: '/images/megamenu/card-evidence-portrait.jpg',
      alt: 'Concept render: a microscope and glassware on a white laboratory bench.',
    },
  },
  {
    title: 'Give it a practical place.',
    copy: 'Review usage guidance and how equipment fits daily life.',
    href: '/protocols',
    label: 'Explore routine guidance',
    image: {
      src: '/images/megamenu/card-plan-v2.jpg',
      alt: 'Concept interior: a calm living room with floor-to-ceiling windows onto a lake.',
    },
  },
] as const;

export const supportPaths = [
  {
    label: 'Rental pathway',
    href: '/rental',
    image: '/images/about/hero-alpine-spa-luxury.jpg',
  },
  {
    label: 'Delivery & onboarding',
    href: '/delivery-installation-onboarding',
    image: '/images/landing/rental-fleet.jpg',
  },
  {
    label: 'Ongoing support',
    href: '/service-and-support',
    image: '/images/help/hero-sanctuary.jpg',
  },
] as const;

export const questions = [
  {
    question: 'Where do I start if I’m new to this?',
    answer:
      'Start with your available space, the time you can set aside and what you want to understand. A Hylono consultation helps you compare equipment and access options; suitability questions should also be discussed with an appropriately qualified professional.',
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
