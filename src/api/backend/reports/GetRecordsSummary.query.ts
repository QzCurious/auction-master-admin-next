import { type QueryOptions } from '@tanstack/react-query';

import { GetRecordsSummary } from './GetRecordsSummary';

export function GetRecordsSummaryQueryOptions(...args: Parameters<typeof GetRecordsSummary>) {
  return {
    queryKey: ['/reports/records/summary', ...args],
    queryFn: () => GetRecordsSummary(...args),
  } satisfies QueryOptions;
}
