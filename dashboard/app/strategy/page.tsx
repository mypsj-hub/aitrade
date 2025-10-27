/**
 * 🧠 Strategy Page (CIO 전략실)
 *
 * 목적: AI CIO의 전략적 인사이트 및 의사결정 과정 심층 분석
 * 경로: /strategy
 *
 * 주요 기능:
 * 1. 시장 체제 변화 분석 (MarketRegimeCard) - Fear & Greed Index 변화 및 전략적 시사점 🆕
 * 2. 내일 전망 (OutlookCard) - CIO의 If-Then 전략 및 다음 날 계획 🆕
 * 3. 포트폴리오 비중 관리 전략 (AllocationStrategyCard) - 바 차트 + 갭 분석 + 액션 플랜 통합 🆕
 * 4. CIO 의사결정 테이블 (전체 결정 내역) - Phase 5
 * 5. 코인별 상세 정보 패널
 *
 * 레이아웃 구조:
 * - 날짜 선택기 (전체 너비)
 * - 시장 체제 변화 카드 (전체 너비) 🆕
 * - 내일 전망 카드 (전체 너비) 🆕
 * - 포트폴리오 비중 관리 전략 (전체 너비) 🆕 - WeightGapChart 통합
 * - CIO 의사결정 테이블 (전체 너비)
 * - 코인 상세 정보 패널 (모달)
 *
 * 데이터 소스:
 * - cio_reports.raw_json_data.market_regime_change (시장 체제 변화) 🆕
 * - cio_reports.raw_json_data.outlook_for_tomorrow (내일 전망) 🆕
 * - cio_reports.raw_json_data.portfolio_allocation (할당 전략) 🆕
 * - cio_portfolio_decisions (CIO 의사결정)
 * - holding_status (보유 현황)
 */
'use client';

import { useState } from 'react';
import { PortfolioDateSelector } from '@/components/PortfolioDateSelector';
import { MarketRegimeCard } from '@/components/MarketRegimeCard';
import { OutlookCard } from '@/components/OutlookCard';
import { AllocationStrategyCard } from '@/components/AllocationStrategyCard';
import { CIODecisionsTable } from '@/components/CIODecisionsTable';

export default function StrategyPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">🧠 CIO 전략실</h1>
        <p className="text-slate-600 mt-1">AI CIO의 전략 및 의사결정 과정</p>
      </div>

      {/* 날짜 선택기 */}
      <div className="mb-6">
        <PortfolioDateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      {/* 시장 체제 변화 분석 */}
      <div className="mb-8">
        <MarketRegimeCard selectedDate={selectedDate} />
      </div>

      {/* 내일 전망 */}
      <div className="mb-8">
        <OutlookCard selectedDate={selectedDate} />
      </div>

      {/* 포트폴리오 할당 전략 (목표 비중 달성률 통합) */}
      <div className="mb-8">
        <AllocationStrategyCard selectedDate={selectedDate} />
      </div>

      {/* CIO 의사결정 테이블 (Phase 5 신규) - 아코디언 스타일 */}
      <div>
        <CIODecisionsTable selectedDate={selectedDate} />
      </div>
    </div>
  );
}
