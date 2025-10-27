/**
 * 포트폴리오 할당 전략 카드 (통합 버전)
 *
 * 목적: AI CIO의 포트폴리오 비중 관리 전략 및 중요 갭 분석
 * - WeightGapChart의 시각화와 AllocationStrategyCard의 액션 플랜 통합
 *
 * 주요 기능:
 * - 포트폴리오 할당 요약
 * - 목표 vs 현재 비중 바 차트 (WeightGapChart 스타일)
 * - 중요 비중 갭 코인 목록
 * - 코인별 목표/현재 비중 및 액션 플랜
 * - 시총등급, 섹터, 유동성 정보 표시
 */
'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface CriticalGap {
  symbol: string;
  target_weight: number;
  current_weight: number;
  gap: number;
  action_needed: string;
}

interface AllocationData {
  summary: string;
  critical_gaps: CriticalGap[];
}

async function fetchAllocation(selectedDate: Date): Promise<AllocationData | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: dataArray, error } = await supabase
    .from('cio_reports')
    .select('raw_json_data')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  if (error || !dataArray || dataArray.length === 0) return null;

  const rawData = dataArray[0].raw_json_data;
  if (!rawData?.portfolio_allocation) return null;

  return rawData.portfolio_allocation;
}

interface AllocationStrategyCardProps {
  selectedDate: Date;
}

export function AllocationStrategyCard({ selectedDate }: AllocationStrategyCardProps) {
  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<AllocationData | null>(
    ['allocation', dateKey],
    () => dateKey !== 'invalid-date' ? fetchAllocation(selectedDate) : null,
    { refreshInterval: 30000 }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🎯 포트폴리오 비중 관리 전략</h2>
        <p className="text-slate-600">할당 전략 데이터가 없습니다.</p>
      </div>
    );
  }

  // 갭 크기에 따른 색상
  const getGapColor = (gap: number) => {
    if (gap === 0) return 'text-slate-600';
    if (gap > 0 && gap < 3) return 'text-yellow-600';
    if (gap >= 3 && gap < 5) return 'text-orange-600';
    if (gap >= 5) return 'text-red-600';
    return 'text-slate-600';
  };

  const getGapBgColor = (gap: number) => {
    if (gap === 0) return 'bg-slate-50';
    if (gap > 0 && gap < 3) return 'bg-yellow-50';
    if (gap >= 3 && gap < 5) return 'bg-orange-50';
    if (gap >= 5) return 'bg-red-50';
    return 'bg-slate-50';
  };

  // 상태 판단 (WeightGapChart와 동일)
  const getState = (targetWeight: number, currentWeight: number) => {
    const gap = currentWeight - targetWeight;
    const gapRatio = targetWeight > 0 ? Math.abs(gap / targetWeight) * 100 : 0;

    if (gapRatio <= 20) return '적정';
    if (gap > 0) return '과다보유';
    return '과소보유';
  };

  // 상태별 바 색상
  const getBarColor = (state: string) => {
    switch (state) {
      case '과소보유':
        return 'bg-red-500';
      case '적정':
        return 'bg-green-500';
      case '과다보유':
        return 'bg-blue-500';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">🎯 포트폴리오 비중 관리 전략</h2>

      {/* 요약 */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-amber-900 mb-2">📋 할당 요약</h3>
        <p className="text-sm text-amber-800 leading-relaxed">
          {data.summary}
        </p>
      </div>

      {/* 중요 갭 목록 */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-3">📊 중요 비중 갭 분석</h3>
        <div className="space-y-4">
          {data.critical_gaps.map((item, index) => {
            const state = getState(item.target_weight, item.current_weight);
            const maxWidth = 100;
            const 목표바Width = (item.target_weight / 100) * maxWidth * 4; // 최대 25% 가정
            const 현재바Width = (item.current_weight / 100) * maxWidth * 4;

            return (
              <div
                key={index}
                className={`${getGapBgColor(item.gap)} border-2 border-slate-200 rounded-lg p-5 transition hover:shadow-lg`}
              >
                {/* 코인 정보 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl font-bold text-slate-900">{item.symbol}</h4>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        state === '과소보유'
                          ? 'bg-red-100 text-red-700'
                          : state === '적정'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {state}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getGapColor(item.gap)}`}>
                      {item.gap > 0 ? '+' : ''}{item.gap.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-500">갭</div>
                  </div>
                </div>

                {/* 목표 비중 바 */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-600 w-16 font-semibold">목표</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-7 relative overflow-hidden">
                      <div
                        className="bg-slate-400 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${Math.min(목표바Width, 100)}%` }}
                      >
                        <span className="text-xs font-bold text-white">
                          {item.target_weight.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 현재 비중 바 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-600 w-16 font-semibold">현재</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-7 relative overflow-hidden">
                      <div
                        className={`${getBarColor(state)} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3`}
                        style={{ width: `${Math.min(현재바Width, 100)}%` }}
                      >
                        <span className="text-xs font-bold text-white">
                          {item.current_weight.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 액션 플랜 */}
                <div className="bg-white rounded-lg p-4 border-2 border-slate-200">
                  <p className="text-xs text-slate-500 mb-2 font-semibold flex items-center gap-1">
                    <span>📌</span> 액션 플랜
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {item.action_needed}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-2 font-semibold">갭 크기 범례:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-slate-100 border border-slate-300 rounded"></span>
                <span className="text-slate-600">0% (달성)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></span>
                <span className="text-slate-600">1-2% (경미)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-orange-100 border border-orange-300 rounded"></span>
                <span className="text-slate-600">3-4% (주의)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 bg-red-100 border border-red-300 rounded"></span>
                <span className="text-slate-600">5%+ (긴급)</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2 font-semibold">보유 상태:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-slate-600">과소보유 (목표 &gt; 현재)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-slate-600">적정 (갭 20% 이내)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-slate-600">과다보유 (목표 &lt; 현재)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
