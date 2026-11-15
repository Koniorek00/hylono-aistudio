export type BlogCategory = 'HBOT' | 'PEMF' | 'RLT' | 'Hydrogen' | 'Protocols';
export type BlogConditionSlug = 'recovery' | 'sleep' | 'stress' | 'comfort' | 'vitality';
export type BlogProductRoute = 'hbot' | 'pemf' | 'rlt' | 'hydrogen';

export interface BlogSection {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
}

export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    category: BlogCategory;
    date: string;
    readTime: string;
    image: string;
    articleType: 'Research note' | 'Planning guide' | 'Protocol guide';
    answerSummary: string;
    audience: string;
    reviewedDate?: string;
    keyTakeaways: string[];
    limitations: string[];
    sections: BlogSection[];
    evidenceIds: string[];
    relatedConditionSlugs: BlogConditionSlug[];
    relatedProtocolSlugs: string[];
    relatedProductRoute: BlogProductRoute | null;
    relatedProductRoutes?: BlogProductRoute[];
    trace_id?: string;
}

export interface ResearchStudy {
    id: string;
    title: string;
    category: 'Recovery' | 'Cognitive' | 'Sleep' | 'Cellular';
    metric: string;
    value: string;
    description: string;
    fullContent?: string;
    participants: number;
    status: 'Published' | 'Peer Review' | 'Clinical Trial' | 'Review Required';
    trace_id?: string;
    /** PubMed URL for E-E-A-T compliance (P1-5 SEO Fix) */
    pubmedUrl?: string;
    /** DOI reference for academic citation */
    doi?: string;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        id: 1,
        title: 'The Science Behind Hyperbaric Oxygen Therapy',
        excerpt:
            'A Hylono research note on what mild hyperbaric oxygen is, where the strongest recovery-oriented signals currently sit, and which limits matter before you generalize the evidence.',
        category: 'HBOT',
        date: 'Jan 15, 2026',
        readTime: '8 min',
        image: 'from-cyan-400 to-blue-500',
        articleType: 'Research note',
        reviewedDate: '2026-04-23',
        answerSummary:
            'Read this first if you want a plain-language HBOT starting point before opening the cited records, the HBOT hub, or the recovery protocol guide.',
        audience: 'Active adults and visitors comparing recovery-oriented wellness modalities.',
        keyTakeaways: [
            'Hylono frames mild HBOT as a recovery-first wellness path, not as a universal claim page.',
            'The linked evidence is real but narrow: athletes, exercise soreness, and a chronic post-mTBI sleep-assessment population are not interchangeable.',
            'The best next step depends on whether the visitor needs source evidence, equipment fit, or a repeatable routine design.',
        ],
        limitations: [
            'The strongest linked HBOT records in this repo focus on athletes, exercise-induced soreness, and a specific chronic post-mTBI sleep-assessment study rather than every general-wellness use case.',
            'The chronic post-mTBI sleep record should not be generalized into a claim for everyday wellness, cognitive performance, or recovery outcomes.',
            'Study design, pressure protocol, and population differences make it unsafe to flatten HBOT into one generic benefit statement.',
        ],
        sections: [
            {
                heading: 'What mild HBOT means in the Hylono context',
                paragraphs: [
                    'On Hylono, mild hyperbaric oxygen therapy is positioned as a guided wellness-technology option for people who want a structured recovery-first routine. The site does not present it as a universal answer or as a substitute for individualized professional advice.',
                    'This article exists to help a visitor understand the question behind the category before they jump into a product page, a protocol page, or a cited study. It is meant to reduce overreach, not add hype.',
                ],
            },
            {
                heading: 'What the cited evidence here actually covers',
                paragraphs: [
                    'The reviewed source set currently linked here is specific. It includes performance-oriented HBOT research in middle-aged athletes, a meta-analysis on exercise-induced muscle injury and soreness, and a randomized sleep-assessment trial in a chronic post-mTBI population.',
                    'That means the article can support source-aware education and planning, but it should not stretch those findings into broad promises. Population, pressure protocol, comparison group, and endpoint fit still matter when someone moves from reading to action.',
                ],
            },
            {
                heading: 'How the three cited records should shape the next decision',
                paragraphs: [
                    'Use the athlete mitochondrial-respiration record as a signal about measured performance context, not as a promise that every active adult will feel the same response after a mild chamber routine. The useful question is whether your use case resembles a structured recovery or training environment.',
                    'Use the exercise-soreness meta-analysis to understand why recovery claims need endpoint discipline. Muscle soreness, functional recovery, fatigue perception, and general vitality are related questions, but they are not the same outcome and should not be collapsed into one benefit line.',
                    'Use the chronic post-mTBI sleep-assessment record as a reminder to check population fit before borrowing language from a clinical or post-injury study. If the cited population does not match the visitor, the safer move is to keep reading through research, protocol, or support pages before treating HBOT as a personal plan.',
                ],
                bullets: [
                    'If your use case is training recovery, compare the athlete and soreness records before opening the recovery protocol.',
                    'If your use case is sleep or cognitive recovery, read the population limits before moving from article education to action.',
                    'If your use case is general wellness, treat the cited records as context and move to the HBOT hub or contact path for fit questions.',
                ],
            },
            {
                heading: 'How to use this article without overreaching',
                paragraphs: [
                    "If your main question is 'what do the studies actually show?', the research hub is the stronger next stop because it keeps the source and the limitation together.",
                    "If your main question is 'how would I use this in a repeatable weekly routine?', the recovery protocol page is usually the better continuation. If you are still comparing equipment categories, the HBOT hub is the better path.",
                ],
                bullets: [
                    'Use the research hub for source records, populations, endpoints, and limitation summaries.',
                    'Use the HBOT hub for equipment context, support policy, and commercial fit.',
                    'Use the recovery protocol guide when the goal is already clear and the next question is implementation.',
                ],
            },
        ],
        evidenceIds: ['ev-hbot-001', 'ev-hbot-002', 'ev-hbot-003'],
        relatedConditionSlugs: ['recovery', 'vitality'],
        relatedProtocolSlugs: ['recovery-oxygen-foundation', 'vitality-dual-stack'],
        relatedProductRoute: 'hbot',
        trace_id: 'HBOT-CLAIM-001',
    },
    {
        id: 2,
        title: 'PEMF Therapy: Recharging Your Cellular Batteries',
        excerpt:
            'An orientation guide to how Hylono frames PEMF in sleep, comfort, and stress-support routines, plus the questions to answer before treating it as a primary modality.',
        category: 'PEMF',
        date: 'Jan 12, 2026',
        readTime: '6 min',
        image: 'from-purple-400 to-pink-500',
        articleType: 'Planning guide',
        reviewedDate: '2026-04-22',
        answerSummary:
            'Use this article to decide whether PEMF belongs in a goal-first planning path before opening condition guides, the PEMF hub, or direct support.',
        audience: 'Visitors comparing sleep, stress, comfort, or recovery planning paths before moving into product-level PEMF detail.',
        keyTakeaways: [
            'PEMF is treated here as a complementary planning option, not a stand-alone proof page.',
            'The stronger next move is usually goal-first: sleep, stress, or comfort before device-first comparison.',
            'This article should narrow the question before a visitor moves to research, product safety context, or support.',
        ],
        limitations: [
            'This article does not cite a canonical PEMF evidence record from the main evidence library yet, so it should not be used as proof of efficacy.',
            'This article should not be used to choose PEMF settings for implanted electronics, acute medical concerns, or individualized clinical questions.',
            'Because PEMF use cases vary by routine and goal, the condition guides are usually more useful than a modality-only reading path.',
        ],
        sections: [
            {
                heading: 'What this PEMF article can answer',
                paragraphs: [
                    'On Hylono, PEMF appears as a complementary planning option for visitors comparing sleep routines, stress-support paths, comfort questions, and recovery context. It is not framed as a one-size-fits-all answer.',
                    'The practical question is not whether PEMF is broadly useful. The question is whether the visitor goal, routine setting, support needs, and safety context make PEMF worth comparing against condition guides, product details, or direct planning support.',
                ],
            },
            {
                heading: 'What the evidence gap means here',
                paragraphs: [
                    'The current reviewed source set used by this article does not include a PEMF-specific record here. That keeps the page at planning level: it can point to stronger Hylono pages, but it should not turn generic PEMF language into an outcome claim.',
                    'If a visitor needs source-level evidence before acting, the research hub is the better place to understand how Hylono separates cited records, limitations, and modality fit. If the question is PEMF-specific, product and support pages should carry the safety and fit conversation.',
                ],
            },
            {
                heading: 'Decide goal-first, then move to the stronger page',
                paragraphs: [
                    'Start with the goal rather than the device. Sleep, stress, and comfort each create different expectations for timing, session consistency, and whether a single modality is enough.',
                    'Move to the PEMF hub when you are comparing the equipment category itself. Move to condition guides when the decision is still goal-first. Move to contact when planning depends on schedule, tolerance, contraindications, or stack questions.',
                ],
                bullets: [
                    'Use sleep, stress, or comfort guides when the main question is still goal fit.',
                    'Use the PEMF hub when the device category, support context, and access model are the question.',
                    'Use contact when the plan depends on scheduling, tolerance, implanted-electronics screening, or multi-modality stack questions.',
                ],
            },
        ],
        evidenceIds: [],
        relatedConditionSlugs: ['sleep', 'stress', 'comfort'],
        relatedProtocolSlugs: [],
        relatedProductRoute: 'pemf',
        trace_id: 'PEMF-CLAIM-001',
    },
    {
        id: 3,
        title: 'Red Light Therapy for Skin Regeneration',
        excerpt:
            'A conservative planning guide for turning red and near-infrared light questions into clearer comfort, recovery, evidence, product, or support next steps.',
        category: 'RLT',
        date: 'Jan 10, 2026',
        readTime: '5 min',
        image: 'from-red-400 to-orange-500',
        articleType: 'Planning guide',
        reviewedDate: '2026-04-23',
        answerSummary:
            'Use this article to turn a skin-regeneration search into safer planning questions before comparing comfort guidance, recovery guidance, the red-light hub, or direct support.',
        audience: 'Visitors arriving through skin, comfort, or recovery queries before comparing red-light equipment or support.',
        keyTakeaways: [
            'This page keeps red-light skin language at planning level because no canonical RLT evidence record is attached to this article yet.',
            'The closest internal context is the Comfort guide for local routine questions and the Recovery guide for tissue-support stacks.',
            'Move to research or contact when the decision depends on source evidence, contraindications, schedule, or stack fit.',
        ],
        limitations: [
            'This article does not cite a canonical RLT evidence record from the main evidence library yet, so it should not be used as proof of efficacy.',
            'This article does not claim skin regeneration outcomes, collagen changes, clinical effects, or fixed routine results.',
            'This article should not be used to choose wavelength, dose, session length, or exposure distance for individual skin or medical concerns.',
        ],
        sections: [
            {
                heading: 'What this red-light article can safely do',
                paragraphs: [
                    'On Hylono, red and near-infrared light is treated as a modality category that needs goal context before it becomes a product or protocol decision. This article is an orientation surface, not a source-level evidence review.',
                    'That distinction matters for a skin-regeneration query because the next useful step may be comfort planning, recovery planning, evidence review, or direct support rather than a device-first answer.',
                ],
            },
            {
                heading: 'Why skin language needs a narrower next step',
                paragraphs: [
                    'The current reviewed source set used by this article does not include an RLT-specific record here. That keeps the article from turning broad skin or cosmetic language into outcome claims.',
                    'If the real question is local comfort, recovery rhythm, routine tolerance, or whether another modality belongs in the stack, the condition guides are the stronger path because they keep the goal visible.',
                ],
            },
            {
                heading: 'How to continue without overclaiming',
                paragraphs: [
                    'Use this page to narrow the decision, not to finish it. Move to the red-light hub only when the category itself is the question; otherwise start with the goal or the support path.',
                    'This keeps the article useful for discovery while preserving the conservative evidence posture used across Hylono health-adjacent pages.',
                ],
                bullets: [
                    'Open the Comfort guide when the question is local routine fit.',
                    'Open the Recovery guide when red light is being compared inside a broader recovery stack.',
                    'Open the red-light hub only after the modality category is already relevant.',
                    'Use contact when planning depends on contraindication screening, schedule, tolerance, or stack fit.',
                ],
            },
        ],
        evidenceIds: [],
        relatedConditionSlugs: ['comfort', 'recovery'],
        relatedProtocolSlugs: [],
        relatedProductRoute: 'rlt',
        trace_id: 'RLT-CLAIM-001',
    },
    {
        id: 4,
        title: 'Hydrogen Water: The Smallest Antioxidant',
        excerpt:
            'A Hylono research note on molecular hydrogen that separates hydrogen-water orientation from broad antioxidant or efficacy claims.',
        category: 'Hydrogen',
        date: 'Jan 8, 2026',
        readTime: '7 min',
        image: 'from-sky-400 to-cyan-500',
        articleType: 'Research note',
        reviewedDate: '2026-04-23',
        answerSummary:
            'Use this article to decide whether your next step should be the H2 evidence set, the stress or vitality guides, the hydrogen hub, or direct support.',
        audience: 'Visitors comparing hydrogen water, hydrogen inhalation, fatigue evidence, and lighter-weight routine options before choosing a next step.',
        keyTakeaways: [
            'This article keeps the hydrogen-water question tied to the current canonical H2 evidence set instead of treating the title as a blanket antioxidant claim.',
            'The cited records include a healthy-adult fatigue and aerobic-capacity meta-analysis, one highly specific hydrogen-oxygen breathing trial, and an early fatigue-focused review.',
            'The stronger next step depends on whether the visitor needs source evidence, goal-first planning, hydrogen category context, or direct support.',
        ],
        limitations: [
            'This article stays away from disease, prevention, detox, and fixed-outcome language for any condition.',
            'The cited hydrogen evidence set mixes hydrogen-water and hydrogen-inhalation contexts, so delivery method and protocol fit should not be collapsed into one claim.',
            'One cited trial uses a highly specific post-care patient population and should not be generalized to everyday wellness visitors.',
        ],
        sections: [
            {
                heading: 'What this hydrogen-water article can safely answer',
                paragraphs: [
                    'On Hylono, molecular hydrogen is handled as a conservative evidence-informed planning topic, not as a shortcut to broad antioxidant or disease-language claims.',
                    'A visitor may arrive through a hydrogen-water question, but the current evidence set spans both hydrogen-water and hydrogen-inhalation contexts. That is why the article should narrow the next step instead of pretending every delivery route carries the same evidence weight.',
                ],
            },
            {
                heading: 'What the cited H2 records actually cover',
                paragraphs: [
                    'The reviewed records linked from this page cover fatigue and aerobic-capacity outcomes in healthy adults, modified hydrogen-oxygen breathing in a narrow post-care population, and a review of early fatigue-related molecular hydrogen literature.',
                    'That makes the article useful for source-aware orientation, but not for sweeping claims about detox, clinical outcomes, or universal antioxidant effects. Study design, population, delivery method, and endpoint all remain part of the decision.',
                ],
            },
            {
                heading: 'How to move forward without overclaiming',
                paragraphs: [
                    'Use this page as a routing surface. Go to research when source quality is the main question, to the stress or vitality guides when the goal is still being defined, and to the hydrogen hub when the equipment category is already relevant.',
                    'Use contact when the decision depends on delivery method, tolerance, schedule, stack fit, or whether a lighter daily routine is enough compared with a more structured protocol.',
                ],
                bullets: [
                    'Open the research hub when you need the source records and their limitations in one place.',
                    'Open the Stress or Vitality guide when the real decision is goal-first rather than device-first.',
                    'Open the hydrogen hub when you are comparing the delivery category, support context, and access path.',
                    'Use contact when planning depends on delivery method, schedule, tolerance, or a multi-modality stack.',
                ],
            },
        ],
        evidenceIds: ['ev-h2-001', 'ev-h2-002', 'ev-h2-003'],
        relatedConditionSlugs: ['stress', 'vitality', 'recovery'],
        relatedProtocolSlugs: ['stress-balance-h2-foundation', 'vitality-dual-stack'],
        relatedProductRoute: 'hydrogen',
        trace_id: 'H2-CLAIM-001',
    },
    {
        id: 5,
        title: 'The Superhuman Protocol: Combining PEMF, HBOT, and RLT',
        excerpt:
            'A conservative planning guide for visitors comparing PEMF, HBOT, and red-light routines without treating the combined stack as proven outcome science.',
        category: 'Protocols',
        date: 'Jan 5, 2026',
        readTime: '10 min',
        image: 'from-slate-600 to-slate-800',
        articleType: 'Protocol guide',
        reviewedDate: '2026-04-23',
        answerSummary:
            'Use this article when you need to choose between goal-first guides, single-modality evidence review, and direct support before combining tools.',
        audience: 'Visitors comparing recovery, stress, or vitality routines before moving from one modality into a broader home plan.',
        keyTakeaways: [
            'Hylono does not currently publish a canonical combined-stack evidence record for PEMF plus HBOT plus red light.',
            'The article can point to reviewed HBOT records, but those records do not validate the combined protocol sequence.',
            'A condition or protocol page should define the goal before product hubs are used to compare equipment fit.',
        ],
        limitations: [
            'This article does not validate the combined PEMF to HBOT to red-light sequence as an evidence-backed outcome protocol.',
            'This article does not prescribe session order, dose, frequency, contraindication handling, or personalized medical planning.',
            'PEMF and red-light references on this article are planning references unless and until reviewed source summaries are added.',
        ],
        sections: [
            {
                heading: 'What this stack article can and cannot prove',
                paragraphs: [
                    "The phrase Superhuman Protocol is useful shorthand for a multi-modality idea, but Hylono should not turn that shorthand into a proof claim. The article's job is to separate goal selection, evidence review, product fit, and protocol design.",
                    'The reviewed records linked from this page are HBOT records. They can support a narrower source-aware review of HBOT questions, but they do not prove that a combined PEMF, HBOT, and red-light sequence produces a specific outcome.',
                ],
            },
            {
                heading: 'Start with the goal and baseline, not the largest stack',
                paragraphs: [
                    'A stack only becomes useful when the visitor already knows the primary goal, the baseline constraint, and the time commitment they can sustain. Recovery, stress, and vitality routines can require different first decisions.',
                    'Without that order of operations, a multi-device plan can create noise instead of clarity. Use the condition pages to narrow the goal, then use protocol pages to compare the routine shape before adding more modalities.',
                ],
            },
            {
                heading: 'Review each modality in its own context',
                paragraphs: [
                    'Each modality should earn its place in the routine on its own terms. HBOT has reviewed source summaries attached here; PEMF and red-light should be treated as product and planning topics until reviewed source summaries are added to the shared evidence library.',
                    'That means product hubs are useful for fit, support model, and access questions, while the research hub is the better place to inspect cited records and their limitations.',
                ],
                bullets: [
                    'Use the HBOT hub when the evidence-linked oxygen category and chamber fit are the main questions.',
                    'Use the PEMF hub when the question is category fit, safety context, and support before adding electromagnetic routines.',
                    'Use the red-light hub when the question is product-category fit rather than a combined outcome claim.',
                    'Use the research hub when source quality and limitations matter more than product selection.',
                ],
            },
            {
                heading: 'When a protocol page is the better continuation',
                paragraphs: [
                    'If the visitor already knows the goal, the protocol library is usually more useful than another broad stack article. It can turn recovery or vitality intent into a repeatable weekly shape without implying that every modality belongs in every plan.',
                    'Use direct support when the decision depends on schedule, tolerance, contraindication screening, or whether a simpler single-modality routine is a better starting point.',
                ],
                bullets: [
                    'Open the recovery oxygen foundation protocol when the goal is recovery-first and HBOT is already relevant.',
                    'Open the vitality dual stack protocol when the visitor is comparing a broader energy or routine-building path.',
                    'Use contact when the next step depends on stack fit, timing, tolerance, or safety screening.',
                ],
            },
        ],
        evidenceIds: ['ev-hbot-001', 'ev-hbot-002', 'ev-hbot-003'],
        relatedConditionSlugs: ['recovery', 'stress', 'vitality'],
        relatedProtocolSlugs: ['recovery-oxygen-foundation', 'vitality-dual-stack'],
        relatedProductRoute: 'hbot',
        relatedProductRoutes: ['hbot', 'pemf', 'rlt'],
        trace_id: 'PROTOCOL-CLAIM-001',
    },
];

