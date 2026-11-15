'use client';

import { useState, useEffect } from 'react';
import { HelpCenterPage } from '@/components/HelpCenterPage';

type HelpTab = 'faq' | 'contact' | 'support';

export function HelpClient({
  hideIntro = false,
  initialTab,
  tablistId,
}: {
  hideIntro?: boolean;
  initialTab: HelpTab;
  tablistId?: string;
}) {
  const [activeTab, setActiveTab] = useState<HelpTab>(initialTab);
  const [isOpen, setIsOpen] = useState(initialTab === 'contact' || initialTab === 'support');

  useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab === 'contact' || initialTab === 'support') {
      setIsOpen(true);
    }
  }, [initialTab]);

  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash.includes('help-center-tabs')) {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab === 'contact' || tab === 'support') {
          setActiveTab(tab as HelpTab);
          setIsOpen(true);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (!isOpen) {
    return (
      <div id={tablistId} className="sr-only" aria-hidden="true">
        {/* Anchor point for #help-center-tabs */}
      </div>
    );
  }

  return (
    <div id={tablistId} className="border-t border-slate-200/80 bg-slate-950">
      <HelpCenterPage initialTab={activeTab} hideIntro={hideIntro} tablistId={tablistId} />
    </div>
  );
}
