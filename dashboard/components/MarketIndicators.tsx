'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

interface MarketData {
  fearGreedIndex: number;
  fearGreedLabel: string;
  btcDominance: number;
  kimchiPremium: number;
}

async function fetchMarketIndicators(): Promise<MarketData> {
  // system_status에서 실시간 데이터 조회
  const { data: fearGreed } = await supabase
    .from('system_status')
    .select('status_value')
    .eq('status_key', 'fear_greed_index')
    .single();

  const { data: btcDom } = await supabase
    .from('system_status')
    .select('status_value')
    .eq('status_key', 'btc_dominance')
    .single();

  const { data: kimchi } = await supabase
    .from('system_status')
    .select('status_value')
    .eq('status_key', 'kimchi_premium')
    .single();

  const fearGreedIndex = fearGreed ? parseInt(fearGreed.status_value) : 50;
  const btcDominance = btcDom ? parseFloat(btcDom.status_value) : 50;
  const kimchiPremium = kimchi ? parseFloat(kimchi.status_value) : 0;

  // 공포탐욕지수 레이블 결정
  let fearGreedLabel = '중립';
  if (fearGreedIndex < 25) fearGreedLabel = '극단적 공포';
  else if (fearGreedIndex < 45) fearGreedLabel = '공포';
  else if (fearGreedIndex < 55) fearGreedLabel = '중립';
  else if (fearGreedIndex < 75) fearGreedLabel = '탐욕';
  else fearGreedLabel = '극단적 탐욕';

  return {
    fearGreedIndex,
    fearGreedLabel,
    btcDominance,
    kimchiPremium,
  };
}

export function MarketIndicators() {
  const { data, isLoading } = useSWR<MarketData>(
    'market-indicators',
    fetchMarketIndicators,
    { refreshInterval: 60000 } // 60초마다 갱신
  );

  const getFearGreedColor = (index: number) => {
    if (index < 25) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
    if (index < 45) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
    if (index < 55) return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
    if (index < 75) return { bg: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-200' };
    return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
  };

  if (isLoading || !data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🌐 시장 지표</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-20 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const fearGreedColors = getFearGreedColor(data.fearGreedIndex);

  const indicators = [
    {
      label: '공포탐욕지수',
      value: data.fearGreedIndex,
      suffix: '',
      sublabel: data.fearGreedLabel,
      icon: '😱',
      ...fearGreedColors,
    },
    {
      label: 'BTC 도미넌스',
      value: data.btcDominance.toFixed(1),
      suffix: '%',
      sublabel: 'Bitcoin 시장점유율',
      icon: '₿',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
    },
    {
      label: '김치 프리미엄',
      value: data.kimchiPremium > 0 ? '+' + data.kimchiPremium.toFixed(2) : data.kimchiPremium.toFixed(2),
      suffix: '%',
      sublabel: '국내외 가격차',
      icon: '🌏',
      bg: data.kimchiPremium > 0 ? 'bg-green-50' : 'bg-red-50',
      text: data.kimchiPremium > 0 ? 'text-green-600' : 'text-red-600',
      border: data.kimchiPremium > 0 ? 'border-green-200' : 'border-red-200',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">🌐 시장 지표</h2>

      <div className="space-y-3">
        {indicators.map((indicator) => (
          <div
            key={indicator.label}
            className={`${indicator.bg} rounded-lg p-4 border ${indicator.border}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{indicator.icon}</span>
                <div>
                  <div className="text-sm font-medium text-slate-700">{indicator.label}</div>
                  <div className="text-xs text-slate-500">{indicator.sublabel}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${indicator.text}`}>
                  {indicator.value}
                  {indicator.suffix && (
                    <span className="text-sm ml-1">{indicator.suffix}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-400 text-center">
        60초마다 자동 갱신 (Process1에서 5분마다 업데이트)
      </div>
    </div>
  );
}
