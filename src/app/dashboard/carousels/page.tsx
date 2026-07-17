import { isDemoMode } from '@/config/demo';
import { getDb } from '@/db';
import { carousel, carouselGroup } from '@/db/schema';
import { demoCarouselGroups, demoCarousels } from '@/demo/carousels';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import { SITE_NAME } from '@/domain/static/static';
import Alert from '@mui/material/Alert';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import Stack from '@mui/system/Stack';
import { asc, eq, getTableColumns } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import CarouselGroupsDialog from './CarouselGroupsDialog';
import { CarouselTable } from './CarouselTable';
import CreateCarouselDialog from './CreateCarouselDialog';
import { SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `輪播圖列表 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  const groups = isDemoMode ? demoCarouselGroups : await getLiveGroups();
  const filters = parseSearchParams(SearchParamsSchema, pageProps.searchParams);
  if (filters.groupId && !groups.some((group) => group.id === filters.groupId)) {
    redirect('/dashboard/carousels');
  }
  filters.groupId ??= groups[0]?.id;

  return (
    <Stack spacing={3}>
      {isDemoMode && (
        <Alert severity="info">Demo 模式使用展示資料，新增、編輯、刪除與圖片上傳已停用。</Alert>
      )}

      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">輪播圖</Typography>
        </Stack>

        <CarouselGroupsDialog groups={groups} />
        {groups.length > 0 && <CreateCarouselDialog groupId={filters.groupId} groups={groups} />}
      </Stack>

      {groups.length > 0 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" gap={2}>
            <Tabs sx={{ flex: 1 }} value={filters.groupId}>
              {groups.map((group) => (
                <Tab
                  sx={{ px: 1 }}
                  key={group.id}
                  label={group.name}
                  value={group.id}
                  component={Link}
                  href={`/dashboard/carousels?groupId=${group.id}`}
                />
              ))}
            </Tabs>
          </Stack>
        </Box>
      )}
      {/* <PermissionsGuard permissions={['GetAdmins']}> */}
      <section>
        <Table {...pageProps} />
      </section>
      {/* </PermissionsGuard> */}
    </Stack>
  );
}

async function getLiveGroups() {
  const db = await getDb();
  return db.select().from(carouselGroup);
}

async function Table({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);

  if (isDemoMode) {
    const list = demoCarousels
      .filter((row) => !filters.groupId || row.groupId === filters.groupId)
      .sort((a, b) => a.sorted - b.sorted);

    return <CarouselTable groups={demoCarouselGroups} rows={list} />;
  }

  const db = await getDb();
  const [list, groups] = await Promise.all([
    db
      .select({ ...getTableColumns(carousel), group: carouselGroup.name })
      .from(carousel)
      .innerJoin(carouselGroup, eq(carousel.groupId, carouselGroup.id))
      .where(filters.groupId ? eq(carousel.groupId, filters.groupId) : undefined)
      .orderBy(asc(carousel.sorted)),
    db.select().from(carouselGroup),
  ]);

  // if (adminRes.error) {
  //   return <HandleApiError error={adminRes.error} />;
  // }

  return <CarouselTable groups={groups} rows={list} />;
}
