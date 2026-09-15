import { requireActionSuccess } from '@/domain/data/actionResult';
import { GetRecordsSummary } from '@/server-action/backend/reports/GetRecordsSummary';
import { type QueryOptions } from '@tanstack/react-query';

export function GetRecordsSummaryQueryOptions(...args: Parameters<typeof GetRecordsSummary>) {
  return {
    queryKey: ['/reports/records/summary', ...args],
    queryFn: () => requireActionSuccess(GetRecordsSummary(...args)),
  } satisfies QueryOptions;
}
