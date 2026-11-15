'use client';

import React, { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';
import { motion } from 'motion/react';

interface HomeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookDemo: () => void;
}

export const PREVIEW_DEMO_MODAL_ACTION_STATUS_ID = 'preview-demo-modal-action-status';
const PREVIEW_DEMO_MODAL_ACTION_STATUS_LABEL = 'Preview demo modal action status';
const PREVIEW_DEMO_MODAL_READY_STATUS = 'Guided walkthrough modal actions are ready.';

export const HomeDemoModal: React.FC<HomeDemoModalProps> = ({
  isOpen,
  onClose,
  onBookDemo,
}) => {
  const [actionStatus, setActionStatus] = useState(PREVIEW_DEMO_MODAL_READY_STATUS);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setActionStatus(PREVIEW_DEMO_MODAL_READY_STATUS);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActionStatus('Closing guided walkthrough from the keyboard.');
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 px-4 pb-4 pt-24 sm:items-center sm:p-4"
      onClick={() => {
        setActionStatus('Closing guided walkthrough from the backdrop.');
        onClose();
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-modal-title"
        className="relative w-full max-w-lg overflow-hidden rounded-lg border border-white/10 bg-slate-900 p-10 text-center"
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          type="button"
          aria-describedby={PREVIEW_DEMO_MODAL_ACTION_STATUS_ID}
          onFocus={() => {
            setActionStatus('Close guided walkthrough button is ready.');
          }}
          onClick={() => {
            setActionStatus('Closing guided walkthrough.');
            onClose();
          }}
          className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.10] text-white transition-colors hover:bg-white/[0.20]"
          aria-label="Close demo modal"
        >
          <X size={20} />
        </button>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-cyan-500/10">
          <Play className="text-cyan-400" size={28} />
        </div>
        <h3 id="demo-modal-title" className="text-xl font-bold text-white mb-3 futuristic-font">
          Guided Walkthrough
        </h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Request a guided Hylono walkthrough focused on access paths, device fit, protocol
          context, and the support questions to resolve before a purchase or rental decision.
        </p>
        <p
          id={PREVIEW_DEMO_MODAL_ACTION_STATUS_ID}
          aria-label={PREVIEW_DEMO_MODAL_ACTION_STATUS_LABEL}
          aria-live="polite"
          aria-atomic="true"
          role="status"
          className="sr-only"
        >
          {actionStatus}
        </p>
        <button
          type="button"
          aria-describedby={PREVIEW_DEMO_MODAL_ACTION_STATUS_ID}
          onFocus={() => {
            setActionStatus('Request guided walkthrough button is ready.');
          }}
          onClick={() => {
            setActionStatus('Requesting a guided walkthrough.');
            onBookDemo();
          }}
          className="w-full rounded-lg bg-cyan-500 py-4 text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-cyan-400"
        >
          Request Guided Walkthrough
        </button>
        <button
          type="button"
          aria-describedby={PREVIEW_DEMO_MODAL_ACTION_STATUS_ID}
          onFocus={() => {
            setActionStatus('Maybe later button is ready.');
          }}
          onClick={() => {
            setActionStatus('Closing guided walkthrough for later.');
            onClose();
          }}
          className="mt-3 w-full py-3 text-slate-500 text-xs hover:text-slate-300 transition-colors"
        >
          Maybe later
        </button>
      </motion.div>
    </div>
  );
};
