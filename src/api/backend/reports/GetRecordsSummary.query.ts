import { GetRecordsSummary } from '@/server-action/backend/reports/GetRecordsSummary';
import { type QueryOptions } from '@tanstack/react-query';

export function GetRecordsSummaryQueryOptions(...args: Parameters<typeof GetRecordsSummary>) {
  return {
    queryKey: ['/reports/records/summary', ...args],
    queryFn: () => GetRecordsSummary(...args),
  } satisfies QueryOptions;
}
