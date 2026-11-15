'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, CreditCard } from 'lucide-react';
import { formatMoney, priceBookMoney } from '../lib/money';
import { create } from 'zustand';
import { useFocusTrap } from '../hooks/useFocusTrap';

const CART_SIDEBAR_ACTION_STATUS_ID = 'cart-sidebar-action-status';
const CART_SIDEBAR_ACTION_STATUS_LABEL = 'Cart sidebar action status';
const CART_ICON_ACTION_STATUS_ID = 'cart-icon-action-status';
const CART_ICON_ACTION_STATUS_LABEL = 'Cart icon action status';
const CART_ICON_ACTION_READY_STATUS =
    'Cart icon is ready. Open checkout or the cart drawer to review current items.';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface CartStoreState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const useCartStore = create<CartStoreState>((set, get) => ({
    items: [],
    addItem: (item) =>
        set((state) => {
            const existing = state.items.find((entry) => entry.id === item.id);
            if (existing) {
                return {
                    items: state.items.map((entry) =>
                        entry.id === item.id
                            ? { ...entry, quantity: entry.quantity + 1 }
                            : entry
                    ),
                };
            }
            return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
    removeItem: (id) =>
        set((state) => ({ items: state.items.filter((entry) => entry.id !== id) })),
    updateQuantity: (id, quantity) => {
        if (quantity < 1) {
            get().removeItem(id);
            return;
        }
        set((state) => ({
            items: state.items.map((entry) =>
                entry.id === id ? { ...entry, quantity } : entry
            ),
        }));
    },
    clearCart: () => set({ items: [] }),
    total: 0,
    itemCount: 0,
}));

export const useCart = () => {
    const items = useCartStore((state) => state.items);
    const addItem = useCartStore((state) => state.addItem);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const clearCart = useCartStore((state) => state.clearCart);

    return {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

// Cart Icon with Badge
export const CartIcon: React.FC<{
    onClick?: () => void;
    href?: string;
    ariaLabel?: string;
    testId?: string;
    countTestId?: string;
}> = ({
    onClick,
    href,
    ariaLabel = 'Open shopping cart',
    testId = 'cart-button',
    countTestId = 'cart-count',
}) => {
    const { itemCount } = useCart();
    const [cartIconActionStatus, setCartIconActionStatus] = React.useState(
        CART_ICON_ACTION_READY_STATUS
    );
    const getCartIconActionStatus = React.useCallback(
        () => (href ? 'Opening checkout from the cart icon.' : 'Opening cart drawer.'),
        [href]
    );
    const announceCartIconAction = React.useCallback(() => {
        setCartIconActionStatus(getCartIconActionStatus());
    }, [getCartIconActionStatus]);
    const handleCartIconAction = React.useCallback(() => {
        announceCartIconAction();
        onClick?.();
    }, [announceCartIconAction, onClick]);
    const content = (
        <>
            <ShoppingCart size={20} className="text-slate-700 transition-colors group-hover:text-slate-950" />
            {itemCount > 0 && (
                <span
                    className="cart-count absolute -top-1 -right-1 w-5 h-5 bg-cyan-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center shadow-xs"
                    data-testid={countTestId}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`${itemCount} items in cart`}
                >
                    {itemCount}
                </span>
            )}
        </>
    );
    const className =
        'group relative flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

    if (href) {
        return (
            <div className="contents" onFocus={announceCartIconAction} onClick={handleCartIconAction}>
                <p
                    id={CART_ICON_ACTION_STATUS_ID}
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={CART_ICON_ACTION_STATUS_LABEL}
                    className="sr-only"
                >
                    {cartIconActionStatus}
                </p>
                <Link
                    href={href}
                    prefetch={false}
                    className={className}
                    aria-label={ariaLabel}
                    aria-describedby={CART_ICON_ACTION_STATUS_ID}
                    data-testid={testId}
                >
                    {content}
                </Link>
            </div>
        );
    }

    return (
        <>
            <p
                id={CART_ICON_ACTION_STATUS_ID}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                aria-label={CART_ICON_ACTION_STATUS_LABEL}
                className="sr-only"
            >
                {cartIconActionStatus}
            </p>
            <button
                type="button"
                onFocus={announceCartIconAction}
                onClick={handleCartIconAction}
                className={className}
                aria-label={ariaLabel}
                aria-describedby={CART_ICON_ACTION_STATUS_ID}
                data-testid={testId}
            >
                {content}
            </button>
        </>
    );
};

// Cart Sidebar
export const CartSidebar: React.FC<{ isOpen: boolean; onClose: () => void; onCheckout?: () => void }> = ({ isOpen, onClose, onCheckout }) => {
    const { items, removeItem, updateQuantity, total, clearCart } = useCart();
    const [cartActionStatus, setCartActionStatus] = React.useState('Cart controls are ready.');

    // Focus trap for accessibility - clickOutsideDeactivates is handled by the backdrop
    const trapRef = useFocusTrap({
        active: isOpen,
        onDeactivate: onClose,
        escapeDeactivates: true,
        clickOutsideDeactivates: true
    });

    React.useEffect(() => {
        if (isOpen) {
            setCartActionStatus('Cart controls are ready.');
        }
    }, [isOpen]);

    const handleQuantityChange = (item: CartItem, quantity: number) => {
        updateQuantity(item.id, quantity);
        setCartActionStatus(
            quantity < 1
                ? `${item.name} removed from cart.`
                : `${item.name} quantity updated to ${quantity}.`
        );
    };

    const handleRemove = (item: CartItem) => {
        removeItem(item.id);
        setCartActionStatus(`${item.name} removed from cart.`);
    };

    const handleCheckout = () => {
        onCheckout?.();
        setCartActionStatus('Checkout handoff requested for the current cart.');
    };

    const handleClearCart = () => {
        clearCart();
        setCartActionStatus('Cart cleared.');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
                        onClick={onClose}
                        aria-label="Dismiss cart backdrop"
                    />
                    <motion.div
                        ref={trapRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cart-title"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-950/95 backdrop-blur-md border-l border-white/10 z-[60] shadow-2xl flex flex-col overflow-hidden text-white"
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-transparent">
                            <h2 id="cart-title" className="text-xl font-bold tracking-tight text-white">Your Cart</h2>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex min-h-11 min-w-10 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                                aria-label="Close cart"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <p
                            id={CART_SIDEBAR_ACTION_STATUS_ID}
                            role="status"
                            aria-live="polite"
                            aria-atomic="true"
                            aria-label={CART_SIDEBAR_ACTION_STATUS_LABEL}
                            className="sr-only"
                        >
                            {cartActionStatus}
                        </p>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 min-h-0">
                            {items.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>Your cart is empty</p>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-3 sm:gap-4 p-3.5 sm:p-4 bg-white/[0.04] rounded-lg min-w-0 items-center border border-white/10 hover:border-cyan-400/30 transition-all">
                                            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg shrink-0 bg-gradient-to-br ${item.image} shadow-inner border border-white/5`} />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-slate-200 text-sm break-words">{item.name}</h3>
                                                <p className="text-cyan-400 font-bold text-sm mt-0.5">{formatMoney(priceBookMoney(item.price), { currencyDisplay: 'code' })}</p>
                                                <div className="flex items-center gap-2 mt-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                        aria-label={`Decrease quantity of ${item.name}`}
                                                        aria-describedby={CART_SIDEBAR_ACTION_STATUS_ID}
                                                        className="w-7 h-7 bg-white/[0.06] rounded-md border border-white/10 flex items-center justify-center hover:bg-white/[0.1] active:scale-95 transition-all text-slate-300 hover:text-white"
                                                    >
                                                        <Minus size={13} aria-hidden="true" />
                                                    </button>
                                                    <span className="w-7 text-center text-sm font-medium text-slate-200" aria-live="polite">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                        aria-label={`Increase quantity of ${item.name}`}
                                                        aria-describedby={CART_SIDEBAR_ACTION_STATUS_ID}
                                                        className="w-7 h-7 bg-white/[0.06] rounded-md border border-white/10 flex items-center justify-center hover:bg-white/[0.1] active:scale-95 transition-all text-slate-300 hover:text-white"
                                                    >
                                                        <Plus size={13} aria-hidden="true" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemove(item)}
                                                        aria-label={`Remove ${item.name} from cart`}
                                                        aria-describedby={CART_SIDEBAR_ACTION_STATUS_ID}
                                                        className="ml-auto inline-flex min-h-7 min-w-7 items-center justify-center text-slate-500 hover:text-rose-400 rounded-md hover:bg-rose-500/10 transition-colors p-1"
                                                    >
                                                        <Trash2 size={15} aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Promo Code Accordion */}
                                    <details className="mt-6 group border border-white/10 bg-white/[0.02] rounded-lg overflow-hidden transition-all duration-300">
                                        <summary className="p-4 cursor-pointer text-sm font-medium text-slate-300 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 list-none flex justify-between items-center">
                                            <span>Add a promo code</span>
                                            <Plus size={16} className="text-slate-500 group-open:hidden" />
                                            <Minus size={16} className="text-slate-500 hidden group-open:block" />
                                        </summary>
                                        <div className="p-4 pt-0 border-t border-white/5 mt-1 flex gap-2">
                                            <input type="text" placeholder="Promo code" className="flex-1 bg-white/[0.04] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50" />
                                            <button className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-medium rounded-md transition-colors border border-white/10">Apply</button>
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-4 sm:p-6 border-t border-white/10 bg-slate-950/80 backdrop-blur-lg shadow-[0_-8px_20px_rgba(0,0,0,0.2)] space-y-3 sm:space-y-4 shrink-0 z-10 relative">
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
                                <div className="flex justify-between items-baseline text-base sm:text-lg font-bold">
                                    <span className="text-slate-300">Total</span>
                                    <span className="text-cyan-400">{formatMoney(priceBookMoney(total), { currencyDisplay: 'code' })}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCheckout}
                                    aria-describedby={CART_SIDEBAR_ACTION_STATUS_ID}
                                    className="w-full py-3.5 sm:py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 min-h-11 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-[0.99] border border-cyan-400/50"
                                >
                                    <svg xmlns="http://www.w3.org/20oda0/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    Proceed to Checkout
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearCart}
                                    aria-describedby={CART_SIDEBAR_ACTION_STATUS_ID}
                                    className="w-full min-h-11 py-1 text-xs sm:text-sm text-slate-500 hover:text-rose-400 transition-colors font-medium"
                                >
                                    Clear Cart
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
