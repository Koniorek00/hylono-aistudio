import Link from 'next/link';
import { LifeBuoy, LockKeyhole, Mail } from 'lucide-react';
import { siteEntity } from '@/content/site-entity';

const LOGIN_LOADING_ACTION_STATUS_ID = 'login-loading-action-status';
const loginStateActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';
const loginStatePrimaryActionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none motion-reduce:duration-0';

export default function LoginLoading() {
  return (
    <section
      aria-busy="true"
      aria-labelledby="login-loading-title"
      aria-describedby="login-loading-description"
      className="min-h-screen bg-slate-950 px-6 py-12 text-white"
    >
      <div className="mx-auto flex min-h-[70vh] max-w-4xl flex-col justify-center">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          <LockKeyhole className="h-3.5 w-3.5 text-cyan-200" />
          Account access
        </div>
        <h1
          id="login-loading-title"
          className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Preparing secure sign-in.
        </h1>
        <p
          id="login-loading-description"
          className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
        >
          Login controls, account access context, and support paths are loading.
        </p>
        <p
          id={LOGIN_LOADING_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Login loading action status"
          className="sr-only"
        >
          Sign-in loading recovery actions are ready.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login?auth=required"
            aria-describedby={`login-loading-description ${LOGIN_LOADING_ACTION_STATUS_ID}`}
            className={loginStatePrimaryActionClassName}
          >
            <LockKeyhole className="h-4 w-4" />
            Return to sign in
          </Link>
          <Link
            href="/help"
            aria-describedby={`login-loading-description ${LOGIN_LOADING_ACTION_STATUS_ID}`}
            className={loginStateActionClassName}
          >
            <LifeBuoy className="h-4 w-4" />
            Open Help Center
          </Link>
          <a
            href={`mailto:${siteEntity.supportEmail}`}
            aria-describedby={`login-loading-description ${LOGIN_LOADING_ACTION_STATUS_ID}`}
            className={loginStateActionClassName}
          >
            <Mail className="h-4 w-4" />
            Email support
          </a>
        </div>
      </div>
    </section>
  );
}
