'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { consignors } from '@/api/backend/consignor/consignors';
import { getConsignor } from '@/api/backend/consignor/getConsignor';
import { PAGE } from '@/static';
import { Autocomplete, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useHavePermissions } from '@/contexts/UserContext';
import { FilterPopover } from '@/components/FilterPopover';

const FIELD = 'consignor';

export function ConsignorFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const havePermissions = useHavePermissions();
  const [inputValue, setInputValue] = useState('');
  const { data, error, isFetching } = useQuery({
    queryFn: () => consignors({ fuzzyNickname: inputValue, limit: 20, offset: 0 }),
    queryKey: ['consignors', inputValue],
    placeholderData: keepPreviousData,
    enabled: !!inputValue,
  });
  const value = searchParams.get(FIELD);
  const consignorQuery = useQuery({
    queryFn: () => getConsignor(Number(value)),
    queryKey: ['consignor', value],
    enabled: !!Number(value),
  });

  if (!havePermissions(['AdminGetConsignor', 'AdminGetConsignors'])) {
    return null;
  }

  if (error || consignorQuery.error) throw new Error('Bug');

  return (
    <FilterPopover
      label="暱稱"
      field={FIELD}
      transform={() => consignorQuery.data?.data?.nickname ?? '--'}
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(FIELD);
        router.replace(`?${newSearchParams}`);
      }}
    >
      {({ close }) => (
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
            if (!newValue) return;
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete(PAGE);
            newSearchParams.set(FIELD, newValue.id.toString());
            router.replace(`?${newSearchParams.toString()}`);
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
          onClose={close}
        />
      )}
    </FilterPopover>
  );
}
