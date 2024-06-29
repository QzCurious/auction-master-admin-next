import * as React from 'react';
import Link from 'next/link';
import { type Item } from '@/api/backend/items/items';
import EditIcon from '@mui/icons-material/Edit';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SearchParamsPagination } from '@/components/SearchParamsPagination';

import PreviewPhotos from '../PreviewPhotos';

interface ItemTableProps {
  rows: Item[];
  count: number;
}

export function ItemTable({ rows, count }: ItemTableProps): React.JSX.Element {
  return (
    <>
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
                  <IconButton LinkComponent={Link} href={`/dashboard/items/submit-appraisal-status/edit/${row.id}`}>
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
