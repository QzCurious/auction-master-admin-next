import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { z } from 'zod';

export const SITE_NAME = '日拍大師後台';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

export const ROWS_PER_PAGE = 'rowsPerPage';
export const PAGE = 'page';
export const PaginationSchema = z.object({
  [ROWS_PER_PAGE]: z.coerce.number().min(1).default(10).catch(10),
  [PAGE]: z.coerce.number().min(0).default(0).catch(0),
});
export type PaginationSearchParams = z.output<typeof PaginationSchema>;
export const defaultPagination = PaginationSchema.parse({});

export const toPercent = (num: number) => {
  return num.toLocaleString('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
};

export type Currency = 'JPY' | 'TWD';
export function currencySign(currency: Currency) {
  switch (currency) {
    case 'JPY':
      return '¥';
    case 'TWD':
      return 'NT$';
  }
}

export function yahooAuctionLink(auctionId: AuctionItem['auctionId']) {
  return `https://page.auctions.yahoo.co.jp/jp/auction/${auctionId}`;
}

export function letaoLink(auctionId: AuctionItem['auctionId']) {
  return `https://www.letao.com.tw/yahoojp/auctions/item.php?aID=${auctionId}`;
}
