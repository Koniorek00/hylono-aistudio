import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Briefcase, Stethoscope, DollarSign, ChevronRight, Check } from 'lucide-react';

type Role = 'operator' | 'manager' | 'sales';

interface RolePath {
    id: Role;
    title: string;
    description: string;
    icon: React.ReactNode;
    iconTone: string;
    modules: string[];
    estimatedTime: string;
}

const ROLE_PATHS: RolePath[] = [
    {
        id: 'operator',
        title: 'Operator Track',
        description: 'Master technical procedures and safety protocols',
        icon: <Stethoscope className="w-6 h-6" />,
        iconTone: 'border-cyan-400/[0.25] bg-cyan-400/[0.12] text-cyan-200',
        modules: ['Chamber Prep', 'Pressurization', 'Emergency Response', 'Client Monitoring', 'Supervised Practice Review'],
        estimatedTime: '2-3 hours'
    },
    {
        id: 'manager',
        title: 'Manager Track',
        description: 'Business operations, compliance, and team leadership',
        icon: <Briefcase className="w-6 h-6" />,
        iconTone: 'border-indigo-400/[0.25] bg-indigo-400/[0.12] text-indigo-200',
        modules: ['Compliance Essentials', 'Team Management', 'Quality Assurance', 'Reporting & Analytics', 'Incident Handling'],
        estimatedTime: '3-4 hours'
    },
    {
        id: 'sales',
        title: 'Sales Track',
        description: 'Benefits, objection handling, and client conversion',
        icon: <DollarSign className="w-6 h-6" />,
        iconTone: 'border-emerald-400/[0.25] bg-emerald-400/[0.12] text-emerald-200',
        modules: ['Benefits Overview', 'Client Consultation', 'Objection Handling', 'Upselling Techniques', 'Follow-up Strategies'],
        estimatedTime: '1.5-2 hours'
    }
];

const ROLE_PATH_ACTION_STATUS_ID = 'academy-role-path-action-status';
const initialRolePathStatus = 'Ready to select a role track. 3 tracks available.';

interface RolePathSelectorProps {
    onSelectPath?: (role: Role) => void;
}

export const RolePathSelector: React.FC<RolePathSelectorProps> = ({ onSelectPath }) => {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [actionStatus, setActionStatus] = useState(initialRolePathStatus);

    const handleSelect = (path: RolePath) => {
        setSelectedRole(path.id);
        setActionStatus(
            `${path.title} selected. ${path.modules.length} modules queued for preview; estimated time ${path.estimatedTime}.`
        );
        onSelectPath?.(path.id);
    };

    const handleFocus = (path: RolePath) => {
        setActionStatus(
            `${path.title} selected for review. ${path.modules.length} modules, estimated time ${path.estimatedTime}.`
        );
    };

    return (
        <div className="space-y-4">
            <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-1">Choose Your Learning Path</h3>
                <p className="text-sm text-slate-300">Select a track based on your role for personalized content</p>
            </div>
            <p
                id={ROLE_PATH_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Academy role path action status"
                className="sr-only"
            >
                {actionStatus}
            </p>

            <div className="grid gap-4">
                {ROLE_PATHS.map((path) => (
                    <motion.button
                        type="button"
                        key={path.id}
                        onFocus={() => handleFocus(path)}
                        onClick={() => handleSelect(path)}
                        className={`relative min-h-11 w-full max-w-full overflow-hidden rounded-lg border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 motion-reduce:transition-none
                            ${selectedRole === path.id
                                ? 'border-cyan-400/[0.35] bg-slate-950/[0.78]'
                                : 'border-white/[0.10] bg-slate-950/[0.62] hover:border-cyan-400/[0.28] hover:bg-slate-950/[0.78]'
                            }`}
                        aria-pressed={selectedRole === path.id}
                        aria-describedby={ROLE_PATH_ACTION_STATUS_ID}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <div className="relative flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
                            <div className={`shrink-0 self-start rounded-lg border p-3 ${path.iconTone}`}>
                                {path.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex min-w-0 items-center justify-between gap-3">
                                    <span className="block min-w-0 break-words font-bold text-white">{path.title}</span>
                                    {selectedRole === path.id ? (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-400/[0.18] text-cyan-100">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    ) : (
                                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />
                                    )}
                                </div>
                                <p className="mb-2 break-words text-sm text-slate-300">{path.description}</p>
                                <div className="mb-2 flex min-w-0 flex-wrap gap-1">
                                    {path.modules.slice(0, 3).map((mod) => (
                                        <span key={mod} className="max-w-full rounded-lg border border-white/[0.10] bg-white/[0.045] px-2 py-0.5 text-[10px] text-slate-200">
                                            {mod}
                                        </span>
                                    ))}
                                    {path.modules.length > 3 && (
                                        <span className="text-[10px] text-slate-300">+{path.modules.length - 3} more</span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-300">Time: {path.estimatedTime}</span>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {selectedRole && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-emerald-400/[0.25] bg-emerald-400/[0.12] p-4 text-center"
                >
                    <p className="text-sm text-emerald-100">
                        Track selected for the <strong>{ROLE_PATHS.find(p => p.id === selectedRole)?.title}</strong>.
                    </p>
                </motion.div>
            )}
        </div>
    );
};
