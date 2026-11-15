import Link from 'next/link';
import React, { useActionState, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { getCSRFToken, validateCSRFToken } from '../utils/csrf';
import {
  CALLBACK_REQUEST_PREFIX,
  createCallbackRequestNote,
  upsertCallbackRequestNote,
} from '@/lib/callback-request';
import { siteEntity } from '@/content/site-entity';
import type { ContactIntentChoice, ContactPrefill } from '@/lib/contact-prefill';
import analytics from '@/src/lib/analytics';
import { submitContactFormAction, type FormActionResult } from '../src/actions/formActions';
import { HoneypotField } from './shared/HoneypotField';
import { TurnstileWidget } from './shared/TurnstileWidget';

type ContactIntent = ContactIntentChoice | null;

const CONTACT_INTENTS: Array<{
  id: Exclude<ContactIntent, null>;
  label: string;
  description: string;
  subject: string;
}> = [
  {
    id: 'curious',
    label: 'Product guidance',
    description: 'Compare systems, protocols, and fit for your goals.',
    subject: 'Product guidance request',
  },
  {
    id: 'rental',
    label: 'Rental planning',
    description: 'Ask about monthly plans, delivery scope, and technical onboarding.',
    subject: 'Rental planning request',
  },
  {
    id: 'owner',
    label: 'Existing device support',
    description: 'Operational questions or after-purchase support.',
    subject: 'Device support request',
  },
  {
    id: 'clinic',
    label: 'Clinic / B2B',
    description: 'Commercial use, rollout planning, and quotes.',
    subject: 'Clinic / B2B inquiry',
  },
];

const MESSAGE_PLACEHOLDERS: Record<Exclude<ContactIntent, null>, string> = {
  curious:
    'Tell us what you are comparing, what goal you are working toward, or which system feels unclear.',
  rental:
    'Tell us which technology you are considering, the space you have available, and whether you want monthly pricing or a consultation.',
  owner: 'Tell us which device you own, what is happening, and what kind of help you need.',
  clinic: 'Tell us about your facility, use case, and what you need to evaluate next.',
};

const INTENT_ICONS: Record<Exclude<ContactIntent, null>, React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>> = {
  curious: Compass,
  rental: Calendar,
  owner: ShieldCheck,
  clinic: Building2,
};

const TOPIC_OPTIONS = [
  { value: 'hbot', label: 'Hyperbaric oxygen (HBOT)' },
  { value: 'hydrogen', label: 'Hydrogen systems' },
  { value: 'pemf', label: 'PEMF / VNS' },
  { value: 'rlt', label: 'Red light / PBM' },
  { value: 'delivery', label: 'Delivery, space, or installation planning' },
];

type ContactFieldName =
  | 'name'
  | 'email'
  | 'serialNumber'
  | 'clinicName'
  | 'interest'
  | 'message';

const CONTACT_FIELD_LABELS: Record<ContactFieldName, string> = {
  name: 'Name',
  email: 'Email',
  serialNumber: 'Device serial number',
  clinicName: 'Clinic or company name',
  interest: 'Main topic',
  message: 'Message',
};

const CONTACT_FIELD_INPUT_IDS: Record<ContactFieldName, string> = {
  name: 'contact-name',
  email: 'contact-email',
  serialNumber: 'contact-serial',
  clinicName: 'contact-clinic-name',
  interest: 'contact-interest',
  message: 'contact-message',
};

const CONTACT_FIELD_ERROR_IDS: Record<ContactFieldName, string> = {
  name: 'contact-name-error',
  email: 'contact-email-error',
  serialNumber: 'contact-serial-error',
  clinicName: 'contact-clinic-name-error',
  interest: 'contact-interest-error',
  message: 'contact-message-error',
};

const DEFAULT_CONTACT_FORM_START_EVENT = 'contact_form_start';
const DEFAULT_CONTACT_FORM_SUBMIT_EVENT = 'contact_form_submit_attempt';
const CONTACT_CALLBACK_NOTICE_ID = 'contact-callback-notice';
const CONTACT_FORM_ERRORS_ID = 'contact-form-errors';
const CONTACT_INTAKE_ACTION_STATUS_ID = 'contact-intake-action-status';
const CONTACT_INTAKE_ACTION_STATUS_LABEL = 'Contact intake action status';
const CONTACT_SUBMIT_STATUS_ID = 'contact-submit-status';
const CONTACT_PRIVACY_ACKNOWLEDGEMENT_STATUS_ID = 'contact-privacy-acknowledgement-status';
const CONTACT_EMERGENCY_ACTION_STATUS_ID = 'contact-emergency-action-status';

interface ContactPageProps {
  prefill?: ContactPrefill;
  formAnalytics?: {
    source?: string;
    startEventName?: string;
    submitEventName?: string;
  };
}

export const ContactPage: React.FC<ContactPageProps> = ({ prefill, formAnalytics }) => {
  const motionPrefersReducedMotion = useReducedMotion();
  const [mediaPrefersReducedMotion, setMediaPrefersReducedMotion] = useState(false);
  const [hasResolvedMotionPreference, setHasResolvedMotionPreference] = useState(false);
  const shouldReduceMotion =
    hasResolvedMotionPreference &&
    Boolean(motionPrefersReducedMotion || mediaPrefersReducedMotion);
  const [userType, setUserType] = useState<ContactIntent>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    subject: '',
    serialNumber: '',
    clinicName: '',
    interest: '',
    csrfToken: '',
  });
  const [csrfTokenError, setCsrfTokenError] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [_selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [intakeActionStatus, setIntakeActionStatus] = useState(
    'Contact intake controls ready. Choose a topic or schedule a callback if you want a faster handoff.'
  );
  const [privacyAcknowledgementStatus, setPrivacyAcknowledgementStatus] = useState(
    'Privacy acknowledgement is required before this contact request can be sent.'
  );
  const [emergencyActionStatus, setEmergencyActionStatus] = useState(
    'Emergency guidance shown. Use local emergency services for urgent symptoms or continue writing if this is not an emergency.'
  );
  const [callbackNotice, setCallbackNotice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const lastTelemetryKeyRef = React.useRef<string | null>(null);
  const formStartTelemetryCapturedRef = React.useRef(false);
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const [contactActionState, contactFormAction, contactPending] = useActionState<
    FormActionResult,
    FormData
  >(submitContactFormAction, { success: false, message: '' });

  React.useEffect(() => {
    const token = getCSRFToken();
    setFormData((prev) => ({ ...prev, csrfToken: token }));
  }, []);

  React.useEffect(() => {
    if (!showCallbackModal && !showEmergencyModal) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    dialog?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCallbackModal(false);
        setShowEmergencyModal(false);
      }
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, textarea, [tabindex="0"]'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [showCallbackModal, showEmergencyModal]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setHasResolvedMotionPreference(true);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => {
      setMediaPrefersReducedMotion(mediaQuery.matches);
      setHasResolvedMotionPreference(true);
    };

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  React.useEffect(() => {
    const keywords = ['pain', 'heart', 'emergency', 'stroke', 'bleeding', 'unconscious', 'chest'];
    const messageLower = formData.message.toLowerCase();
    const hasEmergency = keywords.some((keyword) => messageLower.includes(keyword));

    if (hasEmergency) {
      setShowCallbackModal(false);
      setShowEmergencyModal(true);
    }
  }, [formData.message]);

  React.useEffect(() => {
    const hasCallbackSlot = formData.message.includes(CALLBACK_REQUEST_PREFIX);

    if (contactActionState.success) {
      setTicketId(contactActionState.ticketId ?? null);
      setSubmitted(true);
      setSubmitError(null);
      setCallbackNotice(null);

      const telemetryKey = `success:${contactActionState.statusCode ?? 'none'}:${
        contactActionState.ticketId ?? 'none'
      }`;
      if (lastTelemetryKeyRef.current !== telemetryKey) {
        lastTelemetryKeyRef.current = telemetryKey;
        analytics.capture('contact_form_submission_succeeded', {
          has_callback_slot: hasCallbackSlot,
          has_ticket_id: Boolean(contactActionState.ticketId),
          inquiry_type: userType ?? 'unselected',
          status_code: contactActionState.statusCode ?? null,
        });
      }
      return;
    }

    if (contactActionState.message) {
      setSubmitError(contactActionState.message);

      const fieldErrorCount = Object.keys(contactActionState.fieldErrors ?? {}).length;
      const telemetryKey = `failure:${contactActionState.statusCode ?? 'none'}:${fieldErrorCount}`;
      if (lastTelemetryKeyRef.current !== telemetryKey) {
        lastTelemetryKeyRef.current = telemetryKey;
        analytics.capture('contact_form_submission_failed', {
          error_type: fieldErrorCount > 0 ? 'validation' : 'submission',
          field_error_count: fieldErrorCount,
          has_callback_slot: hasCallbackSlot,
          inquiry_type: userType ?? 'unselected',
          status_code: contactActionState.statusCode ?? null,
        });
      }
    }
  }, [contactActionState, formData.message, userType]);

  React.useEffect(() => {
    if (!prefill) {
      return;
    }

    const nextIntent = prefill.intent ?? null;
    const fallbackSubject =
      nextIntent && CONTACT_INTENTS.find((item) => item.id === nextIntent)?.subject;

    setUserType((prev) => prev ?? nextIntent);
    setFormData((prev) => ({
      ...prev,
      subject: prev.subject || prefill.subject || fallbackSubject || '',
      message: prev.message || prefill.message || '',
      interest: prev.interest || prefill.interest || '',
      clinicName: prev.clinicName || prefill.clinicName || '',
    }));
  }, [prefill]);

  const buildFormAnalyticsPayload = (nextUserType?: Exclude<ContactIntent, null>) => ({
    has_callback_slot: formData.message.includes(CALLBACK_REQUEST_PREFIX),
    has_prefill: Boolean(prefill),
    inquiry_type: nextUserType ?? userType ?? 'unselected',
    prefilled_intent: prefill?.intent ?? null,
    source: formAnalytics?.source ?? 'contact_form',
  });

  const captureFormStart = (nextUserType?: Exclude<ContactIntent, null>) => {
    const startEventName = formAnalytics?.startEventName ?? DEFAULT_CONTACT_FORM_START_EVENT;

    if (formStartTelemetryCapturedRef.current) {
      return;
    }

    formStartTelemetryCapturedRef.current = true;
    analytics.capture(startEventName, buildFormAnalyticsPayload(nextUserType));
  };

  const captureFormSubmit = () => {
    analytics.capture(
      formAnalytics?.submitEventName ?? DEFAULT_CONTACT_FORM_SUBMIT_EVENT,
      buildFormAnalyticsPayload()
    );
  };

  const updateFormField = (field: ContactFieldName, value: string) => {
    captureFormStart();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitValidation = (e: React.FormEvent<HTMLFormElement>) => {
    const storedToken = getCSRFToken();

    if (!validateCSRFToken(formData.csrfToken, storedToken)) {
      setCsrfTokenError(true);
      analytics.capture('contact_form_submission_failed', {
        error_type: 'csrf',
        field_error_count: 0,
        has_callback_slot: formData.message.includes(CALLBACK_REQUEST_PREFIX),
        inquiry_type: userType ?? 'unselected',
        status_code: 0,
      });
      e.preventDefault();
      return;
    }

    setCsrfTokenError(false);
    setSubmitError(null);
    captureFormSubmit();
  };

  const handleIntentSelect = (intent: Exclude<ContactIntent, null>) => {
    const nextSubject = CONTACT_INTENTS.find((item) => item.id === intent)?.subject ?? '';

    captureFormStart(intent);
    setUserType(intent);
    setIntakeActionStatus(
      `${CONTACT_INTENTS.find((item) => item.id === intent)?.label ?? 'Topic'} selected for this contact request.`
    );
    setFormData((prev) => ({
      ...prev,
      subject: nextSubject,
      serialNumber: intent === 'owner' ? prev.serialNumber : '',
      clinicName: intent === 'clinic' ? prev.clinicName : '',
      interest: intent === 'curious' || intent === 'rental' ? prev.interest : '',
    }));
  };

  const formatCallbackDateLabel = (date: Date) =>
    date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

  const handleCallbackSchedule = (slot: string) => {
    if (!selectedDate) return;

    setSelectedSlot(slot);
    const callbackDateLabel = formatCallbackDateLabel(selectedDate);
    const callbackRequestNote = createCallbackRequestNote(
      callbackDateLabel,
      slot
    );
    analytics.capture('contact_callback_slot_selected', {
      inquiry_type: userType ?? 'unselected',
      selected_date: callbackDateLabel,
      selected_slot: slot,
      source: submitted ? 'post_submit' : 'form',
    });

    setFormData((prev) => ({
      ...prev,
      subject: prev.subject || 'Callback request',
      message: upsertCallbackRequestNote(prev.message, callbackRequestNote),
    }));
    setShowCallbackModal(false);
    setSelectedDate(null);
    setSubmitError(null);
    setIntakeActionStatus(
      `Preferred callback slot ${callbackDateLabel} at ${slot} added to the message.`
    );
    setCallbackNotice(
      'Preferred callback slot added to your message. Send the request below to confirm it with the Hylono team.'
    );
  };

  const openCallbackModal = (source: 'form' | 'post_submit' | 'sidebar') => {
    if (source === 'form') {
      captureFormStart();
    }

    analytics.capture('contact_callback_modal_opened', {
      inquiry_type: userType ?? 'unselected',
      source,
      submitted,
    });
    setIntakeActionStatus(
      source === 'sidebar'
        ? 'Callback scheduler opened from the direct-contact panel.'
        : source === 'post_submit'
          ? 'Callback scheduler opened after the contact request was sent.'
          : 'Callback scheduler opened from the contact form.'
    );
    setShowCallbackModal(true);
  };

  const handleCallbackDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIntakeActionStatus(`Callback time preferences shown for ${formatCallbackDateLabel(date)}.`);
  };

  const handleCallbackDateBack = () => {
    setSelectedDate(null);
    setIntakeActionStatus('Callback date preferences shown.');
  };

  const closeEmergencyModal = () => {
    setShowEmergencyModal(false);
    setEmergencyActionStatus(
      'Emergency warning dismissed. Contact form remains available for non-emergency product support.'
    );
  };

  const handleEmergencyCallAction = () => {
    setEmergencyActionStatus(
      'Emergency services phone link opened. Hylono support is not an emergency medical channel.'
    );
  };

  const closeCallbackModal = () => {
    setShowCallbackModal(false);
    setIntakeActionStatus('Callback scheduler closed. Contact form remains ready.');
  };

  const handleDirectEmailAction = () => {
    setIntakeActionStatus('Direct email contact link opened for Hylono support.');
  };

  const handlePrivacyAcknowledgementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrivacyAcknowledgementStatus(
      event.target.checked
        ? 'Privacy acknowledgement selected. The contact request can include your details under the privacy policy.'
        : 'Privacy acknowledgement cleared. Select it before sending the contact request.'
    );
  };

  const handlePostSubmitCompareFocus = () => {
    setIntakeActionStatus('Compare systems route is ready after the contact request was sent.');
  };

  const handlePostSubmitCompareClick = () => {
    setIntakeActionStatus('Compare systems route opened after the contact request was sent.');
    analytics.capture('contact_post_submit_handoff_clicked', {
      cta_role: 'post_submit',
      destination: '/store',
      source: 'success_state',
    });
  };

  const getNextBusinessDays = (count: number) => {
    const days: Date[] = [];
    const current = new Date();

    while (days.length < count) {
      current.setDate(current.getDate() + 1);
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        days.push(new Date(current));
      }
    }

    return days;
  };

  const messagePlaceholder = userType
    ? MESSAGE_PLACEHOLDERS[userType]
    : 'Tell us what you need help with, which technology you are considering, or which next step feels unclear. Choose a topic if you want the reply tailored to support, rental, or commercial planning.';
  const fieldErrors = contactPending || submitted ? undefined : contactActionState.fieldErrors;
  const getFieldError = (field: ContactFieldName) => fieldErrors?.[field]?.[0];
  const buildFieldDescription = (field: ContactFieldName, ...descriptionIds: Array<string | null>) =>
    [...descriptionIds, getFieldError(field) ? CONTACT_FIELD_ERROR_IDS[field] : null]
      .filter(Boolean)
      .join(' ') || undefined;
  const buildInputClassName = (
    field: ContactFieldName,
    extraClasses = ''
  ) => {
    const hasError = Boolean(getFieldError(field));
    const stateClasses = hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 text-red-950 bg-red-50/30'
      : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10 text-slate-900 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]';

    return `w-full rounded-xl border px-4 py-3 text-sm transition-all focus:ring-1 focus-visible:outline-none ${stateClasses} ${extraClasses}`.trim();
  };
  const visibleErrorFields: ContactFieldName[] = ['name', 'email'];
  if (userType === 'owner') {
    visibleErrorFields.push('serialNumber');
  }
  if (userType === 'clinic') {
    visibleErrorFields.push('clinicName');
  }
  if (userType === 'curious' || userType === 'rental') {
    visibleErrorFields.push('interest');
  }
  visibleErrorFields.push('message');
  const fieldErrorItems = visibleErrorFields.flatMap((field) => {
    const message = getFieldError(field);

    return message
      ? [{ field, label: CONTACT_FIELD_LABELS[field], message }]
      : [];
  });
  const formAlertMessage = csrfTokenError
    ? 'Security validation failed. Refresh the page and try again.'
    : submitError;
  const hasFormAlert = Boolean(formAlertMessage || fieldErrorItems.length > 0);
  const contactSubmitStatusMessage = contactPending
    ? 'Sending your contact request now.'
    : hasFormAlert
      ? 'Contact request needs review before it can be sent.'
      : 'Ready to send a contact request after the required details and privacy acknowledgement are complete.';
  const formDescriptionIds = [
    CONTACT_SUBMIT_STATUS_ID,
    hasFormAlert ? CONTACT_FORM_ERRORS_ID : null,
  ]
    .filter(Boolean)
    .join(' ');
  const focusRingClass =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900';
  const formPanelInitial = false;
  const formPanelAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 };
  const asideInitial = false;
  const asideAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 };
  const modalDialogInitial = shouldReduceMotion ? false : { y: 50, opacity: 0 };
  const modalDialogAnimate = shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 };
  const modalDialogExit = shouldReduceMotion ? { opacity: 0 } : { y: 50, opacity: 0 };
  const emergencyDialogInitial = shouldReduceMotion ? false : { scale: 0.9, opacity: 0 };
  const emergencyDialogAnimate = shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 };
  const emergencyDialogExit = shouldReduceMotion ? { opacity: 0 } : { scale: 0.9, opacity: 0 };
  const slotPanelInitial = shouldReduceMotion ? false : { opacity: 0, x: 20 };
  const slotPanelAnimate = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 };

  return (
    <div
      className="relative overflow-hidden bg-white pb-24 pt-8 md:pt-12 text-slate-900"
      data-motion-mode={shouldReduceMotion ? 'reduced' : 'standard'}
    >
      <p
        id={CONTACT_INTAKE_ACTION_STATUS_ID}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={CONTACT_INTAKE_ACTION_STATUS_LABEL}
        className="sr-only"
      >
        {intakeActionStatus}
      </p>

      <AnimatePresence>
        {showEmergencyModal && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={closeEmergencyModal}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              tabIndex={-1}
              aria-modal="true"
              aria-labelledby="emergency-modal-title"
              aria-describedby={CONTACT_EMERGENCY_ACTION_STATUS_ID}
              data-motion-mode={shouldReduceMotion ? 'reduced' : 'standard'}
              initial={emergencyDialogInitial}
              animate={emergencyDialogAnimate}
              exit={emergencyDialogExit}
              className="max-h-[90dvh] overflow-y-auto w-full max-w-md rounded-[2rem] border border-red-200 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3 text-red-600">
                <AlertTriangle size={28} aria-hidden="true" />
                <h3 id="emergency-modal-title" className="text-xl font-bold text-slate-900">
                  Medical Emergency Warning
                </h3>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-slate-600">
                It looks like you might be describing a medical emergency. Hylono products and
                support are <strong>not</strong> for emergency medical use.
              </p>
              <p
                id={CONTACT_EMERGENCY_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Contact emergency action status"
                className="sr-only"
              >
                {emergencyActionStatus}
              </p>
              <div className="space-y-3">
                <a
                  href="tel:112"
                  onClick={handleEmergencyCallAction}
                  onFocus={handleEmergencyCallAction}
                  aria-describedby={CONTACT_EMERGENCY_ACTION_STATUS_ID}
                  className={`block min-h-11 w-full rounded-full bg-red-600 py-3 text-center text-sm font-bold text-white transition hover:bg-red-700 shadow-sm ${focusRingClass}`}
                >
                  Call Emergency Services (112)
                </a>
                <button
                  type="button"
                  onClick={closeEmergencyModal}
                  aria-describedby={CONTACT_EMERGENCY_ACTION_STATUS_ID}
                  className={`block min-h-11 w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 ${focusRingClass}`}
                >
                  I understand, continue writing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCallbackModal && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onClick={closeCallbackModal}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              tabIndex={-1}
              aria-modal="true"
              aria-labelledby="callback-modal-title"
              data-motion-mode={shouldReduceMotion ? 'reduced' : 'standard'}
              initial={modalDialogInitial}
              animate={modalDialogAnimate}
              exit={modalDialogExit}
              className="max-h-[90dvh] overflow-y-auto w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-8 text-slate-900 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 id="callback-modal-title" className="font-editorial text-2xl sm:text-3xl font-light text-slate-900">
                    Request a callback
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">Choose a preferred time. The team will confirm availability by email; this does not reserve a call.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                  <Calendar size={22} />
                </div>
              </div>

              {!selectedDate ? (
                <div className="space-y-4">
                  <h4 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Select a Date
                  </h4>
                  <div className="grid gap-2">
                    {getNextBusinessDays(5).map((date) => {
                      const dateLabel = formatCallbackDateLabel(date);

                      return (
                        <button
                          key={date.toISOString()}
                          type="button"
                          onClick={() => handleCallbackDateSelect(date)}
                          aria-describedby={CONTACT_INTAKE_ACTION_STATUS_ID}
                          className={`group min-h-11 w-full rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-left transition-all hover:border-slate-300 hover:bg-slate-100 ${focusRingClass}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-slate-950">
                              {dateLabel}
                            </span>
                            <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <motion.div initial={slotPanelInitial} animate={slotPanelAnimate}>
                  <button
                    type="button"
                    onClick={handleCallbackDateBack}
                    aria-describedby={CONTACT_INTAKE_ACTION_STATUS_ID}
                    className={`mb-4 flex min-h-11 items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950 ${focusRingClass}`}
                  >
                    <ChevronLeft size={14} /> Back to preferred dates
                  </button>
                  <h4 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Select Time for{' '}
                    {selectedDate.toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </h4>
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    {['09:00 AM', '09:30 AM', '10:00 AM', '11:15 AM', '01:00 PM', '02:30 PM', '03:45 PM', '04:15 PM'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleCallbackSchedule(slot)}
                        aria-describedby={CONTACT_INTAKE_ACTION_STATUS_ID}
                        className={`min-h-11 rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-800 transition-all hover:border-slate-950 hover:bg-slate-950 hover:text-white ${focusRingClass}`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <button
                type="button"
                onClick={closeCallbackModal}
                aria-describedby={CONTACT_INTAKE_ACTION_STATUS_ID}
                className={`min-h-11 w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 ${focusRingClass}`}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-12 lg:grid-cols-12">
          <motion.div
            initial={formPanelInitial}
            animate={formPanelAnimate}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }}
            id="contact-form"
            data-motion-mode={shouldReduceMotion ? 'reduced' : 'standard'}
            className="scroll-mt-28 lg:col-span-7 min-w-0"
          >
            {submitted ? (
              <div
                role="status"
                aria-live="polite"
                aria-labelledby="contact-success-title"
                className="rounded-[2rem] border border-slate-200/90 bg-white p-8 sm:p-12 text-center shadow-xs"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                  <Send size={28} />
                </div>
                <h2 id="contact-success-title" className="font-editorial mb-2 text-3xl font-light tracking-tight text-slate-900">
                  Message sent
                </h2>
                {ticketId && (
                  <p className="mb-2 inline-block rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 font-mono text-xs text-slate-700">
                    Ticket: {ticketId}
                  </p>
                )}
                <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600">
                  Your request has been received. You can continue exploring while the team reviews your message.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/store"
                    prefetch={false}
                    onFocus={handlePostSubmitCompareFocus}
                    onClick={handlePostSubmitCompareClick}
                    aria-describedby={CONTACT_INTAKE_ACTION_STATUS_ID}
                    className={`inline-flex min-h-11 items-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 ${focusRingClass}`}
                  >
                    Compare systems
                  </Link>
                </div>
              </div>
            ) : (
              <form
                action={contactFormAction}
                onSubmit={handleSubmitValidation}
                aria-describedby={formDescriptionIds}
                className="space-y-6"
              >
                <HoneypotField />
                <TurnstileWidget />
                <input type="hidden" name="csrfToken" value={formData.csrfToken} />
                <input type="hidden" name="userType" value={userType ?? ''} />
                <input
                  type="hidden"
                  name="subject"
                  value={formData.subject || 'Website contact request'}
                />
                <input type="hidden" name="privacyContext" value="contact form" />

                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600">
                    CONTACT FORM
                  </p>
                  <h2 className="font-editorial mt-1 text-3xl sm:text-4xl font-normal tracking-tight text-slate-900">
                    Send your request
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    Tell us a little about what you need. Choose a topic to see helpful optional fields.
                  </p>
                </div>

                {hasFormAlert && (
                  <div
                    id={CONTACT_FORM_ERRORS_ID}
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                  >
                    <h3 className="font-semibold text-red-950">Contact request was not sent</h3>
                    {formAlertMessage && <p className="mt-1 text-red-800">{formAlertMessage}</p>}
                    {fieldErrorItems.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {fieldErrorItems.map((item) => (
                          <li key={item.field}>
                            <a
                              className={`font-medium underline underline-offset-4 text-red-900 hover:text-red-950 ${focusRingClass}`}
                              href={`#${CONTACT_FIELD_INPUT_IDS[item.field]}`}
                            >
                              {item.label}: {item.message}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {callbackNotice && (
                  <div
                    id={CONTACT_CALLBACK_NOTICE_ID}
                    role="status"
                    aria-live="polite"
                    aria-label="Contact callback preference status"
                    className="rounded-xl border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-sm text-cyan-950"
                  >
                    {callbackNotice}
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-3">
                    Choose a topic
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CONTACT_INTENTS.map((intent) => {
                      const IconComponent = INTENT_ICONS[intent.id];
                      const isSelected = userType === intent.id;

                      return (
                        <button
                          key={intent.id}
                          type="button"
                          onClick={() => handleIntentSelect(intent.id)}
                          aria-pressed={isSelected}
                          aria-describedby={CONTACT_INTAKE_ACTION_STATUS_ID}
                          className={`group relative rounded-2xl border p-4 text-left transition-all flex flex-col justify-between h-full min-h-[120px] ${focusRingClass} ${
                            isSelected
                              ? 'border-slate-900 bg-white ring-1 ring-slate-900/10 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between w-full">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-700">
                              <IconComponent size={14} aria-hidden="true" />
                            </span>
                            {isSelected ? (
                              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-950 text-white" aria-hidden="true">
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              </span>
                            ) : (
                              <span className="h-3.5 w-3.5 rounded-full border border-slate-200" aria-hidden="true" />
                            )}
                          </div>
                          <div>
                            <div className="mt-3 text-xs sm:text-sm font-medium text-slate-900">
                              {intent.label}
                            </div>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                              {intent.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block text-xs font-medium text-slate-700"
                    >
                      Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      name="name"
                      required
                      aria-required="true"
                      aria-invalid={getFieldError('name') ? 'true' : undefined}
                      aria-describedby={buildFieldDescription('name')}
                      value={formData.name}
                      onChange={(event) => updateFormField('name', event.target.value)}
                      className={buildInputClassName('name')}
                      placeholder="Your name"
                    />
                    {getFieldError('name') && (
                      <p id="contact-name-error" className="mt-1.5 font-mono text-xs text-red-600">
                        {getFieldError('name')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1.5 block text-xs font-medium text-slate-700"
                    >
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      name="email"
                      required
                      aria-required="true"
                      aria-invalid={getFieldError('email') ? 'true' : undefined}
                      aria-describedby={buildFieldDescription('email')}
                      value={formData.email}
                      onChange={(event) => updateFormField('email', event.target.value)}
                      className={buildInputClassName('email')}
                      placeholder="you@company.com"
                    />
                    {getFieldError('email') && (
                      <p id="contact-email-error" className="mt-1.5 font-mono text-xs text-red-600">
                        {getFieldError('email')}
                      </p>
                    )}
                  </div>
                </div>

                {userType === 'owner' && (
                  <div>
                    <label
                      htmlFor="contact-serial"
                      className="mb-1.5 block text-xs font-medium text-slate-700"
                    >
                      Device serial number (optional)
                    </label>
                    <input
                      id="contact-serial"
                      type="text"
                      name="serialNumber"
                      aria-invalid={getFieldError('serialNumber') ? 'true' : undefined}
                      aria-describedby={buildFieldDescription('serialNumber')}
                      value={formData.serialNumber}
                      onChange={(event) => updateFormField('serialNumber', event.target.value)}
                      className={buildInputClassName('serialNumber')}
                      placeholder="For example HY-2024-XXXX"
                    />
                    {getFieldError('serialNumber') && (
                      <p id="contact-serial-error" className="mt-1.5 font-mono text-xs text-red-600">
                        {getFieldError('serialNumber')}
                      </p>
                    )}
                  </div>
                )}

                {userType === 'clinic' && (
                  <div>
                    <label
                      htmlFor="contact-clinic-name"
                      className="mb-1.5 block text-xs font-medium text-slate-700"
                    >
                      Clinic or company name (optional)
                    </label>
                    <input
                      id="contact-clinic-name"
                      type="text"
                      name="clinicName"
                      aria-invalid={getFieldError('clinicName') ? 'true' : undefined}
                      aria-describedby={buildFieldDescription('clinicName')}
                      value={formData.clinicName}
                      onChange={(event) => updateFormField('clinicName', event.target.value)}
                      className={buildInputClassName('clinicName')}
                      placeholder="e.g. Wellness Clinic"
                    />
                    {getFieldError('clinicName') && (
                      <p id="contact-clinic-name-error" className="mt-1.5 font-mono text-xs text-red-600">
                        {getFieldError('clinicName')}
                      </p>
                    )}
                  </div>
                )}

                {(userType === 'curious' || userType === 'rental') && (
                  <div>
                    <label
                      htmlFor="contact-interest"
                      className="mb-1.5 block text-xs font-medium text-slate-700"
                    >
                      Main topic (optional)
                    </label>
                    <select
                      id="contact-interest"
                      name="interest"
                      aria-invalid={getFieldError('interest') ? 'true' : undefined}
                      aria-describedby={buildFieldDescription('interest')}
                      value={formData.interest}
                      onChange={(event) => updateFormField('interest', event.target.value)}
                      className={buildInputClassName('interest')}
                    >
                      <option value="" className="text-slate-400">Select a topic</option>
                      {TOPIC_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-slate-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {getFieldError('interest') && (
                      <p id="contact-interest-error" className="mt-1.5 font-mono text-xs text-red-600">
                        {getFieldError('interest')}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block text-xs font-medium text-slate-700"
                  >
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    aria-required="true"
                    aria-invalid={getFieldError('message') ? 'true' : undefined}
                    aria-describedby={buildFieldDescription(
                      'message',
                      callbackNotice ? CONTACT_CALLBACK_NOTICE_ID : null
                    )}
                    value={formData.message}
                    onChange={(event) => updateFormField('message', event.target.value)}
                    rows={5}
                    className={buildInputClassName('message', 'resize-y')}
                    placeholder={messagePlaceholder}
                  />
                  {getFieldError('message') && (
                    <p id="contact-message-error" className="mt-1.5 font-mono text-xs text-red-600">
                      {getFieldError('message')}
                    </p>
                  )}
                </div>

                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="privacyAcknowledged"
                    value="on"
                    required
                    aria-required="true"
                    aria-describedby={`${CONTACT_PRIVACY_ACKNOWLEDGEMENT_STATUS_ID} ${CONTACT_SUBMIT_STATUS_ID}`}
                    onChange={handlePrivacyAcknowledgementChange}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white text-slate-950 focus:ring-slate-950/20 accent-slate-950"
                  />
                  <span>
                    I agree that Hylono may use this request and contact details to respond to my inquiry under the{' '}
                    <Link href="/privacy" className={`text-slate-900 font-medium underline underline-offset-4 hover:text-cyan-700 ${focusRingClass}`}>privacy policy</Link>.
                  </span>
                </label>
                <p
                  id={CONTACT_PRIVACY_ACKNOWLEDGEMENT_STATUS_ID}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label="Contact privacy acknowledgement status"
                  className="sr-only"
                >
                  {privacyAcknowledgementStatus}
                </p>

                <div className="pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={contactPending}
                      aria-describedby={CONTACT_SUBMIT_STATUS_ID}
                      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 py-3 text-sm font-medium text-white shadow-xs transition-all hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${focusRingClass}`}
                    >
                      {contactPending ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <span>Send my request</span>
                          <span aria-hidden="true">→</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => openCallbackModal('form')}
                      aria-describedby={CONTACT_INTAKE_ACTION_STATUS_ID}
                      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-800 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 ${focusRingClass}`}
                    >
                      <Phone size={14} className="text-slate-600" aria-hidden="true" />
                      <span>Request a callback</span>
                    </button>
                  </div>
                </div>

                <p
                  id={CONTACT_SUBMIT_STATUS_ID}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label="Contact form submit status"
                  className="font-mono text-xs text-slate-600"
                >
                  {contactSubmitStatusMessage}
                </p>
              </form>
            )}
          </motion.div>

          <motion.aside
            initial={asideInitial}
            animate={asideAnimate}
            transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.3 }}
            className="lg:col-span-5 min-w-0 flex flex-col h-full"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xs flex-1 flex flex-col justify-between">
              {/* Ethereal Cyan Silk Wave Texture - 100% Full Box Coverage */}
              <div
                className="pointer-events-none absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat rounded-[2rem]"
                style={{ backgroundImage: 'url(/images/contact/direct-contact-wave-full.jpg)' }}
                aria-hidden="true"
              />

              <div className="relative z-10 pt-2 sm:pt-4 lg:pt-[110px] flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600">
                    DIRECT CONTACT
                  </p>
                  <h2 className="font-editorial mt-1 text-2xl sm:text-3xl font-normal text-slate-900">
                    Get in touch
                  </h2>

                  <div className="mt-8 space-y-7">
                    {/* Email */}
                    <div className="flex items-start gap-3.5">
                      <Mail size={18} className="text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <a
                          href={`mailto:${siteEntity.contactEmail}`}
                          onClick={handleDirectEmailAction}
                          onFocus={handleDirectEmailAction}
                          aria-describedby={CONTACT_INTAKE_ACTION_STATUS_ID}
                          className={`block text-left group ${focusRingClass}`}
                        >
                          <p className="text-xs text-slate-500 font-medium">Email</p>
                          <p className="text-sm font-semibold text-slate-900 group-hover:text-cyan-700 transition-colors">
                            {siteEntity.contactEmail}
                          </p>
                        </a>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-start gap-3.5">
                      <Clock size={18} className="text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Hours</p>
                        <p className="text-sm font-semibold text-slate-900">{siteEntity.supportHours}</p>
                      </div>
                    </div>

                    {/* Service area */}
                    <div className="flex items-start gap-3.5">
                      <MapPin size={18} className="text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Service area</p>
                        <p className="text-sm font-semibold text-slate-900">{siteEntity.serviceArea}</p>
                      </div>
                    </div>

                    {/* Prefer to talk? */}
                    {!submitted && (
                      <div className="flex items-start gap-3.5 pt-1">
                        <Phone size={18} className="text-slate-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <button
                            type="button"
                            onClick={() => openCallbackModal('sidebar')}
                            aria-describedby={CONTACT_INTAKE_ACTION_STATUS_ID}
                            className={`text-left text-sm font-semibold text-slate-900 hover:text-cyan-800 transition-colors ${focusRingClass}`}
                          >
                            Prefer to talk?
                          </button>
                          <p className="text-xs leading-relaxed text-slate-600 mt-1 max-w-xs">
                            Add a preferred time to your message. Our team will confirm whether a call is available.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};
