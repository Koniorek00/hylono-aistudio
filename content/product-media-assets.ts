export const PRODUCT_MEDIA_CONSUMERS = [
  'visible_ui',
  'schema',
  'og',
  'sitemap_image',
  'search_card',
  'rental_card',
  'email',
  'crm',
  'campaign',
  'sales_pdf',
] as const;

export type ProductMediaConsumer = (typeof PRODUCT_MEDIA_CONSUMERS)[number];

export type ProductMediaPublicStatus =
  | 'missing'
  | 'internal_reference'
  | 'representative_only'
  | 'approved_for_route'
  | 'blocked'
  | 'expired_recheck';

export type ProductMediaPermissionStatus =
  | 'missing'
  | 'supplier_needed'
  | 'hylono_owned'
  | 'supplier_approved'
  | 'licensed'
  | 'blocked'
  | 'unknown';

export type ProductMediaReviewStatus =
  | 'owner_needed'
  | 'confirmed_owner'
  | 'not_started'
  | 'softened'
  | 'confirmed_compliance'
  | 'confirmed_counsel'
  | 'counsel_needed'
  | 'blocked';

export type ProductMediaCampaignUseStatus =
  | 'not_eligible'
  | 'internal_only'
  | 'approved_for_email'
  | 'approved_for_crm_followup'
  | 'approved_for_paid_campaign'
  | 'expired_recheck';

export type ProductMediaPack = 'HBOT' | 'Hydrogen' | 'Rental/process';

export interface ProductMediaAssetGate {
  assetId: string;
  pack: ProductMediaPack;
  productSlugs: string[];
  modelOrFlow: string;
  requiredCapture: string;
  publicStatus: ProductMediaPublicStatus;
  sourceFile: string | null;
  captureDate: string | null;
  provenanceOwner: string;
  permissionEvidenceLink: string | null;
  permissionStatus: ProductMediaPermissionStatus;
  ownerReviewStatus: ProductMediaReviewStatus;
  complianceReviewStatus: ProductMediaReviewStatus;
  privacyReviewStatus: string;
  representativeOnly: boolean | 'unknown';
  representativeLabel: string | null;
  approvedUseRoutes: string[];
  blockedUseRoutes: string[];
  approvedConsumers: ProductMediaConsumer[];
  blockedConsumers: ProductMediaConsumer[];
  safeForVisibleUi: boolean;
  safeForSchema: boolean;
  safeForOg: boolean;
  safeForSitemapImage: boolean;
  safeForSearchCard: boolean;
  safeForRentalCard: boolean;
  campaignUseStatus: ProductMediaCampaignUseStatus;
  claimRisk: string;
  linkedRegisterRows: string[];
  ownerQuestion: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  allowedCopy: string;
  forbiddenInference: string;
  nextAction: string;
}

const allConsumersBlocked = [...PRODUCT_MEDIA_CONSUMERS];

type MissingProductMediaAssetInput = Omit<
  ProductMediaAssetGate,
  | 'publicStatus'
  | 'sourceFile'
  | 'captureDate'
  | 'permissionEvidenceLink'
  | 'ownerReviewStatus'
  | 'complianceReviewStatus'
  | 'representativeLabel'
  | 'approvedUseRoutes'
  | 'approvedConsumers'
  | 'blockedConsumers'
  | 'safeForVisibleUi'
  | 'safeForSchema'
  | 'safeForOg'
  | 'safeForSitemapImage'
  | 'safeForSearchCard'
  | 'safeForRentalCard'
  | 'campaignUseStatus'
  | 'reviewedBy'
  | 'reviewedAt'
>;

const createMissingProductMediaAsset = (
  asset: MissingProductMediaAssetInput
): ProductMediaAssetGate => ({
  ...asset,
  publicStatus: 'missing',
  sourceFile: null,
  captureDate: null,
  permissionEvidenceLink: null,
  ownerReviewStatus: 'owner_needed',
  complianceReviewStatus: 'not_started',
  representativeLabel: null,
  approvedUseRoutes: [],
  approvedConsumers: [],
  blockedConsumers: allConsumersBlocked,
  safeForVisibleUi: false,
  safeForSchema: false,
  safeForOg: false,
  safeForSitemapImage: false,
  safeForSearchCard: false,
  safeForRentalCard: false,
  campaignUseStatus: 'not_eligible',
  reviewedBy: null,
  reviewedAt: null,
});

