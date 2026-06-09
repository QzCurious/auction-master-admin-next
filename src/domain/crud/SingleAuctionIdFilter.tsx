'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PAGE } from '@/domain/static/static';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { IconButton, TextField } from '@mui/material';

import { FilterPopover } from '@/components/FilterPopover';

const FIELD = 'auctionId';

interface SingleAuctionIdFilterProps {
  value?: string;
}

export function SingleAuctionIdFilter({ value }: SingleAuctionIdFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <FilterPopover
      label="日拍物品代碼"
      value={value}
      onRemove={() => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(FIELD);
        newSearchParams.delete(PAGE);
        router.replace(`?${newSearchParams}`);
      }}
    >
      {({ close }) => (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set(FIELD, formData.get('value') as string);
            router.replace(`?${newSearchParams.toString()}`);
            close();
          }}
        >
          <TextField
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
        </form>
      )}
    </FilterPopover>
  );
}
