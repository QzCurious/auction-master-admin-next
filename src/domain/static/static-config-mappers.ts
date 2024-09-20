import { CONFIGS_DATA } from './static-configs.data';

function createMapFromTuple<T extends Readonly<Array<Record<PropertyKey, any>>>, By extends keyof T[number]>(
  tuple: T,
  by: By
): Record<By, T[number]> {
  return tuple.reduce<any>((acc, cur) => {
    const key = cur[by];
    (acc as Record<By, T>)[key] = cur;
    return acc;
  }, {});
}

type ConfigObj =
  | {
      key: string;
      value: number;
      message: string;
    }
  | {
      key: string;
      value: string;
      message: string;
    };

function createMapper<T extends ConfigObj>(data: readonly T[]) {
  const indexByKey = createMapFromTuple(data, 'key');
  const indexByValue = createMapFromTuple(data, 'value');

  function get<K extends 'key' | 'value'>(key: K, value: T[K]): T {
    if (key === 'key') {
      return indexByKey[value] as any;
    }
    return indexByValue[value] as any;
  }

  function getEnum<K extends T['key'] | T['value']>(index: K): K extends T['key'] ? T['value'] : T['key'] {
    if (index in indexByKey) {
      return indexByKey[index].value as any;
    }
    return indexByValue[index].key;
  }

  return { data, get, enum: getEnum };
}

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

export const ACTION_TYPE = createMapper(CONFIGS_DATA.actionType);
export type ACTION_TYPE = (typeof ACTION_TYPE.data)[number];

export const SHIPMENT_TYPE = createMapper(CONFIGS_DATA.shipmentType);
export type SHIPMENT_TYPE = (typeof SHIPMENT_TYPE.data)[number];

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
