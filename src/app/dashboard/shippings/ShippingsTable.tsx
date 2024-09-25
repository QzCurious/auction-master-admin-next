'use client';

import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { UpdateAuctionItem } from '@/api/backend/auction-items/UpdateAuctionItem';
import { type Shipping } from '@/api/backend/shippings/GetShippings';
import { ProcessingShipping } from '@/api/backend/shippings/ProcessingShipping';
import { Shipped } from '@/api/backend/shippings/Shipped';
import { ShippingClosed } from '@/api/backend/shippings/ShippingClosed';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { currencySign, DATE_TIME_FORMAT } from '@/domain/static/static';
import { ACTION_TYPE, SHIPMENT_TYPE, SHIPPING_STATUS } from '@/domain/static/static-config-mappers';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import {
  Button,
  Chip,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Popover,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin';
import { Phone } from '@phosphor-icons/react/dist/csr/Phone';
import { Tag } from '@phosphor-icons/react/dist/csr/Tag';
import { Gavel } from '@phosphor-icons/react/dist/ssr/Gavel';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import { format } from 'date-fns';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { enqueueSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';

import CopyButton from '@/components/CopyButton';
import DoubleCheckPopover from '@/components/DoubleCheckPopover';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import { statusColor } from './statusColor';

interface ShippingsTableProps {
  rows: Shipping[];
  count: number;
}

export function ShippingsTable({ rows, count }: ShippingsTableProps) {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ whiteSpace: 'nowrap' }}>
              <TableCell>寄件類別</TableCell>
              <TableCell>貨品</TableCell>
              <TableCell>收貨人</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>備註</TableCell>
              <TableCell>建立時間</TableCell>
              <TableCell>操作 / 出貨單號</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <EmptyTableRow />}
            {rows.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell>{SHIPMENT_TYPE.get('value', row.shipmentType).message}</TableCell>
                <TableCell>
                  <table>
                    <tbody>
                      {row.items.map((item) => (
                        <tr key={item.id}>
                          <td style={{ paddingRight: 2 }}>
                            <Stack direction="row" alignItems="center" sx={{ whiteSpace: 'nowrap' }}>
                              <LabelOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              {item.warehouseID || '無倉庫編號'}
                            </Stack>
                          </td>
                          <td style={{ padding: 0 }}>
                            <PopupState key={item.id} variant="popper">
                              {(popupState) => (
                                <>
                                  <IconButton {...bindTrigger(popupState)} size="small" color="primary" sx={{ p: 0.5 }}>
                                    <StackSimple />
                                  </IconButton>
                                  <Popover
                                    {...bindPopover(popupState)}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                  >
                                    <Paper
                                      sx={{ p: 1, position: 'relative', maxWidth: '300px', border: '1px solid #eee' }}
                                      elevation={8}
                                    >
                                      <HavePermissionsOnly permissions={['GetItemAndDetails']}>
                                        <Box
                                          sx={{
                                            position: 'absolute',
                                            borderRadius: 1,
                                            top: 0,
                                            right: 0,
                                            bgcolor: 'white',
                                          }}
                                        >
                                          <IconButton
                                            LinkComponent={Link}
                                            color="primary"
                                            href={`/dashboard/items/edit/${item.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            <LaunchOutlinedIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </HavePermissionsOnly>
                                      <a href={item.photos?.[0]?.photo} target="_blank" rel="noreferrer">
                                        <img
                                          src={item.photos?.[0]?.photo}
                                          style={{ display: 'block', maxWidth: '100%' }}
                                          alt=""
                                        />
                                      </a>
                                      <Typography variant="body2" mt={0.5}>
                                        {item.name}
                                      </Typography>
                                    </Paper>
                                  </Popover>
                                </>
                              )}
                            </PopupState>
                          </td>

                          {(function iife() {
                            const auctionItem = row.auctionItems.find((auctionItem) => auctionItem.itemID === item.id);
                            if (!auctionItem) return;
                            return (
                              <>
                                <PopupState key={auctionItem.id} variant="popper">
                                  {(popupState) => (
                                    <td style={{ padding: 0 }}>
                                      <span>
                                        <IconButton
                                          {...bindTrigger(popupState)}
                                          size="small"
                                          color="primary"
                                          sx={{ p: 0.5 }}
                                        >
                                          <Gavel />
                                        </IconButton>
                                      </span>

                                      <Popover
                                        {...bindPopover(popupState)}
                                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                      >
                                        <Paper
                                          sx={{
                                            p: 1,
                                            position: 'relative',
                                            maxWidth: '300px',
                                            border: '1px solid #eee',
                                          }}
                                          elevation={8}
                                        >
                                          <Box
                                            sx={{
                                              position: 'absolute',
                                              borderRadius: 1,
                                              top: 0,
                                              right: 0,
                                              py: 0.5,
                                              px: 1,
                                              bgcolor: 'white',
                                            }}
                                          >
                                            <HavePermissionsOnly permissions={['GetAuctionItem']}>
                                              <Box
                                                sx={{
                                                  position: 'absolute',
                                                  borderRadius: 1,
                                                  top: 0,
                                                  right: 0,
                                                  bgcolor: 'white',
                                                }}
                                              >
                                                <IconButton
                                                  LinkComponent={Link}
                                                  color="primary"
                                                  href={`/dashboard/auction-items/${auctionItem.id}`}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                >
                                                  <LaunchOutlinedIcon fontSize="small" />
                                                </IconButton>
                                              </Box>
                                            </HavePermissionsOnly>
                                          </Box>
                                          <a href={auctionItem.photo} target="_blank" rel="noreferrer">
                                            <img
                                              src={auctionItem.photo}
                                              style={{ display: 'block', maxWidth: '100%' }}
                                              alt=""
                                            />
                                          </a>
                                          <Typography variant="body2" mt={0.5}>
                                            {auctionItem.name}
                                          </Typography>
                                        </Paper>
                                      </Popover>
                                    </td>
                                  )}
                                </PopupState>
                                <td style={{ padding: 0 }}>
                                  {row.status === SHIPPING_STATUS.enum('ShippedStatus') &&
                                    !auctionItem.shippingCostsWithinJapan && (
                                      <HavePermissionsOnly permissions={['UpdateAuctionItem']}>
                                        <MarkShippingCostsWithinJapanPopover auctionItem={auctionItem} />
                                      </HavePermissionsOnly>
                                    )}
                                </td>
                              </>
                            );
                          })()}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableCell>

                <TableCell>
                  {row.recipientName}

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Phone weight="fill" color="#666" style={{ flexShrink: 0 }} />
                    {row.phone}
                  </Stack>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <MapPin weight="fill" color="#c00" style={{ flexShrink: 0 }} />
                    {row.address}
                  </Stack>
                </TableCell>

                <TableCell>
                  <Chip
                    label={SHIPPING_STATUS.get('value', row.status).message}
                    variant="outlined"
                    color={statusColor(row.status)}
                  />
                </TableCell>

                <TableCell>
                  <Box sx={{ whiteSpace: 'pre-wrap' }}>{row.remark}</Box>
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(row.createdAt, DATE_TIME_FORMAT)}</TableCell>
                <TableCell
                  title={
                    process.env.NODE_ENV === 'development'
                      ? `${row.actionType} ${ACTION_TYPE.enum(row.actionType)}`
                      : undefined
                  }
                >
                  {!!row.shipmentTrackingNumber && (
                    <Stack mb={1}>
                      <Typography variant="body2" color="GrayText">
                        出貨單號
                      </Typography>
                      <Typography variant="body2">
                        {row.shipmentTrackingNumber}
                        <CopyButton text={row.shipmentTrackingNumber} />
                      </Typography>
                    </Stack>
                  )}

                  {row.status === SHIPPING_STATUS.enum('SubmitAppraisalStatus') && (
                    <HavePermissionsOnly permissions={['ProcessingShipping']}>
                      <PopupState variant="popover">
                        {(popupState) => (
                          <>
                            <Button type="button" variant="outlined" size="small" {...bindTrigger(popupState)}>
                              開始理貨
                            </Button>
                            <DoubleCheckPopover
                              {...bindPopover(popupState)}
                              title="標示為理貨中"
                              onConfirm={async () => {
                                const res = await ProcessingShipping(row.id);
                                if (res.error) {
                                  enqueueSnackbar(res.error, { variant: 'error' });
                                  return;
                                }
                                enqueueSnackbar('已標示為理貨中', { variant: 'success' });
                                popupState.close();
                              }}
                              onCancel={popupState.close}
                            />
                          </>
                        )}
                      </PopupState>
                    </HavePermissionsOnly>
                  )}

                  {row.status === SHIPPING_STATUS.enum('ProcessingStatus') && (
                    <HavePermissionsOnly permissions={['Shipped']}>
                      <ShippedPopover row={row} />
                    </HavePermissionsOnly>
                  )}

                  {row.status === SHIPPING_STATUS.enum('ShippedStatus') &&
                    row.auctionItems.every((item) => item.shippingCostsWithinJapan) && (
                      <HavePermissionsOnly permissions={['ShippingClosed']}>
                        <PopupState variant="popover">
                          {(popupState) => (
                            <>
                              <Button type="button" variant="outlined" size="small" {...bindTrigger(popupState)}>
                                結束出貨
                              </Button>
                              <DoubleCheckPopover
                                {...bindPopover(popupState)}
                                title="標示為出貨已結束"
                                onConfirm={async () => {
                                  const res = await ShippingClosed(row.id);
                                  if (res.error) {
                                    enqueueSnackbar(res.error, { variant: 'error' });
                                    return;
                                  }
                                  enqueueSnackbar('已標示為出貨已結束', { variant: 'success' });
                                  popupState.close();
                                }}
                                onCancel={popupState.close}
                              />
                            </>
                          )}
                        </PopupState>
                      </HavePermissionsOnly>
                    )}
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

function MarkShippingCostsWithinJapanPopover({ auctionItem }: { auctionItem: AuctionItem }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      shippingCostsWithinJapan: '' as unknown as number,
    },
  });

  return (
    <PopupState variant="popover">
      {(popupState) => (
        <>
          <IconButton type="button" color="primary" size="small" {...bindTrigger(popupState)}>
            <Tag />
          </IconButton>
          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Box
              component="form"
              sx={{ p: '16px 20px' }}
              onSubmit={handleSubmit(async (data) => {
                const res = await UpdateAuctionItem(auctionItem.id, data);

                if (res.error) {
                  enqueueSnackbar(res.error, { variant: 'error' });
                  return;
                }
                enqueueSnackbar('已更新日本國內運費', { variant: 'success' });
                popupState.close();
              })}
            >
              <Typography variant="subtitle1">更新日本國內運費</Typography>
              <Stack spacing={1.5} mt={2}>
                <Controller
                  control={control}
                  name="shippingCostsWithinJapan"
                  rules={{ required: '必填' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <TextField
                        {...field}
                        size="small"
                        label="日本國內運費"
                        fullWidth
                        type="number"
                        onChange={(e) => {
                          field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                        }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">{currencySign('JPY')}</InputAdornment>,
                        }}
                        inputProps={{ min: 0 }}
                      />
                      {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Stack>

              <Stack direction="row" mt={1.5} gap={2} justifyContent="end">
                <Button type="button" variant="outlined" size="small" color="error" onClick={popupState.close}>
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="contained" size="small">
                  確定
                </Button>
              </Stack>
            </Box>
          </Popover>
        </>
      )}
    </PopupState>
  );
}

function ShippedPopover({ row }: { row: Shipping }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      shipmentTrackingNumber: '',
      internationalShippingCosts: '' as unknown as number,
    },
  });

  return (
    <PopupState variant="popover">
      {(popupState) => (
        <>
          <Button type="button" variant="contained" size="small" {...bindTrigger(popupState)}>
            已寄出
          </Button>
          <Popover
            {...bindPopover(popupState)}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <Box
              component="form"
              sx={{ p: '16px 20px' }}
              onSubmit={handleSubmit(async (data) => {
                const res = await Shipped(
                  row.id,
                  row.actionType === ACTION_TYPE.enum('YahooDispatchActionType')
                    ? {
                        internationalShippingCosts: data.internationalShippingCosts,
                        shipmentTrackingNumber: data.shipmentTrackingNumber,
                      }
                    : { shipmentTrackingNumber: data.shipmentTrackingNumber }
                );

                if (res.error) {
                  enqueueSnackbar(res.error, { variant: 'error' });
                  return;
                }
                enqueueSnackbar('已標示為已寄出', { variant: 'success' });
                popupState.close();
              })}
            >
              <Typography variant="subtitle1">標示為已寄出</Typography>
              <Stack spacing={1.5} mt={2}>
                {row.actionType === ACTION_TYPE.enum('YahooDispatchActionType') && (
                  <Controller
                    name="internationalShippingCosts"
                    control={control}
                    rules={{ required: '必填' }}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <TextField
                          {...field}
                          size="small"
                          label="國際運費"
                          fullWidth
                          type="number"
                          onChange={(e) => {
                            field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">{currencySign('TWD')}</InputAdornment>,
                          }}
                          inputProps={{ min: 0 }}
                        />
                        {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                )}

                <Controller
                  name="shipmentTrackingNumber"
                  control={control}
                  rules={{ required: '必填' }}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <TextField {...field} size="small" label="出貨單號碼" fullWidth type="text" />
                      {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Stack>

              <Stack direction="row" mt={1.5} gap={2} justifyContent="end">
                <Button type="button" variant="outlined" size="small" color="error" onClick={popupState.close}>
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="contained" size="small">
                  確定
                </Button>
              </Stack>
            </Box>
          </Popover>
        </>
      )}
    </PopupState>
  );
}
