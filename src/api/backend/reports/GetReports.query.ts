import { type QueryOptions } from '@tanstack/react-query';

import { GetReports } from './GetReports';

export function GetReportsQueryOptions(...args: Parameters<typeof GetReports>) {
  return {
    queryKey: ['reports', ...args],
    queryFn: () => GetReports(...args),
  } satisfies QueryOptions;
}
