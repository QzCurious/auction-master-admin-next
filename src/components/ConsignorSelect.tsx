import { useState } from 'react';
import { AdminGetConsignor, type Consignor } from '@/api/backend/consignor/AdminGetConsignor';
import { AdminGetConsignors } from '@/api/backend/consignor/AdminGetConsignors';
import { Autocomplete, TextField, Typography, type TextFieldProps } from '@mui/material';
import { Box, type SxProps } from '@mui/system';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function ConsignorSelect({
  sx,
  value,
  onChange,
  textFieldProps,
  disableClearable,
}: {
  sx?: SxProps;
  value: Consignor['id'] | null;
  onChange: (v: Consignor['id'] | null, consignor: Consignor | null) => void;
  textFieldProps?: TextFieldProps;
  disableClearable?: boolean;
}) {
  const [inputValue, setInputValue] = useState('');
  const { data, error, isFetching } = useQuery({
    queryFn: () => AdminGetConsignors({ fuzzyNickname: inputValue, limit: 20, offset: 0 }),
    queryKey: ['consignors', inputValue],
    placeholderData: keepPreviousData,
    enabled: !!inputValue,
  });
  const consignorQuery = useQuery({
    queryFn: () => AdminGetConsignor(Number(value)),
    queryKey: ['consignor', value],
    enabled: !!Number(value),
  });

  if (error || consignorQuery.error) throw new Error('Bug');

  return (
    <Autocomplete
      sx={sx}
      loading={isFetching}
      disableClearable={disableClearable}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      filterOptions={(x) => x}
      isOptionEqualToValue={(option, value) => option.nickname === value.nickname}
      options={data?.data?.consignors ?? []}
      value={data?.data?.consignors.find((x) => x.id === value) ?? null}
      onChange={(_, newValue) => {
        onChange(newValue?.id ?? null, newValue);
      }}
      getOptionLabel={(option) => option.nickname}
      renderInput={(inputProps) => <TextField {...inputProps} {...textFieldProps} />}
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
  );
}
