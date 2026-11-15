import React from 'react';
import { FileText, Brain, Download } from 'lucide-react';
import { TechData } from '../../../types';

interface TechResourcesProps {
    data: TechData;
}

export const TechResources: React.FC<TechResourcesProps> = ({ data }) => {
    return (
        <section id="resources" aria-labelledby="tech-resources-title" className="bg-slate-950 py-24 text-white">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(360px,1fr)] md:items-center">
                    <div className="max-w-md">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
                            Resource console
                        </p>
                        <h2 id="tech-resources-title" className="mb-6 text-4xl font-bold">
                            Deep <span className="text-cyan-200">Intelligence</span>
                        </h2>
                        <p className="mb-8 text-lg leading-8 text-slate-300">
                            Access full technical documentation and peer-reviewed research for the {data.name} system.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button type="button" className="group inline-flex min-h-11 items-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-5 py-3 text-sm font-bold text-cyan-50 shadow-none transition-colors hover:border-cyan-200/45 hover:bg-cyan-300/15">
                                <Download size={18} className="transition-transform group-hover:translate-y-0.5" /> Professional PDF Kit
                            </button>
                        </div>
                    </div>

                    <div className="grid w-full grid-cols-1 gap-4">
                        <button type="button" className="group flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-5 text-left shadow-none transition-colors hover:border-cyan-300/30 hover:bg-white/[0.07]">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                                <FileText size={24} />
                            </div>
                            <div className="min-w-0">
                                <span className="mb-0.5 block font-bold text-white">Clinical Manual v2.1</span>
                                <span className="font-mono text-xs text-slate-300">PDF • 4.2 MB • Updated Jan 2026</span>
                            </div>
                        </button>

                        <button type="button" className="group flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-5 text-left shadow-none transition-colors hover:border-cyan-300/30 hover:bg-white/[0.07]">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-300/10 text-violet-100">
                                <Brain size={24} />
                            </div>
                            <div className="min-w-0">
                                <span className="mb-0.5 block font-bold text-white">Scientific Excerpts</span>
                                <span className="font-mono text-xs text-slate-300">14 Citations • {data.name}_RESEARCH_PK</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
