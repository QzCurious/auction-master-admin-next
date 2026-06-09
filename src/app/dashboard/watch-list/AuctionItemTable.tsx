'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { UpdateAuctionItem } from '@/api/backend/auction-items/UpdateAuctionItem';
import { GetWorkersQueryOptions } from '@/api/backend/workers/GetWorkers.query';
import { useHandleApiError } from '@/domain/api/HandleApiError';
import { getDirtyFields } from '@/domain/crud/getDirtyFields';
import { SearchParamsPagination } from '@/domain/crud/SearchParamsPagination';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import { useHavePermissions } from '@/domain/permission/useHavePermissions';
import {
  currencySign,
  letaoBidHistoryLink,
  letaoItemLink,
  yahooAuctionLink,
  type PaginationSearchParams,
} from '@/domain/static/static';
import { AUCTION_ITEM_STATUS, WORKER_STATUS, WORKER_TYPE } from '@/domain/static/static-config-mappers';
import { zodResolver } from '@hookform/resolvers/zod';
import EditIcon from '@mui/icons-material/Edit';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { CountdownTime } from '@/components/CountdownTime';
import EmptyTableRow from '@/components/EmptyTableRow';

import BidPopover from './BidPopover';
import StopWatchButton from './StopWatchButton';

interface AuctionItemTableProps extends PaginationSearchParams {
  rows: AuctionItem[];
  count: number;
}

export function AuctionItemTable({ page, rowsPerPage, rows, count }: AuctionItemTableProps) {
  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }}>
          <TableHead>
            <TableRow sx={{ whiteSpace: 'nowrap' }}>
              <TableCell sx={{ width: 0, position: 'sticky', left: 0 }}>商品圖片</TableCell>
              <TableCell sx={{ minWidth: '200px' }}>商品名稱</TableCell>
              <TableCell>出品帳號</TableCell>
              <TableCell>盯標帳號</TableCell>
              <TableCell>出價資訊</TableCell>
              <TableCell>當前金額</TableCell>
              <TableCell>期望金額</TableCell>
              <TableCell>系統出價</TableCell>
              <TableCell>狀態</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && <EmptyTableRow />}
            {rows.map((row) => (
              <TableRow
                hover
                key={row.auctionId}
                sx={{
                  backgroundColor: row.watcherName === '' ? 'rgba(255, 0, 0, 0.1)' : undefined,
                }}
              >
                <TableCell
                  sx={{ maxWidth: '200px', position: 'sticky', left: 0 }}
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
                  <Link color="primary" href={yahooAuctionLink(row.auctionId)} target="_blank" rel="noreferrer">
                    <span title="日拍物品代碼">{row.auctionId}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={letaoItemLink(row.auctionId)} target="_blank" rel="noreferrer" sx={{ color: 'inherit' }}>
                    {row.name}
                  </Link>
                </TableCell>

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
                    href={letaoBidHistoryLink(row.auctionId)}
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

                <TableCell sx={{ textAlign: 'right' }}>
                  <Box color={row.currentPrice >= row.reservePrice ? 'success.main' : 'error.main'}>
                    {row.currentPrice.toLocaleString()}
                  </Box>
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>{row.reservePrice.toLocaleString()}</TableCell>

                <TableCell sx={{ textAlign: 'right' }}>{row.highestPrice.toLocaleString()}</TableCell>
                <TableCell
                  sx={{ whiteSpace: 'nowrap' }}
                  title={process.env.NODE_ENV === 'development' ? AUCTION_ITEM_STATUS.enum(row.status) : undefined}
                >
                  <Stack alignItems="center" spacing={1}>
                    <CountdownTime until={new Date(row.closeAt)} />
                    <HavePermissionsOnly permissions={['ToggleActivateAuctionItem']}>
                      <StopWatchButton auctionItem={row} />
                    </HavePermissionsOnly>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0}>
                    <HavePermissionsOnly permissions={['BidAuctionItem']}>
                      <BidPopover auctionItem={row} />
                    </HavePermissionsOnly>

                    <HavePermissionsOnly permissions={['GetAuctionItem']}>
                      <EditDialog row={row} />
                    </HavePermissionsOnly>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <SearchParamsPagination page={page} rowsPerPage={rowsPerPage} rowsPerPageOptions={[50, 100]} count={count} />
    </Card>
  );
}

const FormSchema = z.object({
  sellerId: z.number(),
  watcherId: z.number(),
  reservePrice: z.number().min(0, '不可為負數').int('請輸入整數'),
});

