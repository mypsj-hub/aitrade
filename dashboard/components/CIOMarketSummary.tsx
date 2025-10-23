/**
 * CIO 시장 및 성과 요약 컴포넌트
 *
 * 목적: CIO 리포트의 "1. 시장 및 성과 요약" 섹션을 AI CIO 최신전략 배너 스타일로 표시
 *
 * 주요 기능:
 * - full_content_md에서 "1. 시장 및 성과 요약" 섹션 추출
 * - 그라데이션 배경(indigo to purple)으로 시각적 강조
 * - 200자 요약본 표시 및 전체 내용 펼치기/접기 기능
 * - 제목은 "AI CIO 최신 전략" 유지, 내용만 시장 및 성과 요약으로 변경
 * - CIOInsightBanner와 동일한 디자인
 *
 * Props:
 * - selectedDate: Date - 조회할 날짜
 *
 * 데이터 소스: cio_reports.full_content_md, title
 */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface CIOReport {
  reportDate: string;
  title: string;
  marketSummary: string;
}

async function fetchCIOReport(selectedDate: Date): Promise<CIOReport | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('cio_reports')
    .select('report_date, title, full_content_md')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const report = data[0];
  const fullContentMd = report.full_content_md || '';

  // "1. 시장 및 성과 요약" 섹션 추출
  const regex = /##?\s*1\.\s*시장\s*및\s*성과\s*요약([\s\S]*?)(?=##?\s*2\.|$)/i;
  const match = fullContentMd.match(regex);

  let marketSummary = '';
  if (match && match[1]) {
    // 마크다운 제거 (##, *, - 등)
    marketSummary = match[1]
      .replace(/#{1,6}\s/g, '')  // 헤더 제거
      .replace(/\*\*/g, '')       // 볼드 제거
      .replace(/\*/g, '')         // 이탤릭 제거
      .replace(/^[-*]\s/gm, '')   // 리스트 마커 제거
      .trim();
  }

  return {
    reportDate: report.report_date,
    title: report.title || 'AI CIO 전략 보고서',
    marketSummary: marketSummary || '시장 및 성과 요약이 없습니다.',
  };
}

interface CIOMarketSummaryProps {
  selectedDate: Date;
}

export function CIOMarketSummary({ selectedDate }: CIOMarketSummaryProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<CIOReport | null>(
    ['cio-market-summary', dateKey],
    () => dateKey !== 'invalid-date' ? fetchCIOReport(selectedDate) : null,
    { refreshInterval: 5000 } // 5초 간격 갱신
  );

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/20 rounded w-1/3"></div>
          <div className="h-4 bg-white/20 rounded w-2/3"></div>
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 시장 및 성과 요약</h2>
        <p className="text-white/80">전략 보고서가 아직 생성되지 않았습니다.</p>
      </div>
    );
  }

  // 전략 내용을 200자로 제한
  const shortSummary = data.marketSummary.length > 200
    ? data.marketSummary.substring(0, 200) + '...'
    : data.marketSummary;

  const displayContent = showFullContent ? data.marketSummary : shortSummary;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">📊 시장 및 성과 요약</h2>
          <h3 className="text-xl font-semibold text-white/90">{data.title}</h3>
        </div>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          {data.reportDate}
        </span>
      </div>

      <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
        {displayContent}
      </p>

      {data.marketSummary.length > 200 && (
        <div className="mt-4">
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-white/80 hover:text-white text-sm font-medium underline transition"
          >
            {showFullContent ? '← 간략히 보기' : '전체 내용 보기 →'}
          </button>
        </div>
      )}
    </div>
  );
}
