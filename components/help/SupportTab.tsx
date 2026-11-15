import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
    MessageCircle, Phone, Mail, BookOpen, Wrench, Shield, HelpCircle,
    Clock, Users, ArrowRight
} from 'lucide-react';
import { siteEntity } from '@/content/site-entity';
import { DeviceScanner } from '../support/DeviceScanner';

const HELP_SUPPORT_LINK_STATUS_ID = 'help-support-link-status';

export const SupportTab: React.FC = () => {
    const shouldReduceMotion = useReducedMotion();
    const [supportActionStatus, setSupportActionStatus] = useState('Support action links are ready.');

    const contactCards = [
        { icon: <MessageCircle size={24} />, title: 'Support triage', desc: 'Best first step for product, order, and protocol questions.', action: 'Open contact form', href: '/contact', color: 'border border-cyan-300/30 bg-cyan-300/10 text-cyan-100' },
        { icon: <Phone size={24} />, title: 'Callback planning', desc: 'Open the contact tab to choose a preferred response window.', action: 'Open callback planning', href: '/help?tab=contact#help-center-tabs', color: 'border border-emerald-300/30 bg-emerald-300/10 text-emerald-100' },
        { icon: <Mail size={24} />, title: 'Email support', desc: 'Useful when you need to send detailed context or follow-up notes.', action: 'Send email', href: `mailto:${siteEntity.supportEmail}`, color: 'border border-white/10 bg-white/[0.045] text-slate-100' },
    ];

    const helpCategories = [
        { title: 'Protocol Setup', desc: 'Setup and planning guides', href: '/protocols', icon: BookOpen },
        { title: 'Technical Support', desc: 'Maintenance and service handoffs', href: '/service-and-support', icon: Wrench },
        { title: 'Order Management', desc: 'Shipping, returns, and warranty context', href: '/contact', icon: Shield },
        { title: 'Safety Guidance', desc: 'Contraindication and safety-standard context', href: '/safety-and-standards', icon: HelpCircle },
    ];

    const responseMetrics = [
        { label: 'Primary support path', value: 'Email-led', icon: Clock },
        { label: 'Coverage', value: siteEntity.supportCoverageLabel, icon: Users },
        { label: 'Issue handling', value: 'By question type', icon: Shield },
    ];

    const getSupportLinkStatusProps = (message: string) => ({
        'aria-describedby': HELP_SUPPORT_LINK_STATUS_ID,
        onClick: () => setSupportActionStatus(message),
        onFocus: () => setSupportActionStatus(message),
    });

    return (
        <motion.div
            data-testid="help-support-surface"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? {} : { opacity: 0, y: -16 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
            className="text-white"
        >
            <p
                id={HELP_SUPPORT_LINK_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label="Help support link status"
                className="sr-only"
            >
                {supportActionStatus}
            </p>

            {/* Response Metrics */}
            <div className="grid grid-cols-1 gap-4 mb-12 sm:grid-cols-3 sm:gap-6">
                {responseMetrics.map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-6 text-center">
                        <metric.icon className="mx-auto mb-3 text-cyan-200" size={20} />
                        <div className="text-2xl font-bold text-white futuristic-font">{metric.value}</div>
                        <div className="text-xs text-slate-400">{metric.label}</div>
                    </div>
                ))}
            </div>

            <DeviceScanner />

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {contactCards.map((card) => (
                    <div key={card.title} className="group rounded-lg border border-white/10 bg-white/[0.045] p-8 transition-all hover:bg-white/[0.08]">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-lg ${card.color}`}>
                                {card.icon}
                            </div>
                            <span className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-100">Guided</span>
                        </div>
                        <h3
                            className="mb-2 text-xl font-bold text-white break-words"
                            style={{ fontFamily: 'var(--font-sans), sans-serif' }}
                        >
                            {card.title}
                        </h3>
                        <p className="mb-6 text-sm text-slate-400">{card.desc}</p>
                        <a
                            href={card.href}
                            {...getSupportLinkStatusProps(`Opening ${card.action} from device support.`)}
                            className="flex min-h-11 w-full items-center justify-center rounded-lg border border-white/10 py-3 text-xs font-bold uppercase tracking-widest text-slate-100 transition-all group-hover:border-cyan-300/50 group-hover:bg-white/[0.08] group-hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            {card.action}
                        </a>
                    </div>
                ))}
            </div>

            {/* Resource Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-4">
                    <h2 className="mb-6 text-2xl font-bold text-white">Self-Service Resources</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {helpCategories.map((cat) => (
                            <a
                                key={cat.title}
                                href={cat.href}
                                {...getSupportLinkStatusProps(`Opening ${cat.title} resource from device support.`)}
                                className="group block rounded-lg border border-white/10 bg-white/[0.045] p-6 text-left transition-colors hover:border-cyan-300/50 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                            >
                                <cat.icon className="text-cyan-500 mb-3" size={20} />
                                <h3
                                    className="mb-1 flex items-center justify-between font-bold text-white break-words"
                                    style={{ fontFamily: 'var(--font-sans), sans-serif' }}
                                >
                                    {cat.title} <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </h3>
                                <p className="text-xs text-slate-400">{cat.desc}</p>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Clinic & Partner Support */}
                <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.045] p-10 text-white">
                    <h2 className="text-2xl font-bold mb-6">Clinic & Partner Support</h2>
                    <p className="text-slate-400 text-sm mb-8">
                        Operating a clinic, studio, or partner workflow? Use the same support channel for rollout planning, logistics coordination, and documentation requests.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                            <Phone className="text-cyan-400" />
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Response Path</p>
                                <p className="font-sans text-lg">Scheduled callback or email triage</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                            <Mail className="text-emerald-400" />
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Support Email</p>
                                <a
                                    href={`mailto:${siteEntity.supportEmail}`}
                                    {...getSupportLinkStatusProps('Opening support email from clinic and partner support.')}
                                    className="font-sans text-sm underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    {siteEntity.supportEmail}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
