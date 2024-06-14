import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UserCircleGear } from '@phosphor-icons/react/dist/ssr/UserCircleGear';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'roles', title: '角色', href: '/dashboard/roles', PhosphorIcon: UserCircleGear, permissions: ['GetRoles'] },
  {
    key: 'admins',
    title: '管理員帳號',
    href: '/dashboard/admins',
    PhosphorIcon: UsersIcon,
    permissions: ['GetAdmins'],
  },

  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, PhosphorIcon: ChartPieIcon },
  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, PhosphorIcon: UserIcon },
  { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, PhosphorIcon: PlugsConnectedIcon },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, PhosphorIcon: GearSixIcon },
  { key: 'account', title: 'Account', href: paths.dashboard.account, PhosphorIcon: UserIcon },
  { key: 'error', title: 'Error', href: paths.errors.notFound, PhosphorIcon: XSquare },
] satisfies NavItemConfig[];
