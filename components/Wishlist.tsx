'use client';

import React from 'react';
import { ArrowRight, Heart, LifeBuoy, ShoppingBag, ShoppingCart, Trash2 } from 'lucide-react';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { siteEntity } from '../content/site-entity';
import analytics from '../src/lib/analytics';
import { useCart } from './Cart';
import { formatMoney, priceBookMoney } from '../lib/money';

interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string;
}

interface WishlistStoreState {
    items: WishlistItem[];
    addItem: (item: WishlistItem) => void;
    removeItem: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    clearWishlist: () => void;
}

const noopStorage: StateStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
};

const isTestEnvironment =
    process.env.NODE_ENV === 'test' || process.env.VITEST === 'true';

const useWishlistStore = create<WishlistStoreState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) =>
                set((state) => ({
                    items: state.items.some((entry) => entry.id === item.id)
                        ? state.items
                        : [...state.items, item],
                })),
            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((entry) => entry.id !== id) })),
            isInWishlist: (id) => get().items.some((entry) => entry.id === id),
            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'hylono_wishlist',
            storage: createJSONStorage(() =>
                typeof window !== 'undefined' && !isTestEnvironment
                    ? localStorage
                    : noopStorage
            ),
        }
    )
);

const focusRingClass =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300';

const primaryActionClassName =
    `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-200 motion-reduce:transition-none ${focusRingClass}`;

const secondaryActionClassName =
    `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-cyan-300/40 hover:bg-white/[0.08] hover:text-white motion-reduce:transition-none ${focusRingClass}`;

const WISHLIST_ACTION_STATUS_ID = 'wishlist-action-status';
const WISHLIST_ACTION_STATUS_LABEL = 'Wishlist action status';
const WISHLIST_TOGGLE_STATUS_PREFIX = 'wishlist-toggle-status';

const trackWishlistAction = (
    action: string,
    properties: Record<string, string | number | boolean> = {}
) => {
    analytics.capture('wishlist_route_action_clicked', {
        route: '/wishlist',
        action,
        ...properties,
    });
};

export const useWishlist = () => {
    const items = useWishlistStore((state) => state.items);
    const addItem = useWishlistStore((state) => state.addItem);
    const removeItem = useWishlistStore((state) => state.removeItem);
    const isInWishlist = useWishlistStore((state) => state.isInWishlist);
    const clearWishlist = useWishlistStore((state) => state.clearWishlist);

    return React.useMemo(
        () => ({
            items,
            addItem,
            removeItem,
            isInWishlist,
            clearWishlist,
        }),
        [items, addItem, removeItem, isInWishlist, clearWishlist]
    );
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

// Heart Button for Product Cards
export const WishlistButton: React.FC<{ product: WishlistItem }> = ({ product }) => {
    const { addItem, removeItem, isInWishlist } = useWishlist();
    const inWishlist = isInWishlist(product.id);
    const toggleStatusId = `${WISHLIST_TOGGLE_STATUS_PREFIX}-${product.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
    const toggleStatusMessage = inWishlist
        ? `${product.name} is saved to your wishlist.`
        : `${product.name} can be saved to your wishlist.`;

    return (
        <>
            <span
                id={toggleStatusId}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={`${product.name} wishlist toggle status`}
                className="sr-only"
            >
                {toggleStatusMessage}
            </span>
            <button
                type="button"
                onClick={() => inWishlist ? removeItem(product.id) : addItem(product)}
                aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
                aria-pressed={inWishlist}
                aria-describedby={toggleStatusId}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors motion-reduce:transition-none ${focusRingClass} ${inWishlist
                        ? 'border-red-300/30 bg-red-300/[0.10] text-red-100'
                        : 'border-white/10 bg-white/[0.045] text-slate-400 hover:border-red-300/30 hover:bg-red-300/[0.08] hover:text-red-100'
                    }`}
            >
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
        </>
    );
};

