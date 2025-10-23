/**
 * ⚠️ CIO Unrealized Loss Monitoring Component (미실현 손실 모니터링)
 *
 * 목적: CIO 리포트의 "5. 미실현 손실 모니터링" 섹션 표시
 * 데이터: cio_reports.full_content_md에서 섹션 5 추출
 *
 * 디자인:
 * - Red/Orange 경고 그라데이션
 * - 위험 관리 경고 아이콘
 * - 시각적으로 눈에 띄는 경고 스타일
 */
'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface CIOUnrealizedLossProps {
  selectedDate: Date;
}

interface UnrealizedLossData {
  content: string;
  reportDate: string;
}

/**
 * 섹션 5 추출 함수
 */
function extractUnrealizedLoss(fullContentMd: string): string | null {
  // "5. 미실현 손실 모니터링" 섹션 추출
  const regex = /##?\s*5\.\s*미실현\s*손실\s*모니터링([\s\S]*?)(?=##?\s*6\.|$)/i;
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

async function fetchUnrealizedLossByDate(selectedDate: Date): Promise<UnrealizedLossData | null> {
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
  const content = extractUnrealizedLoss(fullContentMd);

  if (!content) return null;

  return {
    content,
    reportDate: typeof rawData['report_date'] === 'string' ? rawData['report_date'] : '',
  };
}

export function CIOUnrealizedLoss({ selectedDate }: CIOUnrealizedLossProps) {
  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<UnrealizedLossData | null>(
    ['cio-unrealized-loss', dateKey],
    () => dateKey !== 'invalid-date' ? fetchUnrealizedLossByDate(selectedDate) : null,
    { refreshInterval: 30000 }
  );

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-24 bg-slate-200 rounded"></div>
      </div>
    );
  }

  // 데이터 없음
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">⚠️ 미실현 손실 모니터링</h2>
        <p className="text-slate-600">해당 날짜의 미실현 손실 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">⚠️ 미실현 손실 모니터링</h2>

      {/* Red/Orange 경고 그라데이션 박스 */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-5 border-2 border-red-200">
        <div className="flex items-start gap-4">
          {/* 경고 아이콘 */}
          <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-md">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* 내용 */}
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-900 mb-3">
              🚨 위험 관리 경고
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
