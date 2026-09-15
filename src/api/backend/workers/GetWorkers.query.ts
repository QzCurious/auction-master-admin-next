import { GetWorkers } from '@/server-action/backend/workers/GetWorkers';
import { type QueryOptions } from '@tanstack/react-query';

export function GetWorkersQueryOptions(...args: Parameters<typeof GetWorkers>) {
  return {
    queryKey: ['GetWorkers', ...args],
    queryFn: () => GetWorkers(...args),
  } satisfies QueryOptions;
}
