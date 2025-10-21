/**
 * CIO 시장 및 성과 요약 컴포넌트
 *
 * 목적: CIO 리포트의 "1. 시장 및 성과 요약" 섹션을 표시
 *
 * 주요 기능:
 * - full_content_md에서 "1. 시장 및 성과 요약" 섹션 추출
 * - 마크다운 렌더링으로 가독성 높은 표시
 * - 폴더블 섹션 (펼치기/접기)
 *
 * Props:
 * - selectedDate: Date - 조회할 날짜
 *
 * 데이터 소스: cio_reports.full_content_md
 */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function fetchCIOReport(selectedDate: Date): Promise<string | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('cio_reports')
    .select('full_content_md')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  if (error || !data || data.length === 0) return null;

  return data[0].full_content_md || null;
}

// "1. 시장 및 성과 요약" 섹션 추출
function extractMarketSummary(fullContentMd: string): string | null {
  // "1. 시장 및 성과 요약"과 "2. 주요 매매" 사이의 텍스트 추출
  const regex = /##?\s*1\.\s*시장\s*및\s*성과\s*요약([\s\S]*?)(?=##?\s*2\.|$)/i;
  const match = fullContentMd.match(regex);

  if (match && match[1]) {
    return `## 1. 시장 및 성과 요약\n${match[1].trim()}`;
  }

  return null;
}

interface CIOMarketSummaryProps {
  selectedDate: Date;
}

export function CIOMarketSummary({ selectedDate }: CIOMarketSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data: fullContent, isLoading } = useSWR<string | null>(
    ['cio-market-summary', dateKey],
    () => dateKey !== 'invalid-date' ? fetchCIOReport(selectedDate) : null,
    { refreshInterval: 30000 } // 30초 간격 갱신
  );

  const summaryContent = fullContent ? extractMarketSummary(fullContent) : null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!summaryContent) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">📊 1. 시장 및 성과 요약</h3>
        <p className="text-sm text-slate-500">해당 날짜의 리포트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
      >
        <h3 className="text-lg font-bold text-slate-800">📊 1. 시장 및 성과 요약</h3>
        <svg
          className={`w-5 h-5 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {summaryContent}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
