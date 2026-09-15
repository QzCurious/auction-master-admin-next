import { GetConfigs } from '@/server-action/GetConfigs';
import { type QueryOptions } from '@tanstack/react-query';

export function GetConfigsQueryOptions(...args: Parameters<typeof GetConfigs>) {
  return {
    queryKey: ['configs', ...args],
    queryFn: () => GetConfigs(...args),
  } satisfies QueryOptions;
}
