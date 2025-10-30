/**
 * CIO 포트폴리오 결정 데이터 훅
 *
 * 목적: cio_portfolio_decisions 테이블에서 최신 포트폴리오 결정 조회
 *
 * 주요 기능:
 * - 특정 날짜의 CIO 포트폴리오 결정 조회
 * - holding_status와 JOIN하여 실제 관리상태 반영
 * - 목표 비중 vs 현재 비중 갭 계산
 * - 비중 변화량 추적
 * - 관리 상태 확인
 *
 * 사용 예:
 * ```tsx
 * const { decisions, isLoading, error } = useCIODecisions(selectedDate);
 * ```
 */

'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

/**
 * CIO 포트폴리오 결정 인터페이스
 */
export interface CIODecision {
  코인이름: string;
  결정시각: string;
  전략근거: string;
  목표비중: number;
  이전목표비중: number;
  비중변화량: number;
  현재보유비중: number;
  목표수익률?: number | null;
  목표손절률?: number | null;
  관리상태: string;
  시장체제?: string | null;
  시장상황?: string;
  공포탐욕지수?: number | null;
  긴급도?: number | null;
  BTC도미넌스?: number | null;
  시가총액등급?: string | null;
  섹터?: string | null;
  유동성등급?: string | null;
  리스크평가?: string;
  기대수익률?: number | null;
  예상변동성?: number | null;
  샤프비율?: number | null;
  신뢰수준?: number | null;
  결정사유?: string;
  주의사항?: string;
  다음재평가시각?: string;
  최종수정시각?: string;
  기술지표?: Record<string, number | string> | null;
  전체포트폴리오?: Record<string, number> | null;
}

/**
 * 비중 갭 정보 (목표 vs 현재)
 */
export interface WeightGapInfo extends CIODecision {
  비중갭: number; // 목표비중 - 현재보유비중
  갭비율: number; // (비중갭 / 목표비중) * 100
  상태: '과소보유' | '적정' | '과다보유';
}

/**
 * 특정 날짜의 CIO 결정 조회 (holding_status와 JOIN하여 실제 관리상태 반영)
 */
async function fetchCIODecisions(dateStr: string): Promise<CIODecision[]> {
  // 1. cio_portfolio_decisions 조회
  const { data: decisionsData, error: decisionsError } = await supabase
    .from('cio_portfolio_decisions')
    .select('*')
    .gte('결정시각', dateStr)
    .lt('결정시각', getNextDay(dateStr))
    .order('결정시각', { ascending: false });

  if (decisionsError) {
    console.error('[useCIODecisions] Supabase error:', decisionsError);
    throw new Error(`Failed to fetch CIO decisions: ${decisionsError.message}`);
  }

  // 2. holding_status에서 실제 관리상태 조회
  const { data: holdingsData, error: holdingsError } = await supabase
    .from('holding_status')
    .select('코인이름, 관리상태');

  if (holdingsError) {
    console.error('[useCIODecisions] Failed to fetch holdings:', holdingsError);
  }

  // 3. holding_status의 관리상태를 Map으로 변환
  const statusMap = new Map<string, string>();
  if (holdingsData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const holding of holdingsData as any[]) {
      statusMap.set(holding.코인이름, holding.관리상태);
    }
  }

  // 4. CIO 결정에 실제 관리상태 병합
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decisions = (decisionsData || []) as any[];

  return decisions.map(decision => ({
    ...decision,
    // holding_status의 실제 관리상태로 덮어쓰기
    // holding_status에 없는 코인은 '제외'로 처리 (과거 추적 코인)
    관리상태: statusMap.get(decision.코인이름) || '제외'
  }));
}

/**
 * 다음 날짜 계산
 */
function getNextDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

/**
 * 비중 갭 계산
 */
export function calculateWeightGap(decision: CIODecision): WeightGapInfo {
  const 비중갭 = decision.목표비중 - decision.현재보유비중;
  const 갭비율 = decision.목표비중 > 0
    ? (비중갭 / decision.목표비중) * 100
    : 0;

  let 상태: WeightGapInfo['상태'] = '적정';

  if (Math.abs(갭비율) > 20) {
    상태 = 비중갭 > 0 ? '과소보유' : '과다보유';
  }

  return {
    ...decision,
    비중갭,
    갭비율,
    상태,
  };
}

/**
 * CIO 결정 조회 훅
 *
 * @param selectedDate - 조회할 날짜
 * @returns CIO 결정 목록, 로딩 상태, 에러
 */
export function useCIODecisions(selectedDate?: Date) {
  const dateStr = selectedDate
    ? selectedDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const { data, error, isLoading, mutate } = useSWR<CIODecision[]>(
    ['cio-decisions', dateStr],
    () => fetchCIODecisions(dateStr),
    {
      refreshInterval: 60000, // 1분마다 갱신
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30초 중복 방지
    }
  );

  return {
    decisions: data || [],
    isLoading,
    error: error as Error | null,
    refresh: mutate,
  };
}

/**
 * 비중 갭이 있는 CIO 결정 조회 훅
 *
 * @param selectedDate - 조회할 날짜
 * @returns 비중 갭 정보 포함 결정 목록
 */
export function useCIOWeightGaps(selectedDate?: Date) {
  const { decisions, isLoading, error, refresh } = useCIODecisions(selectedDate);

  // 코인별 최신 결정만 추출 (중복 제거)
  const latestDecisionsMap = new Map<string, CIODecision>();

  for (const decision of decisions) {
    const existing = latestDecisionsMap.get(decision.코인이름);

    // 기존 결정이 없거나, 현재 결정이 더 최신이면 업데이트
    if (!existing || decision.결정시각 > existing.결정시각) {
      latestDecisionsMap.set(decision.코인이름, decision);
    }
  }

  // Map에서 배열로 변환 후 비중 갭 계산
  const uniqueDecisions = Array.from(latestDecisionsMap.values());

  // '활성' 상태만 필터링
  const activeDecisions = uniqueDecisions.filter((decision) => {
    const 관리상태Upper = decision.관리상태?.toUpperCase();
    return 관리상태Upper === 'ACTIVE' || 관리상태Upper === '활성';
  });

  const weightGaps = activeDecisions.map(calculateWeightGap);

  // 비중 갭이 큰 순서로 정렬
  const sortedGaps = [...weightGaps].sort((a, b) =>
    Math.abs(b.비중갭) - Math.abs(a.비중갭)
  );

  return {
    weightGaps: sortedGaps,
    isLoading,
    error,
    refresh,
  };
}
