/**
 * CIO 의사결정 타임라인 컴포넌트
 *
 * 목적: 특정 날짜의 CIO 결정들을 시간순으로 타임라인 형태로 표시
 *
 * 주요 기능:
 * - 시간순 결정 타임라인 (최신순)
 * - 코인별 결정 카드 (클릭 시 상세 패널 표시)
 * - 비중 변화 표시 (이전 → 현재)
 * - 관리 상태 배지
 * - 시장 체제 표시
 *
 * Props:
 * - selectedDate?: Date - 조회할 날짜 (기본값: 오늘)
 * - onCoinClick?: (decision: CIODecision) => void - 코인 클릭 시 콜백
 *
 * 데이터 소스: cio_portfolio_decisions 테이블
 */

'use client';

import { useCIODecisions, type CIODecision } from '@/lib/hooks/useCIODecisions';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  selectedDate?: Date;
  onCoinClick?: (decision: CIODecision) => void;
}

export function CIODecisionTimeline({ selectedDate, onCoinClick }: Props) {
  const { decisions, isLoading, error } = useCIODecisions(selectedDate);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          ⏱️ CIO 의사결정 타임라인
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    console.error('[CIODecisionTimeline] Error:', error);
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          ⏱️ CIO 의사결정 타임라인
        </h2>
        <p className="text-red-500 text-sm">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  // 데이터 없음
  if (decisions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          ⏱️ CIO 의사결정 타임라인
        </h2>
        <p className="text-slate-500 text-sm">
          해당 날짜의 CIO 결정 데이터가 없습니다.
        </p>
      </div>
    );
  }

  // 시장 체제별 색상
  const getRegimeColor = (regime?: string) => {
    switch (regime) {
      case 'Uptrend':
        return 'bg-green-100 text-green-700';
      case 'Downtrend':
        return 'bg-red-100 text-red-700';
      case 'Range_Bound':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  // 관리 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case '활성':
        return 'bg-blue-100 text-blue-700';
      case '재평가':
        return 'bg-orange-100 text-orange-700';
      case '제외':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          ⏱️ CIO 의사결정 타임라인
        </h2>
        <p className="text-sm text-slate-500">
          시간순 결정 내역 ({decisions.length}건)
        </p>
      </div>

      {/* 타임라인 */}
      <div className="relative">
        {/* 수직선 */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

        {/* 결정 카드들 */}
        <div className="space-y-6">
          {decisions.map((decision, index) => {
            const timeAgo = formatDistanceToNow(new Date(decision.결정시각), {
              addSuffix: true,
              locale: ko,
            });

            const hasWeightChange =
              decision.이전목표비중 !== null &&
              decision.비중변화량 !== 0;

            return (
              <div
                key={`${decision.코인이름}-${decision.결정시각}-${index}`}
                className="relative pl-12 cursor-pointer hover:bg-slate-50 rounded-lg p-4 transition-colors"
                onClick={() => onCoinClick?.(decision)}
              >
                {/* 타임라인 점 */}
                <div className="absolute left-0 top-6 w-8 h-8 bg-blue-500 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                  <span className="text-xs font-bold text-white">
                    {index + 1}
                  </span>
                </div>

                {/* 카드 내용 */}
                <div className="border border-slate-200 rounded-lg p-4">
                  {/* 헤더: 코인 이름 + 시간 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {decision.코인이름}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(decision.관리상태)}`}>
                        {decision.관리상태}
                      </span>
                      {decision.시장체제 && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getRegimeColor(decision.시장체제)}`}>
                          {decision.시장체제}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{timeAgo}</span>
                  </div>

                  {/* 비중 정보 */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <span className="text-xs text-slate-500">목표 비중</span>
                      <div className="text-lg font-bold text-slate-900">
                        {decision.목표비중?.toFixed(1) || '0.0'}%
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">현재 보유</span>
                      <div className="text-lg font-bold text-slate-900">
                        {decision.현재보유비중?.toFixed(1) || '0.0'}%
                      </div>
                    </div>
                    {hasWeightChange && (
                      <>
                        <div>
                          <span className="text-xs text-slate-500">이전 목표</span>
                          <div className="text-sm font-semibold text-slate-600">
                            {decision.이전목표비중?.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">변화량</span>
                          <div
                            className={`text-sm font-bold ${
                              decision.비중변화량! > 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {decision.비중변화량! > 0 ? '+' : ''}
                            {decision.비중변화량?.toFixed(1)}%p
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 전략 근거 (첫 2줄만) */}
                  {decision.전략근거 && (
                    <div className="text-sm text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded">
                      {decision.전략근거}
                    </div>
                  )}

                  {/* 추가 정보 */}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {decision.공포탐욕지수 !== null && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                        😨 F&G: {decision.공포탐욕지수}
                      </span>
                    )}
                    {decision.샤프비율 !== null && decision.샤프비율 !== 0 && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                        📊 Sharpe: {decision.샤프비율?.toFixed(2)}
                      </span>
                    )}
                    {decision.기대수익률 !== null && decision.기대수익률 !== 0 && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                        💰 기대수익: {decision.기대수익률?.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 푸터 */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          💡 카드를 클릭하면 상세 정보를 볼 수 있습니다
        </p>
      </div>
    </div>
  );
}
