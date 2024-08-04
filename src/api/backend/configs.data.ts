import { mapToObj } from 'remeda';

export const CONFIGS_DATA = {
  yahooAuctionFeeRate: 0.1,
  commissionRate: 0.2,
  commissionBonusRate: 0.05,
  lineURL: 'https://lin.ee/YgTRcyc',
  shippingInfo: {
    company: {
      address: '台北市信義區市府路45號',
      recipientName: '台灣王',
      phone: '0900000000',
    },
    sevenEleven: {
      storeNumber: '123',
      storeName: '台灣7-11',
      recipientName: '7-11王',
      phone: '0987654321',
    },
    family: {
      storeNumber: '1234',
      storeName: '台灣全家',
      recipientName: '全家王',
      phone: '0912345678',
    },
  },
  itemType: [
    {
      key: 'AppraisableAuctionItemType',
      message: '可估價競標物品',
      value: 1,
    },
    {
      key: 'NonAppraisableAuctionItemType',
      message: '不可估價競標物品',
      value: 2,
    },
    {
      key: 'FixedPriceItemType',
      message: '定價物品',
      value: 3,
    },
    {
      key: 'CompanyDirectPurchaseType',
      message: '公司直購物品',
      value: 4,
    },
  ],
  itemStatus: [
    {
      key: 'SubmitAppraisalStatus',
      message: '已提交估價',
      value: 1,
    },
    {
      key: 'AppraisalFailureStatus',
      message: '估價失敗',
      value: 2,
    },
    {
      key: 'AppraisedStatus',
      message: '已估價',
      value: 3,
    },
    {
      key: 'ConsignmentApprovedStatus',
      message: '同意託售',
      value: 11,
    },
    {
      key: 'ConsignmentCanceledStatus',
      message: '取消託售',
      value: 12,
    },
    {
      key: 'ConsignorChoosesCompanyDirectPurchaseStatus',
      message: '選擇公司直購',
      value: 13,
    },
    {
      key: 'ConsignorShippedItem',
      message: '已寄出',
      value: 14,
    },
    {
      key: 'WarehouseArrivalStatus',
      message: '已到貨',
      value: 21,
    },
    {
      key: 'WarehouseReturnPendingStatus',
      message: '準備退回',
      value: 22,
    },
    {
      key: 'WarehouseReturningStatus',
      message: '退貨作業中',
      value: 23,
    },
    {
      key: 'WarehousePersonnelConfirmedStatus',
      message: '倉管已確認',
      value: 24,
    },
    {
      key: 'AppraiserConfirmedStatus',
      message: '鑑價師已確認',
      value: 25,
    },
    {
      key: 'ConsignorConfirmedStatus',
      message: '準備上架',
      value: 26,
    },
    {
      key: 'BiddingStatus',
      message: '競標中',
      value: 27,
    },
    {
      key: 'SoldStatus',
      message: '已售出',
      value: 31,
    },
    {
      key: 'CompanyDirectPurchaseStatus',
      message: '公司直購',
      value: 32,
    },
    {
      key: 'ReturnedStatus',
      message: '退回',
      value: 33,
    },
    {
      key: 'CompanyRepurchasedStatus',
      message: '被公司買回',
      value: 34,
    },
    {
      key: 'CompanyReclaimedStatus',
      message: '被公司收回',
      value: 35,
    },
  ],
  auctionItemStatus: [
    {
      key: 'InitStatus',
      message: '初始化',
      value: 1,
    },
    {
      key: 'StopBiddingStatus',
      message: '停止出價',
      value: 2,
    },
    {
      key: 'HighestBiddedStatus',
      message: '系統出價最高者',
      value: 3,
    },
    {
      key: 'NotHighestBiddedStatus',
      message: '系統已出價但未最高者',
      value: 4,
    },
    {
      key: 'ClosedStatus',
      message: '結標',
      value: 11,
    },
    {
      key: 'SoldStatus',
      message: '售出',
      value: 21,
    },
    {
      key: 'CanceledStatus',
      message: '手動取消',
      value: 22,
    },
  ],
  consignorStatus: [
    {
      key: 'EnabledStatus',
      message: '啟用',
      value: 1,
    },
    {
      key: 'AwaitingVerificationCompletionStatus',
      message: '身份尚未驗證',
      value: 11,
    },
    {
      key: 'DisabledStatus',
      message: '禁用',
      value: 99,
    },
  ],
  consignorVerificationStatus: [
    {
      key: 'AwaitingVerificationCompletionStatus',
      message: '尚未審核',
      value: 11,
    },
    {
      key: 'VerificationSuccessfulStatus',
      message: '驗證成功',
      value: 12,
    },
    {
      key: 'VerificationFailedStatus',
      message: '驗證失敗',
      value: 13,
    },
  ],
  workerType: [
    {
      key: 'SellerType',
      message: '出品',
      value: 'Seller',
    },
    {
      key: 'WatcherType',
      message: '盯標',
      value: 'Watcher',
    },
  ],
  workerStatus: [
    {
      key: 'ActiveStatus',
      message: '啟用中',
      value: 1,
    },
    {
      key: 'AwaitingSetupCompletionStatus',
      message: '等待建立完畢',
      value: 2,
    },
    {
      key: 'InvalidatedStatus',
      message: '已失效',
      value: 99,
    },
  ],
  adminStatus: [
    {
      key: 'EnabledStatus',
      message: '啟用',
      value: 1,
    },
    {
      key: 'DisabledStatus',
      message: '禁用',
      value: 99,
    },
  ],
  shippingType: [
    {
      key: 'AddressType',
      message: '地址寄出',
      value: 1,
    },
    {
      key: 'SevenElevenType',
      message: '7-11寄出',
      value: 2,
    },
    {
      key: 'FamilyType',
      message: '全家寄出',
      value: 3,
    },
  ],
  shippingStatus: [
    {
      key: 'SubmitAppraisalStatus',
      message: '已提交出貨',
      value: 1,
    },
    {
      key: 'ProcessingStatus',
      message: '理貨中',
      value: 2,
    },
    {
      key: 'ShippedStatus',
      message: '已寄出',
      value: 3,
    },
  ],
} as const;

