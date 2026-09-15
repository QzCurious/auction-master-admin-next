import { apiBaseUrl } from '@/server/apiConfig';
import ky, { type KyRequest, type KyResponse, type NormalizedOptions } from 'ky';

const apiClientBase = ky.extend({
  prefixUrl: apiBaseUrl,
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
  entries: () => IterableIterator<[string, FormDataEntryValue]>;
}

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
  console.log(`apiClient: [${request.method}] ${new URL(request.url).pathname}:`);
  if (options.body) {
    console.log('payload:', formatRequestBody(options.body));
  }

  if (response.body === null) {
    console.log(`response: [${response.status}]:`, null);
    return;
  }

  // Upstream bodies may contain credentials or user data, including on failures.
  console.log(`response: [${response.status}]`);
}
