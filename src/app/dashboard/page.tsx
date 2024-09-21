import * as React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { GetBackendConfigs } from '@/api/backend/GetConfigs';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { SITE_NAME, toPercent } from '@/domain/static/static';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { Money } from '@phosphor-icons/react/dist/ssr';

import lineIcon from './LINE_icon.png';
import ReportsChart from './ReportsChart';

export const metadata = { title: `Overview | ${SITE_NAME}` } satisfies Metadata;

export default async function Page() {
  const configsRes = await GetBackendConfigs();

  if (configsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetConfigs']} />;
  }

  if (configsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Grid container spacing={3}>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfit
          sx={{ height: '100%' }}
          title="日拍平台手續費比例"
          value={toPercent(configsRes.data.yahooAuctionFeeRate)}
        />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfit sx={{ height: '100%' }} title="平台手續費比例" value={toPercent(configsRes.data.commissionRate)} />
      </Grid>
      <Grid lg={3} sm={6} xs={12}>
        <TotalProfit
          sx={{ height: '100%' }}
          title="預設回饋比例"
          value={toPercent(configsRes.data.defaultCommissionBonusRate)}
        />
      </Grid>

      <Grid lg={3} sm={6} xs={12}>
        <Card>
          <CardContent>
            <Link href={configsRes.data.lineURL} target="_blank" style={{ textDecoration: 'none' }}>
              <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
                <Stack spacing={1}>
                  <Typography color="text.secondary" sx={{}}>
                    官方 LINE
                  </Typography>
                </Stack>
                <Avatar
                  sx={{
                    position: 'relative',
                    backgroundColor: 'var(--mui-palette-primary-main)',
                    height: '56px',
                    width: '56px',
                  }}
                >
                  <Image src={lineIcon} alt="LINE" height={56} width={56} />
                </Avatar>
              </Stack>
            </Link>
          </CardContent>
        </Card>
      </Grid>

      <Grid xs={12}>
        <HavePermissionsOnly permissions={['GetReports']}>
          <ReportsChart />
        </HavePermissionsOnly>
      </Grid>
    </Grid>
  );
}

interface TotalProfitProps {
  sx?: SxProps;
  title: string;
  value: string | number;
}

function TotalProfit({ title, value, sx }: TotalProfitProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary">{title}</Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
            <Money fontSize="var(--icon-fontSize-lg)" />
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
