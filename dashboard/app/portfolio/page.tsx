'use client';

import { useState } from 'react';
import { PortfolioDateSelector } from '@/components/PortfolioDateSelector';
import { CIOInsightBanner } from '@/components/CIOInsightBanner';
import { PerformanceGauge } from '@/components/PerformanceGauge';
import { CIOSelfCritique } from '@/components/CIOSelfCritique';
import { PortfolioComposition } from '@/components/PortfolioComposition';

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

        {/* 2. 메인 콘텐츠 영역 (2컬럼 그리드) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측: Performance Gauge */}
          <PerformanceGauge selectedDate={selectedDate} />

          {/* 우측: Portfolio Composition */}
          <PortfolioComposition selectedDate={selectedDate} />
        </div>

        {/* 3. CIO Self Critique (전체 너비) */}
        <CIOSelfCritique selectedDate={selectedDate} />

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
