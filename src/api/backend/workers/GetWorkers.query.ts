import { type QueryOptions } from '@tanstack/react-query';

import { GetWorkers } from './GetWorkers';

export function GetWorkersQueryOptions(...args: Parameters<typeof GetWorkers>) {
  return {
    queryKey: ['GetWorkers', ...args],
    queryFn: () => GetWorkers(...args),
  } satisfies QueryOptions;
}
