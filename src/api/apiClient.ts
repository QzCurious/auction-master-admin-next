'use server';

export async function apiClient<Data, ErrorCode extends string = never>(
  input: string,
  init?: RequestInit
): Promise<ApiClientResponse<Data, ErrorCode>> {
  if (!process.env.API_BASE_URL) {
    throw new Error('API_BASE_URL is not set');
  }

  const url = process.env.API_BASE_URL + input;
  const res = await fetch(url, init);

  if (process.env.API_LOG || !res.ok) {
    console.log(`apiClient:`, `[${init?.method ?? 'GET'} ${url}]:`);
    console.log(`payload:`, init?.body instanceof FormData ? Object.fromEntries(init.body) : init?.body);
    console.log(
      `response:`,
      await res
        .clone()
        .json()
        .catch(() => res.clone().text())
    );
  }

  try {
    const j = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return { ...j, error: !j.data ? j.status.code : null };
  } catch (e) {
    console.log(e);
    throw new Error('Failed to parse response as JSON');
  }
}

export type ApiClientResponse<Data, ErrorCode extends string = never> =
  | {
      data: Data;
      error: null;
      status: {
        code: '0';
        message: 'Success';
        dateTime: string;
        traceCode: string;
      };
    }
  | (ErrorCode extends string
      ? {
          data: null;
          error: ErrorCode;
          status: {
            code: ErrorCode;
            message: string;
            dateTime: string;
            traceCode: string;
          };
        }
      : never);
