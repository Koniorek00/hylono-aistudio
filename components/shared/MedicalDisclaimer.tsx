import React from 'react';
import { AlertCircle, Shield, Info, FileCheck } from 'lucide-react';
import {
  disclaimers,
  DisclaimerType,
  MDR_COMPLIANCE_STATEMENT,
  CITATION_DISCLAIMER,
  DISCLAIMER_CONTEXTS
} from '../../content/disclaimers';

interface MedicalDisclaimerProps {
  /** Type of disclaimer from content/disclaimers.ts */
  type?: DisclaimerType;
  /** Override text for custom disclaimers */
  customText?: string;
  /** Compact inline version for tight spaces */
  compact?: boolean;
  /** Variant style */
  variant?: 'default' | 'warning' | 'info' | 'compliance' | 'dark';
  /** Show MDR compliance statement */
  showMdrStatement?: boolean;
  /** Show citation disclaimer */
  showCitationDisclaimer?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Centralized medical disclaimer component for consistent compliance across the app.
 * Uses disclaimers from content/disclaimers.ts as the single source of truth.
 *
 * @example
 * // Default general disclaimer
 * <MedicalDisclaimer />
 *
 * @example
 * // Product page disclaimer
 * <MedicalDisclaimer type="pdp" />
 *
 * @example
 * // Compact inline version
 * <MedicalDisclaimer compact />
 *
 * @example
 * // Compliance variant with MDR statement
 * <MedicalDisclaimer type="ceMark" variant="compliance" showMdrStatement />
 *
 * @example
 * // Research context with citation disclaimer
 * <MedicalDisclaimer type="research" showCitationDisclaimer />
 */
export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  type = 'general',
  customText,
  compact = false,
  variant = 'default',
  showMdrStatement = false,
  showCitationDisclaimer = false,
  className = '',
}) => {
  const text = customText || disclaimers[type];

  // Style variants
  const variantStyles = {
    default: 'border-amber-200 bg-amber-50',
    warning: 'border-red-200 bg-red-50',
    info: 'border-cyan-300/25 bg-cyan-300/10',
    compliance: 'border-emerald-200 bg-emerald-50',
    dark: 'border-white/10 bg-slate-950/65 shadow-xl shadow-slate-950/20',
  };

  const iconStyles = {
    default: 'text-amber-500',
    warning: 'text-red-500',
    info: 'text-cyan-300',
    compliance: 'text-emerald-500',
    dark: 'text-cyan-300',
  };

  const textStyles = {
    default: 'text-amber-800',
    warning: 'text-red-800',
    info: 'text-cyan-100',
    compliance: 'text-emerald-800',
    dark: 'text-slate-200',
  };

  const dividerStyles = {
    default: 'border-t border-current/10',
    warning: 'border-t border-current/10',
    info: 'border-t border-current/10',
    compliance: 'border-t border-current/10',
    dark: 'border-t border-cyan-300/15',
  };

  const mdrTextStyles = {
    default: 'text-slate-600',
    warning: 'text-slate-600',
    info: 'text-slate-600',
    compliance: 'text-slate-600',
    dark: 'text-slate-300',
  };

  const fileCheckIconStyles = {
    default: 'text-emerald-500',
    warning: 'text-emerald-500',
    info: 'text-emerald-500',
    compliance: 'text-emerald-500',
    dark: 'text-emerald-300',
  };

  const citationTextStyles = {
    default: 'text-slate-500',
    warning: 'text-slate-500',
    info: 'text-slate-500',
    compliance: 'text-slate-500',
    dark: 'text-slate-400',
  };

  const Icon = variant === 'compliance' ? Shield : variant === 'info' ? Info : AlertCircle;

  if (compact) {
    return (
      <p className={`text-xs text-slate-400 italic leading-relaxed ${className}`}>
        {text}
      </p>
    );
  }

  return (
    <div
      className={`rounded-lg border ${variantStyles[variant]} p-4 ${className}`}
      role="note"
      aria-label="Medical disclaimer"
    >
      <div className="flex items-start gap-3">
        <Icon
          size={16}
          className={`${iconStyles[variant]} shrink-0 mt-0.5`}
          aria-hidden="true"
        />
        <div className="flex-1">
          <p className={`text-xs ${textStyles[variant]} leading-relaxed`}>
            {text}
          </p>

          {/* MDR Compliance Statement */}
          {showMdrStatement && (
            <div className={`mt-3 pt-3 ${dividerStyles[variant]}`}>
              <p className={`text-xs ${mdrTextStyles[variant]} leading-relaxed flex items-start gap-2`}>
                <FileCheck size={12} className={`${fileCheckIconStyles[variant]} shrink-0 mt-0.5`} />
                {MDR_COMPLIANCE_STATEMENT}
              </p>
            </div>
          )}

          {/* Citation Disclaimer */}
          {showCitationDisclaimer && (
            <div className={`mt-3 pt-3 ${dividerStyles[variant]}`}>
              <p className={`text-xs ${citationTextStyles[variant]} leading-relaxed`}>
                {CITATION_DISCLAIMER}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Short inline disclaimer for cards and mobile views
 */
export const ShortDisclaimer: React.FC<{ className?: string }> = ({ className }) => (
  <span className={`text-xs text-slate-400 italic ${className}`}>
    {disclaimers.short}
  </span>
);

/**
 * MDR documentation status badge for product pages.
 */
export const MdrComplianceBadge: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={`inline-flex items-center gap-2 rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 ${className}`}
    role="status"
  >
    <FileCheck size={12} className="text-amber-200" />
    <span className="text-xs font-semibold uppercase tracking-wide text-amber-100">
      MDR status requires product documentation
    </span>
  </div>
);

// Export disclaimer types and constants for external use
export type { DisclaimerType };
export { disclaimers, DISCLAIMER_CONTEXTS, MDR_COMPLIANCE_STATEMENT, CITATION_DISCLAIMER };
