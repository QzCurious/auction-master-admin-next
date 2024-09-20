import { type Metadata } from 'next';
import Link from 'next/link';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { AdminGetWalletLogs, type WalletLogs } from '@/api/backend/wallets/AdminGetWalletLogs';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { ConsignorFilter } from '@/domain/crud/ConsignorFilter';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import { RangeFilter } from '@/domain/crud/RangeFilter';
import RemoveSearchBtn from '@/domain/crud/RemoveSearchBtn';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { DATE_TIME_FORMAT, PAGE, ROWS_PER_PAGE, SITE_NAME } from '@/domain/static/static';
import { WALLET_ACTION } from '@/domain/static/static-config-mappers';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { TableContainer } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { format } from 'date-fns';
import { Provider } from 'jotai';

import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import { ActionFilter } from './ActionFilter';
import { fixRange, MAX_MONTHS, SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `錢包紀錄 | ${SITE_NAME}` } satisfies Metadata;

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
  const { startAt, endAt } = fixRange(filters.startAt, filters.endAt);

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
          <ConsignorFilter consignorID={filters.consignorID} />
          <RangeFilter startAt={filters.startAt} endAt={filters.endAt} within={{ months: MAX_MONTHS }} />
          <ActionFilter selected={filters.action} />
          <RemoveSearchBtn<keyof typeof filters> fields={['consignorID', 'startAt', 'endAt', 'action']} />
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
    <>
      {res.data.nickname}
      <IconButton
        LinkComponent={Link}
        size="small"
        color="primary"
        href={`/dashboard/consignors?consignorID=${consignorID}`}
        target="_blank"
        rel="noreferrer"
      >
        <LaunchOutlinedIcon fontSize="small" />
      </IconButton>
    </>
  );
}
