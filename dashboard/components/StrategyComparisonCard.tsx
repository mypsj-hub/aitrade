/**
 * 전략 비교 카드 (CIO vs 매매전략)
 *
 * 목적: AI CIO(장기 전략)와 매매전략(단기 전술)를 나란히 비교하여 표시
 * 역할: 투자 의사결정의 전체 맥락을 한 눈에 제공
 *
 * 주요 기능:
 * - CIO 전략: 포트폴리오 전체 비중 및 장기 계획
 * - 매매전략: 실시간 매매 타이밍 및 단기 전술
 * - 각각 독립적으로 펼치기/접기 가능
 * - 역할 구분: 색상(파란색/초록색) + 아이콘(📜/⚡)
 * - 60초마다 자동 갱신
 *
 * 레이아웃:
 * ┌─────────────────────────────────────────┐
 * │ 🎯 AI 투자 전략                          │
 * ├─────────────────────────────────────────┤
 * │ 📜 CIO 전략 (장기 포트폴리오)             │
 * │ [과거 반성] 최근 30일 손익비...          │
 * │ [전략] 현금 비중 92% 유지...             │
 * │ [더 보기 ▼]                              │
 * ├─────────────────────────────────────────┤
 * │ ⚡ 매매전략 (단기 매매 타이밍)            │
 * │ 현재 시장은 거래량 없이...               │
 * │ [더 보기 ▼]                              │
 * └─────────────────────────────────────────┘
 *
 * 데이터 소스: system_status 테이블
 * - status_key='cio_latest_rationale'
 * - status_key='process2_latest_advice'
 */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils/formatters';

interface StrategyData {
  cioRationale: string;
  cioUpdatedAt: string;
  process2Advice: string;
  process2UpdatedAt: string;
  executionSummary?: string;  // 실제 체결 결과 (선택)
}

async function fetchStrategyData(): Promise<StrategyData | null> {
  try {
    // 1. system_status에서 실시간 조언 조회
    const { data, error } = await supabase
      .from('system_status')
      .select('status_key, status_value, last_updated')
      .in('status_key', ['cio_latest_rationale', 'process2_latest_advice']);

    if (error) {
      console.error('[StrategyComparisonCard] Supabase error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn('[StrategyComparisonCard] No data found');
      return null;
    }

    const cioData = data.find(d => d.status_key === 'cio_latest_rationale');
    const process2Data = data.find(d => d.status_key === 'process2_latest_advice');

    // 2. cio_reports에서 오늘의 execution_summary 조회
    const today = new Date().toISOString().split('T')[0];
    const { data: reportData } = await supabase
      .from('cio_reports')
      .select('execution_summary')
      .eq('report_date', today)
      .eq('report_type', 'DAILY')
      .maybeSingle();

    return {
      cioRationale: cioData?.status_value || 'CIO 브리핑이 아직 생성되지 않았습니다.',
      cioUpdatedAt: cioData?.last_updated || '',
      process2Advice: process2Data?.status_value || '매매전략 분석이 아직 실행되지 않았습니다.',
      process2UpdatedAt: process2Data?.last_updated || '',
      executionSummary: reportData?.execution_summary || null,
    };
  } catch (error) {
    console.error('[StrategyComparisonCard] Fetch error:', error);
    return null;
  }
}

export function StrategyComparisonCard() {
  const [showFullCIO, setShowFullCIO] = useState(false);
  const [showFullProcess2, setShowFullProcess2] = useState(false);

  const { data, isLoading } = useSWR<StrategyData | null>(
    'strategy-comparison',
    fetchStrategyData,
    { refreshInterval: 60000 } // 60초마다 자동 갱신
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🎯 AI 투자 전략</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-slate-100 rounded"></div>
          <div className="h-24 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🎯 AI 투자 전략</h2>
        <p className="text-sm text-slate-500">전략 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 텍스트 자르기 헬퍼 함수
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6">
      {/* 헤더 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">🎯 AI 투자 전략</h2>
        <p className="text-xs text-slate-400 mt-1">장기 전략과 단기 전술 비교</p>
      </div>

      {/* CIO 전략 섹션 */}
      <div className="mb-4 p-4 bg-white rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-blue-700 flex items-center gap-2">
            <span>📜</span>
            <span>CIO 전략 (장기 포트폴리오)</span>
          </h3>
          <span className="text-xs text-slate-400">
            {data.cioUpdatedAt ? formatDateTime(data.cioUpdatedAt) : '업데이트 대기'}
          </span>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {showFullCIO ? data.cioRationale : truncateText(data.cioRationale, 200)}
        </p>
        {data.cioRationale.length > 200 && (
          <button
            onClick={() => setShowFullCIO(!showFullCIO)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
            aria-label={showFullCIO ? 'CIO 전략 접기' : 'CIO 전략 더 보기'}
          >
            {showFullCIO ? '접기 ▲' : '더 보기 ▼'}
          </button>
        )}
      </div>

      {/* 매매전략 섹션 */}
      <div className="mb-4 p-4 bg-white rounded-lg border-l-4 border-green-500 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-green-700 flex items-center gap-2">
            <span>⚡</span>
            <span>매매전략 (단기 매매 타이밍)</span>
          </h3>
          <span className="text-xs text-slate-400">
            {data.process2UpdatedAt ? formatDateTime(data.process2UpdatedAt) : '업데이트 대기'}
          </span>
        </div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
          {showFullProcess2 ? data.process2Advice : truncateText(data.process2Advice, 200)}
        </p>
        {data.process2Advice.length > 200 && (
          <button
            onClick={() => setShowFullProcess2(!showFullProcess2)}
            className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium transition-colors"
            aria-label={showFullProcess2 ? '매매전략 접기' : '매매전략 더 보기'}
          >
            {showFullProcess2 ? '접기 ▲' : '더 보기 ▼'}
          </button>
        )}

        {/* 실제 체결 결과 섹션 (있을 경우에만 표시) */}
        {data.executionSummary && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border-l-2 border-green-400">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-green-800">📊 실제 체결 결과</span>
            </div>
            <p className="text-xs text-green-700 whitespace-pre-line leading-relaxed">
              {data.executionSummary}
            </p>
          </div>
        )}
      </div>

      {/* 도움말 */}
      <div className="text-xs text-slate-500 bg-white p-3 rounded-lg border border-slate-200">
        <p className="flex items-start gap-2">
          <span className="text-blue-600 flex-shrink-0">💡</span>
          <span>
            <strong className="text-blue-700">CIO</strong>는 포트폴리오 전체 비중을 결정하고,{' '}
            <strong className="text-green-700">매매전략</strong>은 실시간 매매 타이밍을 판단합니다.
          </span>
        </p>
      </div>
    </div>
  );
}
