"use client";

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CheckCircle, Clock, RotateCcw, Shield, XCircle } from 'lucide-react';

interface Step {
  step: string;
  title: string;
  desc: string;
  color: string;
}

const HOW_STEPS: Step[] = [
  {
    step: '01',
    title: 'Choose a Device',
    desc: 'Select the device and review the return terms before checkout.',
    color: 'bg-cyan-500',
  },
  {
    step: '02',
    title: 'Receive and Check',
    desc: 'Inspect the device, packaging, accessories, and setup guidance on arrival.',
    color: 'bg-cyan-500',
  },
  {
    step: '03',
    title: 'Evaluate Fit',
    desc: 'Use the return window to confirm setup, space, and routine fit.',
    color: 'bg-cyan-500',
  },
  {
    step: '04',
    title: 'Contact Support',
    desc: 'Contact support before the policy window closes if you need to return it.',
    color: 'bg-amber-500',
  },
  {
    step: '05',
    title: 'Return Review',
    desc: 'The team confirms collection, inspection, and refund handling under the policy.',
    color: 'bg-emerald-500',
  },
];

const COVERED = [
  'Devices purchased directly through hylono.com',
  'Devices handled under the published return terms',
  'Returns requested within 30 calendar days of delivery',
  'Devices in original condition, with normal use wear accepted',
  'Eligible modalities listed on the purchase and policy pages',
];

const NOT_COVERED = [
  'Devices purchased from third-party resellers',
  'Returns requested after the 30-day window',
  'Devices with user-caused physical damage',
  'Consumables and disposable accessories',
  'Customised or bespoke protocol packages',
];

const POLICY_CARDS = [
  {
    icon: Shield,
    title: 'Device condition',
    desc: 'Check the product page and policy pages for the condition, warranty, and return requirements that apply to your order.',
  },
  {
    icon: RotateCcw,
    title: 'Return window',
    desc: 'Eligible returns are handled under the published policy window and inspection process, not a promised health or performance outcome.',
  },
  {
    icon: Clock,
    title: 'Support process',
    desc: 'Contact support@hylono.com before the policy window closes so the team can confirm next steps.',
  },
];

const POLICY_NOTES = [
  {
    title: 'Check fit before you keep it',
    text: 'Use the return window to confirm delivery condition, setup requirements, space, and routine fit.',
    initials: '01',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Keep support in the loop',
    text: 'Contact support before the return window closes so collection, inspection, and refund timing can be confirmed.',
    initials: '02',
    gradient: 'from-purple-500 to-pink-600',
  },
];

export const GuaranteePage: React.FC = () => {
  const reduced = useReducedMotion();

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 px-6 py-24 text-white">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="mb-6 inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <Shield size={14} />
              Return Policy
            </span>
            <h1 className="mb-6 text-5xl font-black leading-none futuristic-font md:text-7xl">
              30-Day
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Return Path
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl leading-relaxed text-slate-300">
              Review the return window, device condition requirements, and support process before
              you choose a system.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/store"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-10 py-4 text-sm font-bold uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-100"
              >
                Review Devices
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-white/40"
              >
                Ask a Question
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
            Section 01
          </span>
          <h2 className="mt-3 mb-4 text-3xl font-bold text-slate-900 futuristic-font md:text-4xl">
            Policy Basics
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-500">
            Eligible purchases use the published return and warranty pages. Read those terms before
            you treat the return window as part of your buying plan.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {POLICY_CARDS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-lg border border-slate-100 bg-slate-50 p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <item.icon size={22} className="text-emerald-600" />
                </div>
                <h3 className="mb-2 font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
              Section 02
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 futuristic-font md:text-4xl">
              How It Works
            </h2>
          </div>
          <div className="relative">
            <div className="absolute top-6 bottom-6 left-6 w-px bg-gradient-to-b from-cyan-300 via-cyan-500 to-emerald-500 md:hidden" />
            <div className="absolute top-6 right-[10%] left-[10%] hidden h-px bg-gradient-to-r from-cyan-300 via-cyan-500 to-emerald-500 md:block" />
            <div className="grid gap-6 md:grid-cols-5">
              {HOW_STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={reduced ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.45 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div
                    className={`${step.color} z-10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg text-sm font-black text-white`}
                  >
                    {step.step}
                  </div>
                  <h4 className="mb-1 text-sm font-bold text-slate-900">{step.title}</h4>
                  <p className="text-xs leading-relaxed text-slate-500">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
              Policy Details
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 futuristic-font md:text-4xl">
              What Is Covered
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-8">
              <h3 className="mb-5 flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle size={18} className="text-emerald-600" />
                Covered
              </h3>
              <ul className="space-y-3">
                {COVERED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-emerald-800">
                    <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-8">
              <h3 className="mb-5 flex items-center gap-2 font-bold text-slate-700">
                <XCircle size={18} className="text-slate-500" />
                Not Covered
              </h3>
              <ul className="space-y-3">
                {NOT_COVERED.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                    <XCircle size={15} className="mt-0.5 shrink-0 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-5 rounded-lg bg-slate-900 p-6 text-white">
            <Shield size={32} className="shrink-0 text-cyan-400" />
            <div>
              <p className="font-bold">Warranty is separate</p>
              <p className="mt-1 text-sm text-slate-400">
                Warranty coverage is separate from the return window. Review the warranty page for
                covered defects, exclusions, and claim handling.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400">
              Section 03
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 futuristic-font md:text-4xl">
              What to Check First
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {POLICY_NOTES.map((note, i) => (
              <motion.div
                key={note.title}
                initial={reduced ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                className="rounded-lg border border-slate-100 bg-white p-8"
              >
                <h3 className="mb-2 font-bold text-slate-900">{note.title}</h3>
                <p className="mb-6 leading-relaxed text-slate-600">{note.text}</p>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${note.gradient} text-sm font-bold text-white`}
                  >
                    {note.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Policy planning note</p>
                    <p className="text-sm text-slate-500">Hylono support</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Shield size={48} className="mx-auto mb-6 text-cyan-400" />
            <h2 className="mb-4 text-3xl font-bold futuristic-font md:text-5xl">
              Review the Return Path
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-slate-300">
              Compare the device, policy pages, and support path before you place an order.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/store"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-10 py-4 text-sm font-bold uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-100"
              >
                Review Devices
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-8 py-4 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-white/40"
              >
                Ask a Question
                <ArrowRight size={14} />
              </Link>
            </div>
            <p className="mt-6 text-sm text-slate-500">
              30-day return policy | warranty page | support review | inspection process
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
