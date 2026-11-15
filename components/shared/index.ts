// Shared UI components - centralized exports
export { AnimatedCounter } from './AnimatedCounter';
export { CustomCursor } from './CustomCursor';
export { MagneticButton } from './MagneticButton';
export { MarqueeTicker } from './MarqueeTicker';
export {
  MedicalDisclaimer,
  ShortDisclaimer,
  MdrComplianceBadge
} from './MedicalDisclaimer';
export type { DisclaimerType } from './MedicalDisclaimer';
export {
  disclaimers,
  DISCLAIMER_CONTEXTS,
  MDR_COMPLIANCE_STATEMENT,
  CITATION_DISCLAIMER
} from './MedicalDisclaimer';
export { ScrollReveal } from './ScrollReveal';
export { TextScramble } from './TextScramble';
export { TiltCard } from './TiltCard';

// Multitool Widget - floating side panel with tools
export {
  MultitoolContainer,
  PageNavigator,
  ReadingTools,
  QuickSupport,
  useScrollSpy,
} from '../../src/components/ui/Multitool';
export type {
  MultitoolContainerProps,
  PageNavigatorProps,
  ReadingToolsProps,
  QuickSupportProps,
  SectionInfo,
  UseScrollSpyOptions,
  ToolId,
  TextSize,
} from '../../src/components/ui/Multitool';

// Hylono Luxury Brand Design System Components & Contracts
export {
  SanctuaryCard,
  SanctuaryCardHeader,
  SanctuaryCardBody,
  SanctuaryCardFooter,
  ModalityBadge,
  LuxuryButton,
  SwissMineralBadge,
  ParametricTable,
  TelemetryRibbon,
  ConsultationSanctuaryBanner,
  EditorialHero,
} from '../../src/components/ui';

export type {
  SanctuaryCardProps,
  ModalityBadgeProps,
  LuxuryButtonProps,
  LuxuryButtonVariant,
  LuxuryButtonSize,
  SwissMineralBadgeProps,
  ParametricTableProps,
  ParametricRow,
  TelemetryRibbonProps,
  TelemetryNode,
  ConsultationSanctuaryBannerProps,
  EditorialHeroProps,
} from '../../src/components/ui';

export {
  MODALITY_TOKENS,
  MODALITY_KEYS,
  CONTAINER_STANDARDS,
  SURFACE_STANDARDS,
  TYPOGRAPHY_STANDARDS,
  TOUCH_TARGET_STANDARDS,
  type ModalityKey,
  type ModalityPalette,
} from '../../lib/brand-tokens';
