import { connection } from 'next/server';
import { createNexusPageMetadata } from '@/app/nexus/_lib/nexusPageMetadata';
import { ServiceOperations } from '@/components/partner/ServiceOperations';
import { auth } from '@/lib/auth';
import {
  assignNexusServiceOwnerDeviceScopeAction,
  assignNexusServiceTodoAction,
  createNexusServiceNoteAction,
  createNexusServicePartsDraftAction,
  linkNexusServiceManualDocumentAction,
  publishNexusServiceOwnerReportAction,
  publishNexusServiceOwnerReportStatusAction,
  queueNexusServiceManualExtractionAction,
  reviewNexusServiceManualExtractionAction,
  submitNexusServicePartsOrderAction,
} from '@/src/actions/nexusServiceActions';
import {
  listNexusServiceManualExtractionQueueForSession,
  listNexusServiceManualDocumentLinksForSession,
  listNexusServiceNotesForSession,
  listNexusServiceOwnerReportsForSession,
  listNexusServicePartsDraftsForSession,
  listNexusServiceTodosForSession,
} from '@/src/actions/nexusServicePersistence';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';
import { listNexusServiceOwnerDeviceScopesForSession } from '@/src/actions/nexusServiceProfile';

// [DECISION: nexus service stays server-routed as a noindex operator preview while private service records, owner notes, and part requests remain authenticated-only in production.]
// Rendering strategy: request-time server route with an interactive client leaf for sample service workflows and no indexable public claims.

export const metadata = createNexusPageMetadata('service');

export default async function NexusServicePageRoute() {
  await connection();
  const session = await auth();
  const profile = await getNexusServiceSessionProfile(session);
  const persistedNotes = await listNexusServiceNotesForSession(session, profile);
  const persistedTodos = await listNexusServiceTodosForSession(session, profile);
  const persistedPartsDrafts = await listNexusServicePartsDraftsForSession(session, profile);
  const persistedManualLinks = await listNexusServiceManualDocumentLinksForSession(
    session,
    profile
  );
  const persistedManualExtractionQueue =
    await listNexusServiceManualExtractionQueueForSession(session, profile);
  const persistedOwnerReports = await listNexusServiceOwnerReportsForSession(
    session,
    profile
  );
  const ownerDeviceScopes = await listNexusServiceOwnerDeviceScopesForSession(
    session,
    profile
  );

  return (
    <ServiceOperations
      assignOwnerDeviceScopeAction={assignNexusServiceOwnerDeviceScopeAction}
      assignTodoAction={assignNexusServiceTodoAction}
      createNoteAction={createNexusServiceNoteAction}
      createPartsDraftAction={createNexusServicePartsDraftAction}
      currentServiceRole={profile?.role ?? null}
      queueManualExtractionAction={queueNexusServiceManualExtractionAction}
      initialPersistedManualExtractionQueue={
        persistedManualExtractionQueue.extractionQueue
      }
      initialPersistedManualLinks={persistedManualLinks.manualLinks}
      initialPersistedNotes={persistedNotes.notes}
      initialPersistedOwnerReports={persistedOwnerReports.ownerReports}
      initialPersistedPartsDrafts={persistedPartsDrafts.partsDrafts}
      initialPersistedTodos={persistedTodos.todos}
      initialOwnerDeviceScopes={ownerDeviceScopes.ownerDeviceScopes}
      linkManualAction={linkNexusServiceManualDocumentAction}
      ownerDeviceScopeStatus={ownerDeviceScopes.status}
      persistedManualExtractionQueueStatus={persistedManualExtractionQueue.status}
      persistedManualLinksStatus={persistedManualLinks.status}
      persistedNotesStatus={persistedNotes.status}
      persistedOwnerReportsStatus={persistedOwnerReports.status}
      persistedPartsDraftsStatus={persistedPartsDrafts.status}
      persistedTodosStatus={persistedTodos.status}
      publishOwnerReportAction={publishNexusServiceOwnerReportAction}
      publishOwnerReportStatusAction={publishNexusServiceOwnerReportStatusAction}
      reviewManualExtractionAction={reviewNexusServiceManualExtractionAction}
      submitPartsOrderAction={submitNexusServicePartsOrderAction}
    />
  );
}
