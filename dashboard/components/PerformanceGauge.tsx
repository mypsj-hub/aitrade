/**
 * 성과 게이지
 *
 * 목적: 선택된 날짜의 포트폴리오 성과를 게이지 차트로 시각적으로 표시하기 위함
 * 역할: 누적수익률을 반원형 게이지로 표시하고 주요 성과 지표 및 포트폴리오 비중 관리 정보 제공
 *
 * 주요 기능:
 * - 누적수익률을 0-20% 범위의 반원형 게이지로 시각화
 * - 수익률에 따른 게이지 색상 변경 (빨강/노랑/초록)
 * - 누적수익률, 승률, 일일수익률 3개 지표 카드 표시
 * - "2. 포트폴리오 비중 관리" 섹션 표시 (시각적 디자인 개선)
 * - 목표 수익률 10% 안내
 * - 총자산을 만원 단위로 표시
 * - 5초마다 자동 갱신
 *
 * Props:
 * - selectedDate: Date - 조회할 날짜
 *
 * 데이터 소스: portfolio_summary, trade_history, cio_reports 테이블
 * 기술 스택: Recharts, SWR, Supabase, date-fns
 */
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
  portfolioAllocation?: string;
}

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
  const dateString = format(selectedDate, 'yyyy-MM-dd');
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

  const { data: reportData } = await supabase
    .from('cio_reports')
    .select('full_content_md')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  let portfolioAllocation = '';
  if (reportData && reportData.length > 0) {
    const fullContentMd = reportData[0].full_content_md || '';
    const regex = /##?\s*3\.\s*최근\s*7일\s*매매\s*성과([\s\S]*?)(?=##?\s*4\.|$)/i;
    const match = fullContentMd.match(regex);

    if (match && match[1]) {
      portfolioAllocation = match[1]
        .replace(/#{1,6}\s*/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^[-*]\s/gm, '• ')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();

      // None 값을 가진 항목 전체를 삭제 (샤프지수, 기타 등)
      portfolioAllocation = portfolioAllocation
        .split('\n')
        .filter(line => !line.match(/:\s*None\s*$/i))
        .join('\n')
        .trim();
    }
  }

  const portfolio = transformPortfolioData(rawPortfolio as Record<string, unknown>);

  return {
    cumulativeReturn: portfolio.cumulativeReturn,
    dailyReturn: portfolio.dailyReturn,
    winRate: Math.round(winRate * 10) / 10,
    totalAsset: portfolio.totalAsset,
    portfolioAllocation,
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
    { refreshInterval: 5000 }
  );

  const gaugeData = useMemo(() => {
    if (!data) return [];

    const targetReturn = 10;
    const currentReturn = Math.max(0, Math.min(data.cumulativeReturn, 20));

    let fill = '#ef4444';
    if (currentReturn >= targetReturn) {
      fill = '#22c55e';
    } else if (currentReturn >= 5) {
      fill = '#eab308';
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

      {data.portfolioAllocation && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 mb-2">📈 최근 7일 매매 성과</h3>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {data.portfolioAllocation}
              </div>
            </div>
          </div>
        </div>
      )}

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

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 text-center border border-red-200">
          <div className="text-xs text-slate-600 font-medium mb-1">누적수익률</div>
          <div className={`text-xl font-bold ${data.cumulativeReturn >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {data.cumulativeReturn >= 0 ? '+' : ''}{data.cumulativeReturn.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center border border-green-200">
          <div className="text-xs text-slate-600 font-medium mb-1">승률</div>
          <div className={`text-xl font-bold ${
            data.winRate >= 60 ? 'text-green-600' :
            data.winRate >= 40 ? 'text-slate-700' :
            'text-red-600'
          }`}>
            {data.winRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-xs text-slate-600 font-medium mb-1">일일수익률</div>
          <div className={`text-xl font-bold ${data.dailyReturn >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            {data.dailyReturn >= 0 ? '+' : ''}{data.dailyReturn.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-slate-500">
        목표 수익률: 10% | 현재 총자산: {(data.totalAsset / 10000).toFixed(0)}만원
      </div>
    </div>
  );
}
