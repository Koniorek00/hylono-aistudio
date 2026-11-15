import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PartnerColor = string;

export type CampaignGoal = 'launch' | 'education' | 'promotion' | 'event';
export type CampaignFormat = 'social-square' | 'social-story' | 'print-poster';
export type Modality = 'HBOT' | 'PEMF' | 'RLT' | 'Hydrogen';
export type Theme = 'modern' | 'luxury' | 'bold';
export type CampaignVoice = 'balanced' | 'clinical' | 'luxury';

export interface PartnerProfile {
    logoUrl: string | null;
    brandColor: PartnerColor;
    secondaryColor: string;
    clinicName: string;
    address: string;
    website: string;
    bookingUrl: string;
    phone: string;
    socialInstagram: string;
    socialFacebook: string;
}

export type LayoutVariation = 0 | 1 | 2;

export const COPY_LIBRARY: Record<
    string,
    { title: string; body: string; caption: string; hashtags: string }
> = {
    'promotion-HBOT': {
        title: 'Structured Oxygen Session Support',
        body: 'Introduce guided hyperbaric oxygen sessions within a clinician-reviewed wellness offer built around routine support, recovery planning, and calm onboarding.',
        caption:
            'Introduce hyperbaric oxygen sessions with a clearer next step.\n\nUse this campaign to explain how guided oxygen sessions may fit a recovery-minded wellness routine and invite new clients into a consultation.',
        hashtags: '#HBOT #WellnessSupport #ClinicLaunch #RecoveryRoutine #Hylono',
    },
    'education-HBOT': {
        title: 'How HBOT Fits A Wellness Routine',
        body: 'Use this asset to explain where structured oxygen sessions may support guided recovery, focus, and routine planning without overstating outcomes.',
        caption:
            'Educational campaigns work best when they reduce guesswork.\n\nExplain what a guided HBOT session is, who it may suit, and how your clinic introduces it responsibly.',
        hashtags: '#HBOTEducation #WellnessWorkflow #ClinicEducation #Hylono',
    },
    'launch-HBOT': {
        title: 'HBOT Has Arrived At Our Clinic',
        body: 'Announce new equipment with practical detail: who it serves, how onboarding works, and how your team keeps the experience structured and supportive.',
        caption:
            'New equipment launches perform better when the first action is obvious.\n\nInvite your audience to review the workflow, ask questions, and book a guided introduction.',
        hashtags: '#HBOTLaunch #ClinicUpdate #GuidedWellness #Hylono',
    },
    'event-HBOT': {
        title: 'Join Our Oxygen Education Event',
        body: 'Promote a calm, information-led session where guests can review the workflow, ask questions, and understand how oxygen sessions fit your clinic offering.',
        caption:
            'Use event campaigns to build trust before conversion.\n\nInvite guests to learn how guided HBOT sessions are introduced, what to expect, and how to continue the conversation with your team.',
        hashtags: '#ClinicEvent #HBOTWorkshop #WellnessEducation #Hylono',
    },
    'promotion-PEMF': {
        title: 'Support Everyday Recovery Planning',
        body: 'Position PEMF as a structured wellness session used to support comfort, consistency, and guided recovery routines within your clinic environment.',
        caption:
            'PEMF campaigns work best when they stay grounded.\n\nDescribe the experience, explain the setting, and invite your audience into a guided first session rather than promising outcomes.',
        hashtags: '#PEMF #RecoverySupport #ClinicWellness #Hylono',
    },
    'education-PEMF': {
        title: 'What A PEMF Session Looks Like',
        body: 'Explain how your clinic introduces PEMF sessions, how long they last, and how they may support structured wellbeing routines and comfort-focused programs.',
        caption:
            'Educational content builds trust when it reduces uncertainty.\n\nUse this caption to explain the PEMF workflow, session setting, and who should ask for a guided consultation first.',
        hashtags: '#PEMFEducation #WellnessRoutine #ClinicEducation #Hylono',
    },
    'launch-PEMF': {
        title: 'PEMF Sessions Now Available',
        body: 'Announce PEMF with a practical rollout message that focuses on the clinic experience, onboarding path, and the types of routines it may complement.',
        caption:
            'A launch campaign should answer the first three questions fast: what it is, who it is for, and how to book a guided introduction.',
        hashtags: '#PEMFLaunch #ClinicUpdate #WellnessSupport #Hylono',
    },
    'event-PEMF': {
        title: 'PEMF Demo Evening',
        body: 'Invite guests to a focused information session covering PEMF setup, comfort expectations, and how your team frames the modality responsibly.',
        caption:
            'Turn an event into a trust builder.\n\nShow the space, explain the workflow, and create a simple booking path for guests who want follow-up support.',
        hashtags: '#PEMFEvent #ClinicWorkshop #WellnessEducation #Hylono',
    },
    'promotion-RLT': {
        title: 'Light-Led Wellness Support',
        body: 'Introduce red light sessions as a calm, clinic-guided modality used in wellbeing routines that focus on consistency, skin support, and recovery planning.',
        caption:
            'Promotional red light content should stay clear and supportive.\n\nDescribe the environment, explain the routine, and guide people toward a consultation if they want a tailored recommendation.',
        hashtags: '#RedLight #WellnessSupport #ClinicCare #Hylono',
    },
    'education-RLT': {
        title: 'Understanding Red Light Sessions',
        body: 'Explain how red and near-infrared light sessions are introduced in your clinic and how they may fit broader wellbeing and recovery-focused routines.',
        caption:
            'The strongest educational campaigns explain the session, not just the modality.\n\nUse this post to clarify timing, setup, and the next step for a guided introduction.',
        hashtags: '#RedLightEducation #WellnessRoutine #ClinicEducation #Hylono',
    },
    'launch-RLT': {
        title: 'A New Red Light Offering',
        body: 'Announce your red light setup with clear onboarding language, experience notes, and a simple call to review whether the modality fits a client routine.',
        caption:
            'A launch message should feel premium without becoming vague.\n\nFrame the environment, the workflow, and the contact path clearly.',
        hashtags: '#RedLightLaunch #ClinicUpdate #GuidedWellness #Hylono',
    },
    'event-RLT': {
        title: 'Red Light Open Session',
        body: 'Invite your audience to a guided event that introduces the red light environment, workflow, and the questions they should ask before booking.',
        caption:
            'Event-led education can shorten the trust gap.\n\nUse this caption to invite guests into a clear, low-pressure introduction to your red light offering.',
        hashtags: '#RedLightEvent #ClinicWorkshop #WellnessEducation #Hylono',
    },
    'promotion-Hydrogen': {
        title: 'Hydrogen Wellness Sessions',
        body: 'Present hydrogen routines as part of a structured wellness offer designed to support consistency, routine planning, and a premium clinic experience.',
        caption:
            'Hydrogen campaigns are strongest when they stay practical.\n\nExplain the session format, the clinic environment, and how your team helps visitors decide whether it fits their routine.',
        hashtags: '#HydrogenWellness #ClinicSupport #RecoveryRoutine #Hylono',
    },
    'education-Hydrogen': {
        title: 'How Hydrogen Routines Are Introduced',
        body: 'Use education-led copy to explain the session workflow, the environment, and the type of client questions your team answers before booking.',
        caption:
            'Educational hydrogen content should reduce uncertainty and preserve trust.\n\nClarify what the session looks like, what it does not claim to do, and how to book a guided conversation.',
        hashtags: '#HydrogenEducation #ClinicWellness #GuidedSupport #Hylono',
    },
    'launch-Hydrogen': {
        title: 'Hydrogen Sessions Now Available',
        body: 'Announce a new hydrogen offering with premium but conservative language focused on setup, onboarding, and the next step for a clinic consultation.',
        caption:
            'Launch content should create momentum without overclaiming.\n\nUse this message to invite a first visit, answer common setup questions, and direct people to your booking page.',
        hashtags: '#HydrogenLaunch #ClinicUpdate #WellnessSupport #Hylono',
    },
    'event-Hydrogen': {
        title: 'Hydrogen Education Event',
        body: 'Invite guests to review how hydrogen sessions are introduced, how the environment works, and what a guided next step looks like at your clinic.',
        caption:
            'An event is the right place to answer practical questions.\n\nExplain the workflow, show the space, and make follow-up booking easy.',
        hashtags: '#HydrogenEvent #ClinicWorkshop #WellnessEducation #Hylono',
    },
    default: {
        title: 'Clinic-Ready Wellness Support',
        body: 'Build a campaign that explains your clinic experience clearly, keeps the wording conservative, and directs visitors toward a guided next step.',
        caption:
            'The strongest partner campaigns combine premium presentation with a clear next action.\n\nUse this asset to explain the offer, preserve trust, and invite a guided consultation.',
        hashtags: '#ClinicWellness #GuidedSupport #Hylono',
    },
};

