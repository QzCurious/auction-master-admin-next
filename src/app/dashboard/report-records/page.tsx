import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { GetRecords } from '@/api/backend/reports/GetRecords';
import { GetRecordsSummary, Report } from '@/api/backend/reports/GetRecordsSummary';
import { RECORD_STATUS, RECORD_TYPE } from '@/api/backend/static-configs.data';
import { getUser } from '@/api/getToken';
import { currencySign, DATE_TIME_FORMAT, PAGE, parseSearchParams, ROWS_PER_PAGE } from '@/static';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import {
  Card,
  CardHeader,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { Provider } from 'jotai';

import { config } from '@/config';
import { HavePermissionsOnly } from '@/contexts/UserContext';
import EmptyTableRow from '@/components/EmptyTableRow';
import RedirectAuthError from '@/components/RedirectAuthError';
import { SearchParamsPagination } from '@/components/SearchParamsPagination';
import WithoutPermissionsError from '@/components/WithoutPermissionsError/WithoutPermissionsError';

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
              <CardHeader title="JPY" />
              <ReportSummeryTable report={summaryRes.data.JPY} />
            </Card>
          </Grid>

          <Grid>
            <Card>
              <CardHeader title="TWD" />
              <ReportSummeryTable report={summaryRes.data.TWD} />
            </Card>
          </Grid>
        </Grid>

        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow sx={{ whiteSpace: 'nowrap' }}>
                  <TableCell>類型</TableCell>
                  <TableCell>寄售人</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell>細節</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recordsRes.data.records.length === 0 && <EmptyTableRow />}
                {recordsRes.data.records.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell title={row.consignorID.toString()}>
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
                    <TableCell>{RECORD_TYPE.get('value', row.type).message}</TableCell>
                    <TableCell>
                      <Stack sx={{ display: 'inline-flex' }} alignItems="center" spacing={1}>
                        {RECORD_STATUS.get('value', row.status).message}
                        {row.status === RECORD_STATUS.enum('SubmitPaymentStatus') && (
                          <ReviewSubmitPaymentButtons recordId={row.id} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ width: 0 }}>
                      <TableContainer sx={{ whiteSpace: 'nowrap' }}>
                        <Table size="small">
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
                                  {currencySign(row.currency)}
                                  {row.jpyWithdrawal}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.withdrawal != null && (
                              <TableRow>
                                <TableCell>提款金額</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.withdrawal}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.closedPrice != null && (
                              <TableRow>
                                <TableCell>結標金額</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.closedPrice}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.price != null && (
                              <TableRow>
                                <TableCell>計算金額</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.price}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.directPurchasePrice != null && (
                              <TableRow>
                                <TableCell>直購金額</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.directPurchasePrice.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.purchasedPrice != null && (
                              <TableRow>
                                <TableCell>最低買入金額</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.purchasedPrice.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.yahooAuctionFee != null && (
                              <TableRow>
                                <TableCell>日拍手續費</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.yahooAuctionFee.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.commission != null && (
                              <TableRow>
                                <TableCell>平台手續費</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.commission.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.bonus != null && (
                              <TableRow>
                                <TableCell>回饋</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.bonus.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.profit != null && (
                              <TableRow>
                                <TableCell>損益</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.profit.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.yahooCancellationFee != null && (
                              <TableRow>
                                <TableCell>日拍取消手續費</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.yahooCancellationFee.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.spaceFee != null && (
                              <TableRow>
                                <TableCell>留倉費</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
                                  {row.spaceFee.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            )}
                            {row.shippingCost != null && (
                              <TableRow>
                                <TableCell>運費</TableCell>
                                <TableCell>
                                  {currencySign(row.currency)}
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

function ReportSummeryTable({ report }: { report: Report }) {
  return (
    <Table size="small">
      <TableBody sx={{ '&>tr>td:nth-child(2)': { textAlign: 'end' } }}>
        {report.totalJpyWithdrawal != 0 && (
          <TableRow>
            <TableCell>總提取日幣</TableCell>
            <TableCell>{report.totalJpyWithdrawal.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalWithdrawal != 0 && (
          <TableRow>
            <TableCell>總匯出台幣</TableCell>
            <TableCell>{report.totalWithdrawal.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalClosedPrice != 0 && (
          <TableRow>
            <TableCell>總結標金額</TableCell>
            <TableCell>{report.totalClosedPrice.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalPrice != 0 && (
          <TableRow>
            <TableCell>總結算金額</TableCell>
            <TableCell>{report.totalPrice.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalDirectPurchasePrice != 0 && (
          <TableRow>
            <TableCell>總直購金額</TableCell>
            <TableCell>{report.totalDirectPurchasePrice.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalPurchasedPrice != 0 && (
          <TableRow>
            <TableCell>總買回金額</TableCell>
            <TableCell>{report.totalPurchasedPrice.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalYahooAuctionFee != 0 && (
          <TableRow>
            <TableCell>總日拍手續費</TableCell>
            <TableCell>{report.totalYahooAuctionFee.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalCommission != 0 && (
          <TableRow>
            <TableCell>總平台手續費</TableCell>
            <TableCell>{report.totalCommission.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalBonus != 0 && (
          <TableRow>
            <TableCell>總回饋金額</TableCell>
            <TableCell>{report.totalBonus.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalProfit != 0 && (
          <TableRow>
            <TableCell>總收益</TableCell>
            <TableCell>{report.totalProfit.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalYahooCancellationFee != 0 && (
          <TableRow>
            <TableCell>總日拍取消手續費</TableCell>
            <TableCell>{report.totalYahooCancellationFee.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalSpaceFee != 0 && (
          <TableRow>
            <TableCell>總留倉費</TableCell>
            <TableCell>{report.totalSpaceFee.toLocaleString()}</TableCell>
          </TableRow>
        )}
        {report.totalShippingCost != 0 && (
          <TableRow>
            <TableCell>總運費</TableCell>
            <TableCell>{report.totalShippingCost.toLocaleString()}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
