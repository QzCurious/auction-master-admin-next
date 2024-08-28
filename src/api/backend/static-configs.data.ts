export const CONFIGS_DATA = {
  walletAction: [
    {
      key: 'WalletSoldItemAction',
      message: '售出物品',
      value: 1000,
    },
    {
      key: 'WalletCompanyDirectPurchaseItemAction',
      message: '公司直購',
      value: 1001,
    },
    {
      key: 'WalletCompanyPurchasedItemAction',
      message: '公司買回',
      value: 1002,
    },
    {
      key: 'WalletWithdrawalAction',
      message: '',
      value: 1003,
    },
    {
      key: 'WalletWithdrawalRefundAction',
      message: '',
      value: 1004,
    },
    {
      key: 'WalletPayFeeAction',
      message: '支付手續費',
      value: 2000,
    },
    {
      key: 'WalletPaySpaceFeeAction',
      message: '支付倉儲費',
      value: 2001,
    },
    {
      key: 'WalletPayAuctionItemCancellationFeeAction',
      message: '支付取消日拍手續費',
      value: 2002,
    },
  ],
  bonusAction: [
    {
      key: 'BonusSoldItemAction',
      message: '售出物品',
      value: 1000,
    },
  ],
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
      key: 'CompanyPurchasedStatus',
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
      key: 'ConsignorRequestCancellationStatus',
      message: '寄售人申請取消',
      value: 12,
    },
    {
      key: 'AwaitingConsignorPayFeeStatus',
      message: '等待寄售人付款',
      value: 13,
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
    {
      key: 'ConsignorFeePaidStatus',
      message: '寄售人已付手續費',
      value: 23,
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
  recordType: [
    {
      key: 'SoldItemType',
      message: '賣出物品',
      value: 1000,
    },
    {
      key: 'CompanyDirectPurchaseType',
      message: '公司直購',
      value: 1001,
    },
    {
      key: 'CompanyPurchasedType',
      message: '公司買回',
      value: 1002,
    },
    {
      key: 'WithdrawalType',
      message: '提領',
      value: 1003,
    },
    {
      key: 'PayYahooAuctionFeeType',
      message: '支付結標日拍手續費',
      value: 2000,
    },
    {
      key: 'PayAuctionItemCancellationFeeType',
      message: '支付取消日拍手續費',
      value: 2001,
    },
    {
      key: 'PaySpaceFeeType',
      message: '支付留倉費',
      value: 2002,
    },
    {
      key: 'PayShippingCostType',
      message: '支付運費',
      value: 2003,
    },
  ],
  recordStatus: [
    {
      key: 'UnpaidStatus',
      message: '未付款',
      value: 1,
    },
    {
      key: 'SubmitPaymentStatus',
      message: '已提交付款',
      value: 2,
    },
    {
      key: 'PaidStatus',
      message: '已付款',
      value: 10,
    },
    {
      key: 'CancelPaymentStatus',
      message: '取消付款',
      value: 11,
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
} as const;

type MapFromTuple<T extends readonly any[], K extends keyof T[number]> = {
  [k in T[number] extends { [t in K]: any } ? T[number][K] : never]: Extract<T[number], { [t in K]: k }>;
};

function createMapFromTuple<T extends Readonly<Array<Record<PropertyKey, any>>>, By extends keyof T[number]>(
  tuple: T,
  by: By
): MapFromTuple<T, By> {
  return tuple.reduce<any>((acc, cur) => {
    const key = cur[by];
    (acc as Record<By, T>)[key] = cur;
    return acc;
  }, {});
}

type MapperTupleField = 'key' | 'value' | 'message';
function createMapper<T extends Readonly<Array<Record<MapperTupleField, any>>>>(data: T) {
  const indexByKey = createMapFromTuple(data, 'key');
  const indexByValue = createMapFromTuple(data, 'value');
  const indexByMessage = createMapFromTuple(data, 'message');

  interface ValueMap {
    key: keyof typeof indexByKey;
    value: keyof typeof indexByValue;
    message: keyof typeof indexByMessage;
  }
  type ReturnMap<K extends MapperTupleField, V extends ValueMap[K]> = {
    key: typeof indexByKey;
    value: typeof indexByValue;
    message: typeof indexByMessage;
  }[K][V];

  function get<K extends MapperTupleField, V extends ValueMap[K]>(key: K, value: V): ReturnMap<K, V> {
    if (key === 'key') {
      return indexByKey[value] as any;
    } else if (key === 'value') {
      return indexByValue[value] as any;
    }
    return indexByMessage[value] as any;
  }

  function getEnum<K extends keyof typeof indexByKey | keyof typeof indexByValue>(
    index: K
  ): K extends keyof typeof indexByKey ? (typeof indexByKey)[K]['value'] : (typeof indexByValue)[K]['key'] {
    if (typeof index === 'string') {
      return indexByKey[index].value;
    }
    return indexByValue[index].key;
  }

  return { data, get, enum: getEnum };
}

// function createEnum<T extends { key: string; value: number }>(tuple: readonly T[]) {
//   const indexByKey = createMapFromTuple(tuple, 'key')
//   const indexByValue = createMapFromTuple(tuple, 'value')

//   function get<I extends keyof typeof indexByKey | keyof typeof indexByValue>(
//     index: I,
//   ): I extends keyof typeof indexByKey
//     ? (typeof indexByKey)[I]['value']
//     : (typeof indexByValue)[I]['key'] {
//     if (typeof index === 'string') {
//       return indexByKey[index].value as any
//     } else {
//       return indexByValue[index].key as any
//     }
//   }

//   return { get }
// }

export const WALLET_ACTION = createMapper(CONFIGS_DATA.walletAction);
export type WALLET_ACTION = (typeof WALLET_ACTION.data)[number];

export const BONUS_ACTION = createMapper(CONFIGS_DATA.bonusAction);
export type BONUS_ACTION = (typeof BONUS_ACTION.data)[number];

export const ITEM_TYPE = createMapper(CONFIGS_DATA.itemType);
export type ITEM_TYPE = (typeof ITEM_TYPE.data)[number];

export const ITEM_STATUS = createMapper(CONFIGS_DATA.itemStatus);
export type ITEM_STATUS = (typeof ITEM_STATUS.data)[number];

export const AUCTION_ITEM_STATUS = createMapper(CONFIGS_DATA.auctionItemStatus);
export type AUCTION_ITEM_STATUS = (typeof AUCTION_ITEM_STATUS.data)[number];

export const CONSIGNOR_STATUS = createMapper(CONFIGS_DATA.consignorStatus);
export type CONSIGNOR_STATUS = (typeof CONSIGNOR_STATUS.data)[number];

export const CONSIGNOR_VERIFICATION_STATUS = createMapper(CONFIGS_DATA.consignorVerificationStatus);
export type CONSIGNOR_VERIFICATION_STATUS = (typeof CONSIGNOR_VERIFICATION_STATUS.data)[number];

export const SHIPPING_TYPE = createMapper(CONFIGS_DATA.shippingType);
export type SHIPPING_TYPE = (typeof SHIPPING_TYPE.data)[number];

export const SHIPPING_STATUS = createMapper(CONFIGS_DATA.shippingStatus);
export type SHIPPING_STATUS = (typeof SHIPPING_STATUS.data)[number];

export const RECORD_TYPE = createMapper(CONFIGS_DATA.recordType);
export type RECORD_TYPE = (typeof RECORD_TYPE.data)[number];

export const RECORD_STATUS = createMapper(CONFIGS_DATA.recordStatus);
export type RECORD_STATUS = (typeof RECORD_STATUS.data)[number];

export const WORKER_TYPE = createMapper(CONFIGS_DATA.workerType);
export type WORKER_TYPE = (typeof WORKER_TYPE.data)[number];

export const WORKER_STATUS = createMapper(CONFIGS_DATA.workerStatus);
export type WORKER_STATUS = (typeof WORKER_STATUS.data)[number];

export const ADMIN_STATUS = createMapper(CONFIGS_DATA.adminStatus);
export type ADMIN_STATUS = (typeof ADMIN_STATUS.data)[number];
