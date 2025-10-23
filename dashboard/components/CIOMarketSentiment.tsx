/**
 * 🎭 CIO Market Sentiment Change Component (시장 심리 변화)
 *
 * 목적: CIO 리포트의 "7. 시장 심리 변화" 섹션 표시
 * 데이터: cio_reports.full_content_md에서 섹션 7 추출
 *
 * 디자인:
 * - Purple/Indigo 그라데이션
 * - Before/After 비교 형식
 * - Fear & Greed Index 변화 시각화
 */
'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface CIOMarketSentimentProps {
  selectedDate: Date;
}

interface MarketSentimentData {
  content: string;
  reportDate: string;
}

/**
 * 섹션 7 추출 함수
 */
function extractMarketSentiment(fullContentMd: string): string | null {
  // "7. 시장 심리 변화" 섹션 추출
  const regex = /##?\s*7\.\s*시장\s*심리\s*변화([\s\S]*?)(?=##?\s*8\.|$)/i;
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

async function fetchMarketSentimentByDate(selectedDate: Date): Promise<MarketSentimentData | null> {
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
  const content = extractMarketSentiment(fullContentMd);

  if (!content) return null;

  return {
    content,
    reportDate: typeof rawData['report_date'] === 'string' ? rawData['report_date'] : '',
  };
}

export function CIOMarketSentiment({ selectedDate }: CIOMarketSentimentProps) {
  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<MarketSentimentData | null>(
    ['cio-market-sentiment', dateKey],
    () => dateKey !== 'invalid-date' ? fetchMarketSentimentByDate(selectedDate) : null,
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
        <h2 className="text-xl font-bold text-slate-800 mb-4">🎭 시장 심리 변화</h2>
        <p className="text-slate-600">해당 날짜의 시장 심리 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">🎭 시장 심리 변화</h2>

      {/* Purple/Indigo 그라데이션 박스 */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-5 border border-purple-200">
        <div className="flex items-start gap-4">
          {/* 심리 아이콘 */}
          <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
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
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* 내용 */}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-purple-900 mb-3">
              📊 Fear & Greed Index 변화
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
