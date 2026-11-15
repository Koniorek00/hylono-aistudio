import { TechType, Protocol } from '../types';

export const PROTOCOL_REGISTRY: Record<string, Protocol> = {
    'MITO-RESET': {
        id: 'MITO-RESET',
        name: 'Mitochondrial Reset',
        tagline: 'Structured cellular-energy routine with staged modality sequencing.',
        description: 'A strategic sequence designed to pair PEMF, RLT, and oxygen-session planning inside a conservative wellness routine.',
        goals: ['Energy planning', 'Routine support', 'Session sequencing'],
        steps: [
            {
                tech: TechType.PEMF,
                duration: 15,
                instruction: 'Primary electromagnetic field priming at 7.8Hz (Schumann Resonance).'
            },
            {
                tech: TechType.RLT,
                duration: 10,
                instruction: 'Mitochondrial activation via 660nm/850nm light cascading.'
            },
            {
                tech: TechType.HBOT,
                duration: 60,
                instruction: 'High-pressure oxygen saturation at 1.5 ATA to leverage activated pathways.'
            }
        ],
        estimatedTotalTime: 85,
        stackCoherence: 98
    },
    'DEEP-RECOVERY': {
        id: 'DEEP-RECOVERY',
        name: 'Deep Performance Recovery',
        tagline: 'Post-training routine planning with circulation and oxidative-balance support.',
        description: 'Targeted for high-performance athletes or recovery from intensive physical stress. Focuses on circulation and oxidative balance.',
        goals: ['Recovery planning', 'Routine pacing', 'Oxidative-balance support'],
        steps: [
            {
                tech: TechType.PEMF,
                duration: 20,
                instruction: 'Vascular optimization and lymphatic priming.'
            },
            {
                tech: TechType.HYDROGEN,
                duration: 30,
                instruction: 'Molecular hydrogen inhalation for selective antioxidant support.'
            },
            {
                tech: TechType.HBOT,
                duration: 60,
                instruction: 'Oxygen session scheduled after priming steps for structured recovery planning.'
            }
        ],
        estimatedTotalTime: 110,
        stackCoherence: 95
    },
    'QUANTUM-CLARITY': {
        id: 'QUANTUM-CLARITY',
        name: 'Quantum Clarity',
        tagline: 'Focus routine planning with conservative oxygen and hydrogen sequencing.',
        description: 'A protocol framed for cognitive-workload planning, focusing on session timing, comfort, and selective redox-balance support.',
        goals: ['Focus routine', 'Calm planning', 'Recovery-day support'],
        steps: [
            {
                tech: TechType.HYDROGEN,
                duration: 30,
                instruction: 'Hydrogen session for oxidative-stress support within a planned routine.'
            },
            {
                tech: TechType.HBOT,
                duration: 45,
                instruction: 'Oxygenation-focused session planning at 1.3 - 1.5 ATA.'
            }
        ],
        estimatedTotalTime: 75,
        stackCoherence: 92
    }
};
