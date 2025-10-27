/**
 * 신규 편입 코인 카드 컴포넌트
 *
 * 목적: 최근 7일간 신규 편입된 코인 목록을 시각적으로 강조하여 표시
 *
 * 주요 기능:
 * - 신규 편입 코인 목록 표시 (AI 순위순)
 * - 검증 티어별 배지 (✅ VERIFIED, ⚠️ PARTIAL, ⚡ MINIMAL, 🔄 ALTERNATIVE)
 * - 샤프 비율 표시
 * - 목표 비중 표시
 * - 편입 날짜 표시
 * - 신규 편입이 없을 경우 null 반환 (조건부 렌더링)
 *
 * 스타일:
 * - 노란색 강조 배경 (bg-yellow-50, border-yellow-400)
 * - 반응형 그리드 레이아웃
 * - 모바일 최적화 (1컬럼 → 2컬럼)
 */

'use client';

import { useNewCoins } from '@/lib/hooks/useNewCoins';
import { getTierDisplay } from '@/lib/utils/detectNewCoins';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

export function NewCoinsCard() {
  const { newCoins, isLoading, error } = useNewCoins(7);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🆕</span>
          <h2 className="text-xl font-bold text-slate-800">신규 편입 코인</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    console.error('[NewCoinsCard] Error:', error);
    return null; // 에러 시 숨김
  }

  // 신규 편입 코인이 없으면 카드 자체를 숨김
  if (newCoins.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-6 animate-pulse-slow">
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🆕</span>
          <h2 className="text-xl font-bold text-slate-800">신규 편입 코인</h2>
        </div>
        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded">
          최근 7일
        </span>
      </div>

      {/* 신규 편입 코인 리스트 */}
      <div className="space-y-3">
        {newCoins.map((coin, index) => {
          const tierInfo = getTierDisplay(coin.검증티어);
          const timeAgo = formatDistanceToNow(new Date(coin.결정시각), {
            addSuffix: true,
            locale: ko,
          });

          return (
            <div
              key={`${coin.코인이름}-${coin.결정시각}-${index}`}
              className="bg-white border border-yellow-300 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* 코인 정보 헤더 */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* AI 순위 배지 */}
                  {coin.AI순위 && (
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full">
                      {coin.AI순위}
                    </span>
                  )}
                  {/* 코인 이름 */}
                  <h3 className="text-lg font-bold text-slate-900">
                    {coin.코인이름}
                  </h3>
                </div>

                {/* 검증 티어 배지 */}
                {coin.검증티어 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs">
                    <span>{tierInfo.emoji}</span>
                    <span className={`font-semibold ${tierInfo.color}`}>
                      {tierInfo.label}
                    </span>
                  </div>
                )}
              </div>

              {/* 상세 정보 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {/* 목표 비중 */}
                <div>
                  <span className="text-slate-500 text-xs">목표 비중</span>
                  <div className="font-bold text-slate-900">
                    {coin.목표비중.toFixed(1)}%
                  </div>
                </div>

                {/* 샤프 비율 */}
                {coin.샤프비율 !== undefined && (
                  <div>
                    <span className="text-slate-500 text-xs">Sharpe</span>
                    <div className="font-bold text-slate-900">
                      {coin.샤프비율.toFixed(2)}
                    </div>
                  </div>
                )}

                {/* 편입 시점 */}
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-500 text-xs">편입 시점</span>
                  <div className="text-xs text-slate-700">{timeAgo}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 푸터 안내 */}
      <div className="mt-4 pt-4 border-t border-yellow-300">
        <p className="text-xs text-slate-600 text-center">
          💡 AI CIO가 새롭게 포트폴리오에 추가한 코인입니다
        </p>
      </div>
    </div>
  );
}
