export const PRODUCT_DETAIL_ACTION_EVENT = 'product_detail_action_clicked';

export type ProductDetailAction =
  | 'track_selected'
  | 'primary_action_clicked'
  | 'add_to_cart_clicked'
  | 'rental_request_clicked'
  | 'rental_period_selected'
  | 'financing_drawer_opened'
  | 'financing_term_selected'
  | 'financing_learn_more_clicked'
  | 'financing_compare_rental_clicked'
  | 'contact_support_clicked'
  | 'mobile_track_drawer_opened'
  | 'chamber_selected'
  | 'compare_chamber_toggled'
  | 'compare_modal_opened'
  | 'compare_chamber_activated'
  | 'compare_chamber_removed'
  | 'view_mode_selected'
  | 'resource_clicked'
  | 'support_exit_clicked'
  | 'rental_exit_clicked'
  | 'delivery_panel_toggled'
  | 'safety_panel_toggled'
  | 'faq_toggled'
  | 'addon_toggled';

export type ProductDetailTrack = 'purchase' | 'rental';

export interface ProductDetailAnalyticsInput {
  action: ProductDetailAction;
  activeTrack: ProductDetailTrack;
  productSlug: string;
  techId: string;
  source: string;
  selectedTrack?: ProductDetailTrack;
  rentalPeriod?: string;
  loanTermMonths?: number;
  canonicalProductSlug?: string;
  chamberSlug?: string;
  compareCount?: number;
  destinationPath?: string;
  isExpanded?: boolean;
  isSelected?: boolean;
  resourceType?: string;
  routeVariant?: string;
  selectedAddonCount?: number;
  viewMode?: string;
}

export const buildProductDetailActionPayload = ({
  action,
  activeTrack,
  productSlug,
  techId,
  source,
  selectedTrack,
  rentalPeriod,
  loanTermMonths,
  canonicalProductSlug,
  chamberSlug,
  compareCount,
  destinationPath,
  isExpanded,
  isSelected,
  resourceType,
  routeVariant,
  selectedAddonCount,
  viewMode,
}: ProductDetailAnalyticsInput) => ({
  action,
  active_track: activeTrack,
  canonical_product_slug: canonicalProductSlug ?? null,
  chamber_slug: chamberSlug ?? null,
  compare_count: compareCount ?? null,
  destination_path: destinationPath ?? null,
  is_expanded: isExpanded ?? null,
  is_selected: isSelected ?? null,
  loan_term_months: loanTermMonths ?? null,
  product_slug: productSlug,
  rental_period: rentalPeriod ?? null,
  resource_type: resourceType ?? null,
  route_variant: routeVariant ?? null,
  selected_addon_count: selectedAddonCount ?? null,
  selected_track: selectedTrack ?? null,
  source,
  tech_id: techId.toLowerCase(),
  view_mode: viewMode ?? null,
});
