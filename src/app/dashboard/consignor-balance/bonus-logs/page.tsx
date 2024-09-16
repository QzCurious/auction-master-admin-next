import { type Metadata } from 'next';
import Link from 'next/link';
import { AdminGetBonusLogs, type BonusLogs } from '@/api/backend/bonuses/AdminGetBonusLogs';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { BONUS_ACTION } from '@/api/backend/static-configs.data';
import { parseSearchParams } from '@/helper/parseSearchParams';
import { DATE_TIME_FORMAT, PAGE, ROWS_PER_PAGE } from '@/static';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Card from '@mui/material/Card';
import { Box, Stack } from '@mui/system';
import { format } from 'date-fns';
import { Provider } from 'jotai';

import { config } from '@/config';
import EmptyTableRow from '@/components/EmptyTableRow';
import RedirectAuthError from '@/components/RedirectAuthError';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import Filters from './Filters';
import { fixRange, SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `紅利紀錄 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <section>
      <Content {...pageProps} />
    </section>
  );
}

async function Content({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);
  const { wasValid, startAt, endAt } = fixRange(filters.startAt, filters.endAt);
  const [bonusLogsRes] = await Promise.all([
    AdminGetBonusLogs({
      consignorID: filters.consignorID,
      action: filters.action,
      endAt,
      startAt,
      sort: 'createdAt',
      order: 'desc',
      limit: filters[ROWS_PER_PAGE],
      offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    }),
  ]);

  if (bonusLogsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetBonusLogs']} />;
  }

  if (bonusLogsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Provider>
      <Stack spacing={3}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <Filters {...filters} startAt={wasValid ? startAt : undefined} endAt={wasValid ? endAt : undefined} />
        </Stack>

        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow sx={{ whiteSpace: 'nowrap' }}>
                  <TableCell>寄售人</TableCell>
                  <TableCell>操作</TableCell>
                  <TableCell>異動額</TableCell>
                  <TableCell>餘額</TableCell>
                  <TableCell>時間</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bonusLogsRes.data.bonusLogs.length === 0 && <EmptyTableRow />}
                {bonusLogsRes.data.bonusLogs.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <ConsignorInfo consignorID={row.consignorID} />
                    </TableCell>
                    <TableCell
                      title={
                        process.env.NODE_ENV === 'development'
                          ? `${row.action} ${BONUS_ACTION.enum(row.action)}`
                          : undefined
                      }
                    >
                      <Stack>
                        <span>{BONUS_ACTION.get('value', row.action).message}</span>
                        <span>{row.opCode}</span>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Box color={row.netDifference >= 0 ? 'success.main' : 'error.main'}>
                        {row.netDifference.toLocaleString()}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      {(row.previousBalance + row.netDifference).toLocaleString()}
                    </TableCell>
                    <TableCell>{format(row.createdAt, DATE_TIME_FORMAT)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Divider />
          <SearchParamsPagination count={bonusLogsRes.data.count} />
        </Card>
      </Stack>
    </Provider>
  );
}

async function ConsignorInfo({ consignorID }: { consignorID: BonusLogs['consignorID'] }) {
  const res = await AdminGetConsignor(consignorID);

  if (res.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetConsignor']} />;
  }
  if (res.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Stack whiteSpace="nowrap" direction="row" spacing={0.5}>
      {res.data.nickname}
      <Link href={`/dashboard/consignors?consignorID=${consignorID}`} target="_blank" rel="noreferrer">
        <OpenInNewOutlinedIcon fontSize="small" />
      </Link>
    </Stack>
  );
}
