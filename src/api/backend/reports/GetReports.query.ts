import { requireActionSuccess } from '@/domain/data/actionResult';
import { GetReports } from '@/server-action/backend/reports/GetReports';
import { type QueryOptions } from '@tanstack/react-query';

export function GetReportsQueryOptions(...args: Parameters<typeof GetReports>) {
  return {
    queryKey: ['reports', ...args],
    queryFn: () => requireActionSuccess(GetReports(...args)),
  } satisfies QueryOptions;
}
