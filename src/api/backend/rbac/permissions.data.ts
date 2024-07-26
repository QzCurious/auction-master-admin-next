import { mapToObj } from 'remeda';

export const PERMISSIONS_DATA = [
  {
    message: '系統相關',
    permissions: [
      {
        key: 'StartBackendWs',
        method: 'GET',
        url: '/auction-master/backend/ws',
        description: '使用通訊功能',
      },
      {
        key: 'GetBackendConfigs',
        method: 'GET',
        url: '/auction-master/backend/configs',
        description: '取得系統設定擋',
      },
    ],
  },
  {
    message: '角色相關',
    permissions: [
      {
        key: 'GetRoles',
        method: 'GET',
        url: '/auction-master/backend/roles',
        description: '取得所有角色',
      },
      {
        key: 'GetRolesPermission',
        method: 'GET',
        url: '/auction-master/backend/roles/permissions',
        description: '取得所有角色的權限',
      },
      {
        key: 'CreateRole',
        method: 'POST',
        url: '/auction-master/backend/roles',
        description: '新增角色',
      },
      {
        key: 'DeleteRole',
        method: 'DELETE',
        url: '/auction-master/backend/roles/:role',
        description: '刪除角色',
      },
      {
        key: 'GetPermissions',
        method: 'GET',
        url: '/auction-master/backend/permissions',
        description: '取得所有權限',
      },
      {
        key: 'AddPermissionForRole',
        method: 'POST',
        url: '/auction-master/backend/permissions',
        description: '新增角色的權限',
      },
      {
        key: 'DeletePermissionForRole',
        method: 'DELETE',
        url: '/auction-master/backend/permissions',
        description: '刪除角色的權限',
      },
      {
        key: 'GetUsersForRole',
        method: 'GET',
        url: '/auction-master/backend/roles/:role',
        description: '取得角色管理者列表',
      },
    ],
  },
  {
    message: '管理者相關',
    permissions: [
      {
        key: 'GetAdmins',
        method: 'GET',
        url: '/auction-master/backend/admins',
        description: '取得後台帳號列表',
      },
      {
        key: 'GetAdmin',
        method: 'GET',
        url: '/auction-master/backend/admins/:id',
        description: '取得後台帳號',
      },
      {
        key: 'CreateAdmin',
        method: 'POST',
        url: '/auction-master/backend/admins',
        description: '建立後台帳號',
      },
      {
        key: 'AddRoleForAdmin',
        method: 'POST',
        url: '/auction-master/backend/admins/account/:account/roles',
        description: '新增管理者的角色',
      },
      {
        key: 'DeleteRoleForAdmin',
        method: 'DELETE',
        url: '/auction-master/backend/admins/account/:account/roles',
        description: '刪除管理者的角色',
      },
      {
        key: 'UpdateAdmin',
        method: 'PATCH',
        url: '/auction-master/backend/admins/:id',
        description: '修改後台帳號資訊',
      },
      {
        key: 'UpdateAdminPassword',
        method: 'PATCH',
        url: '/auction-master/backend/admins/:id/password',
        description: '修改後台密碼',
      },
      {
        key: 'DeleteAdmin',
        method: 'DELETE',
        url: '/auction-master/backend/admins/:id',
        description: '刪除後台帳號',
      },
    ],
  },
  {
    message: '盯標相關',
    permissions: [
      {
        key: 'GetWorkers',
        method: 'GET',
        url: '/auction-master/backend/workers',
        description: '取得 Worker 列表',
      },
      {
        key: 'GetActivationWorkers',
        method: 'GET',
        url: '/auction-master/backend/workers/activation',
        description: '取得啟用中的 Worker 列表',
      },
      {
        key: 'GetWorker',
        method: 'GET',
        url: '/auction-master/backend/workers/:id',
        description: '取得 Worker',
      },
      {
        key: 'CreateWorker',
        method: 'POST',
        url: '/auction-master/backend/workers',
        description: '新增 Worker',
      },
      {
        key: 'SetWorkerCookie',
        method: 'POST',
        url: '/auction-master/backend/workers/:id/cookie',
        description: '設定 Worker 日拍 Cookie',
      },
      {
        key: 'ToggleActivateWorker',
        method: 'PATCH',
        url: '/auction-master/backend/workers/:id/:status',
        description: '修改 Worker 狀態',
      },
      {
        key: 'UpdateWorker',
        method: 'PATCH',
        url: '/auction-master/backend/workers/:id',
        description: '修改 Worker',
      },
      {
        key: 'DeleteWorker',
        method: 'DELETE',
        url: '/auction-master/backend/workers/:id',
        description: '刪除 Worker',
      },
    ],
  },
  {
    message: '競標物品相關',
    permissions: [
      {
        key: 'GetAuctionItems',
        method: 'GET',
        url: '/auction-master/backend/auction-items',
        description: '取得日拍競標商品列表',
      },
      {
        key: 'GetAuctionItem',
        method: 'GET',
        url: '/auction-master/backend/auction-items/:id',
        description: '取得日拍競標商品',
      },
      {
        key: 'CreateAuctionItem',
        method: 'POST',
        url: '/auction-master/backend/auction-items',
        description: '建立日拍競標商品',
      },
      {
        key: 'UpdateAuctionItem',
        method: 'PATCH',
        url: '/auction-master/backend/auction-items/:id',
        description: '修改日拍競標商品',
      },
      {
        key: 'ToggleActivateAuctionItem',
        method: 'PATCH',
        url: '/auction-master/backend/auction-items/:id/:status',
        description: '修改日拍競標商品狀態',
      },
      {
        key: 'AuctionItemDealPreview',
        method: 'GET',
        url: '/auction-master/backend/auction-items/:id/deal/preview',
        description: '取得日拍競標商品成交預覽',
      },
      {
        key: 'DealAuctionItem',
        method: 'POST',
        url: '/auction-master/backend/auction-items/:id/deal',
        description: '日拍競標商品成交',
      },
    ],
  },
  {
    message: '寄售人相關',
    permissions: [
      {
        key: 'AdminGetConsignors',
        method: 'GET',
        url: '/auction-master/backend/consignors',
        description: '取得寄售人列表',
      },
      {
        key: 'AdminGetConsignor',
        method: 'GET',
        url: '/auction-master/backend/consignors/:id',
        description: '取得寄售人',
      },
      {
        key: 'AdminUpdateConsignor',
        method: 'PATCH',
        url: '/auction-master/backend/consignors/:id',
        description: '管理者修改寄售人資訊',
      },
      {
        key: 'AdminGetConsignorVerifications',
        method: 'GET',
        url: '/auction-master/backend/consignors/verifications',
        description: '取得寄售人身分驗證列表',
      },
      {
        key: 'HandleConsignorVerification',
        method: 'POST',
        url: '/auction-master/backend/consignors/verifications/:id/:action',
        description: '審核寄售人身分驗證',
      },
    ],
  },
  {
    message: '紀錄相關',
    permissions: [
      {
        key: 'AdminGetWalletLogs',
        method: 'GET',
        url: '/auction-master/backend/wallets/logs',
        description: '取得錢包紀錄',
      },
      {
        key: 'AdminGetBonusLogs',
        method: 'GET',
        url: '/auction-master/backend/bonuses/logs',
        description: '取得紅利紀錄',
      },
    ],
  },
  {
    message: '物品相關',
    permissions: [
      {
        key: 'GetItemsAndDetails',
        method: 'GET',
        url: '/auction-master/backend/items',
        description: '取得物品與細項列表',
      },
      {
        key: 'GetItemAndDetails',
        method: 'GET',
        url: '/auction-master/backend/items/:id',
        description: '取得物品與細項',
      },
      {
        key: 'AdminUpdateItem',
        method: 'PATCH',
        url: '/auction-master/backend/items/:id',
        description: '修改物品',
      },
      {
        key: 'AdminUpsertItemPhoto',
        method: 'POST',
        url: '/auction-master/backend/items/:id/photos',
        description: '上傳物品照片',
      },
      {
        key: 'AdminReorderItemPhoto',
        method: 'PATCH',
        url: '/auction-master/backend/items/:id/photos',
        description: '重新排序物品照片',
      },
      {
        key: 'AdminDeleteItemPhoto',
        method: 'DELETE',
        url: '/auction-master/backend/items/:id/photos/:sorted',
        description: '刪除物品照片',
      },
      {
        key: 'DeleteAllItemPhotos',
        method: 'DELETE',
        url: '/auction-master/backend/items/photos',
        description: '刪除所有物品照片',
      },
      {
        key: 'ItemAppraisalReview',
        method: 'POST',
        url: '/auction-master/backend/items/:id/review',
        description: '審核寄售人物品',
      },
      {
        key: 'ItemArrival',
        method: 'POST',
        url: '/auction-master/backend/items/:id/arrival',
        description: '物品到貨',
      },
      {
        key: 'ItemReturnPending',
        method: 'POST',
        url: '/auction-master/backend/items/:id/return-pending',
        description: '等待退貨',
      },
      {
        key: 'ItemReturning',
        method: 'POST',
        url: '/auction-master/backend/items/:id/returning',
        description: '退貨中',
      },
      {
        key: 'ItemReturned',
        method: 'POST',
        url: '/auction-master/backend/items/:id/returned',
        description: '已退回物品',
      },
      {
        key: 'ItemWarehousePersonnelConfirmed',
        method: 'POST',
        url: '/auction-master/backend/items/:id/warehouse-personnel-confirmed',
        description: '倉管已確認',
      },
      {
        key: 'ItemAppraiserConfirmed',
        method: 'POST',
        url: '/auction-master/backend/items/:id/appraiser-confirmed',
        description: '鑑價師已確認',
      },
      {
        key: 'ItemBidding',
        method: 'POST',
        url: '/auction-master/backend/items/:id/bidding',
        description: '物品上架',
      },
      {
        key: 'ItemReclaimed',
        method: 'POST',
        url: '/auction-master/backend/items/:id/reclaimed',
        description: '物品收回',
      },
    ],
  },
] as const;

export type PermissionKey = (typeof PERMISSIONS_DATA)[number]['permissions'][number]['key'];
export const PERMISSION_MAP = mapToObj(PERMISSIONS_DATA.map((x) => x.permissions).flat(), (x) => [x.key, x] as const);
