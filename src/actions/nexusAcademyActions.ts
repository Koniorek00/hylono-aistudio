'use server';

import { auth } from '@/lib/auth';
import {
  isNexusAcademyAssignmentActionResult,
  parseNexusAcademyAssignmentFormData,
  resolveNexusAcademyServerActionRequest,
  type NexusAcademyAssignmentActionResult,
} from '@/src/actions/nexusAcademyActionCore';
import { persistNexusAcademyAssignment } from '@/src/actions/nexusAcademyPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

const buildPersistenceErrorResult = (
  result: NexusAcademyAssignmentActionResult,
  message: string
): NexusAcademyAssignmentActionResult => ({
  ...result,
  success: false,
  status: 'persistence_error',
  message,
  persisted: false,
});

const buildPersistenceScopeBlockedResult = (
  result: NexusAcademyAssignmentActionResult,
  message: string
): NexusAcademyAssignmentActionResult => ({
  ...result,
  success: false,
  status: 'role_not_allowed',
  message,
  persisted: false,
  persistenceMode: 'blocked',
});

export const createNexusAcademyAssignmentAction = async (
  _prevState: NexusAcademyAssignmentActionResult,
  formData: FormData
): Promise<NexusAcademyAssignmentActionResult> => {
  const input = parseNexusAcademyAssignmentFormData(formData);

  if (isNexusAcademyAssignmentActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusAcademyServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusAcademyAssignment(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Academy assignment passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Academy assignment was saved to authenticated private storage.',
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
      'Academy assignment was rejected by authenticated workspace scope.'
    );
  }

  return buildPersistenceErrorResult(
    result,
    'Academy assignment passed authorization but could not be saved.'
  );
};
