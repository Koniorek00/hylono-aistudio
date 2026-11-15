import React from 'react';
import { Course } from '../types';
import { BookOpen, CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { ProductMention } from './content/ProductMention';
import { ProtocolMention } from './content/ProtocolMention';
import { BuilderCTA } from './content/BuilderCTA';
import { AdvisorCTA } from './content/AdvisorCTA';
import { learningCommerceMap } from '../content/batch3';
import { isFeatureEnabled } from '../utils/featureFlags';

interface LearningHubProps {
    courses?: Course[];
}

export const LearningHub: React.FC<LearningHubProps> = ({ courses = [] }) => {
    const contentCommerceEnabled = isFeatureEnabled('feature_content_commerce');

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-sm h-full flex flex-col justify-between overflow-hidden min-w-0">
            <div>
                {/* Hub Header */}
                <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2.5 sm:gap-3 text-slate-900">
                        <BookOpen className="text-slate-900 shrink-0" size={20} />
                        <span className="futuristic-font">Hylono Academy</span>
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full text-gray-500 font-semibold shrink-0">
                        Proprietary IP
                    </span>
                </div>

                {/* Courses List */}
                <div className="space-y-4 sm:space-y-5">
                    {courses.map((course) => {
                        const progress = Math.min(100, Math.max(0, course.progress));

                        return (
                            <div
                                key={course.id}
                                className={`p-4 sm:p-4.5 rounded-xl sm:rounded-2xl border transition-all duration-200 hover:shadow-md min-w-0 ${
                                    course.locked
                                        ? 'bg-gray-50/80 border-gray-100 opacity-60'
                                        : 'bg-white border-gray-200 hover:border-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-start gap-2.5 mb-3 min-w-0">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-bold text-sm mb-1 text-slate-900 leading-snug break-words">
                                            {course.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-2 break-words leading-relaxed">
                                            {course.description}
                                        </p>
                                    </div>
                                    {course.locked ? (
                                        <Lock size={14} className="text-gray-400 shrink-0 mt-0.5" />
                                    ) : (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                                            {progress}% Complete
                                        </span>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div
                                    role="progressbar"
                                    aria-label={`${course.title} progress`}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    aria-valuenow={progress}
                                    className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full mb-3.5 overflow-hidden"
                                >
                                    <div
                                        className="h-full bg-slate-900 rounded-full transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                {/* Modules Preview */}
                                {!course.locked && (
                                    <div className="space-y-2 pt-1 border-t border-gray-50">
                                        {course.modules.slice(0, 2).map((mod) => (
                                            <div key={mod.title} className="flex items-center justify-between text-xs text-gray-600 min-w-0 gap-2">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    {mod.completed ? (
                                                        <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                                                    ) : (
                                                        <PlayCircle size={12} className="text-gray-400 shrink-0" />
                                                    )}
                                                    <span className="truncate min-w-0">{mod.title}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {course.locked && (
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest mt-2 flex-wrap">
                                        <Lock size={10} className="shrink-0" /> Requires {course.title.includes('Advanced') ? 'Level 2' : 'Device'} Access
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="w-full min-h-11 mt-6 py-3 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors uppercase tracking-wider text-slate-700"
                >
                    View All Certifications
                </button>
            </div>

            {contentCommerceEnabled && (
                <div className="mt-8 border-t border-gray-100 pt-6 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900">Related products &amp; protocols</h4>
                    <p className="text-xs text-gray-600 mt-1">
                        Use these options to turn learning into a practical routine.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 min-w-0">
                        <div className="space-y-3 min-w-0">
                            {learningCommerceMap.relatedProducts.map((productId) => (
                                <ProductMention key={`learning-product-${productId}`} productId={productId} />
                            ))}
                            {learningCommerceMap.relatedProtocols.map((protocolSlug) => (
                                <ProtocolMention key={`learning-protocol-${protocolSlug}`} protocolSlug={protocolSlug} />
                            ))}
                        </div>

                        <div className="space-y-3 min-w-0">
                            <BuilderCTA goal={learningCommerceMap.goal} />
                            <AdvisorCTA />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

