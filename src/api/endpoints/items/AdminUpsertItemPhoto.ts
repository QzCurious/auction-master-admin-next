import { type SuccessResponseJson } from '@/api/core/static';
import { type KyInstance } from 'ky';

type Data = 'Success';

export async function AdminUpsertItemPhoto(api: KyInstance, id: number, formData: FormData) {
  if (formData.getAll('photo').length === 0) {
    throw new Error('photo is required and should be an array of files');
  }
  if (formData.getAll('sorted').length !== formData.getAll('photo').length) {
    throw new Error('photo and sorted should have the same length');
  }

  const res = await api
    .post<SuccessResponseJson<Data>>(`backend/items/${id}/photos`, {
      body: formData,
    })
    .json();
  return res;
}
