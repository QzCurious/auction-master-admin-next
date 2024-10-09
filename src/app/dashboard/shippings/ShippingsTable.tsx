'use client';

import { type Shipping } from '@/api/backend/shippings/GetShippings';
import { ProcessingShipping } from '@/api/backend/shippings/ProcessingShipping';
import { Shipped } from '@/api/backend/shippings/Shipped';
import { ShippingClosed } from '@/api/backend/shippings/ShippingClosed';
import { type Configs } from '@/api/GetConfigs';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { currencySign, DATE_TIME_FORMAT, yahooAuctionLink } from '@/domain/static/static';
import { ACTION_TYPE, SHIPMENT_TYPE, SHIPPING_STATUS } from '@/domain/static/static-config-mappers';
import { zodResolver } from '@hookform/resolvers/zod';
import EditIcon from '@mui/icons-material/Edit';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import {
  Button,
  Divider,
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
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box } from '@mui/system';
import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin';
import { Phone } from '@phosphor-icons/react/dist/csr/Phone';
import { EnvelopeSimple, Package } from '@phosphor-icons/react/dist/ssr';
import { Gavel } from '@phosphor-icons/react/dist/ssr/Gavel';
import { Notepad } from '@phosphor-icons/react/dist/ssr/Notepad';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import { format } from 'date-fns';
import PopupState from 'material-ui-popup-state';
import { bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import { enqueueSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import * as R from 'remeda';
import { z } from 'zod';

import CopyButton from '@/components/CopyButton';
import DoubleCheckPopover from '@/components/DoubleCheckPopover';
import EmptyTableRow from '@/components/EmptyTableRow';
import { SearchParamsPagination } from '@/domain/crud/SearchParamsPagination';

import { type SearchParamsSchema } from './SearchParamsSchema';

interface ShippingsTableProps {
  configs: Configs;
  query: z.output<typeof SearchParamsSchema>;
  rows: Shipping[];
  count: number;
}

export function ShippingsTable({ configs, query, rows, count }: ShippingsTableProps) {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ whiteSpace: 'nowrap' }}>
              <TableCell>寄件類別</TableCell>
              <TableCell>貨品</TableCell>
              <TableCell>收貨人</TableCell>
              <TableCell>貨品總值</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>建立時間</TableCell>
              {(query.status.includes(SHIPPING_STATUS.enum('ShippedStatus')) ||
                query.status.includes(SHIPPING_STATUS.enum('ClosedStatus'))) && (
                <TableCell sx={{ width: 0 }}>出貨單</TableCell>
              )}
              <TableCell>操作</TableCell>
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
                      {row.items?.map((item) => (
                        <tr key={item.id}>
                          <td style={{ paddingRight: 2 }}>
                            <Stack title="倉庫編號" direction="row" alignItems="center" sx={{ whiteSpace: 'nowrap' }}>
                              <LabelOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                              {item.warehouseId || '無倉庫編號'}
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
                            const auctionItem = row.auctionItems?.find((auctionItem) => auctionItem.itemId === item.id);
                            if (!auctionItem) return;
                            return (
                              <>
                                <PopupState key={auctionItem.auctionId} variant="popper">
                                  {(popupState) => (
                                    <td style={{ padding: 0 }}>
                                      <IconButton {...bindTrigger(popupState)} size="small" color="primary">
                                        <Gavel />
                                      </IconButton>

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
                                                  href={`/dashboard/auction-items/edit/${auctionItem.auctionId}`}
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

                                <td>
                                  <Link
                                    color="primary"
                                    href={yahooAuctionLink(auctionItem.auctionId)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <span title="日拍物品代碼">{auctionItem.auctionId}</span>
                                  </Link>
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
                  <div>{row.recipientName}</div>
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
                  {(function iife() {
                    const sum = R.sum(row.auctionItems?.map((x) => x.closedPrice) ?? [0]);
                    return (
                      <>
                        {currencySign('JPY')}
                        {sum.toLocaleString()}
                        <Typography component="span" sx={{ verticalAlign: 'middle', ml: 0.5 }} color="GrayText">
                          {sum > configs.packageThreshold ? (
                            <Package fontSize={24} />
                          ) : (
                            <EnvelopeSimple fontSize={20} />
                          )}
                        </Typography>
                      </>
                    );
                  })()}
                </TableCell>

                <TableCell>
                  <Stack alignItems="center" spacing={1} sx={{ whiteSpace: 'nowrap', width: 'fit-content' }}>
                    <Typography variant="body2">{SHIPPING_STATUS.get('value', row.status).message}</Typography>

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

                    {row.status === SHIPPING_STATUS.enum('ShippedStatus') && (
                      <HavePermissionsOnly permissions={['ShippingClosed']}>
                        <ShippingClosedPopover row={row} />
                      </HavePermissionsOnly>
                    )}
                  </Stack>
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>{format(row.createdAt, DATE_TIME_FORMAT)}</TableCell>

                {(query.status.includes(SHIPPING_STATUS.enum('ShippedStatus')) ||
                  query.status.includes(SHIPPING_STATUS.enum('ClosedStatus'))) && (
                  <TableCell>
                    <table style={{ whiteSpace: 'nowrap', width: '100%' }}>
                      <tbody>
                        {row.shipmentTrackingNumber != null && (
                          <tr>
                            <td style={{ paddingRight: 8 }}>
                              <Typography variant="body2" color="GrayText">
                                出貨單號
                              </Typography>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Typography variant="body2">
                                {row.shipmentTrackingNumber}
                                <CopyButton text={row.shipmentTrackingNumber} />
                              </Typography>
                            </td>
                          </tr>
                        )}
                        {row.actionType === ACTION_TYPE.enum('YahooDispatchActionType') &&
                          row.internationalShippingCosts != null && (
                            <tr>
                              <td>
                                <Typography variant="body2" color="GrayText">
                                  國際運費
                                </Typography>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <Typography variant="body2">
                                  {currencySign('TWD')}
                                  {row.internationalShippingCosts}
                                </Typography>
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </TableCell>
                )}

                <TableCell>
                  <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                    <HavePermissionsOnly permissions={['GetShipping']}>
                      <IconButton LinkComponent={Link} href={`/dashboard/shippings/edit/${row.id}`}>
                        <EditIcon />
                      </IconButton>
                    </HavePermissionsOnly>

                    <RemarkPopover row={row} />
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

const ShippedFormSchema = z.object({
  internationalShippingCosts: z.coerce.number().min(0, '不可為負數').int('請輸入整數'),
  shipmentTrackingNumber: z.string().min(1, '必填'),
});
function ShippedPopover({ row }: { row: Shipping }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setError,
  } = useForm({
    defaultValues: {
      internationalShippingCosts: '' as unknown as number,
      shipmentTrackingNumber: '',
    },
    resolver: zodResolver(ShippedFormSchema),
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
              onSubmit={handleSubmit(
                async (data) => {
                  if (
                    row.actionType === ACTION_TYPE.enum('YahooDispatchActionType') &&
                    !data.internationalShippingCosts
                  ) {
                    setError('internationalShippingCosts', { message: '必填' });
                    return;
                  }

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
                },
                (err) => {
                  console.log(err);
                }
              )}
            >
              <Typography variant="subtitle1">標示為已寄出</Typography>
              <Stack spacing={1.5} mt={2}>
                {row.actionType === ACTION_TYPE.enum('YahooDispatchActionType') && (
                  <Controller
                    name="internationalShippingCosts"
                    control={control}
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
                        />
                        {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                      </FormControl>
                    )}
                  />
                )}

                <Controller
                  name="shipmentTrackingNumber"
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <TextField {...field} size="small" label="出貨單號" fullWidth type="text" />
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

function RemarkPopover({ row }: { row: Shipping }) {
  return (
    <PopupState variant="popover">
      {(popupState) => (
        <>
          <IconButton type="button" {...bindTrigger(popupState)}>
            <Notepad />
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
            <Box component="form" sx={{ p: '16px 20px' }}>
              <Typography variant="subtitle1" color="GrayText">
                備註
              </Typography>
              <FormControl>
                <TextField
                  value={row.remark}
                  InputProps={{ readOnly: true }}
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={6}
                />
              </FormControl>
            </Box>
          </Popover>
        </>
      )}
    </PopupState>
  );
}

const ShippingClosedFormSchema = z.object({
  shippingCostsWithinJapan: z.coerce.number().min(0, '不可為負數').int('請輸入整數').min(1, '必填'),
});
function ShippingClosedPopover({ row }: { row: Shipping }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      shippingCostsWithinJapan: '' as unknown as number,
    },
    resolver: zodResolver(ShippingClosedFormSchema),
  });

  return (
    <PopupState variant="popover">
      {(popupState) => (
        <>
          <Button type="button" variant="outlined" size="small" {...bindTrigger(popupState)}>
            結束出貨
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
                const res = await ShippingClosed(row.id, data);
                if (res.error) {
                  enqueueSnackbar(res.error, { variant: 'error' });
                  return;
                }
                enqueueSnackbar('已標示為出貨已結束', { variant: 'success' });
                popupState.close();
              })}
            >
              <Typography variant="subtitle1">標示為出貨已結束</Typography>
              <Stack spacing={1.5} mt={2}>
                <Controller
                  name="shippingCostsWithinJapan"
                  control={control}
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
