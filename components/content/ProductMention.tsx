import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getProductForRouteSlug } from '../../content/products';
import { TECH_DETAILS } from '../../constants';
import { TechType } from '../../types';
import { priceBookMonthlyText, priceBookText } from '@/lib/money';

type MentionContext = 'article' | 'protocol' | 'recommended';

interface ProductMentionProps {
  productId: TechType;
  context?: MentionContext;
}

const contextLabel: Record<MentionContext, string> = {
  article: 'Device mentioned in this article:',
  protocol: 'Required device:',
  recommended: 'Recommended product:',
};

export const ProductMention: React.FC<ProductMentionProps> = ({
  productId,
  context = 'recommended',
}) => {
  const router = useRouter();
  const product = TECH_DETAILS[productId];
  const canonicalProduct = getProductForRouteSlug(productId.toLowerCase());
  const canonicalRentalPrice = canonicalProduct?.rentalPlans?.length
    ? Math.min(...canonicalProduct.rentalPlans.map((plan) => plan.monthlyPrice))
    : undefined;

  const navigateTo = (path: string) => {
    router.push(`/${path}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-3">
        {contextLabel[context]}
      </p>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-bold text-slate-900 text-sm">{product.name}</p>
          <p className="text-xs text-slate-600 mt-1">
            {canonicalProduct ? (
              <>
                Buy: {priceBookText(canonicalProduct.purchasePrice)}
                {canonicalRentalPrice ? ` | Rent: from ${priceBookMonthlyText(canonicalRentalPrice)}` : ''}
              </>
            ) : (
              'Request / verify'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigateTo(`product/${product.id.toLowerCase()}`)}
          className="text-xs font-bold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1"
          aria-label={`View product ${product.name}`}
        >
          View product <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
