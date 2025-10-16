/**
 * AI CIO 최신 전략 카드
 *
 * 목적: AI CIO가 작성한 최신 투자전략 보고서를 대시보드에 표시하기 위함
 * 역할: CIO 리포트의 최신 전략과 근거를 요약하여 사용자에게 제공
 *
 * 주요 기능:
 * - 가장 최근 CIO 리포트 자동 조회
 * - 전략 제목과 근거(rationale) 표시
 * - 600자로 제한된 요약본 제공
 * - 전체 분석 페이지로 이동 링크
 * - 60초마다 자동 갱신
 * - 그라데이션 배경으로 강조 표시
 *
 * 데이터 소스: cio_reports 테이블
 * 기술 스택: SWR, Supabase, Next.js Link
 */
'use client';

import Link from 'next/link';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

interface CIOStrategy {
  reportDate: string;
  title: string;
  rationale: string;
}

async function fetchLatestStrategy(): Promise<CIOStrategy | null> {
  const { data } = await supabase
    .from('cio_reports')
    .select('report_date, title, cio_latest_rationale, outlook')
    .order('report_date', { ascending: false })
    .limit(1)
    .single();

  if (!data) return null;

  return {
    reportDate: data.report_date,
    title: data.title || '전략 보고서',
    rationale: data.cio_latest_rationale || data.outlook || '전략 내용 없음',
  };
}

export function CIOStrategyCard() {
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

  // Rationale을 최대 600자로 제한 (확대)
  const shortRationale = data.rationale.length > 600
    ? data.rationale.substring(0, 600) + '...'
    : data.rationale;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">🤖 AI CIO 최신 전략</h2>
        <span className="text-xs text-slate-500">{data.reportDate}</span>
      </div>

      <h3 className="text-lg font-semibold text-slate-700 mb-3">
        {data.title}
      </h3>

      <div className="max-h-96 overflow-y-auto">
        <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
          {shortRationale}
        </p>
      </div>

      <Link
        href="/analysis"
        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition"
      >
        전체 분석 보기
        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
