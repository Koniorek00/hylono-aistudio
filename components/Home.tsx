import React from 'react';
import { HeroConcept1 } from './heroes/HeroConcept1';
import { isFeatureEnabled } from '../utils/featureFlags';
import { HomeBrandTickerSection } from './home/HomeBrandTickerSection';
import { HomeJumpstartSection } from './home/HomeJumpstartSection';
import { HomeValuePropSection } from './home/HomeValuePropSection';
import { HomeHowItWorksSection } from './home/HomeHowItWorksSection';
import { HomeScienceSection } from './home/HomeScienceSection';
import { HomeFinalCtaSection } from './home/HomeFinalCtaSection';
import { HomeAccessPathsSection } from './home/HomeAccessPathsSection';
import { HomeAudienceSection } from './home/HomeAudienceSection';
import { HomeTestimonialsSection } from './home/HomeTestimonialsSection';
import { HomeTrustFaqSection } from './home/HomeTrustFaqSection';
import { HomeMedicalDisclaimerSection } from './home/HomeMedicalDisclaimerSection';
import { HomeRouteActionStatus } from './home/HomeRouteActionStatus';

interface HomeProps {
    onOpenPlanner: (source: string) => void;
    onSeeHowItWorks: (source: string) => void;
    onStartConsultation: (source: string) => void;
    onNavigate: (path: string) => void;
    homepageEnhancementsEnabled?: boolean;
}

export const Home: React.FC<HomeProps> = ({
    onOpenPlanner,
    onSeeHowItWorks,
    onStartConsultation,
    onNavigate,
    homepageEnhancementsEnabled: homepageEnhancementsEnabledProp,
}) => {
    const homepageEnhancementsEnabled =
        homepageEnhancementsEnabledProp ?? isFeatureEnabled('feature_homepage_enhancements');

    return (
        <div className="w-full min-w-0 overflow-x-hidden">
            <HomeRouteActionStatus />

            {/* ── HERO ── */}
            <HeroConcept1
                onOpenPlanner={onOpenPlanner}
                onSeeHowItWorks={onSeeHowItWorks}
                onStartConsultation={onStartConsultation}
            />

            <HomeBrandTickerSection />

            <HomeJumpstartSection
                homepageEnhancementsEnabled={homepageEnhancementsEnabled}
            />

            <HomeValuePropSection />

            <HomeHowItWorksSection
                onNavigate={onNavigate}
                onStartConsultation={onStartConsultation}
            />

            <HomeAccessPathsSection />

            <HomeAudienceSection />

            <HomeScienceSection />

            <HomeTestimonialsSection />

            <HomeTrustFaqSection />

            <HomeMedicalDisclaimerSection />

            <HomeFinalCtaSection
                onNavigate={onNavigate}
                onStartConsultation={onStartConsultation}
            />


        </div>
    );
};
