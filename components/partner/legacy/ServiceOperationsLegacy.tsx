'use client';

// [PREVIEW STUB] The Service module did not exist in the April 2026 light-era
// snapshot (fdf2c659 has no ServiceOperations component and no /nexus/service
// route), so there is no historical UI to mount here. This neutral placeholder
// keeps the /nexus2 preview self-consistent: same legacy layout chrome, same
// light card language (bg-white, text-slate-900), and working links to the
// closest light-era surfaces (Fleet, Documents).
import React from 'react';
import Link from 'next/link';
import { PartnerLayout } from './PartnerLayoutLegacy';
import { ArrowRight, ClipboardCheck, FileText, Wrench } from 'lucide-react';
import { motion } from 'motion/react';

export const ServiceOperations: React.FC = () => {
    return (
        <PartnerLayout title="Service">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <span className="w-11 h-11 rounded-2xl bg-cyan-50 flex items-center justify-center">
                            <ClipboardCheck className="w-5 h-5 text-cyan-600" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Service operations</h2>
                            <p className="text-sm text-slate-500">
                                Classic preview placeholder — this module launched after the light-era snapshot.
                            </p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                        In April 2026, service workflows lived inside the Fleet and Documents
                        workspaces. Use those classic surfaces below; nothing here was redesigned,
                        and this page exists only so the preview sidebar stays complete.
                    </p>
                    <div className="mt-6 grid sm:grid-cols-2 gap-4">
                        <Link
                            href="/nexus2/fleet"
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 hover:border-cyan-300 hover:bg-cyan-50/50 transition-colors"
                        >
                            <span className="flex items-center gap-3">
                                <Wrench className="w-5 h-5 text-cyan-600" />
                                <span className="text-sm font-semibold text-slate-900">Open Fleet Health</span>
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </Link>
                        <Link
                            href="/nexus2/docs"
                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 hover:border-cyan-300 hover:bg-cyan-50/50 transition-colors"
                        >
                            <span className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-cyan-600" />
                                <span className="text-sm font-semibold text-slate-900">Open Documents</span>
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </PartnerLayout>
    );
};
