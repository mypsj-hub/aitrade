'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { useFilterStore } from '@/lib/store/filterStore';
import { AnalysisFilters } from '@/components/AnalysisFilters';
import { AnalysisSummary } from '@/components/AnalysisSummary';
import { EnhancedTradesTable } from '@/components/EnhancedTradesTable';
import { PnlByAssetChart } from '@/components/PnlByAssetChart';
import { PerformanceTrendChart } from '@/components/PerformanceTrendChart';
import { CoinStatsTable } from '@/components/CoinStatsTable';
import { AIPatternAnalysis } from '@/components/AIPatternAnalysis';
import type { Trade } from '@/lib/types';

async function fetchAllTrades(): Promise<Trade[]> {
  const { data } = await supabase
    .from('trade_history')
    .select('id, 코인이름, 거래유형, 거래금액, 수익금, 거래일시, ai_thinking_process, 주요지표')
    .order('거래일시', { ascending: false })
    .limit(500);

  return (data || []) as unknown as Trade[];
}

export default function AnalysisPage() {
  const { filters } = useFilterStore();
  const { data: allTrades, isLoading } = useSWR<Trade[]>(
    'all-trades',
    fetchAllTrades,
    { refreshInterval: 300000 }
  );

  const filteredTrades = useMemo(() => {
    if (!allTrades) return [];

    return allTrades.filter((trade) => {
      const tradeDate = new Date(trade.거래일시);

      // 시작일은 00:00:00, 종료일은 23:59:59로 설정
      const startOfDay = new Date(filters.dateRange.start);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.dateRange.end);
      endOfDay.setHours(23, 59, 59, 999);

      const isInDateRange = tradeDate >= startOfDay && tradeDate <= endOfDay;

      const matchesTradeType =
        filters.tradeTypes.length === 0 || filters.tradeTypes.includes(trade.거래유형);

      return isInDateRange && matchesTradeType;
    });
  }, [allTrades, filters]);

  const summary = useMemo(() => {
    const closedTrades = filteredTrades.filter((t) =>
      ['익절', '손절', '매도', '청산'].some((keyword) => t.거래유형.includes(keyword))
    );

    const totalTrades = closedTrades.length;
    const winTrades = closedTrades.filter((t) => (t.수익금 || 0) > 0);
    const winRate = totalTrades > 0 ? (winTrades.length / totalTrades) * 100 : 0;

    const totalProfit = closedTrades.reduce((sum, t) => sum + (t.수익금 || 0), 0);

    const grossProfit = closedTrades
      .filter((t) => (t.수익금 || 0) > 0)
      .reduce((sum, t) => sum + (t.수익금 || 0), 0);
    const grossLoss = Math.abs(
      closedTrades
        .filter((t) => (t.수익금 || 0) < 0)
        .reduce((sum, t) => sum + (t.수익금 || 0), 0)
    );
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

    return { totalTrades, totalProfit, winRate, profitFactor };
  }, [filteredTrades]);

  const pnlByAsset = useMemo(() => {
    const coinPnl = new Map<string, number>();

    filteredTrades
      .filter((t) => t.수익금 !== null)
      .forEach((trade) => {
        const current = coinPnl.get(trade.코인이름) || 0;
        coinPnl.set(trade.코인이름, current + (trade.수익금 || 0));
      });

    return Array.from(coinPnl.entries())
      .map(([coin, pnl]) => ({ coin, pnl }))
      .filter((item) => item.pnl !== 0);
  }, [filteredTrades]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">분석</h1>
        <p className="text-slate-600 mt-1">AI의 모든 판단을 투명하게 분석하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AnalysisFilters />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <AnalysisSummary
            totalTrades={summary.totalTrades}
            totalProfit={summary.totalProfit}
            winRate={summary.winRate}
            profitFactor={summary.profitFactor}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">💰 자산별 실현 손익</h2>
              <PnlByAssetChart data={pnlByAsset} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">📈 기간별 누적 손익 추이</h2>
              <PerformanceTrendChart trades={filteredTrades} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">🎯 코인별 상세 통계</h2>
            <CoinStatsTable trades={filteredTrades} />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">🤖 AI 매매 패턴 분석</h2>
            <AIPatternAnalysis trades={filteredTrades} />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📜 상세 거래 내역</h2>
            <EnhancedTradesTable trades={filteredTrades} />
          </div>
        </div>
      </div>
    </div>
  );
}
