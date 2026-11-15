'use server';

import { auth } from '@/lib/auth';
import {
  isNexusClientsIntakeDraftActionResult,
  parseNexusClientsIntakeDraftFormData,
  resolveNexusClientsServerActionRequest,
  type NexusClientsIntakeDraftActionResult,
} from '@/src/actions/nexusClientsActionCore';
import { persistNexusClientsIntakeDraft } from '@/src/actions/nexusClientsPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

const buildPersistenceErrorResult = (
  result: NexusClientsIntakeDraftActionResult,
  message: string
): NexusClientsIntakeDraftActionResult => ({
  ...result,
  success: false,
  status: 'persistence_error',
  message,
  persisted: false,
});

const buildPersistenceScopeBlockedResult = (
  result: NexusClientsIntakeDraftActionResult,
  message: string
): NexusClientsIntakeDraftActionResult => ({
  ...result,
  success: false,
  status: 'role_not_allowed',
  message,
  persisted: false,
  persistenceMode: 'blocked',
});

export const createNexusClientsIntakeDraftAction = async (
  _prevState: NexusClientsIntakeDraftActionResult,
  formData: FormData
): Promise<NexusClientsIntakeDraftActionResult> => {
  const input = parseNexusClientsIntakeDraftFormData(formData);

  if (isNexusClientsIntakeDraftActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusClientsServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusClientsIntakeDraft(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Client intake draft passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Client intake draft was saved to authenticated private storage.',
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
      'Client intake draft was rejected by authenticated workspace scope.'
    );
  }

  return buildPersistenceErrorResult(
    result,
    'Client intake draft passed authorization but could not be saved.'
  );
};
