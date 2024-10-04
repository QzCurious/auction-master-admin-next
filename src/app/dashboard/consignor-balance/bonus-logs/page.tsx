import { type Metadata } from 'next';
import Link from 'next/link';
import { AdminGetBonusLogs, type BonusLogs } from '@/api/backend/bonuses/AdminGetBonusLogs';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { ConsignorFilter } from '@/domain/crud/ConsignorFilter';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import { RangeFilter } from '@/domain/crud/RangeFilter';
import RemoveSearchBtn from '@/domain/crud/RemoveSearchBtn';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { DATE_TIME_FORMAT, PAGE, ROWS_PER_PAGE, SITE_NAME } from '@/domain/static/static';
import { BONUS_ACTION } from '@/domain/static/static-config-mappers';
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

export const metadata = { title: `紅利紀錄 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <PermissionsGuard permissions={['AdminGetBonusLogs']}>
      <section>
        <Content {...pageProps} />
      </section>
    </PermissionsGuard>
  );
}

async function Content({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);
  const { startAt, endAt } = fixRange(filters.startAt, filters.endAt);
  const [bonusLogsRes] = await Promise.all([
    AdminGetBonusLogs({
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
                {bonusLogsRes.data.bonusLogs.length === 0 && <EmptyTableRow />}
                {bonusLogsRes.data.bonusLogs.map((row) => (
                  <TableRow hover key={row.id}>
                    <HavePermissionsOnly permissions={['AdminGetConsignor']}>
                      <TableCell>
                        <ConsignorInfo consignorId={row.consignorId} />
                      </TableCell>
                    </HavePermissionsOnly>
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

async function ConsignorInfo({ consignorId }: { consignorId: BonusLogs['consignorId'] }) {
  const res = await AdminGetConsignor(consignorId);

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
        href={`/dashboard/consignors?consignorId=${consignorId}`}
        target="_blank"
        rel="noreferrer"
      >
        <LaunchOutlinedIcon fontSize="small" />
      </IconButton>
    </>
  );
}
