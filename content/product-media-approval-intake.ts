import {
  PRODUCT_MEDIA_CONSUMERS,
  type ProductMediaAssetGate,
  type ProductMediaConsumer,
  type ProductMediaPermissionStatus,
  type ProductMediaPack,
  productMediaAssetGates,
  validateProductMediaAssetForPublicUse,
} from './product-media-assets';

export type ProductMediaIntakeBlocker =
  | 'source_file_missing'
  | 'permission_unconfirmed'
  | 'owner_review_needed'
  | 'compliance_review_needed'
  | 'route_approval_missing'
  | 'consumer_approval_missing'
  | 'privacy_review_needed'
  | 'representative_scope_unknown'
  | 'public_status_missing';

export interface ProductMediaApprovalIntakePacket {
  assetId: string;
  pack: ProductMediaPack;
  productSlugs: string[];
  modelOrFlow: string;
  priority: number;
  requiredCapture: string;
  ownerTeams: string[];
  currentBlockers: ProductMediaIntakeBlocker[];
  requiredEvidence: string[];
  operatorQuestions: string[];
  approvalFieldsToFill: string[];
  approvalRegisterFields: ProductMediaApprovalRegisterFields;
  blockedConsumers: ProductMediaConsumer[];
  blockedRoutes: string[];
  safeInternalUseUntilApproved: string;
  forbiddenPublicUseUntilApproved: string;
  validationPreview: string[];
  nextAction: string;
}

