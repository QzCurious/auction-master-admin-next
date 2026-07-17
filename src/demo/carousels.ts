import { carousel, carouselGroup } from '@/db/schema';

type CarouselGroup = typeof carouselGroup.$inferSelect;
type CarouselRow = typeof carousel.$inferSelect & { group: string };

const timestamp = new Date('2025-01-01T00:00:00+08:00');

export const demoCarouselGroups: CarouselGroup[] = [
  {
    id: 1,
    name: '精選案例',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 2,
    name: '服務介紹',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

export const demoCarousels: CarouselRow[] = [
  {
    id: 1,
    groupId: 1,
    group: '精選案例',
    desktopImageUrl: '/demo/carousel/featured-collectibles-desktop.svg',
    mobileImageUrl: '/demo/carousel/featured-collectibles-mobile.svg',
    sorted: 1,
    publishAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 2,
    groupId: 1,
    group: '精選案例',
    desktopImageUrl: '/demo/carousel/yahoo-auction-desktop.svg',
    mobileImageUrl: '/demo/carousel/yahoo-auction-mobile.svg',
    sorted: 2,
    publishAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 3,
    groupId: 2,
    group: '服務介紹',
    desktopImageUrl: '/demo/carousel/trusted-process-desktop.svg',
    mobileImageUrl: '/demo/carousel/trusted-process-mobile.svg',
    sorted: 1,
    publishAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];