export const productMediaAssetGates: ProductMediaAssetGate[] = [
  createMissingProductMediaAsset({
    assetId: 'hbot-room-hero-001',
    pack: 'HBOT',
    productSlugs: ['hbot'],
    modelOrFlow: 'OxyLife or hard chamber',
    requiredCapture: '45-degree chamber in real room with visible scale/context',
    provenanceOwner: 'product + brand',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: 'unknown',
    blockedUseRoutes: ['/product/hbot', '/rental?device=hbot'],
    claimRisk: 'setup + model-specificity',
    linkedRegisterRows: ['SUP-002'],
    ownerQuestion:
      'Which exact chamber is available for a real-room shoot, and may it represent all hard chambers or only one model?',
    allowedCopy: 'Real-room chamber media is being prepared for route review.',
    forbiddenInference:
      'Do not imply exact OxyLife variant, availability, delivery, clinical suitability, or safety superiority.',
    nextAction: 'Assign product owner and capture/source real room hero.',
  }),
  createMissingProductMediaAsset({
    assetId: 'hbot-entry-control-001',
    pack: 'HBOT',
    productSlugs: ['hbot'],
    modelOrFlow: 'OxyLife I/80 or I/90',
    requiredCapture: 'entry/window/control panel detail without medical pressure claims',
    provenanceOwner: 'product + compliance',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: 'unknown',
    blockedUseRoutes: ['/product/hbot'],
    claimRisk: 'setup + regulatory + medical implication',
    linkedRegisterRows: ['SUP-002', 'CE-MDR rows'],
    ownerQuestion:
      'Which control/entry photos are approved, and can visible labels/pressure displays be shown?',
    allowedCopy: 'Entry and control details for setup review.',
    forbiddenInference:
      'Do not imply regulated-device status, certified procedure, pressure protocol, or clinical-use purpose.',
    nextAction: 'Capture approved entry/control detail and review visible labels.',
  }),
  createMissingProductMediaAsset({
    assetId: 'hbot-accessory-layout-001',
    pack: 'HBOT',
    productSlugs: ['hbot'],
    modelOrFlow: 'chamber setup',
    requiredCapture: 'concentrator, tubing, chiller/accessories, cable/space layout',
    provenanceOwner: 'product + compliance',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: 'unknown',
    blockedUseRoutes: ['/product/hbot', '/rental?device=hbot'],
    claimRisk: 'setup + accessory inclusion',
    linkedRegisterRows: ['SUP-002'],
    ownerQuestion:
      'Which accessories are actually included or optional per quote, rental, or product family?',
    allowedCopy: 'Accessory layout used for space and setup planning.',
    forbiddenInference:
      'Do not imply all accessories are included, clinically required, or available for every rental.',
    nextAction: 'Build accessory inclusion/optional map before public caption.',
  }),
  createMissingProductMediaAsset({
    assetId: 'hbot-scale-001',
    pack: 'HBOT',
    productSlugs: ['hbot'],
    modelOrFlow: 'hard or soft chamber',
    requiredCapture: 'human or neutral object scale without clinical setting',
    provenanceOwner: 'brand + product',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'release_needed_if_person_visible',
    representativeOnly: 'unknown',
    blockedUseRoutes: ['/product/hbot', '/rental?device=hbot'],
    claimRisk: 'privacy + body/outcome implication',
    linkedRegisterRows: ['SUP-002'],
    ownerQuestion:
      'Will a person appear, and is there a model release and no outcome/body-transformation implication?',
    allowedCopy: 'Scale reference for room planning.',
    forbiddenInference:
      'Do not imply patient use, before/after outcome, medical supervision, or clinical suitability.',
    nextAction: 'Prefer neutral object scale unless model release is confirmed.',
  }),
  createMissingProductMediaAsset({
    assetId: 'hbot-standard-soft-001',
    pack: 'HBOT',
    productSlugs: ['hbot'],
    modelOrFlow: 'Standard hard monoplace and soft chambers',
    requiredCapture: 'exact Standard/soft image or clearly qualified fallback',
    provenanceOwner: 'supplier + product',
    permissionStatus: 'supplier_needed',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: 'unknown',
    blockedUseRoutes: ['/product/hbot'],
    claimRisk: 'representative-only + supplier permission',
    linkedRegisterRows: ['SUP-002'],
    ownerQuestion:
      'Which Standard/soft chamber assets exist, and what visible representative disclaimer is required?',
    allowedCopy: 'Representative/spec-fallback media pending exact variant approval.',
    forbiddenInference: 'Do not use OxyLife, stock, Unsplash, or generated imagery as Standard/soft proof.',
    nextAction: 'Source or capture Standard/soft images; otherwise keep fallback.',
  }),
  createMissingProductMediaAsset({
    assetId: 'h2-os-ho450-setup-001',
    pack: 'Hydrogen',
    productSlugs: ['hydrogen', 'h2-hop450'],
    modelOrFlow: 'OS-HO450-P / HOP-450 alias',
    requiredCapture: 'tabletop setup, front/back, ports/display, mask/cannula/tubing',
    provenanceOwner: 'product + supplier',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: 'unknown',
    blockedUseRoutes: ['/product/hydrogen', '/rental?device=hydrogen'],
    claimRisk: 'model alias + accessory + benefit claim',
    linkedRegisterRows: ['SUP-002'],
    ownerQuestion:
      'Is the canonical public model OS-HO450-P, HOP-450, or another approved alias, and who owns the image rights?',
    allowedCopy: 'OS-HO450-P setup view for accessory and room-fit review.',
    forbiddenInference: 'Do not imply therapy, purity, output, certification, or availability beyond confirmed records.',
    nextAction: 'Resolve canonical alias and source/capture setup images.',
  }),
  createMissingProductMediaAsset({
    assetId: 'h2-pr-ho-family-setup-001',
    pack: 'Hydrogen',
    productSlugs: ['hydrogen'],
    modelOrFlow: 'PR-HO pulse family',
    requiredCapture: 'family setup with accessories, footprint, safe tubing path',
    provenanceOwner: 'product + supplier',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: true,
    blockedUseRoutes: ['/product/hydrogen'],
    claimRisk: 'product-family vs model-specific proof',
    linkedRegisterRows: ['SUP-002'],
    ownerQuestion: 'Which PR-HO models may be represented by one family image, and what label is required?',
    allowedCopy: 'Product-family setup image; confirm exact model before model-specific publication.',
    forbiddenInference: 'Do not imply each PR-HO variant has identical visible setup or included accessories.',
    nextAction: 'Capture family setup and define representative label.',
  }),
  createMissingProductMediaAsset({
    assetId: 'h2-za-ho6000-scale-001',
    pack: 'Hydrogen',
    productSlugs: ['hydrogen'],
    modelOrFlow: 'ZA-HO6000',
    requiredCapture: 'floor/room scale, front/back, display, accessory layout',
    provenanceOwner: 'product + supplier',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: 'unknown',
    blockedUseRoutes: ['/product/hydrogen'],
    claimRisk: 'premium/clinic implication + availability',
    linkedRegisterRows: ['SUP-002'],
    ownerQuestion: 'Is ZA-HO6000 available for real photo capture and approved for route use?',
    allowedCopy: 'Room-scale view for placement and setup planning.',
    forbiddenInference: 'Do not imply clinic operation, continuous-duty suitability, or live availability without confirmed rows.',
    nextAction: 'Capture/source room-scale ZA-HO6000 proof.',
  }),
  createMissingProductMediaAsset({
    assetId: 'h2-water-line-workflow-001',
    pack: 'Hydrogen',
    productSlugs: ['hydrogen'],
    modelOrFlow: 'WO/AQ water line',
    requiredCapture: 'fill/use/cleaning workflow without benefit claim',
    provenanceOwner: 'product + compliance',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: 'unknown',
    blockedUseRoutes: ['/product/hydrogen'],
    claimRisk: 'benefit + hygiene + maintenance claim',
    linkedRegisterRows: ['SUP-002'],
    ownerQuestion: 'Which water-line workflow steps are accurate, visible, and safe to show publicly?',
    allowedCopy: 'Water-line workflow reference for use and maintenance review.',
    forbiddenInference: 'Do not imply health benefit, sanitation assurance, or maintenance sufficiency.',
    nextAction: 'Capture approved workflow and cleaning/maintenance visuals.',
  }),
  createMissingProductMediaAsset({
    assetId: 'rental-packaging-001',
    pack: 'Rental/process',
    productSlugs: ['rental'],
    modelOrFlow: 'packaging and return materials',
    requiredCapture: 'packaging, return materials, neutral checklist',
    provenanceOwner: 'ops + brand',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: false,
    blockedUseRoutes: ['/rental', '/rental/checkout'],
    claimRisk: 'delivery/return/SLA implication',
    linkedRegisterRows: ['EU_Consumer_Rental_Payment_Terms_Register', 'SUP-002'],
    ownerQuestion:
      'Which packaging/return materials are real and approved, and what terms can be shown without fixed SLA?',
    allowedCopy: 'Packaging and return materials used in rental handoff planning.',
    forbiddenInference:
      'Do not imply fixed delivery, free return, fixed refund timing, or universal packaging.',
    nextAction: 'Source/capture packaging and link to confirmed rental terms.',
  }),
  createMissingProductMediaAsset({
    assetId: 'rental-manual-review-001',
    pack: 'Rental/process',
    productSlugs: ['rental'],
    modelOrFlow: 'manual review preview',
    requiredCapture: 'redacted review screen or paper checklist',
    provenanceOwner: 'ops + privacy',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'redaction_needed',
    representativeOnly: false,
    blockedUseRoutes: ['/rental', '/rental/checkout'],
    claimRisk: 'privacy + live ops + instant approval implication',
    linkedRegisterRows: ['EU_Consumer_Rental_Payment_Terms_Register', 'GDPR_Processor_DPA_Register'],
    ownerQuestion:
      'Can a redacted or sample manual-review flow be shown without customer data or live-ops implication?',
    allowedCopy: 'Redacted review example showing manual request checks before confirmation.',
    forbiddenInference:
      'Do not imply live CRM, staffed queue, instant approval, real customer records, or fixed deposit/payment timing.',
    nextAction: 'Create redacted/sample-safe manual review visual with labels.',
  }),
  createMissingProductMediaAsset({
    assetId: 'support-handoff-001',
    pack: 'Rental/process',
    productSlugs: ['contact', 'help', 'rental'],
    modelOrFlow: 'support handoff materials',
    requiredCapture: 'support card, contact route, setup review materials',
    provenanceOwner: 'ops + compliance',
    permissionStatus: 'unknown',
    privacyReviewStatus: 'not_applicable',
    representativeOnly: false,
    blockedUseRoutes: ['/contact', '/help', '/rental'],
    claimRisk: 'support SLA + advisor/clinician implication',
    linkedRegisterRows: ['Legal_Entity_Public_Contact_Register', 'EU_Consumer_Rental_Payment_Terms_Register'],
    ownerQuestion: 'Which support channel, hours, handoff language, and owner are confirmed for public use?',
    allowedCopy: 'Support handoff materials for setup review and next-step guidance.',
    forbiddenInference: 'Do not imply named advisor, clinician, assured response time, or staffed support SLA.',
    nextAction: 'Confirm support owner/channel and capture neutral handoff material.',
  }),
];

