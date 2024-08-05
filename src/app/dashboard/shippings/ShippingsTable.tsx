'use client';

import { useEffect, useReducer } from 'react';
import { useSearchParams } from 'next/navigation';
import { SHIPPING_STATUS_DATA, SHIPPING_TYPE_DATA } from '@/api/backend/configs.data';
import { type Shipping } from '@/api/backend/shippings/GetShippings';
import { DATE_TIME_FORMAT } from '@/static';
import { Checkbox, Link, Paper, Popover, Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowSquareOut, MapPin, Phone, Tag } from '@phosphor-icons/react';
import { differenceInDays, differenceInHours, format, intervalToDuration } from 'date-fns';
import { useAtom } from 'jotai';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';

import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import { pickedItemIdsAtom } from './PickForShipping';

interface ShippingsTableProps {
  rows: Shipping[];
  count: number;
}

export function ShippingsTable({ rows, count }: ShippingsTableProps) {
  const [pickedItems, setPickedItems] = useAtom(pickedItemIdsAtom);
  const isPickingItems = useSearchParams().get('pick-for-shipping') === 'picking';

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ whiteSpace: 'nowrap' }}>
              {isPickingItems && <TableCell sx={{ width: 0 }}>出貨</TableCell>}
              {!isPickingItems && (
                <>
                  <TableCell>寄件類別</TableCell>
                  <TableCell>物品</TableCell>
                  <TableCell>收貨人</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell>建立時間</TableCell>
                  <TableCell>操作</TableCell>
                </>
              )}
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

                <TableCell>{SHIPPING_TYPE_DATA.find((data) => data.value === row.type)?.message}</TableCell>
                {!isPickingItems && (
                  <>
                    <TableCell>
                      <Stack>
                        {row.items.map((item) => (
                          <PopupState key={item.id} variant="popper">
                            {(popupState) => (
                              <>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Tag weight="fill" color="#666" />
                                  <Link
                                    {...bindTrigger(popupState)}
                                    sx={{
                                      cursor: 'pointer',
                                      textDecoration: popupState.isOpen ? 'underline' : undefined,
                                    }}
                                  >
                                    {item.warehouseID || '無倉庫編號'}
                                  </Link>
                                </Stack>

                                <Popover
                                  {...bindPopover(popupState)}
                                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                >
                                  <Paper sx={{ p: 1, position: 'relative', maxWidth: '300px' }} elevation={8}>
                                    <Link
                                      sx={{
                                        position: 'absolute',
                                        borderRadius: 1,
                                        top: 0,
                                        right: 0,
                                        p: 1,
                                        pb: 0,
                                        display: 'block',
                                        bgcolor: 'white',
                                      }}
                                      href={item.photos[0].photo}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <ArrowSquareOut size={20} />
                                    </Link>
                                    <img
                                      src={item.photos[0].photo}
                                      style={{ display: 'block', maxWidth: '100%' }}
                                      alt=""
                                    />
                                  </Paper>
                                </Popover>
                              </>
                            )}
                          </PopupState>
                        ))}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {row.recipientName}

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Phone weight="fill" color="#666" />
                        {row.phone}
                      </Stack>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MapPin weight="fill" color="#c00" />
                        {row.address}
                      </Stack>
                    </TableCell>

                    <TableCell>{SHIPPING_STATUS_DATA.find((data) => data.value === row.status)?.message}</TableCell>

                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(row.createdAt, DATE_TIME_FORMAT)}</TableCell>
                    <TableCell>
                      {/* <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0}>
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
                      </Stack> */}
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
