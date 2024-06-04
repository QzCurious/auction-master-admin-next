import { z } from 'zod';

import { apiClient } from './apiClient';
import { throwIfInvalid } from './helpers/throwIfInvalid';

const ReqSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
});

interface Data {
  token: string;
}

type ErrorCode =
  // TokenIncorrect
  '1003';

export async function sessionRefresh(payload: z.input<typeof ReqSchema>) {
  throwIfInvalid(payload, ReqSchema);

  const { token, refreshToken } = payload;
  const formData = new FormData();
  formData.append('refreshToken', refreshToken);

  const res = await apiClient<Data, ErrorCode>('/session/refresh', {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res;
}
