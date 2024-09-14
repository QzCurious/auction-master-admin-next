import { Wallet } from '@phosphor-icons/react/dist/ssr';
import { Gavel } from '@phosphor-icons/react/dist/ssr/Gavel';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { Handshake } from '@phosphor-icons/react/dist/ssr/Handshake';
import { Invoice } from '@phosphor-icons/react/dist/ssr/Invoice';
import { Package } from '@phosphor-icons/react/dist/ssr/Package';
import { ShieldStar } from '@phosphor-icons/react/dist/ssr/ShieldStar';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import { TerminalWindow } from '@phosphor-icons/react/dist/ssr/TerminalWindow';
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
    key: 'wallet-logs',
    title: '錢包紀錄',
    href: '/dashboard/wallet-logs',
    PhosphorIcon: Wallet,
    permissions: ['AdminGetWalletLogs'],
    matcher: { type: 'startsWith', href: '/dashboard/wallet-logs' },
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
    key: 'auction-items',
    title: '日拍競標商品列表',
    href: '/dashboard/auction-items',
    PhosphorIcon: Gavel,
    permissions: ['GetAuctionItems'],
    matcher: { type: 'startsWith', href: '/dashboard/auction-items' },
  },
  {
    key: 'shippings',
    title: '出貨列表',
    href: '/dashboard/shippings',
    PhosphorIcon: Package,
    permissions: ['GetShippings'],
    matcher: { type: 'startsWith', href: '/dashboard/shippings' },
  },
  {
    key: 'records',
    title: '交易紀錄',
    href: '/dashboard/records',
    PhosphorIcon: Invoice,
    permissions: ['GetRecordsSummary', 'GetRecords'],
    matcher: { type: 'startsWith', href: '/dashboard/records' },
  },
  {
    key: 'workers',
    title: 'Worker 列表',
    href: '/dashboard/workers',
    PhosphorIcon: TerminalWindow,
    permissions: ['GetWorkers'],
    matcher: { type: 'startsWith', href: '/dashboard/workers' },
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
