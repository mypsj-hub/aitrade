/**
 * 💼 Portfolio Page (포트폴리오 페이지)
 *
 * 목적: AI CIO 전략 중심의 포트폴리오 관리 및 분석
 * 경로: /portfolio
 *
 * 주요 기능 (Phase 4A+ 완료):
 * 1. 날짜 선택기 (input type="date") - 과거 데이터 조회
 * 2. AI CIO 최신 전략 배너 (확장/축소 토글 기능)
 * 3. 시장 및 성과 요약 (CIO 리포트 섹션 1)
 * 4. 주요 매매 결정 복기 (CIO 리포트 섹션 2)
 * 5. 성과 게이지 (누적 수익률, 승률, 일일 수익률)
 * 6. 포트폴리오 구성 차트 (원화 vs 코인 비율 도넛 차트)
 * 7. AI 자가 평가 (강점, 약점, 교훈)
 * 8. 내일의 전략 (CIO 리포트 섹션 4)
 *
 * 향후 추가 예정 (Phase 4B):
 * - StrategyTimeline: 최근 7일 AI CIO 리포트 타임라인
 * - MarketOutlookCard: AI CIO의 시장 전망 분석
 * - RecentReportsTable: 리포트 목록 및 마크다운 뷰어
 *
 * 레이아웃 구조:
 * - 날짜 선택기 (전체 너비)
 * - CIO Insight Banner (전체 너비)
 * - 시장 및 성과 요약 (전체 너비, 폴더블)
 * - 주요 매매 결정 복기 (전체 너비, 폴더블)
 * - 2컬럼 그리드: 성과 게이지 + 포트폴리오 구성
 * - AI 자가 평가 (전체 너비, 3컬럼 내부 그리드)
 * - 내일의 전략 (전체 너비, 폴더블)
 *
 * 상태 관리:
 * - useState로 selectedDate 관리 (Context 제거)
 * - Props drilling으로 모든 하위 컴포넌트에 날짜 전달
 *
 * 데이터 소스:
 * - portfolio_summary: 누적수익률, 일일수익률, 원화잔고, 총코인가치
 * - trade_history: 승률 계산용
 * - cio_reports: AI 전략, 자가 평가 (JSONB), full_content_md (마크다운 리포트)
 *
 * 기술 스택:
 * - SWR (5초/30초 간격 새로고침)
 * - Recharts (RadialBarChart, PieChart)
 * - react-markdown + remark-gfm (마크다운 렌더링)
 * - date-fns (날짜 처리)
 */
'use client';

import { useState } from 'react';
import { PortfolioDateSelector } from '@/components/PortfolioDateSelector';
import { CIOInsightBanner } from '@/components/CIOInsightBanner';
import { PerformanceGauge } from '@/components/PerformanceGauge';
import { CIOSelfCritique } from '@/components/CIOSelfCritique';
import { PortfolioComposition } from '@/components/PortfolioComposition';
import { CIOMarketSummary } from '@/components/CIOMarketSummary';
import { CIOTradeReview } from '@/components/CIOTradeReview';
import { CIOTomorrowStrategy } from '@/components/CIOTomorrowStrategy';

export default function PortfolioPage() {
  // 기본값: 오늘 날짜 (함수로 래핑하여 SSR/CSR 동기화 문제 방지)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">포트폴리오</h1>
        <p className="text-slate-600 mt-1">AI CIO 전략 및 포트폴리오 현황을 확인하세요</p>
      </div>

      {/* Phase 4A 레이아웃 */}
      <div className="space-y-6">
        {/* 0. 날짜 선택기 */}
        <PortfolioDateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* 1. CIO Insight Banner (전체 너비) */}
        <CIOInsightBanner selectedDate={selectedDate} />

        {/* 2. CIO 리포트 섹션들 (전체 너비) */}
        <CIOMarketSummary selectedDate={selectedDate} />
        <CIOTradeReview selectedDate={selectedDate} />

        {/* 3. 메인 콘텐츠 영역 (2컬럼 그리드) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측: Performance Gauge */}
          <PerformanceGauge selectedDate={selectedDate} />

          {/* 우측: Portfolio Composition */}
          <PortfolioComposition selectedDate={selectedDate} />
        </div>

        {/* 4. CIO Self Critique (전체 너비) */}
        <CIOSelfCritique selectedDate={selectedDate} />

        {/* 5. 내일의 전략 (전체 너비) */}
        <CIOTomorrowStrategy selectedDate={selectedDate} />

        {/* Phase 4B 예정 안내 */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-2">🚧 Phase 4B 준비 중</h3>
          <p className="text-sm text-slate-600 mb-3">
            다음 컴포넌트들이 곧 추가될 예정입니다:
          </p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• <span className="font-medium">StrategyTimeline</span>: 최근 7일 AI CIO 리포트 타임라인</li>
            <li>• <span className="font-medium">MarketOutlookCard</span>: AI CIO의 시장 전망 분석</li>
            <li>• <span className="font-medium">RecentReportsTable</span>: 리포트 목록 및 마크다운 뷰어</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
