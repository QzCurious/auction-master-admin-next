'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ITEM_STATUS_DATA, ITEM_STATUS_MAP } from '@/api/backend/configs.data';
import { type StatusCount } from '@/api/backend/items/GetItemsAndDetails';
import { PAGE } from '@/static';
import { StatusFlow } from '@/StatusFlow';
import { Badge, Box, Chip, colors, MenuItem, Select, Typography } from '@mui/material';

import { FilterPopover } from '@/components/FilterPopover';

interface StatusFilterProps {
  selected: Array<(typeof ITEM_STATUS_DATA)[number]['value']>;
  statusCount: StatusCount;
}

const statusForAdmin = Object.values(StatusFlow.flow)
  .filter((v) => 'adjudicator' in v && v.adjudicator === 'admin')
  .map((v) => ITEM_STATUS_MAP[v.status]);

export function StatusFilter({ selected, statusCount }: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Badge
      color="primary"
      variant="dot"
      sx={{ '& .MuiBadge-dot': { mt: '2px', mr: '4px' } }}
      invisible={statusForAdmin.map((v) => statusCount[v]).every((v) => !v)}
    >
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
                    <Chip key={v} label={ITEM_STATUS_DATA.find(({ value }) => value === v)?.message} />
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
            {ITEM_STATUS_DATA.map(({ key, value, message }) => (
              <MenuItem
                key={value}
                value={value}
                sx={{ columnGap: 1, color: !statusForAdmin.includes(value) ? colors.grey[600] : undefined }}
                title={`${key} ${value}`}
              >
                {message}
                {statusForAdmin.includes(value) && (
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