export const legacyProductMediaConsumerPaths = [
  '/images/chambers/oxyhelp-chambers-hero.jpg',
  '/images/catalog/omega3/2026/os-h150.png',
  '/images/catalog/omega3/2026/os-h200-300.png',
  '/images/catalog/omega3/2026/pr-ho450-p.png',
  '/images/catalog/omega3/2026/pr-h600.png',
  '/images/catalog/omega3/2026/pr-ho900-1800.png',
  '/images/catalog/omega3/2026/pr-ho-p-family.png',
  '/images/catalog/omega3/2026/za-ho3000-3600.png',
  '/images/catalog/omega3/2026/za-ho3000-b-4500-b.png',
  '/images/catalog/omega3/2026/za-ho6000.png',
  '/images/catalog/omega3/2026/aq-b300-b600.png',
  '/images/catalog/omega3/2026/aq-s1300-s2000.png',
  '/images/catalog/omega3/2026/aq-pw3000.png',
  '/images/catalog/omega3/2026/aq-b4500.png',
] as const;

export interface ProductMediaReadinessSummary {
  totalP0Assets: number;
  missingAssets: number;
  routeApprovedAssets: number;
  schemaSafeAssets: number;
  ogSafeAssets: number;
  sitemapSafeAssets: number;
  campaignEligibleAssets: number;
}

