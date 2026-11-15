export type NexusRouteSearchParamValue = string | string[] | undefined;

export type NexusRouteSearchParams<TParamName extends string> = Promise<
  Partial<Record<TParamName, NexusRouteSearchParamValue>>
>;

export const getFirstNexusRouteParam = (
  value: NexusRouteSearchParamValue
): string | undefined => {
  const firstValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = firstValue?.trim();

  return normalizedValue ? normalizedValue : undefined;
};
