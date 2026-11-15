/**
 * SmartMessageInput
 * Enhanced message input with step-based flow:
 * Step 1: Add Product(s)
 * Step 2: Choose Inquiry Type
 *
 * Features smooth animations and undo capability
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Variants } from 'motion/react';
import {
  MessageSquare, Package, BookOpen, Target, X, Plus,
  Send, Check, ArrowLeft
} from 'lucide-react';
import { ProductProtocolBrowser, SelectedItem } from './ProductProtocolBrowser';
import { QUICK_TAGS, TAG_COLOR_CLASSES, MESSAGE_TEMPLATES } from '../utils/messageSuggestions';

export const SMART_MESSAGE_INPUT_ACTION_STATUS_ID = 'smart-message-input-action-status';
const SMART_MESSAGE_INPUT_ACTION_STATUS_LABEL = 'Smart message input action status';
const SMART_MESSAGE_INPUT_READY_STATUS =
  'Smart message input ready. Add products before choosing an inquiry type.';

const DEFAULT_TAG_COLORS = TAG_COLOR_CLASSES.slate ?? {
  bg: 'bg-white/[0.045]',
  text: 'text-slate-200',
  border: 'border-white/10',
  hover: 'hover:bg-white/[0.08] hover:border-cyan-300/50',
};

const DARK_TAG_COLOR_CLASSES: typeof TAG_COLOR_CLASSES = {
  emerald: {
    bg: 'bg-emerald-300/10',
    text: 'text-emerald-100',
    border: 'border-emerald-300/30',
    hover: 'hover:bg-emerald-300/15 hover:border-emerald-300/50',
  },
  blue: {
    bg: 'bg-blue-300/10',
    text: 'text-blue-100',
    border: 'border-blue-300/30',
    hover: 'hover:bg-blue-300/15 hover:border-blue-300/50',
  },
  violet: {
    bg: 'bg-violet-300/10',
    text: 'text-violet-100',
    border: 'border-violet-300/30',
    hover: 'hover:bg-violet-300/15 hover:border-violet-300/50',
  },
  cyan: {
    bg: 'bg-cyan-300/10',
    text: 'text-cyan-100',
    border: 'border-cyan-300/30',
    hover: 'hover:bg-cyan-300/15 hover:border-cyan-300/50',
  },
  amber: {
    bg: 'bg-amber-300/10',
    text: 'text-amber-100',
    border: 'border-amber-300/30',
    hover: 'hover:bg-amber-300/15 hover:border-amber-300/50',
  },
  rose: {
    bg: 'bg-rose-300/10',
    text: 'text-rose-100',
    border: 'border-rose-300/30',
    hover: 'hover:bg-rose-300/15 hover:border-rose-300/50',
  },
  orange: {
    bg: 'bg-orange-300/10',
    text: 'text-orange-100',
    border: 'border-orange-300/30',
    hover: 'hover:bg-orange-300/15 hover:border-orange-300/50',
  },
  slate: DEFAULT_TAG_COLORS,
};

interface SmartMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSend?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

// Smooth spring animation variants
const slideVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 0.8
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 0.8
    }
  }
};

const fadeVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15, ease: 'easeIn' }
  }
};

type Step = 'products' | 'inquiry';

export const SmartMessageInput: React.FC<SmartMessageInputProps> = ({
  value,
  onChange,
  placeholder = "Type your message...",
  onSend,
  isSubmitting = false,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('products');
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]); // For undo
  const [actionStatus, setActionStatus] = useState(SMART_MESSAGE_INPUT_READY_STATUS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formatSelectedItemCount = (count = selectedItems.length) =>
    `${count} item${count === 1 ? '' : 's'} selected`;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Save current message to history before changing
  const saveToHistory = () => {
    setMessageHistory(prev => [...prev, value]);
  };

  // Undo last message change
  const handleUndo = () => {
    if (messageHistory.length > 0) {
      const previousMessage = messageHistory[messageHistory.length - 1];
      setMessageHistory(prev => prev.slice(0, -1));
      onChange(previousMessage ?? '');
      setActionStatus('Restored the previous smart message draft.');
    }
  };

  const handleToggleBrowser = () => {
    setShowBrowser((previous) => {
      const nextState = !previous;
      setActionStatus(
        nextState
          ? 'Product browser opened. Search or choose products, protocols, and goals.'
          : `Product browser closed. ${formatSelectedItemCount()}.`
      );
      return nextState;
    });
  };

  const handleBrowserClose = () => {
    setShowBrowser(false);
    setActionStatus(`Product browser closed. ${formatSelectedItemCount()}.`);
  };

  // Handle product/protocol selection
  const handleItemSelect = (item: SelectedItem) => {
    const exists = selectedItems.some(i => i.id === item.id && i.type === item.type);
    const nextCount = exists ? selectedItems.length - 1 : selectedItems.length + 1;

    setSelectedItems(prev => {
      if (exists) {
        return prev.filter(i => !(i.id === item.id && i.type === item.type));
      }
      return [...prev, item];
    });
    setActionStatus(
      `${item.title} ${exists ? 'removed from' : 'added to'} the message context. ${formatSelectedItemCount(nextCount)}.`
    );
  };

  // Remove selected item
  const handleRemoveItem = (item: SelectedItem) => {
    setSelectedItems(prev => prev.filter(i => !(i.id === item.id && i.type === item.type)));
    setActionStatus(
      `${item.title} removed from the message context. ${formatSelectedItemCount(Math.max(selectedItems.length - 1, 0))}.`
    );
  };

  // Go to inquiry step
  const goToInquiry = () => {
    setCurrentStep('inquiry');
    setShowBrowser(false);
    setActionStatus(`Inquiry step ready. ${formatSelectedItemCount()}.`);
  };

  // Go back to products step
  const goToProducts = () => {
    setCurrentStep('products');
    setActionStatus(`Product step ready. ${formatSelectedItemCount()}.`);
  };

  // Handle inquiry type selection
  const handleInquirySelect = (templateId: string) => {
    const template = MESSAGE_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    saveToHistory(); // Save for undo

    const productNames = selectedItems
      .filter(item => item.type === 'products')
      .map(item => item.title)
      .join(' and ');

    let message = template.template;
    if (productNames) {
      message = message.replace(/\[PRODUCT[ A-Z]*\]/gi, productNames);
    }

    const newMessage = value.trim()
      ? `${value}\n\n${message}`
      : message;

    onChange(newMessage);
    setActionStatus(`${template.label} template inserted into the smart message draft.`);
    textareaRef.current?.focus();
  };

  // Handle quick tag selection
  const handleTagClick = (tagId: string) => {
    const tag = QUICK_TAGS.find(t => t.id === tagId);
    if (!tag) return;

    saveToHistory(); // Save for undo

    const productNames = selectedItems
      .filter(item => item.type === 'products')
      .map(item => item.title)
      .join(', ');

    let message = tag.defaultMessage;
    if (productNames) {
      message += productNames;
    }

    const newMessage = value.trim()
      ? `${value}\n\n${message}`
      : message;

    onChange(newMessage);
    setActionStatus(`${tag.label} quick tag inserted into the smart message draft.`);
    textareaRef.current?.focus();
  };

  // Insert product reference at cursor
  const insertProductAtCursor = (item: SelectedItem) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    saveToHistory();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    const insertion = `[${item.title}] `;
    const newValue = textBefore + insertion + textAfter;

    onChange(newValue);
    setActionStatus(`${item.title} inserted into the smart message draft.`);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + insertion.length;
      textarea.focus();
    }, 0);
  };

  // Get icon for item type
  const getItemIcon = (type: SelectedItem['type']) => {
    switch (type) {
      case 'products': return Package;
      case 'protocols': return BookOpen;
      case 'goals': return Target;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <p
        id={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={SMART_MESSAGE_INPUT_ACTION_STATUS_LABEL}
        className="sr-only"
      >
        {actionStatus}
      </p>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            currentStep === 'products'
              ? 'bg-cyan-300 text-slate-950'
              : 'bg-white/10 text-slate-400'
          }`}>
            {currentStep === 'inquiry' ? <Check size={14} /> : '1'}
          </div>
          <span className={`text-xs font-semibold transition-colors ${
            currentStep === 'products' ? 'text-cyan-200' : 'text-slate-400'
          }`}>
            Add Product
          </span>
        </div>

        <div className="h-px flex-1 bg-white/10" />

        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
            currentStep === 'inquiry'
              ? 'bg-cyan-300 text-slate-950'
              : 'bg-white/10 text-slate-400'
          }`}>
            2
          </div>
          <span className={`text-xs font-semibold transition-colors ${
            currentStep === 'inquiry' ? 'text-cyan-200' : 'text-slate-400'
          }`}>
            Inquiry
          </span>
        </div>
      </div>

      {/* Selected Items Display */}
      {selectedItems.length > 0 && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-white/[0.045] p-3"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 w-full mb-1">
            Selected items (click to insert into message):
          </span>
          {selectedItems.map((item) => {
            const Icon = getItemIcon(item.type);
            const colorClasses = {
              products: 'bg-cyan-300/10 text-cyan-100 border-cyan-300/30 hover:bg-cyan-300/15',
              protocols: 'bg-violet-300/10 text-violet-100 border-violet-300/30 hover:bg-violet-300/15',
              goals: 'bg-emerald-300/10 text-emerald-100 border-emerald-300/30 hover:bg-emerald-300/15',
            };

            return (
              <motion.span
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${colorClasses[item.type]}`}
              >
                <button
                  type="button"
                  onClick={() => insertProductAtCursor(item)}
                  aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
                  className="inline-flex items-center gap-1.5"
                >
                  <Icon size={12} />
                  {item.title}
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item)}
                  aria-label={`Remove ${item.title} from message context`}
                  aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
                  className="ml-1 rounded p-0.5 hover:bg-black/10"
                >
                  <X size={10} />
                </button>
              </motion.span>
            );
          })}
        </motion.div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'products' && (
          <motion.div
            key="products-step"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Add Product Button */}
            <button
              type="button"
              onClick={handleToggleBrowser}
              aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
              className={`mb-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 text-sm font-semibold transition-all ${
                showBrowser || selectedItems.length > 0
                  ? 'border-cyan-300 bg-cyan-300/10 text-cyan-100'
                  : 'border-white/10 bg-white/[0.035] text-slate-300 hover:border-cyan-300/50 hover:bg-white/[0.08] hover:text-cyan-100'
              }`}
            >
              <Plus size={18} />
              {selectedItems.length > 0 ? 'Add More Products' : 'Add Product(s)'}
            </button>

            {/* Product Browser */}
            <AnimatePresence>
              {showBrowser && (
                <motion.div
                  key="browser"
                  variants={fadeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="mb-3"
                >
                  <ProductProtocolBrowser
                    isOpen={showBrowser}
                    onClose={handleBrowserClose}
                    onSelect={handleItemSelect}
                    selectedItems={selectedItems}
                    multiSelect={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continue to Inquiry Button */}
            {selectedItems.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                type="button"
                onClick={goToInquiry}
                aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-200 hover:shadow-lg hover:shadow-cyan-500/20"
              >
                Continue to Inquiry
                <Check size={16} />
              </motion.button>
            )}
          </motion.div>
        )}

        {currentStep === 'inquiry' && (
          <motion.div
            key="inquiry-step"
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Back Button */}
            <button
              type="button"
              onClick={goToProducts}
              aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
              className="mb-3 flex items-center gap-1 text-xs text-slate-300 transition-colors hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to products
            </button>

            {/* Inquiry Type Selection */}
            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold text-slate-300">What would you like to know?</p>
              <div className="grid grid-cols-2 gap-2">
                {MESSAGE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleInquirySelect(template.id)}
                    aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
                    className="group rounded-lg border border-white/10 bg-white/[0.045] p-3 text-left transition-all hover:border-cyan-300/50 hover:bg-white/[0.08]"
                  >
                    <p className="text-xs font-semibold text-slate-100 group-hover:text-cyan-200">{template.label}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{template.template}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tags */}
            <div className="mb-3">
              <p className="mb-2 text-xs font-semibold text-slate-300">Or use a quick tag:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.slice(0, 5).map((tag) => {
                  const colors = DARK_TAG_COLOR_CLASSES[tag.color] ?? DEFAULT_TAG_COLORS;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagClick(tag.id)}
                      aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${colors.bg} ${colors.text} ${colors.border} ${colors.hover}`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input Area */}
      <div className="relative mt-4">
        <div className="flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.045] p-3 transition-all focus-within:border-cyan-300 focus-within:ring-2 focus-within:ring-cyan-300/20">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={4}
            aria-label="Message details"
            aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
            className="min-h-[100px] flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            disabled={isSubmitting}
          />

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 self-end">
            {/* Undo Button - Only show if there's history */}
            {messageHistory.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                aria-label="Undo last smart message action"
                aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
                className="rounded-lg p-2 text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
                title="Undo last action"
              >
                <ArrowLeft size={16} />
              </button>
            )}

            {/* Send Button */}
            {onSend && (
              <button
                type="button"
                onClick={onSend}
                disabled={isSubmitting || !value.trim()}
                aria-label={isSubmitting ? 'Sending message' : 'Send message'}
                aria-busy={isSubmitting}
                aria-describedby={SMART_MESSAGE_INPUT_ACTION_STATUS_ID}
                className="rounded-lg bg-cyan-300 p-2.5 text-slate-950 transition-all hover:bg-cyan-200 hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <svg aria-hidden="true" className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <Send size={16} aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper Text */}
      <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
        <MessageSquare size={10} />
        {currentStep === 'products'
          ? 'Add products first, then choose your inquiry type.'
          : 'Click a template or type your own message. Use ← to undo.'}
      </p>
    </div>
  );
};

export default SmartMessageInput;
