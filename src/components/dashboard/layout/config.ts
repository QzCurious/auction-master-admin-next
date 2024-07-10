import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { Handshake } from '@phosphor-icons/react/dist/ssr/Handshake';
import { ShieldStar } from '@phosphor-icons/react/dist/ssr/ShieldStar';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import { UserCircleGear } from '@phosphor-icons/react/dist/ssr/UserCircleGear';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  {
    key: 'roles',
    title: '角色列表',
    href: '/dashboard/roles',
    PhosphorIcon: UserCircleGear,
    permissions: ['GetRoles'],
    matcher: { type: 'startsWith', href: '/dashboard/roles' },
  },
  {
    key: 'admins',
    title: '管理員列表',
    href: '/dashboard/admins',
    PhosphorIcon: ShieldStar,
    permissions: ['GetAdmins'],
    matcher: { type: 'startsWith', href: '/dashboard/admins' },
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
    matcher: { type: 'startsWith', href: '/dashboard/consignors' },
  },
  {
    key: 'items',
    title: '物品列表',
    href: '/dashboard/items',
    PhosphorIcon: StackSimple,
    permissions: ['GetItemsAndDetails'],
    matcher: { type: 'startsWith', href: '/dashboard/items' },
  },

  {
    key: 'settings',
    title: '設定',
    href: paths.dashboard.settings,
    PhosphorIcon: GearSixIcon,
    permissions: ['UpdateAdminPassword'],
  },
  // { key: 'account', title: 'Account', href: paths.dashboard.account, PhosphorIcon: UserIcon },
] satisfies NavItemConfig[];
