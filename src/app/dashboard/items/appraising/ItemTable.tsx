'use client';

import * as React from 'react';
import { useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type Admin } from '@/api/backend/admins/admins';
import { deleteAdmin } from '@/api/backend/admins/deleteAdmin';
import { consignors } from '@/api/backend/consignor/consignors';
import { getConsignor } from '@/api/backend/consignor/getConsignor';
import { type Item } from '@/api/backend/items/items';
import { clearSearchFields, hasSearchFields, useSearchField } from '@/helper/searchParams';
import { DATE_FORMAT } from '@/static';
import DeleteIcon from '@mui/icons-material/Delete';
import { Autocomplete, Grid, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { useSnackbar } from 'notistack';

import { useHavePermissions } from '@/contexts/UserContext';
import { FilterPopup } from '@/components/FilterPopup';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import PreviewPhotos from '../PreviewPhotos';

interface ItemTableProps {
  rows: Item[];
  count: number;
}

export function ItemTable({ rows, count }: ItemTableProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const havePermissions = useHavePermissions();

  return (
    <>
      <Stack direction="row" columnGap={2}>
        {havePermissions(['AdminGetConsignor', 'AdminGetConsignors']) && <ConsignorFilter />}

        {hasSearchFields(searchParams) && (
          <Button
            variant="text"
            size="small"
            onClick={() => {
              router.replace(`${pathname}?${clearSearchFields(searchParams)}`);
              router.refresh();
            }}
          >
            清除搜尋
          </Button>
        )}
      </Stack>

      <Grid container spacing={2}>
        {rows.length === 0 && <Grid item>沒有資料</Grid>}
        {rows.map((row) => (
          <Grid item key={row.id} lg={4} md={6} xs={12}>
            <Card>
              <PreviewPhotos photos={row.photos} />
              <Box sx={{ pt: 1, pb: 2, px: 1.5 }}>
                <Typography component="h2" variant="h5">
                  {row.name}
                </Typography>
                <Typography variant="body2">底價: {row.reservePrice}</Typography>
                <Typography color="text.secondary" variant="body2">
                  時效: {format(row.createdAt, DATE_FORMAT)}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <SearchParamsPagination count={count} />
    </>
  );
}

function DeleteBtn({ row }: { row: Admin }) {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'demoPopover',
  });
  const [isPending, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();

  return (
    <>
      <IconButton {...bindTrigger(popupState)}>
        <DeleteIcon />
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
        <Box sx={{ p: '16px 20px ' }}>
          <Typography variant="subtitle1">刪除管理員</Typography>
          <Typography color="text.secondary" variant="body2">
            您確定要刪除 {row.account} 嗎?
          </Typography>
          <Stack direction="row" gap={2} justifyContent="space-between" sx={{ mt: 1 }}>
            <Button variant="text" size="small" onClick={popupState.close}>
              取消
            </Button>
            <Button
              disabled={isPending}
              variant="contained"
              size="small"
              onClick={() => {
                popupState.close();
                startTransition(async () => {
                  await deleteAdmin(row.id);
                  enqueueSnackbar(`${row.account} deleted`, { variant: 'success' });
                });
              }}
            >
              刪除
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}

function ConsignorFilter() {
  const [inputValue, setInputValue] = useState('');
  const [value, onChange, remove] = useSearchField('consignor', { removeEmpty: true });
  const { data, error, isFetching } = useQuery({
    queryFn: () => consignors({ fuzzyNickname: inputValue, limit: 20, offset: 0 }),
    queryKey: ['consignors', inputValue],
    placeholderData: keepPreviousData,
    enabled: !!inputValue,
  });
  const consignorQuery = useQuery({
    queryFn: () => getConsignor(Number(value)),
    queryKey: ['consignor', value],
    enabled: !!Number(value),
  });

  if (error || consignorQuery.error) throw new Error('Bug');

  return (
    <FilterPopup
      label="寄售人"
      field="consignor"
      transform={() => consignorQuery.data?.data?.nickname ?? '--'}
      onRemove={remove}
    >
      <Autocomplete
        sx={{ width: 215 }}
        loading={isFetching}
        inputValue={inputValue}
        onInputChange={(_, v) => setInputValue(v)}
        filterOptions={(x) => x}
        isOptionEqualToValue={(option, value) => option.nickname === value.nickname}
        options={data?.data?.consignors ?? []}
        // BUG: can't research after select
        // value={data?.data?.consignors.find((item) => item.id.toString() === inputValue) ?? null}
        onChange={(_, newValue) => {
          if (!newValue) remove();
          else onChange(newValue.id.toString());
        }}
        getOptionLabel={(option) => option.nickname}
        renderInput={(inputProps) => <TextField {...inputProps} size="small" />}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.id} sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {option.nickname}
            </Typography>
          </Box>
        )}
        autoHighlight
        loadingText="載入中..."
        noOptionsText="無結果"
      />
    </FilterPopup>
  );
}
