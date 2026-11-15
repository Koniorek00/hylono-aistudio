export const NEXUS_FLEET_SAMPLE_DEVICE_IDS = ['d1', 'd2', 'd3'] as const;

export type NexusFleetSampleDeviceId = (typeof NEXUS_FLEET_SAMPLE_DEVICE_IDS)[number];

const NEXUS_FLEET_SAMPLE_DEVICE_ID_SET = new Set<string>(
  NEXUS_FLEET_SAMPLE_DEVICE_IDS
);

export const isKnownNexusFleetDeviceId = (
  deviceId?: string | null
): deviceId is NexusFleetSampleDeviceId =>
  typeof deviceId === 'string' && NEXUS_FLEET_SAMPLE_DEVICE_ID_SET.has(deviceId);
