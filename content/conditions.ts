import { priceBookMonthlyText, priceBookText } from '@/lib/money';

export interface ConditionModality {
  slug: 'HBOT' | 'H2' | 'RLT' | 'PEMF';
  shortName: string;
  name: string;
  relevance: 1 | 2 | 3 | 4 | 5;
  explanation: string;
  sessionTime: string;
  rentalFrom: string;
  purchaseFrom: string;
}

export interface RecommendedStack {
  title: string;
  devices: string[];
  rentalPrice: string;
  purchasePrice: string;
  link: string;
  linkLabel: string;
  highlighted?: boolean;
}

export interface ConditionGoalPage {
  slug: 'recovery' | 'sleep' | 'stress' | 'comfort' | 'vitality';
  title: string;
  subtitle: string;
  description: string[];
  modalities: ConditionModality[];
  protocolSlugs: string[];
  stacks: RecommendedStack[];
  evidenceIds: string[];
  faq: Array<{ q: string; a: string }>;
}

export const conditionGoals: ConditionGoalPage[] = [
  {
    slug: 'recovery',
    title: 'Recovery',
    subtitle:
      'Plan HBOT-first routines after heavy training or demanding work. This page compares options and does not promise faster recovery.',
    description: [
      'Use this page as a post-load recovery planning guide for training blocks, demanding work periods, and routine fit.',
      'The attached evidence is HBOT performance and soreness context plus hydrogen fatigue-capacity literature; use it to compare options, not to promise faster recovery or personal readiness.',
    ],
    modalities: [
      {
        slug: 'HBOT',
        shortName: 'HBOT',
        name: 'Mild Hyperbaric Oxygen Therapy',
        relevance: 5,
        explanation:
          'Use as the primary product path when oxygen-session burden, pressure tolerance, and cited recovery or performance context are relevant.',
        sessionTime: '45–60 min',
        rentalFrom: priceBookMonthlyText(1099),
        purchaseFrom: priceBookText(24900),
      },
      {
        slug: 'RLT',
        shortName: 'RLT',
        name: 'Red / Near-Infrared Light',
        relevance: 4,
        explanation:
          'An optional local-routine option to compare. We hold no red-light-specific evidence for recovery outcomes, so treat it as a question of fit rather than a settled step.',
        sessionTime: '15–20 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
      {
        slug: 'H2',
        shortName: 'H2',
        name: 'Hydrogen Inhalation',
        relevance: 3,
        explanation:
          'Use as a lower-friction companion when fatigue-capacity context matters; do not treat it as direct muscle-recovery proof.',
        sessionTime: '20–30 min',
        rentalFrom: priceBookMonthlyText(159),
        purchaseFrom: priceBookText(2400),
      },
      {
        slug: 'PEMF',
        shortName: 'PEMF',
        name: 'Pulsed Electromagnetic Field',
        relevance: 3,
        explanation:
          'PEMF belongs here as a complementary comfort and routine-support option. We hold no reviewed PEMF recovery evidence, so we do not present it as a recovery driver.',
        sessionTime: '20–30 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
    ],
    protocolSlugs: ['recovery-oxygen-foundation', 'vitality-dual-stack'],
    stacks: [
      {
        title: 'HBOT baseline',
        devices: ['HBOT'],
        rentalPrice: `from ${priceBookMonthlyText(1099)}`,
        purchasePrice: `from ${priceBookText(24900)}`,
        link: '/product/hbot',
        linkLabel: 'Review HBOT hub',
      },
      {
        title: 'HBOT + hydrogen protocol',
        devices: ['HBOT', 'H2'],
        rentalPrice: `from ${priceBookMonthlyText(1258)}`,
        purchasePrice: `from ${priceBookText(27300)}`,
        link: '/protocols/recovery-oxygen-foundation',
        linkLabel: 'Review recovery oxygen foundation',
        highlighted: true,
      },
      {
        title: 'Guided rental stack',
        devices: ['HBOT', 'H2', 'RLT'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/rental',
        linkLabel: 'Explore rentals',
      },
    ],
    evidenceIds: ['ev-hbot-001', 'ev-hbot-002', 'ev-h2-001'],
    faq: [
      {
        q: 'How often should I run a recovery routine?',
        a: 'Start with the Recovery Oxygen Foundation protocol or the HBOT hub, then adjust only after reviewing schedule burden, contraindications, and cited evidence limits.',
      },
      {
        q: 'Is one modality enough to start?',
        a: 'Yes. Start with HBOT when oxygen-session planning is the main question, then add hydrogen or local modalities only when routine fit and evidence limits are clear.',
      },
    ],
  },
  {
    slug: 'sleep',
    title: 'Sleep',
    subtitle:
      'Build lower-stimulation evening routines for calmer wind-down planning and consistent follow-through.',
    description: [
      'Sleep-oriented stacks should start with the least disruptive evening path: quiet PEMF, optional hydrogen when stress load is part of the question, and red light only when timing and brightness stay controlled.',
      'The cited sleep-adjacent records are population-specific, so use this guide for routine planning, evidence review, and rental fit rather than as general sleep-outcome proof.',
    ],
    modalities: [
      {
        slug: 'PEMF',
        shortName: 'PEMF',
        name: 'Pulsed Electromagnetic Field',
        relevance: 5,
        explanation:
          'Best fit for the first sleep path because sessions can stay short, quiet, and low-stimulation before bedtime.',
        sessionTime: '20–30 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
      {
        slug: 'RLT',
        shortName: 'RLT',
        name: 'Red / Near-Infrared Light',
        relevance: 3,
        explanation:
          'Useful only as a controlled low-light routine cue when brightness, timing, and room setup do not add stimulation.',
        sessionTime: '10–15 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
      {
        slug: 'H2',
        shortName: 'H2',
        name: 'Hydrogen Inhalation',
        relevance: 3,
        explanation:
          'Consider when stress load is part of the sleep question; treat the hydrogen sleep-adjacent citation as limited population-specific context.',
        sessionTime: '20 min',
        rentalFrom: priceBookMonthlyText(159),
        purchaseFrom: priceBookText(2400),
      },
      {
        slug: 'HBOT',
        shortName: 'HBOT',
        name: 'Mild Hyperbaric Oxygen Therapy',
        relevance: 2,
        explanation:
          'Review as earlier-day context only; the sleep-related HBOT citation is chronic post-mTBI context, not general sleep-outcome proof.',
        sessionTime: '45–60 min',
        rentalFrom: priceBookMonthlyText(1099),
        purchaseFrom: priceBookText(24900),
      },
    ],
    protocolSlugs: ['recovery-oxygen-foundation', 'stress-balance-h2-foundation'],
    stacks: [
      {
        title: 'Starter',
        devices: ['PEMF'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/product/pemf',
        linkLabel: 'Review PEMF hub',
      },
      {
        title: 'Optimal',
        devices: ['PEMF', 'H2'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/protocols/stress-balance-h2-foundation',
        linkLabel: 'Review stress-balance protocol',
        highlighted: true,
      },
      {
        title: 'Pro',
        devices: ['PEMF', 'H2', 'RLT'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/rental',
        linkLabel: 'Explore rentals',
      },
    ],
    evidenceIds: ['ev-hbot-003', 'ev-h2-002'],
    faq: [
      {
        q: 'When should sleep-oriented sessions happen?',
        a: 'Keep sessions in a repeatable evening window and avoid adding any modality so late that setup or stimulation disrupts the wind-down routine.',
      },
      {
        q: 'Can I combine sleep and recovery goals?',
        a: 'Yes, but separate the jobs: use earlier-day oxygen or recovery work, keep evening sessions low-stimulation, and review protocol limits before combining.',
      },
    ],
  },
  {
    slug: 'stress',
    title: 'Stress',
    subtitle: 'Compare low-friction hydrogen-first routines for high-demand weeks.',
    description: [
      'Use this page as a workload-recovery planning guide, not as a stress outcome claim.',
      'The current cited evidence is hydrogen-focused and fatigue-oriented, so recommendations should stay conservative and guide visitors into the protocol, research hub, rental planning, or direct support before they build a stack.',
    ],
    modalities: [
      {
        slug: 'H2',
        shortName: 'H2',
        name: 'Hydrogen Inhalation',
        relevance: 4,
        explanation:
          'Hydrogen is the evidence-led starting point here because the current reviewed records discuss fatigue and capacity context, not direct stress-outcome proof.',
        sessionTime: '20–30 min',
        rentalFrom: priceBookMonthlyText(159),
        purchaseFrom: priceBookText(2400),
      },
      {
        slug: 'PEMF',
        shortName: 'PEMF',
        name: 'Pulsed Electromagnetic Field',
        relevance: 3,
        explanation:
          'Use PEMF as a low-setup routine-support option, not as a stand-alone evidence claim for stress outcomes.',
        sessionTime: '20 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
      {
        slug: 'HBOT',
        shortName: 'HBOT',
        name: 'Mild Hyperbaric Oxygen Therapy',
        relevance: 3,
        explanation:
          'Reserve HBOT for occasional supervised planning when a longer recovery session fits; do not treat it as first-line daily stress support.',
        sessionTime: '45–60 min',
        rentalFrom: priceBookMonthlyText(1099),
        purchaseFrom: priceBookText(24900),
      },
      {
        slug: 'RLT',
        shortName: 'RLT',
        name: 'Red / Near-Infrared Light',
        relevance: 2,
        explanation:
          'Use red or near-infrared light only when timing, brightness, and routine fit support a calmer transition.',
        sessionTime: '10–15 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
    ],
    protocolSlugs: ['stress-balance-h2-foundation', 'vitality-dual-stack'],
    stacks: [
      {
        title: 'Hydrogen baseline',
        devices: ['H2'],
        rentalPrice: `from ${priceBookMonthlyText(159)}`,
        purchasePrice: `from ${priceBookText(2400)}`,
        link: '/product/hydrogen',
        linkLabel: 'Review hydrogen hub',
      },
      {
        title: 'Hydrogen + PEMF routine',
        devices: ['H2', 'PEMF'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/protocols/stress-balance-h2-foundation',
        linkLabel: 'Review stress-balance protocol',
        highlighted: true,
      },
      {
        title: 'Guided multi-modal plan',
        devices: ['H2', 'PEMF', 'HBOT'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/contact',
        linkLabel: 'Talk to Hylono about fit',
      },
    ],
    evidenceIds: ['ev-h2-001', 'ev-h2-003'],
    faq: [
      {
        q: 'What is a realistic session length for stress support?',
        a: 'Use the shorter hydrogen protocol window first; keep daily sessions short enough that they do not add setup load during workdays.',
      },
      {
        q: 'Do I need a full stack immediately?',
        a: 'No. Start with the hydrogen-first protocol or one product hub, then add PEMF or HBOT only when adherence, budget, and evidence limits have been reviewed.',
      },
    ],
  },
  {
    slug: 'comfort',
    title: 'Comfort',
    subtitle:
      'Compare local comfort routines. This page helps you judge fit and makes no outcome claims for red light, hydrogen or HBOT.',
    description: [
      'Use this page as a comfort-planning guide for local routine fit, setup tolerance, and when evidence review or direct support should come before a stack.',
      'The attached records are recovery/soreness and hydrogen fatigue-capacity context, not RLT-specific comfort proof; treat red light as a product-fit path until stronger source records are attached.',
    ],
    modalities: [
      {
        slug: 'RLT',
        shortName: 'RLT',
        name: 'Red / Near-Infrared Light',
        relevance: 5,
        explanation:
          'A starting point for local routine planning. We hold no red-light-specific evidence record for comfort outcomes, so treat it as a question of fit.',
        sessionTime: '10–20 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
      {
        slug: 'H2',
        shortName: 'H2',
        name: 'Hydrogen Inhalation',
        relevance: 4,
        explanation:
          'Use only as low-friction context when fatigue and capacity evidence is relevant; do not treat hydrogen as local comfort proof.',
        sessionTime: '20 min',
        rentalFrom: priceBookMonthlyText(159),
        purchaseFrom: priceBookText(2400),
      },
      {
        slug: 'HBOT',
        shortName: 'HBOT',
        name: 'Mild Hyperbaric Oxygen Therapy',
        relevance: 4,
        explanation:
          'Review as recovery context from soreness-oriented evidence, not as a direct comfort outcome promise.',
        sessionTime: '45–60 min',
        rentalFrom: priceBookMonthlyText(1099),
        purchaseFrom: priceBookText(24900),
      },
      {
        slug: 'PEMF',
        shortName: 'PEMF',
        name: 'Pulsed Electromagnetic Field',
        relevance: 2,
        explanation:
          'Keep PEMF as a complementary planning and screening topic until canonical PEMF evidence is attached.',
        sessionTime: '20 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
    ],
    protocolSlugs: ['recovery-oxygen-foundation', 'stress-balance-h2-foundation'],
    stacks: [
      {
        title: 'Starter',
        devices: ['RLT'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/product/rlt',
        linkLabel: 'Review red-light hub',
      },
      {
        title: 'Optimal',
        devices: ['RLT', 'H2'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/research',
        linkLabel: 'Browse research',
        highlighted: true,
      },
      {
        title: 'Pro',
        devices: ['RLT', 'H2', 'HBOT'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/contact',
        linkLabel: 'Ask for guidance',
      },
    ],
    evidenceIds: ['ev-hbot-002', 'ev-h2-001'],
    faq: [
      {
        q: 'Can comfort routines be done daily?',
        a: 'Keep any comfort routine conservative enough to repeat consistently; frequency should follow product guidance, contraindication screening, and support rather than a fixed outcome promise.',
      },
      {
        q: 'How should I choose between RLT, hydrogen, and support?',
        a: 'Start with the red-light hub for category fit, use research when evidence limits matter, and use contact when comfort questions involve tolerance, setup, or stacked modalities.',
      },
    ],
  },
  {
    slug: 'vitality',
    title: 'Vitality',
    subtitle:
      'Plan HBOT and hydrogen routines for high-demand weeks without turning vitality into an energy-outcome claim.',
    description: [
      'Vitality routines on Hylono are planning paths for people comparing workload, recovery windows, and equipment burden before committing to a dual-modality stack.',
      'The attached evidence is HBOT performance context and hydrogen fatigue-capacity literature; it can support cautious option selection, not broad focus, energy, or whole-system outcome promises.',
    ],
    modalities: [
      {
        slug: 'HBOT',
        shortName: 'HBOT',
        name: 'Mild Hyperbaric Oxygen Therapy',
        relevance: 4,
        explanation:
          'Use as the higher-burden anchor only when the HBOT performance context is relevant and session time is realistic.',
        sessionTime: '45–60 min',
        rentalFrom: priceBookMonthlyText(1099),
        purchaseFrom: priceBookText(24900),
      },
      {
        slug: 'H2',
        shortName: 'H2',
        name: 'Hydrogen Inhalation',
        relevance: 4,
        explanation:
          'Use as the lower-friction companion when fatigue-capacity context matters, while keeping evidence limits visible.',
        sessionTime: '20–30 min',
        rentalFrom: priceBookMonthlyText(159),
        purchaseFrom: priceBookText(2400),
      },
      {
        slug: 'RLT',
        shortName: 'RLT',
        name: 'Red / Near-Infrared Light',
        relevance: 3,
        explanation:
          'Optional local routine support. We hold no red-light-specific evidence for vitality outcomes, so treat it as a question of fit.',
        sessionTime: '10–20 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
      {
        slug: 'PEMF',
        shortName: 'PEMF',
        name: 'Pulsed Electromagnetic Field',
        relevance: 3,
        explanation:
          'Use only as a comparison path for routine tolerance; do not treat PEMF as vitality proof on this page.',
        sessionTime: '20–30 min',
        rentalFrom: 'Request / verify',
        purchaseFrom: 'Request / verify',
      },
    ],
    protocolSlugs: ['vitality-dual-stack', 'recovery-oxygen-foundation', 'stress-balance-h2-foundation'],
    stacks: [
      {
        title: 'Starter',
        devices: ['H2'],
        rentalPrice: `from ${priceBookMonthlyText(159)}`,
        purchasePrice: `from ${priceBookText(2400)}`,
        link: '/product/hydrogen',
        linkLabel: 'Review hydrogen hub',
      },
      {
        title: 'Optimal',
        devices: ['HBOT', 'H2'],
        rentalPrice: `from ${priceBookMonthlyText(1258)}`,
        purchasePrice: `from ${priceBookText(27300)}`,
        link: '/protocols/vitality-dual-stack',
        linkLabel: 'Review vitality protocol',
        highlighted: true,
      },
      {
        title: 'Pro',
        devices: ['HBOT', 'H2', 'RLT'],
        rentalPrice: 'Request / verify',
        purchasePrice: 'Request / verify',
        link: '/rental',
        linkLabel: 'Explore rentals',
      },
    ],
    evidenceIds: ['ev-hbot-001', 'ev-h2-001', 'ev-h2-003'],
    faq: [
      {
        q: 'What is the best starting path for vitality?',
        a: 'Start by comparing the hydrogen hub, HBOT hub, and vitality dual-stack protocol against your available time, equipment burden, and evidence-review needs.',
      },
      {
        q: 'Can I run vitality and recovery goals together?',
        a: 'Use the recovery guide or direct support when the question is post-load recovery; this vitality page should not be used as a general energy or focus promise.',
      },
    ],
  },
];

export const conditionGoalBySlug = conditionGoals.reduce<Record<string, ConditionGoalPage>>((acc, goal) => {
  acc[goal.slug] = goal;
  return acc;
}, {});
