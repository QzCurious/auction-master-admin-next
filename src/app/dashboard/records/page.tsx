import { type Metadata } from 'next';
import { GetAuctionItem } from '@/api/backend/auction-items/GetAuctionItem';
import { type AuctionItem } from '@/api/backend/auction-items/GetAuctionItems';
import { AdminGetConsignor } from '@/api/backend/consignor/AdminGetConsignor';
import { type Consignor } from '@/api/backend/consignor/AdminGetConsignors';
import { GetItemAndDetails } from '@/api/backend/items/GetItemAndDetails';
import { GetRecords, type Record } from '@/api/backend/reports/GetRecords';
import { GetRecordsSummary, type RecordSummary } from '@/api/backend/reports/GetRecordsSummary';
import { HandleApiError } from '@/domain/api/HandleApiError';
import AuctionItemPreviewPopover from '@/domain/crud/AuctionItemPreviewPopover';
import { ConsignorFilter } from '@/domain/crud/ConsignorFilter';
import ItemPreviewPopover from '@/domain/crud/ItemPreviewPopover';
import { parseSearchParams } from '@/domain/crud/parseSearchParams';
import { RangeFilter } from '@/domain/crud/RangeFilter';
import RemoveSearchBtn from '@/domain/crud/RemoveSearchBtn';
import { SearchParamsPagination } from '@/domain/crud/SearchParamsPagination';
import { PermissionsGuard } from '@/domain/permission/havePermissions.server';
import { HavePermissionsOnly } from '@/domain/permission/HavePermissionsOnly';
import {
  currencySign,
  DATE_TIME_FORMAT,
  letaoItemLink,
  PAGE,
  ROWS_PER_PAGE,
  SITE_NAME,
  yahooAuctionLink,
} from '@/domain/static/static';
import { RECORD_STATUS, RECORD_TYPE } from '@/domain/static/static-config-mappers';
import LaunchOutlinedIcon from '@mui/icons-material/LaunchOutlined';
import { Chip, Link, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography/Typography';
import { StackSimple } from '@phosphor-icons/react/dist/ssr/StackSimple';
import { format } from 'date-fns';
import { Provider } from 'jotai';

import EmptyTableRow from '@/components/EmptyTableRow';

import CopyButton from '../../../components/CopyButton';
import { ReviewSubmitPaymentButtons } from './ReviewSubmitPaymentButtons';
import { fixRange, MAX_MONTHS, SearchParamsSchema } from './SearchParamsSchema';
import { StatusFilter } from './StatusFilter';
import { TypeFilter } from './TypeFilter';

export const metadata = { title: `交易紀錄 | ${SITE_NAME}` } satisfies Metadata;

interface PageProps {
  searchParams: { [k in string]: string | string[] | undefined };
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

      <PermissionsGuard permissions={['GetRecords', 'GetRecordsSummary']}>
        <section>
          <Content {...pageProps} />
        </section>
      </PermissionsGuard>
    </Stack>
  );
}

