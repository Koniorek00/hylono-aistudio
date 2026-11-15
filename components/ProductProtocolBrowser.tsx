/**
 * ProductProtocolBrowser
 * Searchable dropdown for browsing products, protocols, and goals
 * Integrates with smart messaging interface
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Package, BookOpen, Target, X, Check, Star
} from 'lucide-react';
import { OptimizedImage } from './shared/OptimizedImage';
import { products } from '../content/products';
import { protocols } from '../content/protocols';
import { goals } from '../content/goals';
import { priceBookMonthlyText, priceBookText } from '@/lib/money';

type BrowseCategory = 'products' | 'protocols' | 'goals';

export interface SelectedItem {
  id: string;
  type: BrowseCategory;
  title: string;
}

interface ProductProtocolBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: SelectedItem) => void;
  selectedItems?: SelectedItem[];
  multiSelect?: boolean;
}

export const PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID =
  'product-protocol-browser-action-status';
const PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_LABEL =
  'Product protocol browser action status';

const categoryConfig = {
  products: {
    label: 'Products',
    icon: Package,
    color: 'cyan',
    bgClass: 'bg-cyan-300/10',
    textClass: 'text-cyan-100',
    borderClass: 'border-cyan-300/30',
  },
  protocols: {
    label: 'Protocols',
    icon: BookOpen,
    color: 'violet',
    bgClass: 'bg-violet-300/10',
    textClass: 'text-violet-100',
    borderClass: 'border-violet-300/30',
  },
  goals: {
    label: 'Goals',
    icon: Target,
    color: 'emerald',
    bgClass: 'bg-emerald-300/10',
    textClass: 'text-emerald-100',
    borderClass: 'border-emerald-300/30',
  },
};

export const ProductProtocolBrowser: React.FC<ProductProtocolBrowserProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedItems = [],
  multiSelect = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<BrowseCategory | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prepare searchable items
  const searchableItems = useMemo(() => {
    const items: Array<{
      id: string;
      type: BrowseCategory;
      title: string;
      description: string;
      image?: string;
      badge?: string;
      rating?: number;
    }> = [];

    // Add products
    products.forEach(product => {
      items.push({
        id: product.id,
        type: 'products',
        title: product.title,
        description: product.shortDescription,
        image: product.images[0],
        badge: product.rentalPlans?.[0]
          ? priceBookMonthlyText(product.rentalPlans[0].monthlyPrice)
          : priceBookText(product.purchasePrice),
        rating: product.rating,
      });
    });

    // Add protocols
    protocols.forEach(protocol => {
      items.push({
        id: protocol.slug,
        type: 'protocols',
        title: protocol.title,
        description: protocol.shortDescription,
        badge: protocol.targetAudience,
      });
    });

    // Add goals
    goals.forEach(goal => {
      items.push({
        id: goal.slug,
        type: 'goals',
        title: goal.title,
        description: goal.subtitle,
      });
    });

    return items;
  }, []);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let items = searchableItems;

    // Filter by category
    if (activeCategory !== 'all') {
      items = items.filter(item => item.type === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    return items;
  }, [searchableItems, activeCategory, searchQuery]);

  const activeCategoryLabel =
    activeCategory === 'all'
      ? 'all categories'
      : categoryConfig[activeCategory].label.toLowerCase();
  const selectedItemsSummary =
    selectedItems.length > 0
      ? ` ${selectedItems.length} item${selectedItems.length === 1 ? '' : 's'} selected.`
      : '';
  const browserActionStatus = searchQuery.trim()
    ? `${filteredItems.length} ${filteredItems.length === 1 ? 'result matches' : 'results match'} "${searchQuery.trim()}" in ${activeCategoryLabel}.${selectedItemsSummary}`
    : `${filteredItems.length} item${filteredItems.length === 1 ? ' is' : 's are'} available in ${activeCategoryLabel}.${selectedItemsSummary}`;

  // Group items by type for display
  const groupedItems = useMemo(() => {
    const groups: Record<BrowseCategory, typeof filteredItems> = {
      products: [],
      protocols: [],
      goals: [],
    };

    filteredItems.forEach(item => {
      groups[item.type].push(item);
    });

    return groups;
  }, [filteredItems]);

  const isSelected = (item: typeof searchableItems[0]) => {
    return selectedItems.some(si => si.id === item.id && si.type === item.type);
  };

  const handleItemClick = (item: typeof searchableItems[0]) => {
    onSelect({
      id: item.id,
      type: item.type,
      title: item.title,
    });

    if (!multiSelect) {
      onClose();
    }
  };

  const renderCategoryTabs = () => (
    <div className="flex items-center gap-1 border-b border-white/10 bg-white/[0.045] px-4 py-2">
      <button
        type="button"
        onClick={() => setActiveCategory('all')}
        aria-pressed={activeCategory === 'all'}
        aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          activeCategory === 'all'
            ? 'bg-cyan-300 text-slate-950'
            : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
        }`}
      >
        All
      </button>
      {(['products', 'protocols', 'goals'] as const).map(cat => {
        const config = categoryConfig[cat];
        const Icon = config.icon;
        const count = groupedItems[cat].length;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            aria-pressed={activeCategory === cat}
            aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat
                ? `${config.bgClass} ${config.textClass} ${config.borderClass} border`
                : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <Icon size={12} />
            {config.label}
            {count > 0 && (
              <span className="text-[10px] opacity-60">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderItem = (item: typeof searchableItems[0]) => {
    const config = categoryConfig[item.type];
    const Icon = config.icon;
    const selected = isSelected(item);

    return (
      <motion.button
        key={`${item.type}-${item.id}`}
        type="button"
        onClick={() => handleItemClick(item)}
        aria-pressed={selected}
        aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all hover:bg-white/[0.08] ${
          selected ? 'bg-cyan-300/10 ring-1 ring-cyan-300/30' : ''
        }`}
      >
        {/* Image or Icon */}
        {item.image ? (
          <OptimizedImage
            src={item.image}
            alt={item.title}
            width={48}
            height={48}
            sizes="48px"
            className="h-12 w-12 rounded-lg border border-white/10 object-cover"
          />
        ) : (
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${config.borderClass} ${config.bgClass}`}>
            <Icon size={20} className={config.textClass} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">{item.title}</p>
            {item.rating && (
              <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                <Star size={10} fill="currentColor" />
                {item.rating}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-slate-400">{item.description}</p>
        </div>

        {/* Badge */}
        {item.badge && (
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${config.bgClass} ${config.textClass}`}>
            {item.badge}
          </span>
        )}

        {/* Selected indicator */}
        {selected && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-300">
            <Check size={12} className="text-slate-950" />
          </div>
        )}
      </motion.button>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        role="dialog"
        aria-label="Product protocol browser"
        aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
        className="absolute left-0 right-0 top-full z-50 mt-2 flex max-h-[400px] flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-950/95 text-white shadow-2xl shadow-slate-950/30"
      >
        <p
          id={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_LABEL}
          className="sr-only"
        >
          {browserActionStatus}
        </p>

        {/* Search Header */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <Search size={16} className="text-cyan-200" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search products, protocols, and goals"
            aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
            placeholder="Search products, protocols, goals..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear product protocol browser search"
              aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
              className="rounded-md p-1 text-slate-400 hover:bg-white/[0.08] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        {renderCategoryTabs()}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              <Package size={32} className="mx-auto mb-2 opacity-30" />
              <p>No items found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-1">
              {activeCategory === 'all' ? (
                <>
                  {groupedItems.products.length > 0 && (
                    <div className="mb-3">
                      <h4 className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
                        <Package size={10} /> Products
                      </h4>
                      {groupedItems.products.slice(0, 3).map(renderItem)}
                      {groupedItems.products.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setActiveCategory('products')}
                          aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
                          className="w-full rounded-lg py-2 text-center text-xs font-semibold text-cyan-200 hover:bg-white/[0.08]"
                        >
                          View all {groupedItems.products.length} products
                        </button>
                      )}
                    </div>
                  )}
                  {groupedItems.protocols.length > 0 && (
                    <div className="mb-3">
                      <h4 className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
                        <BookOpen size={10} /> Protocols
                      </h4>
                      {groupedItems.protocols.slice(0, 2).map(renderItem)}
                      {groupedItems.protocols.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setActiveCategory('protocols')}
                          aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
                          className="w-full rounded-lg py-2 text-center text-xs font-semibold text-violet-200 hover:bg-white/[0.08]"
                        >
                          View all {groupedItems.protocols.length} protocols
                        </button>
                      )}
                    </div>
                  )}
                  {groupedItems.goals.length > 0 && (
                    <div>
                      <h4 className="px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
                        <Target size={10} /> Goals
                      </h4>
                      {groupedItems.goals.slice(0, 2).map(renderItem)}
                      {groupedItems.goals.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setActiveCategory('goals')}
                          aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
                          className="w-full rounded-lg py-2 text-center text-xs font-semibold text-emerald-200 hover:bg-white/[0.08]"
                        >
                          View all {groupedItems.goals.length} goals
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                groupedItems[activeCategory].map(renderItem)
              )}
            </div>
          )}
        </div>

        {/* Selected Items Footer */}
        {selectedItems.length > 0 && (
          <div className="border-t border-white/10 bg-white/[0.045] px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-describedby={PRODUCT_PROTOCOL_BROWSER_ACTION_STATUS_ID}
                className="rounded-lg bg-cyan-300 px-4 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-200"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductProtocolBrowser;
