import type { NexusSuppliesRequisitionStatus } from './nexus-supplies-persistence-contract';

export const NEXUS_SUPPLIES_SAMPLE_REQUISITION_ITEM_IDS = [
  'mask-liners',
  'surface-kit',
  'quick-connect',
  'client-wraps',
  'seal-gasket',
  'filter-cartridge',
] as const;

export const NEXUS_SUPPLIES_SAMPLE_APPROVAL_ONLY_ITEM_IDS = [
  'quick-connect',
  'client-wraps',
  'seal-gasket',
  'filter-cartridge',
] as const;

export const NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_LINE_COUNT =
  NEXUS_SUPPLIES_SAMPLE_REQUISITION_ITEM_IDS.length;

export const NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_APPROVAL_ONLY_LINES =
  NEXUS_SUPPLIES_SAMPLE_APPROVAL_ONLY_ITEM_IDS.length;

export interface NexusSuppliesRequisitionAggregateInput {
  lineCount: number;
  totalPacks: number;
  approvalOnlyLines: number;
  nextStatus?: NexusSuppliesRequisitionStatus | string | null;
}

export type NexusSuppliesRequisitionAggregateViolationField =
  | 'lineCount'
  | 'totalPacks'
  | 'approvalOnlyLines'
  | 'nextStatus';

export interface NexusSuppliesRequisitionAggregateViolation {
  field: NexusSuppliesRequisitionAggregateViolationField;
  message: string;
}

export const resolveNexusSuppliesRequisitionAggregateViolation = (
  input: NexusSuppliesRequisitionAggregateInput
): NexusSuppliesRequisitionAggregateViolation | null => {
  if (!Number.isInteger(input.lineCount) || input.lineCount < 0) {
    return {
      field: 'lineCount',
      message: 'Line count must be a non-negative whole number.',
    };
  }

  if (!Number.isInteger(input.approvalOnlyLines) || input.approvalOnlyLines < 0) {
    return {
      field: 'approvalOnlyLines',
      message: 'Approval-only line count must be a non-negative whole number.',
    };
  }

  if (!Number.isInteger(input.totalPacks) || input.totalPacks < 0) {
    return {
      field: 'totalPacks',
      message: 'Total packs must be a non-negative whole number.',
    };
  }

  if (input.lineCount > NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_LINE_COUNT) {
    return {
      field: 'lineCount',
      message: `Line count cannot exceed ${NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_LINE_COUNT} public preview inventory rows.`,
    };
  }

  if (
    input.approvalOnlyLines >
    NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_APPROVAL_ONLY_LINES
  ) {
    return {
      field: 'approvalOnlyLines',
      message: `Approval-only lines cannot exceed ${NEXUS_SUPPLIES_SAMPLE_REQUISITION_MAX_APPROVAL_ONLY_LINES} public preview review rows.`,
    };
  }

  if (input.totalPacks < input.lineCount) {
    return {
      field: 'totalPacks',
      message: 'Total packs cannot be lower than the staged requisition line count.',
    };
  }

  if (input.approvalOnlyLines > 0 && input.nextStatus !== 'Needs review') {
    return {
      field: 'nextStatus',
      message: 'Approval-only requisitions must stay in review.',
    };
  }

  return null;
};

export const isPlausibleNexusSuppliesRequisitionAggregate = (
  input: NexusSuppliesRequisitionAggregateInput
): boolean => resolveNexusSuppliesRequisitionAggregateViolation(input) === null;
