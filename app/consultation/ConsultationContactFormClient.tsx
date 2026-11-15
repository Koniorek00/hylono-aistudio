'use client';

import { ContactPage } from '@/components/ContactPage';
import type { ContactPrefill } from '@/lib/contact-prefill';

const consultationPrefill: ContactPrefill = {
  intent: 'curious',
  subject: 'Consultation planning request',
  message:
    'I came from the Hylono consultation page and would like help choosing the right access path.',
};

export function ConsultationContactFormClient() {
  return (
    <ContactPage
      prefill={consultationPrefill}
      formAnalytics={{
        source: 'consultation_route',
        startEventName: 'consultation_form_start',
        submitEventName: 'consultation_form_submit',
      }}
    />
  );
}
