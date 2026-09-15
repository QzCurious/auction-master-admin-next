import { isRedirectError } from 'next/dist/client/components/redirect';
import { type FailedResponseJson } from '@/api/core/static';
import { createApiError } from '@/domain/api/ApiError';
import { invalidSessionError } from '@/domain/auth/errors';
import { HTTPError } from 'ky';

function isFailedResponseJson(value: unknown): value is FailedResponseJson {
  if (typeof value !== 'object' || value === null || !('status' in value)) {
    return false;
  }

  const status = value.status;
  return typeof status === 'object' && status !== null && 'code' in status && typeof status.code === 'string';
}

async function extractErrorCode(err: unknown) {
  if (!(err instanceof HTTPError)) {
    console.error('API request failed');
    return '9999';
  }

  try {
    const cachedData = (err as HTTPError & { data?: unknown }).data;
    const data = cachedData === undefined ? await err.response.json() : cachedData;

    if (isFailedResponseJson(data)) {
      return data.status.code;
    }
  } catch (parseError) {
    console.error(`Unable to parse API error response [${err.response.status}]`);
  }

  return '9999';
}

export async function createApiErrorServerSide(err: unknown) {
  if (isRedirectError(err)) throw err;
  if (err === invalidSessionError) return { data: null, error: invalidSessionError };
  const code = await extractErrorCode(err);
  return { data: null, error: createApiError(code) };
}
