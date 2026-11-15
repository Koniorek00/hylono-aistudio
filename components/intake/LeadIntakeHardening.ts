// Lead Intake Spam Defense and Validation Hardening
export interface LeadIntakePayload {
  name: string;
  email: string;
  phone?: string;
  modalityInterest: string;
  notes?: string;
  honeypot?: string;
  clientTimestamp: number;
}

export interface IntakeValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  isSpam: boolean;
}

export function validateLeadIntake(payload: LeadIntakePayload): IntakeValidationResult {
  const errors: Record<string, string> = {};
  
  // 1. Honeypot check (must be empty)
  if (payload.honeypot && payload.honeypot.trim().length > 0) {
    return { valid: false, errors: { form: 'Invalid submission' }, isSpam: true };
  }

  // 2. Submission speed check (must take at least 2 seconds)
  const elapsedMs = Date.now() - payload.clientTimestamp;
  if (elapsedMs < 1500) {
    return { valid: false, errors: { form: 'Submission too rapid' }, isSpam: true };
  }

  // 3. Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!payload.email || !emailRegex.test(payload.email)) {
    errors.email = 'Please provide a valid email address';
  }

  // 4. Name required
  if (!payload.name || payload.name.trim().length < 2) {
    errors.name = 'Name must contain at least 2 characters';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    isSpam: false
  };
}
