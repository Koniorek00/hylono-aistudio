'use server';

import { auth } from '@/lib/auth';
import {
  isNexusSuppliesRequisitionActionResult,
  parseNexusSuppliesRequisitionFormData,
  resolveNexusSuppliesServerActionRequest,
  type NexusSuppliesRequisitionActionResult,
} from '@/src/actions/nexusSuppliesActionCore';
import { persistNexusSuppliesRequisition } from '@/src/actions/nexusSuppliesPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

const buildPersistenceErrorResult = (
  result: NexusSuppliesRequisitionActionResult,
  message: string
): NexusSuppliesRequisitionActionResult => ({
  ...result,
  success: false,
  status: 'persistence_error',
  message,
  persisted: false,
});

const buildPersistenceScopeBlockedResult = (
  result: NexusSuppliesRequisitionActionResult,
  message: string
): NexusSuppliesRequisitionActionResult => ({
  ...result,
  success: false,
  status: 'role_not_allowed',
  message,
  persisted: false,
  persistenceMode: 'blocked',
});

export const createNexusSuppliesRequisitionAction = async (
  _prevState: NexusSuppliesRequisitionActionResult,
  formData: FormData
): Promise<NexusSuppliesRequisitionActionResult> => {
  const input = parseNexusSuppliesRequisitionFormData(formData);

  if (isNexusSuppliesRequisitionActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusSuppliesServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusSuppliesRequisition(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Supply requisition passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Supply requisition was saved to authenticated private storage.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  if (
    persistence.reason === 'role_not_allowed' ||
    persistence.reason === 'scope_not_allowed'
  ) {
    return buildPersistenceScopeBlockedResult(
      result,
      'Supply requisition was rejected by authenticated workspace scope.'
    );
  }

  return buildPersistenceErrorResult(
    result,
    'Supply requisition passed authorization but could not be saved.'
  );
};
