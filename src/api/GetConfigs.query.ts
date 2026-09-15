import { requireActionSuccess } from '@/domain/data/actionResult';
import { GetConfigs } from '@/server-action/GetConfigs';
import { type QueryOptions } from '@tanstack/react-query';

export function GetConfigsQueryOptions(...args: Parameters<typeof GetConfigs>) {
  return {
    queryKey: ['configs', ...args],
    queryFn: () => requireActionSuccess(GetConfigs(...args)),
  } satisfies QueryOptions;
}