interface PartnerStore {
    profile: PartnerProfile;
    setProfile: (profile: Partial<PartnerProfile>) => void;
    resetCampaign: () => void;

    currentStep: number;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    campaignGoal: CampaignGoal;
    setCampaignGoal: (goal: CampaignGoal) => void;
    format: CampaignFormat;
    setFormat: (format: CampaignFormat) => void;
    modality: Modality;
    setModality: (modality: Modality) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    voice: CampaignVoice;
    setVoice: (voice: CampaignVoice) => void;
    layoutVariation: LayoutVariation;
    setLayoutVariation: (variation: LayoutVariation) => void;

    selectedTemplateId: string | null;
    customTitle: string;
    setCustomTitle: (text: string) => void;
    customBody: string;
    setCustomBody: (text: string) => void;
    customCaption: string;
    setCustomCaption: (text: string) => void;

    backgroundImage: string | null;
    setBackgroundImage: (url: string | null) => void;
    showQrCode: boolean;
    setShowQrCode: (show: boolean) => void;
    showLogo: boolean;
    setShowLogo: (show: boolean) => void;
    showHeatmap: boolean;
    setShowHeatmap: (show: boolean) => void;
    showVerifiedBadge: boolean;
    setShowVerifiedBadge: (show: boolean) => void;
}