export const getProductMediaReadinessSummary = (): ProductMediaReadinessSummary => ({
  totalP0Assets: productMediaAssetGates.length,
  missingAssets: productMediaAssetGates.filter((asset) => asset.publicStatus === 'missing').length,
  routeApprovedAssets: productMediaAssetGates.filter(
    (asset) => asset.publicStatus === 'approved_for_route'
  ).length,
  schemaSafeAssets: productMediaAssetGates.filter((asset) => asset.safeForSchema).length,
  ogSafeAssets: productMediaAssetGates.filter((asset) => asset.safeForOg).length,
  sitemapSafeAssets: productMediaAssetGates.filter((asset) => asset.safeForSitemapImage).length,
  campaignEligibleAssets: productMediaAssetGates.filter(
    (asset) => asset.campaignUseStatus !== 'not_eligible'
  ).length,
});

export const validateProductMediaAssetForPublicUse = (
  asset: ProductMediaAssetGate,
  consumer: ProductMediaConsumer,
  route: string
): string[] => {
  const failures: string[] = [];

  if (asset.publicStatus !== 'approved_for_route') {
    failures.push('publicStatus must be approved_for_route');
  }

  if (!asset.sourceFile) {
    failures.push('sourceFile is required');
  }

  if (!asset.captureDate) {
    failures.push('captureDate is required');
  }

  if (!asset.permissionEvidenceLink) {
    failures.push('permissionEvidenceLink is required');
  }

  if (!asset.representativeLabel) {
    failures.push('representativeLabel is required');
  }

  if (!asset.approvedUseRoutes.includes(route)) {
    failures.push(`approvedUseRoutes must include ${route}`);
  }

  if (!asset.approvedConsumers.includes(consumer)) {
    failures.push(`approvedConsumers must include ${consumer}`);
  }

  if (consumer === 'visible_ui' && !asset.safeForVisibleUi) {
    failures.push('safeForVisibleUi must be true for visible UI use');
  }

  if (consumer === 'schema' && !asset.safeForSchema) {
    failures.push('safeForSchema must be true for schema use');
  }

  if (consumer === 'og' && !asset.safeForOg) {
    failures.push('safeForOg must be true for OG use');
  }

  if (consumer === 'sitemap_image' && !asset.safeForSitemapImage) {
    failures.push('safeForSitemapImage must be true for sitemap image use');
  }

  if (consumer === 'rental_card' && !asset.safeForRentalCard) {
    failures.push('safeForRentalCard must be true for rental card use');
  }

  if (consumer === 'search_card' && !asset.safeForSearchCard) {
    failures.push('safeForSearchCard must be true for search card use');
  }

  if (['email', 'crm', 'campaign', 'sales_pdf'].includes(consumer)) {
    if (asset.campaignUseStatus === 'not_eligible') {
      failures.push('campaignUseStatus must approve campaign or CRM reuse');
    }
  }

  if (asset.ownerReviewStatus !== 'confirmed_owner') {
    failures.push('ownerReviewStatus must be confirmed_owner');
  }

  if (!['confirmed_compliance', 'confirmed_counsel'].includes(asset.complianceReviewStatus)) {
    failures.push('complianceReviewStatus must be confirmed_compliance or confirmed_counsel');
  }

  if (!asset.reviewedBy) {
    failures.push('reviewedBy is required');
  }

  if (!asset.reviewedAt) {
    failures.push('reviewedAt is required');
  }

  return failures;
};

export const getApprovedProductMediaPathForPublicUse = ({
  consumer,
  imagePath,
  route,
}: {
  consumer: ProductMediaConsumer;
  imagePath: string | undefined;
  route: string;
}): string | undefined => {
  if (!imagePath) {
    return undefined;
  }

  const approvedAsset = productMediaAssetGates.find(
    (asset) =>
      asset.sourceFile === imagePath &&
      validateProductMediaAssetForPublicUse(asset, consumer, route).length === 0
  );

  return approvedAsset ? imagePath : undefined;
};
