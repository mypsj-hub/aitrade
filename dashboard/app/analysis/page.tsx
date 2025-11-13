/**
 * 🔬 Analysis Page (분석 페이지)
 *
 * 목적: AI의 모든 거래 판단을 투명하게 분석하고 검증
 * 경로: /analysis
 *
 * 주요 기능:
 * 1. 기간 필터링 (날짜 범위 선택: input type="date")
 * 2. 거래 유형 필터링 (매수, 익절, 손절 등)
 * 3. 기간내 성과 요약 (총 거래 수, 총 손익, 승률, 손익비)
 * 4. 자산별 실현 손익 차트 (Recharts 막대 차트)
 * 5. 기간별 누적 손익 추이 차트 (만원 단위)
 * 6. 코인별 상세 통계 (거래 수, 승률, 평균 손익, 최대 이익/손실, 손익비)
 * 7. AI 매매 패턴 분석 (거래 유형별 성과, 시간대별 패턴)
 * 8. 상세 거래 내역 테이블 (검색, 정렬, 페이지네이션, 행 확장)
 *
 * 레이아웃 구조:
 * - 4컬럼 그리드 (lg 이상)
 *   * 좌측 1컬럼: 필터 (sticky)
 *   * 우측 3컬럼: 모든 분석 컴포넌트
 *
 * 데이터 처리:
 * - Supabase에서 최근 500개 거래 내역 조회
 * - 클라이언트 사이드 필터링 (날짜 범위, 거래 유형)
 * - useMemo로 성능 최적화
 * - Zustand filterStore로 필터 상태 관리
 *
 * 기술 스택:
 * - TanStack Table v8 (정렬, 페이지네이션, 검색)
 * - Recharts (차트 시각화)
 * - date-fns (날짜 처리)
 * - SWR (데이터 패칭, 5분 간격 새로고침)
 */
'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useFilterStore } from '@/lib/store/filterStore';
import { AnalysisFilters } from '@/components/AnalysisFilters';
import { AnalysisSummary } from '@/components/AnalysisSummary';
import { EnhancedTradesTable } from '@/components/EnhancedTradesTable';
import { PnlByAssetChart } from '@/components/PnlByAssetChart';
import { PerformanceTrendChart, type DailyTradeSummary } from '@/components/PerformanceTrendChart';
import { CoinStatsTable } from '@/components/CoinStatsTable';
import { AIPatternAnalysis } from '@/components/AIPatternAnalysis';
import type { Trade } from '@/lib/types';

async function fetchAllTrades(): Promise<Trade[]> {
  const { data } = await supabase
    .from('trade_history')
    .select('id, 코인이름, 거래유형, 거래금액, 수익금, 거래일시, ai_thinking_process, 주요지표')
    .order('거래일시', { ascending: false })
    .limit(2000); // 증가: 500 → 2000 (전체 거래 내역 포함)

  return (data || []) as unknown as Trade[];
}

async function fetchDailySummary(
  startDate: string,
  endDate: string
): Promise<DailyTradeSummary[]> {
  const { data, error } = await supabase.rpc('get_daily_trade_summary', {
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    console.error('[fetchDailySummary] RPC error:', error);
    return [];
  }

  return (data || []) as DailyTradeSummary[];
}

export default function AnalysisPage() {
  const { filters } = useFilterStore();
  const { data: allTrades, isLoading } = useSWR<Trade[]>(
    'all-trades',
    fetchAllTrades,
    { refreshInterval: 300000 }
  );

  // 날짜 범위별 일별 손익 데이터 가져오기 (RPC 함수 사용)
  const dailySummaryKey = useMemo(
    () => `daily-summary-${format(new Date(filters.dateRange.start), 'yyyy-MM-dd')}-${format(new Date(filters.dateRange.end), 'yyyy-MM-dd')}`,
    [filters.dateRange]
  );

  const { data: dailySummary } = useSWR<DailyTradeSummary[]>(
    dailySummaryKey,
    () =>
      fetchDailySummary(
        format(new Date(filters.dateRange.start), 'yyyy-MM-dd'),
        format(new Date(filters.dateRange.end), 'yyyy-MM-dd')
      ),
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

      // 하이브리드 필터링 로직
      const matchesTradeType = (() => {
        // 필터가 없으면 전체 표시
        if (filters.tradeTypes.length === 0) return true;

        return filters.tradeTypes.some((filterType) => {
          // 메타 필터: 넓은 범위 LIKE 검색
          if (filterType === '매수') {
            return trade.거래유형.includes('매수');
          }
          if (filterType === '매도') {
            return (
              trade.거래유형.includes('매도') ||
              trade.거래유형.includes('익절') ||
              trade.거래유형.includes('손절')
            );
          }

          // 구체적 필터: 정확히 일치
          return trade.거래유형 === filterType;
        });
      })();

      return isInDateRange && matchesTradeType;
    });
  }, [allTrades, filters]);

  const summary = useMemo(() => {
    // 청산 거래 분리 (익절, 손절, 매도 포함)
    const closedTrades = filteredTrades.filter((t) =>
      ['익절', '손절', '매도'].some((keyword) => t.거래유형.includes(keyword))
    );

    const totalTrades = filteredTrades.length; // 전체 거래 수
    const closedTradesCount = closedTrades.length; // 청산 거래 수

    // 청산 거래가 없으면 통계를 null로 설정
    if (closedTradesCount === 0) {
      return {
        totalTrades,
        closedTradesCount,
        totalProfit: null,
        winRate: null,
        profitFactor: null,
      };
    }

    const winTrades = closedTrades.filter((t) => (t.수익금 || 0) > 0);
    const winRate = (winTrades.length / closedTradesCount) * 100;

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

    return { totalTrades, closedTradesCount, totalProfit, winRate, profitFactor };
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
            closedTradesCount={summary.closedTradesCount}
            totalProfit={summary.totalProfit}
            winRate={summary.winRate}
            profitFactor={summary.profitFactor}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800">💰 자산별 실현 손익</h2>
                <p className="text-xs text-slate-400 mt-1">코인별 누적 수익/손실</p>
              </div>
              <PnlByAssetChart data={pnlByAsset} />
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800">📈 기간별 누적 손익 추이</h2>
                <p className="text-xs text-slate-400 mt-1">일별 손익 누적 그래프</p>
              </div>
              <PerformanceTrendChart dailySummary={dailySummary || []} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">🎯 코인별 상세 통계</h2>
              <p className="text-xs text-slate-400 mt-1">코인별 거래 횟수, 승률, 평균 손익</p>
            </div>
            <CoinStatsTable trades={filteredTrades} />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">🤖 AI 매매 패턴 분석</h2>
              <p className="text-xs text-slate-400 mt-1">거래 유형별 성과 및 시간대 분석</p>
            </div>
            <AIPatternAnalysis trades={filteredTrades} />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">📜 상세 거래 내역</h2>
              <p className="text-xs text-slate-400 mt-1">거래별 AI 사고 과정 및 지표</p>
            </div>
            <EnhancedTradesTable trades={filteredTrades} />
          </div>
        </div>
      </div>
    </div>
  );
}
