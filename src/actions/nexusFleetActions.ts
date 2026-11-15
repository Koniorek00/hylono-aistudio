'use server';

import { auth } from '@/lib/auth';
import {
  isNexusFleetServiceLogActionResult,
  parseNexusFleetServiceLogFormData,
  resolveNexusFleetServerActionRequest,
  type NexusFleetServiceLogActionResult,
} from '@/src/actions/nexusFleetActionCore';
import { persistNexusFleetServiceLog } from '@/src/actions/nexusFleetPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

const buildPersistenceErrorResult = (
  result: NexusFleetServiceLogActionResult,
  message: string
): NexusFleetServiceLogActionResult => ({
  ...result,
  success: false,
  status: 'persistence_error',
  message,
  persisted: false,
});

const buildPersistenceScopeBlockedResult = (
  result: NexusFleetServiceLogActionResult,
  message: string
): NexusFleetServiceLogActionResult => ({
  ...result,
  success: false,
  status: 'role_not_allowed',
  message,
  persisted: false,
  persistenceMode: 'blocked',
});

export const createNexusFleetServiceLogAction = async (
  _prevState: NexusFleetServiceLogActionResult,
  formData: FormData
): Promise<NexusFleetServiceLogActionResult> => {
  const input = parseNexusFleetServiceLogFormData(formData);

  if (isNexusFleetServiceLogActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusFleetServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusFleetServiceLog(session, profile, input).catch(
    () => null
  );

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Fleet service log passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Fleet service log was saved to authenticated private storage.',
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
      'Fleet service log was rejected by authenticated workspace scope.'
    );
  }

  return buildPersistenceErrorResult(
    result,
    'Fleet service log passed authorization but could not be saved.'
  );
};
