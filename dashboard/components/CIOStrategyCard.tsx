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

  // Rationale을 최대 200자로 제한
  const shortRationale = data.rationale.length > 200
    ? data.rationale.substring(0, 200) + '...'
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

      <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
        {shortRationale}
      </p>

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
