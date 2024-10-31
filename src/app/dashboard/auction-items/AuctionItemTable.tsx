'use client';

import { useSearchParams } from 'next/navigation';
import { CancelAuctionItem } from '@/api/backend/auction-items/CancelAuctionItem';
import { DeleteAuctionItem } from '@/api/backend/auction-items/DeleteAuctionItem';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { SearchParamsPagination } from '@/domain/crud/SearchParamsPagination';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { letaoItemLink, yahooAuctionLink } from '@/domain/static/static';
import { AUCTION_ITEM_STATUS } from '@/domain/static/static-config-mappers';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import { Button, Checkbox, Link } from '@mui/material';
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
import { StackSimple } from '@phosphor-icons/react/dist/ssr';
import { useAtom } from 'jotai';
import PopupState from 'material-ui-popup-state';
import { bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import { enqueueSnackbar } from 'notistack';

import DoubleCheckPopover from '@/components/DoubleCheckPopover';
import EmptyTableRow from '@/components/EmptyTableRow';

import CompanyPurchasedButton from './CompanyPurchasedButton';
import { pickedItemIdsReducerAtom } from './PickingList';

interface AuctionItemTableProps {
  rows: AuctionItem[];
  count: number;
}

export function AuctionItemTable({ rows, count }: AuctionItemTableProps) {
  const searchParams = useSearchParams();
  const isPicking = searchParams.get('stage') === 'picking';
  const [pickedItemIds, dispatch] = useAtom(pickedItemIdsReducerAtom);
  const handleApiError = useHandleApiError();

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ whiteSpace: 'nowrap' }}>
              {isPicking && <TableCell sx={{ width: 0 }}>出貨</TableCell>}
              <TableCell sx={{ width: 0 }}>商品圖片</TableCell>
              <TableCell sx={{ minWidth: '200px' }}>商品名稱</TableCell>

              <TableCell>期望金額</TableCell>

              {!isPicking && (
                <>
                  <TableCell>狀態</TableCell>
                  <TableCell>操作</TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <EmptyTableRow />}
            {rows.map((row) => (
              <TableRow hover key={row.auctionId}>
                {isPicking && (
                  <TableCell>
                    <Checkbox
                      checked={pickedItemIds.includes(row.auctionId)}
                      onChange={() =>
                        dispatch({
                          type: 'toggle',
                          id: row.auctionId,
                        })
                      }
                    />
                  </TableCell>
                )}
                <TableCell
                  sx={{ maxWidth: '200px' }}
                  title={process.env.NODE_ENV === 'development' ? row.auctionId.toString() : undefined}
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
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ whiteSpace: 'nowrap' }}>
                    <HavePermissionsOnly permissions={['GetItemAndDetails']}>
                      <IconButton
                        size="small"
                        color="primary"
                        href={`/dashboard/items/edit/${row.itemId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <StackSimple />
                      </IconButton>
                    </HavePermissionsOnly>
                    <Link color="primary" href={yahooAuctionLink(row.auctionId)} target="_blank" rel="noreferrer">
                      <span title="日拍物品代碼">{row.auctionId}</span>
                    </Link>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Link href={letaoItemLink(row.auctionId)} target="_blank" rel="noreferrer" sx={{ color: 'inherit' }}>
                    {row.name}
                  </Link>
                </TableCell>

                <TableCell sx={{ textAlign: 'right' }}>{row.reservePrice.toLocaleString()}</TableCell>

                {!isPicking && (
                  <>
                    <TableCell
                      sx={{ whiteSpace: 'nowrap' }}
                      title={process.env.NODE_ENV === 'development' ? AUCTION_ITEM_STATUS.enum(row.status) : undefined}
                    >
                      <Stack alignItems="center" spacing={1}>
                        <div>{AUCTION_ITEM_STATUS.get('value', row.status).message}</div>
                        {row.status === AUCTION_ITEM_STATUS.enum('ClosedStatus') && (
                          <HavePermissionsOnly permissions={['CancelAuctionItem']}>
                            <PopupState variant="popover">
                              {(popupState) => (
                                <>
                                  <Button size="small" variant="outlined" color="primary" {...bindTrigger(popupState)}>
                                    取消競標
                                  </Button>
                                  <DoubleCheckPopover
                                    {...bindPopover(popupState)}
                                    title="取消日拍競標商品"
                                    onConfirm={async () => {
                                      const res = await CancelAuctionItem(row.auctionId);
                                      if (res.error) {
                                        handleApiError(res.error);
                                        return;
                                      }
                                      enqueueSnackbar(`已取消日拍競標商品`, { variant: 'success' });
                                      popupState.close();
                                    }}
                                    onCancel={popupState.close}
                                  />
                                </>
                              )}
                            </PopupState>
                          </HavePermissionsOnly>
                        )}
                        {row.status === AUCTION_ITEM_STATUS.enum('ClosedStatus') &&
                          row.closedPrice < row.reservePrice && (
                            <HavePermissionsOnly permissions={['CompanyPurchased']}>
                              <CompanyPurchasedButton auctionItem={row} />
                            </HavePermissionsOnly>
                          )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <HavePermissionsOnly permissions={['GetAuctionItem']}>
                          <IconButton LinkComponent={Link} href={`/dashboard/auction-items/edit/${row.auctionId}`}>
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
                                    const res = await DeleteAuctionItem(row.auctionId);
                                    if (res.error) {
                                      handleApiError(res.error);
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