async function Content({ searchParams }: PageProps) {
  const filters = parseSearchParams(SearchParamsSchema, searchParams);
  const { startAt, endAt } = fixRange(filters.startAt, filters.endAt);

  const [summaryRes, recordsRes] = await Promise.all([
    GetRecordsSummary({
      consignorId: filters.consignorId,
      type: filters.type,
      status: filters.status,
      endAt,
      startAt,
    }),
    GetRecords({
      consignorId: filters.consignorId,
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

  if (summaryRes.error) {
    return <HandleApiError error={summaryRes.error} />;
  }
  if (recordsRes.error) {
    return <HandleApiError error={recordsRes.error} />;
  }

  return (
    <Provider>
      <Stack spacing={3}>
        <Stack direction="row" flexWrap="wrap" gap={2}>
          <ConsignorFilter consignorId={filters.consignorId} />
          <RangeFilter startAt={filters.startAt} endAt={filters.endAt} within={{ months: MAX_MONTHS }} />
          <TypeFilter selected={filters.type} />
          <StatusFilter selected={filters.status} />
          <RemoveSearchBtn<keyof typeof filters> fields={['consignorId', 'startAt', 'endAt', 'type', 'status']} />
        </Stack>

        <ReportSummeryTable summary={summaryRes.data} />

        <Card>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow sx={{ whiteSpace: 'nowrap' }}>
                  <TableCell>類型</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell>細節</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recordsRes.data.records.length === 0 && <EmptyTableRow />}
                {recordsRes.data.records.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell
                      title={process.env.NODE_ENV === 'development' ? `${row.type} ${RECORD_TYPE.enum(row.type)}` : ''}
                    >
                      {RECORD_TYPE.get('value', row.type).message}
                      <AllKindsOfLinks row={row} />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Chip size="small" label={RECORD_STATUS.get('value', row.status).message} />

                        {row.status === RECORD_STATUS.enum('SubmitPaymentStatus') &&
                          (function iife() {
                            switch (row.type) {
                              case RECORD_TYPE.enum('WithdrawalType'):
                                if (row.consignorId == null)
                                  return (
                                    <Typography color="error">
                                      發生錯誤，請聯繫開發人員(#{row.id} missing consignorId)
                                    </Typography>
                                  );
                                return (
                                  <HavePermissionsOnly permissions={['AdminGetConsignor', 'RecordPaymentReview']}>
                                    <Box>
                                      <p>
                                        <ConsignorBankInfo consignorId={row.consignorId} />
                                        <br />
                                        匯款金額:{' '}
                                        <Typography component="span" variant="body2" color="primary">
                                          {currencySign('TWD')}
                                          {row.withdrawal}
                                        </Typography>
                                      </p>
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
                                  </HavePermissionsOnly>
                                );
                              case RECORD_TYPE.enum('PayAuctionItemCancellationFeeType'): {
                                const auctionId = row.auctionIds?.[0];
                                if (!auctionId)
                                  return (
                                    <Typography color="error">
                                      發生錯誤，請聯繫開發人員(#{row.id} missing auctionId)
                                    </Typography>
                                  );
                                return (
                                  <HavePermissionsOnly permissions={['GetAuctionItem', 'RecordPaymentReview']}>
                                    <Box>
                                      <AuctionItemInfo auctionId={auctionId} />
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
                                  </HavePermissionsOnly>
                                );
                              }
                              case RECORD_TYPE.enum('PayYahooAuctionFeeType'): {
                                const auctionId = row.auctionIds?.[0];
                                if (!auctionId)
                                  return (
                                    <Typography color="error">
                                      發生錯誤，請聯繫開發人員(#{row.id} missing auctionId)
                                    </Typography>
                                  );
                                return (
                                  <HavePermissionsOnly permissions={['GetAuctionItem', 'RecordPaymentReview']}>
                                    <Box>
                                      <AuctionItemInfo auctionId={auctionId} />
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
                                  </HavePermissionsOnly>
                                );
                              }
                              case RECORD_TYPE.enum('PayReturnItemFeeType'):
                                if (row.spaceFee == null || row.shippingCost == null)
                                  return (
                                    <Typography color="error">
                                      發生錯誤，請聯繫開發人員(#{row.id} missing spaceFee or shippingCost)
                                    </Typography>
                                  );
                                return (
                                  <HavePermissionsOnly permissions={['RecordPaymentReview']}>
                                    <Box>
                                      <ReviewSubmitPaymentButtons recordId={row.id} />
                                      <span>
                                        請確認
                                        <Typography component="span" variant="body2" color="primary">
                                          收到匯款 {currencySign('TWD')}
                                          {(row.spaceFee + row.shippingCost).toLocaleString()}
                                        </Typography>{' '}
                                        後再執行
                                        <Typography component="span" variant="body2" color="primary">
                                          確認付款
                                        </Typography>
                                        操作
                                      </span>
                                    </Box>
                                  </HavePermissionsOnly>
                                );
                              case RECORD_TYPE.enum('PaySpaceFeeType'):
                                if (row.spaceFee == null)
                                  return (
                                    <Typography color="error">
                                      發生錯誤，請聯繫開發人員(#{row.id} missing spaceFee)
                                    </Typography>
                                  );
                                return (
                                  <HavePermissionsOnly permissions={['RecordPaymentReview']}>
                                    <Box>
                                      <ReviewSubmitPaymentButtons recordId={row.id} />
                                      <span>
                                        請確認
                                        <Typography component="span" variant="body2" color="primary">
                                          收到匯款 {currencySign('TWD')}
                                          {row.spaceFee.toLocaleString()}
                                        </Typography>{' '}
                                        後再執行
                                        <Typography component="span" variant="body2" color="primary">
                                          確認付款
                                        </Typography>
                                        操作
                                      </span>
                                    </Box>
                                  </HavePermissionsOnly>
                                );

                              default:
                                return <Typography color="error">發生錯誤，請聯繫開發人員(unhandled flow)</Typography>;
                            }
                          })()}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ width: 0 }}>
                      <TableContainer sx={{ whiteSpace: 'nowrap' }}>
                        <Table size="small">
                          {/* v5 https://docs.google.com/spreadsheets/d/1S2-9S-AOAJG5a_hHFlA1N6YN1W5LZjpZzptL2UgBj5w/edit?gid=1734093702#gid=1734093702 */}
                          <TableBody
                            sx={{ '& td:nth-child(1)': { width: 0 }, '& td:nth-child(2)': { textAlign: 'end' } }}
                          >
                            {!!row.consignorId && !!row.consignorNickname && (
                              <TableRow>
                                <TableCell>寄售人</TableCell>
                                <TableCell
                                  title={process.env.NODE_ENV === 'development' ? row.consignorId.toString() : ''}
                                >
                                  {row.consignorNickname}
                                  <HavePermissionsOnly permissions={['AdminGetConsignor']}>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      href={`/dashboard/consignors/edit/${row.consignorId}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <LaunchOutlinedIcon fontSize="small" />
                                    </IconButton>
                                  </HavePermissionsOnly>
                                </TableCell>
                              </TableRow>
                            )}
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
                            {row.beneficiaryName != null && (
                              <TableRow>
                                <TableCell>銀行戶名</TableCell>
                                <TableCell>{row.beneficiaryName}</TableCell>
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
                                  {currencySign('TWD')}
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
                                  {currencySign('TWD')}
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
                                  {currencySign('TWD')}
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
  // v6 https://docs.google.com/spreadsheets/d/1S2-9S-AOAJG5a_hHFlA1N6YN1W5LZjpZzptL2UgBj5w/edit?gid=1521339545#gid=1521339545
  return (
    <Box overflow="auto" m={-2} p={2}>
      <Stack
        direction="row"
        alignItems="start"
        spacing={2}
        width="fit-content"
        whiteSpace="nowrap"
        sx={{
          '.MuiCard-root': { flexShrink: 0, py: 0.5 },
          '.MuiTableCell-root:nth-child(2)': { textAlign: 'end' },
        }}
      >
        <Card>
          <Table size="small">
            <TableBody>
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
            </TableBody>
          </Table>
        </Card>
        <Card>
          <Table size="small">
            <TableBody>
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
            </TableBody>
          </Table>
        </Card>
        <Card>
          <Table size="small">
            <TableBody>
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
            </TableBody>
          </Table>
        </Card>
        <Card>
          <Table size="small">
            <TableBody>
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
        </Card>
        <Card>
          <Table size="small">
            <TableBody>
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
            </TableBody>
          </Table>
        </Card>
      </Stack>
    </Box>
  );
}

async function AllKindsOfLinks({ row }: { row: Record }) {
  if (row.auctionIds && row.auctionIds.length > 0) {
    const auctionItemRes = await Promise.all(row.auctionIds.map((x) => GetAuctionItem(x)));
    const itemRes = await Promise.all(
      auctionItemRes.map((x) => (x.data?.itemId ? GetItemAndDetails(x.data.itemId) : null))
    );

    return (
      <Stack sx={{ mt: 0.5 }}>
        {row.auctionIds?.map((auctionId, i) => (
          <Stack key={auctionId} direction="row" spacing={0.5}>
            <div>{itemRes[i]?.data && <ItemPreviewPopover item={itemRes[i].data} />}</div>
            <div>{auctionItemRes[i]?.data && <AuctionItemPreviewPopover auctionItem={auctionItemRes[i].data} />}</div>
            <Box sx={{ ml: 0.5 }}>
              <Link color="primary" href={yahooAuctionLink(auctionId)} target="_blank" rel="noreferrer">
                <span title="日拍物品代碼">{auctionId}</span>
              </Link>
            </Box>
          </Stack>
        ))}
      </Stack>
    );
  }

  if (row.itemIds && row.itemIds.length > 0) {
    const itemRes = await Promise.all(row.itemIds.map((x) => GetItemAndDetails(x)));

    return (
      <Stack sx={{ mt: 0.5 }}>
        {row.itemIds?.map((itemId, i) => (
          <Stack key={itemId} direction="row" spacing={1.5}>
            <div>
              {itemRes[i]?.data && (
                <Link
                  title={itemRes[i].data.name}
                  href={`/dashboard/items/edit/${itemRes[i].data.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <StackSimple fontSize="large" />
                </Link>
              )}
            </div>
          </Stack>
        ))}
      </Stack>
    );
  }

  return null;
}

async function AuctionItemInfo({ auctionId }: { auctionId: AuctionItem['auctionId'] }) {
  const [auctionItemRes] = await Promise.all([GetAuctionItem(auctionId)]);

  if (!auctionItemRes.data) return null;

  // if (auctionItemRes.error === '1001') {
  //   return <WithoutPermissionsError permissions={['GetAuctionItem']} />;
  // }

  // if (auctionItemRes.error === '1003') {
  //   return <RedirectAuthError />;
  // }

  // if (auctionItemRes.error === '21') {
  //   return <Typography color="error">無法取得商品資訊</Typography>;
  // }

  return (
    <HavePermissionsOnly permissions={['GetAuctionItem']}>
      <div>
        <p>
          商品編號:{' '}
          <a href={letaoItemLink(auctionItemRes.data.auctionId)} target="_blank" rel="noreferrer">
            {auctionItemRes.data.auctionId}
          </a>
        </p>
      </div>
    </HavePermissionsOnly>
  );
}

async function ConsignorBankInfo({ consignorId }: { consignorId: Consignor['id'] }) {
  const [consignorRes] = await Promise.all([AdminGetConsignor(consignorId)]);

  if (!consignorRes.data) return null;

  // if (consignorRes.error === '1001') {
  //   return <WithoutPermissionsError permissions={['AdminGetConsignor']} />;
  // }

  // if (consignorRes.error === '1003') {
  //   return <RedirectAuthError />;
  // }

  return (
    <HavePermissionsOnly permissions={['AdminGetConsignor']}>
      銀行戶名: {consignorRes.data.beneficiaryName}
      <CopyButton text={consignorRes.data.beneficiaryName ?? ''} />
      <br />
      銀行帳戶: ({consignorRes.data.bankCode}) {consignorRes.data.bankAccount}
      <CopyButton text={consignorRes.data.bankAccount} />
    </HavePermissionsOnly>
  );
}
