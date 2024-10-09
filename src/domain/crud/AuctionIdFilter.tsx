'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { PAGE } from '@/domain/static/static';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Box, Chip, IconButton, Stack, TextField } from '@mui/material';
import * as R from 'remeda';

import { FilterPopover } from '@/components/FilterPopover';

const FIELD = 'auctionId';

interface AuctionIdFilterProps {
  values?: Array<AuctionItem['auctionId']>;
}

export function AuctionIdFilter({ values = [] }: AuctionIdFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = useRef<HTMLInputElement>(null);

  return (
    <FilterPopover
      label="日拍物品代碼"
      value={values.join(', ')}
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(FIELD);
        newSearchParams.delete(PAGE);
        router.push(`?${newSearchParams}`);
      }}
    >
      {({ close }) => (
        <Box
          component="form"
          sx={{ maxWidth: 280 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (!ref.current?.value) return;
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete(FIELD);
            for (const v of R.unique([...values, ref.current.value.trim()])) {
              newSearchParams.append(FIELD, v);
            }
            router.replace(`?${newSearchParams.toString()}`);
            ref.current.value = '';
          }}
        >
          {values.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', mb: 1 }}>
              {values.map((value) => (
                <Chip
                  key={value}
                  label={value}
                  onDelete={() => {
                    const newSearchParams = new URLSearchParams(searchParams);
                    newSearchParams.delete(FIELD);
                    for (const v of values.filter((v) => v !== value)) {
                      newSearchParams.append(FIELD, v);
                    }
                    router.replace(`?${newSearchParams.toString()}`);
                  }}
                />
              ))}
            </Stack>
          )}
          <TextField
            inputRef={ref}
            size="small"
            name="value"
            InputProps={{
              sx: { pr: 0.5 },
              endAdornment: (
                <IconButton size="small" type="submit">
                  <SearchOutlinedIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
      )}
    </FilterPopover>
  );
}
