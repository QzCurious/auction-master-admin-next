'use client';

import { useSearchParams } from 'next/navigation';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { AUCTION_ITEM_STATUS } from '@/api/backend/static-configs.data';
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
import { useAtom } from 'jotai';
import * as R from 'remeda';

import { HavePermissionsOnly } from '@/contexts/UserContext';
import { CountdownTime } from '@/components/CountdownTime';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import BidPopover from './BidPopover';
import EditDialog from './EditDialog';
import { pickedItemIdsReducerAtom } from './PickingList';
import StopWatchButton from './StopWatchButton';

interface AuctionItemTableProps {
  rows: AuctionItem[];
  count: number;

  activationWorkers: Worker[];
}

export function AuctionItemTable({ rows, count, activationWorkers }: AuctionItemTableProps) {
  const searchParams = useSearchParams();
  const isPicking = searchParams.get('stage') === 'picking';
  const [pickedItemIds, dispatch] = useAtom(pickedItemIdsReducerAtom);

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ whiteSpace: 'nowrap' }}>
              {isPicking && <TableCell sx={{ width: 0 }}>出貨</TableCell>}
              <TableCell sx={{ width: 0 }}>商品圖片</TableCell>
              <TableCell sx={{ minWidth: '200px' }}>商品名稱</TableCell>
              {!isPicking && (
                <>
                  <TableCell>出品帳號</TableCell>
                  <TableCell>盯標帳號</TableCell>
                  <TableCell>出價資訊</TableCell>
                  <TableCell>當前金額</TableCell>
                  <TableCell>期望金額</TableCell>
                  <TableCell>系統出價</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell>操作</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <EmptyTableRow />}
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                {isPicking && (
                  <TableCell>
                    <Checkbox
                      checked={pickedItemIds.includes(row.id)}
                      onChange={() =>
                        dispatch({
                          type: 'toggle',
                          id: row.id,
                        })
                      }
                    />
                  </TableCell>
                )}
                <TableCell sx={{ maxWidth: '200px' }}>
                  {row.photo ? (
                    <Box
                      component="img"
                      src={row.photo}
                      sx={{
                        aspectRatio: '16/10',
                        width: 128,
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
                        width: 128,
                      }}
                    />
                  )}
                </TableCell>
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
                {!isPicking && (
                  <>
                    <TableCell>{row.sellerName}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          fontWeight: row.bidders.some((bidder) => bidder.account === row.watcherName)
                            ? 'bold'
                            : undefined,
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
                      <Stack alignItems="center" spacing={1}>
                        {R.isIncludedIn(row.status, [
                          AUCTION_ITEM_STATUS.enum('InitStatus'),
                          AUCTION_ITEM_STATUS.enum('StopBiddingStatus'),
                          AUCTION_ITEM_STATUS.enum('HighestBiddedStatus'),
                          AUCTION_ITEM_STATUS.enum('NotHighestBiddedStatus'),
                        ]) && (
                          <>
                            <CountdownTime until={new Date(row.closeAt)} />
                            <HavePermissionsOnly permissionKeys={['ToggleActivateAuctionItem']}>
                              <StopWatchButton auctionItem={row} />
                            </HavePermissionsOnly>
                          </>
                        )}
                        {!R.isIncludedIn(row.status, [
                          AUCTION_ITEM_STATUS.enum('InitStatus'),
                          AUCTION_ITEM_STATUS.enum('StopBiddingStatus'),
                          AUCTION_ITEM_STATUS.enum('HighestBiddedStatus'),
                          AUCTION_ITEM_STATUS.enum('NotHighestBiddedStatus'),
                        ]) && <div>{AUCTION_ITEM_STATUS.get('value', row.status).message}</div>}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0}>
                        {R.isIncludedIn(row.status, [
                          AUCTION_ITEM_STATUS.enum('InitStatus'),
                          AUCTION_ITEM_STATUS.enum('StopBiddingStatus'),
                          AUCTION_ITEM_STATUS.enum('HighestBiddedStatus'),
                          AUCTION_ITEM_STATUS.enum('NotHighestBiddedStatus'),
                        ]) && (
                          <>
                            <HavePermissionsOnly permissionKeys={['UpdateAuctionItem']}>
                              <EditDialog auctionItem={row} activationWorkers={activationWorkers} />
                            </HavePermissionsOnly>
                            <HavePermissionsOnly permissionKeys={['BidAuctionItem']}>
                              <BidPopover auctionItem={row} />
                            </HavePermissionsOnly>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </>
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
