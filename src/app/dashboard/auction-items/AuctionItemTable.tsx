import Link from 'next/link';
import { AUCTION_ITEM_STATUS_DATA } from '@/api/backend/configs.data';
import { type AuctionItem } from '@/api/backend/items/GetAuctionItems';
import PhotoSizeSelectActualOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActualOutlined';
import { Chip, Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SearchParamsPagination } from '@/components/SearchParamsPagination';

interface AuctionItemTableProps {
  rows: AuctionItem[];
  count: number;
}

export function AuctionItemTable({ rows, count }: AuctionItemTableProps) {
  return (
    <>
      <Grid container spacing={2}>
        {rows.length === 0 && <Grid item>沒有資料</Grid>}
        {rows.map((row) => (
          <Grid item key={row.id} lg={4} md={6} xs={12}>
            <Card>
              <Link href={`/dashboard/items/edit/${row.id}`}>
                {row.photo ? (
                  <Box
                    component="img"
                    src={row.photo}
                    sx={{
                      aspectRatio: '16/10',
                      width: '100%',
                      backgroundColor: grey['100'],
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                    alt=""
                  />
                ) : (
                  <PhotoSizeSelectActualOutlinedIcon
                    sx={{
                      display: 'block',
                      height: 'auto',
                      fill: grey['300'],
                      aspectRatio: '16/10',
                      width: '100%',
                    }}
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

                  <Chip
                    label={AUCTION_ITEM_STATUS_DATA.find(({ value }) => value === row.status)?.message}
                    // color={ITEM_STATUS_DATA[row.status].color}
                    size="small"
                  />
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
