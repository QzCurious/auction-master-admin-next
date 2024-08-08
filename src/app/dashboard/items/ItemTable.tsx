import Link from 'next/link';
import { ITEM_STATUS } from '@/api/backend/static-configs.data';
import { type Item } from '@/api/backend/items/GetItemsAndDetails';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import { Chip, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SearchParamsPagination } from '@/components/SearchParamsPagination';

interface ItemTableProps {
  rows: Item[];
  count: number;
}

export function ItemTable({ rows, count }: ItemTableProps) {
  return (
    <>
      <Grid container spacing={2}>
        {rows.length === 0 && <Grid item>沒有資料</Grid>}
        {rows.map((row) => (
          <Grid item key={row.id} lg={4} md={6} xs={12}>
            <Card sx={{ position: 'relative' }}>
              {row.isNew && (
                <Chip
                  label="新品"
                  size="small"
                  color="primary"
                  sx={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                />
              )}

              <Link href={`/dashboard/items/edit/${row.id}`}>
                {row.photos.length === 0 ? (
                  <PhotoSizeSelectActualOutlinedIcon
                    sx={{
                      display: 'block',
                      height: 'auto',
                      fill: grey['300'],
                      aspectRatio: '16/10',
                      width: '100%',
                    }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={row.photos[0].photo}
                    sx={{
                      aspectRatio: '16/10',
                      width: '100%',
                      backgroundColor: grey['100'],
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                    alt=""
                  />
                )}
              </Link>

              <Box sx={{ pt: 1, pb: 2, px: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                  <Typography
                    component="h2"
                    variant="h5"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.name}
                  </Typography>

                  <Chip label={ITEM_STATUS.get('value', row.status).message} size="small" />
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
