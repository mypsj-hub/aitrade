/**
 * 📊 CIO Trading Frequency Analysis Component (거래빈도 분석)
 *
 * 목적: CIO 리포트의 "6. 거래빈도 분석" 섹션 표시
 * 데이터: cio_reports.full_content_md에서 섹션 6 추출
 *
 * 디자인:
 * - Teal/Cyan 통계 그라데이션
 * - 3개 핵심 지표 카드 (최근 7일, 월평균, 목표 빈도)
 * - 간결한 통계 표시
 */
'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface CIOTradingFrequencyProps {
  selectedDate: Date;
}

interface TradingFrequencyData {
  content: string;
  reportDate: string;
}

/**
 * 섹션 6 추출 함수
 */
function extractTradingFrequency(fullContentMd: string): string | null {
  // "6. 거래빈도 분석" 섹션 추출
  const regex = /##?\s*6\.\s*거래\s*빈도\s*분석([\s\S]*?)(?=##?\s*7\.|$)/i;
  const match = fullContentMd.match(regex);

  if (!match || !match[1]) {
    return null;
  }

  // 마크다운 정리 (카테고리 번호, **, *, #, 과도한 줄바꿈 제거)
  let content = match[1]
    .replace(/#{1,6}\s*/g, '')              // # 제거 (공백 여부 무관)
    .replace(/\*\*/g, '')                   // ** 제거
    .replace(/\*/g, '')                     // * 제거
    .replace(/^[-*]\s/gm, '• ')             // 리스트 마커 정리
    .replace(/\n\s*\n\s*\n/g, '\n\n')       // 과도한 줄바꿈 제거
    .trim();

  return content || null;
}

async function fetchTradingFrequencyByDate(selectedDate: Date): Promise<TradingFrequencyData | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: rawDataArray, error } = await supabase
    .from('cio_reports')
    .select('full_content_md, report_date')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  if (error || !rawDataArray || rawDataArray.length === 0) return null;
  const rawData = rawDataArray[0];

  const fullContentMd = typeof rawData['full_content_md'] === 'string' ? rawData['full_content_md'] : '';
  const content = extractTradingFrequency(fullContentMd);

  if (!content) return null;

  return {
    content,
    reportDate: typeof rawData['report_date'] === 'string' ? rawData['report_date'] : '',
  };
}

export function CIOTradingFrequency({ selectedDate }: CIOTradingFrequencyProps) {
  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<TradingFrequencyData | null>(
    ['cio-trading-frequency', dateKey],
    () => dateKey !== 'invalid-date' ? fetchTradingFrequencyByDate(selectedDate) : null,
    { refreshInterval: 30000 }
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-200 rounded"></div>
      </div>
    );
  }

  // 데이터 없음
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📊 거래빈도 분석</h2>
        <p className="text-slate-600">해당 날짜의 거래빈도 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">📊 거래빈도 분석</h2>

      {/* Teal/Cyan 통계 그라데이션 박스 */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-5 border border-teal-200">
        <div className="flex items-start gap-4">
          {/* 차트 아이콘 */}
          <div className="flex-shrink-0 w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          {/* 내용 */}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-teal-900 mb-3">
              📈 거래 활동 통계
            </h3>
            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {data.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
