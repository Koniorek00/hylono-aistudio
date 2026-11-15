import { TechType } from '../../../types';

export const RESULT_TIMELINES: Record<
  TechType,
  Array<{ phase: string; timeframe: string; outcomes: string[] }>
> = {
  [TechType.HBOT]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Ear, sinus, and contraindication questions reviewed',
        'Pressure format matched to product guidance',
        'Support path selected if suitability is unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Recovery, sleep, or vitality guide selected',
        'Session notes kept for tolerance and questions',
        'Rental or contact path used before expanding the setup',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Evidence limits checked before changing the protocol',
        'Unsupported outcome assumptions avoided',
      ],
    },
  ],
  [TechType.PEMF]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Implanted electronic devices reviewed',
        'Pregnancy and seizure-history questions checked',
        'Support path selected if suitability is unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Sleep, comfort, stress, or recovery guide selected',
        'Device instructions used for settings',
        'Session notes kept for tolerance and questions',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Rental or contact path used before expanding the stack',
        'Unsupported outcome assumptions avoided',
      ],
    },
  ],
  [TechType.RLT]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Photosensitivity and medication questions reviewed',
        'Eye protection and device instructions checked',
        'Support path selected if suitability is unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Comfort, recovery, sleep, or vitality guide selected',
        'Distance, timing, and brightness kept within device guidance',
        'Tolerance notes kept for support questions',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Rental or contact path used before expanding the stack',
        'Unsupported outcome assumptions avoided',
      ],
    },
  ],
  [TechType.HYDROGEN]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Format, room use, and upkeep questions reviewed',
        'Inhalation or water model matched to setup needs',
        'Support path selected if expectations are unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Hydrogen guide selected for the intended format',
        'Device instructions used for timing and maintenance',
        'Tolerance notes kept for support questions',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Evidence limits checked before changing the protocol',
        'Unsupported outcome assumptions avoided',
      ],
    },
  ],
  [TechType.EWOT]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Breathing comfort and training context reviewed',
        'Exercise format matched to setup and support guidance',
        'Support path selected if suitability is unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Session intensity kept within device guidance',
        'Training notes kept for tolerance and questions',
        'Recovery and schedule expectations reviewed',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Protocol burden checked before expanding use',
        'Unsupported performance assumptions avoided',
      ],
    },
  ],
  [TechType.SAUNA_BLANKET]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Heat tolerance and contraindication questions reviewed',
        'Hydration and session timing guidance checked',
        'Support path selected if suitability is unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Temperature and timing kept within device guidance',
        'Comfort notes kept for support questions',
        'Routine burden reviewed before increasing frequency',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Policy and support paths checked before expanding use',
        'Unsupported outcome assumptions avoided',
      ],
    },
  ],
  [TechType.EMS]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Implants, skin tolerance, and contraindication questions reviewed',
        'Training context matched to setup guidance',
        'Support path selected if suitability is unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Intensity kept within device guidance',
        'Session notes kept for tolerance and questions',
        'Training load reviewed before changing settings',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Protocol burden checked before expanding use',
        'Unsupported performance assumptions avoided',
      ],
    },
  ],
  [TechType.VNS]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Implanted device and sensitivity questions reviewed',
        'Use context matched to product guidance',
        'Support path selected if suitability is unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Session timing kept within device guidance',
        'Comfort notes kept for support questions',
        'Routine burden reviewed before increasing use',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Evidence limits checked before changing the protocol',
        'Unsupported outcome assumptions avoided',
      ],
    },
  ],
  [TechType.HYPOXIC]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Breathing comfort and altitude tolerance questions reviewed',
        'Training context matched to product guidance',
        'Support path selected if suitability is unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Session intensity kept within device guidance',
        'Tolerance notes kept for support questions',
        'Recovery and schedule expectations reviewed',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Protocol burden checked before expanding use',
        'Unsupported performance assumptions avoided',
      ],
    },
  ],
  [TechType.CRYO]: [
    {
      phase: 'Screening',
      timeframe: 'Before use',
      outcomes: [
        'Cold tolerance and contraindication questions reviewed',
        'Session format matched to product guidance',
        'Support path selected if suitability is unclear',
      ],
    },
    {
      phase: 'Placement',
      timeframe: 'First routine',
      outcomes: [
        'Exposure timing kept within device guidance',
        'Comfort notes kept for support questions',
        'Recovery and schedule expectations reviewed',
      ],
    },
    {
      phase: 'Review',
      timeframe: 'Month 2+',
      outcomes: [
        'Routine fit reviewed against the original goal',
        'Policy and support paths checked before expanding use',
        'Unsupported outcome assumptions avoided',
      ],
    },
  ],
};
