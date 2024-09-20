import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { GetAuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { GetActivationWorkers } from '@/api/backend/workers/GetActivationWorkers';
import { SITE_NAME } from '@/domain/static/static';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';

import { AuctionItemTable } from '../AuctionItemTable';

export const metadata = { title: `日拍競標商品 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  params: { id: string };
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            日拍競標商品 [{pageProps.params.id}]
          </Typography>
        </Stack>
      </Stack>

      <section>
        <Content {...pageProps} />
      </section>
    </Stack>
  );
}

async function Content({ params: { id } }: PageProps) {
  if (Number.isNaN(Number(id))) {
    notFound();
  }

  const [auctionItemRes, activeWorkersRes] = await Promise.all([GetAuctionItem(Number(id)), GetActivationWorkers()]);

  if (auctionItemRes.error === '21') {
    notFound();
  }

  if (auctionItemRes.error === '1001' || activeWorkersRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAuctionItems', 'GetActivationWorkers']} />;
  }

  if (auctionItemRes.error === '1003' || activeWorkersRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" flexWrap="wrap" gap={2}></Stack>

      <AuctionItemTable rows={[auctionItemRes.data]} count={1} activationWorkers={activeWorkersRes.data} />
    </Stack>
  );
}
