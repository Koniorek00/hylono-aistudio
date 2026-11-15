export interface Advisor {
  id: string;
  name: string;
  title: string;
  photo: string;
  specializations: string[];
  bio: string;
}

export const advisors: Advisor[] = [
  {
    id: 'adv-recovery-planning',
    name: 'Recovery planning advisor',
    title: 'Protocol and recovery planning',
    photo: '/images/advisors/elena-vasquez.webp',
    specializations: ['Recovery planning', 'Protocol progression', 'Sleep-support routines'],
    bio: 'A Hylono advisor helps clients build practical protocol-first routines for recovery, sleep quality, and weekly adherence. The session focuses on evidence literacy, schedule fit, and clear next steps.',
  },
  {
    id: 'adv-performance-planning',
    name: 'Performance planning advisor',
    title: 'Hydrogen and vitality planning',
    photo: '/images/advisors/james-wright.webp',
    specializations: ['Hydrogen workflows', 'Stress balance routines', 'Vitality stack design'],
    bio: 'A Hylono advisor works with clients who want to compare hydrogen and oxygen modalities. The session keeps progression conservative and turns broad goals into a weekly plan.',
  },
];

export const advisorsContent = {
  title: 'Advisory support for protocol planning',
  subtitle:
    'Book a guided session with our advisors to review your goals, build a conservative protocol, and stay consistent over time.',
  advisors,
  howItWorksTitle: 'How advisor sessions work',
  howItWorksSteps: [
    'Tell us your goals and current routine during booking.',
    'Meet your advisor for a practical protocol walkthrough.',
    'Receive an action-focused plan with clear weekly checkpoints.',
    'Continue with optional follow-up sessions as your protocol evolves.',
  ],
} as const;

export const advisorById = advisors.reduce<Record<string, Advisor>>((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});
