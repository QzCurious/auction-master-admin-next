'use client';

import { type Shipping } from '@/api/backend/shippings/GetShippings';
import { ProcessingShipping } from '@/api/backend/shippings/ProcessingShipping';
import { Shipped } from '@/api/backend/shippings/Shipped';
import { ACTION_TYPE, SHIPMENT_TYPE, SHIPPING_STATUS } from '@/domain/static/static-config-mappers';
import { currencySign, DATE_TIME_FORMAT } from '@/domain/static/static';
import CropFreeOutlinedIcon from '@mui/icons-material/CropFreeOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import {
  Button,
  Chip,
  FormControl,
  FormHelperText,
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
import { format } from 'date-fns';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { enqueueSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';

import { HavePermissionsOnly } from "@/domain/permission/HavePermissionsOnly";
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
              <TableCell>物品</TableCell>
              <TableCell>收貨人</TableCell>
              <TableCell>狀態</TableCell>
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
                              <Paper
                                sx={{ p: 1, position: 'relative', maxWidth: '300px', border: '1px solid #eee' }}
                                elevation={8}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{
                                    position: 'absolute',
                                    borderRadius: 1,
                                    top: 0,
                                    right: 0,
                                    p: 1,
                                    pb: 0,
                                    bgcolor: 'white',
                                  }}
                                >
                                  <Link href={item.photos?.[0]?.photo} target="_blank" rel="noreferrer">
                                    <CropFreeOutlinedIcon />
                                  </Link>
                                  <HavePermissionsOnly permissions={['GetItemAndDetails', 'AdminGetConsignor']}>
                                    <Link href={`/dashboard/items/edit/${item.id}`} target="_blank" rel="noreferrer">
                                      <OpenInNewOutlinedIcon />
                                    </Link>
                                  </HavePermissionsOnly>
                                </Stack>
                                <img
                                  src={item.photos?.[0]?.photo}
                                  style={{ display: 'block', maxWidth: '100%' }}
                                  alt=""
                                />
                                <Typography>{item.name}</Typography>
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

                <TableCell>
                  <Chip
                    label={SHIPPING_STATUS.get('value', row.status).message}
                    variant="outlined"
                    color={statusColor(row.status)}
                  />
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(row.createdAt, DATE_TIME_FORMAT)}</TableCell>
                <TableCell>
                  <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
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

                    {row.status === SHIPPING_STATUS.enum('ShippedStatus') && !!row.shipmentTrackingNumber && (
                      <div>
                        <Typography variant="body2" color="GrayText">
                          出貨單號
                        </Typography>
                        <Typography variant="body2">
                          {row.shipmentTrackingNumber}
                          <CopyButton text={row.shipmentTrackingNumber} />
                        </Typography>
                      </div>
                    )}
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
          <Button
            type="button"
            variant="contained"
            size="small"
            {...bindTrigger(popupState)}
            title={
              process.env.NODE_ENV === 'development'
                ? `${row.actionType} ${ACTION_TYPE.enum(row.actionType)}`
                : undefined
            }
          >
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
