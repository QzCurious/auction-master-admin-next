'use client';

import { useEffect, useReducer } from 'react';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { Worker } from '@/api/backend/workers/GetActivationWorkers';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { differenceInDays, differenceInHours, intervalToDuration } from 'date-fns';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import EditDialog from './EditDialog';

interface AuctionItemTableProps {
  rows: AuctionItem[];
  count: number;

  activationWorkers: Worker[];
}

export function AuctionItemTable({ rows, count, activationWorkers }: AuctionItemTableProps) {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ whiteSpace: 'nowrap' }}>
              <TableCell>商品名稱</TableCell>
              <TableCell>商品圖片</TableCell>
              <TableCell>出品帳號</TableCell>
              <TableCell>盯標帳號</TableCell>
              <TableCell>出價資訊</TableCell>
              <TableCell>現在金額</TableCell>
              <TableCell>期望金額</TableCell>
              <TableCell>系統出價</TableCell>
              <TableCell>結標倒數</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <EmptyTableRow />}
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell sx={{ maxWidth: '200px' }}>
                  {row.photo ? (
                    <Box
                      component="img"
                      src={row.photo}
                      sx={{
                        aspectRatio: '16/10',
                        width: '100%',
                        backgroundColor: grey['100'],
                        objectFit: 'contain',
                        objectPosition: 'center',
                      }}
                      alt=""
                    />
                  ) : (
                    <PhotoSizeSelectActualOutlinedIcon
                      sx={{
                        display: 'block',
                        height: 'auto',
                        fill: grey['300'],
                        aspectRatio: '16/10',
                        width: '100%',
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>{row.sellerName}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      fontWeight: row.bidders.some((bidder) => bidder.account === row.watcherName) ? 'bold' : undefined,
                    }}
                  >
                    {row.watcherName}
                  </Box>
                </TableCell>
                <TableCell>
                  <a
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    href={`https://www.letao.com.tw/yahoojp/auctions/bid_history.php?aID=${row.auctionID}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {row.bidders.map((bidder) => (
                      <Stack
                        key={`${bidder.account}-${bidder.lastBidAt}`}
                        direction="row"
                        spacing={1}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        <span>
                          <Box
                            component="span"
                            sx={{ fontWeight: bidder.account === row.watcherName ? 'bold' : undefined }}
                          >
                            {bidder.account}
                          </Box>{' '}
                          / 評價: {bidder.rating}{' '}
                        </span>
                        <span style={{ marginLeft: 'auto' }}>¥ {bidder.bidAmount.toLocaleString()}</span>
                      </Stack>
                    ))}
                  </a>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <Box color={row.currentPrice >= row.reservePrice ? 'success.main' : 'error.main'}>
                    {row.currentPrice.toLocaleString()}
                  </Box>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{row.reservePrice.toLocaleString()}</TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{row.highestPrice.toLocaleString()}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <CountdownTime until={new Date(row.closeAt)} />
                </TableCell>
                <TableCell>
                  <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
                    <HavePermissionsOnly permissionKeys={['UpdateAuctionItem']}>
                      <EditDialog auctionItem={row} activationWorkers={activationWorkers} />
                    </HavePermissionsOnly>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <SearchParamsPagination count={count} />
    </Card>
  );
}

function CountdownTime({ until }: { until: Date }) {
  const now = new Date();
  const shouldCountdown = until > now;
  const forceRender = useReducer(() => ({}), {})[1];

  useEffect(() => {
    if (!shouldCountdown) return;
    const interval = setInterval(() => {
      forceRender();
    }, 1000);
    return () => clearInterval(interval);
  }, [forceRender, shouldCountdown]);

  if (!shouldCountdown) {
    return '已結束';
  }

  const remain = intervalToDuration({ start: now, end: until });

  if (differenceInDays(until, now) > 0) {
    return `${remain.days} 天 ${remain.hours ?? 0} 時`;
  }

  if (differenceInHours(until, now) > 0) {
    return `${remain.hours} 時 ${remain.minutes ?? 0} 分`;
  }

  return `${remain.minutes} 分 ${remain.seconds ?? 0} 秒`;
}
