'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface PerformanceData {
  cumulativeReturn: number;
  dailyReturn: number;
  winRate: number;
  totalAsset: number;
}

// Supabase 원본 데이터를 타입 안전한 형태로 변환
function transformPortfolioData(raw: Record<string, unknown>): {
  cumulativeReturn: number;
  dailyReturn: number;
  totalAsset: number;
} {
  return {
    cumulativeReturn: typeof raw['누적수익률'] === 'number' ? raw['누적수익률'] : 0,
    dailyReturn: typeof raw['일일수익률'] === 'number' ? raw['일일수익률'] : 0,
    totalAsset: typeof raw['총순자산'] === 'number' ? raw['총순자산'] : 0,
  };
}

function transformTradeData(raw: Record<string, unknown>): { profitAmount: number } {
  return {
    profitAmount: typeof raw['수익금'] === 'number' ? raw['수익금'] : 0,
  };
}

async function fetchPerformanceDataByDate(selectedDate: Date): Promise<PerformanceData | null> {
  // 1. 선택된 날짜의 포트폴리오 요약 가져오기
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // 날짜 컬럼이 timestamp 타입이므로 날짜 범위로 검색
  const startOfDay = `${dateString}T00:00:00`;
  const endOfDay = `${dateString}T23:59:59`;

  const { data: rawPortfolioArray, error: portfolioError } = await supabase
    .from('portfolio_summary')
    .select('*')
    .gte('날짜', startOfDay)
    .lte('날짜', endOfDay)
    .order('날짜', { ascending: false })
    .limit(1);

  if (portfolioError || !rawPortfolioArray || rawPortfolioArray.length === 0) return null;
  const rawPortfolio = rawPortfolioArray[0];

  // 2. 청산 거래만 필터링하여 승률 계산 (전체 기간)
  const { data: rawTrades, error: tradesError } = await supabase
    .from('trade_history')
    .select('*')
    .in('거래유형', ['AI 익절', 'AI 손절', '긴급청산']);

  let winRate = 0;
  if (!tradesError && rawTrades && rawTrades.length > 0) {
    const trades = rawTrades.map(transformTradeData);
    const winCount = trades.filter((t) => t.profitAmount > 0).length;
    winRate = (winCount / trades.length) * 100;
  }

  const portfolio = transformPortfolioData(rawPortfolio as Record<string, unknown>);

  return {
    cumulativeReturn: portfolio.cumulativeReturn,
    dailyReturn: portfolio.dailyReturn,
    winRate: Math.round(winRate * 10) / 10, // 소수점 1자리
    totalAsset: portfolio.totalAsset,
  };
}

interface PerformanceGaugeProps {
  selectedDate: Date;
}

export function PerformanceGauge({ selectedDate }: PerformanceGaugeProps) {
  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<PerformanceData | null>(
    ['performance-gauge', dateKey],
    () => dateKey !== 'invalid-date' ? fetchPerformanceDataByDate(selectedDate) : null,
    { refreshInterval: 5000 } // 5초 간격 갱신
  );

  // 게이지 차트 데이터
  const gaugeData = useMemo(() => {
    if (!data) return [];

    const targetReturn = 10; // 목표 수익률 10%
    const currentReturn = Math.max(0, Math.min(data.cumulativeReturn, 20)); // 0-20% 범위로 제한

    // 색상 결정
    let fill = '#ef4444'; // 빨강 (손실)
    if (currentReturn >= targetReturn) {
      fill = '#22c55e'; // 초록 (목표 달성)
    } else if (currentReturn >= 5) {
      fill = '#eab308'; // 노랑 (중간)
    }

    return [
      {
        name: '누적수익률',
        value: currentReturn,
        fill,
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 성과 게이지</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-slate-100 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-slate-100 rounded"></div>
            <div className="h-20 bg-slate-100 rounded"></div>
            <div className="h-20 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 성과 게이지</h2>
        <p className="text-slate-500 text-sm">성과 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">📊 성과 게이지</h2>

      {/* 게이지 차트 */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            barSize={20}
            data={gaugeData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              background
              dataKey="value"
            />
            <Legend
              iconSize={0}
              layout="vertical"
              verticalAlign="middle"
              wrapperStyle={{
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                lineHeight: '24px',
              }}
              formatter={() => (
                <div className="text-center">
                  <div className="text-3xl font-bold" style={{ color: gaugeData[0]?.fill || '#ef4444' }}>
                    {data.cumulativeReturn.toFixed(2)}%
                  </div>
                  <div className="text-sm text-slate-500">누적 수익률</div>
                </div>
              )}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* 3개 지표 카드 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 누적수익률 */}
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">누적수익률</div>
          <div className={`text-xl font-bold ${data.cumulativeReturn >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {data.cumulativeReturn >= 0 ? '+' : ''}{data.cumulativeReturn.toFixed(2)}%
          </div>
        </div>

        {/* 승률 */}
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">승률</div>
          <div className={`text-xl font-bold ${
            data.winRate >= 60 ? 'text-green-600' :
            data.winRate >= 40 ? 'text-slate-700' :
            'text-red-600'
          }`}>
            {data.winRate.toFixed(1)}%
          </div>
        </div>

        {/* 일일수익률 */}
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-xs text-slate-500 mb-1">일일수익률</div>
          <div className={`text-xl font-bold ${data.dailyReturn >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {data.dailyReturn >= 0 ? '+' : ''}{data.dailyReturn.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 목표 안내 */}
      <div className="mt-4 text-center text-xs text-slate-500">
        목표 수익률: 10% | 현재 총자산: {(data.totalAsset / 10000).toFixed(0)}만원
      </div>
    </div>
  );
}
