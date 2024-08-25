'use client';

import { useEffect, useState } from 'react';
import { type GetReports, type Report, type Reports } from '@/api/backend/reports/GetReports';
import { GetReportsQueryOptions } from '@/api/backend/reports/GetReports.query';
import { DATE_FORMAT } from '@/static';
import {
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import { DateTimePicker } from '@mui/x-date-pickers';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { addMonths, closestTo, format, startOfDay, subDays, subHours, subMonths } from 'date-fns';
import { Line } from 'react-chartjs-2';

import RedirectAuthError from '@/components/RedirectAuthError';

Chart.register(CategoryScale, Legend, Tooltip, CategoryScale, LinearScale, LineController, LineElement, PointElement);

type Slice = '1h' | '1d';

const colors: Array<Record<'borderColor' | 'backgroundColor', `rgba(${string})`>> = [
  { borderColor: 'rgba(255, 99, 132, 1)', backgroundColor: 'rgba(255, 99, 132, 0.2)' },
  { borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)' },
  { borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)' },
  { borderColor: 'rgba(153, 102, 255, 1)', backgroundColor: 'rgba(153, 102, 255, 0.2)' },
  { borderColor: 'rgba(255, 159, 64, 1)', backgroundColor: 'rgba(255, 159, 64, 0.2)' },
  { borderColor: 'rgba(255, 206, 86, 1)', backgroundColor: 'rgba(255, 206, 86, 0.2)' },
  { borderColor: 'rgba(0, 128, 128, 1)', backgroundColor: 'rgba(0, 128, 128, 0.2)' },
  { borderColor: 'rgba(60, 179, 113, 1)', backgroundColor: 'rgba(60, 179, 113, 0.2)' },
  { borderColor: 'rgba(218, 112, 214, 1)', backgroundColor: 'rgba(218, 112, 214, 0.2)' },
  { borderColor: 'rgba(70, 130, 180, 1)', backgroundColor: 'rgba(70, 130, 180, 0.2)' },
] as const;

const MAX_MONTHS = 3;

function isValidInterval(startAt: Date, endAt: Date) {
  return startAt && endAt && startAt <= endAt && addMonths(startAt, MAX_MONTHS) >= endAt;
}

export default function ReportsChart() {
  const [endAt, setEndAt] = useState(() => subHours(new Date(), 1));
  const [startAt, setStartAt] = useState(() => startOfDay(subDays(endAt, 7)));
  const [type, setType] = useState<keyof Reports>('JPY');
  const [slice, setSlice] = useState<Slice>('1d');

  const [range, setRange] = useState({ startAt, endAt });
  useEffect(() => {
    if (isValidInterval(startAt, endAt)) {
      setRange({ startAt, endAt });
    }
  }, [endAt, startAt]);

  return (
    <Card>
      <CardHeader title="Reports" />
      <CardContent>
        <Stack direction="row" spacing={3}>
          <DateTimePicker
            value={startAt}
            onAccept={(v) => (v ? setStartAt(v) : undefined)}
            label="起始時間"
            format="yyyy/MM/dd HH:00"
            minDateTime={endAt ? subMonths(endAt, 3) : undefined}
            maxDateTime={endAt ?? new Date()}
            slotProps={{ field: { readOnly: true } }}
            ampm={false}
            views={['year', 'month', 'day', 'hours']}
          />

          <DateTimePicker
            value={endAt}
            onAccept={(v) => (v ? setEndAt(v) : undefined)}
            label="結束時間"
            format="yyyy/MM/dd HH:00"
            minDateTime={startAt ?? undefined}
            maxDateTime={
              startAt
                ? closestTo(startAt, [addMonths(startAt, MAX_MONTHS), subHours(new Date(), 1)])
                : subHours(new Date(), 1)
            }
            slotProps={{ field: { readOnly: true } }}
            ampm={false}
            views={['year', 'month', 'day', 'hours']}
          />

          <Select value={type} onChange={(e) => setType(e.target.value as 'JPY' | 'TWD')}>
            <MenuItem value="JPY">JPY</MenuItem>
            <MenuItem value="TWD">TWD</MenuItem>
          </Select>

          <ToggleButtonGroup exclusive value={slice} onChange={(_, v) => setSlice(v as '1h' | '1d')}>
            <ToggleButton value="1h">1h</ToggleButton>
            <ToggleButton value="1d">1d</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Content type={type} startAt={range.startAt} endAt={range.endAt} slice={slice} />
      </CardContent>
    </Card>
  );
}

const LABEL_MAP = {
  totalClosedPrice: '真實結標的總金額',
  totalPrice: '計算給寄售人的總金額',
  totalDirectPurchasePrice: '公司直購總金額',
  totalPurchasedPrice: '公司買回總金額',
  totalYahooFee: '日拍總手續費',
  totalCommission: '平台總手續費',
  totalBonus: '總回饋',
  totalProfit: '總損益',
  totalSpaceFee: '總留倉費',
  totalShippingCost: '總運費',
} as const;

const mapBy: Record<keyof Reports, Array<keyof Report>> = {
  JPY: [
    'totalClosedPrice',
    'totalPrice',
    'totalDirectPurchasePrice',
    'totalPurchasedPrice',
    'totalYahooFee',
    'totalCommission',
    'totalBonus',
    'totalProfit',
    'totalSpaceFee',
    'totalShippingCost',
  ],
  TWD: ['totalYahooFee', 'totalCommission', 'totalBonus', 'totalSpaceFee', 'totalShippingCost'],
};

function Content({
  type,
  startAt,
  endAt,
  slice,
}: {
  type: keyof typeof mapBy;
  startAt: Date;
  endAt: Date;
  slice: Slice;
}) {
  const crossYears = startAt.getFullYear() !== endAt.getFullYear();
  const { data, isPending, error, isFetching } = useQuery({
    ...GetReportsQueryOptions({ startAt, endAt }),
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    select: (data) => {
      if (slice === '1d' && data.data) {
        return {
          ...data,
          data: aggregateReportsByDate(data.data),
        };
      }
      return data;
    },
  });

  if (error) return null;
  if (isPending) return <Box mt={3}>Loading...</Box>;
  if (data.error) return <RedirectAuthError />;

  return (
    <Box mt={3} sx={{ position: 'relative' }}>
      {isFetching && (
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)', borderRadius: 1 }}
        >
          <CircularProgress />
        </Stack>
      )}
      <Line
        options={{
          responsive: true,
          scales: {
            y: { min: 0 },
          },
          plugins: {
            legend: {
              position: 'top',
            },
          },
        }}
        data={{
          labels: data.data.map((r) =>
            format(r.reportAt, `${crossYears ? 'yyyy-' : ''}MM-dd ${slice === '1h' ? 'HH:mm' : ''}`)
          ),
          datasets: mapBy[type].map((key, i) => ({
            label: LABEL_MAP[key],
            data: data.data.map((r) => r.reports[type][key]),
            ...colors[i],
          })),
        }}
      />
    </Box>
  );
}

