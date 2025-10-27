/**
 * 내일 전망 카드
 *
 * 목적: AI CIO의 다음 날 시장 전망 및 If-Then 전략 표시
 * 데이터: cio_reports.raw_json_data.outlook_for_tomorrow
 *
 * 주요 기능:
 * - 내일 전망 내용 표시
 * - If-Then 전략 하이라이팅
 * - 펼치기/접기 기능
 */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

async function fetchOutlook(selectedDate: Date): Promise<string | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: dataArray, error } = await supabase
    .from('cio_reports')
    .select('raw_json_data')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  if (error || !dataArray || dataArray.length === 0) return null;

  const rawData = dataArray[0].raw_json_data;
  if (!rawData?.outlook_for_tomorrow) return null;

  return rawData.outlook_for_tomorrow;
}

interface OutlookCardProps {
  selectedDate: Date;
}

export function OutlookCard({ selectedDate }: OutlookCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<string | null>(
    ['outlook', dateKey],
    () => dateKey !== 'invalid-date' ? fetchOutlook(selectedDate) : null,
    { refreshInterval: 30000 }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🔮 내일 전망</h2>
        <p className="text-slate-600">내일 전망 데이터가 없습니다.</p>
      </div>
    );
  }

  // If-Then 구문 하이라이팅을 위한 텍스트 처리
  const highlightIfThen = (text: string) => {
    // If, Then으로 시작하는 문장을 찾아서 하이라이트
    const parts = text.split(/(\bIf,|\bThen,)/gi);

    return parts.map((part, index) => {
      if (part.match(/^If,$/i)) {
        return (
          <span key={index} className="font-bold text-blue-700 bg-blue-50 px-1 rounded">
            {part}
          </span>
        );
      } else if (part.match(/^Then,$/i)) {
        return (
          <span key={index} className="font-bold text-green-700 bg-green-50 px-1 rounded">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // 200자로 제한된 미리보기
  const shortContent = data.length > 200 ? data.substring(0, 200) + '...' : data;
  const displayContent = isExpanded ? data : shortContent;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-6 border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          🔮 내일 전망
          <span className="text-sm font-normal text-slate-600">
            ({format(selectedDate, 'yyyy-MM-dd')})
          </span>
        </h2>
        {data.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium underline transition"
          >
            {isExpanded ? '간략히 보기' : '전체 보기'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg p-5 border border-purple-100">
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
          {highlightIfThen(displayContent)}
        </p>
      </div>

      {/* If-Then 전략 설명 */}
      <div className="mt-4 flex items-start gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-blue-100 border border-blue-300 rounded"></span>
          <span className="text-slate-600">
            <span className="font-semibold text-blue-700">If</span> = 조건
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 bg-green-100 border border-green-300 rounded"></span>
          <span className="text-slate-600">
            <span className="font-semibold text-green-700">Then</span> = 행동
          </span>
        </div>
      </div>
    </div>
  );
}
