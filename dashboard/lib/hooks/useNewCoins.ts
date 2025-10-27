/**
 * 신규 편입 코인 데이터 훅
 *
 * 목적: cio_portfolio_decisions 테이블에서 최근 N일간 신규 편입된 코인 목록 조회
 *
 * 기능:
 * - 최근 N일간의 CIO 결정 조회
 * - 전략근거에서 신규 편입 코인 파싱
 * - AI 순위 기준 정렬
 * - 60초 캐시 (SWR)
 *
 * 사용 예:
 * ```tsx
 * const { newCoins, isLoading, error } = useNewCoins(7);
 * ```
 */

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { extractAllNewCoins, NewCoinInfo } from '@/lib/utils/detectNewCoins';

/**
 * Supabase에서 최근 N일간의 CIO 결정 조회 및 신규 편입 코인 추출
 */
async function fetchNewCoins(days: number): Promise<NewCoinInfo[]> {

  // N일 전 날짜 계산
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  // CIO 결정 조회
  const { data, error } = await supabase
    .from('cio_portfolio_decisions')
    .select('*')
    .gte('결정시각', startDateStr)
    .order('결정시각', { ascending: false });

  if (error) {
    console.error('[useNewCoins] Supabase error:', error);
    throw new Error(`Failed to fetch CIO decisions: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  // 신규 편입 코인 추출
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newCoins = extractAllNewCoins(data as any[]);

  console.log(`[useNewCoins] Found ${newCoins.length} new coins in last ${days} days`);

  return newCoins;
}

/**
 * 신규 편입 코인 조회 훅
 *
 * @param days - 조회 기간 (일 단위, 기본값: 7일)
 * @returns 신규 편입 코인 목록, 로딩 상태, 에러
 */
export function useNewCoins(days: number = 7) {
  const { data, error, isLoading, mutate } = useSWR<NewCoinInfo[]>(
    ['new-coins', days],
    () => fetchNewCoins(days),
    {
      refreshInterval: 60000, // 1분마다 갱신
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30초 중복 방지
    }
  );

  return {
    newCoins: data || [],
    isLoading,
    error: error as Error | null,
    refresh: mutate,
  };
}

/**
 * 특정 코인이 최근 N일 내 신규 편입되었는지 확인
 *
 * @param 코인이름 - 확인할 코인 이름
 * @param days - 조회 기간 (기본값: 7일)
 * @returns 신규 편입 여부
 */
export function useIsNewCoin(코인이름: string, days: number = 7): boolean {
  const { newCoins } = useNewCoins(days);
  return newCoins.some((coin) => coin.코인이름 === 코인이름);
}
