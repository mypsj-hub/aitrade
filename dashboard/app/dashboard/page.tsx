/**
 * 📊 Dashboard Page (대시보드 페이지)
 *
 * 목적: 시스템 전체 현황을 3초 안에 파악할 수 있는 메인 대시보드
 * 경로: /dashboard
 *
 * 주요 기능:
 * 1. 실시간 포트폴리오 요약 (총자산, 수익률, 보유 코인 수)
 * 2. 시스템 성과 메트릭 (최근 30일 거래 수, 승률, 평균 보유기간) - 클릭 시 분석 페이지
 * 3. AI CIO 최신 전략 표시
 * 4. 오늘의 주요 거래 내역 (최근 5건)
 * 5. 시장 지표 (공포탐욕지수, BTC 도미넌스, 김치 프리미엄)
 * 6. 빠른 링크 (Upbit, CoinGecko 등)
 * 7. 총순자산 추이 차트 (만원 단위)
 * 8. 보유 자산 현황 테이블 - 클릭 시 포트폴리오 페이지
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

import Link from 'next/link';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { usePageViewCounter } from '@/lib/hooks/usePageViewCounter';
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
import { WatchlistTable } from '@/components/WatchlistTable';

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboardData();
  const { viewCount, isLoading: isCountLoading } = usePageViewCounter();

  // 디버깅: 로드된 데이터 개수 확인
  if (data?.summaryHistory) {
    console.log('[Dashboard] summaryHistory loaded:', data.summaryHistory.length, 'rows');
    console.log('[Dashboard] Date range:',
      data.summaryHistory[0]?.날짜,
      'to',
      data.summaryHistory[data.summaryHistory.length - 1]?.날짜
    );
  }

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
      {/* 유튜브 채널 배너 */}
      <div className="mb-6 space-y-3">
        <a
          href="https://www.youtube.com/@코인먹는AI"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-lg p-4 transition-all duration-300 transform hover:scale-[1.01]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">코인먹는AI 유튜브 채널</h3>
                <p className="text-sm text-red-100">AI 트레이딩 전략과 암호화폐 인사이트를 확인하세요!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <span className="text-sm font-semibold">채널 방문</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </div>
          </div>
        </a>

        {/* 방문자 카운터 */}
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <span className="text-sm text-slate-600">
              총 방문:
            </span>
            <span className="text-sm font-bold text-slate-800">
              {isCountLoading ? '...' : viewCount.toLocaleString()}회
            </span>
          </div>
        </div>
      </div>

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

          {/* 총순자산 추이 차트 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">📊 총순자산 추이</h2>
              <p className="text-xs text-slate-400 mt-1">일별 포트폴리오 가치 변화</p>
            </div>
            <PerformanceChart data={data.summaryHistory} />
          </div>
        </div>
      </div>

      {/* 전체 너비 섹션 */}
      <div className="mt-8 space-y-8">
        {/* 보유 자산 테이블 */}
        <section>
          <Link href="/portfolio" className="block">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-800">🪙 보유 자산 현황</h2>
                <p className="text-xs text-slate-400 mt-1">현재 보유 중인 코인 목록 및 수익률</p>
              </div>
              <HoldingsTable holdings={data.holdings} />
            </div>
          </Link>
        </section>

        {/* AI 관심 코인 테이블 */}
        <section>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">🔍 AI 관심 코인</h2>
            <WatchlistTable watchlist={data.watchlist} />
          </div>
        </section>

        {/* 최근 거래 내역 */}
        <section>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📜 최근 거래 내역</h2>
            <RecentTradesTable trades={data.recentTrades.slice(0, 20)} />
          </div>
        </section>

        {/* 빠른 링크 */}
        <section>
          <QuickLinksCard />
        </section>
      </div>
    </div>
  );
}
