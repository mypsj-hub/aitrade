'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import type { Trade } from '@/lib/types';

interface PerformanceTrendChartProps {
  trades: Trade[];
}

interface DailyPerformance {
  date: string;
  cumulativeProfit: number;
  cumulativeProfitManwon: number;
  dailyProfit: number;
  tradeCount: number;
  displayDate: string;
}

export function PerformanceTrendChart({ trades }: PerformanceTrendChartProps) {
  const dailyData = useMemo<DailyPerformance[]>(() => {
    // 청산 거래만 필터링
    const closedTrades = trades
      .filter((t) => t.수익금 !== null)
      .sort((a, b) => new Date(a.거래일시).getTime() - new Date(b.거래일시).getTime());

    if (closedTrades.length === 0) return [];

    // 날짜별 그룹핑
    const dailyMap = new Map<string, { profit: number; count: number }>();

    closedTrades.forEach((trade) => {
      const dateKey = format(new Date(trade.거래일시), 'yyyy-MM-dd');
      const existing = dailyMap.get(dateKey) || { profit: 0, count: 0 };
      dailyMap.set(dateKey, {
        profit: existing.profit + (trade.수익금 || 0),
        count: existing.count + 1,
      });
    });

    // 누적 손익 계산
    let cumulative = 0;
    const result: DailyPerformance[] = [];

    Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([dateKey, { profit, count }]) => {
        cumulative += profit;
        result.push({
          date: dateKey,
          cumulativeProfit: Math.round(cumulative),
          cumulativeProfitManwon: Math.round(cumulative / 10000), // 만원 단위
          dailyProfit: Math.round(profit),
          tradeCount: count,
          displayDate: format(new Date(dateKey), 'MM/dd'),
        });
      });

    return result;
  }, [trades]);

  // Y축 포맷터 - 값은 이미 만원 단위
  const formatYAxis = (value: number) => {
    return `${Math.round(value).toLocaleString('ko-KR')}`;
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      payload: DailyPerformance;
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
          <p className="text-sm font-semibold text-slate-700 mb-2">{data.date}</p>
          <p className="text-sm text-blue-600">
            누적 손익: <span className="font-bold">{data.cumulativeProfit.toLocaleString('ko-KR')}원</span>
          </p>
          <p className="text-xs text-slate-500">
            = {data.cumulativeProfitManwon.toLocaleString('ko-KR')}만원
          </p>
          <p className="text-sm text-slate-600 mt-1">
            일일 손익: {data.dailyProfit >= 0 ? '+' : ''}{data.dailyProfit.toLocaleString('ko-KR')}원
          </p>
          <p className="text-xs text-slate-500 mt-1">거래 {data.tradeCount}건</p>
        </div>
      );
    }
    return null;
  };

  if (dailyData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-slate-500">
        청산된 거래가 없어 데이터를 표시할 수 없습니다.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: 12, fill: '#64748b' }}
          stroke="#94a3b8"
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12, fill: '#64748b' }}
          stroke="#94a3b8"
          label={{
            value: '누적 손익 (만원)',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 12, fill: '#64748b' },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 14 }}
          iconType="line"
        />
        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="cumulativeProfitManwon"
          name="누적 실현 손익"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3, fill: '#2563eb' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
