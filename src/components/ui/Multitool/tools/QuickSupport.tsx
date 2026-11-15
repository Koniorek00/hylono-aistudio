"use client";

/**
 * QuickSupport — Quick access to help and support
 *
 * Features:
 * - Help center link
 * - Contact support action
 * - Demo request trigger
 */
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { HelpCircle, MessageCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { QuickSupportProps } from '../types';

interface SupportAction {
  id: string;
  label: string;
  description: string;
  status: string;
  icon: React.ReactNode;
  action: () => void;
}

export const QUICK_SUPPORT_ACTION_STATUS_ID = 'quick-support-action-status';
export const QUICK_SUPPORT_ACTION_STATUS_LABEL = 'Quick support action status';
export const QUICK_SUPPORT_ACTION_READY_STATUS =
  'Quick support actions are ready. Use Help Center, Contact Us, Request Demo, or Contact support for support routing.';

export const QuickSupport: React.FC<QuickSupportProps> = ({
  className = '',
  onSupport,
}) => {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [supportActionStatus, setSupportActionStatus] = React.useState(
    QUICK_SUPPORT_ACTION_READY_STATUS
  );

  const handleHelpCenter = () => {
    // Navigate to help center
    router.push('/help');
    window.scrollTo(0, 0);
  };

  const handleContact = () => {
    // Navigate to contact page
    router.push('/contact');
    window.scrollTo(0, 0);
  };

  const handleBookDemo = () => {
    // Trigger demo modal or navigation
    if (onSupport) {
      onSupport();
    } else {
      router.push('/demo');
      window.scrollTo(0, 0);
    }
  };

  const handleUrgentSupport = () => {
    router.push('/contact?intent=urgent-support');
    window.scrollTo(0, 0);
  };

  const actions: SupportAction[] = [
    {
      id: 'help',
      label: 'Help Center',
      description: 'FAQs & guides',
      status: 'Opening Help Center from quick support.',
      icon: <HelpCircle size={16} />,
      action: handleHelpCenter,
    },
    {
      id: 'contact',
      label: 'Contact Us',
      description: 'Send a message',
      status: 'Opening Contact Us from quick support.',
      icon: <MessageCircle size={16} />,
      action: handleContact,
    },
    {
      id: 'demo',
      label: 'Request Demo',
      description: 'Manual handoff',
      status: 'Request Demo handoff is ready from quick support.',
      icon: <Calendar size={16} />,
      action: handleBookDemo,
    },
  ];

  return (
    <div className={`${className}`} role="group" aria-label="Quick support">
      <p
        id={QUICK_SUPPORT_ACTION_STATUS_ID}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={QUICK_SUPPORT_ACTION_STATUS_LABEL}
        className="sr-only"
      >
        {supportActionStatus}
      </p>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
        <HelpCircle size={14} className="text-slate-400" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Quick Support
        </span>
      </div>

      {/* Actions */}
      <div className="py-2 px-2 space-y-1">
        {actions.map((action) => (
          <motion.button
            type="button"
            key={action.id}
            aria-describedby={QUICK_SUPPORT_ACTION_STATUS_ID}
            onFocus={() => setSupportActionStatus(action.status)}
            onClick={() => {
              setSupportActionStatus(action.status);
              action.action();
            }}
            whileTap={reduced ? undefined : { scale: 0.98 }}
            className={`
              w-full min-h-[44px] rounded-lg px-3
              flex items-center gap-3
              text-sm transition-colors duration-200
              bg-slate-50 text-slate-600
              hover:bg-slate-100 hover:text-slate-800
              focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
            `}
          >
            <span className="text-cyan-500" aria-hidden="true">
              {action.icon}
            </span>
            <div className="flex-1 text-left">
              <div className="font-medium">{action.label}</div>
              <div className="text-[10px] text-slate-400">{action.description}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Emergency contact */}
      <div className="px-3 py-2 border-t border-slate-100 mt-2">
        <p className="text-[10px] text-slate-400 text-center">
          Need immediate help?{' '}
          <button
            type="button"
            aria-describedby={QUICK_SUPPORT_ACTION_STATUS_ID}
            onFocus={() =>
              setSupportActionStatus('Urgent support contact path is ready from quick support.')
            }
            onClick={() => {
              setSupportActionStatus('Urgent support contact path is ready from quick support.');
              handleUrgentSupport();
            }}
            className="text-cyan-500 hover:text-cyan-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
          >
            Contact support
          </button>
        </p>
      </div>
    </div>
  );
};

export default QuickSupport;
