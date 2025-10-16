/**
 * 성과 추이 차트
 *
 * 목적: 포트폴리오의 총자산 변화를 시계열 그래프로 시각화하기 위함
 * 역할: 일별 총자산을 라인 차트로 표시하고 초기자산 대비 성과 비교
 *
 * 주요 기능:
 * - 일별 총자산 데이터를 라인 차트로 시각화
 * - 만원 단위로 Y축 표시하여 가독성 향상
 * - 초기자산 기준선 표시 (Reference Line)
 * - 마우스 호버 시 상세 정보 툴팁 표시
 * - 초기자산 대비 수익률 계산 및 표시
 * - 날짜별 마지막 데이터만 사용하여 중복 제거
 *
 * Props:
 * - data: PortfolioSummary[] - 포트폴리오 요약 데이터 배열
 *
 * 데이터 소스: portfolio_summary 테이블, system_status 테이블 (초기자산)
 * 기술 스택: Recharts, SWR, date-fns
 */
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMemo } from 'react';
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

  // 1일 기준으로 데이터 그룹핑 (날짜별 마지막 값만 사용)
  const dailyData = useMemo(() => {
    const dataMap = new Map<string, { asset: number; date: string }>();

    data.forEach((item) => {
      const dateKey = item.날짜.split('T')[0]; // YYYY-MM-DD 형식
      const currentAsset = item.총포트폴리오가치 || item.총순자산;

      // 같은 날짜의 데이터가 있으면 더 최근 것으로 업데이트
      if (!dataMap.has(dateKey) || item.날짜 > (dataMap.get(dateKey)?.date || '')) {
        dataMap.set(dateKey, { asset: currentAsset, date: item.날짜 });
      }
    });

    return Array.from(dataMap.entries())
      .map(([dateKey, value]) => ({
        date: format(new Date(dateKey), 'MM/dd'),
        총자산만원: Math.round(value.asset / 10000),
        총자산원본: value.asset,
        원본날짜: value.date,
      }))
      .sort((a, b) => new Date(a.원본날짜).getTime() - new Date(b.원본날짜).getTime());
  }, [data]);

  if (dailyData.length === 0) {
    return <p className="text-slate-500 text-center py-8">차트 데이터가 없습니다.</p>;
  }

  const initialAssetManwon = initialAsset ? Math.round(initialAsset / 10000) : 1000;

  // Y축 포맷터 - 값은 이미 만원 단위
  const formatYAxis = (value: number) => {
    return `${Math.round(value).toLocaleString('ko-KR')}`;
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { 총자산원본: number; 원본날짜: string } }> }) => {
    if (active && payload && payload.length) {
      const totalAsset = payload[0].payload.총자산원본;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
          <p className="text-sm text-slate-600">{payload[0].payload.원본날짜}</p>
          <p className="text-sm font-bold text-blue-600">
            총자산: {totalAsset.toLocaleString('ko-KR')}원
          </p>
          <p className="text-xs text-slate-500">
            = {payload[0].value.toLocaleString('ko-KR')}만원
          </p>
          {initialAsset && (
            <p className="text-xs text-slate-500">
              초기자산 대비: {((totalAsset - initialAsset) / initialAsset * 100).toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={dailyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 12 }}
          label={{
            value: '총자산 (만원)',
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 12 },
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        {initialAsset && (
          <ReferenceLine
            y={initialAssetManwon}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            label={{
              value: '초기자산',
              position: 'right',
              fontSize: 10,
              fill: '#64748b',
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="총자산만원"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
