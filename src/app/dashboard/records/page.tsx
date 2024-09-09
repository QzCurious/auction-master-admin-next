import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { GetAuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { AdminGetConsignor, type Consignor } from '@/api/backend/consignor/AdminGetConsignor';
import { GetRecords } from '@/api/backend/reports/GetRecords';
import { GetRecordsSummary, type RecordSummary } from '@/api/backend/reports/GetRecordsSummary';
import { RECORD_STATUS, RECORD_TYPE } from '@/api/backend/static-configs.data';
import { getUser } from '@/api/getToken';
import { parseSearchParams } from '@/helper/parseSearchParams';
import { currencySign, DATE_TIME_FORMAT, PAGE, ROWS_PER_PAGE } from '@/static';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import {
  CardHeader,
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography/Typography';
import { Box, Stack } from '@mui/system';
import { format } from 'date-fns';
import { Provider } from 'jotai';

import { config } from '@/config';
import { HavePermissionsOnly } from '@/contexts/UserContext';
import EmptyTableRow from '@/components/EmptyTableRow';
import RedirectAuthError from '@/components/RedirectAuthError';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

import CopyButton from '../../../components/CopyButton';
import Filters from './Filters';
import { ReviewSubmitPaymentButtons } from './ReviewSubmitPaymentButtons';
import { fixRange, SearchParamsSchema } from './SearchParamsSchema';

export const metadata = { title: `交易紀錄 | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function Page(pageProps: PageProps) {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={2} direction="row" justifyContent="space-between" sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4" sx={{ flexShrink: 0 }}>
            交易紀錄
          </Typography>
        </Stack>
      </Stack>

      <section>
        <Content {...pageProps} />
      </section>
    </Stack>
  );
}

async function Content({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);
  const { wasValid, startAt, endAt } = fixRange(filters.startAt, filters.endAt);
  const user = await getUser();
  if (!user) {
    redirect('/auth/sign-in');
  }

  const [summaryRes, recordsRes] = await Promise.all([
    GetRecordsSummary({
      consignorID: filters.consignorID,
      type: filters.type,
      status: filters.status,
      endAt,
      startAt,
    }),
    GetRecords({
      consignorID: filters.consignorID,
      type: filters.type,
      endAt,
      startAt,
      status: filters.status,
      sort: 'createdAt',
      order: 'desc',
      limit: filters[ROWS_PER_PAGE],
      offset: filters[PAGE] * filters[ROWS_PER_PAGE],
    }),
  ]);

  if (summaryRes.error === '1001' || recordsRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetRecords']} />;
  }

  if (summaryRes.error === '1003' || recordsRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <Provider>
      <Stack spacing={3}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <Filters {...filters} startAt={wasValid ? startAt : undefined} endAt={wasValid ? endAt : undefined} />
        </Stack>

        <Grid container gap={4}>
          <Grid>
            <Card>
              <CardHeader title="總結" />
              <ReportSummeryTable summary={summaryRes.data} />
            </Card>
          </Grid>
        </Grid>

        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow sx={{ whiteSpace: 'nowrap' }}>
                  <TableCell>寄售人</TableCell>
                  <TableCell>類型</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell>細節</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recordsRes.data.records.length === 0 && <EmptyTableRow />}
                {recordsRes.data.records.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell title={process.env.NODE_ENV === 'development' ? row.consignorID.toString() : ''}>
                      <Stack direction="row" alignItems="center">
                        {row.consignorNickname}
                        <HavePermissionsOnly permissionKeys={['AdminGetConsignor']}>
                          <IconButton
                            size="small"
                            color="secondary"
                            href={`/dashboard/consignors/edit/${row.consignorID}`}
                            target="_blank"
                          >
                            <LaunchOutlinedIcon fontSize="small" />
                          </IconButton>
                        </HavePermissionsOnly>
                      </Stack>
                    </TableCell>
                    <TableCell
                      title={process.env.NODE_ENV === 'development' ? `${row.type} ${RECORD_TYPE.enum(row.type)}` : ''}
                    >
                      {RECORD_TYPE.get('value', row.type).message}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Chip size="small" label={RECORD_STATUS.get('value', row.status).message} />

                        {row.status === RECORD_STATUS.enum('SubmitPaymentStatus') &&
                          row.type === RECORD_TYPE.enum('WithdrawalType') && (
                            <Box>
                              <ConsignorBankInfo consignorID={row.consignorID} />
                              <ReviewSubmitPaymentButtons recordId={row.id} />
                              <span>
                                請
                                <Typography component="span" variant="body2" color="primary">
                                  完成匯款
                                </Typography>
                                後再執行
                                <Typography component="span" variant="body2" color="primary">
                                  確認付款
                                </Typography>
                                操作
                              </span>
                            </Box>
                          )}

                        {row.status === RECORD_STATUS.enum('SubmitPaymentStatus') &&
                          row.type === RECORD_TYPE.enum('PayAuctionItemCancellationFeeType') && (
                            <Box>
                              {row.auctionItemID && <AuctionItemInfo auctionItemId={row.auctionItemID} />}
                              <ReviewSubmitPaymentButtons recordId={row.id} />
                              <span>
                                請先確認商品
                                <Typography component="span" variant="body2" color="primary">
                                  已下架
                                </Typography>
                                後再執行
                                <Typography component="span" variant="body2" color="primary">
                                  確認付款
                                </Typography>
                                操作
                              </span>
                            </Box>
                          )}

                        {row.status === RECORD_STATUS.enum('SubmitPaymentStatus') &&
                          row.type === RECORD_TYPE.enum('PayAuctionItemCancellationFeeType') && (
                            <Box>
                              {row.auctionItemID && <AuctionItemInfo auctionItemId={row.auctionItemID} />}
                              <ReviewSubmitPaymentButtons recordId={row.id} />
                              <span>
                                請先確認商品
                                <Typography component="span" variant="body2" color="primary">
                                  已下架
                                </Typography>
                                後再執行
                                <Typography component="span" variant="body2" color="primary">
                                  確認付款
                                </Typography>
                                操作
                              </span>
                            </Box>
                          )}

                        {row.status === RECORD_STATUS.enum('SubmitPaymentStatus') &&
                          row.type === RECORD_TYPE.enum('PayYahooAuctionFeeType') && (
                            <Box>
                              {row.auctionItemID && <AuctionItemInfo auctionItemId={row.auctionItemID} />}
                              <ReviewSubmitPaymentButtons recordId={row.id} />
                              <span>
                                請先確認商品
                                <Typography component="span" variant="body2" color="primary">
                                  已上架
                                </Typography>
                                後再執行
                                <Typography component="span" variant="body2" color="primary">
                                  確認付款
                                </Typography>
                                操作
                              </span>
                            </Box>
                          )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ width: 0 }}>
                      <TableContainer sx={{ whiteSpace: 'nowrap' }}>
                        <Table size="small">
                          {/* v5 https://docs.google.com/spreadsheets/d/1S2-9S-AOAJG5a_hHFlA1N6YN1W5LZjpZzptL2UgBj5w/edit?gid=1734093702#gid=1734093702 */}
                          <TableBody sx={{ '& td:nth-child(2)': { textAlign: 'end' } }}>
                            <TableRow>
                              <TableCell>操作代碼</TableCell>
                              <TableCell>{row.opCode}</TableCell>
                            </TableRow>
                            {row.exchangeRate != null && (
                              <TableRow>
                                <TableCell>匯率</TableCell>
                                <TableCell>{row.exchangeRate}</TableCell>
                              </TableRow>
                            )}
                            {row.jpyWithdrawal != null && (
                              <TableRow>
                                <TableCell>日幣提款金額</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.jpyWithdrawal.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.withdrawal != null && (
                              <TableRow>
                                <TableCell>提款金額</TableCell>
                                <TableCell>
                                  {currencySign('TWD')}
                                  {row.withdrawal.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.withdrawalTransferFee != null && (
                              <TableRow>
                                <TableCell>提款手續費</TableCell>
                                <TableCell>
                                  {currencySign('TWD')}
                                  {row.withdrawalTransferFee.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.bankCode != null && (
                              <TableRow>
                                <TableCell>銀行代碼</TableCell>
                                <TableCell>{row.bankCode}</TableCell>
                              </TableRow>
                            )}
                            {row.bankAccount != null && (
                              <TableRow>
                                <TableCell>銀行帳號</TableCell>
                                <TableCell>{row.bankAccount}</TableCell>
                              </TableRow>
                            )}
                            {row.closedPrice != null && (
                              <TableRow>
                                <TableCell>結標金額</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.closedPrice}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.price != null && (
                              <TableRow>
                                <TableCell>計算金額</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.price}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.directPurchasePrice != null && (
                              <TableRow>
                                <TableCell>直購金額</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.directPurchasePrice.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.purchasedPrice != null && (
                              <TableRow>
                                <TableCell>最低買入金額</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.purchasedPrice.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.yahooAuctionFeeJpy != null && (
                              <TableRow>
                                <TableCell>日拍手續費</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.yahooAuctionFeeJpy.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.yahooAuctionFee != null && (
                              <TableRow>
                                <TableCell>日拍手續費</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.yahooAuctionFee.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.commission != null && (
                              <TableRow>
                                <TableCell>平台手續費</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.commission.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.bonus != null && (
                              <TableRow>
                                <TableCell>回饋</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.bonus.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.profit != null && (
                              <TableRow>
                                <TableCell>損益</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.profit.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.shippingCostsWithinJapan != null && (
                              <TableRow>
                                <TableCell>日本國內運費</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.shippingCostsWithinJapan.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.internationalShippingCosts != null && (
                              <TableRow>
                                <TableCell>國際運費</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.internationalShippingCosts.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.yahooCancellationFeeJpy != null && (
                              <TableRow>
                                <TableCell>日拍取消手續費</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.yahooCancellationFeeJpy.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.yahooCancellationFee != null && (
                              <TableRow>
                                <TableCell>日拍取消手續費</TableCell>
                                <TableCell>
                                  {currencySign('TWD')}
                                  {row.yahooCancellationFee.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.spaceFeeJpy != null && (
                              <TableRow>
                                <TableCell>留倉費</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.spaceFeeJpy.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.spaceFee != null && (
                              <TableRow>
                                <TableCell>留倉費</TableCell>
                                <TableCell>
                                  {currencySign('TWD')}
                                  {row.spaceFee.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.shippingCost != null && (
                              <TableRow>
                                <TableCell>運費</TableCell>
                                <TableCell>
                                  {currencySign('JPY')}
                                  {row.shippingCost.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell>時間</TableCell>
                              <TableCell>{format(row.createdAt, DATE_TIME_FORMAT)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow hidden />
              </TableBody>
            </Table>

            <SearchParamsPagination count={recordsRes.data.count} />
          </TableContainer>
        </Card>
      </Stack>
    </Provider>
  );
}

function ReportSummeryTable({ summary }: { summary: RecordSummary }) {
  return (
    <Table size="small">
      {/* v5 https://docs.google.com/spreadsheets/d/1S2-9S-AOAJG5a_hHFlA1N6YN1W5LZjpZzptL2UgBj5w/edit?gid=1734093702#gid=1734093702 */}
      <TableBody sx={{ '&>tr>td:nth-child(2)': { textAlign: 'end' } }}>
        <TableRow>
          <TableCell>提款日幣</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalJpyWithdrawal.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>提款台幣</TableCell>
          <TableCell>
            {currencySign('TWD')}
            {summary.totalWithdrawal.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>提款手續費</TableCell>
          <TableCell>
            {currencySign('TWD')}
            {summary.totalWithdrawalTransferFee.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>結標金額</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalClosedPrice.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>結算金額</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalPrice.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>直購金額</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalDirectPurchasePrice.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>買回金額</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalPurchasedPrice.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>日拍手續費</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalYahooAuctionFeeJpy.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>日拍手續費</TableCell>
          <TableCell>
            {currencySign('TWD')}
            {summary.totalYahooAuctionFee.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>平台手續費</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalCommission.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>回饋金額</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalBonus.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>收益</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalProfit.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>日本國內運費</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalShippingCostsWithinJapan.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>國際運費</TableCell>
          <TableCell>
            {currencySign('TWD')}
            {summary.totalInternationalShippingCosts.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>日拍取消手續費</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalYahooCancellationFeeJpy.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>日拍取消手續費</TableCell>
          <TableCell>
            {currencySign('TWD')}
            {summary.totalYahooCancellationFee.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>留倉費</TableCell>
          <TableCell>
            {currencySign('JPY')}
            {summary.totalSpaceFeeJpy.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>留倉費</TableCell>
          <TableCell>
            {currencySign('TWD')}
            {summary.totalSpaceFee.toLocaleString()}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>運費</TableCell>
          <TableCell>
            {currencySign('TWD')}
            {summary.totalShippingCost.toLocaleString()}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

async function AuctionItemInfo({ auctionItemId }: { auctionItemId: AuctionItem['id'] }) {
  const [auctionItemRes] = await Promise.all([GetAuctionItem(auctionItemId)]);

  if (auctionItemRes.error === '1001') {
    return <WithoutPermissionsError permissions={['GetAuctionItem']} />;
  }

  if (auctionItemRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <div>
      {/* <p>出品帳號: {auctionItemRes.data.sellerName}</p> */}
      <p>
        商品編號:{' '}
        <a
          href={`https://www.letao.com.tw/yahoojp/auctions/item.php?aID=${auctionItemRes.data.auctionID}`}
          target="_blank"
          rel="noreferrer"
        >
          {auctionItemRes.data.auctionID}
        </a>
      </p>
    </div>
  );
}

async function ConsignorBankInfo({ consignorID }: { consignorID: Consignor['id'] }) {
  const [consignorRes] = await Promise.all([AdminGetConsignor(consignorID)]);

  if (consignorRes.error === '1001') {
    return <WithoutPermissionsError permissions={['AdminGetConsignor']} />;
  }

  if (consignorRes.error === '1003') {
    return <RedirectAuthError />;
  }

  return (
    <div>
      <p>
        銀行帳戶: ({consignorRes.data.bankCode}) {consignorRes.data.bankAccount}
        <CopyButton text={consignorRes.data.bankAccount} />
      </p>
    </div>
  );
}
