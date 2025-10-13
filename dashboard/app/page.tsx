'use client';

import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { PortfolioSummaryCard } from '@/components/PortfolioSummaryCard';
import { HoldingsTable } from '@/components/HoldingsTable';
import { RecentTradesTable } from '@/components/RecentTradesTable';
import { PerformanceChart } from '@/components/PerformanceChart';
import { MarketRegimeBadge } from '@/components/MarketRegimeBadge';

export default function Home() {
  const { data, isLoading, isError } = useDashboardData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📈 AI Trading Dashboard</h1>
              <p className="text-blue-200 mt-1">인공지능 기반 암호화폐 자동매매 시스템</p>
            </div>
            <MarketRegimeBadge regime={data.marketRegime} />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8">
        {/* 포트폴리오 요약 */}
        <section className="mb-8">
          <PortfolioSummaryCard summary={data.summary} />
        </section>

        {/* 수익률 차트 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📊 누적 수익률 추이</h2>
            <PerformanceChart data={data.summaryHistory} />
          </div>
        </section>

        {/* 보유 자산 테이블 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">🪙 보유 자산 현황</h2>
            <HoldingsTable holdings={data.holdings} />
          </div>
        </section>

        {/* 최근 거래 내역 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📜 최근 거래 내역</h2>
            <RecentTradesTable trades={data.recentTrades.slice(0, 20)} />
          </div>
        </section>

        {/* CIO 브리핑 */}
        {data.latestReport && (
          <section className="mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">🤖 AI CIO 브리핑</h2>
              <div className="text-sm text-slate-600 mb-2">
                {data.latestReport.report_date} | {data.latestReport.report_type}
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-3">
                {data.latestReport.title}
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-600 whitespace-pre-wrap">
                  {data.latestReport.cio_latest_rationale || data.latestReport.outlook}
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-slate-800 text-slate-300 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 AI Trading System | 데이터는 60초마다 자동 업데이트됩니다
          </p>
        </div>
      </footer>
    </div>
  );
}
