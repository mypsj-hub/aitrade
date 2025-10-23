/**
 * CIO 자가 평가
 *
 * 목적: AI CIO의 자기 반성과 평가를 4개 카테고리로 나누어 표시하기 위함
 * 역할: 최고의 결정, 개선할 점, 전략 일관성, 내일의 전략을 각각 색상 구분된 카드로 표시
 *
 * 주요 기능:
 * - 최고의 결정(Best Decision): 초록색 카드로 표시
 * - 개선할 점(Room for Improvement): 노란색 카드로 표시
 * - 전략 일관성(Strategic Consistency): 파란색 카드로 표시
 * - 내일의 전략(Tomorrow Strategy): 보라색 카드로 표시
 * - 선택된 날짜의 DAILY 리포트에서 self_critique 및 full_content_md 추출
 * - 30초마다 자동 갱신
 * - 2x2 그리드 레이아웃 (반응형)
 *
 * Props:
 * - selectedDate: Date - 조회할 날짜
 *
 * 데이터 소스: cio_reports 테이블 (self_critique JSONB 필드, full_content_md)
 * 기술 스택: SWR, Supabase, date-fns
 */
'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface SelfCritiqueData {
  bestDecision: string;
  roomForImprovement: string;
  strategicConsistency: string;
  tomorrowStrategy: string;
  reportDate: string;
}

// "내일의 전략" 섹션 추출 (10번 섹션)
function extractTomorrowStrategy(fullContentMd: string): string {
  const regex = /##?\s*10\.\s*내일의?\s*전략([\s\S]*?)$/i;
  const match = fullContentMd.match(regex);

  if (match && match[1]) {
    // 마크다운 정리
    const content = match[1]
      .replace(/#{1,6}\s*/g, '')              // # 제거
      .replace(/\*\*/g, '')                   // ** 제거
      .replace(/\*/g, '')                     // * 제거
      .replace(/^[-*]\s/gm, '• ')             // 리스트 마커 정리
      .replace(/\n\s*\n\s*\n/g, '\n\n')       // 과도한 줄바꿈 제거
      .trim();
    return content;
  }

  return '';
}

// Supabase 원본 데이터를 타입 안전한 형태로 변환
function transformSelfCritiqueData(raw: Record<string, unknown>): {
  bestDecision: string;
  roomForImprovement: string;
  strategicConsistency: string;
  tomorrowStrategy: string;
} {
  const critique = raw['self_critique'] as Record<string, unknown> | null;
  const fullContentMd = typeof raw['full_content_md'] === 'string' ? raw['full_content_md'] : '';

  // critique가 없거나 null이면 빈 문자열 반환
  const critiqueData = critique && typeof critique === 'object' ? {
    bestDecision: typeof critique['best_decision'] === 'string' ? critique['best_decision'] : '',
    roomForImprovement: typeof critique['room_for_improvement'] === 'string' ? critique['room_for_improvement'] : '',
    strategicConsistency: typeof critique['strategic_consistency'] === 'string' ? critique['strategic_consistency'] : '',
  } : {
    bestDecision: '',
    roomForImprovement: '',
    strategicConsistency: '',
  };

  return {
    ...critiqueData,
    tomorrowStrategy: extractTomorrowStrategy(fullContentMd),
  };
}

async function fetchSelfCritiqueByDate(selectedDate: Date): Promise<SelfCritiqueData | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: rawDataArray, error } = await supabase
    .from('cio_reports')
    .select('self_critique, full_content_md, report_date')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  if (error || !rawDataArray || rawDataArray.length === 0) return null;
  const rawData = rawDataArray[0];

  const transformed = transformSelfCritiqueData(rawData as Record<string, unknown>);

  return {
    ...transformed,
    reportDate: typeof rawData['report_date'] === 'string' ? rawData['report_date'] : '',
  };
}

interface CIOSelfCritiqueProps {
  selectedDate: Date;
}

export function CIOSelfCritique({ selectedDate }: CIOSelfCritiqueProps) {
  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data, isLoading } = useSWR<SelfCritiqueData | null>(
    ['cio-self-critique', dateKey],
    () => dateKey !== 'invalid-date' ? fetchSelfCritiqueByDate(selectedDate) : null,
    { refreshInterval: 30000 } // 30초 간격 갱신
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🔍 AI 자가 평가</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 bg-slate-100 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded"></div>
                <div className="h-4 bg-slate-100 rounded"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">🔍 AI 자가 평가</h2>
        <p className="text-slate-500 text-sm">자가 평가 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">🔍 AI 자가 평가</h2>
        <span className="text-xs text-slate-500">{data.reportDate}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Decision - 최고의 결정 */}
        <div className="bg-green-50 rounded-lg p-5 border border-green-200">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">✅</span>
            <h3 className="text-lg font-bold text-green-800">최고의 결정</h3>
          </div>
          {data.bestDecision ? (
            <p className="text-sm text-green-900 whitespace-pre-line leading-relaxed">
              {data.bestDecision}
            </p>
          ) : (
            <p className="text-sm text-green-700/60">데이터 없음</p>
          )}
        </div>

        {/* Room for Improvement - 개선할 점 */}
        <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">⚠️</span>
            <h3 className="text-lg font-bold text-yellow-800">개선할 점</h3>
          </div>
          {data.roomForImprovement ? (
            <p className="text-sm text-yellow-900 whitespace-pre-line leading-relaxed">
              {data.roomForImprovement}
            </p>
          ) : (
            <p className="text-sm text-yellow-700/60">데이터 없음</p>
          )}
        </div>

        {/* Strategic Consistency - 전략 일관성 */}
        <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">💡</span>
            <h3 className="text-lg font-bold text-blue-800">전략 일관성</h3>
          </div>
          {data.strategicConsistency ? (
            <p className="text-sm text-blue-900 whitespace-pre-line leading-relaxed">
              {data.strategicConsistency}
            </p>
          ) : (
            <p className="text-sm text-blue-700/60">데이터 없음</p>
          )}
        </div>

        {/* Tomorrow Strategy - 내일의 전략 */}
        <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🚀</span>
            <h3 className="text-lg font-bold text-purple-800">내일의 전략</h3>
          </div>
          {data.tomorrowStrategy ? (
            <p className="text-sm text-purple-900 whitespace-pre-line leading-relaxed">
              {data.tomorrowStrategy}
            </p>
          ) : (
            <p className="text-sm text-purple-700/60">데이터 없음</p>
          )}
        </div>
      </div>
    </div>
  );
}
