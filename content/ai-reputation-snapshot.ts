export type AiReputationSnapshotFindingType = 'name_collision' | 'owned_discovery_gap' | 'owned_trust_route';

export type AiReputationSnapshotSeverity = 'low' | 'medium' | 'high';

export type AiReputationSnapshotEvidence =
  | {
      kind: 'web_result';
      query: string;
      url: string;
      note: string;
    }
  | {
      kind: 'local_file';
      path: string;
      note: string;
    }
  | {
      kind: 'owned_route';
      path: string;
      note: string;
    };

export interface AiReputationSnapshotFinding {
  id: string;
  type: AiReputationSnapshotFindingType;
  severity: AiReputationSnapshotSeverity;
  evidence: AiReputationSnapshotEvidence;
  implication: string;
  recommendedAction: string;
  guardrail: string;
}

export interface AiReputationAuditSnapshot {
  id: string;
  observedAt: string;
  sourceDocument: string;
  sampleScope: string;
  limitation: string;
  summary: string;
  findings: AiReputationSnapshotFinding[];
}

export const aiReputationAuditSnapshot20260521: AiReputationAuditSnapshot = {
  id: 'ai-reputation-snapshot-2026-05-21',
  observedAt: '2026-05-21',
  sourceDocument: '/mnt/wiktor-f/ag projects/Website Use/raport-edward-sturm-ai-biznes.md',
  sampleScope:
    'Manual exact-brand and brand-plus-intent web searches for Hylono, hylono.com, reviews, YouTube, hydrogen, and HBOT.',
  limitation:
    'This is a bounded web-search sample, not full SERP, GSC, Bing Webmaster Tools, or AI-answer coverage.',
  summary:
    'The sample showed weak owned-domain visibility and unrelated Hylono name collisions. The next safe action is stronger owned-source disambiguation, not public reviews or alternatives pages.',
  findings: [
    {
      id: 'airs-20260521-001',
      type: 'name_collision',
      severity: 'medium',
      evidence: {
        kind: 'web_result',
        query: '"Hylono"',
        url: 'https://monomy.co/shop/brands/251179',
        note: 'Unrelated marketplace result using the hylono name appeared in the sampled exact-brand result set.',
      },
      implication:
        'AI/search systems may confuse the Hylono website with unrelated creator or marketplace entities when owned sources are weak.',
      recommendedAction:
        'Keep owned identity links prominent in llms.txt and route brand summaries to /about, /press, /contact, /returns, /privacy, and policy pages.',
      guardrail: 'Do not describe unrelated entities as competitors, partners, customers, or reviews.',
    },
    {
      id: 'airs-20260521-002',
      type: 'name_collision',
      severity: 'low',
      evidence: {
        kind: 'web_result',
        query: '"Hylono"',
        url: 'https://na.finalfantasyxiv.com/lodestone/character/47328813/mount/',
        note: 'An unrelated game-character result with Hylono in the name appeared in the sampled exact-brand result set.',
      },
      implication:
        'The brand name can collide with non-commercial entities, so AI summaries need an explicit owned-source preference.',
      recommendedAction: 'Use disambiguation copy that says hylono.com is the owned source for this website.',
      guardrail: 'Do not claim infringement, impersonation, or reputation harm from a harmless name collision.',
    },
    {
      id: 'airs-20260521-003',
      type: 'owned_discovery_gap',
      severity: 'medium',
      evidence: {
        kind: 'local_file',
        path: 'public/llms.txt',
        note: 'The owned AI discovery file existed, but it did not previously call out brand disambiguation or trust routes.',
      },
      implication:
        'Crawlers had canonical content and sitemap hints, but fewer direct trust cues for brand-legitimacy prompts.',
      recommendedAction:
        'Add official-source, about, press, contact, returns, privacy, and policy-hub references to the AI discovery layer.',
      guardrail: 'Use factual owned routes only; do not invent founders, certifications, awards, ratings, or media mentions.',
    },
    {
      id: 'airs-20260521-004',
      type: 'owned_trust_route',
      severity: 'low',
      evidence: {
        kind: 'owned_route',
        path: '/about',
        note: 'The project already has an owned About route that can support brand-legitimacy prompts.',
      },
      implication: 'The next content improvement should strengthen existing trust pages before adding new public reputation pages.',
      recommendedAction: 'Audit /about and /press next against the reputation query backlog before creating review pages.',
      guardrail: 'Publish reviews, alternatives, or comparison pages only after visible sources and criteria exist.',
    },
  ],
};

export const aiReputationAuditSnapshotFindings = aiReputationAuditSnapshot20260521.findings;