export interface ProductMediaApprovalRegisterFields {
  source_file: string | null;
  capture_date: string | null;
  provenance_owner: string;
  permission_evidence_link: string | null;
  permission_status: ProductMediaPermissionStatus;
  representative_scope_status: ProductMediaAssetGate['representativeOnly'];
  representative_label: string | null;
  approved_use_routes: string[];
  approved_consumers: ProductMediaConsumer[];
  claim_review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface ProductMediaApprovalIntakeSummary {
  totalPackets: number;
  sourceMissing: number;
  ownerNeeded: number;
  complianceNeeded: number;
  permissionUnconfirmed: number;
  privacyReviewNeeded: number;
  representativeScopeUnknown: number;
  routeApproved: number;
  publicReady: number;
  byPack: Record<ProductMediaPack, number>;
}

const priorityOrder = [
  'hbot-standard-soft-001',
  'hbot-room-hero-001',
  'h2-os-ho450-setup-001',
  'rental-packaging-001',
  'rental-manual-review-001',
  'support-handoff-001',
  'hbot-entry-control-001',
  'hbot-accessory-layout-001',
  'hbot-scale-001',
  'h2-pr-ho-family-setup-001',
  'h2-za-ho6000-scale-001',
  'h2-water-line-workflow-001',
] as const;

const approvalFieldsToFill = [
  'source_file',
  'capture_date',
  'provenance_owner',
  'permission_evidence_link',
  'permission_status',
  'representative_scope_status',
  'representative_label',
  'approved_use_routes',
  'approved_consumers',
  'claim_review_status',
  'reviewed_by',
  'reviewed_at',
] as const;

const splitOwnerTeams = (owner: string): string[] =>
  owner
    .split('+')
    .map((item) => item.trim())
    .filter(Boolean);

const getPacketPriority = (assetId: string): number => {
  const index = priorityOrder.indexOf(assetId as (typeof priorityOrder)[number]);
  return index >= 0 ? index + 1 : priorityOrder.length + 1;
};

const getCurrentBlockers = (asset: ProductMediaAssetGate): ProductMediaIntakeBlocker[] => {
  const blockers: ProductMediaIntakeBlocker[] = [];

  if (!asset.sourceFile) blockers.push('source_file_missing');
  if (!['hylono_owned', 'supplier_approved', 'licensed'].includes(asset.permissionStatus)) {
    blockers.push('permission_unconfirmed');
  }
  if (asset.ownerReviewStatus !== 'confirmed_owner') blockers.push('owner_review_needed');
  if (!['confirmed_compliance', 'confirmed_counsel'].includes(asset.complianceReviewStatus)) {
    blockers.push('compliance_review_needed');
  }
  if (asset.approvedUseRoutes.length === 0) blockers.push('route_approval_missing');
  if (asset.approvedConsumers.length === 0) blockers.push('consumer_approval_missing');
  if (['redaction_needed', 'release_needed_if_person_visible'].includes(asset.privacyReviewStatus)) {
    blockers.push('privacy_review_needed');
  }
  if (asset.representativeOnly === 'unknown') blockers.push('representative_scope_unknown');
  if (asset.publicStatus !== 'approved_for_route') blockers.push('public_status_missing');

  return blockers;
};

const getRequiredEvidence = (asset: ProductMediaAssetGate): string[] => {
  const evidence = [
    `source media file for ${asset.assetId}`,
    'capture date or source date',
    'permission or ownership proof',
    'route approval decision',
    'consumer approval decision',
    'visible-facts-only alt text and caption',
    'owner reviewer and review date',
    'compliance or counsel reviewer and review date',
  ];

  if (asset.representativeOnly !== false) {
    evidence.push('representative scope label and visible qualification decision');
  }

  if (asset.privacyReviewStatus !== 'not_applicable') {
    evidence.push('privacy or release decision before any public use');
  }

  return evidence;
};

const getOperatorQuestions = (asset: ProductMediaAssetGate): string[] => [
  asset.ownerQuestion,
  `Which exact source file or capture session demonstrates ${asset.assetId}?`,
  `Who confirms permission status for ${asset.permissionStatus === 'supplier_needed' ? 'supplier' : 'owner'} use?`,
  `Which exact routes may use this asset, and which routes remain blocked?`,
  `Which consumers from ${PRODUCT_MEDIA_CONSUMERS.join(', ')} are approved separately?`,
  'What visible label is required if the media is representative, family-level, redacted, or sample-only?',
  'Who signs owner review and compliance/counsel review, and on what date?',
];

const buildApprovalRegisterFields = (
  asset: ProductMediaAssetGate
): ProductMediaApprovalRegisterFields => ({
  source_file: asset.sourceFile,
  capture_date: asset.captureDate,
  provenance_owner: asset.provenanceOwner,
  permission_evidence_link: asset.permissionEvidenceLink,
  permission_status: asset.permissionStatus,
  representative_scope_status: asset.representativeOnly,
  representative_label: asset.representativeLabel,
  approved_use_routes: asset.approvedUseRoutes,
  approved_consumers: asset.approvedConsumers,
  claim_review_status: `${asset.ownerReviewStatus}/${asset.complianceReviewStatus}`,
  reviewed_by: asset.reviewedBy,
  reviewed_at: asset.reviewedAt,
});

export const buildProductMediaApprovalIntakePacket = (
  asset: ProductMediaAssetGate
): ProductMediaApprovalIntakePacket => ({
  assetId: asset.assetId,
  pack: asset.pack,
  productSlugs: asset.productSlugs,
  modelOrFlow: asset.modelOrFlow,
  priority: getPacketPriority(asset.assetId),
  requiredCapture: asset.requiredCapture,
  ownerTeams: splitOwnerTeams(asset.provenanceOwner),
  currentBlockers: getCurrentBlockers(asset),
  requiredEvidence: getRequiredEvidence(asset),
  operatorQuestions: getOperatorQuestions(asset),
  approvalFieldsToFill: [...approvalFieldsToFill],
  approvalRegisterFields: buildApprovalRegisterFields(asset),
  blockedConsumers: asset.blockedConsumers,
  blockedRoutes: asset.blockedUseRoutes,
  safeInternalUseUntilApproved: asset.allowedCopy,
  forbiddenPublicUseUntilApproved: asset.forbiddenInference,
  validationPreview: validateProductMediaAssetForPublicUse(asset, 'visible_ui', asset.blockedUseRoutes[0] ?? '/'),
  nextAction: asset.nextAction,
});

export const getProductMediaApprovalIntakePackets = (): ProductMediaApprovalIntakePacket[] =>
  productMediaAssetGates
    .map(buildProductMediaApprovalIntakePacket)
    .sort((a, b) => a.priority - b.priority || a.assetId.localeCompare(b.assetId));

export const getProductMediaApprovalIntakeSummary = (): ProductMediaApprovalIntakeSummary => {
  const packets = getProductMediaApprovalIntakePackets();
  const byPack = {
    HBOT: 0,
    Hydrogen: 0,
    'Rental/process': 0,
  } satisfies Record<ProductMediaPack, number>;

  for (const packet of packets) {
    byPack[packet.pack] += 1;
  }

  return {
    totalPackets: packets.length,
    sourceMissing: packets.filter((packet) => packet.currentBlockers.includes('source_file_missing')).length,
    ownerNeeded: packets.filter((packet) => packet.currentBlockers.includes('owner_review_needed')).length,
    complianceNeeded: packets.filter((packet) =>
      packet.currentBlockers.includes('compliance_review_needed')
    ).length,
    permissionUnconfirmed: packets.filter((packet) =>
      packet.currentBlockers.includes('permission_unconfirmed')
    ).length,
    privacyReviewNeeded: packets.filter((packet) =>
      packet.currentBlockers.includes('privacy_review_needed')
    ).length,
    representativeScopeUnknown: packets.filter((packet) =>
      packet.currentBlockers.includes('representative_scope_unknown')
    ).length,
    routeApproved: packets.filter((packet) => !packet.currentBlockers.includes('route_approval_missing')).length,
    publicReady: packets.filter((packet) => packet.currentBlockers.length === 0).length,
    byPack,
  };
};
