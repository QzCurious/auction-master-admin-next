import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { apiClient } from './apiClient';

export const ReqSchema = z.object({
  account: z.string().min(1, 'Account is required'),
  password: z.string().min(1, 'Password is required'),
});

interface Data {
  token: string;
  refreshToken: string;
}

type ErrorCode =
  // PermissionDenied
  | '1001'
  // PasswordIncorrect
  | '1004'
  // AdminNotExist
  | '1502';

export async function session(formData: FormData) {
  const parsed = ReqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { data: null, error: null, status: null, parseError: parsed.error };
  }

  const res = await apiClient<Data, ErrorCode>('/session', {
    method: 'POST',
    body: formData,
  });

  if (res.error) {
    return { ...res, parseError: null };
  }

  revalidatePath('/', 'layout');

  return { ...res, parseError: null };
}
