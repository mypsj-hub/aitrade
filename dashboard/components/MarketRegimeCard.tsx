/**
 * 시장 체제 변화 카드
 *
 * 목적: AI CIO의 시장 체제 분석 및 전략적 시사점 표시
 * 데이터: cio_reports.raw_json_data.market_regime_change
 *
 * 주요 기능:
 * - 시장 체제 변화 상태 표시 (불장/횡보장/하락장)
 * - Fear & Greed Index 전일 대비 변화
 * - 전략적 시사점 표시
 */
'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface MarketRegimeData {
  regime_shift: string;
  fear_greed_today: number | null;
  fear_greed_yesterday: number | null;
  strategic_implication: string;
}

async function fetchMarketRegime(selectedDate: Date): Promise<MarketRegimeData | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: dataArray, error } = await supabase
    .from('cio_reports')
    .select('raw_json_data')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  if (error || !dataArray || dataArray.length === 0) return null;

  const rawData = dataArray[0].raw_json_data;
  if (!rawData?.market_regime_change) return null;

  return rawData.market_regime_change;
}

interface MarketRegimeCardProps {
  selectedDate: Date;
}

export function MarketRegimeCard({ selectedDate }: MarketRegimeCardProps) {
  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<MarketRegimeData | null>(
    ['market-regime', dateKey],
    () => dateKey !== 'invalid-date' ? fetchMarketRegime(selectedDate) : null,
    { refreshInterval: 30000 }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 시장 체제 변화</h2>
        <p className="text-slate-600">시장 체제 데이터가 없습니다.</p>
      </div>
    );
  }

  // Fear & Greed 색상 결정
  const getFearGreedColor = (value: number | null) => {
    if (value === null) return 'text-slate-400';
    if (value < 25) return 'text-red-600';
    if (value < 45) return 'text-orange-500';
    if (value < 55) return 'text-yellow-500';
    if (value < 75) return 'text-green-500';
    return 'text-blue-600';
  };

  const getFearGreedLabel = (value: number | null) => {
    if (value === null) return 'N/A';
    if (value < 25) return 'Extreme Fear';
    if (value < 45) return 'Fear';
    if (value < 55) return 'Neutral';
    if (value < 75) return 'Greed';
    return 'Extreme Greed';
  };

  // 체제 변화에 따른 배지 색상
  const getRegimeBadgeColor = (regime: string) => {
    if (regime.includes('상승') || regime.includes('불장')) return 'bg-green-100 text-green-800';
    if (regime.includes('하락') || regime.includes('하락장')) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const fearGreedChange = data.fear_greed_yesterday !== null && data.fear_greed_today !== null
    ? data.fear_greed_today - data.fear_greed_yesterday
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">📊 시장 체제 변화</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRegimeBadgeColor(data.regime_shift)}`}>
          {data.regime_shift}
        </span>
      </div>

      {/* Fear & Greed Index */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">오늘 공포탐욕지수</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getFearGreedColor(data.fear_greed_today)}`}>
              {data.fear_greed_today ?? 'N/A'}
            </span>
            <span className="text-sm text-slate-500">
              {getFearGreedLabel(data.fear_greed_today)}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">전일 대비</p>
          {fearGreedChange !== null ? (
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${fearGreedChange > 0 ? 'text-green-600' : fearGreedChange < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                {fearGreedChange > 0 ? '+' : ''}{fearGreedChange}
              </span>
              <span className="text-sm text-slate-500">
                {fearGreedChange > 0 ? '↑ 탐욕 증가' : fearGreedChange < 0 ? '↓ 공포 증가' : '→ 변화 없음'}
              </span>
            </div>
          ) : (
            <p className="text-2xl text-slate-400">N/A</p>
          )}
        </div>
      </div>

      {/* 전략적 시사점 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 전략적 시사점</h3>
        <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
          {data.strategic_implication}
        </p>
      </div>
    </div>
  );
}
