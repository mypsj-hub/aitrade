/**
 * 💼 Portfolio Page (포트폴리오 페이지)
 *
 * 목적: AI CIO 전략 중심의 포트폴리오 관리 및 분석
 * 경로: /portfolio
 *
 * 주요 기능 (확장된 CIO 보고서 반영 - 10개 섹션):
 * 1. 날짜 선택기 (input type="date") - 과거 데이터 조회
 * 2. 시장 및 성과 요약 (CIO 리포트 섹션 1)
 * 3. 시장 심리 변화 (섹션 7) - Fear & Greed Index
 * 4. 주요 매매 결정 복기 & 제외 코인 분석 (섹션 8 + 4 통합)
 * 5. 성과 게이지 (누적 수익률, 승률, 일일 수익률) + 최근 7일 매매 성과 (섹션 3)
 * 6. 포트폴리오 구성 차트 (원화 vs 코인 비율) + 포트폴리오 비중 관리 (섹션 2)
 * 7. 거래빈도 분석 (섹션 6)
 * 8. 미실현 손실 모니터링 (섹션 5)
 * 9. AI 자가 평가 (강점, 약점, 교훈, 내일의 전략 통합)
 *
 * 레이아웃 구조 (중요도순, 모바일 반응형):
 * - 날짜 선택기 (전체 너비)
 * - 시장 및 성과 요약 (전체 너비, 폴더블)
 * - 시장 심리 변화 (전체 너비)
 * - 주요 매매 결정 복기 & 제외 코인 분석 (전체 너비, 폴더블)
 * - 2컬럼 그리드 (모바일에서 세로 스택): 성과 게이지 + 포트폴리오 구성
 * - 거래빈도 분석 (전체 너비)
 * - 미실현 손실 모니터링 (전체 너비)
 * - AI 자가 평가 (전체 너비, 2x2 그리드: 최고의 결정, 개선점, 전략 일관성, 내일의 전략)
 *
 * 상태 관리:
 * - useState로 selectedDate 관리
 * - Props drilling으로 모든 하위 컴포넌트에 날짜 전달
 *
 * 데이터 소스:
 * - portfolio_summary: 누적수익률, 일일수익률, 원화잔고, 총코인가치
 * - trade_history: 승률 계산용
 * - cio_reports: AI 전략, 자가 평가 (JSONB), full_content_md (마크다운 리포트 10개 섹션)
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
import { PerformanceGauge } from '@/components/PerformanceGauge';
import { CIOSelfCritique } from '@/components/CIOSelfCritique';
import { PortfolioComposition } from '@/components/PortfolioComposition';
import { CIOMarketSummary } from '@/components/CIOMarketSummary';
import { CIOTradeReview } from '@/components/CIOTradeReview';
import { CIOMarketSentiment } from '@/components/CIOMarketSentiment';
import { CIOTradingFrequency } from '@/components/CIOTradingFrequency';
import { CIOUnrealizedLoss } from '@/components/CIOUnrealizedLoss';

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

      {/* 중요도순 레이아웃 (9개 섹션 - 내일의 전략은 AI 자가평가에 통합) */}
      <div className="space-y-6">
        {/* 0. 날짜 선택기 */}
        <PortfolioDateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* 1. 시장 및 성과 요약 (섹션 1) */}
        <CIOMarketSummary selectedDate={selectedDate} />

        {/* 2. 시장 심리 변화 (섹션 7) - Fear & Greed Index */}
        <CIOMarketSentiment selectedDate={selectedDate} />

        {/* 3. 주요 매매 결정 복기 & 제외 코인 분석 (섹션 8 + 4) */}
        <CIOTradeReview selectedDate={selectedDate} />

        {/* 4. 메인 콘텐츠 영역 (2컬럼 그리드 - 모바일에서 세로 스택) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측: Performance Gauge + 최근 7일 매매 성과 (섹션 3) */}
          <PerformanceGauge selectedDate={selectedDate} />

          {/* 우측: Portfolio Composition + 포트폴리오 비중 관리 (섹션 2) */}
          <PortfolioComposition selectedDate={selectedDate} />
        </div>

        {/* 5. 거래빈도 분석 (섹션 6) */}
        <CIOTradingFrequency selectedDate={selectedDate} />

        {/* 6. 미실현 손실 모니터링 (섹션 5) */}
        <CIOUnrealizedLoss selectedDate={selectedDate} />

        {/* 7. AI 자가 평가 (2x2 그리드: 최고의 결정, 개선점, 전략 일관성, 내일의 전략) */}
        <CIOSelfCritique selectedDate={selectedDate} />
      </div>
    </div>
  );
}
