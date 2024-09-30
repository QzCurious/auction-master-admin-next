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
      message: '提款',
      value: 1003,
    },
    {
      key: 'WalletWithdrawalRefundAction',
      message: '提款返回',
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
    {
      key: 'BonusCompanyPurchasedItemAction',
      message: '公司買回',
      value: 1001,
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
    {
      key: 'NoBidsPlacedStatus',
      message: '無人下標',
      value: 24,
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
  actionType: [
    {
      key: 'YahooDispatchActionType',
      message: '日拍出貨',
      value: 1,
    },
    {
      key: 'ReturnActionType',
      message: '退貨',
      value: 2,
    },
  ],
  shipmentType: [
    {
      key: 'AddressShipmentType',
      message: '地址寄出',
      value: 1,
    },
    {
      key: 'SevenElevenShipmentType',
      message: '7-11寄出',
      value: 2,
    },
    {
      key: 'FamilyShipmentType',
      message: '全家寄出',
      value: 3,
    },
  ],
  shippingStatus: [
    {
      key: 'AwaitingConsignorPayFeeStatus',
      message: '等待寄售人付費',
      value: 1,
    },
    {
      key: 'SubmitAppraisalStatus',
      message: '已提交出貨',
      value: 2,
    },
    {
      key: 'ProcessingStatus',
      message: '理貨中',
      value: 3,
    },
    {
      key: 'ShippedStatus',
      message: '已寄出',
      value: 4,
    },
    {
      key: 'ClosedStatus',
      message: '已結束',
      value: 10,
    },
    {
      key: 'CanceledStatus',
      message: '取消',
      value: 99,
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
      key: 'PayReturnItemFeeType',
      message: '支付退貨費用',
      value: 2003,
    },
    {
      key: 'InternationalShippingCostsType',
      message: '國際運費',
      value: 3000,
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
