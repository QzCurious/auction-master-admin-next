import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function HandleConsignorVerification(api: KyInstance, id: number, action: 'approve' | 'reject') {
  if (action === 'approve') {
    const res = await api
      .post<SuccessResponseJson<Data>>(`backend/consignors/verifications/${id}/${action}`, {})
      .json();
    return res;
  }

  const res = await api.post<SuccessResponseJson<Data>>(`backend/consignors/verifications/${id}/${action}`).json();
  return res;
}
