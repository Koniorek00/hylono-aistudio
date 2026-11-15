/**
 * ============================================================================
 * QUARANTINE — DO NOT IMPORT THIS FILE ON ANY ROUTE.
 * ============================================================================
 *
 * DO NOT IMPORT. One import publishes everything below on a public page.
 * DELETE ON APPROVAL. This file is unimported dead code (repo-wide grep returns
 * only this definition). Deleting it is a one-line risk removal and needs no
 * design review, migration, or content replacement.
 *
 * WHAT IT CONTAINS (all of it fabricated):
 *   - Invented persons and credentials presented as verified: "Dr. Sarah Jenkins,
 *     MD" (:18) with a "Verified Physician" badge (:56), "Marcus Thorne,
 *     Olympic Sprinter" (:28), "Elena Rostova, Clinic Director, Apex Health" (:38).
 *   - Fabricated clinical outcomes presented as measured: "Measured 30% reduction
 *     in post-operative inflammation across 150+ patients." (:23) and "Zero
 *     downtime in clinic operations with 100% patient compliance." (:43).
 *   - pravatar.cc stock faces standing in for real clients (:21, :29, :41).
 *   - 5-star ratings with no review source (:24, :34, :44 and the Star render).
 *   - EU MDR Art. 7 banned vocabulary inside invented claims ("patients",
 *     "patient compliance", "post-operative").
 *
 * WHY IT IS QUARANTINED RATHER THAN FIXED: there is no real value to substitute.
 * Rewording would still assert named reviewers, quantified outcomes, and ratings
 * that no source in this repository supports. AGENTS.md forbids publishing fake
 * studies, reviewers, experts, partners, ratings, or statistics; GEMS 06
 * (06_ARGUMENTATION_COPY_SKELETONS_GEMS.md:168 and :171) forbids borrowing proof
 * and forbids presenting an unbacked outcome as evidence. Nothing in
 * content/evidence.ts, content/partners.ts, or content/reviews supports any of it.
 *
 * GUARD: tests/components/CommercialCopyGuard.test.ts keeps this path in its
 * blocked list, so importing it fails CI.
 * ============================================================================
 */
import React from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  type: 'physician' | 'clinic_director' | 'elite_athlete';
  avatarUrl: string;
  quote: string;
  clinicalOutcome: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Dr. Sarah Jenkins, MD',
    role: 'Chief of Sports Medicine',
    type: 'physician',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    quote: "Integrating Hylono's advanced recovery systems into our clinical workflow reduced average recovery times by 30%.",
    clinicalOutcome: 'Measured 30% reduction in post-operative inflammation across 150+ patients.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    role: 'Olympic Sprinter',
    type: 'elite_athlete',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    quote: 'The hyperbaric protocols transformed my training block. I recover faster and push harder without the usual fatigue.',
    clinicalOutcome: 'Improved VO2 max and accelerated micro-tear recovery during peak load.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Elena Rostova',
    role: 'Clinic Director, Apex Health',
    type: 'clinic_director',
    avatarUrl: 'https://i.pravatar.cc/150?img=32',
    quote: 'From a business perspective, the reliable support and clear onboarding allowed us to deploy PEMF safely on day one.',
    clinicalOutcome: 'Zero downtime in clinic operations with 100% patient compliance.',
    rating: 5,
  },
];

const TypeBadge = ({ type }: { type: Testimonial['type'] }) => {
  const badgeStyles = {
    physician: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    clinic_director: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    elite_athlete: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  };

  const labels = {
    physician: 'Verified Physician',
    clinic_director: 'Clinic Director',
    elite_athlete: 'Elite Athlete',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeStyles[type]}`}>
      <CheckCircle size={10} className="shrink-0" />
      {labels[type]}
    </span>
  );
};

export const TestimonialWall: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(theme(colors.cyan.300/8%)_1px,transparent_1px),linear-gradient(90deg,theme(colors.emerald.300/8%)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Clinical & Professional Validation
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Trusted by the people who <span className="text-cyan-300">measure outcomes</span>
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-300">
            We measure success in clinical markers, patient compliance, and athletic performance recovery.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <article
              key={testimonial.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-white/[0.05] hover:shadow-[0_8px_30px_rgb(6,182,212,0.15)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-10" aria-hidden />
              
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={testimonial.avatarUrl}
                      alt={testimonial.name}
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-cyan-500/20"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-slate-700">
                      <Quote size={10} className="text-cyan-400" />
                    </div>
                  </div>
                  <TypeBadge type={testimonial.type} />
                </div>
                
                <div className="mt-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < testimonial.rating ? 'fill-cyan-400 text-cyan-400' : 'fill-transparent text-slate-600'}
                    />
                  ))}
                </div>

                <blockquote className="mt-4 text-sm leading-relaxed text-slate-200">
                  "{testimonial.quote}"
                </blockquote>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Clinical Outcome
                </p>
                <p className="mt-1 text-sm font-medium text-cyan-100">
                  {testimonial.clinicalOutcome}
                </p>
                
                <div className="mt-4">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
