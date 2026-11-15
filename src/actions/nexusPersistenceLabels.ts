export const NEXUS_PERSISTED_DATE_UNAVAILABLE_LABEL = 'Date unavailable';

export const formatNexusPersistedDateLabel = (
  createdAt: Date | string | null | undefined
): string => {
  if (!createdAt) {
    return NEXUS_PERSISTED_DATE_UNAVAILABLE_LABEL;
  }

  const parsed = createdAt instanceof Date ? createdAt : new Date(createdAt);

  if (Number.isNaN(parsed.getTime())) {
    return NEXUS_PERSISTED_DATE_UNAVAILABLE_LABEL;
  }

  return parsed.toISOString().slice(0, 10);
};
