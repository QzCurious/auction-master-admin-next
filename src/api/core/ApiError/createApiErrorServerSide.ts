import { HTTPError } from 'ky';

import { FailedResponseJson } from '../static';

// https://github.com/win30221/auction-master-code/blob/main/errno/errno.go
// Undefined = "9999"  // 系統錯誤

// HTTP           = "10"  // 系統錯誤
// ValidParameter = "11"  // 驗證錯誤

// Mongo = "20"  // 系統錯誤
// MySQL = "21"  // 系統錯誤
// Redis = "22"  // 系統錯誤

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

function createApiError(code: string): ApiError {
  switch (code) {
    case '9999':
    case '10':
    case '20':
    case '21':
    case '22': {
      return {
        code,
        type: 'throw',
        message: '系統錯誤',
      };
    }

    case '11': {
      return {
        code,
        type: 'toast',
        message: '參數驗證錯誤',
      };
    }

    // 1000 auction-master
    case '1001': {
      return {
        code,
        type: 'toast',
        message: '沒有權限',
      };
    }
    case '1002': {
      return {
        code,
        type: 'toast',
        message: '登入錯誤',
      };
    }
    case '1003': {
      return {
        code,
        type: 'redirect',
        url: '/auth/sign-in',
      };
    }
    case '1004': {
      return {
        code,
        type: 'toast',
        message: '密碼錯誤',
      };
    }
    case '1005': {
      return {
        code,
        type: 'toast',
        message: '名字錯誤',
      };
    }
    case '1006': {
      return {
        code,
        type: 'toast',
        message: '身份證錯誤',
      };
    }

    case '1100': {
      return {
        code,
        type: 'toast',
        message: '查無 worker id',
      };
    }
    case '1101': {
      return {
        code,
        type: 'toast',
        message: '物品競標中',
      };
    }
    case '1102': {
      return {
        code,
        type: 'toast',
        message: '物品過期',
      };
    }
    case '1103': {
      return {
        code,
        type: 'toast',
        message: '物品類型未設定',
      };
    }
    case '1104': {
      return {
        code,
        type: 'toast',
        message: '最低估價未設定',
      };
    }
    case '1105': {
      return {
        code,
        type: 'toast',
        message: '日拍競標商品未結標',
      };
    }
    case '1106': {
      return {
        code,
        type: 'toast',
        message: '使用者已驗證',
      };
    }
    case '1107': {
      return {
        code,
        type: 'toast',
        message: '使用者未驗證',
      };
    }
    case '1108': {
      return {
        code,
        type: 'toast',
        message: '使用者帳號已存在',
      };
    }
    case '1109': {
      return {
        code,
        type: 'toast',
        message: '使用者暱稱已存在',
      };
    }
    case '1110': {
      return {
        code,
        type: 'toast',
        message: '超過取消緩衝時間',
      };
    }
    case '1111': {
      return {
        code,
        type: 'toast',
        message: '相同倉庫id',
      };
    }
    case '1112': {
      return {
        code,
        type: 'toast',
        message: '帳號規則錯誤',
      };
    }
    case '1113': {
      return {
        code,
        type: 'toast',
        message: '請提供 item id',
      };
    }
    case '1114': {
      return {
        code,
        type: 'toast',
        message: '超出時間範圍',
      };
    }
    case '1115': {
      return {
        code,
        type: 'toast',
        message: '查詢已達上限',
      };
    }
    case '1116': {
      return {
        code,
        type: 'toast',
        message: '照片已達上限',
      };
    }

    // 3100 admins
    case '3101': {
      return {
        code,
        type: 'toast',
        message: '使用者已存在',
      };
    }
    case '3102': {
      return {
        code,
        type: 'toast',
        message: '使用者不存在',
      };
    }

    // 3200 consignors
    case '3201': {
      return {
        code,
        type: 'toast',
        message: '使用者已存在',
      };
    }
    case '3202': {
      return {
        code,
        type: 'toast',
        message: '使用者不存在',
      };
    }
    case '3203': {
      return {
        code,
        type: 'toast',
        message: '審核申請已存在',
      };
    }
    case '3204': {
      return {
        code,
        type: 'toast',
        message: '審核申請不存在',
      };
    }

    // 3300 items
    case '3301': {
      return {
        code,
        type: 'toast',
        message: '物品不存在',
      };
    }

    // 3400 wallets
    case '3401': {
      return {
        code,
        type: 'toast',
        message: '錢包已存在',
      };
    }
    case '3402': {
      return {
        code,
        type: 'toast',
        message: '錢包不存在',
      };
    }
    case '3403': {
      return {
        code,
        type: 'toast',
        message: '錢包餘額不足',
      };
    }

    // 3500 bonuses
    case '3501': {
      return {
        code,
        type: 'toast',
        message: '紅利已存在',
      };
    }
    case '3502': {
      return {
        code,
        type: 'toast',
        message: '紅利不存在',
      };
    }
    case '3503': {
      return {
        code,
        type: 'toast',
        message: '紅利餘額不足',
      };
    }

    // 3600 auction-items
    case '3600': {
      return {
        code,
        type: 'toast',
        message: '日拍競標商品錯誤',
      };
    }
    case '3601': {
      return {
        code,
        type: 'toast',
        message: '日拍競標商品已存在',
      };
    }
    case '3602': {
      return {
        code,
        type: 'toast',
        message: '日拍競標商品不存在',
      };
    }

    // 3800 worker
    case '3801': {
      return {
        code,
        type: 'toast',
        message: 'worker 未登入',
      };
    }

    // 3900 shippings
    case '3901': {
      return {
        code,
        type: 'toast',
        message: '出貨單不存在',
      };
    }

    // 4000 reports
    case '4001': {
      return {
        code,
        type: 'toast',
        message: '報表不存在',
      };
    }
    case '4002': {
      return {
        code,
        type: 'toast',
        message: '交易紀錄不存在',
      };
    }

    default: {
      return {
        code,
        type: 'toast',
        message: '系統錯誤',
      };
    }
  }
}

async function extractErrorCode(err: unknown) {
  if (err instanceof HTTPError) {
    const res = (await err.response.json()) as FailedResponseJson;
    return res.status.code;
  }
  throw err;
}

export async function createApiErrorServerSide(err: unknown) {
  const code = await extractErrorCode(err);
  return { data: null, error: createApiError(code) };
}
