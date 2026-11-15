'use client';

import { Send } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState, useMemo, useRef, useState } from 'react';
import { submitContactFormAction, type FormActionResult } from '@/src/actions/formActions';
import { HoneypotField } from '@/components/shared/HoneypotField';
import { TurnstileWidget } from '@/components/shared/TurnstileWidget';
import analytics from '@/src/lib/analytics';

const initialState: FormActionResult = { success: false, message: '' };

const topicOptions = [
  { value: 'guidance', label: 'Porownanie technologii', userType: 'curious' },
  { value: 'hbot', label: 'HBOT', userType: 'curious' },
  { value: 'hydrogen', label: 'H2 / wodor molekularny', userType: 'curious' },
  { value: 'rental', label: 'Wynajem lub dostep miesieczny', userType: 'rental' },
  { value: 'clinic', label: 'Klinika, studio lub B2B', userType: 'clinic' },
] as const;

const focusClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';

const PL_CONTACT_SUBMIT_STATUS_ID = 'pl-contact-submit-status';
const PL_CONTACT_SUBMIT_ERROR_ID = 'pl-contact-submit-error';

const techToTopic = (tech: string | null) =>
  tech === 'hbot' || tech === 'hydrogen' ? tech : 'guidance';

export function PolishContactForm() {
  const searchParams = useSearchParams();
  const prefilledTech = useMemo(() => {
    const tech = searchParams.get('tech');
    return tech === 'hbot' || tech === 'hydrogen' ? tech : null;
  }, [searchParams]);
  const initialTopic = useMemo(() => techToTopic(prefilledTech), [prefilledTech]);
  const [topic, setTopic] = useState(initialTopic);
  const [state, formAction, pending] = useActionState(submitContactFormAction, initialState);
  const formStartCapturedRef = useRef(false);
  const selectedTopic = topicOptions.find((item) => item.value === topic) ?? topicOptions[0];
  const subject = `Zapytanie z polskiej strony Hylono: ${selectedTopic.label}`;
  const hasSubmissionResult = Boolean(state.message || state.statusCode || state.ticketId);
  const showError = hasSubmissionResult && !state.success;
  const submitStatusMessage = pending
    ? 'Wysylanie polskiego zapytania kontaktowego.'
    : showError
      ? 'Polskie zapytanie kontaktowe wymaga sprawdzenia przed ponowna wysylka.'
      : 'Gotowe do wyslania polskiego zapytania kontaktowego.';
  const formDescriptionIds = showError
    ? `${PL_CONTACT_SUBMIT_STATUS_ID} ${PL_CONTACT_SUBMIT_ERROR_ID}`
    : PL_CONTACT_SUBMIT_STATUS_ID;
  const buildAnalyticsPayload = () => ({
    has_prefill: Boolean(prefilledTech),
    inquiry_type: selectedTopic.userType,
    locale: 'pl_PL',
    prefilled_tech: prefilledTech,
    source: 'pl_contact_route',
    topic: selectedTopic.value,
  });
  const captureFormStart = () => {
    if (formStartCapturedRef.current) {
      return;
    }

    formStartCapturedRef.current = true;
    analytics.capture('contact_form_start', buildAnalyticsPayload());
  };
  const captureSubmitAttempt = () => {
    analytics.capture('contact_form_submit_attempt', buildAnalyticsPayload());
  };

  if (state.success) {
    return (
      <div
        id={PL_CONTACT_SUBMIT_STATUS_ID}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Polish contact submit status"
        className="rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-6 text-white"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
          Wiadomosc wyslana
        </p>
        <h2 className="mt-3 text-2xl font-black">Dziekujemy za kontakt</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Zgloszenie trafilo do kolejki Hylono. Zespol odpowie najszybciej, jak to mozliwe.
        </p>
        {state.ticketId ? (
          <p className="mt-4 inline-flex rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 font-mono text-xs text-slate-200">
            Numer zgloszenia: {state.ticketId}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/pl"
            aria-describedby={PL_CONTACT_SUBMIT_STATUS_ID}
            className={`inline-flex min-h-11 items-center rounded-lg border border-emerald-300/30 bg-emerald-300/15 px-4 py-2 text-sm font-semibold text-emerald-50 hover:bg-emerald-300/20 ${focusClass}`}
          >
            Wroc do strony startowej
          </Link>
          <Link
            href="/pl/product/hbot"
            aria-describedby={PL_CONTACT_SUBMIT_STATUS_ID}
            className={`inline-flex min-h-11 items-center rounded-lg border border-white/10 bg-white/[0.045] px-4 py-2 text-sm font-semibold text-white hover:border-cyan-300/45 hover:bg-white/[0.07] ${focusClass}`}
          >
            Przejrzyj HBOT
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onChange={captureFormStart}
      onSubmit={captureSubmitAttempt}
      aria-describedby={formDescriptionIds}
      className="space-y-6 rounded-lg border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-slate-950/20"
    >
      <HoneypotField />
      <TurnstileWidget />
      <input type="hidden" name="subject" value={subject} />
      <input type="hidden" name="userType" value={selectedTopic.userType} />
      <input type="hidden" name="interest" value={selectedTopic.value} />
      <input type="hidden" name="privacyContext" value="polish contact form" />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
          Formularz kontaktowy
        </p>
        <h2 className="mt-3 text-2xl font-black text-white">Wyslij zapytanie po polsku</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Podaj imie, email i krotki opis. Formularz korzysta z istniejacej sciezki kontaktowej
          Hylono.
        </p>
      </div>

      {showError ? (
        <div
          id={PL_CONTACT_SUBMIT_ERROR_ID}
          role="alert"
          className="rounded-lg border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm text-red-100"
        >
          Nie udalo sie wyslac wiadomosci. Sprawdz wymagane pola i sprobuj ponownie za chwile.
        </div>
      ) : null}

      <div>
        <label
          htmlFor="pl-contact-topic"
          className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400"
        >
          Temat
        </label>
        <select
          id="pl-contact-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          aria-describedby={PL_CONTACT_SUBMIT_STATUS_ID}
          className={`w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-white ${focusClass}`}
        >
          {topicOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="pl-contact-name"
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400"
          >
            Imie i nazwisko
          </label>
          <input
            id="pl-contact-name"
            name="name"
            required
            autoComplete="name"
            aria-describedby={PL_CONTACT_SUBMIT_STATUS_ID}
            className={`w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-white ${focusClass}`}
            placeholder="Jan Kowalski"
            type="text"
          />
        </div>
        <div>
          <label
            htmlFor="pl-contact-email"
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400"
          >
            Email
          </label>
          <input
            id="pl-contact-email"
            name="email"
            required
            autoComplete="email"
            aria-describedby={PL_CONTACT_SUBMIT_STATUS_ID}
            className={`w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-white ${focusClass}`}
            placeholder="jan@example.com"
            type="email"
          />
        </div>
      </div>

      {topic === 'clinic' ? (
        <div>
          <label
            htmlFor="pl-contact-clinic"
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400"
          >
            Nazwa firmy lub placowki
          </label>
          <input
            id="pl-contact-clinic"
            name="clinicName"
            aria-describedby={PL_CONTACT_SUBMIT_STATUS_ID}
            className={`w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-white ${focusClass}`}
            placeholder="Nazwa organizacji"
            type="text"
          />
        </div>
      ) : null}

      <div>
        <label
          htmlFor="pl-contact-message"
          className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400"
        >
          Wiadomosc
        </label>
        <textarea
          id="pl-contact-message"
          name="message"
          required
          rows={7}
          aria-describedby={PL_CONTACT_SUBMIT_STATUS_ID}
          className={`w-full resize-none rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-white ${focusClass}`}
          placeholder="Napisz, co chcesz porownac, gdzie planujesz uzycie i jakie pytania sa dla Ciebie najwazniejsze."
        />
      </div>

      <label className="flex gap-3 rounded-lg border border-white/10 bg-slate-950/55 p-4 text-sm leading-6 text-slate-300">
        <input
          type="checkbox"
          name="privacyAcknowledged"
          value="on"
          required
          aria-required="true"
          aria-describedby={PL_CONTACT_SUBMIT_STATUS_ID}
          className="mt-1 h-4 w-4 rounded border-white/20 bg-white/[0.045] text-cyan-300"
        />
        <span>
          Potwierdzam, ze Hylono moze uzyc tej wiadomosci i danych kontaktowych, aby odpowiedziec na zapytanie zgodnie z polityka prywatnosci.
        </span>
      </label>

      <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p
          id={PL_CONTACT_SUBMIT_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Polish contact submit status"
          className="sr-only"
        >
          {submitStatusMessage}
        </p>
        <p className="text-sm leading-6 text-slate-400">
          W sytuacjach naglych skontaktuj sie z lokalnymi sluzbami ratunkowymi pod numerem 112.
        </p>
        <button
          type="submit"
          disabled={pending}
          aria-describedby={PL_CONTACT_SUBMIT_STATUS_ID}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/15 px-6 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-60 ${focusClass}`}
        >
          <Send size={18} aria-hidden="true" />
          {pending ? 'Wysylanie...' : 'Wyslij zapytanie'}
        </button>
      </div>
    </form>
  );
}
