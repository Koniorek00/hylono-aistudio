/**
 * TechHoloCard
 * A futuristic presentation card featuring iridescent borders and holographic shimmer.
 */
import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface TechHoloCardProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    children?: ReactNode;
    className?: string;
}

export const TechHoloCard: React.FC<TechHoloCardProps> = ({ title, description, icon, children, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`relative group rounded-2xl p-[1px] overflow-hidden ${className}`}
        >
            {/* Iridescent Gradient Border Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/40 via-purple-500/30 to-emerald-400/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-400 to-emerald-300 opacity-20 group-hover:opacity-60 transition-opacity duration-500 animate-gradient-xy" />

            {/* Inner Content Container */}
            <div className="relative h-full w-full bg-slate-950/90 backdrop-blur-xl rounded-2xl p-6 flex flex-col z-10 overflow-hidden">
                
                {/* Holographic Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />

                {/* Subtle Ambient Glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-cyan-400/30 transition-colors duration-500" />

                <div className="flex items-start gap-4 mb-4 relative z-20">
                    {icon && (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 tracking-tight leading-tight">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-2 relative z-20 flex-1">
                    {children}
                </div>
            </div>
        </motion.div>
    );
};
