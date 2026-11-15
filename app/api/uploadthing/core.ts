import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { auth } from '@/lib/auth';
import { env } from '@/lib/env';

const f = createUploadthing();
const UPLOAD_SERVICE_UNAVAILABLE_MESSAGE = 'Upload service is temporarily unavailable.';

export const uploadRouter = {
  clinicDocumentUploader: f({
    image: { maxFileSize: '8MB', maxFileCount: 3 },
    pdf: { maxFileSize: '16MB', maxFileCount: 2 },
  })
    .middleware(async () => {
      if (!env.UPLOADTHING_SECRET) {
        throw new UploadThingError(UPLOAD_SERVICE_UNAVAILABLE_MESSAGE);
      }

      const session = await auth();
      const userEmail = session?.user?.email?.trim().toLowerCase();

      if (!userEmail) {
        throw new UploadThingError('Authentication required.');
      }

      return {
        source: 'hylono-main',
        userEmail,
      };
    })
    .onUploadComplete(({ metadata, file }) => {
      return {
        source: metadata.source,
        userEmail: metadata.userEmail,
        fileKey: file.key,
        fileUrl: file.ufsUrl,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
