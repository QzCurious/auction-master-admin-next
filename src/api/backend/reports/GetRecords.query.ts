import { type QueryOptions } from '@tanstack/react-query';

import { GetRecords } from './GetRecords';

export function GetRecordsQueryOptions(...args: Parameters<typeof GetRecords>) {
  return {
    queryKey: ['/reports/records', ...args],
    queryFn: () => GetRecords(...args),
  } satisfies QueryOptions;
}
