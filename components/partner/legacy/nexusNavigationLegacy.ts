// Legacy Nexus preview navigation (light-era IA, April 2026 snapshot fdf2c659).
// There was no nexusNavigation module at that commit — the sidebar items lived
// hardcoded in PartnerLayout — so this module reconstructs that list verbatim,
// rebased from /nexus/* to /nexus2/*, plus a Service entry (the Service module
// postdates the snapshot; it renders a visibly-neutral light stub so the
// preview sidebar stays self-consistent across all nine routes).
import {
    Boxes,
    ClipboardCheck,
    FileText,
    GraduationCap,
    LayoutDashboard,
    Palette,
    ShoppingBag,
    Users,
    Wrench,
    type LucideIcon,
} from 'lucide-react';

export interface Nexus2NavItem {
    icon: LucideIcon;
    label: string;
    href: string;
}

export const NEXUS2_NAV_ITEMS: Nexus2NavItem[] = [
    { icon: LayoutDashboard, label: 'Overview', href: '/nexus2' },
    { icon: Users, label: 'Clients', href: '/nexus2/clients' },
    { icon: Wrench, label: 'Fleet', href: '/nexus2/fleet' },
    { icon: ClipboardCheck, label: 'Service', href: '/nexus2/service' },
    { icon: GraduationCap, label: 'Academy', href: '/nexus2/academy' },
    { icon: ShoppingBag, label: 'Supplies', href: '/nexus2/supplies' },
    { icon: FileText, label: 'Documents', href: '/nexus2/docs' },
    { icon: Palette, label: 'Studio', href: '/nexus2/studio' },
    { icon: Boxes, label: 'Team', href: '/nexus2/team' },
];

export const NEXUS2_NAV_ITEM_BY_HREF: Record<string, Nexus2NavItem> =
    Object.fromEntries(NEXUS2_NAV_ITEMS.map((item) => [item.href, item]));
