/**
 * 포트폴리오 구성
 *
 * 목적: 포트폴리오의 자산 구성 비율을 도넛 차트로 시각화하기 위함
 * 역할: 원화와 코인의 비율을 파이 차트로 표시하고 상세 금액 정보 제공
 *
 * 주요 기능:
 * - 원화 잔고와 코인 가치를 도넛 차트로 시각화
 * - 중앙에 총자산 금액 표시 (만원 단위)
 * - 각 항목별 비율(%) 자동 계산 및 표시
 * - 원화: 파란색, 코인: 빨간색으로 구분
 * - 하단에 상세 금액 카드 2개 표시
 * - 5초마다 자동 갱신
 *
 * Props:
 * - selectedDate: Date - 조회할 날짜
 *
 * 데이터 소스: portfolio_summary 테이블
 * 기술 스택: Recharts, SWR, Supabase, date-fns
 */
'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface CompositionData {
  cashBalance: number;
  coinValue: number;
  totalAsset: number;
}

// Supabase 원본 데이터를 타입 안전한 형태로 변환
function transformCompositionData(raw: Record<string, unknown>): CompositionData {
  return {
    cashBalance: typeof raw['원화잔고'] === 'number' ? raw['원화잔고'] : 0,
    coinValue: typeof raw['총코인가치'] === 'number' ? raw['총코인가치'] : 0,
    totalAsset: typeof raw['총순자산'] === 'number' ? raw['총순자산'] : 0,
  };
}

async function fetchCompositionByDate(selectedDate: Date): Promise<CompositionData | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // 날짜 컬럼이 timestamp 타입이므로 날짜 범위로 검색
  const startOfDay = `${dateString}T00:00:00`;
  const endOfDay = `${dateString}T23:59:59`;

  const { data: rawDataArray, error } = await supabase
    .from('portfolio_summary')
    .select('*')
    .gte('날짜', startOfDay)
    .lte('날짜', endOfDay)
    .order('날짜', { ascending: false })
    .limit(1);

  if (error || !rawDataArray || rawDataArray.length === 0) return null;

  return transformCompositionData(rawDataArray[0] as Record<string, unknown>);
}

const COLORS = {
  cash: '#3b82f6', // 파랑 (원화)
  coin: '#ef4444', // 빨강 (코인)
};

interface PortfolioCompositionProps {
  selectedDate: Date;
}

export function PortfolioComposition({ selectedDate }: PortfolioCompositionProps) {
  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<CompositionData | null>(
    ['portfolio-composition', dateKey],
    () => dateKey !== 'invalid-date' ? fetchCompositionByDate(selectedDate) : null,
    { refreshInterval: 5000 } // 5초 간격 갱신
  );

  // 도넛 차트 데이터
  const chartData = useMemo(() => {
    if (!data) return [];

    const total = data.cashBalance + data.coinValue;
    if (total === 0) return [];

    return [
      {
        name: '원화',
        value: data.cashBalance,
        percentage: ((data.cashBalance / total) * 100).toFixed(1),
      },
      {
        name: '코인',
        value: data.coinValue,
        percentage: ((data.coinValue / total) * 100).toFixed(1),
      },
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 포트폴리오 구성</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-slate-100 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-100 rounded"></div>
            <div className="h-4 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 포트폴리오 구성</h2>
        <p className="text-slate-500 text-sm">포트폴리오 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">📊 포트폴리오 구성</h2>

      {/* 도넛 차트 */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label={({ name, percentage }) => `${name} ${percentage}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.cash : COLORS.coin} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => {
                const itemData = chartData.find(d => d.name === value);
                return (
                  <span className="text-sm text-slate-700">
                    {value} {itemData ? `${(itemData.value / 10000).toFixed(1)}만원` : ''}
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* 중앙 총자산 표시 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-2xl font-bold text-slate-800">
            {(data.totalAsset / 10000).toFixed(0)}
          </div>
          <div className="text-xs text-slate-500">총자산 (만원)</div>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-sm font-medium text-slate-700">원화 잔고</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900">
              {(data.cashBalance / 10000).toFixed(1)}만원
            </div>
            <div className="text-xs text-slate-500">
              {chartData[0]?.percentage}%
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm font-medium text-slate-700">코인 가치</span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-900">
              {(data.coinValue / 10000).toFixed(1)}만원
            </div>
            <div className="text-xs text-slate-500">
              {chartData[1]?.percentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