function aggregateReportsByDate(data: NonNullable<Awaited<ReturnType<typeof GetReports>>['data']>) {
  const aggregatedReports: Record<string, { reportAt: string; reports: Required<Reports> }> = {};
  for (const d of data) {
    const reportAt = format(new Date(d.reportAt), DATE_FORMAT);
    if (!aggregatedReports[reportAt]) {
      aggregatedReports[reportAt] = { reportAt, reports: structuredClone(d.reports) };
      continue;
    }

    for (const _currency of Object.keys(aggregatedReports[reportAt].reports)) {
      const currency = _currency as keyof Reports;

      for (const _key of Object.keys(aggregatedReports[reportAt].reports[currency])) {
        const key = _key as keyof Report;

        aggregatedReports[reportAt].reports[currency][key] += d.reports[currency][key];
      }
    }
  }
  return Object.values(aggregatedReports);
}

// Example usage: ----------------------------------------------------------
const sampleData = [
  {
    id: 'aaa',
    reports: {
      JPY: {
        totalClosedPrice: 1,
        totalPrice: 1,
        totalDirectPurchasePrice: 1,
        totalPurchasedPrice: 1,
        totalYahooFee: 1,
        totalCommission: 1,
        totalBonus: 1,
        totalProfit: 1,
        totalSpaceFee: 1,
        totalShippingCost: 1,
      },
      TWD: {
        totalClosedPrice: 2,
        totalPrice: 2,
        totalDirectPurchasePrice: 2,
        totalPurchasedPrice: 2,
        totalYahooFee: 2,
        totalCommission: 2,
        totalBonus: 2,
        totalProfit: 2,
        totalSpaceFee: 2,
        totalShippingCost: 2,
      },
    },
    reportAt: '2023-04-01T00:00:00Z',
    createdAt: '2023-04-01T12:00:00Z',
  },
  {
    id: 'bbb',
    reports: {
      JPY: {
        totalClosedPrice: 1,
        totalPrice: 1,
        totalDirectPurchasePrice: 1,
        totalPurchasedPrice: 1,
        totalYahooFee: 1,
        totalCommission: 1,
        totalBonus: 1,
        totalProfit: 1,
        totalSpaceFee: 1,
        totalShippingCost: 1,
      },
      TWD: {
        totalClosedPrice: 2,
        totalPrice: 2,
        totalDirectPurchasePrice: 2,
        totalPurchasedPrice: 2,
        totalYahooFee: 2,
        totalCommission: 2,
        totalBonus: 2,
        totalProfit: 2,
        totalSpaceFee: 2,
        totalShippingCost: 2,
      },
    },
    reportAt: '2023-04-01T01:00:00Z',
    createdAt: '2023-04-01T12:00:00Z',
  },
];

const result = aggregateReportsByDate(sampleData);
// console.log(result);
