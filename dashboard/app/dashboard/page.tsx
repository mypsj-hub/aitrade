/**
 * 📊 Dashboard Page (대시보드 페이지)
 *
 * 목적: 시스템 전체 현황을 3초 안에 파악할 수 있는 메인 대시보드
 * 경로: /dashboard
 *
 * 주요 기능:
 * 1. 실시간 포트폴리오 요약 (총자산, 수익률, 보유 코인 수)
 * 2. 시스템 성과 메트릭 (최근 30일 거래 수, 승률, 평균 보유기간)
 * 3. AI CIO 최신 전략 표시
 * 4. 오늘의 주요 거래 내역 (최근 5건)
 * 5. 시장 지표 (공포탐욕지수, BTC 도미넌스, 김치 프리미엄)
 * 6. 빠른 링크 (Upbit, CoinGecko 등)
 * 7. 총순자산 추이 차트 (만원 단위)
 * 8. 보유 자산 현황 테이블
 * 9. 최근 거래 내역 테이블 (최근 20건)
 *
 * 레이아웃 구조:
 * - 2컬럼 그리드 (lg 이상)
 *   * 좌측: 시스템 성과 관련 카드들
 *   * 우측: 외부 시장 정보 및 차트
 * - 하단: 전체 너비 테이블 섹션 (보유 자산, 거래 내역)
 *
 * 데이터 소스:
 * - useDashboardData 훅으로 모든 데이터 통합 관리
 * - Supabase 실시간 데이터 (portfolio_summary, trade_history 등)
 */
'use client';

import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { PortfolioSummaryCard } from '@/components/PortfolioSummaryCard';
import { SystemMetricsCard } from '@/components/SystemMetricsCard';
import { CIOStrategyCard } from '@/components/CIOStrategyCard';
import { KeyTradesCard } from '@/components/KeyTradesCard';
import { MarketIndicators } from '@/components/MarketIndicators';
import { QuickLinksCard } from '@/components/QuickLinksCard';
import { HoldingsTable } from '@/components/HoldingsTable';
import { RecentTradesTable } from '@/components/RecentTradesTable';
import { PerformanceChart } from '@/components/PerformanceChart';
import { MarketRegimeBadge } from '@/components/MarketRegimeBadge';

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboardData();

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

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">데이터 로딩 실패</h2>
          <p className="text-slate-600 mb-4">Supabase 연결을 확인해주세요.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">대시보드</h1>
          <p className="text-slate-600 mt-1">3초 안에 전체 상황을 파악하세요</p>
        </div>
        <MarketRegimeBadge regime={data.marketRegime} />
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 좌측 컬럼: 시스템 성과 */}
        <div className="space-y-6">
          {/* 포트폴리오 요약 */}
          <PortfolioSummaryCard summary={data.summary} />

          {/* 시스템 성과 메트릭 */}
          <SystemMetricsCard />

          {/* AI CIO 최신 전략 */}
          <CIOStrategyCard />

          {/* 오늘의 주요 거래 */}
          <KeyTradesCard />
        </div>

        {/* 우측 컬럼: 외부 시장 정보 */}
        <div className="space-y-6">
          {/* 시장 지표 */}
          <MarketIndicators />

          {/* 빠른 링크 */}
          <QuickLinksCard />

          {/* 총순자산 추이 차트 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📊 총순자산 추이</h2>
            <PerformanceChart data={data.summaryHistory} />
          </div>
        </div>
      </div>

      {/* 전체 너비 섹션 */}
      <div className="mt-8 space-y-8">
        {/* 보유 자산 테이블 */}
        <section>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">🪙 보유 자산 현황</h2>
            <HoldingsTable holdings={data.holdings} />
          </div>
        </section>

        {/* 최근 거래 내역 */}
        <section>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📜 최근 거래 내역</h2>
            <RecentTradesTable trades={data.recentTrades.slice(0, 20)} />
          </div>
        </section>
      </div>
    </div>
  );
}
