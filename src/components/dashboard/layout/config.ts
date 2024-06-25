import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { Handshake } from '@phosphor-icons/react/dist/ssr/Handshake';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { ShieldStar } from '@phosphor-icons/react/dist/ssr/ShieldStar';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UserCircleGear } from '@phosphor-icons/react/dist/ssr/UserCircleGear';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  {
    key: 'roles',
    title: '角色列表',
    href: '/dashboard/roles',
    PhosphorIcon: UserCircleGear,
    permissions: ['GetRoles'],
  },
  {
    key: 'admins',
    title: '管理員列表',
    href: '/dashboard/admins',
    PhosphorIcon: ShieldStar,
    permissions: ['GetAdmins'],
  },
  {
    key: 'consignor-verifications',
    title: '身份驗證列表',
    href: '/dashboard/consignor-verifications',
    PhosphorIcon: Handshake,
    permissions: ['AdminGetConsignorVerifications'],
  },
  {
    key: 'consignors',
    title: '寄售人列表',
    href: '/dashboard/consignors',
    PhosphorIcon: UsersIcon,
    permissions: ['AdminGetConsignors'],
  },
  {
    key: 'items',
    title: '物品列表',
    href: '/dashboard/items/submit-appraisal-status',
    PhosphorIcon: StackSimple,
    permissions: ['GetRoles'],
  },

  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, PhosphorIcon: ChartPieIcon },
  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, PhosphorIcon: UserIcon },
  { key: 'integrations', title: 'Integrations', href: paths.dashboard.integrations, PhosphorIcon: PlugsConnectedIcon },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, PhosphorIcon: GearSixIcon },
  { key: 'account', title: 'Account', href: paths.dashboard.account, PhosphorIcon: UserIcon },
  { key: 'error', title: 'Error', href: paths.errors.notFound, PhosphorIcon: XSquare },
] satisfies NavItemConfig[];
