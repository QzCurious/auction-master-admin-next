import ky, { type KyRequest, type KyResponse, type NormalizedOptions } from 'ky';

if (!process.env.API_BASE_URL) {
  throw new Error('API_BASE_URL is not set');
}

const apiClientBase = ky.extend({
  prefixUrl: process.env.API_BASE_URL,
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (process.env.API_LOG || response.status >= 400) {
          await log(request, options, response);
        }
      },
    ],
  },
});

export { apiClientBase };

const sensitiveKeyPattern = /authorization|cookie|password|secret|token/i;

interface EntryBody {
  entries(): IterableIterator<[string, FormDataEntryValue]>;
};

function formatRequestBody(body: BodyInit) {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('entries' in body) ||
    typeof (body as EntryBody).entries !== 'function'
  ) {
    return '[request body omitted]';
  }

  return Object.fromEntries(
    Array.from((body as EntryBody).entries(), ([key, value]) => [
      key,
      sensitiveKeyPattern.test(key) ? '[REDACTED]' : typeof value === 'string' ? value : `[File: ${value.name}]`,
    ])
  );
}

async function log(request: KyRequest, options: NormalizedOptions, response: KyResponse) {
  console.log(`apiClient: [${request.method}] ${request.url}:`);
  if (options.body) {
    console.log('payload:', formatRequestBody(options.body));
  }

  if (response.body === null) {
    console.log(`response: [${response.status}]:`, null);
    return;
  }

  const text = await response.clone().text();
  let body: unknown = text || null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // Keep non-JSON responses as text.
    }
  }

  console.log(`response: [${response.status}]:`, body);
}
