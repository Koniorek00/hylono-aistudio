'use client';

import { openCookieSettings } from '@/src/lib/cookie-consent';
import {
  announceLegalPolicyRouteActionStatus,
  LEGAL_POLICY_ROUTE_ACTION_STATUS_ID,
} from '@/components/legal/LegalPolicyTrackedLink';

type LegalPolicyCookieSettingsSource = 'quick_actions' | 'privacy_choices' | 'cookie_manage';

interface LegalPolicyCookieSettingsButtonProps {
  className: string;
  label?: string;
  source: LegalPolicyCookieSettingsSource;
}

const getCookieSettingsStatusMessage = (source: LegalPolicyCookieSettingsSource) => {
  if (source === 'privacy_choices') {
    return 'Opening cookie settings from privacy choices.';
  }

  if (source === 'cookie_manage') {
    return 'Opening cookie settings from cookie policy page.';
  }

  return 'Opening cookie settings from legal policy quick actions.';
};

export function LegalPolicyCookieSettingsButton({
  className,
  label = 'Cookie Settings',
  source,
}: LegalPolicyCookieSettingsButtonProps) {
  const statusMessage = getCookieSettingsStatusMessage(source);

  const announceCookieSettings = () => {
    announceLegalPolicyRouteActionStatus(statusMessage);
  };

  const handleClick = () => {
    announceCookieSettings();
    openCookieSettings();
  };

  return (
    <button
      type="button"
      className={className}
      aria-describedby={LEGAL_POLICY_ROUTE_ACTION_STATUS_ID}
      onFocus={announceCookieSettings}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}
