import { type Metadata } from 'next';
import { GetRecords } from '@/api/backend/reports/GetRecords';
import { RECORD_STATUS, RECORD_TYPE } from '@/api/backend/static-configs.data';
import { DATE_TIME_FORMAT, PAGE, parseSearchParams, ROWS_PER_PAGE } from '@/static';
import { Card, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format, startOfDay, subDays, subHours } from 'date-fns';
import { Provider } from 'jotai';
import * as R from 'remeda';

import { config } from '@/config';
import EmptyTableRow from '@/components/EmptyTableRow';
import RedirectAuthError from '@/components/RedirectAuthError';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import Filters from './Filters';
import { isValidInterval, SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `交易紀錄 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            交易紀錄
          </Typography>
        </Stack>
      </Stack>

      <section>
        <Content {...pageProps} />
      </section>
    </Stack>
  );
}

async function Content({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);

  filters.endAt ??= subHours(new Date(), 1);
  filters.startAt ??= startOfDay(subDays(filters.endAt, 7));
  if (!isValidInterval(filters.startAt, filters.endAt)) {
    filters.endAt = subHours(new Date(), 1);
    filters.startAt = startOfDay(subDays(filters.endAt, 7));
  }

  const [recordsRes] = await Promise.all([
    GetRecords({ ...filters, limit: filters[ROWS_PER_PAGE], offset: filters[PAGE] * filters[ROWS_PER_PAGE] }),
  ]);

  if (recordsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetRecords']} />;
  }

  if (recordsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Provider>
      <Stack spacing={3}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <Filters {...filters} />
        </Stack>

        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow sx={{ whiteSpace: 'nowrap' }}>
                  <TableCell>寄售人</TableCell>
                  <TableCell>類型</TableCell>
                  <TableCell>細節</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recordsRes.data.records.length === 0 && <EmptyTableRow />}
                {recordsRes.data.records.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell title={row.consignorID.toString()}>{row.consignorNickname}</TableCell>
                    <TableCell>{RECORD_TYPE.get('value', row.type).message}</TableCell>
                    <TableCell>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {R.entries(row).map(([k, v]) => (
                              <TableRow key={k}>
                                <TableCell>{k}</TableCell>
                                <TableCell>
                                  {k === 'type' ? (
                                    <>
                                      ({v}) {RECORD_TYPE.enum(v)}
                                    </>
                                  ) : k === 'status' ? (
                                    <>
                                      ({v}) {RECORD_STATUS.enum(v)}
                                    </>
                                  ) : k === 'createdAt' || k === 'updatedAt' ? (
                                    format(new Date(v), DATE_TIME_FORMAT)
                                  ) : k === 'itemID' ? (
                                    <Link href={`/dashboard/items/edit/${v}`} target="_blank">
                                      {v}
                                    </Link>
                                  ) : (
                                    v
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow hidden />
              </TableBody>
            </Table>

            <SearchParamsPagination count={recordsRes.data.count} />
          </TableContainer>
        </Card>
      </Stack>
    </Provider>
  );
}
