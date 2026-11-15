'use server';

import { auth } from '@/lib/auth';
import {
  isNexusServiceServerActionResult,
  parseNexusServiceManualExtractionQueueFormData,
  parseNexusServiceManualExtractionReviewFormData,
  parseNexusServiceManualLinkFormData,
  parseNexusServiceNoteFormData,
  parseNexusServiceOwnerDeviceScopeFormData,
  parseNexusServiceOwnerReportFormData,
  parseNexusServiceOwnerReportStatusFormData,
  parseNexusServicePartsDraftFormData,
  parseNexusServicePartsOrderFormData,
  parseNexusServiceTodoFormData,
  resolveNexusServiceServerActionRequest,
  type NexusServiceServerActionResult,
} from '@/src/actions/nexusServiceActionCore';
import {
  persistNexusServiceManualExtractionQueue,
  persistNexusServiceManualExtractionReview,
  persistNexusServiceManualDocumentLink,
  persistNexusServiceNote,
  persistNexusServiceOwnerDeviceScopeAssignment,
  persistNexusServiceOwnerReport,
  persistNexusServiceOwnerReportStatusTransition,
  persistNexusServicePartsDraft,
  persistNexusServiceTodo,
} from '@/src/actions/nexusServicePersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';

const buildPersistenceErrorResult = (
  result: NexusServiceServerActionResult,
  message: string
): NexusServiceServerActionResult => ({
  ...result,
  success: false,
  status: 'persistence_error',
  message,
  persisted: false,
});

export const createNexusServiceNoteAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServiceNoteFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusServiceServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusServiceNote(session, profile, input).catch(
    () => null
  );

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Shared Nexus service note passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Shared Nexus service note was saved to authenticated private storage.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  if (persistence.reason === 'service_profile_required') {
    return {
      ...result,
      success: false,
      status: 'service_profile_required',
      message:
        'A verified technician person scope is required before saving service notes.',
      persisted: false,
      persistenceMode: 'blocked',
    };
  }

  return buildPersistenceErrorResult(
    result,
    'Shared Nexus service note passed authorization but could not be saved.'
  );
};

export const assignNexusServiceTodoAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServiceTodoFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusServiceServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusServiceTodo(session, profile, input).catch(
    () => null
  );

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Nexus service todo passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Nexus service todo was saved to authenticated private storage.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  return buildPersistenceErrorResult(
    result,
    'Nexus service todo passed authorization but could not be saved.'
  );
};

export const assignNexusServiceOwnerDeviceScopeAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServiceOwnerDeviceScopeFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusServiceServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusServiceOwnerDeviceScopeAssignment(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Owner device access scope passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Owner device access scope was saved to the active owner profile.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  if (persistence.reason === 'scope_not_allowed') {
    return {
      ...result,
      success: false,
      status: 'role_not_allowed',
      message:
        'Only active owner profiles in your organization can receive owner device scope.',
      persisted: false,
      persistenceMode: 'blocked',
    };
  }

  return buildPersistenceErrorResult(
    result,
    'Owner device access scope passed authorization but could not be saved.'
  );
};

export const createNexusServicePartsDraftAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServicePartsDraftFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusServiceServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusServicePartsDraft(session, profile, input).catch(
    () => null
  );

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Replacement-part draft passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Replacement-part draft was saved to authenticated private review storage.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  if (persistence.reason === 'service_profile_required') {
    return {
      ...result,
      success: false,
      status: 'service_profile_required',
      message:
        'A verified technician person scope is required before staging replacement parts.',
      persisted: false,
      persistenceMode: 'blocked',
    };
  }

  return buildPersistenceErrorResult(
    result,
    'Replacement-part draft passed authorization but could not be saved.'
  );
};

export const linkNexusServiceManualDocumentAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServiceManualLinkFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusServiceServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusServiceManualDocumentLink(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Manual document link passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Manual document link was saved to authenticated private storage.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  return buildPersistenceErrorResult(
    result,
    'Manual document link passed authorization but could not be saved.'
  );
};

export const queueNexusServiceManualExtractionAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServiceManualExtractionQueueFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusServiceServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusServiceManualExtractionQueue(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Manual extraction queue request passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Manual extraction request was saved to authenticated review storage.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  if (persistence.reason === 'service_profile_required') {
    return {
      ...result,
      success: false,
      status: 'service_profile_required',
      message:
        'A verified technician person scope is required before queueing manual extraction.',
      persisted: false,
      persistenceMode: 'blocked',
    };
  }

  if (persistence.reason === 'scope_not_allowed') {
    return {
      ...result,
      success: false,
      status: 'role_not_allowed',
      message:
        'Only owner-safe manuals that still need extraction can be queued for review.',
      persisted: false,
      persistenceMode: 'blocked',
    };
  }

  return buildPersistenceErrorResult(
    result,
    'Manual extraction queue request passed authorization but could not be saved.'
  );
};

export const reviewNexusServiceManualExtractionAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServiceManualExtractionReviewFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusServiceServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusServiceManualExtractionReview(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Manual extraction review passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Manual extraction review status was saved to authenticated private storage.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  if (persistence.reason === 'scope_not_allowed') {
    return {
      ...result,
      success: false,
      status: 'role_not_allowed',
      message:
        'Only queued owner-safe manual extraction rows can be promoted by managers.',
      persisted: false,
      persistenceMode: 'blocked',
    };
  }

  return buildPersistenceErrorResult(
    result,
    'Manual extraction review passed authorization but could not be saved.'
  );
};

export const publishNexusServiceOwnerReportAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServiceOwnerReportFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusServiceServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusServiceOwnerReport(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Owner-safe service report passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Owner-safe service report was saved to authenticated private storage.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  return buildPersistenceErrorResult(
    result,
    'Owner-safe service report passed authorization but could not be saved.'
  );
};

export const publishNexusServiceOwnerReportStatusAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServiceOwnerReportStatusFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const result = resolveNexusServiceServerActionRequest(session, profile, input);

  if (!result.success) {
    return result;
  }

  const persistence = await persistNexusServiceOwnerReportStatusTransition(
    session,
    profile,
    input
  ).catch(() => null);

  if (!persistence) {
    return buildPersistenceErrorResult(
      result,
      'Owner-safe service report status passed authorization but could not be saved.'
    );
  }

  if (persistence.persisted) {
    return {
      ...result,
      message: 'Owner-safe service report was published for assigned owner devices.',
      persisted: true,
      persistedRecordId: persistence.recordId,
    };
  }

  if (persistence.reason === 'database_not_configured') {
    return result;
  }

  if (persistence.reason === 'scope_not_allowed') {
    return {
      ...result,
      success: false,
      status: 'role_not_allowed',
      message: 'Only owner-ready reports in your organization can be released.',
      persisted: false,
      persistenceMode: 'blocked',
    };
  }

  return buildPersistenceErrorResult(
    result,
    'Owner-safe service report status passed authorization but could not be saved.'
  );
};

export const submitNexusServicePartsOrderAction = async (
  _prevState: NexusServiceServerActionResult,
  formData: FormData
): Promise<NexusServiceServerActionResult> => {
  const input = parseNexusServicePartsOrderFormData(formData);

  if (isNexusServiceServerActionResult(input)) {
    return input;
  }

  const session = await auth();
  return resolveNexusServiceServerActionRequest(
    session,
    await getNexusServiceSessionProfile(session),
    input
  );
};
