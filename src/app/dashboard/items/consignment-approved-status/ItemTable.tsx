'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type Item } from '@/api/backend/items/items';
import { clearSearchFields, hasSearchFields } from '@/helper/searchParams';
import EditIcon from '@mui/icons-material/Edit';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import { ConsignorFilter } from '../ConsignorFilter';
import PreviewPhotos from '../PreviewPhotos';

interface ItemTableProps {
  rows: Item[];
  count: number;
}

export function ItemTable({ rows, count }: ItemTableProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <Stack direction="row" columnGap={2}>
        <ConsignorFilter />

        {hasSearchFields(searchParams) && (
          <Button
            variant="text"
            size="small"
            onClick={() => {
              router.replace(`${pathname}?${clearSearchFields(searchParams)}`);
              router.refresh();
            }}
          >
            清除搜尋
          </Button>
        )}
      </Stack>

      <Grid container spacing={2}>
        {rows.length === 0 && <Grid item>沒有資料</Grid>}
        {rows.map((row) => (
          <Grid item key={row.id} lg={4} md={6} xs={12}>
            <Card>
              <PreviewPhotos photos={row.photos} />
              <Box sx={{ pt: 1, pb: 2, px: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography component="h2" variant="h5">
                    {row.name}
                  </Typography>
                  <IconButton LinkComponent={Link} href={`/dashboard/items/consignment-approved-status/edit/${row.id}`}>
                    <EditIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <SearchParamsPagination count={count} />
    </>
  );
}
