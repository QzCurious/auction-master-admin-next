import { type Metadata } from 'next';
import Link from 'next/link';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { AdminGetWalletLogs, type WalletLogs } from '@/api/backend/wallets/AdminGetWalletLogs';
import { HandleApiError } from '@/domain/api/HandleApiError';
import { ConsignorFilter } from '@/domain/crud/ConsignorFilter';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import { RangeFilter } from '@/domain/crud/RangeFilter';
import RemoveSearchBtn from '@/domain/crud/RemoveSearchBtn';
import { SearchParamsPagination } from '@/domain/crud/SearchParamsPagination';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
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

import { ActionFilter } from './ActionFilter';
import { fixRange, MAX_MONTHS, SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `錢包紀錄 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <PermissionsGuard permissions={['AdminGetWalletLogs']}>
      <section>
        <Content {...pageProps} />
      </section>
    </PermissionsGuard>
  );
}

async function Content({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);
  const { startAt, endAt } = fixRange(filters.startAt, filters.endAt);

  const [walletLogsRes] = await Promise.all([
    AdminGetWalletLogs({
      consignorId: filters.consignorId,
      action: filters.action,
      endAt,
      startAt,
      sort: 'createdAt',
      order: 'desc',
      limit: filters[ROWS_PER_PAGE],
      offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    }),
  ]);

  if (walletLogsRes.error) {
    return <HandleApiError error={walletLogsRes.error} />;
  }

  return (
    <Provider>
      <Stack spacing={3}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <ConsignorFilter consignorId={filters.consignorId} />
          <RangeFilter startAt={filters.startAt} endAt={filters.endAt} within={{ months: MAX_MONTHS }} />
          <ActionFilter selected={filters.action} />
          <RemoveSearchBtn<keyof typeof filters> fields={['consignorId', 'startAt', 'endAt', 'action']} />
        </Stack>

        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow sx={{ whiteSpace: 'nowrap' }}>
                  <HavePermissionsOnly permissions={['AdminGetConsignor']}>
                    <TableCell>寄售人</TableCell>
                  </HavePermissionsOnly>
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
                    <HavePermissionsOnly permissions={['AdminGetConsignor']}>
                      <TableCell>
                        <ConsignorInfo consignorId={row.consignorId} />
                      </TableCell>
                    </HavePermissionsOnly>
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
          <SearchParamsPagination
            page={filters[PAGE]}
            rowsPerPage={filters[ROWS_PER_PAGE]}
            count={walletLogsRes.data.count}
          />
        </Card>
      </Stack>
    </Provider>
  );
}

async function ConsignorInfo({ consignorId }: { consignorId: WalletLogs['consignorId'] }) {
  const res = await AdminGetConsignor(consignorId);

  if (res.error) {
    return <HandleApiError error={res.error} />;
  }

  return (
    <>
      {res.data.nickname}
      <IconButton
        LinkComponent={Link}
        size="small"
        color="primary"
        href={`/dashboard/consignors?consignorId=${consignorId}`}
        target="_blank"
        rel="noreferrer"
      >
        <LaunchOutlinedIcon fontSize="small" />
      </IconButton>
    </>
  );
}
