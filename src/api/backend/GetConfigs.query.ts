import { type QueryOptions } from '@tanstack/react-query';

import { GetBackendConfigs } from './GetConfigs';

export function GetBackendConfigsQueryOptions(...args: Parameters<typeof GetBackendConfigs>) {
  return {
    queryKey: ['configs', ...args],
    queryFn: () => GetBackendConfigs(...args),
  } satisfies QueryOptions;
}
