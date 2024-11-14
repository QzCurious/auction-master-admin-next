'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PAGE } from '@/domain/static/static';
import { RECORD_TYPE } from '@/domain/static/static-config-mappers';
import { Box, Chip, MenuItem, Select, Typography } from '@mui/material';

import { FilterPopover } from '@/components/FilterPopover';

const FILED = 'type';

const options = [
  RECORD_TYPE.data[0],
  RECORD_TYPE.data[1],
  RECORD_TYPE.data[2],
  RECORD_TYPE.data[3],
  RECORD_TYPE.data[4],
  RECORD_TYPE.data[5],
  RECORD_TYPE.data[6],
  RECORD_TYPE.data[7],
  RECORD_TYPE.data[8],
] as const;
options.length satisfies typeof RECORD_TYPE.data.length;

interface TypeFilterProps {
  selected: Array<(typeof options)[number]['value']>;
}

export function TypeFilter({ selected }: TypeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <FilterPopover
      label="類型"
      value={selected.map((v) => options.find(({ value }) => value === v)?.message).join(', ')}
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(FILED);
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
            newSearchParams.delete(FILED);
            for (const value of v.target.value) {
              newSearchParams.append(FILED, value.toString());
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
