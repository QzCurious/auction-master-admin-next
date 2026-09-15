import { requireActionSuccess } from '@/domain/data/actionResult';
import { GetRecords } from '@/server-action/backend/reports/GetRecords';
import { type QueryOptions } from '@tanstack/react-query';

export function GetRecordsQueryOptions(...args: Parameters<typeof GetRecords>) {
  return {
    queryKey: ['/reports/records', ...args],
    queryFn: () => requireActionSuccess(GetRecords(...args)),
  } satisfies QueryOptions;
}
