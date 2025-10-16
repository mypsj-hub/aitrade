'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface SelfCritiqueData {
  bestDecision: string;
  roomForImprovement: string;
  strategicConsistency: string;
  reportDate: string;
}

// Supabase 원본 데이터를 타입 안전한 형태로 변환
function transformSelfCritiqueData(raw: Record<string, unknown>): {
  bestDecision: string;
  roomForImprovement: string;
  strategicConsistency: string;
} {
  const critique = raw['self_critique'] as Record<string, unknown> | null;

  // critique가 없거나 null이면 빈 문자열 반환
  if (!critique || typeof critique !== 'object') {
    return {
      bestDecision: '',
      roomForImprovement: '',
      strategicConsistency: '',
    };
  }

  return {
    bestDecision: typeof critique['best_decision'] === 'string' ? critique['best_decision'] : '',
    roomForImprovement: typeof critique['room_for_improvement'] === 'string' ? critique['room_for_improvement'] : '',
    strategicConsistency: typeof critique['strategic_consistency'] === 'string' ? critique['strategic_consistency'] : '',
  };
}

async function fetchSelfCritiqueByDate(selectedDate: Date): Promise<SelfCritiqueData | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: rawDataArray, error } = await supabase
    .from('cio_reports')
    .select('*')
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
