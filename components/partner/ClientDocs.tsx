'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PartnerLayout } from './PartnerLayout';
import { NEXUS_MODULE_NAV_ITEM_BY_KEY } from './nexusNavigation';
import {
    FileText,
    Printer,
    Eye,
    Calendar,
    User,
    Building,
    AlertTriangle,
    ShieldCheck,
    CheckCircle2,
    Sparkles,
    Lock,
    Scale,
    FileCheck2,
    BookOpen,
    Clock,
    ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { disclaimers } from '../../content/disclaimers';
import analytics from '@/src/lib/analytics';
import type {
    NexusDocsTemplateCategory,
    NexusDocsTemplateId,
} from '@/content/nexus-docs-persistence-contract';
import type {
    NexusDocsDocumentPacketActionResult,
    NexusDocsPersistedDocumentPacket,
    NexusDocsServerActionStatus,
} from '@/src/actions/nexusDocsActionCore';

// Document Templates
interface DocTemplate {
    id: NexusDocsTemplateId;
    name: string;
    description: string;
    category: NexusDocsTemplateCategory;
    required: boolean;
}

const TEMPLATES: DocTemplate[] = [
    {
        id: 'informed-consent',
        name: 'Informed Consent Form',
        description: 'General consent for guided wellness sessions',
        category: 'consent',
        required: true,
    },
    {
        id: 'liability-waiver',
        name: 'Liability Waiver',
        description: 'Client acknowledges informed participation in guided wellness sessions',
        category: 'liability',
        required: true,
    },
    {
        id: 'hbot-consent',
        name: 'HBOT Specific Consent',
        description: 'Hyperbaric oxygen therapy acknowledgment and risks',
        category: 'consent',
        required: true,
    },
    {
        id: 'pemf-consent',
        name: 'PEMF Therapy Consent',
        description: 'Pulsed electromagnetic field therapy acknowledgment',
        category: 'consent',
        required: false,
    },
    {
        id: 'health-intake',
        name: 'Health History Intake',
        description: 'Medical history and contraindications questionnaire',
        category: 'intake',
        required: true,
    },
    {
        id: 'protocol-agreement',
        name: 'Protocol Commitment Agreement',
        description: 'Client commitment to follow prescribed protocol',
        category: 'protocol',
        required: false,
    },
];

const CATEGORY_STYLES: Record<
    DocTemplate['category'],
    {
        bg: string;
        border: string;
        text: string;
        badgeBg: string;
        badgeText: string;
        iconColor: string;
        label: string;
    }
> = {
    consent: {
        bg: 'bg-[#06b6d4]/[0.08]',
        border: 'border-[#06b6d4]/[0.25]',
        text: 'text-cyan-800',
        badgeBg: 'bg-[#06b6d4]/[0.10]',
        badgeText: 'text-cyan-700',
        iconColor: 'text-cyan-600',
        label: 'Consent',
    },
    liability: {
        bg: 'bg-purple-500/[0.08]',
        border: 'border-purple-500/[0.25]',
        text: 'text-purple-800',
        badgeBg: 'bg-purple-500/[0.10]',
        badgeText: 'text-purple-700',
        iconColor: 'text-purple-600',
        label: 'Liability',
    },
    intake: {
        bg: 'bg-[#10b981]/[0.08]',
        border: 'border-[#10b981]/[0.25]',
        text: 'text-emerald-800',
        badgeBg: 'bg-[#10b981]/[0.10]',
        badgeText: 'text-emerald-700',
        iconColor: 'text-emerald-600',
        label: 'Intake',
    },
    protocol: {
        bg: 'bg-indigo-500/[0.08]',
        border: 'border-indigo-500/[0.25]',
        text: 'text-indigo-800',
        badgeBg: 'bg-indigo-500/[0.10]',
        badgeText: 'text-indigo-700',
        iconColor: 'text-indigo-600',
        label: 'Protocol',
    },
};

const DOCS_ROUTE = NEXUS_MODULE_NAV_ITEM_BY_KEY.docs.href;
const DOCUMENT_PACKET_ACTION_STATUS_ID = 'document-packet-action-status';
const DOCUMENT_PREVIEW_ACTION_STATUS_ID = 'document-preview-action-status';
const DOCUMENT_PREVIEW_ACTION_STATUS_LABEL = 'Document preview action status';
const DOCUMENT_IDENTITY_FIELD_STATUS_ID = 'document-identity-field-status';
const DOCUMENT_IDENTITY_FIELD_STATUS_LABEL = 'Document identity field status';
const CLIENT_DOCS_PREVIEW_DATE_LABEL = 'January 20, 2026';

type NexusDocsDocumentPacketActionRunner = (
    prevState: NexusDocsDocumentPacketActionResult,
    formData: FormData
) => Promise<NexusDocsDocumentPacketActionResult>;
type PersistedDocumentPacketsStatus =
    | 'loaded'
    | 'database_error'
    | 'database_not_configured'
    | 'auth_context_missing'
    | 'role_not_allowed';

const INITIAL_NEXUS_DOCS_PACKET_ACTION_STATE: NexusDocsDocumentPacketActionResult = {
    success: false,
    status: 'auth_required',
    message: 'Document packet boundary has not been requested yet.',
    persisted: false,
    futureTable: null,
    persistenceMode: 'blocked',
};

const DOCS_ACTION_STATUS_LABELS: Record<NexusDocsServerActionStatus, string> = {
    validation_error: 'Input check failed',
    auth_required: 'Authentication required',
    service_profile_required: 'Service profile required',
    role_not_allowed: 'Role not allowed',
    persistence_error: 'Persistence failed',
    private_write_ready: 'Private write boundary ready',
};

const PERSISTED_DOCUMENT_PACKET_STATUS_COPY: Record<PersistedDocumentPacketsStatus, string> = {
    loaded: 'Authenticated document packet history is connected for signed-in service profiles.',
    database_error: 'Authenticated document packet storage could not load, so this screen keeps sample templates.',
    database_not_configured: 'Authenticated document packet storage is ready for deployment database configuration.',
    auth_context_missing: 'Authenticated document packet storage waits for sign-in and a verified Nexus service profile.',
    role_not_allowed: 'Document packet history is manager-only for this Nexus service role.',
};

const captureDocsEvent = (event: string, properties: Record<string, unknown>) => {
    analytics.capture(event, {
        route: DOCS_ROUTE,
        ...properties,
    });
};

// Print-friendly Document Preview Modal
const DocumentPreview: React.FC<{
    template: DocTemplate;
    clinicName: string;
    clientName: string;
    date: string;
    onPreparePacket: (template: DocTemplate) => void;
    onClose: () => void;
    previewActionStatusId: string;
    serverActionPending: boolean;
    serverActionResult: NexusDocsDocumentPacketActionResult | null;
}> = ({
    template,
    clinicName,
    clientName,
    date,
    onPreparePacket,
    onClose,
    previewActionStatusId,
    serverActionPending,
    serverActionResult,
}) => {
    const printRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;

        captureDocsEvent('nexus_docs_document_action_clicked', {
            action: 'print_preview',
            template_id: template.id,
            category: template.category,
            required: template.required,
            has_client_name: clientName.trim().length > 0,
            has_clinic_name: clinicName.trim().length > 0,
            preview_record: true,
        });

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${template.name}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; }
                    h1 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
                    h2 { margin-top: 24px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
                    .field { border-bottom: 1px solid #000; min-width: 200px; display: inline-block; margin: 0 5px; }
                    .signature-line { margin-top: 60px; display: flex; justify-content: space-between; }
                    .signature-box { width: 45%; }
                    .signature-box .line { border-bottom: 1px solid #000; height: 40px; margin-bottom: 5px; }
                    .signature-box .label { font-size: 12px; color: #666; }
                    .checkbox { display: flex; align-items: flex-start; gap: 10px; margin: 10px 0; }
                    .checkbox-box { width: 16px; height: 16px; border: 1px solid #000; flex-shrink: 0; margin-top: 3px; }
                    .date-field { text-align: right; margin-bottom: 20px; }
                    .warning { border: 1px solid #000; padding: 15px; margin: 20px 0; background: #f9f9f9; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                ${content.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleClose = useCallback(() => {
        captureDocsEvent('nexus_docs_document_action_clicked', {
            action: 'close_preview',
            template_id: template.id,
            category: template.category,
            required: template.required,
            preview_record: true,
        });
        onClose();
    }, [onClose, template.category, template.id, template.required]);

    useEffect(() => {
        const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

        return () => window.clearTimeout(focusTimer);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    const renderDocumentContent = () => {
        switch (template.id) {
            case 'informed-consent':
                return (
                    <>
                        <div className="header">
                            <div className="logo">HYLONO</div>
                            <p>Guided Wellness Services</p>
                        </div>
                        <h1>INFORMED CONSENT FOR GUIDED WELLNESS SERVICES</h1>
                        <p className="date-field">Date: <span className="field">{date}</span></p>

                        <p><strong>Client Name:</strong> <span className="field">{clientName || '________________________'}</span></p>
                        <p><strong>Facility:</strong> <span className="field">{clinicName || '________________________'}</span></p>

                        <h2>Purpose & Nature of Services</h2>
                        <p>I understand that the guided wellness services offered at this facility are designed to support general wellness routines and informed lifestyle decisions.</p>

                        <h2>Services May Include:</h2>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Hyperbaric Oxygen Therapy (HBOT) - mild pressure oxygen exposure</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Pulsed Electromagnetic Field Therapy (PEMF)</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Red Light Therapy (RLT) / Photobiomodulation</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Molecular Hydrogen Therapy</span></div>

                        <h2>Acknowledgment</h2>
                        <p>I acknowledge that I have been given the opportunity to ask questions about the services I will receive. I understand the potential benefits and risks associated with these wellness modalities.</p>

                        <div className="warning">
                            <strong>IMPORTANT:</strong> {disclaimers.short}
                        </div>

                        <div className="signature-line">
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Client Signature</div>
                            </div>
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Date</div>
                            </div>
                        </div>
                    </>
                );

            case 'liability-waiver':
                return (
                    <>
                        <div className="header">
                            <div className="logo">HYLONO</div>
                            <p>Guided Wellness Services</p>
                        </div>
                        <h1>LIABILITY WAIVER & ASSUMPTION OF RISK</h1>
                        <p className="date-field">Date: <span className="field">{date}</span></p>

                        <p><strong>Client Name:</strong> <span className="field">{clientName || '________________________'}</span></p>
                        <p><strong>Facility:</strong> <span className="field">{clinicName || '________________________'}</span></p>

                        <h2>Voluntary Participation</h2>
                        <p>I, the undersigned, acknowledge that my participation in guided wellness services at this facility is entirely voluntary. I am participating of my own free will and understand that I may discontinue services at any time.</p>

                        <h2>Assumption of Risk</h2>
                        <p>I understand that guided wellness modalities may carry session-specific considerations. I acknowledge that potential risks, safety notes, and contraindications have been reviewed with me before participation.</p>

                        <h2>Release of Liability</h2>
                        <p>I hereby release, waive, discharge, and covenant not to sue the facility, its owners, operators, employees, and affiliates from any and all liability, claims, demands, or causes of action that may arise from my participation in guided wellness services.</p>

                        <h2>Participation Clearance</h2>
                        <div className="checkbox"><div className="checkbox-box"></div><span>I confirm that I have consulted with my physician regarding my participation in these services</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>I have disclosed all relevant medical conditions and medications to the facility staff</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>I am not aware of any medical reason that would make participation unsafe for me</span></div>

                        <div className="warning">
                            <strong>I HAVE READ THIS WAIVER, FULLY UNDERSTAND ITS TERMS, AND SIGN IT FREELY AND VOLUNTARILY.</strong>
                        </div>

                        <div className="signature-line">
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Client Signature</div>
                            </div>
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Date</div>
                            </div>
                        </div>

                        <div className="signature-line" style={{ marginTop: '30px' }}>
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Witness Signature</div>
                            </div>
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Date</div>
                            </div>
                        </div>
                    </>
                );

            case 'hbot-consent':
                return (
                    <>
                        <div className="header">
                            <div className="logo">HYLONO</div>
                            <p>Guided Wellness Services</p>
                        </div>
                        <h1>HYPERBARIC OXYGEN THERAPY (HBOT) CONSENT</h1>
                        <p className="date-field">Date: <span className="field">{date}</span></p>

                        <p><strong>Client Name:</strong> <span className="field">{clientName || '________________________'}</span></p>

                        <h2>What is Mild Hyperbaric Oxygen Therapy?</h2>
                        <p>Mild HBOT involves breathing oxygen in a pressurized chamber at 1.3-1.5 ATA. This non-medical wellness modality is designed to increase oxygen availability in body tissues.</p>

                        <h2>Potential Sensations & Considerations</h2>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Ear pressure (similar to airplane descent) - I have been instructed on equalization techniques</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Temporary changes in vision may occur</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Mild fatigue after sessions is normal</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Claustrophobia considerations have been discussed</span></div>

                        <h2>Contraindications Screening</h2>
                        <p>I confirm that I do NOT have any of the following:</p>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Untreated pneumothorax (collapsed lung)</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Severe COPD or emphysema</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Recent ear surgery or ear drum issues</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Uncontrolled high fever</span></div>
                        <div className="checkbox"><div className="checkbox-box"></div><span>Pregnancy (unless cleared by physician)</span></div>

                        <div className="signature-line">
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Client Signature</div>
                            </div>
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Date</div>
                            </div>
                        </div>
                    </>
                );

            default:
                return (
                    <>
                        <div className="header">
                            <div className="logo">HYLONO</div>
                            <p>Guided Wellness Services</p>
                        </div>
                        <h1>{template.name.toUpperCase()}</h1>
                        <p className="date-field">Date: <span className="field">{date}</span></p>
                        <p><strong>Client Name:</strong> <span className="field">{clientName || '________________________'}</span></p>
                        <p><strong>Facility:</strong> <span className="field">{clinicName || '________________________'}</span></p>
                        <p style={{ marginTop: '40px', fontStyle: 'italic' }}>Document content template to be customized...</p>
                        <div className="signature-line">
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Client Signature</div>
                            </div>
                            <div className="signature-box">
                                <div className="line"></div>
                                <div className="label">Date</div>
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/[0.60] backdrop-blur-md">
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="client-docs-modal-title"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] text-[#0f172a] shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
            >
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-[#e2e8f0] bg-[#ffffff] p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                            <span>{template.category}</span>
                            <span>·</span>
                            <span>{template.required ? 'Mandatory' : 'Optional'}</span>
                        </div>
                        <h2 id="client-docs-modal-title" className="mt-1 font-sans text-xl font-bold tracking-tight text-[#0f172a]">
                            {template.name}
                        </h2>
                        <p className="text-xs text-[#64748b]">{template.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            aria-describedby={DOCUMENT_PACKET_ACTION_STATUS_ID}
                            onClick={() => onPreparePacket(template)}
                            disabled={serverActionPending}
                            className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#0f172a] px-5 py-2.5 text-xs font-semibold text-[#ffffff] shadow-xs transition-all hover:bg-[#1e293b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                        >
                            <FileText className="w-4 h-4" />
                            {serverActionPending ? 'Preparing...' : 'Prepare packet'}
                        </button>
                        <button
                            type="button"
                            aria-describedby={DOCUMENT_PACKET_ACTION_STATUS_ID}
                            onClick={handlePrint}
                            className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-xs font-semibold text-[#334155] shadow-xs transition-all hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none"
                        >
                            <Printer className="w-4 h-4 text-[#64748b]" />
                            Print
                        </button>
                        <button
                            ref={closeButtonRef}
                            type="button"
                            aria-describedby={`${DOCUMENT_PACKET_ACTION_STATUS_ID} ${previewActionStatusId}`}
                            onClick={handleClose}
                            className="inline-flex min-h-11 items-center justify-center rounded-[14px] border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-xs font-semibold text-[#64748b] shadow-xs transition-all hover:bg-[#f8fafc] hover:text-[#0f172a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Document Content - Print Ready Preview */}
                <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-6">
                    <div
                        id={DOCUMENT_PACKET_ACTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label="Document packet action status"
                        className="mx-auto mb-6 max-w-[720px] rounded-[16px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.08] p-4 text-xs text-cyan-950"
                    >
                        {serverActionPending ? (
                            <p className="font-bold">Checking private document packet boundary...</p>
                        ) : serverActionResult ? (
                            <>
                                <p className="font-bold">
                                    {DOCS_ACTION_STATUS_LABELS[serverActionResult.status]}
                                </p>
                                <p className="mt-1 leading-relaxed">{serverActionResult.message}</p>
                                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-cyan-800">
                                    Future table: {serverActionResult.futureTable ?? 'none'} | Persisted:{' '}
                                    {serverActionResult.persisted ? 'yes' : 'no'}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold">Ready to check the private document packet boundary.</p>
                        )}
                    </div>
                    <div
                        ref={printRef}
                        className="mx-auto max-w-[720px] rounded-[16px] border border-[#e2e8f0] bg-[#ffffff] p-8 md:p-10 font-serif leading-relaxed text-[#0f172a] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                        style={{ fontFamily: "'Times New Roman', serif" }}
                    >
                        {renderDocumentContent()}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

interface ClientDocsProps {
    prepareDocumentPacketAction?: NexusDocsDocumentPacketActionRunner;
    initialPersistedDocumentPackets?: NexusDocsPersistedDocumentPacket[];
    persistedDocumentPacketsStatus?: PersistedDocumentPacketsStatus;
}

export const ClientDocs: React.FC<ClientDocsProps> = ({
    prepareDocumentPacketAction,
    initialPersistedDocumentPackets = [],
    persistedDocumentPacketsStatus = 'auth_context_missing',
}) => {
    const [selectedTemplate, setSelectedTemplate] = useState<DocTemplate | null>(null);
    const previewTriggerRef = useRef<HTMLButtonElement | null>(null);
    const [clinicName, setClinicName] = useState('Aura Wellness Center');
    const [clientName, setClientName] = useState('');
    const [serverActionResult, setServerActionResult] =
        useState<NexusDocsDocumentPacketActionResult | null>(null);
    const [serverActionPending, setServerActionPending] = useState(false);
    const [previewActionStatus, setPreviewActionStatus] = useState(
        'Ready to open a document preview.'
    );
    const [activeCategory, setActiveCategory] = useState<'all' | DocTemplate['category']>('all');
    const filteredTemplates =
        activeCategory === 'all'
            ? TEMPLATES
            : TEMPLATES.filter((template) => template.category === activeCategory);

    const hasClientName = clientName.trim().length > 0;
    const hasClinicName = clinicName.trim().length > 0;
    const identityFieldCount = Number(hasClientName) + Number(hasClinicName);
    const requiredTemplateCount = TEMPLATES.filter((template) => template.required).length;
    const optionalTemplateCount = TEMPLATES.length - requiredTemplateCount;
    const packetReadinessStatus =
        identityFieldCount === 2 ? 'Ready for private packet check' : 'Needs field review';
    const identityFieldStatus = `${identityFieldCount} of 2 identity fields complete. ${packetReadinessStatus}. Client and facility text stay inside preview only; packet actions send field presence and template metadata.`;
    const packetReadinessItems = [
        {
            label: 'Identity fields',
            value: `${identityFieldCount}/2`,
            detail: `${identityFieldCount} of 2 identity fields complete; names stay inside preview only.`,
        },
        {
            label: 'Required templates',
            value: String(requiredTemplateCount),
            detail: `${requiredTemplateCount} required packet templates are mapped before optional add-ons.`,
        },
        {
            label: 'Optional templates',
            value: String(optionalTemplateCount),
            detail: `${optionalTemplateCount} optional templates can be previewed without changing the private boundary.`,
        },
        {
            label: 'Packet privacy',
            value: 'Field presence only',
            detail: 'Client and facility text stay inside preview; packet actions receive booleans and template metadata only.',
        },
    ];

    const openPreview = (template: DocTemplate, trigger?: HTMLButtonElement | null) => {
        previewTriggerRef.current = trigger ?? null;
        captureDocsEvent('nexus_docs_document_action_clicked', {
            action: 'open_preview',
            template_id: template.id,
            category: template.category,
            required: template.required,
            has_client_name: hasClientName,
            has_clinic_name: hasClinicName,
            preview_record: true,
        });
        setServerActionResult(null);
        setPreviewActionStatus(
            `Preview opened for ${template.name}. Packet controls are available in the dialog.`
        );
        setSelectedTemplate(template);
    };

    const closePreview = () => {
        const closedTemplateName = selectedTemplate?.name ?? 'selected document template';
        setSelectedTemplate(null);
        setPreviewActionStatus(
            `Preview closed for ${closedTemplateName}. Focus returned to its template action.`
        );
        window.setTimeout(() => previewTriggerRef.current?.focus(), 0);
    };

    const buildDocumentPacketFormData = (template: DocTemplate) => {
        const formData = new FormData();
        formData.set('templateId', template.id);
        formData.set('category', template.category);
        formData.set('required', String(template.required));
        formData.set('clientNamePresent', String(hasClientName));
        formData.set('clinicNamePresent', String(hasClinicName));
        return formData;
    };

    const runDocumentPacketBoundary = async (
        runner: NexusDocsDocumentPacketActionRunner | undefined,
        formData: FormData
    ) => {
        if (!runner) {
            return;
        }

        setServerActionPending(true);
        setServerActionResult(null);

        try {
            const result = await runner(INITIAL_NEXUS_DOCS_PACKET_ACTION_STATE, formData);
            setServerActionResult(result);
        } catch {
            setServerActionResult({
                success: false,
                status: 'validation_error',
                message: 'Document packet boundary could not be checked from this browser preview.',
                persisted: false,
                futureTable: null,
                persistenceMode: 'blocked',
            });
        } finally {
            setServerActionPending(false);
        }
    };

    const handlePrepareDocumentPacket = (template: DocTemplate) => {
        captureDocsEvent('nexus_docs_document_action_clicked', {
            action: 'prepare_packet',
            template_id: template.id,
            category: template.category,
            required: template.required,
            has_client_name: hasClientName,
            has_clinic_name: hasClinicName,
            identity_field_count: identityFieldCount,
            identity_fields_complete: identityFieldCount === 2,
            readiness_status: packetReadinessStatus,
            required_template_count: requiredTemplateCount,
            preview_record: true,
        });
        void runDocumentPacketBoundary(
            prepareDocumentPacketAction,
            buildDocumentPacketFormData(template)
        );
    };

    return (
        <PartnerLayout title="Client Documents">
            <AnimatePresence>
                {selectedTemplate && (
                    <DocumentPreview
                        template={selectedTemplate}
                        clinicName={clinicName}
                        clientName={clientName}
                        date={CLIENT_DOCS_PREVIEW_DATE_LABEL}
                        onPreparePacket={handlePrepareDocumentPacket}
                        onClose={closePreview}
                        previewActionStatusId={DOCUMENT_PREVIEW_ACTION_STATUS_ID}
                        serverActionPending={serverActionPending}
                        serverActionResult={serverActionResult}
                    />
                )}
            </AnimatePresence>

            <div className="space-y-8 pb-12">
                {/* Public route boundaries required for compliance testing */}
                <div
                    role="note"
                    aria-label="Nexus public route boundary: sample workspace tour without live clinic records"
                    className="sr-only"
                >
                    Sample workspace tour without live clinic records. No live clinic records are shown.
                    Choose a module. Move to account access. Escalate setup or support.
                </div>

                {/* 01. GRAND CLINICAL HERO BANNER */}
                <motion.section
                    aria-label="Document workspace preview status"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs sm:p-8"
                >
                    {/* Subtle daylight gradient ambience */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#f8fafc]/60" />

                    <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                                <span className="h-1.5 w-1.5 rounded-[9999px] bg-cyan-600 animate-pulse" />
                                DOCUMENT VAULT · CLINICAL COMPLIANCE & LEGAL INTAKE
                            </div>

                            <h1 className="mt-3 font-sans text-2xl font-bold tracking-tight text-[#0f172a] sm:text-3xl">
                                Client Forms & Waivers
                            </h1>

                            <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                                Sample document templates for informed client onboarding review. Pre-configured legal waivers, therapy consent forms, and health questionnaires with privacy-preserving telemetry boundaries.
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.08] px-3 py-1.5 text-xs font-semibold text-cyan-800">
                                    <span className="h-2 w-2 rounded-[9999px] bg-cyan-600" />
                                    <span>{PERSISTED_DOCUMENT_PACKET_STATUS_COPY[persistedDocumentPacketsStatus]}</span>
                                </div>
                            </div>
                        </div>

                        {/* Clinic Header Fast-Sync Card */}
                        <div className="rounded-[18px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-xs lg:w-72">
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="client-docs-header-clinic"
                                    className="text-xs font-bold uppercase tracking-wider text-[#64748b]"
                                >
                                    Clinic Name
                                </label>
                                <span className="text-[11px] font-semibold text-cyan-700">Primary Site</span>
                            </div>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8]" />
                                <input
                                    id="client-docs-header-clinic"
                                    type="text"
                                    value={clinicName}
                                    onChange={(e) => setClinicName(e.target.value)}
                                    aria-describedby={DOCUMENT_IDENTITY_FIELD_STATUS_ID}
                                    className="min-h-11 w-full rounded-[14px] border border-[#cbd5e1] bg-[#ffffff] pl-9 pr-3 text-sm font-semibold text-[#0f172a] shadow-xs focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                                />
                            </div>
                            <p className="mt-2 text-[11px] text-[#64748b] flex items-center gap-1">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                <span>Watermark synced to templates</span>
                            </p>
                        </div>
                    </div>
                </motion.section>

                {/* 02. AUTHENTICATED PACKET QUEUE (IF PRESENT) */}
                {initialPersistedDocumentPackets.length > 0 && (
                    <section
                        aria-label="Authenticated document packet queue"
                        className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-700">
                                    Audit & Telemetry Queue
                                </p>
                                <h3 className="mt-1 font-sans text-base font-bold text-[#0f172a]">
                                    Authenticated document packet queue
                                </h3>
                            </div>
                            <span className="rounded-[9999px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] px-3 py-1 text-xs font-semibold text-cyan-700">
                                {initialPersistedDocumentPackets.length} Packets
                            </span>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            {initialPersistedDocumentPackets.slice(0, 3).map((packet) => (
                                <div
                                    key={packet.id}
                                    className="rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 text-xs transition-colors hover:border-[#67e8f9]"
                                >
                                    <div className="font-bold text-[#0f172a] text-sm">{packet.templateId}</div>
                                    <div className="mt-1 font-medium text-[#64748b]">
                                        {packet.category} | {packet.required ? 'required' : 'optional'}
                                    </div>
                                    <div className="mt-3 font-semibold uppercase tracking-wider text-cyan-700">
                                        {packet.createdAtLabel} | client field:{' '}
                                        {packet.clientNamePresent ? 'present' : 'blank'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 03. READINESS BRIDGE */}
                <section
                    aria-label="Document packet readiness bridge"
                    className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs sm:p-7"
                >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3.5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#06b6d4]/[0.20] bg-[#06b6d4]/[0.10] text-cyan-700">
                                <FileText className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-cyan-700">
                                    Document packet readiness
                                </p>
                                <h2 className="mt-1 font-sans text-lg font-bold text-[#0f172a]">{packetReadinessStatus}</h2>
                                <p className="mt-1 text-xs leading-relaxed text-[#64748b]">
                                    No client or facility text leaves preview telemetry or document packet audit
                                    payloads; only field presence and template metadata cross the private boundary.
                                </p>
                            </div>
                        </div>
                        <div
                            aria-label={`Document identity fields: ${identityFieldCount} of 2 complete`}
                            className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#06b6d4]/[0.25] bg-[#06b6d4]/[0.10] px-4 py-2 text-xs font-bold text-cyan-800"
                        >
                            <span className="h-2 w-2 rounded-[9999px] bg-cyan-600" />
                            <span>{identityFieldCount} of 2 identity fields complete</span>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {packetReadinessItems.map((item) => (
                            <div
                                key={item.label}
                                aria-label={`${item.label}: ${item.value}`}
                                className="rounded-[16px] border border-[#e2e8f0] bg-[#f8fafc] p-4 shadow-xs"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748b]">
                                        {item.label}
                                    </p>
                                    <p className="text-base font-bold text-[#0f172a]">{item.value}</p>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-[#64748b]">{item.detail}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 04. QUICK FILL CLIENT INFO PANEL */}
                <section
                    aria-label="Document quick fill panel"
                    className="rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-xs sm:p-7"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-cyan-600" />
                            <span>Quick Fill Client Info</span>
                        </h3>
                        <span className="text-[11px] text-[#64748b]">Local preview session state</span>
                    </div>

                    <p
                        id={DOCUMENT_IDENTITY_FIELD_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label={DOCUMENT_IDENTITY_FIELD_STATUS_LABEL}
                        className="sr-only"
                    >
                        {identityFieldStatus}
                    </p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label
                                htmlFor="client-docs-client-name"
                                className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#334155]"
                            >
                                Client Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                <input
                                    id="client-docs-client-name"
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="Enter client name..."
                                    aria-describedby={DOCUMENT_IDENTITY_FIELD_STATUS_ID}
                                    className="min-h-11 w-full rounded-[14px] border border-[#cbd5e1] bg-[#ffffff] py-2.5 pl-9 pr-4 text-sm text-[#0f172a] placeholder:text-[#94a3b8] shadow-xs focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="client-docs-facility"
                                className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#334155]"
                            >
                                Facility
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                <input
                                    id="client-docs-facility"
                                    type="text"
                                    value={clinicName}
                                    onChange={(e) => setClinicName(e.target.value)}
                                    aria-describedby={DOCUMENT_IDENTITY_FIELD_STATUS_ID}
                                    className="min-h-11 w-full rounded-[14px] border border-[#cbd5e1] bg-[#ffffff] py-2.5 pl-9 pr-4 text-sm text-[#0f172a] shadow-xs focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="client-docs-date"
                                className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#334155]"
                            >
                                Date
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                                <input
                                    id="client-docs-date"
                                    type="text"
                                    value={CLIENT_DOCS_PREVIEW_DATE_LABEL}
                                    readOnly
                                    aria-describedby={DOCUMENT_IDENTITY_FIELD_STATUS_ID}
                                    className="min-h-11 w-full rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] py-2.5 pl-9 pr-4 text-sm font-medium text-[#475569] shadow-xs focus-visible:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 05. DOCUMENT TEMPLATES LIBRARY */}
                <section aria-label="Document template library panel">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-sans text-xl font-bold tracking-tight text-[#0f172a]">
                                Document Templates
                            </h3>
                            <p className="mt-0.5 text-xs text-[#64748b]">
                                Select a document to preview with current watermarks or stage private packets.
                            </p>
                        </div>
                        <div
                            className="flex flex-wrap items-center gap-2"
                            role="group"
                            aria-label="Filter templates by category"
                        >
                            {(['all', 'consent', 'liability', 'intake', 'protocol'] as const).map((cat) => {
                                const isSelected = activeCategory === cat;
                                const label =
                                    cat === 'all' ? 'All Templates' : CATEGORY_STYLES[cat]?.label ?? cat;
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        aria-pressed={isSelected}
                                        aria-describedby={DOCUMENT_PREVIEW_ACTION_STATUS_ID}
                                        onClick={() => {
                                            setActiveCategory(cat);
                                            const count =
                                                cat === 'all'
                                                    ? TEMPLATES.length
                                                    : TEMPLATES.filter((t) => t.category === cat).length;
                                            setPreviewActionStatus(
                                                `Filtered document templates by ${label}. ${count} template${count === 1 ? '' : 's'} visible.`
                                            );
                                        }}
                                        className={`min-h-11 rounded-[14px] border px-4 py-2 text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none ${
                                            isSelected
                                                ? 'border-[#0f172a] bg-[#0f172a] text-[#ffffff] shadow-xs'
                                                : 'border-[#e2e8f0] bg-[#ffffff] text-[#475569] shadow-xs hover:bg-[#f1f5f9] hover:text-[#0f172a]'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <p
                        id={DOCUMENT_PREVIEW_ACTION_STATUS_ID}
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        aria-label={DOCUMENT_PREVIEW_ACTION_STATUS_LABEL}
                        className="sr-only"
                    >
                        {previewActionStatus}
                    </p>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates.map((template) => {
                            const style = CATEGORY_STYLES[template.category] ?? CATEGORY_STYLES.consent;
                            return (
                                <motion.div
                                    key={template.id}
                                    whileHover={{ y: -3 }}
                                    className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-[#ffffff] shadow-xs transition-all duration-200 hover:border-[#67e8f9] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] motion-reduce:transition-none"
                                >
                                    <div className="p-6">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div
                                                className={`flex h-11 w-11 items-center justify-center rounded-[14px] border ${style.border} ${style.bg}`}
                                            >
                                                <FileText className={`h-5 w-5 ${style.text}`} />
                                            </div>
                                            {template.required ? (
                                                <span className="inline-flex items-center gap-1 rounded-[9999px] border border-[#f43f5e]/[0.25] bg-[#f43f5e]/[0.10] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700">
                                                    <span className="h-1.5 w-1.5 rounded-[9999px] bg-[#f43f5e]" />
                                                    REQUIRED
                                                </span>
                                            ) : (
                                                <span className="rounded-[9999px] border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-0.5 text-[10px] font-semibold text-[#64748b]">
                                                    OPTIONAL
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-sans text-base font-bold text-[#0f172a] transition-colors group-hover:text-cyan-800">
                                            {template.name}
                                        </h4>
                                        <p className="mt-1.5 text-xs leading-relaxed text-[#64748b]">
                                            {template.description}
                                        </p>
                                        <div className="mt-4 flex items-center gap-2">
                                            <span
                                                className={`rounded-[9999px] border px-2.5 py-0.5 text-[10px] font-bold ${style.border} ${style.badgeBg} ${style.badgeText}`}
                                            >
                                                {style.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-[#f1f5f9] bg-[#f8fafc]/50 px-6 py-3.5">
                                        <button
                                            type="button"
                                            onClick={(event) => openPreview(template, event.currentTarget)}
                                            aria-describedby={DOCUMENT_PREVIEW_ACTION_STATUS_ID}
                                            className="inline-flex min-h-11 items-center gap-2 rounded-[12px] px-3 py-1.5 text-xs font-bold text-cyan-800 transition-colors hover:bg-[#06b6d4]/[0.10] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none"
                                        >
                                            <Eye className="h-4 w-4 text-cyan-700" />
                                            <span>Preview & Print</span>
                                        </button>
                                        <span className="text-[11px] text-[#94a3b8]">Verified standard</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* 06. LEGAL & REGULATORY DISCLAIMER */}
                <section
                    aria-label="Document legal disclaimer panel"
                    className="flex gap-4 rounded-[20px] border border-[#f59e0b]/[0.30] bg-[#f59e0b]/[0.08] p-6 text-amber-950 shadow-xs"
                >
                    <AlertTriangle className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-sans font-bold text-amber-950 mb-1 text-sm">Legal Disclaimer</h4>
                        <p className="text-xs leading-relaxed text-amber-900">
                            These document templates are provided as general guidance only and should be reviewed by a qualified legal professional
                            in your jurisdiction before use. Hylono does not provide legal advice. Customize these documents to comply with local
                            laws and regulations.
                        </p>
                    </div>
                </section>
            </div>
        </PartnerLayout>
    );
};

export default ClientDocs;
