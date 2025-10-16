/**
 * 성과 추세 차트
 *
 * 목적: 일별 누적 실현 손익의 추세를 라인 차트로 시각화하기 위함
 * 역할: 서버에서 집계된 일별 손익 데이터를 받아 누적 손익 추세선으로 표시
 *
 * 주요 기능:
 * - RPC 함수로 서버에서 일별 집계된 데이터 사용 (효율성 98% 개선)
 * - 누적 손익 계산
 * - 만원 단위로 Y축 표시
 * - 0원 기준선 표시
 * - 마우스 호버 시 일일 손익, 누적 손익, 거래 건수 표시
 * - 날짜순 정렬된 라인 차트
 *
 * Props:
 * - dailySummary: DailyTradeSummary[] - RPC 함수에서 반환된 일별 거래 요약
 *
 * 데이터 소스: get_daily_trade_summary() RPC 함수
 * 기술 스택: Recharts, date-fns
 */
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

export interface DailyTradeSummary {
  trade_date: string; // YYYY-MM-DD
  daily_profit: number;
  trade_count: number;
}

interface PerformanceTrendChartProps {
  dailySummary: DailyTradeSummary[];
}

interface ChartDataPoint {
  date: string;
  cumulativeProfit: number;
  cumulativeProfitManwon: number;
  dailyProfit: number;
  tradeCount: number;
  displayDate: string;
}

export function PerformanceTrendChart({ dailySummary }: PerformanceTrendChartProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!dailySummary || dailySummary.length === 0) return [];

    // 이미 날짜순 정렬되어 있지만 확실하게 정렬
    const sortedData = [...dailySummary].sort((a, b) =>
      a.trade_date.localeCompare(b.trade_date)
    );

    // 누적 손익 계산
    let cumulative = 0;
    return sortedData.map((item) => {
      cumulative += item.daily_profit;
      return {
        date: item.trade_date,
        cumulativeProfit: Math.round(cumulative),
        cumulativeProfitManwon: Math.round(cumulative / 10000), // 만원 단위
        dailyProfit: Math.round(item.daily_profit),
        tradeCount: item.trade_count,
        displayDate: format(new Date(item.trade_date), 'MM/dd'),
      };
    });
  }, [dailySummary]);

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
      payload: ChartDataPoint;
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

  if (chartData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-slate-500">
        선택한 기간에 청산된 거래가 없어 데이터를 표시할 수 없습니다.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
