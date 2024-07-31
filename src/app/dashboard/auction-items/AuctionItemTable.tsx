'use client';

import { useEffect, useReducer } from 'react';
import { useSearchParams } from 'next/navigation';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { AUCTION_ITEM_STATUS_MAP } from '@/api/backend/configs.data';
import { type Worker } from '@/api/backend/workers/GetActivationWorkers';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import { Checkbox, Link } from '@mui/material';
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
import { useAtom } from 'jotai';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import BidPopover from './BidPopover';
import EditDialog from './EditDialog';
import { pickedItemIdsAtom } from './PickForShipping';

interface AuctionItemTableProps {
  rows: AuctionItem[];
  count: number;

  activationWorkers: Worker[];
}

export function AuctionItemTable({ rows, count, activationWorkers }: AuctionItemTableProps) {
  const [pickedItems, setPickedItems] = useAtom(pickedItemIdsAtom);
  const isPickingItems = useSearchParams().get('pick-for-shipping') === 'picking';

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ whiteSpace: 'nowrap' }}>
              {isPickingItems && <TableCell>出貨</TableCell>}
              <TableCell sx={{ minWidth: '200px' }}>商品名稱</TableCell>
              <TableCell>商品圖片</TableCell>
              <TableCell>出品帳號</TableCell>
              <TableCell>盯標帳號</TableCell>
              <TableCell>出價資訊</TableCell>
              <TableCell>現在金額</TableCell>
              <TableCell>期望金額</TableCell>
              <TableCell>系統出價</TableCell>
              <TableCell>結標倒數</TableCell>
              {!isPickingItems && <TableCell>操作</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <EmptyTableRow />}
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                {isPickingItems && (
                  <TableCell>
                    <Checkbox
                      checked={pickedItems.includes(row.id)}
                      onChange={() =>
                        setPickedItems((prev) =>
                          prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                        )
                      }
                    />
                  </TableCell>
                )}

                <TableCell>
                  <Link
                    href={`https://www.letao.com.tw/yahoojp/auctions/item.php?aID=${row.auctionID}`}
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: 'inherit' }}
                  >
                    {row.name}
                  </Link>
                </TableCell>
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
                {!isPickingItems && (
                  <TableCell>
                    <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0}>
                      <HavePermissionsOnly permissionKeys={['UpdateAuctionItem']}>
                        <EditDialog auctionItem={row} activationWorkers={activationWorkers} />
                      </HavePermissionsOnly>
                      {[
                        AUCTION_ITEM_STATUS_MAP.InitStatus,
                        AUCTION_ITEM_STATUS_MAP.HighestBiddedStatus,
                        AUCTION_ITEM_STATUS_MAP.NotHighestBiddedStatus,
                      ].includes(row.status) && (
                        <HavePermissionsOnly permissionKeys={['BidAuctionItem']}>
                          <BidPopover auctionItem={row} />
                        </HavePermissionsOnly>
                      )}
                    </Stack>
                  </TableCell>
                )}
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
