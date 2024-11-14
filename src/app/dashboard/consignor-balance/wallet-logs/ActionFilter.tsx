'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PAGE } from '@/domain/static/static';
import { WALLET_ACTION } from '@/domain/static/static-config-mappers';
import { Box, Chip, MenuItem, Select, Typography } from '@mui/material';

import { FilterPopover } from '@/components/FilterPopover';

const FIELD = 'action';

const options = [
  WALLET_ACTION.data[0],
  WALLET_ACTION.data[1],
  WALLET_ACTION.data[2],
  WALLET_ACTION.data[3],
  WALLET_ACTION.data[4],
  WALLET_ACTION.data[5],
  WALLET_ACTION.data[6],
  WALLET_ACTION.data[7],
] as const;
options.length satisfies typeof WALLET_ACTION.data.length;

interface StatusFilterProps {
  selected: Array<(typeof options)[number]['value']>;
}

export function ActionFilter({ selected }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <FilterPopover
      label="操作"
      value={selected.map((v) => options.find(({ value }) => value === v)?.message).join(', ')}
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(FIELD);
        newSearchParams.delete(PAGE);
        router.push(`?${newSearchParams}`);
      }}
    >
      {({ close }) => (
        <Select
          sx={{ minWidth: 240, maxWidth: 360 }}
          multiple
          displayEmpty
          size="small"
          value={selected}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((v) => (
                <Chip key={v} label={options.find(({ value }) => value === v)?.message} />
              ))}
            </Box>
          )}
          // renderValue={(selected) =>
          //   selected.length === 0 ? (
          //     <Typography color="text.secondary" fontStyle="italic">
          //       全部
          //     </Typography>
          //   ) : (
          //     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          //       {selected.map((v) => (
          //         <Chip key={v} label={options.find(({ value }) => value === v)?.message} />
          //       ))}
          //     </Box>
          //   )
          // }
          onChange={(v) => {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete(PAGE);
            newSearchParams.delete(FIELD);
            for (const value of v.target.value) {
              newSearchParams.append(FIELD, value.toString());
            }
            router.push(`?${newSearchParams.toString()}`);
          }}
          onClose={close}
        >
          {options.map(({ value, key, message }) => (
            <MenuItem key={value} value={value} sx={{ columnGap: 1 }} title={`${key} ${value}`}>
              {message}
            </MenuItem>
          ))}
        </Select>
      )}
    </FilterPopover>
  );
}