const nonCanonicalStudyNotice =
    'This legacy compatibility card is retained so older product and editor surfaces do not break, but it is a review-required summary. Use the research hub for the current reviewed HBOT and hydrogen evidence set.';

export const RESEARCH_STUDIES: ResearchStudy[] = [
    {
        id: '1',
        title: 'HBOT performance evidence record',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Canonical RCT',
        description:
            'Canonical HBOT evidence record for physical-performance and mitochondrial-respiration outcomes in middle-aged athletes; interpret outside that population cautiously.',
        fullContent:
            'Hylono uses this compatibility card to point legacy surfaces toward the reviewed HBOT source summary rather than a broad performance promise. The approved summary belongs in content/evidence.ts and the /research hub.',
        participants: 37,
        status: 'Published',
        trace_id: 'HBOT-SPEC-001',
        pubmedUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8825926/',
    },
    {
        id: '2',
        title: 'PEMF sleep evidence card pending review',
        category: 'Sleep',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'PEMF-SPEC-001',
    },
    {
        id: '3',
        title: 'Red-light skin evidence card pending review',
        category: 'Cellular',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'RLT-SPEC-001',
    },
    {
        id: '4',
        title: 'Hydrogen fatigue evidence record',
        category: 'Cognitive',
        metric: 'Evidence status',
        value: 'Canonical review',
        description:
            'Canonical hydrogen evidence record for fatigue and aerobic-capacity outcomes in healthy-adult studies; protocol heterogeneity and evidence limits remain visible on /research.',
        fullContent:
            'Hylono uses this compatibility card to point legacy surfaces toward the canonical hydrogen evidence set rather than a broad antioxidant or cognitive-performance claim. The approved summary belongs in content/evidence.ts and the /research hub.',
        participants: 0,
        status: 'Published',
        trace_id: 'H2-SPEC-001',
        pubmedUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9934906/',
    },
    {
        id: '5',
        title: 'EWOT evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'EWOT-SPEC-001',
    },
    {
        id: '6',
        title: 'Far-infrared sauna evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'SAUNA-SPEC-001',
    },
    {
        id: '7',
        title: 'EMS evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'EMS-SPEC-001',
    },
    {
        id: '8',
        title: 'VNS evidence card pending review',
        category: 'Sleep',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'VNS-SPEC-001',
    },
    {
        id: '9',
        title: 'Hypoxic-training evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'HYPOXIC-SPEC-001',
    },
    {
        id: '10',
        title: 'Cryotherapy evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'CRYO-SPEC-001',
    },
    {
        id: '11',
        title: 'HBOT post-concussion evidence card pending review',
        category: 'Cognitive',
        metric: 'Evidence status',
        value: 'Review required',
        description:
            'This legacy HBOT compatibility card is not part of the current public reviewed source set and must not be used as a broad cognitive or post-concussion outcome claim.',
        fullContent:
            'Hylono keeps this legacy trace id only for compatibility. Current public HBOT citations are governed through content/evidence.ts and the /research hub, with population and protocol limits preserved.',
        participants: 0,
        status: 'Review Required',
        trace_id: 'HBOT-COG-001',
    },
    {
        id: '12',
        title: 'HBOT wound recovery-support evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description:
            'This legacy HBOT compatibility card is not part of the current public reviewed source set and must not be used as a wound recovery-support, amputation, or disease-management claim.',
        fullContent:
            'Hylono keeps this legacy trace id only for compatibility. Current public HBOT citations are governed through content/evidence.ts and the /research hub, with population and protocol limits preserved.',
        participants: 0,
        status: 'Review Required',
        trace_id: 'HBOT-WOUND-001',
    },
    {
        id: '13',
        title: 'Red-light recovery evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'RLT-RECOVERY-001',
    },
    {
        id: '14',
        title: 'Transcranial NIR evidence card pending review',
        category: 'Cognitive',
        metric: 'Evidence status',
        value: 'Review required',
        description: nonCanonicalStudyNotice,
        fullContent: nonCanonicalStudyNotice,
        participants: 0,
        status: 'Review Required',
        trace_id: 'RLT-COG-001',
    },
    {
        id: '15',
        title: 'PEMF pain evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description:
            'This legacy PEMF compatibility card is not part of the current public reviewed source set and must not be used as a pain, disability, medication-use, or treatment-outcome claim.',
        fullContent:
            'Hylono keeps this legacy trace id only for compatibility. PEMF pages should remain planning and product-fit surfaces unless canonical PEMF evidence records are added to the shared evidence source.',
        participants: 0,
        status: 'Review Required',
        trace_id: 'PEMF-PAIN-001',
    },
    {
        id: '16',
        title: 'PEMF fracture evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description:
            'This legacy PEMF compatibility card is not part of the current public reviewed source set and must not be used as a fracture recovery-support, clearance, or orthopedic-treatment claim.',
        fullContent:
            'Hylono keeps this legacy trace id only for compatibility. PEMF pages should remain planning and product-fit surfaces unless canonical PEMF evidence records are added to the shared evidence source.',
        participants: 0,
        status: 'Review Required',
        trace_id: 'PEMF-BONE-001',
    },
    {
        id: '17',
        title: 'Hydrogen metabolic evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description:
            'This legacy hydrogen compatibility card is not part of the current public reviewed source set and must not be used as a metabolic-syndrome, cholesterol, insulin, or inflammation claim.',
        fullContent:
            'Hylono keeps this legacy trace id only for compatibility. Current public hydrogen citations are governed through content/evidence.ts and the /research hub, with delivery-method and population limits preserved.',
        participants: 0,
        status: 'Review Required',
        trace_id: 'H2-METAB-001',
    },
    {
        id: '18',
        title: 'Hydrogen post-cardiac-arrest evidence card pending review',
        category: 'Recovery',
        metric: 'Evidence status',
        value: 'Review required',
        description:
            'This legacy hydrogen compatibility card is not part of the current public reviewed source set and must not be used as a cardiac-arrest, neuroprotection, or disease-management claim.',
        fullContent:
            'Hylono keeps this legacy trace id only for compatibility. Current public hydrogen citations are governed through content/evidence.ts and the /research hub, with delivery-method and population limits preserved.',
        participants: 0,
        status: 'Review Required',
        trace_id: 'H2-NEURO-001',
    },
];