function EditDialog({ row }: { row: AuctionItem }) {
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const havePermissions = useHavePermissions();
  const sellersQuery = useQuery({
    ...GetWorkersQueryOptions({
      type: [WORKER_TYPE.enum('SellerType')],
      status: [WORKER_STATUS.enum('ActiveStatus')],
      limit: 100,
    }),
    enabled: open,
  });
  const watchersQuery = useQuery({
    ...GetWorkersQueryOptions({
      type: [WORKER_TYPE.enum('WatcherType')],
      status: [WORKER_STATUS.enum('ActiveStatus')],
      limit: 100,
    }),
    enabled: open,
  });
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { dirtyFields, isSubmitting },
  } = useForm<z.input<typeof FormSchema>>({
    values: {
      sellerId: row.sellerId,
      watcherId: row.watcherId,
      reservePrice: row.reservePrice,
    },
    resolver: zodResolver(FormSchema),
  });
  const handleApiError = useHandleApiError();

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <EditIcon />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)} closeAfterTransition>
        <form
          onSubmit={handleSubmit(
            async (data) => {
              const dirtyValues = getDirtyFields(data, dirtyFields);
              if (Object.keys(dirtyValues).length === 0) return;

              const res = await UpdateAuctionItem(row.auctionId, {
                ...dirtyValues,
              });

              if (res.error) {
                handleApiError(res.error);
                return;
              }
              enqueueSnackbar('更新成功', { variant: 'success' });

              setOpen(false);
            },
            (err) => {
              console.log(err);
            }
          )}
        >
          <DialogTitle>修改盯標</DialogTitle>
          <DialogContent>
            <Stack spacing={3} mt={2}>
              <Controller
                control={control}
                name="sellerId"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>出品帳號</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      label="出品帳號"
                      fullWidth
                      sx={{ '&>.MuiSvgIcon-root': { transform: field.value ? 'translateX(-3rem)' : undefined } }}
                      readOnly={!havePermissions([{ key: 'UpdateAuctionItem', fields: ['sellerId'] }])}
                      endAdornment={
                        !!field.value && (
                          <InputAdornment position="end">
                            <IconButton
                              LinkComponent={Link}
                              size="small"
                              color="primary"
                              href={`/dashboard/workers/edit/${field.value}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <LaunchOutlinedIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    >
                      {sellersQuery.isPending ? (
                        <MenuItem disabled>載入中</MenuItem>
                      ) : sellersQuery.isError ? (
                        <MenuItem disabled>載入失敗</MenuItem>
                      ) : sellersQuery.data.error ? (
                        <MenuItem disabled>載入失敗</MenuItem>
                      ) : sellersQuery.data.data.workers.length === 0 ? (
                        <MenuItem disabled>無可用帳號</MenuItem>
                      ) : (
                        sellersQuery.data.data.workers.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name || s.account || s.url}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="watcherId"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <InputLabel>盯標帳號</InputLabel>
                    <Select
                      {...field}
                      value={field.value || ''}
                      label="盯標帳號"
                      fullWidth
                      sx={{ '&>.MuiSvgIcon-root': { transform: field.value ? 'translateX(-3rem)' : undefined } }}
                      readOnly={!havePermissions([{ key: 'UpdateAuctionItem', fields: ['sellerId'] }])}
                      endAdornment={
                        !!field.value && (
                          <InputAdornment position="end">
                            <IconButton
                              LinkComponent={Link}
                              size="small"
                              color="primary"
                              href={`/dashboard/workers/edit/${field.value}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <LaunchOutlinedIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    >
                      {watchersQuery.isPending ? (
                        <MenuItem disabled>載入中</MenuItem>
                      ) : watchersQuery.isError ? (
                        <MenuItem disabled>載入失敗</MenuItem>
                      ) : watchersQuery.data.error ? (
                        <MenuItem disabled>載入失敗</MenuItem>
                      ) : watchersQuery.data.data.workers.length === 0 ? (
                        <MenuItem disabled>無可用帳號</MenuItem>
                      ) : (
                        watchersQuery.data.data.workers.map((s) => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.name || s.account || s.url}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              <Controller
                control={control}
                name="reservePrice"
                render={({ field, fieldState }) => (
                  <FormControl fullWidth error={!!fieldState.error}>
                    <TextField
                      {...field}
                      label="期望金額"
                      type="number"
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value));
                      }}
                      InputProps={{
                        readOnly: !havePermissions([{ key: 'UpdateAuctionItem', fields: ['reservePrice'] }]),
                        startAdornment: <InputAdornment position="start">{currencySign('JPY')}</InputAdornment>,
                      }}
                    />
                    {!!fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button type="submit" disabled={isSubmitting} variant="contained" color="primary">
              通過
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