const INITIAL_PROFILE: PartnerProfile = {
    logoUrl: null,
    brandColor: '#0ea5e9',
    secondaryColor: '#0f172a',
    clinicName: '',
    address: '',
    website: '',
    bookingUrl: '',
    phone: '',
    socialInstagram: '',
    socialFacebook: '',
};

const createInitialCampaignState = () => ({
    profile: INITIAL_PROFILE,
    currentStep: 1,
    campaignGoal: 'promotion' as CampaignGoal,
    format: 'social-square' as CampaignFormat,
    modality: 'HBOT' as Modality,
    theme: 'modern' as Theme,
    voice: 'balanced' as CampaignVoice,
    layoutVariation: 0 as LayoutVariation,
    selectedTemplateId: 't2',
    customTitle: '',
    customBody: '',
    customCaption: '',
    backgroundImage: null,
    showQrCode: true,
    showLogo: true,
    showHeatmap: false,
    showVerifiedBadge: true,
});

const PARTNER_STUDIO_STORAGE_KEY = 'hylono-partner-studio-draft';

export const usePartnerStore = create<PartnerStore>()(
    persist(
        (set) => ({
            ...createInitialCampaignState(),
            setProfile: (updates) =>
                set((state) => ({
                    profile: { ...state.profile, ...updates },
                })),
            resetCampaign: () => set(createInitialCampaignState()),

            setStep: (step) => set({ currentStep: Math.min(3, Math.max(1, step)) }),
            nextStep: () =>
                set((state) => ({
                    currentStep: Math.min(3, state.currentStep + 1),
                })),
            prevStep: () =>
                set((state) => ({
                    currentStep: Math.max(1, state.currentStep - 1),
                })),

            setCampaignGoal: (campaignGoal) => set({ campaignGoal }),
            setFormat: (format) => set({ format }),
            setModality: (modality) => set({ modality }),
            setTheme: (theme) => set({ theme }),
            setVoice: (voice) => set({ voice }),
            setLayoutVariation: (layoutVariation) => set({ layoutVariation }),

            setCustomTitle: (customTitle) => set({ customTitle }),
            setCustomBody: (customBody) => set({ customBody }),
            setCustomCaption: (customCaption) => set({ customCaption }),

            setBackgroundImage: (backgroundImage) => set({ backgroundImage }),
            setShowQrCode: (showQrCode) => set({ showQrCode }),
            setShowLogo: (showLogo) => set({ showLogo }),
            setShowHeatmap: (showHeatmap) => set({ showHeatmap }),
            setShowVerifiedBadge: (showVerifiedBadge) => set({ showVerifiedBadge }),
        }),
        {
            name: PARTNER_STUDIO_STORAGE_KEY,
            storage: createJSONStorage(() => sessionStorage),
            version: 1,
            partialize: (state) => ({
                profile: state.profile,
                currentStep: state.currentStep,
                campaignGoal: state.campaignGoal,
                format: state.format,
                modality: state.modality,
                theme: state.theme,
                voice: state.voice,
                layoutVariation: state.layoutVariation,
                selectedTemplateId: state.selectedTemplateId,
                customTitle: state.customTitle,
                customBody: state.customBody,
                customCaption: state.customCaption,
                backgroundImage: state.backgroundImage,
                showQrCode: state.showQrCode,
                showLogo: state.showLogo,
                showHeatmap: state.showHeatmap,
                showVerifiedBadge: state.showVerifiedBadge,
            }),
        }
    )
);
