'use client';

import { PAGE } from '@/domain/static/static';
import { RECORD_STATUS } from '@/domain/static/static-config-mappers';
import { Box, Chip, MenuItem, Select } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

import { FilterPopover } from '@/components/FilterPopover';

const FIELD = 'status';

const options = [RECORD_STATUS.data[0], RECORD_STATUS.data[1], RECORD_STATUS.data[2], RECORD_STATUS.data[3]] as const;
options.length satisfies typeof RECORD_STATUS.data.length;

interface StatusFilterProps {
  selected: Array<(typeof options)[number]['value']>;
}

export function StatusFilter({ selected }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <FilterPopover
      label="狀態"
      value={selected.map((v) => options.find(({ value }) => value === v)?.message).join(', ')}
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(PAGE);
        newSearchParams.delete(FIELD);
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
          {options.map(({ value, message }) => (
            <MenuItem key={value} value={value} sx={{ columnGap: 1 }} title={`${message} ${value}`}>
              {message}
            </MenuItem>
          ))}
        </Select>
      )}
    </FilterPopover>
  );
}
