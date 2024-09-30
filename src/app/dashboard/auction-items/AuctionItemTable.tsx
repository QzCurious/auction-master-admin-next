'use client';

import { useSearchParams } from 'next/navigation';
import { DeleteAuctionItem } from '@/api/backend/auction-items/DeleteAuctionItem';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { type Worker } from '@/api/backend/workers/GetActivationWorkers';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { currencySign } from '@/domain/static/static';
import { AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import { Checkbox, Link } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Gavel } from '@phosphor-icons/react/dist/ssr/Gavel';
import { useAtom } from 'jotai';
import PopupState from 'material-ui-popup-state';
import { bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import { enqueueSnackbar } from 'notistack';
import * as R from 'remeda';

import { CountdownTime } from '@/components/CountdownTime';
import DoubleCheckPopover from '@/components/DoubleCheckPopover';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import BidPopover from './BidPopover';
import CompanyPurchasedButton from './CompanyPurchasedButton';
import { pickedItemIdsReducerAtom } from './PickingList';
import StopWatchButton from './StopWatchButton';

interface AuctionItemTableProps {
  rows: AuctionItem[];
  count: number;

  activationWorkers?: Worker[];
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
                </>
              )}

              <TableCell>當前金額</TableCell>
              <TableCell>期望金額</TableCell>

              {!isPicking && (
                <>
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
                <TableCell
                  sx={{ maxWidth: '200px' }}
                  title={process.env.NODE_ENV === 'development' ? row.id.toString() : undefined}
                >
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
                  <Stack>
                    <HavePermissionsOnly permissions={['GetItemAndDetails']}>
                      <Link href={`/dashboard/items/edit/${row.itemID}`} target="_blank" rel="noreferrer">
                        <Gavel /> 物品
                      </Link>
                    </HavePermissionsOnly>
                  </Stack>
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
                          color: row.bidders?.some((bidder) => bidder.account === row.watcherName)
                            ? 'primary.main'
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
                        {row.bidders?.slice(0, 5)?.map((bidder) => (
                          <Stack
                            key={`${bidder.account}-${bidder.lastBidAt}`}
                            direction="row"
                            spacing={1}
                            sx={{
                              whiteSpace: 'nowrap',
                              color: bidder.account === row.watcherName ? 'primary.main' : undefined,
                            }}
                          >
                            <span>
                              {bidder.account} / 評價: {bidder.rating}
                            </span>
                            <span style={{ marginLeft: 'auto' }}>
                              {currencySign('JPY')}
                              {bidder.bidAmount.toLocaleString()}
                            </span>
                          </Stack>
                        ))}
                      </a>
                    </TableCell>
                  </>
                )}

                <TableCell sx={{ textAlign: 'right' }}>
                  <Box color={row.currentPrice >= row.reservePrice ? 'success.main' : 'error.main'}>
                    {row.currentPrice.toLocaleString()}
                  </Box>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{row.reservePrice.toLocaleString()}</TableCell>

                {!isPicking && (
                  <>
                    <TableCell sx={{ textAlign: 'right' }}>{row.highestPrice.toLocaleString()}</TableCell>
                    <TableCell
                      sx={{ whiteSpace: 'nowrap' }}
                      title={process.env.NODE_ENV === 'development' ? AUCTION_ITEM_STATUS.enum(row.status) : undefined}
                    >
                      {R.isIncludedIn(row.status, [
                        AUCTION_ITEM_STATUS.enum('InitStatus'),
                        AUCTION_ITEM_STATUS.enum('StopBiddingStatus'),
                        AUCTION_ITEM_STATUS.enum('HighestBiddedStatus'),
                        AUCTION_ITEM_STATUS.enum('NotHighestBiddedStatus'),
                      ]) ? (
                        <Stack alignItems="center" spacing={1}>
                          <CountdownTime until={new Date(row.closeAt)} />
                          <HavePermissionsOnly permissions={['ToggleActivateAuctionItem']}>
                            <StopWatchButton auctionItem={row} />
                          </HavePermissionsOnly>
                        </Stack>
                      ) : (
                        <Stack alignItems="center" spacing={1}>
                          <div>{AUCTION_ITEM_STATUS.get('value', row.status).message}</div>
                          {row.status === AUCTION_ITEM_STATUS.enum('ClosedStatus') &&
                            row.closedPrice < row.reservePrice && (
                              <HavePermissionsOnly permissions={['CompanyPurchased']}>
                                <CompanyPurchasedButton auctionItem={row} />
                              </HavePermissionsOnly>
                            )}
                        </Stack>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        {R.isIncludedIn(row.status, [
                          AUCTION_ITEM_STATUS.enum('InitStatus'),
                          AUCTION_ITEM_STATUS.enum('StopBiddingStatus'),
                          AUCTION_ITEM_STATUS.enum('HighestBiddedStatus'),
                          AUCTION_ITEM_STATUS.enum('NotHighestBiddedStatus'),
                        ]) && (
                          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0}>
                            <HavePermissionsOnly permissions={['BidAuctionItem']}>
                              <BidPopover auctionItem={row} />
                            </HavePermissionsOnly>
                          </Stack>
                        )}

                        <HavePermissionsOnly permissions={['GetAuctionItem']}>
                          <IconButton LinkComponent={Link} href={`/dashboard/auction-items/edit/${row.id}`}>
                            <EditIcon />
                          </IconButton>
                        </HavePermissionsOnly>

                        <HavePermissionsOnly permissions={['DeleteAuctionItem']}>
                          <PopupState variant="popover">
                            {(popupState) => (
                              <>
                                <IconButton {...bindTrigger(popupState)}>
                                  <DeleteIcon />
                                </IconButton>
                                <DoubleCheckPopover
                                  {...bindPopover(popupState)}
                                  title="刪除日拍競標商品"
                                  onConfirm={async () => {
                                    const res = await DeleteAuctionItem(row.id);
                                    if (res.error) {
                                      enqueueSnackbar(`操作失敗: ${res.error}`, { variant: 'error' });
                                      return;
                                    }
                                    enqueueSnackbar(`已刪除日拍競標商品`, { variant: 'success' });
                                    popupState.close();
                                  }}
                                  onCancel={popupState.close}
                                />
                              </>
                            )}
                          </PopupState>
                        </HavePermissionsOnly>
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
