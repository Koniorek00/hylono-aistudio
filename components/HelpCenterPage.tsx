/**
 * HelpCenterPage
 * Unified help center consolidating Support, FAQ, and Contact pages.
 *
 * Tabs:
 *  1. FAQ — Searchable knowledge base
 *  2. Contact — Contact wizard + callback scheduler
 *  3. Device Support — Device scanner + enterprise support
 *
 * Route: /help
 * Redirects: /support, /faq, /contact → /help with tab anchors
 */

import React, { useActionState, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
    HelpCircle, ChevronDown, Search, MessageCircle, Mail, Phone, MapPin,
    Send, Clock, AlertTriangle, ChevronRight, ChevronLeft, Calendar,
    Shield, ArrowRight, Users, Wrench, BookOpen, Package, Target
} from 'lucide-react';
import { SmartText } from './SmartText';
import { MedicalDisclaimer } from './shared/MedicalDisclaimer';
import { HELP_FAQ_DATA } from '@/content/help-faq';
import { siteEntity } from '@/content/site-entity';
import {
    createCallbackRequestNote,
    upsertCallbackRequestNote,
} from '@/lib/callback-request';
import { DeviceScanner } from './support/DeviceScanner';
import { getCSRFToken, validateCSRFToken } from '../utils/csrf';
import { SmartMessageInput } from './SmartMessageInput';
import { SelectedItem } from './ProductProtocolBrowser';
import { submitContactFormAction, type FormActionResult } from '../src/actions/formActions';
import { HoneypotField } from './shared/HoneypotField';
import { TurnstileWidget } from './shared/TurnstileWidget';
import { FAQTab } from './help/FAQTab';
import { SupportTab } from './help/SupportTab';

// ─────────────────────────────────────────────────────────────────────────────
// FAQ DATA
// ─────────────────────────────────────────────────────────────────────────────

const FAQ_DATA = HELP_FAQ_DATA;

// ─────────────────────────────────────────────────────────────────────────────
// TAB CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

type TabId = 'faq' | 'contact' | 'support';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={18} /> },
    { id: 'contact', label: 'Contact', icon: <Mail size={18} /> },
    { id: 'support', label: 'Device Support', icon: <Wrench size={18} /> },
];

const HELP_CONTACT_SUBMIT_STATUS_ID = 'help-contact-submit-status';
const HELP_CONTACT_SUBMIT_ERROR_ID = 'help-contact-submit-error';
const HELP_FAQ_SEARCH_HELP_ID = 'help-faq-search-help';
const HELP_FAQ_SEARCH_STATUS_ID = 'help-faq-search-status';
const HELP_FAQ_SEARCH_STATUS_LABEL = 'FAQ search result status';
const HELP_TAB_ACTION_STATUS_ID = 'help-tab-action-status';
const HELP_FAQ_ACCORDION_STATUS_ID = 'help-faq-accordion-status';
const HELP_CONTACT_FLOW_STATUS_ID = 'help-contact-flow-status';
const HELP_SUPPORT_LINK_STATUS_ID = 'help-support-link-status';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface HelpCenterPageProps {
    initialTab?: TabId;
    hideIntro?: boolean;
    tablistId?: string;
}

