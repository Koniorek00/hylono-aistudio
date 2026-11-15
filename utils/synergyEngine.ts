import { KNOWLEDGE_REGISTRY, KnowledgePack, SynergyItem } from '../constants/knowledge';
import { TechType } from '../types';

export interface ResonanceResult {
    totalScore: number;
    activeSynergies: SynergyItem[];
    recommendation: string;
}

export const calculateResonance = (activeTechs: TechType[]): ResonanceResult => {
    let baseScore = 0;
    const activeSynergies: SynergyItem[] = [];

    // Collect fit notes between active technologies.
    activeTechs.forEach(tech => {
        const pack = KNOWLEDGE_REGISTRY[tech];
        if (pack && pack.synergies) {
            pack.synergies.forEach(synergy => {
                if (activeTechs.includes(synergy.target as TechType)) {
                    baseScore += synergy.boost;
                    activeSynergies.push(synergy);
                }
            });
        }
    });

    // Normalize or cap the legacy fit score used by preview dashboards.
    const totalScore = Math.min(100, 80 + baseScore);

    let recommendation = "Standard fit review active.";
    if (totalScore > 95) {
        recommendation = "High-priority fit review identified.";
    } else if (totalScore > 90) {
        recommendation = "Review timing, setup, and support needs before combining devices.";
    }

    return {
        totalScore,
        activeSynergies,
        recommendation
    };
};
