import { type Metadata } from 'next';
import RouterLink from 'next/link';
import { notFound } from 'next/navigation';
import { GetAuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { GetItemAndDetails } from '@/api/backend/items/GetItemAndDetails';
import { GetWorker } from '@/api/backend/workers/GetWorker';
import { GetWorkers } from '@/api/backend/workers/GetWorkers';
import RedirectAuthError from '@/domain/auth/RedirectAuthError';
import { havePermissions, PermissionsGuard } from '@/domain/permission/havePermissions.server';
import WithoutPermissionsError from '@/domain/permission/WithoutPermissionsError/WithoutPermissionsError';
import { SITE_NAME } from '@/domain/static/static';
import { WORKER_STATUS, WORKER_TYPE } from '@/domain/static/static-config-mappers';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from '@mui/material';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';

import { AuctionItemFormProvider, EditAuctionItemForm } from './EditAuctionItemForm';

export const metadata = { title: `編輯日拍競標商品 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  params: { id: string };
}

async function Page(pageProps: PageProps) {
  return (
    <>
      <Stack alignItems="start">
        <Link component={RouterLink} href="/dashboard/auction-items">
          <Stack direction="row" alignItems="center" columnGap={1}>
            <ArrowBackIcon /> 回到日拍競標商品列表
          </Stack>
        </Link>
      </Stack>
      <Typography variant="h4" sx={{ mt: 3 }}>
        編輯日拍競標商品
      </Typography>

      <PermissionsGuard permissions={['GetAuctionItem']}>
        <Content {...pageProps} />
      </PermissionsGuard>
    </>
  );
}

export default Page;

async function Content({ params }: PageProps) {
  if (Number.isNaN(params.id)) {
    notFound();
  }

  const auctionItemRes = await GetAuctionItem(Number(params.id));

  if (auctionItemRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAuctionItem']} />;
  }

  if (auctionItemRes.error === '1003') {
    return <RedirectAuthError />;
  }

  if (!auctionItemRes.data) {
    notFound();
  }

  const [consignorRes, itemRes, sellerRes, watcherRes, sellersRes, watchersRes] = await Promise.all([
    (await havePermissions(['AdminGetConsignor'])) ? AdminGetConsignor(auctionItemRes.data.consignorID) : undefined,
    (await havePermissions(['GetItemAndDetails'])) ? GetItemAndDetails(auctionItemRes.data.itemID) : undefined,
    (await havePermissions(['GetWorker'])) && auctionItemRes.data.sellerID
      ? GetWorker(auctionItemRes.data.sellerID)
      : undefined,
    (await havePermissions(['GetWorker'])) && auctionItemRes.data.watcherID
      ? GetWorker(auctionItemRes.data.watcherID)
      : undefined,
    (await havePermissions(['GetWorkers']))
      ? GetWorkers({ type: [WORKER_TYPE.enum('SellerType')], status: [WORKER_STATUS.enum('ActiveStatus')], limit: 100 })
      : undefined,
    (await havePermissions(['GetWorkers']))
      ? GetWorkers({
          type: [WORKER_TYPE.enum('WatcherType')],
          status: [WORKER_STATUS.enum('ActiveStatus')],
          limit: 100,
        })
      : undefined,
  ]);

  return (
    <Box mt={4}>
      <AuctionItemFormProvider auctionItem={auctionItemRes.data}>
        <EditAuctionItemForm
          auctionItem={auctionItemRes.data}
          consignor={consignorRes?.data ?? undefined}
          item={itemRes?.data ?? undefined}
          seller={sellerRes?.data ?? undefined}
          watcher={watcherRes?.data ?? undefined}
          sellers={sellersRes?.data?.workers ?? undefined}
          watchers={watchersRes?.data?.workers ?? undefined}
        />
      </AuctionItemFormProvider>
    </Box>
  );
}
