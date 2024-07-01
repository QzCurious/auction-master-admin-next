'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ITEM_STATUS_DATA } from '@/api/backend/configs.data';
import { PAGE } from '@/static';
import { Box, Chip, MenuItem, Select } from '@mui/material';

import { FilterPopover } from '@/components/FilterPopover';

interface StatusFilterProps {
  status: Array<(typeof ITEM_STATUS_DATA)[number]['value']>;
}

export function StatusFilter({ status }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <FilterPopover
      label="狀態"
      field="status"
      transform={() => status.map((v) => ITEM_STATUS_DATA.find(({ value }) => value === v)?.message).join(', ')}
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('status');
        newSearchParams.delete(PAGE);
        router.push(`?${newSearchParams}`);
      }}
    >
      {({ close }) => (
        <Select
          sx={{ minWidth: 240, maxWidth: 360 }}
          multiple
          value={status}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((v) => (
                <Chip key={v} label={ITEM_STATUS_DATA.find(({ value }) => value === v)?.message} />
              ))}
            </Box>
          )}
          onChange={(v) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('status');
            for (const value of v.target.value) {
              newSearchParams.append('status', value.toString());
            }
            router.push(`?${newSearchParams.toString()}`);
          }}
          onClose={close}
        >
          {ITEM_STATUS_DATA.map(({ value, message }) => (
            <MenuItem key={value} value={value}>
              {message}
            </MenuItem>
          ))}
        </Select>
      )}
    </FilterPopover>
  );
}
