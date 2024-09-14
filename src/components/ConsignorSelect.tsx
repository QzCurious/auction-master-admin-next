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
  const consignorQuery = useQuery({
    queryFn: () => AdminGetConsignor(Number(value)),
    queryKey: ['consignor', value],
    enabled: value != null,
  });

  const _inputValue = inputValue || (consignorQuery.data?.data?.nickname ?? '');
  const { data, error, isFetching } = useQuery({
    queryFn: () => AdminGetConsignors({ fuzzyNickname: _inputValue, limit: 20, offset: 0 }),
    queryKey: ['consignors', _inputValue],
    placeholderData: keepPreviousData,
    enabled: !!_inputValue,
  });

  if (error || consignorQuery.error) throw new Error('Bug');

  return (
    <Autocomplete
      sx={sx}
      loading={isFetching}
      disableClearable={disableClearable}
      inputValue={_inputValue}
      onInputChange={(_, v, reason) => {
        // fxxk mui
        if (reason === 'reset') return;
        setInputValue(v);
      }}
      filterOptions={(x) => x}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      options={data?.data?.consignors ?? []}
      value={data?.data?.consignors.find((x) => x.id === value) ?? null}
      onChange={(_, newValue) => {
        if (newValue) {
          onChange(newValue.id, newValue);
          // fxxk mui
          setInputValue(newValue.nickname);
        } else {
          onChange(null, null);
          // fxxk mui
          setInputValue('');
        }
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
