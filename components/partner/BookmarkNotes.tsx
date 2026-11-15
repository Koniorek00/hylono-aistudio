import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, BookmarkCheck, StickyNote, X, Plus, Trash2 } from 'lucide-react';

interface BookmarkNote {
    id: string;
    timestamp: number; // percentage
    note: string;
    createdAt: string;
}

interface BookmarkNotesProps {
    videoId: string;
    currentProgress: number;
    onSeek?: (timestamp: number) => void;
}

export const BookmarkNotes: React.FC<BookmarkNotesProps> = ({ videoId, currentProgress, onSeek }) => {
    const [bookmarkCounter, setBookmarkCounter] = useState(3);
    const [bookmarks, setBookmarks] = useState<BookmarkNote[]>([
        { id: '1', timestamp: 25, note: 'Important safety tip here!', createdAt: '2 min ago' },
        { id: '2', timestamp: 60, note: 'Remember this sequence', createdAt: '1 min ago' }
    ]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [actionStatus, setActionStatus] = useState('Ready to manage sample lesson notes.');
    const safeVideoId = videoId.replace(/[^A-Za-z0-9_-]/g, '-');
    const panelId = `bookmark-notes-panel-${safeVideoId}`;
    const statusId = `bookmark-notes-action-status-${safeVideoId}`;

    const addBookmark = () => {
        const trimmedNote = newNote.trim();
        if (!trimmedNote) {
            setActionStatus('Enter a note before adding a sample bookmark.');
            return;
        }

        const bookmarkId = `bookmark-${bookmarkCounter}`;
        const timestamp = Math.round(currentProgress);
        setBookmarkCounter((prev) => prev + 1);

        const bookmark: BookmarkNote = {
            id: bookmarkId,
            timestamp,
            note: trimmedNote,
            createdAt: 'Just now'
        };

        setBookmarks(prev => [...prev, bookmark].sort((a, b) => a.timestamp - b.timestamp));
        setNewNote('');
        setActionStatus(`Added note at ${timestamp}%: ${trimmedNote}.`);
    };

    const removeBookmark = (bookmark: BookmarkNote) => {
        setBookmarks(prev => prev.filter(b => b.id !== bookmark.id));
        setActionStatus(`Removed note at ${bookmark.timestamp}%: ${bookmark.note}.`);
    };

    const seekToBookmark = (bookmark: BookmarkNote) => {
        if (onSeek) {
            onSeek(bookmark.timestamp);
            setActionStatus(`Moved sample lesson preview to note at ${bookmark.timestamp}%: ${bookmark.note}.`);
            return;
        }

        setActionStatus(
            `Selected note at ${bookmark.timestamp}%: ${bookmark.note}. Player seek is unavailable in this preview.`
        );
    };

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls={isExpanded ? panelId : undefined}
                aria-label={`${isExpanded ? 'Hide' : 'Show'} bookmark notes`}
                aria-describedby={statusId}
                className={`flex min-h-11 items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${
                    isExpanded
                        ? 'bg-amber-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
                {bookmarks.length > 0 ? (
                    <BookmarkCheck className="w-4 h-4" />
                ) : (
                    <Bookmark className="w-4 h-4" />
                )}
                <span>{bookmarks.length} Notes</span>
            </button>
            {!isExpanded && (
                <p
                    id={statusId}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label="Bookmark notes action status"
                    className="sr-only"
                >
                    {actionStatus}
                </p>
            )}

            {/* Expanded Panel */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        id={panelId}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full right-0 mb-2 w-72 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden"
                    >
                        <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white">
                                <StickyNote className="w-4 h-4 text-amber-400" />
                                <span className="font-medium text-sm">My Notes</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsExpanded(false)}
                                aria-label="Close bookmark notes"
                                aria-describedby={statusId}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p
                            id={statusId}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label="Bookmark notes action status"
                            className="border-b border-slate-800 bg-slate-950/70 px-3 py-2 text-xs leading-5 text-slate-300"
                        >
                            {actionStatus}
                        </p>

                        {/* Notes List */}
                        <div className="max-h-48 overflow-y-auto">
                            {bookmarks.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    No bookmarks yet. Add one below!
                                </div>
                            ) : (
                                bookmarks.map((bm) => (
                                    <div
                                        key={bm.id}
                                        className="p-3 border-b border-slate-800 hover:bg-slate-800/50 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <button
                                                type="button"
                                                onClick={() => seekToBookmark(bm)}
                                                aria-label={`Seek to note at ${bm.timestamp}%: ${bm.note}`}
                                                aria-describedby={statusId}
                                                className="flex-1 text-left"
                                            >
                                                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                                                    @{bm.timestamp}%
                                                </span>
                                                <p className="text-sm text-white mt-1">{bm.note}</p>
                                                <span className="text-[10px] text-slate-500">{bm.createdAt}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => removeBookmark(bm)}
                                                aria-label={`Remove note at ${bm.timestamp}%`}
                                                aria-describedby={statusId}
                                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Note */}
                        <div className="p-3 bg-slate-800 border-t border-slate-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addBookmark()}
                                    aria-label="New bookmark note"
                                    aria-describedby={statusId}
                                    placeholder={`Add note at ${Math.round(currentProgress)}%...`}
                                    className="flex-1 px-3 py-1.5 text-sm bg-slate-700 text-white rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <button
                                    type="button"
                                    onClick={addBookmark}
                                    disabled={!newNote.trim()}
                                    aria-label="Add bookmark note"
                                    aria-describedby={statusId}
                                    className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
