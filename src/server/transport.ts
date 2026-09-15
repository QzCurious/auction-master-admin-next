import 'server-only';

import { createApiTransport } from '@/api/transport';

import { apiBaseUrl } from './apiConfig';

export const transport = createApiTransport({ baseUrl: apiBaseUrl });
