'use client';

import Link from 'next/link';
import { type Item } from '@/api/backend/items/GetItemsAndDetails';
import { SearchParamsPagination } from '@/domain/crud/SearchParamsPagination';
import { type PaginationSearchParams } from '@/domain/static/static';
import { ITEM_STATUS } from '@/domain/static/static-config-mappers';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import { Checkbox, Chip, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useAtom } from 'jotai';
import { type z } from 'zod';

import { pickedItemIdsReducerAtom } from './PickingList';
import { type SearchParamsSchema } from './SearchParamsSchema';

interface ItemTableProps extends PaginationSearchParams {
  rows: Item[];
  count: number;
  query: z.output<typeof SearchParamsSchema>;
}

export function ItemTable({ page, rowsPerPage, rows, count, query }: ItemTableProps) {
  const isPicking = query.stage === 'picking';
  const [pickedItemIds, dispatch] = useAtom(pickedItemIdsReducerAtom);

  return (
    <>
      <Grid container spacing={2}>
        {rows.length === 0 && <Grid item>沒有資料</Grid>}
        {rows.map((row) => {
          const checked = pickedItemIds.includes(row.id);

          return (
            <Grid item key={row.id} lg={4} md={6} xs={12}>
              <Card
                sx={{
                  position: 'relative',
                  border: isPicking && checked ? '2px solid var(--mui-palette-primary-light)' : undefined,
                }}
              >
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

                {isPicking && (
                  <Box
                    component="label"
                    htmlFor={`item-${row.id}`}
                    zIndex={10}
                    sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
                  >
                    {/* Block link */}
                  </Box>
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
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {isPicking && (
                      <Checkbox
                        id={`item-${row.id}`}
                        sx={{ my: -2, mx: -1 }}
                        checked={checked}
                        onChange={() => dispatch({ type: 'toggle', id: row.id })}
                      />
                    )}
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

                    <Chip sx={{ ml: 'auto' }} label={ITEM_STATUS.get('value', row.status).message} size="small" />
                  </Stack>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <SearchParamsPagination page={page} rowsPerPage={rowsPerPage} count={count} />
    </>
  );
}
