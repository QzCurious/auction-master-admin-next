'use client';

import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton, InputAdornment, OutlinedInput } from '@mui/material';

export default function DirectIdInput() {
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const id = (e.currentTarget['item-id'] as HTMLInputElement).value.trim();
        if (!id) return;
        router.push(`/dashboard/items/edit/${id}`);
      }}
    >
      <OutlinedInput
        name="item-id"
        size="small"
        placeholder="輸入物品編號"
        endAdornment={
          <InputAdornment position="end">
            <IconButton type="submit" edge="end">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </form>
  );
}
