import { Suspense } from 'react';
import StructuredData from '@/src/components/StructuredData';
import { ProductHbot2Client } from './ProductHbot2Client';
import { buildHbot2StructuredData, hbot2Metadata } from './route-config';

export const metadata = hbot2Metadata;

// [DECISION: static noindex clone route because this target must preserve the current HBOT PDP behavior without changing the shared /product/[tech] implementation.]
// Rendering strategy: server-render metadata and JSON-LD for /product/hbot2, then delegate the interactive body to a client leaf.
export default function Hbot2ProductPage() {
  const { webPageSchema, productSchema, breadcrumbSchema, faqSchema } =
    buildHbot2StructuredData();

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-hbot2-product-page" data={webPageSchema} />
        <StructuredData id="jsonld-hbot2-product" data={productSchema} />
        <StructuredData id="jsonld-hbot2-breadcrumb" data={breadcrumbSchema} />
        {faqSchema && <StructuredData id="jsonld-hbot2-faq" data={faqSchema} />}
      </Suspense>
      <ProductHbot2Client />
    </>
  );
}
