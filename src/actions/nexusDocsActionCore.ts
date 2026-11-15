import { z } from 'zod';
import {
  NEXUS_DOCS_TEMPLATE_CATEGORIES,
  NEXUS_DOCS_TEMPLATE_IDS,
  type NexusDocsActionInput,
  type NexusDocsAuditPayload,
  type NexusDocsTemplateCategory,
  type NexusDocsTemplateId,
  resolveNexusDocsActionDecision,
} from '@/content/nexus-docs-persistence-contract';
import type { NexusServicePersistenceMode } from '@/content/nexus-service-persistence-contract';
import {
  NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE,
  resolveNexusServiceAuthContextForSession,
  type NexusServiceSessionLike,
  type NexusServiceSessionProfile,
} from '@/src/actions/nexusServiceActionCore';

export type NexusDocsServerActionStatus =
  | 'validation_error'
  | 'auth_required'
  | 'service_profile_required'
  | 'role_not_allowed'
  | 'persistence_error'
  | 'private_write_ready';

export interface NexusDocsDocumentPacketActionResult {
  success: boolean;
  status: NexusDocsServerActionStatus;
  message: string;
  persisted: boolean;
  persistedRecordId?: string;
  futureTable: string | null;
  persistenceMode: NexusServicePersistenceMode;
  auditPayload?: NexusDocsAuditPayload;
  fieldErrors?: Record<string, string[]>;
}

export interface NexusDocsPersistedDocumentPacket {
  id: string;
  templateId: NexusDocsTemplateId;
  category: NexusDocsTemplateCategory;
  required: boolean;
  clientNamePresent: boolean;
  clinicNamePresent: boolean;
  createdAtLabel: string;
  source: 'authenticated';
}

const booleanFlagSchema = z.enum(['true', 'false']).transform((value) => value === 'true');

const docsDocumentPacketInputSchema = z.object({
  actionId: z.literal('docs.packet.prepare'),
  templateId: z.enum(NEXUS_DOCS_TEMPLATE_IDS),
  category: z.enum(NEXUS_DOCS_TEMPLATE_CATEGORIES),
  required: booleanFlagSchema,
  clientNamePresent: booleanFlagSchema,
  clinicNamePresent: booleanFlagSchema,
});

const getFormString = (formData: FormData, key: string): string | undefined => {
  const value = formData.get(key);
  return typeof value === 'string' ? value : undefined;
};

const formatValidationErrors = (
  error: z.ZodError
): Record<string, string[]> =>
  z.flattenError(error).fieldErrors as Record<string, string[]>;

const buildValidationErrorResult = (
  error: z.ZodError
): NexusDocsDocumentPacketActionResult => ({
  success: false,
  status: 'validation_error',
  message: 'Document packet input could not be accepted.',
  persisted: false,
  futureTable: null,
  persistenceMode: 'blocked',
  fieldErrors: formatValidationErrors(error),
});

export const parseNexusDocsDocumentPacketFormData = (
  formData: FormData
): NexusDocsActionInput | NexusDocsDocumentPacketActionResult => {
  const parsed = docsDocumentPacketInputSchema.safeParse({
    actionId: 'docs.packet.prepare',
    templateId: getFormString(formData, 'templateId'),
    category: getFormString(formData, 'category'),
    required: getFormString(formData, 'required'),
    clientNamePresent: getFormString(formData, 'clientNamePresent'),
    clinicNamePresent: getFormString(formData, 'clinicNamePresent'),
  });

  return parsed.success ? parsed.data : buildValidationErrorResult(parsed.error);
};

export const resolveNexusDocsServerActionRequest = (
  session: NexusServiceSessionLike | null,
  profile: NexusServiceSessionProfile | null,
  input: NexusDocsActionInput
): NexusDocsDocumentPacketActionResult => {
  const hasAuthenticatedIdentity = Boolean(session?.user?.email?.trim());

  if (!hasAuthenticatedIdentity) {
    const decision = resolveNexusDocsActionDecision(null, input);
    return {
      success: false,
      status: 'auth_required',
      message: 'Sign in before preparing Nexus document packets.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const authContext = resolveNexusServiceAuthContextForSession(session, profile);

  if (!authContext) {
    const decision = resolveNexusDocsActionDecision(null, input);
    return {
      success: false,
      status: 'service_profile_required',
      message: 'A verified Nexus service profile is required before document packets can be saved.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  const decision = resolveNexusDocsActionDecision(authContext, input);

  if (!decision.allowed) {
    return {
      success: false,
      status: 'role_not_allowed',
      message: 'Your Nexus service role cannot prepare document packets.',
      persisted: false,
      futureTable: decision.futureTable,
      persistenceMode: 'blocked',
      auditPayload: decision.auditPayload,
    };
  }

  return {
    success: true,
    status: 'private_write_ready',
    message: `Document packet passed the authenticated persistence boundary. ${NEXUS_PRIVATE_STORAGE_PREVIEW_MESSAGE}`,
    persisted: false,
    futureTable: decision.futureTable,
    persistenceMode: decision.persistenceMode,
    auditPayload: decision.auditPayload,
  };
};

export const isNexusDocsDocumentPacketActionResult = (
  value: NexusDocsActionInput | NexusDocsDocumentPacketActionResult
): value is NexusDocsDocumentPacketActionResult =>
  'success' in value &&
  typeof value.success === 'boolean' &&
  'message' in value &&
  'persisted' in value &&
  'persistenceMode' in value;
