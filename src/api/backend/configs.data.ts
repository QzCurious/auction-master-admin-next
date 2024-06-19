
export const CONFIGS_DATA = {
  yahooAuctionFeeRate: 0.1,
  commissionRate: 0.2,
  commissionBonusRate: 0.05,
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
  ],
  itemStatus: [
    {
      key: 'InitStatus',
      message: '初始化',
      value: 1,
    },
    {
      key: 'SubmitAppraisalStatus',
      message: '已提交估價',
      value: 2,
    },
    {
      key: 'AppraisalFailureStatus',
      message: '估價失敗',
      value: 3,
    },
    {
      key: 'AppraisedStatus',
      message: '已估價',
      value: 4,
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
      key: 'WarehouseArrivalStatus',
      message: '已到倉庫',
      value: 21,
    },
    {
      key: 'WarehouseReturnPendingStatus',
      message: '準備退回客戶',
      value: 22,
    },
    {
      key: 'DetailsFullyCompletedStatus',
      message: '上架資料已齊全',
      value: 23,
    },
    {
      key: 'ReadyStatus',
      message: '準備上架',
      value: 24,
    },
    {
      key: 'SoldStatus',
      message: '已售出',
      value: 31,
    },
    {
      key: 'ReturnedStatus',
      message: '退回',
      value: 32,
    },
    {
      key: 'CompanyRepurchasedStatus',
      message: '被公司買回',
      value: 33,
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
      message: '啟用',
      value: 1,
    },
    {
      message: '身份尚未驗證',
      value: 11,
    },
    {
      message: '禁用',
      value: 99,
    },
  ],
  consignorVerificationStatus: [
    {
      message: '尚未審核',
      value: 11,
    },
    {
      message: '驗證成功',
      value: 12,
    },
    {
      message: '驗證失敗',
      value: 13,
    },
  ],
  shippingInfo: '',
  workerType: [
    {
      message: '出品',
      value: 'Seller',
    },
    {
      message: '盯標',
      value: 'Watcher',
    },
  ],
  adminStatus: [
    {
      message: '啟用',
      value: 1,
    },
    {
      message: '禁用',
      value: 99,
    },
  ],
} as const;

export const ITEM_TYPE_DATA = CONFIGS_DATA.itemType;
export const ITEM_STATUS_DATA = CONFIGS_DATA.itemStatus;
export const AUCTION_ITEM_STATUS_DATA = CONFIGS_DATA.auctionItemStatus;
export const CONSIGNOR_STATUS_DATA = CONFIGS_DATA.consignorStatus;
export const CONSIGNOR_VERIFICATION_STATUS_DATA = CONFIGS_DATA.consignorVerificationStatus;
export const SHIPPING_INFO_DATA = CONFIGS_DATA.shippingInfo;
export const WORKER_TYPE_DATA = CONFIGS_DATA.workerType;
export const ADMIN_STATUS_DATA = CONFIGS_DATA.adminStatus;
