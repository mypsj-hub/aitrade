/**
 * AI CIO 최신 전략 카드
 *
 * 목적: AI CIO가 작성한 최신 투자전략 보고서를 대시보드에 표시하기 위함
 * 역할: CIO 리포트의 최신 전략과 근거를 요약하여 사용자에게 제공
 *
 * 주요 기능:
 * - 가장 최근 CIO 전략 자동 조회
 * - 전략 제목과 근거(rationale) 표시
 * - 200자로 제한된 요약본 제공 (포트폴리오와 동일)
 * - 펼치기/접기 토글 기능 (전체 내용 보기)
 * - 60초마다 자동 갱신
 * - 그라데이션 배경으로 강조 표시
 *
 * 데이터 소스: system_status 테이블 (status_key='cio_latest_rationale')
 * 기술 스택: SWR, Supabase
 */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { formatDateTime } from '@/lib/utils/formatters';

interface CIOStrategy {
  reportDate: string;
  title: string;
  rationale: string;
}

async function fetchLatestStrategy(): Promise<CIOStrategy | null> {
  // system_status 테이블에서 cio_latest_rationale 조회
  const { data } = await supabase
    .from('system_status')
    .select('status_value, last_updated')
    .eq('status_key', 'cio_latest_rationale')
    .single();

  if (!data || !data.status_value) return null;

  // status_value에서 첫 문장을 제목으로 사용
  const lines = data.status_value.split('\n').filter((line: string) => line.trim() !== '');
  const firstLine = lines[0] || '투자 전략';

  // 본문에서는 첫 줄 제외 (중복 방지)
  const rationaleWithoutTitle = lines.slice(1).join('\n').trim();

  return {
    reportDate: data.last_updated,
    title: firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine,
    rationale: rationaleWithoutTitle || data.status_value, // fallback: 원본 전체
  };
}

export function CIOStrategyCard() {
  const [showFullContent, setShowFullContent] = useState(false);
  
  const { data, isLoading } = useSWR<CIOStrategy | null>(
    'latest-cio-strategy',
    fetchLatestStrategy,
    { refreshInterval: 60000 }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🤖 AI CIO 최신 전략</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-100 rounded w-3/4"></div>
          <div className="h-4 bg-slate-100 rounded w-full"></div>
          <div className="h-4 bg-slate-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🤖 AI CIO 최신 전략</h2>
        <p className="text-slate-500 text-sm">전략 보고서가 없습니다.</p>
      </div>
    );
  }

  // Rationale을 최대 200자로 제한 (포트폴리오와 동일)
  const shortRationale = data.rationale.length > 200
    ? data.rationale.substring(0, 200) + '...'
    : data.rationale;

  const displayContent = showFullContent ? data.rationale : shortRationale;

  // UTC 시간에서 9시간 빼기 (데이터베이스 저장 방식 보정)
  const adjustedDate = new Date(data.reportDate);
  adjustedDate.setHours(adjustedDate.getHours() - 9);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">🤖 AI CIO 최신 전략</h2>
        <span className="text-xs text-slate-500">{formatDateTime(adjustedDate.toISOString())}</span>
      </div>

      <h3 className="text-lg font-semibold text-slate-700 mb-3">
        {data.title}
      </h3>

      <div className="max-h-96 overflow-y-auto">
        <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
          {displayContent}
        </p>
      </div>

      {data.rationale.length > 200 && (
        <div className="mt-4">
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline transition"
          >
            {showFullContent ? '← 간략히 보기' : '전체 내용 보기 →'}
          </button>
        </div>
      )}
    </div>
  );
}
