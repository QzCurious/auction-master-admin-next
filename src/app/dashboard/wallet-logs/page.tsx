import { type Metadata } from 'next';
import Link from 'next/link';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { WALLET_ACTION } from '@/api/backend/static-configs.data';
import { AdminGetWalletLogs, type WalletLogs } from '@/api/backend/wallets/AdminGetWalletLogs';
import { parseSearchParams } from '@/helper/parseSearchParams';
import { DATE_TIME_FORMAT, PAGE, ROWS_PER_PAGE } from '@/static';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { format } from 'date-fns';
import { Provider } from 'jotai';

import { config } from '@/config';
import { HavePermissionsOnly } from '@/contexts/UserContext';
import EmptyTableRow from '@/components/EmptyTableRow';
import RedirectAuthError from '@/components/RedirectAuthError';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import Filters from './Filters';
import { fixRange, SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `錢包紀錄 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            錢包紀錄
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
  const { wasValid, startAt, endAt } = fixRange(filters.startAt, filters.endAt);

  const [walletLogsRes] = await Promise.all([
    AdminGetWalletLogs({
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

  if (walletLogsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetWalletLogs']} />;
  }

  if (walletLogsRes.error === '1003') {
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
                {walletLogsRes.data.walletLogs.length === 0 && <EmptyTableRow />}
                {walletLogsRes.data.walletLogs.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <ConsignorInfo consignorID={row.consignorID} />
                    </TableCell>
                    <TableCell
                      title={
                        process.env.NODE_ENV === 'development'
                          ? `${row.action} ${WALLET_ACTION.enum(row.action)}`
                          : undefined
                      }
                    >
                      <Stack>
                        <span>{WALLET_ACTION.get('value', row.action).message}</span>
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
          <SearchParamsPagination count={walletLogsRes.data.count} />
        </Card>
      </Stack>
    </Provider>
  );
}

async function ConsignorInfo({ consignorID }: { consignorID: WalletLogs['consignorID'] }) {
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
      <Link href={`/dashboard/consignors/edit/${consignorID}`} target="_blank" rel="noreferrer">
        <OpenInNewOutlinedIcon fontSize="small" />
      </Link>
    </Stack>
  );
}
