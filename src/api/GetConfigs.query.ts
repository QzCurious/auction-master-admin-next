import { type QueryOptions } from '@tanstack/react-query';

import { GetConfigs } from './GetConfigs';

export function GetConfigsQueryOptions(...args: Parameters<typeof GetConfigs>) {
  return {
    queryKey: ['configs', ...args],
    queryFn: () => GetConfigs(...args),
  } satisfies QueryOptions;
}
