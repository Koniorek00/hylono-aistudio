import { siteEntity } from './site-entity';

export interface HelpFaqItem {
  q: string;
  a: string;
}

export interface HelpFaqCategory {
  category: string;
  evidenceSource?: string;
  items: HelpFaqItem[];
}

export const HELP_FAQ_DATA: HelpFaqCategory[] = [
  {
    category: 'About Hylono',
    items: [
      {
        q: 'What is Hylono?',
        a: `${siteEntity.description} Use this FAQ for public support questions, then move to help or contact when your question depends on order, rental, setup, or protocol context.`,
      },
      {
        q: 'What does "Where Mind Connects with Matter" mean?',
        a: 'It is public brand language for pairing guided access, protocol planning, and conservative education. It is not a promise of a specific outcome.',
      },
      {
        q: 'Are these medical devices?',
        a: 'Hylono presents the public range as wellness technology. Ask the team for model-specific intended-use and compliance documentation before relying on a device for a regulated use.',
      },
      {
        q: 'Do you ship internationally?',
        a: `Hylono publishes ${siteEntity.supportCoverageLabel.toLowerCase()} for the ${siteEntity.serviceArea}. For delivery outside a standard support path, ask Hylono to confirm current logistics before purchase or rental.`,
      },
    ],
  },
  {
    category: 'Science & Protocols',
    evidenceSource: 'See Research Hub: /research',
    items: [
      {
        q: 'What is the Superhuman Protocol?',
        a: 'It is shorthand for an ordered wellness routine. Hylono should confirm the exact sequence, device fit, contraindications, and setup notes before you combine modalities.',
      },
      {
        q: 'What are contraindications and safety considerations?',
        a: 'Each modality has specific suitability criteria and setup precautions. Always review device manuals and consult a qualified healthcare professional before starting a new protocol.',
      },
      {
        q: 'How often should I use the systems?',
        a: 'Frequency depends on goals, tolerance, device instructions, and professional guidance. Use the relevant protocol plan as a starting point and adjust only with appropriate support.',
      },
      {
        q: 'Can I combine multiple technologies?',
        a: 'Combination routines should be planned rather than improvised. Confirm sequence, recovery windows, contraindications, and device instructions before combining modalities.',
      },
    ],
  },
  {
    category: 'Products & Purchasing',
    items: [
      {
        q: 'How do I choose the right product?',
        a: 'Use planner tools and consultation context to match modality, usage setting, and practical constraints with your priorities.',
      },
      {
        q: 'Can I try before buying?',
        a: 'Use the rental page or contact Hylono to check whether access is available for the specific product, market, and support context before deciding on purchase.',
      },
      {
        q: 'What warranty coverage do you provide?',
        a: 'Review the warranty page and ask support for product-specific warranty context before finalizing an order or rental request.',
      },
      {
        q: 'Is financing available?',
        a: 'The public FAQ does not confirm financing availability. Ask Hylono to confirm current purchase, rental, or payment options for your market before committing.',
      },
    ],
  },
  {
    category: 'Shipping & Support',
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Delivery timing is confirmed by product, market, logistics path, and installation requirements. Ask Hylono for the current timeline before relying on a date.',
      },
      {
        q: 'Do you provide installation and setup?',
        a: 'Setup requirements depend on the product and installation context. Ask Hylono what onboarding, documentation, and installation support apply before finalizing.',
      },
      {
        q: 'How do I track my order?',
        a: 'Tracking or freight coordination details are shared through the support path when dispatch or delivery planning is confirmed.',
      },
      {
        q: 'What is your return policy?',
        a: 'Review the returns page and ask support for product-specific return or rental conditions before finalizing your order.',
      },
    ],
  },
];
