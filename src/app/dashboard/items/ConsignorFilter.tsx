'use client';

import { useState } from 'react';
import { consignors } from '@/api/backend/consignor/consignors';
import { getConsignor } from '@/api/backend/consignor/getConsignor';
import { useSearchField } from '@/helper/searchParams';
import { Autocomplete, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useHavePermissions } from '@/contexts/UserContext';
import { FilterPopover } from '@/components/FilterPopover';

export function ConsignorFilter() {
  const havePermissions = useHavePermissions();
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

  if (!havePermissions(['AdminGetConsignor', 'AdminGetConsignors'])) {
    return null;
  }

  if (error || consignorQuery.error) throw new Error('Bug');

  return (
    <FilterPopover
      label="暱稱"
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
    </FilterPopover>
  );
}