export const ITEM_TYPE_DATA = CONFIGS_DATA.itemType;
export const ITEM_TYPE_MAP = mapToObj(ITEM_TYPE_DATA, ({ key, value }) => [key, value]);
export const ITEM_TYPE_KEY_MAP = mapToObj(ITEM_TYPE_DATA, ({ key, value }) => [value, key]);

export const ITEM_STATUS_DATA = CONFIGS_DATA.itemStatus;
export const ITEM_STATUS_MAP = mapToObj(ITEM_STATUS_DATA, ({ key, value }) => [key, value]);
export const ITEM_STATUS_MESSAGE_MAP = mapToObj(ITEM_STATUS_DATA, ({ key, message }) => [key, message]);
export const ITEM_STATUS_KEY_MAP = mapToObj(ITEM_STATUS_DATA, ({ key, value }) => [value, key]);

export const AUCTION_ITEM_STATUS_DATA = CONFIGS_DATA.auctionItemStatus;
export const AUCTION_ITEM_STATUS_MAP = mapToObj(AUCTION_ITEM_STATUS_DATA, ({ key, value }) => [key, value]);
export const AUCTION_ITEM_MESSAGE_MAP = mapToObj(AUCTION_ITEM_STATUS_DATA, ({ key, message }) => [key, message]);
export const AUCTION_ITEM_STATUS_KEY_MAP = mapToObj(AUCTION_ITEM_STATUS_DATA, ({ key, value }) => [value, key]);

export const CONSIGNOR_STATUS_DATA = CONFIGS_DATA.consignorStatus;
export const CONSIGNOR_STATUS_MAP = mapToObj(CONSIGNOR_STATUS_DATA, ({ key, value }) => [key, value]);

export const CONSIGNOR_VERIFICATION_STATUS_DATA = CONFIGS_DATA.consignorVerificationStatus;
export const CONSIGNOR_VERIFICATION_STATUS_MAP = mapToObj(CONSIGNOR_VERIFICATION_STATUS_DATA, ({ key, value }) => [
  key,
  value,
]);

export const WORKER_TYPE_DATA = CONFIGS_DATA.workerType;
export const WORKER_TYPE_MAP = mapToObj(WORKER_TYPE_DATA, ({ key, value }) => [key, value]);
export const WORKER_STATUS_DATA = CONFIGS_DATA.workerStatus;
export const WORKER_STATUS_MAP = mapToObj(WORKER_STATUS_DATA, ({ key, value }) => [key, value]);
export const WORKER_STATUS_KEY_MAP = mapToObj(WORKER_STATUS_DATA, ({ key, value }) => [value, key]);
export const WORKER_STATUS_MESSAGE_MAP = mapToObj(WORKER_STATUS_DATA, ({ key, message }) => [key, message]);

export const ADMIN_STATUS_DATA = CONFIGS_DATA.adminStatus;
export const ADMIN_STATUS_MAP = mapToObj(ADMIN_STATUS_DATA, ({ key, value }) => [key, value]);

export const SHIPPING_TYPE_DATA = CONFIGS_DATA.shippingType;
export const SHIPPING_TYPE_MAP = mapToObj(SHIPPING_TYPE_DATA, ({ key, value }) => [key, value]);

export const SHIPPING_STATUS_DATA = CONFIGS_DATA.shippingStatus;
export const SHIPPING_STATUS_MAP = mapToObj(SHIPPING_STATUS_DATA, ({ key, value }) => [key, value])
