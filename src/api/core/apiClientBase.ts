import ky from 'ky';

if (!process.env.API_BASE_URL) {
  throw new Error('API_BASE_URL is not set');
}

const apiClientBase = ky.extend({
  prefixUrl: process.env.API_BASE_URL,
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (response.status >= 400) {
          console.log(`apiClient: [${request.method}] ${request.url}:`);
          if (options.body) {
            console.log(
              `payload:`,
              typeof options.body === 'object' && 'entries' in options.body ? options.body.entries() : options.body
            );
          }
          try {
            console.log(`response: [${response.status}]:`, await response.clone().json());
          } catch {
            console.log(`response: [${response.status}]:`, await response.clone().text());
          }
        }
        return response;
      },
    ],
  },
});

export { apiClientBase };
