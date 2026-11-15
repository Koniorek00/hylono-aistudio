'use server';

import { auth } from '@/lib/auth';
import {
  isNexusDocsDocumentPacketActionResult,
  parseNexusDocsDocumentPacketFormData,
  resolveNexusDocsServerActionRequest,
  type NexusDocsDocumentPacketActionResult,
} from '@/src/actions/nexusDocsActionCore';
import { persistNexusDocsDocumentPacket } from '@/src/actions/nexusDocsPersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

const buildPersistenceErrorResult = (
  result: NexusDocsDocumentPacketActionResult,
  message: string
): NexusDocsDocumentPacketActionResult => ({
  ...result,
  success: false,
  status: 'persistence_error',
  message,
  persisted: false,
});

const buildPersistenceScopeBlockedResult = (
  result: NexusDocsDocumentPacketActionResult,
  message: string
): NexusDocsDocumentPacketActionResult => ({
  ...result,
  success: false,
  status: 'role_not_allowed',
  message,
  persisted: false,
  persistenceMode: 'blocked',
});

export const createNexusDocsDocumentPacketAction = async (
  _prevState: NexusDocsDocumentPacketActionResult,
  formData: FormData
): Promise<NexusDocsDocumentPacketActionResult> => {
  const input = parseNexusDocsDocumentPacketFormData(formData);

  if (isNexusDocsDocumentPacketActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusDocsServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusDocsDocumentPacket(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Document packet passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Document packet was saved to authenticated private storage.',
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
      'Document packet was rejected by authenticated workspace scope.'
    );
  }

  return buildPersistenceErrorResult(
    result,
    'Document packet passed authorization but could not be saved.'
  );
};
