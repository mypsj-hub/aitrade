'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import type { PortfolioSummary } from '@/lib/types';
import { format } from 'date-fns';

interface Props {
  data: PortfolioSummary[];
}

async function fetchInitialAsset(): Promise<number> {
  const { data } = await supabase
    .from('system_status')
    .select('status_value')
    .eq('status_key', 'initial_total_asset')
    .single();

  return data ? parseFloat(data.status_value) : 10000000;
}

export function PerformanceChart({ data }: Props) {
  const { data: initialAsset } = useSWR('initial_total_asset', fetchInitialAsset);

  if (data.length === 0) {
    return <p className="text-slate-500 text-center py-8">차트 데이터가 없습니다.</p>;
  }

  const chartData = data.map((item) => ({
    date: format(new Date(item.날짜), 'MM/dd'),
    총자산: item.총포트폴리오가치,
    원본날짜: item.날짜,
  }));

  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(2)}M`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
          <p className="text-sm text-slate-600">{payload[0].payload.원본날짜}</p>
          <p className="text-sm font-bold text-blue-600">
            총자산: {payload[0].value.toLocaleString('ko-KR')}원
          </p>
          {initialAsset && (
            <p className="text-xs text-slate-500">
              초기자산 대비: {((payload[0].value - initialAsset) / initialAsset * 100).toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        {initialAsset && (
          <ReferenceLine
            y={initialAsset}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            label={{ value: '초기자산', position: 'right', fontSize: 10, fill: '#64748b' }}
          />
        )}
        <Line
          type="monotone"
          dataKey="총자산"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
