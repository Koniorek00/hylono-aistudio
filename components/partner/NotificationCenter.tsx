import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Bell,
    Check,
    Clock,
    AlertCircle,
    Package,
    Activity,
    X,
    MessageSquare,
    ChevronRight
} from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'alert' | 'success' | 'info' | 'message';
    read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Sample device task',
        message: 'A preview device record needs a firmware-review placeholder. Sign in for live device details.',
        time: '10m ago',
        type: 'alert',
        read: false
    },
    {
        id: '2',
        title: 'Sample supply handoff',
        message: 'A sample supply milestone is ready for operator review. No live order data is shown here.',
        time: '1h ago',
        type: 'success',
        read: false
    },
    {
        id: '3',
        title: 'Sample protocol reminder',
        message: 'A training reviewer assigned a placeholder module to a sample learner.',
        time: '3h ago',
        type: 'info',
        read: true
    },
    {
        id: '4',
        title: 'Academy readiness update',
        message: 'A sample staff profile completed Module 2.',
        time: '1d ago',
        type: 'success',
        read: true
    }
];

const NOTIFICATION_ACTION_STATUS_ID = 'nexus-notifications-action-status';
const NOTIFICATION_ACTION_STATUS_LABEL = 'Notification action status';

export const NotificationCenter: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [actionStatus, setActionStatus] = useState('Ready to manage sample notifications.');

    const unreadCount = notifications.filter(n => !n.read).length;

    const openNotifications = () => {
        setOpen(true);
        setActionStatus(
            `Sample notifications opened with ${notifications.length} item${notifications.length === 1 ? '' : 's'} and ${unreadCount} unread.`
        );
    };

    const closeNotifications = () => {
        setOpen(false);
        setActionStatus('Sample notifications panel closed.');
    };

    const toggleNotifications = () => {
        if (open) {
            closeNotifications();
            return;
        }

        openNotifications();
    };

    const markAllRead = () => {
        const unread = unreadCount;
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setActionStatus(`Marked ${unread} sample notification${unread === 1 ? '' : 's'} as read.`);
    };

    const clearAll = () => {
        const currentCount = notifications.length;
        setNotifications([]);
        setActionStatus(
            currentCount > 0
                ? `Cleared ${currentCount} sample notification${currentCount === 1 ? '' : 's'}.`
                : 'No sample notifications were available to clear.'
        );
    };

    const removeNotification = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const removedNotification = notifications.find(notification => notification.id === id);
        setNotifications(prev => prev.filter(n => n.id !== id));
        setActionStatus(
            removedNotification
                ? `Removed ${removedNotification.title} from sample notifications.`
                : 'Sample notification was already removed.'
        );
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <AlertCircle className="w-5 h-5 text-amber-500" />;
            case 'success': return <Check className="w-5 h-5 text-emerald-500" />;
            case 'info': return <Activity className="w-5 h-5 text-cyan-500" />;
            case 'message': return <MessageSquare className="w-5 h-5 text-indigo-500" />;
            default: return <Bell className="w-5 h-5 text-slate-500" />;
        }
    };

    return (
        <div className="relative z-50">
            {/* Trigger Button */}
            <button
                type="button"
                onClick={toggleNotifications}
                aria-controls="nexus-notifications-panel"
                aria-describedby={NOTIFICATION_ACTION_STATUS_ID}
                aria-expanded={open}
                aria-label="Open sample notifications"
                className={`p-2 rounded-lg transition-all relative ${open ? 'bg-cyan-400/[0.12] text-cyan-100' : 'text-slate-300 hover:bg-white/[0.08] hover:text-slate-100'
                    }`}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            <p
                id={NOTIFICATION_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={NOTIFICATION_ACTION_STATUS_LABEL}
                className="sr-only"
            >
                {actionStatus}
            </p>

            {/* Popover */}
            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop to close */}
                        <button
                            type="button"
                            className="fixed inset-0 z-40 cursor-default bg-transparent"
                            onClick={closeNotifications}
                            aria-describedby={NOTIFICATION_ACTION_STATUS_ID}
                            aria-label="Close sample notifications"
                        />

                        <motion.div
                            id="nexus-notifications-panel"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="notifications-panel-title"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full z-50 mt-2 w-96 origin-top-right overflow-hidden rounded-lg border border-white/[0.10] bg-slate-950/[0.94] text-slate-100 shadow-none"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/[0.10] bg-white/[0.045] p-4 backdrop-blur">
                                <h3 id="notifications-panel-title" className="font-bold text-white">Sample notifications</h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={markAllRead}
                                            aria-describedby={NOTIFICATION_ACTION_STATUS_ID}
                                            className="text-[10px] font-bold text-cyan-100 hover:text-cyan-50 hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        aria-describedby={NOTIFICATION_ACTION_STATUS_ID}
                                        className="text-[10px] font-bold text-slate-400 hover:text-slate-200"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            <p
                                aria-hidden="true"
                                className="border-b border-white/[0.10] bg-white/[0.035] px-4 py-2 text-xs font-medium text-slate-300"
                            >
                                {actionStatus}
                            </p>

                            {/* List */}
                            <div className="max-h-[60vh] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="py-12 text-center text-slate-400">
                                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-sm">No new notifications</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/[0.10]">
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`group relative p-4 transition-colors hover:bg-white/[0.045] ${!notification.read ? 'bg-cyan-400/[0.10]' : ''
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.10] bg-white/[0.08]">
                                                        {getIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <h4 className={`text-sm ${!notification.read ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                                {notification.time}
                                                            </span>
                                                        </div>
                                                        <p className="line-clamp-2 text-xs leading-relaxed text-slate-300">
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Delete Action */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => removeNotification(notification.id, e)}
                                                    aria-label={`Remove ${notification.title}`}
                                                    aria-describedby={NOTIFICATION_ACTION_STATUS_ID}
                                                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>

                                                {!notification.read && (
                                                    <div className="absolute top-1/2 right-3 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full" />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-white/[0.10] bg-white/[0.045] p-2">
                                <p className="flex items-center justify-center gap-1 py-2 text-center text-xs font-semibold text-slate-500">
                                    Notification settings require account sign-in <ChevronRight className="w-3 h-3" aria-hidden="true" />
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
