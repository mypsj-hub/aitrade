'use client';

import { useState, useEffect } from 'react';

interface MarketData {
  fearGreedIndex: number;
  fearGreedLabel: string;
  btcDominance: number;
  kimchiPremium: number;
}

export function MarketIndicators() {
  const [data, setData] = useState<MarketData>({
    fearGreedIndex: 50,
    fearGreedLabel: '중립',
    btcDominance: 54.2,
    kimchiPremium: 0.5,
  });

  // TODO: Phase 5에서 실제 API 연동
  useEffect(() => {
    // 임시 데이터 (Phase 5에서 Alternative.me, CoinGecko API 연동)
    setData({
      fearGreedIndex: 52,
      fearGreedLabel: '중립',
      btcDominance: 54.3,
      kimchiPremium: 0.8,
    });
  }, []);

  const getFearGreedColor = (index: number) => {
    if (index < 25) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
    if (index < 45) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
    if (index < 55) return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' };
    if (index < 75) return { bg: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-200' };
    return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' };
  };

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
      value: data.kimchiPremium > 0 ? '+' + data.kimchiPremium.toFixed(1) : data.kimchiPremium.toFixed(1),
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
        Phase 5에서 실시간 API 연동 예정
      </div>
    </div>
  );
}