// Wishlist Page
export const WishlistPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
    const { items, removeItem, clearWishlist } = useWishlist();
    const { addItem: addCartItem } = useCart();
    const [statusMessage, setStatusMessage] = React.useState('');

    const handleClearWishlist = () => {
        trackWishlistAction('wishlist_cleared', {
            item_count: items.length,
        });
        clearWishlist();
        setStatusMessage('Wishlist cleared.');
    };

    const handleMoveToCheckout = (item: WishlistItem) => {
        trackWishlistAction('move_to_checkout_clicked', {
            destination: '/checkout',
            item_count: items.length,
        });
        addCartItem(item);
        removeItem(item.id);
        setStatusMessage(`${item.name} moved to checkout cart.`);
        onNavigate('checkout');
    };

    const getWishlistLinkStatusProps = (
        message: string,
        onClick: React.MouseEventHandler<HTMLAnchorElement>
    ) => ({
        'aria-describedby': WISHLIST_ACTION_STATUS_ID,
        onFocus: () => setStatusMessage(message),
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
            setStatusMessage(message);
            onClick(event);
        },
    });

    return (
        <div className="min-h-screen bg-slate-950 pt-32 pb-24 text-white">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Private shortlist</p>
                        <h1 className="text-3xl font-bold text-white">Saved products</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                            Review saved products, move ready items to checkout, or use support before committing to the next step.
                        </p>
                    </div>
                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearWishlist}
                            onFocus={() => setStatusMessage('Clear wishlist action ready.')}
                            aria-describedby={WISHLIST_ACTION_STATUS_ID}
                            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-300/30 bg-red-300/[0.08] px-4 py-3 text-sm font-semibold text-red-100 transition-colors hover:border-red-200/50 hover:bg-red-300/[0.12] hover:text-white motion-reduce:transition-none ${focusRingClass}`}
                        >
                            <Trash2 size={16} aria-hidden="true" />
                            Clear wishlist
                        </button>
                    )}
                </div>

                <p
                    id={WISHLIST_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={WISHLIST_ACTION_STATUS_LABEL}
                    className="sr-only"
                >
                    {statusMessage}
                </p>

                {items.length === 0 ? (
                    <section
                        aria-labelledby="wishlist-empty-title"
                        className="rounded-lg border border-white/10 bg-white/[0.045] px-6 py-12 text-center"
                    >
                        <Heart className="mx-auto mb-4 text-slate-500" size={64} aria-hidden="true" />
                        <h2 id="wishlist-empty-title" className="text-2xl font-bold text-white">No saved products yet</h2>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
                            Start from the store, compare rental access, or open help if you need support before saving a product.
                        </p>
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <a
                                href="/store"
                                {...getWishlistLinkStatusProps('Opening store from the empty wishlist.', () =>
                                    trackWishlistAction('empty_state_exit_clicked', {
                                        destination: '/store',
                                        item_count: 0,
                                    })
                                )}
                                className={primaryActionClassName}
                            >
                                <ShoppingBag size={16} aria-hidden="true" />
                                Browse store
                            </a>
                            <a
                                href="/rental"
                                {...getWishlistLinkStatusProps('Opening rental access from the empty wishlist.', () =>
                                    trackWishlistAction('empty_state_exit_clicked', {
                                        destination: '/rental',
                                        item_count: 0,
                                    })
                                )}
                                className={secondaryActionClassName}
                            >
                                Review rental access
                                <ArrowRight size={16} aria-hidden="true" />
                            </a>
                            <a
                                href="/help"
                                {...getWishlistLinkStatusProps('Opening help center from the empty wishlist.', () =>
                                    trackWishlistAction('empty_state_exit_clicked', {
                                        destination: '/help',
                                        item_count: 0,
                                    })
                                )}
                                className={secondaryActionClassName}
                            >
                                <LifeBuoy size={16} aria-hidden="true" />
                                Open help center
                            </a>
                        </div>
                    </section>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => (
                                <article
                                    key={item.id}
                                    className="rounded-lg border border-white/10 bg-white/[0.045] p-4"
                                >
                                    <div className={`mb-4 aspect-square rounded-lg bg-gradient-to-br ${item.image}`} aria-hidden="true" />
                                    <h2 className="mb-1 text-lg font-bold text-white">{item.name}</h2>
                                    <p className="mb-4 text-sm font-bold text-cyan-200">{formatMoney(priceBookMoney(item.price), { currencyDisplay: 'code' })}</p>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleMoveToCheckout(item)}
                                            onFocus={() => setStatusMessage(`${item.name} checkout action ready.`)}
                                            aria-describedby={WISHLIST_ACTION_STATUS_ID}
                                            className={primaryActionClassName}
                                        >
                                            <ShoppingCart size={16} aria-hidden="true" />
                                            Move to checkout
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                trackWishlistAction('saved_item_removed', {
                                                    item_count: items.length,
                                                });
                                                removeItem(item.id);
                                                setStatusMessage(`${item.name} removed from wishlist.`);
                                            }}
                                            onFocus={() => setStatusMessage(`${item.name} remove action ready.`)}
                                            aria-label={`Remove ${item.name} from wishlist`}
                                            aria-describedby={WISHLIST_ACTION_STATUS_ID}
                                            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-red-300/30 hover:bg-red-300/[0.08] hover:text-red-100 motion-reduce:transition-none ${focusRingClass}`}
                                        >
                                            <Trash2 size={16} aria-hidden="true" />
                                            Remove
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <section
                            aria-labelledby="wishlist-support-title"
                            className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-6"
                        >
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">{siteEntity.supportCoverageLabel}</p>
                            <h2 id="wishlist-support-title" className="text-xl font-bold text-white">Wishlist support</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                                Use help or email support before checkout when a saved item needs product-fit or access guidance.
                            </p>
                            <dl className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                                <div>
                                    <dt className="font-semibold text-white">Support hours</dt>
                                    <dd>{siteEntity.supportHours}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-white">Support email</dt>
                                    <dd>
                                        <a
                                            href={`mailto:${siteEntity.supportEmail}`}
                                            {...getWishlistLinkStatusProps('Opening wishlist support email.', () =>
                                                trackWishlistAction('support_email_clicked', {
                                                    destination: 'mailto:support',
                                                    item_count: items.length,
                                                })
                                            )}
                                            className={`text-cyan-200 underline-offset-4 hover:underline ${focusRingClass}`}
                                        >
                                            {siteEntity.supportEmail}
                                        </a>
                                    </dd>
                                </div>
                            </dl>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <a
                                    href="/help"
                                    {...getWishlistLinkStatusProps('Opening help center from wishlist support.', () =>
                                        trackWishlistAction('support_exit_clicked', {
                                            destination: '/help',
                                            item_count: items.length,
                                        })
                                    )}
                                    className={secondaryActionClassName}
                                >
                                    <LifeBuoy size={16} aria-hidden="true" />
                                    Open help center
                                </a>
                                <a
                                    href="/store"
                                    {...getWishlistLinkStatusProps('Opening store from wishlist support.', () =>
                                        trackWishlistAction('support_exit_clicked', {
                                            destination: '/store',
                                            item_count: items.length,
                                        })
                                    )}
                                    className={secondaryActionClassName}
                                >
                                    <ShoppingBag size={16} aria-hidden="true" />
                                    Continue browsing
                                </a>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};
