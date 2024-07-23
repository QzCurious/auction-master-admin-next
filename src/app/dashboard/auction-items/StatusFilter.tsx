'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AUCTION_ITEM_STATUS_DATA, ITEM_STATUS_DATA } from '@/api/backend/configs.data';
import { PAGE } from '@/static';
import { Box, Chip, MenuItem, Select, Typography } from '@mui/material';

import { FilterPopover } from '@/components/FilterPopover';

const side = 'admin';

const filters = [
  {
    field: 'status',
    label: '狀態',
    options: [
      AUCTION_ITEM_STATUS_DATA[0],
      AUCTION_ITEM_STATUS_DATA[1],
      AUCTION_ITEM_STATUS_DATA[2],
      AUCTION_ITEM_STATUS_DATA[3],
      AUCTION_ITEM_STATUS_DATA[4],
      AUCTION_ITEM_STATUS_DATA[5],
      AUCTION_ITEM_STATUS_DATA[6],
    ] as const,
  },
];

interface StatusFilterProps {
  selected: Array<(typeof AUCTION_ITEM_STATUS_DATA)[number]['value']>;
}

export function StatusFilter({ selected }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <FilterPopover
      label="狀態"
      field="status"
      transform={() => selected.map((v) => ITEM_STATUS_DATA.find(({ value }) => value === v)?.message).join(', ')}
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
          displayEmpty
          size="small"
          value={selected}
          renderValue={(selected) =>
            selected.length === 0 ? (
              <Typography color="text.secondary" fontStyle="italic">
                全部
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((v) => (
                  <Chip key={v} label={AUCTION_ITEM_STATUS_DATA.find(({ value }) => value === v)?.message} />
                ))}
              </Box>
            )
          }
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
          {filters[0].options.map(({ value, message }) => (
            <MenuItem
              key={value}
              value={value}
              sx={{
                columnGap: 1,
                // color: !showCountStatus.includes(value) ? colors.grey[600] : undefined
              }}
              title={`${message} ${value}`}
            >
              {message}
              {/* {showCountStatus.includes(value) && (
                <Typography component="span" color={colors.grey[600]}>
                  ({statusCount[value] ?? 0})
                </Typography>
              )} */}
            </MenuItem>
          ))}
        </Select>
      )}
    </FilterPopover>
  );
}
