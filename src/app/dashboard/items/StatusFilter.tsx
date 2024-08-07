'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ITEM_STATUS } from '@/api/backend/configs.data';
import { type StatusCount } from '@/api/backend/items/GetItemsAndDetails';
import { PAGE } from '@/static';
import { StatusFlow } from '@/StatusFlow';
import { Badge, Box, Chip, colors, MenuItem, Select, Typography } from '@mui/material';
import * as R from 'remeda';

import { FilterPopover } from '@/components/FilterPopover';

const field = 'status';

const side = 'admin';

const options = [
  ITEM_STATUS.data[0],
  ITEM_STATUS.data[2],
  ITEM_STATUS.data[3],
  ITEM_STATUS.data[5],
  ITEM_STATUS.data[6],
  ITEM_STATUS.data[9],
  ITEM_STATUS.data[10],
  ITEM_STATUS.data[11],
  ITEM_STATUS.data[12],

  ITEM_STATUS.data[1],
  ITEM_STATUS.data[4],
  ITEM_STATUS.data[7],
  ITEM_STATUS.data[8],
  ITEM_STATUS.data[13],
  ITEM_STATUS.data[14],
  ITEM_STATUS.data[15],
  ITEM_STATUS.data[16],
  ITEM_STATUS.data[17],
  ITEM_STATUS.data[18],
] as const;
// options: ITEM_STATUS_DATA.map((x) => {
//   const step = StatusFlow.flow[x.key];
//   return {
//     ...x,
//     sort: 'adjudicator' in step && step.adjudicator === side ? 0 : 1,
//   };
// }).sort((a, b) => a.sort - b.sort),

const showCountStatus = Object.values(StatusFlow.flow)
  .filter((v) => 'adjudicator' in v && v.adjudicator === side)
  .map((v) => ITEM_STATUS.enum(v.status));

interface StatusFilterProps {
  selected: Array<(typeof options)[number]['value']>;
  statusCount: StatusCount;
}

export function StatusFilter({ selected, statusCount }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Badge
      color="primary"
      variant="dot"
      sx={{ '& .MuiBadge-dot': { mt: '2px', mr: '4px' } }}
      invisible={showCountStatus.map((v) => statusCount[v]).every((v) => !v)}
    >
      <FilterPopover
        label="狀態"
        field={field}
        transform={() => selected.map((v) => options.find(({ value }) => value === v)?.message).join(', ')}
        onRemove={() => {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete(field);
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
                    <Chip key={v} label={options.find(({ value }) => value === v)?.message} />
                  ))}
                </Box>
              )
            }
            onChange={(v) => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.delete(field);
              for (const value of v.target.value) {
                newSearchParams.append(field, value.toString());
              }
              router.push(`?${newSearchParams.toString()}`);
            }}
            onClose={close}
          >
            {options.map(({ value, message }) => (
              <MenuItem
                key={value}
                value={value}
                sx={{ columnGap: 1, color: R.isIncludedIn(value, showCountStatus) ? colors.grey[600] : undefined }}
                title={`${message} ${value}`}
              >
                {message}
                {R.isIncludedIn(value, showCountStatus) && (
                  <Typography component="span" color={colors.grey[600]}>
                    ({statusCount[value] ?? 0})
                  </Typography>
                )}
              </MenuItem>
            ))}
          </Select>
        )}
      </FilterPopover>
    </Badge>
  );
}
