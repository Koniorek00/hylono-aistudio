export type NexusNavIconKey =
    | 'layoutDashboard'
    | 'users'
    | 'wrench'
    | 'clipboardCheck'
    | 'graduationCap'
    | 'shoppingBag'
    | 'fileText'
    | 'palette'
    | 'boxes';

export type NexusModuleNavKey =
    | 'workspace'
    | 'clients'
    | 'fleet'
    | 'service'
    | 'academy'
    | 'supplies'
    | 'docs'
    | 'studio'
    | 'team';

export interface NexusModuleNavItem {
    key: NexusModuleNavKey;
    label: string;
    commandLabel: string;
    commandDescription: string;
    overviewDescription: string;
    overviewBadge: string;
    href: string;
    iconKey: NexusNavIconKey;
}

export const NEXUS_MODULE_NAV_ITEMS: NexusModuleNavItem[] = [
    {
        key: 'workspace',
        label: 'Overview',
        commandLabel: 'Workspace overview',
        commandDescription: 'Open the Nexus overview and module map.',
        overviewDescription: 'Review the Nexus route map and public-safe workspace boundary.',
        overviewBadge: 'Map',
        href: '/nexus',
        iconKey: 'layoutDashboard',
    },
    {
        key: 'clients',
        label: 'Clients',
        commandLabel: 'Clients module',
        commandDescription: 'Explore records, intake, and protocol coverage.',
        overviewDescription: 'Review intake, client records, session history, and protocol coverage from one workspace.',
        overviewBadge: 'Records',
        href: '/nexus/clients',
        iconKey: 'users',
    },
    {
        key: 'fleet',
        label: 'Fleet',
        commandLabel: 'Fleet module',
        commandDescription: 'Review service health and maintenance workflows.',
        overviewDescription: 'Track service health, maintenance checkpoints, and device readiness across the clinic fleet.',
        overviewBadge: 'Operations',
        href: '/nexus/fleet',
        iconKey: 'wrench',
    },
    {
        key: 'service',
        label: 'Service',
        commandLabel: 'Service module',
        commandDescription: 'Coordinate visits, notes, tasks, manuals, and parts drafts.',
        overviewDescription: 'Coordinate owner-visible notes, technician tasks, manuals, reports, and replacement part drafts.',
        overviewBadge: 'Field Ops',
        href: '/nexus/service',
        iconKey: 'clipboardCheck',
    },
    {
        key: 'academy',
        label: 'Academy',
        commandLabel: 'Academy module',
        commandDescription: 'Review staff onboarding and readiness coverage.',
        overviewDescription: 'Run onboarding, readiness tracking, and internal refreshers for partner teams.',
        overviewBadge: 'Training',
        href: '/nexus/academy',
        iconKey: 'graduationCap',
    },
    {
        key: 'supplies',
        label: 'Supplies',
        commandLabel: 'Supplies module',
        commandDescription: 'Browse restock and clinic supply workflows.',
        overviewDescription: 'Handle consumables, accessories, and reorder planning alongside the rest of the workspace.',
        overviewBadge: 'Commerce',
        href: '/nexus/supplies',
        iconKey: 'shoppingBag',
    },
    {
        key: 'docs',
        label: 'Documents',
        commandLabel: 'Documents module',
        commandDescription: 'Inspect intake sheets, consents, and generated forms.',
        overviewDescription: 'Generate intake sheets, consents, and clinic-ready paperwork from the same route cluster.',
        overviewBadge: 'Compliance',
        href: '/nexus/docs',
        iconKey: 'fileText',
    },
    {
        key: 'studio',
        label: 'Studio',
        commandLabel: 'Studio module',
        commandDescription: 'See campaign, asset, and collateral tooling.',
        overviewDescription: 'Build branded collateral, campaign assets, and operator-facing marketing outputs.',
        overviewBadge: 'Content',
        href: '/nexus/studio',
        iconKey: 'palette',
    },
    {
        key: 'team',
        label: 'Team',
        commandLabel: 'Team module',
        commandDescription: 'Inspect staffing, readiness, and compliance views.',
        overviewDescription: 'Inspect staffing, role readiness, and operational coverage without leaving the operator shell.',
        overviewBadge: 'Staffing',
        href: '/nexus/team',
        iconKey: 'boxes',
    },
];

export const NEXUS_MODULE_NAV_ITEM_BY_KEY = Object.fromEntries(
    NEXUS_MODULE_NAV_ITEMS.map((item) => [item.key, item])
) as Record<NexusModuleNavKey, NexusModuleNavItem>;
