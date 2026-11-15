'use client';

import { useId, useState } from 'react';
import analytics from '@/src/lib/analytics';
import { modalities, type ModalityId } from './content';
import { OpusLink } from './OpusLink';
import s from './opus.module.css';

type Space = 'home' | 'practice';
type Focus = ModalityId | 'unsure';
type Commitment = 'rent' | 'own' | 'unsure';

interface Answers {
  space: Space | null;
  focus: Focus | null;
  commitment: Commitment | null;
}

interface Stop {
  key: string;
  title: string;
  copy: string;
  href: string;
  label: string;
}

const spaceOptions: ReadonlyArray<{
  value: Space;
  label: string;
  hint: string;
}> = [
  { value: 'home', label: 'My home', hint: 'A room of your own' },
  {
    value: 'practice',
    label: 'A professional practice',
    hint: 'Clinic, studio or spa',
  },
];

const focusOptions: ReadonlyArray<{
  value: Focus;
  label: string;
  hint: string;
}> = [
  ...modalities.map((m) => ({ value: m.id, label: m.name, hint: m.symbol })),
  { value: 'unsure', label: 'Not sure yet', hint: '?' },
];

const commitmentOptions: ReadonlyArray<{
  value: Commitment;
  label: string;
  hint: string;
}> = [
  { value: 'rent', label: 'Try it first', hint: 'Rental' },
  { value: 'own', label: 'Own it', hint: 'Purchase' },
  { value: 'unsure', label: 'Help me decide', hint: 'Compare' },
];

function buildRoute({ space, focus, commitment }: Answers): Stop[] {
  const stops: Stop[] = [];

  stops.push(
    space === 'practice'
      ? {
          key: 'space',
          title: 'Map your professional setting',
          copy: 'Documentation, onboarding and support for a practice.',
          href: '/for-professionals',
          label: 'Professional access',
        }
      : {
          key: 'space',
          title: 'Map your room',
          copy: 'Footprint, access and the time you can set aside.',
          href: '/for-home',
          label: 'Home pathway',
        },
  );

  const modality = modalities.find((m) => m.id === focus);
  stops.push(
    modality
      ? {
          key: 'focus',
          title: `Understand ${modality.name.toLowerCase()}`,
          copy: modality.line,
          href: modality.path,
          label: modality.action,
        }
      : {
          key: 'focus',
          title: 'Start from your priorities',
          copy: 'Name what matters to you before choosing a technology.',
          href: '/conditions',
          label: 'Explore wellness goals',
        },
  );

  stops.push({
    key: 'evidence',
    title: 'Read the evidence, with its limits',
    copy: 'Sources, studied settings and the limitations authors report.',
    href: '/research',
    label: 'Research library',
  });

  stops.push(
    commitment === 'rent'
      ? {
          key: 'commitment',
          title: 'Review the rental pathway',
          copy: 'Availability, duration and terms depend on model and location.',
          href: '/rental',
          label: 'Rental pathway',
        }
      : commitment === 'own'
        ? {
            key: 'commitment',
            title: 'Compare equipment to own',
            copy: 'Specifications, requirements and financing options.',
            href: '/store',
            label: 'Equipment collection',
          }
        : {
            key: 'commitment',
            title: 'Weigh rental against ownership',
            copy: 'Put both options side by side before committing.',
            href: '/compare/rent-vs-buy',
            label: 'Rent vs buy',
          },
  );

  return stops;
}

