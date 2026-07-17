import { HTTPError } from 'ky';

import { type FailedResponseJson } from '../static';

interface HandleByToast {
  code: string;
  type: 'toast';
  message: string;
}

interface HandleByRedirect {
  code: string;
  type: 'redirect';
  url: string;
}

interface HandleByThrow {
  code: string;
  type: 'throw';
  message: string;
}

export type ApiError = HandleByToast | HandleByRedirect | HandleByThrow;

const toastMessages: Record<string, string> = {
  '10': '系統錯誤',
  '11': '參數驗證錯誤',
  '20': '系統錯誤',
  '21': '系統錯誤',
  '22': '系統錯誤',
  '1001': '沒有權限',
  '1002': '登入錯誤',
  '1004': '密碼錯誤',
  '1005': '名字錯誤',
  '1006': '身份證錯誤',
  '1100': '查無 worker id',
  '1101': '物品競標中',
  '1102': '物品過期',
  '1103': '物品類型未設定',
  '1104': '最低估價未設定',
  '1105': '日拍競標商品未結標',
  '1106': '使用者已驗證',
  '1107': '使用者未驗證',
  '1108': '使用者帳號已存在',
  '1109': '使用者暱稱已存在',
  '1110': '超過取消緩衝時間',
  '1111': '相同倉庫id',
  '1112': '帳號規則錯誤',
  '1113': '請提供 item id',
  '1114': '超出時間範圍',
  '1115': '查詢已達上限',
  '1116': '照片已達上限',
  '1117': 'LINE 綁定資料衝突',
  '1118': 'LINE 綁定已過期',
  '3101': '使用者已存在',
  '3102': '使用者不存在',
  '3201': '使用者已存在',
  '3202': '使用者不存在',
  '3203': '審核申請已存在',
  '3204': '審核申請不存在',
  '3301': '物品不存在',
  '3401': '錢包已存在',
  '3402': '錢包不存在',
  '3403': '錢包餘額不足',
  '3501': '紅利已存在',
  '3502': '紅利不存在',
  '3503': '紅利餘額不足',
  '3600': '日拍競標商品錯誤',
  '3601': '日拍競標商品已存在',
  '3602': '日拍競標商品不存在',
  '3801': 'worker 未登入',
  '3901': '出貨單不存在',
  '4001': '報表不存在',
  '4002': '交易紀錄不存在',
  '9999': '系統錯誤',
};

function createApiError(code: string): ApiError {
  if (code === '1003') {
    return {
      code,
      type: 'redirect',
      url: '/auth/sign-in',
    };
  }

  return {
    code,
    type: 'toast',
    message: toastMessages[code] ?? '系統錯誤',
  };
}

function isFailedResponseJson(value: unknown): value is FailedResponseJson {
  if (typeof value !== 'object' || value === null || !('status' in value)) {
    return false;
  }

  const status = value.status;
  return typeof status === 'object' && status !== null && 'code' in status && typeof status.code === 'string';
}

async function extractErrorCode(err: unknown) {
  if (!(err instanceof HTTPError)) {
    console.error('API request failed:', err instanceof Error ? err.message : String(err));
    return '9999';
  }

  try {
    const cachedData = (err as HTTPError & { data?: unknown }).data;
    const data = cachedData === undefined ? await err.response.json() : cachedData;

    if (isFailedResponseJson(data)) {
      return data.status.code;
    }
  } catch (parseError) {
    console.error(
      `Unable to parse API error response [${err.response.status}]:`,
      parseError instanceof Error ? parseError.message : String(parseError)
    );
  }

  return '9999';
}

export async function createApiErrorServerSide(err: unknown) {
  const code = await extractErrorCode(err);
  return { data: null, error: createApiError(code) };
}
