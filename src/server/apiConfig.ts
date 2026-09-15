const baseUrl = process.env.API_BASE_URL;
if (!baseUrl) throw new Error('API_BASE_URL is not set');

export const apiBaseUrl = baseUrl;
