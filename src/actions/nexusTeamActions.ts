'use server';

import { auth } from '@/lib/auth';
import {
  isNexusTeamHandoffActionResult,
  parseNexusTeamHandoffFormData,
  resolveNexusTeamServerActionRequest,
  type NexusTeamHandoffActionResult,
} from '@/src/actions/nexusTeamActionCore';
import { persistNexusTeamHandoff } from '@/src/actions/nexusTeamPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

const buildPersistenceErrorResult = (
  result: NexusTeamHandoffActionResult,
  message: string
): NexusTeamHandoffActionResult => ({
  ...result,
  success: false,
  status: 'persistence_error',
  message,
  persisted: false,
});

const buildPersistenceScopeBlockedResult = (
  result: NexusTeamHandoffActionResult,
  message: string
): NexusTeamHandoffActionResult => ({
  ...result,
  success: false,
  status: 'role_not_allowed',
  message,
  persisted: false,
  persistenceMode: 'blocked',
});

export const createNexusTeamHandoffAction = async (
  _prevState: NexusTeamHandoffActionResult,
  formData: FormData
): Promise<NexusTeamHandoffActionResult> => {
  const input = parseNexusTeamHandoffFormData(formData);

  if (isNexusTeamHandoffActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusTeamServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusTeamHandoff(session, profile, input).catch(
    () => null
  );

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Team handoff passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Team handoff was saved to authenticated private storage.',
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
      'Team handoff was rejected by authenticated workspace scope.'
    );
  }

  return buildPersistenceErrorResult(
    result,
    'Team handoff passed authorization but could not be saved.'
  );
};
