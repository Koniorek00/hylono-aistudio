import React from 'react';
import { motion } from 'motion/react';

interface TimelineEvent {
    date: string;
    title: string;
    description: string;
    icon?: React.ReactNode;
    image?: string;
}

interface ContentTimelineProps {
    events: TimelineEvent[];
    orientation?: 'vertical' | 'alternating';
}

export const ContentTimeline: React.FC<ContentTimelineProps> = ({
    events,
    orientation = 'alternating'
}) => {
    if (orientation === 'vertical') {
        return (
            <div className="relative">
                {/* Central Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

                <div className="space-y-8">
                    {events.map((event, i) => (
                        <motion.div
                            key={event.title}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="relative pl-16"
                        >
                            {/* Dot */}
                            <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-cyan-500 border-4 border-white shadow" />

                            {/* Content */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <span className="text-sm text-cyan-600 font-medium">{event.date}</span>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">{event.title}</h3>
                                <p className="text-slate-600 mt-2">{event.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    // Alternating layout
    return (
        <div className="relative">
            {/* Central Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />

            <div className="space-y-12">
                {events.map((event, i) => (
                    <motion.div
                        key={event.title}
                        initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        viewport={{ once: true }}
                        className={`relative flex items-center ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                    >
                        {/* Content Card */}
                        <div className="w-5/12">
                            <div className={`bg-white rounded-xl p-6 shadow-sm ${i % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                <span className="text-sm text-cyan-600 font-medium">{event.date}</span>
                                <h3 className="text-lg font-bold text-slate-900 mt-1">{event.title}</h3>
                                <p className="text-slate-600 mt-2">{event.description}</p>
                            </div>
                        </div>

                        {/* Center Dot */}
                        <div className="w-2/12 flex justify-center">
                            <div className="w-4 h-4 rounded-full bg-cyan-500 border-4 border-white shadow-lg z-10" />
                        </div>

                        {/* Spacer */}
                        <div className="w-5/12" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
