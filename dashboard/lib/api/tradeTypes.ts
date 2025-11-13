/**
 * 거래 유형 관련 API 함수
 *
 * 목적: trade_history 테이블에서 실제 존재하는 거래 유형을 동적으로 조회
 * 역할: 하드코딩 없이 실제 데이터 기반으로 필터 목록 생성
 */

import { supabase } from '@/lib/supabase';

/**
 * trade_history 테이블에서 고유한 거래 유형 목록 조회
 * @returns 중복 제거된 거래 유형 배열 (가나다순 정렬)
 */
export async function getDistinctTradeTypes(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('trade_history')
      .select('거래유형')
      .order('거래유형');

    if (error) {
      console.error('[getDistinctTradeTypes] Supabase error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.warn('[getDistinctTradeTypes] No trade history found');
      return [];
    }

    // 중복 제거하여 고유한 거래 유형만 추출
    const uniqueTypes = [...new Set(data.map(d => d.거래유형))];

    console.log('[getDistinctTradeTypes] Found unique types:', uniqueTypes);
    return uniqueTypes;
  } catch (error) {
    console.error('[getDistinctTradeTypes] Fetch error:', error);
    return [];
  }
}

/**
 * 거래 유형에 맞는 Tailwind CSS 색상 클래스 반환
 * @param type 거래 유형
 * @returns Tailwind CSS 클래스 문자열
 */
export function getColorForTradeType(type: string): string {
  if (type.includes('매수')) return 'bg-blue-100 text-blue-700';
  if (type.includes('익절')) return 'bg-green-100 text-green-700';
  if (type.includes('손절')) return 'bg-red-100 text-red-700';
  if (type.includes('매도')) return 'bg-purple-100 text-purple-700';
  return 'bg-slate-100 text-slate-700';
}
