// Dependency groups intentionally cover all filters, IDs, counts and summaries.
// Keep router/cache APIs out of this module.
export const mutationEffects = {
  AddPermissionForRole: ['roles', 'admins'],
  AddRoleForAdmin: ['admins'],
  AdminDeleteItemPhoto: ['items', 'auction-items'],
  AdminReorderItemPhoto: ['items', 'auction-items'],
  AdminUpdateConsignor: ['consignors', 'items', 'auction-items', 'shippings'],
  AdminUpdateItem: ['items', 'auction-items'],
  AdminUpsertItemPhoto: ['items', 'auction-items'],
  AuctionItemConsignorFeePaid: ['auction-items', 'items', 'shippings', 'records', 'reports', 'wallets', 'bonus'],
  BidAuctionItem: ['items', 'auction-items'],
  CancelAuctionItem: ['auction-items', 'items', 'shippings', 'records', 'reports', 'wallets', 'bonus'],
  CompanyPurchased: ['auction-items', 'items', 'shippings', 'records', 'reports', 'wallets', 'bonus'],
  CreateAdmin: ['admins'],
  CreateRole: ['roles', 'admins'],
  CreateWorker: ['workers'],
  DeleteAdmin: ['admins'],
  DeleteAuctionItem: ['auction-items', 'items', 'shippings', 'records', 'reports', 'wallets', 'bonus'],
  DeletePermissionForRole: ['roles', 'admins'],
  DeleteRole: ['roles', 'admins'],
  DeleteRoleForAdmin: ['admins'],
  DeleteWorker: ['workers'],
  HandleConsignorVerification: ['consignorsVerifications', 'consignors'],
  ItemAppraisalReview: ['items', 'auction-items'],
  ItemAppraiserConfirmed: ['items', 'auction-items'],
  ItemArrival: ['items', 'auction-items'],
  ItemBidding: ['items', 'auction-items', 'shippings', 'records', 'reports', 'wallets', 'bonus'],
  ItemReturnPending: ['items', 'auction-items'],
  ItemReturned: ['items', 'auction-items', 'shippings', 'records', 'reports', 'wallets', 'bonus'],
  ItemReturning: ['items', 'auction-items', 'shippings', 'records', 'reports', 'wallets', 'bonus'],
  ItemWarehousePersonnelConfirmed: ['items', 'auction-items'],
  ProcessingShipping: ['shippings', 'items', 'auction-items', 'records', 'reports', 'wallets', 'bonus'],
  RecordPaymentReview: ['records', 'reports', 'wallets', 'bonus'],
  SetWorkerCookie: ['workers'],
  Shipped: ['shippings', 'items', 'auction-items', 'records', 'reports', 'wallets', 'bonus'],
  ShippingAuctionItem: ['auction-items', 'items', 'shippings', 'records', 'reports', 'wallets', 'bonus'],
  ShippingClosed: ['shippings', 'items', 'auction-items', 'records', 'reports', 'wallets', 'bonus'],
  ToggleActivateAuctionItem: ['items', 'auction-items'],
  ToggleActivateWorker: ['workers'],
  UpdateAdmin: ['admins'],
  UpdateAuctionItem: ['auction-items', 'items', 'shippings', 'records', 'reports', 'wallets', 'bonus'],
  UpdateShipping: ['shippings', 'items', 'auction-items', 'records', 'reports', 'wallets', 'bonus'],
  UpdateWorker: ['workers'],
} as const;
export type MutationName = keyof typeof mutationEffects;

const queryGroups: Record<string, string> = {
  GetWorkers: 'workers',
  '/reports/records': 'records',
  '/reports/records/summary': 'records',
  consignor: 'consignors',
};
export function affectsQuery(name: MutationName, queryKey: readonly unknown[]) {
  const key = String(queryKey[0]);
  return (mutationEffects[name] as readonly string[]).includes(queryGroups[key] ?? key);
}