function OptionGroup<T extends string>({
  legend,
  step,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  step: string;
  name: string;
  options: ReadonlyArray<{ value: T; label: string; hint: string }>;
  value: T | null;
  onChange: (value: T) => void;
}) {
  const id = useId();
  return (
    <fieldset className={s.pathGroup}>
      <legend className={s.pathLegend}>
        <span className={s.pathStep}>{step}</span> {legend}
      </legend>
      <div className={s.pathOptions}>
        {options.map((option) => (
          <label key={option.value} className={s.pathOption} htmlFor={`${id}-${option.value}`}>
            <input
              id={`${id}-${option.value}`}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={s.pathInput}
            />
            <span className={s.pathOptionLabel}>{option.label}</span>
            <span className={s.pathOptionHint} aria-hidden="true">
              {option.hint}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Three answers produce an ordered list of internal pages. Without JavaScript the radios
 * still submit as a GET form to /consultation, so the answers are never lost.
 */
export function Pathfinder() {
  const [answers, setAnswers] = useState<Answers>({
    space: null,
    focus: null,
    commitment: null,
  });
  const answered = [answers.space, answers.focus, answers.commitment].filter(Boolean).length;
  const route = buildRoute(answers);

  const update = <K extends keyof Answers>(key: K, value: NonNullable<Answers[K]>) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    analytics.capture('audience_path_select', {
      route: '/home-new-opus',
      source: 'pathfinder',
      question: key,
      answer: value,
    });
  };

  const query = new URLSearchParams(
    Object.entries(answers).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ).toString();
  const consultationHref = query ? `/consultation?${query}` : '/consultation';

  return (
    <form
      action="/consultation"
      method="get"
      className={s.pathfinder}
      aria-describedby="pathfinder-note"
    >
      <div className={s.pathQuestions}>
        <OptionGroup
          step="A"
          legend="Where will the equipment live?"
          name="space"
          options={spaceOptions}
          value={answers.space}
          onChange={(v) => update('space', v)}
        />
        <OptionGroup
          step="B"
          legend="What are you curious about?"
          name="focus"
          options={focusOptions}
          value={answers.focus}
          onChange={(v) => update('focus', v)}
        />
        <OptionGroup
          step="C"
          legend="How would you like to commit?"
          name="commitment"
          options={commitmentOptions}
          value={answers.commitment}
          onChange={(v) => update('commitment', v)}
        />
        <p id="pathfinder-note" className={s.pathNote}>
          Your answers stay in this browser tab. They only shape the links on the right.
        </p>
      </div>

      <div className={s.pathResult} data-progress={answered}>
        <div className={s.pathResultHead}>
          <p className={s.eyebrow}>Your route</p>
          <p className={s.pathMeter} aria-hidden="true">
            <span style={{ inlineSize: `${(answered / 3) * 100}%` }} />
          </p>
          <p className={s.srOnly} aria-live="polite">
            {answered === 0
              ? 'Answer the questions to shape your route.'
              : `${answered} of 3 questions answered. Your route has ${route.length + 1} stops.`}
          </p>
        </div>
        <ol className={s.pathStops}>
          {route.map((stop, i) => (
            <li key={`${stop.key}-${stop.href}`} className={s.pathStop}>
              <span className={s.pathStopIndex} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className={s.pathStopTitle}>{stop.title}</h3>
                <p>{stop.copy}</p>
                <OpusLink href={stop.href} source={`pathfinder-${stop.key}`} className={s.textLink}>
                  {stop.label} <span aria-hidden="true">↗</span>
                </OpusLink>
              </div>
            </li>
          ))}
          <li className={`${s.pathStop} ${s.pathStopFinal}`}>
            <span className={s.pathStopIndex} aria-hidden="true">
              {String(route.length + 1).padStart(2, '0')}
            </span>
            <div>
              <h3 className={s.pathStopTitle}>Talk it through with Hylono</h3>
              <p>Bring your answers. Leave with clear next steps and written details.</p>
              <OpusLink
                href={consultationHref}
                source="pathfinder-consultation"
                className={s.buttonLight}
              >
                Take this route to a consultation <span aria-hidden="true">↗</span>
              </OpusLink>
            </div>
          </li>
        </ol>
        <noscript>
          <button type="submit" className={s.buttonLight}>
            Send my answers to a consultation
          </button>
        </noscript>
      </div>
    </form>
  );
}