export const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ initialTab = 'faq', hideIntro = false, tablistId = 'faq-library' }) => {
    const [activeTab, setActiveTab] = useState<TabId>(initialTab);
    const [tabActionStatus, setTabActionStatus] = useState('FAQ tab selected.');

    useEffect(() => {
        setActiveTab(initialTab);
        const initialTabLabel = TABS.find((tab) => tab.id === initialTab)?.label ?? 'FAQ';
        setTabActionStatus(`${initialTabLabel} tab selected.`);
    }, [initialTab]);

    const selectHelpTab = (tab: TabId) => {
        const tabLabel = TABS.find((item) => item.id === tab)?.label ?? 'Help';
        setActiveTab(tab);
        setTabActionStatus(`${tabLabel} tab selected.`);
    };

    return (
        <div
            data-testid="help-center-surface"
            className={`min-h-screen bg-slate-950 pb-24 text-white ${hideIntro ? 'pt-0' : 'pt-6 md:pt-8'}`}
        >
            <div className="max-w-6xl mx-auto px-6">
                {/* Hero Header */}
                {!hideIntro && (
                    <motion.div
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <motion.div
                            initial={false}
                            animate={{ opacity: 1 }}
                            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-100"
                        >
                            <Shield size={12} /> {siteEntity.supportCoverageLabel}
                        </motion.div>
                        <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl futuristic-font">
                            Help Center
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-slate-300">
                            Find answers, request support, and connect with the Hylono team for product, logistics, and protocol planning questions.
                        </p>
                    </motion.div>
                )}

                {/* Tab Navigation */}
                <div id={tablistId} className={`flex justify-center mb-12 scroll-mt-28 ${hideIntro ? 'pt-12' : ''}`}>
                    <div role="tablist" aria-label="Help center sections" className="inline-flex rounded-lg border border-white/10 bg-white/[0.045] p-1.5">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`tabpanel-${tab.id}`}
                                aria-describedby={HELP_TAB_ACTION_STATUS_ID}
                                id={`tab-${tab.id}`}
                                onClick={() => selectHelpTab(tab.id)}
                                className={`flex min-h-11 items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 ${activeTab === tab.id
                                        ? 'bg-cyan-300 text-slate-950'
                                        : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <p
                        id={HELP_TAB_ACTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label="Help tab action status"
                        className="sr-only"
                    >
                        {tabActionStatus}
                    </p>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'faq' && (
                        <div role="tabpanel" id="tabpanel-faq" aria-labelledby="tab-faq">
                            <FAQTab
                                key="faq"
                                onOpenContact={() => {
                                    selectHelpTab('contact');
                                    const focusContactTab = () => {
                                        document.getElementById('tab-contact')?.focus();
                                    };

                                    if (typeof requestAnimationFrame === 'function') {
                                        requestAnimationFrame(focusContactTab);
                                    } else {
                                        focusContactTab();
                                    }
                                }}
                            />
                        </div>
                    )}
                    {activeTab === 'contact' && (
                        <div role="tabpanel" id="tabpanel-contact" aria-labelledby="tab-contact">
                            <ContactTab key="contact" />
                        </div>
                    )}
                    {activeTab === 'support' && (
                        <div role="tabpanel" id="tabpanel-support" aria-labelledby="tab-support">
                            <SupportTab key="support" />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};



// ─────────────────────────────────────────────────────────────────────────────
// CONTACT TAB
// ─────────────────────────────────────────────────────────────────────────────

const ContactTab: React.FC = () => {
    const [formStep, setFormStep] = useState(1);
    const [userType, setUserType] = useState<'owner' | 'clinic' | 'curious' | null>(null);
    const [contactFlowStatus, setContactFlowStatus] = useState('Choose a help path to continue.');
    const [formData, setFormData] = useState({
        name: '', email: '', subject: '', message: '',
        serialNumber: '', clinicName: '', monthlySessionCount: '', interest: '', csrfToken: ''
    });
    const [csrfTokenError, setCsrfTokenError] = useState(false);
    const [showEmergencyModal, setShowEmergencyModal] = useState(false);
    const [showCallbackModal, setShowCallbackModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [callbackNotice, setCallbackNotice] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const shouldReduceMotion = useReducedMotion();
    const [contactActionState, contactFormAction, contactPending] = useActionState<FormActionResult, FormData>(
        submitContactFormAction,
        { success: false, message: '' }
    );
    const helpContactSubmitStatusMessage = contactPending
        ? 'Sending your help request.'
        : 'Ready to send your help request.';
    const helpContactFormDescriptionIds = submitError
        ? `${HELP_CONTACT_SUBMIT_STATUS_ID} ${HELP_CONTACT_SUBMIT_ERROR_ID}`
        : HELP_CONTACT_SUBMIT_STATUS_ID;

    const selectUserHelpPath = (nextUserType: 'owner' | 'clinic' | 'curious', label: string) => {
        setUserType(nextUserType);
        setFormStep(2);
        setContactFlowStatus(`${label} help path selected. Step 2 is ready.`);
    };

    const openDirectMessageStep = () => {
        setUserType(null);
        setFormStep(3);
        setContactFlowStatus('Direct message form opened.');
    };

    const openContactDetailsStep = () => {
        setFormStep(3);
        setContactFlowStatus('Contact details step opened.');
    };

    const returnToPreviousContactStep = () => {
        if (formStep === 3 && userType === null) {
            setFormStep(1);
            setContactFlowStatus('Returned to help path selection.');
            return;
        }

        setFormStep(prev => Math.max(1, prev - 1));
        setContactFlowStatus(`Returned to step ${Math.max(1, formStep - 1)}.`);
    };

    const openCallbackScheduler = () => {
        setShowCallbackModal(true);
        setContactFlowStatus('Callback scheduler opened.');
    };

    const closeCallbackScheduler = () => {
        setShowCallbackModal(false);
        setContactFlowStatus('Callback scheduler closed.');
    };

    const selectCallbackDate = (date: Date) => {
        setSelectedDate(date);
        setContactFlowStatus(`Callback date selected: ${formatCallbackDateLabel(date)}.`);
    };

    const returnToCallbackDates = () => {
        setSelectedDate(null);
        setContactFlowStatus('Returned to callback date selection.');
    };

    const dismissEmergencyWarning = () => {
        setShowEmergencyModal(false);
        setContactFlowStatus('Emergency warning acknowledged.');
    };

    const getContactInfoLinkStatusProps = (message: string) => ({
        'aria-describedby': HELP_CONTACT_FLOW_STATUS_ID,
        onClick: () => setContactFlowStatus(message),
        onFocus: () => setContactFlowStatus(message),
    });

    useEffect(() => {
        const token = getCSRFToken();
        setFormData(prev => ({ ...prev, csrfToken: token }));
    }, []);

    useEffect(() => {
        const keywords = ['pain', 'heart', 'emergency', 'stroke', 'bleeding', 'unconscious', 'chest'];
        const messageLower = formData.message.toLowerCase();
        if (keywords.some(keyword => messageLower.includes(keyword))) {
            setShowEmergencyModal(true);
        }
    }, [formData.message]);

    useEffect(() => {
        if (contactActionState.success) {
            setTicketId(contactActionState.ticketId ?? null);
            setSubmitted(true);
            setSubmitError(null);
            setCallbackNotice(null);
            return;
        }

        if (contactActionState.message) {
            setSubmitError(contactActionState.message);
        }
    }, [contactActionState]);

    const handleSubmitValidation = (e: React.FormEvent<HTMLFormElement>) => {
        const storedToken = getCSRFToken();
        if (!validateCSRFToken(formData.csrfToken, storedToken)) {
            setCsrfTokenError(true);
            e.preventDefault();
            return;
        }

        setCsrfTokenError(false);
        setSubmitError(null);
    };

    const getNextBusinessDays = (count: number) => {
        const days = [];
        const current = new Date();
        while (days.length < count) {
            current.setDate(current.getDate() + 1);
            if (current.getDay() !== 0 && current.getDay() !== 6) days.push(new Date(current));
        }
        return days;
    };

    const formatCallbackDateLabel = (date: Date) =>
        date.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });

    const handleCallbackSchedule = (slot: string) => {
        if (!selectedDate) {
            return;
        }

        const callbackRequestNote = createCallbackRequestNote(
            formatCallbackDateLabel(selectedDate),
            slot
        );

        setFormData((prev) => ({
            ...prev,
            subject: prev.subject || 'Callback request',
            message: upsertCallbackRequestNote(prev.message, callbackRequestNote),
        }));
        setFormStep(3);
        setShowCallbackModal(false);
        setSelectedDate(null);
        setSubmitError(null);
        setCallbackNotice(
            'Preferred callback slot added to your message. Finish the form and send it to confirm the callback request.'
        );
        setContactFlowStatus('Callback slot added. Finish the form and send it to confirm.');
    };

    return (
        <motion.div
            data-testid="help-contact-surface"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            className="text-white"
        >
            <p
                id={HELP_CONTACT_FLOW_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Help contact flow status"
                className="sr-only"
            >
                {contactFlowStatus}
            </p>

            {/* Emergency Modal */}
            <AnimatePresence>
                {showEmergencyModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
                        onClick={dismissEmergencyWarning}
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="help-emergency-modal-title"
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md rounded-lg border border-red-300/30 border-l-4 border-l-red-400 bg-slate-950 p-8 text-white"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 text-red-600 mb-4">
                                <AlertTriangle size={32} aria-hidden="true" />
                                <h3 id="help-emergency-modal-title" className="text-xl font-bold">Medical Emergency Warning</h3>
                            </div>
                            <p className="mb-6 text-slate-300">
                                It looks like you might be describing a medical emergency.
                                Hylono products are <strong>not</strong> for emergency medical use.
                            </p>
                            <div className="space-y-3">
                                <a
                                    href="tel:112"
                                    {...getContactInfoLinkStatusProps('Opening emergency phone support from the help center.')}
                                    className="block w-full rounded-lg bg-red-600 py-3 text-center font-bold text-white transition hover:bg-red-700"
                                >
                                    Call Emergency Services (112)
                                </a>
                                <button type="button" onClick={dismissEmergencyWarning} aria-describedby={HELP_CONTACT_FLOW_STATUS_ID} className="block w-full py-3 font-medium text-slate-300 transition hover:text-white">
                                    I understand, continue writing
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Callback Modal */}
            <AnimatePresence>
                {showCallbackModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                        onClick={closeCallbackScheduler}
                    >
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="help-callback-modal-title"
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                            className="w-full max-w-lg rounded-lg border border-white/10 bg-slate-950 p-8 text-white"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 id="help-callback-modal-title" className="text-2xl font-bold text-white">Schedule a Callback</h3>
                                    <p className="text-slate-400">Pick a 15-minute slot.</p>
                                </div>
                                <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-3 text-cyan-200"><Calendar size={24} /></div>
                            </div>
                            {!selectedDate ? (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">Select a Date</h4>
                                    <div className="grid gap-2">
                                        {getNextBusinessDays(5).map((date) => {
                                            const dateLabel = formatCallbackDateLabel(date);

                                            return (
                                                <button
                                                    key={date.toISOString()}
                                                    type="button"
                                                    onClick={() => selectCallbackDate(date)}
                                                    aria-describedby={HELP_CONTACT_FLOW_STATUS_ID}
                                                    className="group w-full rounded-lg border border-white/10 bg-white/[0.045] p-4 text-left transition-all hover:border-cyan-300 hover:bg-white/[0.08]"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-white group-hover:text-cyan-200">
                                                            {dateLabel}
                                                        </span>
                                                        <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-200" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <button type="button" onClick={returnToCallbackDates} aria-describedby={HELP_CONTACT_FLOW_STATUS_ID} className="mb-4 flex items-center gap-1 text-sm font-bold text-cyan-200 hover:underline">
                                        <ChevronLeft size={14} /> Back to available dates
                                    </button>
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        Select Time for {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {['09:00 AM', '09:30 AM', '10:00 AM', '11:15 AM', '01:00 PM', '02:30 PM', '03:45 PM', '04:15 PM'].map(slot => (
                                            <button key={slot} type="button" onClick={() => handleCallbackSchedule(slot)} aria-describedby={HELP_CONTACT_FLOW_STATUS_ID}
                                                className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-slate-200 transition-all hover:border-cyan-300 hover:bg-white/[0.08] hover:text-cyan-200">
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            <button type="button" onClick={closeCallbackScheduler} aria-describedby={HELP_CONTACT_FLOW_STATUS_ID} className="w-full py-3 font-medium text-slate-400 transition hover:text-white">Cancel</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Form */}
                <div className="rounded-lg border border-white/10 bg-white/[0.045] p-8">
                    {submitted ? (
                        <div
                            id={HELP_CONTACT_SUBMIT_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label="Help contact submit status"
                            className="text-center py-12"
                        >
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-emerald-300/30 bg-emerald-300/10">
                                <Send className="text-emerald-200" size={28} />
                            </div>
                            <h3 className="mb-2 text-2xl font-bold text-white">Message Sent!</h3>
                            {ticketId && <p className="mb-2 inline-block rounded-lg border border-white/10 bg-white/[0.045] px-3 py-1 font-mono text-xs text-slate-300">Ticket: {ticketId}</p>}
                            <p className="text-slate-400">Your message reached the Hylono support inbox. Replies go out by email during support hours ({siteEntity.supportHours}). Published service response window: {siteEntity.serviceResponseSummary}</p>
                        </div>
                    ) : (
                        <form
                            action={contactFormAction}
                            onSubmit={handleSubmitValidation}
                            aria-describedby={helpContactFormDescriptionIds}
                            className="h-full flex flex-col justify-between min-h-[400px]"
                        >
                            <HoneypotField />
                            <TurnstileWidget />
                            <input type="hidden" name="csrfToken" value={formData.csrfToken} />
                            <input type="hidden" name="userType" value={userType ?? ''} />
                            <input type="hidden" name="subject" value={formData.subject || `Contact from ${userType ?? 'website'}`} />
                            <input type="hidden" name="message" value={formData.message} />
                            <input type="hidden" name="serialNumber" value={formData.serialNumber} />
                            <input type="hidden" name="clinicName" value={formData.clinicName} />
                            <input type="hidden" name="monthlySessionCount" value={formData.monthlySessionCount} />
                            <input type="hidden" name="interest" value={formData.interest} />
                            {csrfTokenError && (
                                <div role="alert" className="mb-4 rounded-lg border border-red-300/30 bg-red-400/10 p-3">
                                    <p className="text-sm text-red-200">Security validation failed. Please refresh and try again.</p>
                                </div>
                            )}
                            {callbackNotice && (
                                <div role="status" aria-live="polite" aria-atomic="true" className="mb-4 rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-3">
                                    <p className="text-sm text-cyan-100">{callbackNotice}</p>
                                </div>
                            )}
                            <p
                                id={HELP_CONTACT_SUBMIT_STATUS_ID}
                                role="status"
                                aria-live="polite"
                                aria-atomic="true"
                                aria-label="Help contact submit status"
                                className="sr-only"
                            >
                                {helpContactSubmitStatusMessage}
                            </p>
                            <div className="flex gap-2 mb-8">
                                {[1, 2, 3].map(step => (
                                    <div key={step} className={`h-1 flex-1 rounded-sm transition-all duration-300 ${step <= formStep ? 'bg-cyan-300' : 'bg-white/[0.045]'}`} />
                                ))}
                            </div>

                            <div className="flex-grow">
                                <AnimatePresence mode="wait">
                                    {formStep === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                            <h3 className="mb-6 text-xl font-bold text-white">First, tell us who you are:</h3>
                                            {[
                                                { id: 'owner', label: 'I am a Device Owner', desc: 'Support for my Hylono device' },
                                                { id: 'clinic', label: 'I represent a Clinic', desc: 'Commercial inquiries & partnerships' },
                                                { id: 'curious', label: 'I am curious', desc: 'Questions about products & science' }
                                            ].map((type) => (
                                                <button key={type.id} type="button"
                                                    onClick={() => selectUserHelpPath(type.id as 'owner' | 'clinic' | 'curious', type.label)}
                                                    aria-describedby={HELP_CONTACT_FLOW_STATUS_ID}
                                                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${userType === type.id ? 'border-cyan-300 bg-cyan-300/10' : 'border-white/10 bg-white/[0.035] hover:border-cyan-300/50 hover:bg-white/[0.08]'}`}>
                                                    <div className="font-bold text-white">{type.label}</div>
                                                    <div className="text-sm text-slate-400">{type.desc}</div>
                                                </button>
                                            ))}

                                            {/* Quick Message Option - Skip directly to message form */}
                                            <div className="mt-4 border-t border-white/10 pt-4">
                                                <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 text-center">or skip the questions</p>
                                                <button
                                                    type="button"
                                                    onClick={openDirectMessageStep}
                                                    aria-describedby={HELP_CONTACT_FLOW_STATUS_ID}
                                                    className="group w-full rounded-lg border-2 border-dashed border-white/10 bg-white/[0.035] p-4 text-left transition-all hover:border-cyan-300 hover:bg-white/[0.08]"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-bold text-slate-100 group-hover:text-cyan-200">Send a message directly</div>
                                                            <div className="text-sm text-slate-400">Get personalized help without the questions</div>
                                                        </div>
                                                        <Send size={18} aria-hidden="true" className="text-slate-500 transition-colors group-hover:text-cyan-200" />
                                                    </div>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                    {formStep === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                            <h3 className="mb-4 text-xl font-bold text-white">A few details about your needs:</h3>
                                            {userType === 'owner' && (
                                                <div>
                                                    <label htmlFor="hc-serial" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Device Serial Number (Optional)</label>
                                                    <input id="hc-serial" type="text" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                                                        name="serialNumber"
                                                        className="w-full rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-white transition-all placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" placeholder="e.g. HY-2024-XXXX" />
                                                </div>
                                            )}
                                            {userType === 'clinic' && (
                                                <>
                                                    <div>
                                                        <label htmlFor="hc-clinic-name" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Clinic Name</label>
                                                        <input id="hc-clinic-name" type="text" value={formData.clinicName} onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                                                            name="clinicName"
                                                            className="w-full rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-white transition-all placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" placeholder="Your Clinic Name" />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="hc-session-count" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Approx. Monthly Client Sessions</label>
                                                        <select id="hc-session-count" value={formData.monthlySessionCount} onChange={(e) => setFormData({ ...formData, monthlySessionCount: e.target.value })}
                                                            className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20">
                                                            <option value="">Select range</option>
                                                            <option value="0-50">0 - 50</option>
                                                            <option value="51-200">51 - 200</option>
                                                            <option value="200+">200+</option>
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                            {userType === 'curious' && (
                                                <div>
                                                    <label htmlFor="hc-interest" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">I'm most interested in...</label>
                                                    <select id="hc-interest" value={formData.interest} onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                                                        name="interest"
                                                        className="w-full rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white transition-all focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20">
                                                        <option value="">Select topic</option>
                                                        <option value="hbot">Hyperbaric Oxygen (HBOT)</option>
                                                        <option value="pemf">PEMF</option>
                                                        <option value="hydrogen">Molecular Hydrogen</option>
                                                        <option value="investment">Investment Opportunities</option>
                                                    </select>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                    {formStep === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                            <h3 className="mb-4 text-xl font-bold text-white">How can we reach you?</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="hc-name" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Name</label>
                                                    <input id="hc-name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        name="name"
                                                        className="w-full rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-white transition-all placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" placeholder="Your Name" />
                                                </div>
                                                <div>
                                                    <label htmlFor="hc-email" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email</label>
                                                    <input id="hc-email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        name="email"
                                                        className="w-full rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-white transition-all placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20" placeholder="Email Address" />
                                                </div>
                                            </div>
                                            {/* Smart Message Input with Product/Protocol Browser */}
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Message</label>
                                                <SmartMessageInput
                                                    value={formData.message}
                                                    onChange={(value) => setFormData({ ...formData, message: value })}
                                                    placeholder="Tell us what you're looking for..."
                                                    isSubmitting={contactPending}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Navigation */}
                            <div className="mt-8 flex gap-4 border-t border-white/10 pt-6">
                                {formStep > 1 && (
                                    <button type="button" onClick={returnToPreviousContactStep} aria-describedby={HELP_CONTACT_FLOW_STATUS_ID}
                                        className="flex items-center gap-2 rounded-lg px-6 py-3 font-bold text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white">
                                            <ChevronLeft size={18} aria-hidden="true" /> Back
                                    </button>
                                )}
                                {formStep < 3 ? (
                                    formStep === 2 && (
                                        <button type="button" onClick={openContactDetailsStep} aria-describedby={HELP_CONTACT_FLOW_STATUS_ID}
                                            className="ml-auto flex items-center gap-2 rounded-lg bg-cyan-300 px-8 py-3 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-cyan-200">
                                            Next <ChevronRight size={18} aria-hidden="true" />
                                        </button>
                                    )
                                ) : (
                                    <>
                                        {submitError && <p id={HELP_CONTACT_SUBMIT_ERROR_ID} role="alert" className="ml-auto rounded-lg border border-red-300/30 bg-red-400/10 px-4 py-2 text-sm text-red-200">{submitError}</p>}
                                        <button type="submit" disabled={contactPending} aria-busy={contactPending} aria-describedby={helpContactFormDescriptionIds}
                                            className="ml-auto flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-8 py-3 text-xs font-bold uppercase tracking-widest text-slate-950 transition-all hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto">
                                            {contactPending ? (
                                                <><svg aria-hidden="true" className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Sending…</>
                                            ) : (<><Send size={18} aria-hidden="true" /> Send Message</>)}
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                    {[
                        { icon: Mail, label: "Email", value: siteEntity.contactEmail, href: `mailto:${siteEntity.contactEmail}`, status: 'Opening email support from the help contact panel.' },
                        { icon: MapPin, label: "Coverage", value: siteEntity.supportCoverageLabel, href: "/help", status: 'Opening help coverage details from the help contact panel.' },
                        { icon: Clock, label: "Hours", value: siteEntity.supportHours, href: `mailto:${siteEntity.contactEmail}`, status: 'Opening support hours contact path from the help contact panel.' },
                    ].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            {...getContactInfoLinkStatusProps(item.status)}
                            className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-6 transition-all hover:border-cyan-300/50 hover:bg-white/[0.08]"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045]">
                                <item.icon className="text-cyan-200" size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                                <p className="text-lg font-medium text-white">{item.value}</p>
                            </div>
                        </a>
                    ))}

                    {/* Callback Tool */}
                    <button type="button" onClick={openCallbackScheduler} aria-describedby={HELP_CONTACT_FLOW_STATUS_ID}
                        className="group flex w-full items-center gap-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-6 text-left transition-all hover:border-amber-300/60 hover:bg-amber-300/15">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-amber-300/30 bg-amber-300/10 text-amber-200 transition-transform group-hover:scale-105">
                            <Phone size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-amber-100/70">Planned response window</p>
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-bold text-white">Schedule a Callback</p>
                                <ChevronRight size={16} className="text-amber-200" />
                            </div>
                        </div>
                    </button>

                    <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-8 text-white">
                        <MessageCircle className="mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">Need help with the next step?</h3>
                        <p className="text-sm opacity-80 mb-4">For the fastest support, send your question with product, order, or protocol context.</p>
                        <p className="text-xs opacity-60">Email {siteEntity.supportEmail} and our team will direct it to the right workflow.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};



export default HelpCenterPage;
