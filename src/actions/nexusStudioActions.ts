'use server';

import { auth } from '@/lib/auth';
import {
  isNexusStudioCampaignHandoffActionResult,
  parseNexusStudioCampaignHandoffFormData,
  resolveNexusStudioServerActionRequest,
  type NexusStudioCampaignHandoffActionResult,
} from '@/src/actions/nexusStudioActionCore';
import { persistNexusStudioCampaignHandoff } from '@/src/actions/nexusStudioPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

const buildPersistenceErrorResult = (
  result: NexusStudioCampaignHandoffActionResult,
  message: string
): NexusStudioCampaignHandoffActionResult => ({
  ...result,
  success: false,
  status: 'persistence_error',
  message,
  persisted: false,
});

const buildPersistenceScopeBlockedResult = (
  result: NexusStudioCampaignHandoffActionResult,
  message: string
): NexusStudioCampaignHandoffActionResult => ({
  ...result,
  success: false,
  status: 'role_not_allowed',
  message,
  persisted: false,
  persistenceMode: 'blocked',
});

export const createNexusStudioCampaignHandoffAction = async (
  _prevState: NexusStudioCampaignHandoffActionResult,
  formData: FormData
): Promise<NexusStudioCampaignHandoffActionResult> => {
  const input = parseNexusStudioCampaignHandoffFormData(formData);

  if (isNexusStudioCampaignHandoffActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusStudioServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusStudioCampaignHandoff(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Studio campaign handoff passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Studio campaign handoff was saved to authenticated private storage.',
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
      'Studio campaign handoff was rejected by authenticated workspace scope.'
    );
  }

  return buildPersistenceErrorResult(
    result,
    'Studio campaign handoff passed authorization but could not be saved.'
  );
};
