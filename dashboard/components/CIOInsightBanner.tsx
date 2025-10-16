/**
 * CIO 인사이트 배너
 *
 * 목적: 선택된 날짜의 AI CIO 전략을 눈에 띄게 상단에 표시하기 위함
 * 역할: 그라데이션 배경의 배너 형태로 CIO 리포트 전략 내용 강조 표시
 *
 * 주요 기능:
 * - 선택된 날짜의 DAILY CIO 리포트 자동 조회
 * - 전략 제목과 내용을 배너 형태로 표시
 * - 200자 요약본 표시 및 전체 내용 펼치기/접기 기능
 * - 그라데이션 배경(indigo to purple)으로 시각적 강조
 * - 5초마다 자동 갱신
 * - 로딩 및 데이터 없음 상태 처리
 *
 * Props:
 * - selectedDate: Date - 조회할 날짜
 *
 * 데이터 소스: cio_reports 테이블 (report_type='DAILY')
 * 기술 스택: SWR, Supabase, date-fns
 */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface CIOInsight {
  reportDate: string;
  title: string;
  rationale: string;
}

async function fetchInsightByDate(selectedDate: Date): Promise<CIOInsight | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: dataArray, error } = await supabase
    .from('cio_reports')
    .select('report_date, title, cio_latest_rationale')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  if (error || !dataArray || dataArray.length === 0) return null;
  const data = dataArray[0];

  return {
    reportDate: data.report_date,
    title: data.title || 'AI CIO 전략 보고서',
    rationale: data.cio_latest_rationale || '전략 내용이 없습니다.',
  };
}

interface CIOInsightBannerProps {
  selectedDate: Date;
}

export function CIOInsightBanner({ selectedDate }: CIOInsightBannerProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<CIOInsight | null>(
    ['cio-insight-banner', dateKey],
    () => dateKey !== 'invalid-date' ? fetchInsightByDate(selectedDate) : null,
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
        <h2 className="text-2xl font-bold mb-2">🤖 AI CIO 최신 전략</h2>
        <p className="text-white/80">전략 보고서가 아직 생성되지 않았습니다.</p>
      </div>
    );
  }

  // 전략 내용을 200자로 제한
  const shortRationale = data.rationale.length > 200
    ? data.rationale.substring(0, 200) + '...'
    : data.rationale;

  const displayContent = showFullContent ? data.rationale : shortRationale;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">🤖 AI CIO 최신 전략</h2>
          <h3 className="text-xl font-semibold text-white/90">{data.title}</h3>
        </div>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
          {data.reportDate}
        </span>
      </div>

      <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
        {displayContent}
      </p>

      {data.rationale.length > 200 && (
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
