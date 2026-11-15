'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { AlertCircle, FileText, Mail, SearchCheck, ShieldCheck, Wrench } from 'lucide-react';
import { siteEntity } from '@/content/site-entity';

const supportChecklist = [
  'Device model or product page name',
  'Serial number or order reference if available',
  'What changed, when it started, and any visible alerts',
  'Photos or documents only after support asks for them',
] as const;

const DEVICE_SUPPORT_SUBMIT_STATUS_ID = 'device-support-submit-status';
const DEVICE_SUPPORT_ACTION_STATUS_ID = 'device-support-action-status';
const DEVICE_SUPPORT_INPUT_HELP_ID = 'device-support-reference-help';
const DEVICE_SUPPORT_ERROR_ID = 'device-support-submit-error';
const DEVICE_SUPPORT_SUBMIT_STATUS_LABEL = 'Device support submit status';
const DEVICE_SUPPORT_ACTION_STATUS_LABEL = 'Device support action status';

export const DeviceScanner: React.FC = () => {
  const [serialInput, setSerialInput] = useState('');
  const [lookupMessage, setLookupMessage] = useState('');
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(
    'Device support contact and warranty paths are ready.'
  );

  const submitStatusMessage =
    error ||
    lookupMessage ||
    'Enter a serial number or order reference to prepare a manual support handoff.';
  const submitDescriptionIds = [
    DEVICE_SUPPORT_SUBMIT_STATUS_ID,
    error ? DEVICE_SUPPORT_ERROR_ID : null,
  ]
    .filter(Boolean)
    .join(' ');
  const inputDescriptionIds = [
    DEVICE_SUPPORT_INPUT_HELP_ID,
    DEVICE_SUPPORT_SUBMIT_STATUS_ID,
    error ? DEVICE_SUPPORT_ERROR_ID : null,
  ]
    .filter(Boolean)
    .join(' ');
  const getDeviceSupportActionProps = (message: string) => ({
    'aria-describedby': DEVICE_SUPPORT_ACTION_STATUS_ID,
    onClick: () => setActionMessage(message),
    onFocus: () => setActionMessage(message),
  });

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedSerial = serialInput.trim();

    if (normalizedSerial.length < 4) {
      setLookupMessage('');
      setError('Enter a serial number or order reference before preparing the support handoff.');
      return;
    }

    setError('');
    setLookupMessage(
      'Support details prepared locally. Hylono reviews warranty coverage and device context manually after you contact support.'
    );
  };

  return (
    <section
      data-testid="device-support-handoff"
      aria-labelledby="device-support-handoff-title"
      className="mx-auto mb-16 w-full max-w-4xl overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] text-white shadow-2xl shadow-slate-950/20"
    >
      <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-slate-900" />
      <p
        id={DEVICE_SUPPORT_ACTION_STATUS_ID}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={DEVICE_SUPPORT_ACTION_STATUS_LABEL}
      >
        {actionMessage}
      </p>

      <div className="grid gap-8 p-6 md:grid-cols-[1.05fr_0.95fr] md:p-10">
        <div>
          <div className="flex items-start gap-4">
            <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-3 text-cyan-200">
              <Wrench size={26} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
                Device support
              </p>
              <h2
                id="device-support-handoff-title"
                className="mt-2 text-2xl font-bold text-white"
              >
                Prepare a manual device support request
              </h2>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-slate-300">
            This public page does not confirm warranty outcome, ownership, service eligibility, or
            device identity automatically. Use it to gather the details Hylono support needs before
            a manual review.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/contact?intent=device-support"
              {...getDeviceSupportActionProps(
                'Opening device support contact from the manual support handoff.'
              )}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <Mail size={17} />
              Contact device support
            </Link>
            <Link
              href="/warranty"
              {...getDeviceSupportActionProps(
                'Opening warranty terms from the manual support handoff.'
              )}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm font-bold text-slate-100 transition hover:border-cyan-300/50 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <ShieldCheck size={17} />
              Review warranty terms
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-slate-950/40 p-5">
          <form
            onSubmit={handleManualSubmit}
            aria-describedby={submitDescriptionIds}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="device-support-reference"
                className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
              >
                Serial or order reference
              </label>
              <input
                id="device-support-reference"
                type="text"
                value={serialInput}
                onChange={(event) => setSerialInput(event.target.value)}
                placeholder="Example: HY-2024-XXXX"
                aria-describedby={inputDescriptionIds}
                className="mt-2 min-h-12 w-full rounded-lg border border-white/10 bg-white/[0.045] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus-visible:border-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-300/20"
              />
              <p id={DEVICE_SUPPORT_INPUT_HELP_ID} className="mt-2 text-xs leading-5 text-slate-500">
                The reference stays in this browser until you send it through the contact route.
              </p>
            </div>

            <p
              id={DEVICE_SUPPORT_SUBMIT_STATUS_ID}
              className="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={DEVICE_SUPPORT_SUBMIT_STATUS_LABEL}
            >
              {submitStatusMessage}
            </p>

            {error && (
              <div
                id={DEVICE_SUPPORT_ERROR_ID}
                role="alert"
                className="flex gap-2 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-100"
              >
                <AlertCircle className="mt-0.5 shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            {lookupMessage && (
              <div className="flex gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">
                <SearchCheck className="mt-0.5 shrink-0" size={16} />
                <span>{lookupMessage}</span>
              </div>
            )}

            <button
              type="submit"
              aria-describedby={submitDescriptionIds}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              <FileText size={17} />
              Prepare support details
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.045] p-4">
            <h3 className="text-sm font-bold text-white">Include in your request</h3>
            <ul className="mt-3 space-y-2">
              {supportChecklist.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-slate-300">
                  <span className="mt-2 size-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Coverage: {siteEntity.supportCoverageLabel}. Hours: {siteEntity.supportHours}.
          </p>
        </div>
      </div>
    </section>
  );
};
