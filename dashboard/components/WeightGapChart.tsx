/**
 * 목표 비중 달성률 차트 컴포넌트
 *
 * 목적: 각 코인별 목표 비중 대비 현재 보유 비중의 갭을 시각적으로 표시
 *
 * 주요 기능:
 * - 목표 비중 vs 현재 비중 비교 바 차트
 * - 색상 구분: 과소보유(빨강), 적정(초록), 과다보유(파랑)
 * - 비중 갭 퍼센트 표시
 * - 관리 상태 배지 표시
 * - 호버 시 상세 정보 표시
 *
 * Props:
 * - selectedDate?: Date - 조회할 날짜 (기본값: 오늘)
 *
 * 데이터 소스: cio_portfolio_decisions 테이블
 */

'use client';

import { useCIOWeightGaps } from '@/lib/hooks/useCIODecisions';

interface Props {
  selectedDate?: Date;
}

export function WeightGapChart({ selectedDate }: Props) {
  const { weightGaps, isLoading, error } = useCIOWeightGaps(selectedDate);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          🎯 목표 비중 달성률
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    console.error('[WeightGapChart] Error:', error);
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          🎯 목표 비중 달성률
        </h2>
        <p className="text-red-500 text-sm">
          데이터를 불러오는 중 오류가 발생했습니다.
        </p>
      </div>
    );
  }

  // 데이터 없음 또는 목표 비중이 모두 0인 경우
  const hasValidData = weightGaps.some((gap) => gap.목표비중 > 0);

  if (weightGaps.length === 0 || !hasValidData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          🎯 목표 비중 달성률
        </h2>
        <p className="text-slate-500 text-sm">
          {weightGaps.length === 0
            ? '해당 날짜의 CIO 결정 데이터가 없습니다.'
            : '⚠️ 목표 비중 데이터가 설정되지 않았습니다. 트레이딩 봇에서 목표비중을 저장하도록 설정해주세요.'}
        </p>
      </div>
    );
  }

  // 상태별 색상 반환
  const getStateColor = (상태: string) => {
    switch (상태) {
      case '과소보유':
        return 'bg-red-500';
      case '적정':
        return 'bg-green-500';
      case '과다보유':
        return 'bg-blue-500';
      default:
        return 'bg-slate-400';
    }
  };

  // 상태별 텍스트 색상 반환
  const getStateTextColor = (상태: string) => {
    switch (상태) {
      case '과소보유':
        return 'text-red-600';
      case '적정':
        return 'text-green-600';
      case '과다보유':
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };

  // 전략근거에서 시가총액등급 추출
  const extractMarketCap = (전략근거: string): string => {
    if (!전략근거) return '-';
    // "[정체성] XXX는 메가캡" 패턴 매칭
    if (전략근거.includes('메가캡')) return '메가캡';
    if (전략근거.includes('미드캡')) return '미드캡';
    if (전략근거.includes('스몰캡')) return '스몰캡';
    return '-';
  };

  // 전략근거에서 섹터 추출
  const extractSector = (전략근거: string): string => {
    if (!전략근거) return '-';
    // 쉼표 뒤의 "Layer-1", "Other 섹터", "DeFi" 등의 패턴 매칭
    const sectorMatch = 전략근거.match(/,\s*(Layer-\d+|Other|DeFi|AI|Meme|Gaming|Infrastructure)(\s*섹터)?/i);
    return sectorMatch ? sectorMatch[1] : '-';
  };

  // 전략근거에서 유동성등급 추출
  const extractLiquidity = (전략근거: string): string => {
    if (!전략근거) return '-';
    // "A등급 유동성", "B등급 유동성" 패턴 매칭
    const liquidityMatch = 전략근거.match(/([A-C])등급\s*유동성/);
    return liquidityMatch ? `${liquidityMatch[1]}등급` : '-';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-1">
          🎯 목표 비중 달성률
        </h2>
        <p className="text-sm text-slate-500">
          목표 대비 현재 보유 비중 비교 (갭이 큰 순서)
        </p>
      </div>

      {/* 차트 영역 */}
      <div className="space-y-4">
        {weightGaps.map((gap, index) => {
          const maxWidth = 100;
          const 목표바Width = (gap.목표비중 / 100) * maxWidth * 4; // 최대 25% 가정
          const 현재바Width = (gap.현재보유비중 / 100) * maxWidth * 4;

          return (
            <div
              key={`${gap.코인이름}-${gap.결정시각}-${index}`}
              className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
            >
              {/* 코인 정보 헤더 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {gap.코인이름}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded ${
                      gap.상태 === '과소보유'
                        ? 'bg-red-100 text-red-700'
                        : gap.상태 === '적정'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {gap.상태}
                  </span>
                </div>

                {/* 비중 갭 표시 */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${getStateTextColor(gap.상태)}`}>
                    {gap.비중갭 > 0 ? '+' : ''}
                    {gap.비중갭.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">
                    (갭 비율: {gap.갭비율.toFixed(0)}%)
                  </div>
                </div>
              </div>

              {/* 목표 비중 바 */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-600 w-16">목표</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-slate-400 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${Math.min(목표바Width, 100)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {gap.목표비중.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 현재 비중 바 */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-600 w-16">현재</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                    <div
                      className={`${getStateColor(gap.상태)} h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${Math.min(현재바Width, 100)}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {gap.현재보유비중.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 추가 정보 */}
              <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">시총등급:</span>
                  <span className="ml-1 font-semibold text-slate-700">
                    {extractMarketCap(gap.전략근거)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">섹터:</span>
                  <span className="ml-1 font-semibold text-slate-700">
                    {extractSector(gap.전략근거)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">유동성:</span>
                  <span className="ml-1 font-semibold text-slate-700">
                    {extractLiquidity(gap.전략근거)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">목표수익/손절:</span>
                  <span className="ml-1 font-semibold">
                    <span className="text-green-600">
                      {gap.목표수익률 !== null && gap.목표수익률 !== undefined ? `+${gap.목표수익률}%` : '-'}
                    </span>
                    <span className="text-slate-400"> / </span>
                    <span className="text-red-600">
                      {gap.목표손절률 !== null && gap.목표손절률 !== undefined ? `${gap.목표손절률}%` : '-'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 푸터 설명 */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-slate-600">과소보유 (목표 &gt; 현재)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-slate-600">적정 (갭 20% 이내)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-slate-600">과다보유 (목표 &lt; 현재)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
