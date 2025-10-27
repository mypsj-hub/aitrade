/**
 * CIO 일관성 지수 훅
 *
 * 목적: CIO의 전략 일관성을 추적하고 평가
 *
 * 주요 메트릭:
 * 1. 전략 변경 빈도 (Strategy Change Frequency)
 *    - 하루 동안 같은 코인에 대해 목표 비중을 몇 번 변경했는지
 *
 * 2. 일관성 점수 (Consistency Score, 0-100)
 *    - 100점: 완벽한 일관성 (변경 없음)
 *    - 80-99점: 높은 일관성 (1-2회 변경)
 *    - 60-79점: 보통 일관성 (3-5회 변경)
 *    - 40-59점: 낮은 일관성 (6-10회 변경)
 *    - 0-39점: 매우 낮은 일관성 (10회 이상 변경)
 *
 * 3. 급변 경고 (Rapid Change Warning)
 *    - 짧은 시간 내에 큰 폭의 비중 변경이 발생했는지
 *    - 예: 1시간 내에 5%p 이상 변경
 *
 * 4. 평균 비중 변동성 (Average Weight Volatility)
 *    - 목표 비중의 표준편차
 *
 * 데이터 소스: cio_portfolio_decisions
 */

'use client';

import { useCIODecisions, type CIODecision } from './useCIODecisions';
import { useMemo } from 'react';

/**
 * 코인별 일관성 정보
 */
export interface CoinConsistencyInfo {
  코인이름: string;
  변경횟수: number; // 해당 날짜의 총 결정 횟수
  평균비중: number; // 목표 비중의 평균
  비중변동성: number; // 목표 비중의 표준편차
  최대비중: number;
  최소비중: number;
  비중범위: number; // 최대 - 최소
  급변경고: boolean; // 1시간 내 5%p 이상 변경
  일관성점수: number; // 0-100
}

/**
 * 전체 CIO 일관성 메트릭
 */
export interface CIOConsistencyMetrics {
  전체일관성점수: number; // 0-100
  평균변경횟수: number;
  코인별일관성: CoinConsistencyInfo[];
  급변경고코인수: number;
  총코인수: number;
  평가: '매우 일관적' | '일관적' | '보통' | '비일관적' | '매우 비일관적';
}

/**
 * 일관성 점수 계산
 * - 변경 횟수가 적을수록 높은 점수
 * - 비중 변동성이 낮을수록 높은 점수
 */
function calculateConsistencyScore(
  변경횟수: number,
  비중변동성: number
): number {
  // 변경 횟수 점수 (0-60점)
  let changeScore = 0;
  if (변경횟수 === 1) changeScore = 60;
  else if (변경횟수 === 2) changeScore = 50;
  else if (변경횟수 === 3) changeScore = 40;
  else if (변경횟수 <= 5) changeScore = 30;
  else if (변경횟수 <= 10) changeScore = 15;
  else changeScore = 0;

  // 변동성 점수 (0-40점)
  let volatilityScore = 0;
  if (비중변동성 < 1) volatilityScore = 40;
  else if (비중변동성 < 3) volatilityScore = 30;
  else if (비중변동성 < 5) volatilityScore = 20;
  else if (비중변동성 < 10) volatilityScore = 10;
  else volatilityScore = 0;

  return Math.round(changeScore + volatilityScore);
}

/**
 * 급변 경고 감지
 * - 1시간 내에 5%p 이상 변경되었는지 확인
 */
function detectRapidChanges(decisions: CIODecision[]): boolean {
  if (decisions.length < 2) return false;

  // 시간순 정렬 (오래된 순)
  const sorted = [...decisions].sort(
    (a, b) => new Date(a.결정시각).getTime() - new Date(b.결정시각).getTime()
  );

  // 연속된 결정 간 체크
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    const timeDiff =
      new Date(curr.결정시각).getTime() - new Date(prev.결정시각).getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    const weightChange = Math.abs(curr.목표비중 - prev.목표비중);

    // 1시간 내에 5%p 이상 변경
    if (hoursDiff <= 1 && weightChange >= 5) {
      return true;
    }
  }

  return false;
}

/**
 * 표준편차 계산
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * 코인별 일관성 정보 계산
 */
function analyzeCoinConsistency(
  코인이름: string,
  decisions: CIODecision[]
): CoinConsistencyInfo {
  const 변경횟수 = decisions.length;
  const 목표비중들 = decisions.map((d) => d.목표비중);

  const 평균비중 = 목표비중들.reduce((sum, w) => sum + w, 0) / 목표비중들.length;
  const 비중변동성 = calculateStdDev(목표비중들);
  const 최대비중 = Math.max(...목표비중들);
  const 최소비중 = Math.min(...목표비중들);
  const 비중범위 = 최대비중 - 최소비중;
  const 급변경고 = detectRapidChanges(decisions);
  const 일관성점수 = calculateConsistencyScore(변경횟수, 비중변동성);

  return {
    코인이름,
    변경횟수,
    평균비중,
    비중변동성,
    최대비중,
    최소비중,
    비중범위,
    급변경고,
    일관성점수,
  };
}

/**
 * 전체 일관성 평가
 */
function evaluateConsistency(score: number): CIOConsistencyMetrics['평가'] {
  if (score >= 90) return '매우 일관적';
  if (score >= 75) return '일관적';
  if (score >= 60) return '보통';
  if (score >= 40) return '비일관적';
  return '매우 비일관적';
}

/**
 * CIO 일관성 훅
 *
 * @param selectedDate - 조회할 날짜
 * @returns CIO 일관성 메트릭
 */
export function useCIOConsistency(selectedDate?: Date) {
  const { decisions, isLoading, error } = useCIODecisions(selectedDate);

  const consistencyMetrics = useMemo<CIOConsistencyMetrics | null>(() => {
    // 에러가 있거나 데이터가 없으면 null 반환
    if (error || !decisions || decisions.length === 0) return null;

    // 코인별로 결정 그룹화
    const coinDecisionsMap = new Map<string, CIODecision[]>();

    for (const decision of decisions) {
      const existing = coinDecisionsMap.get(decision.코인이름) || [];
      existing.push(decision);
      coinDecisionsMap.set(decision.코인이름, existing);
    }

    // 코인별 일관성 분석
    const 코인별일관성: CoinConsistencyInfo[] = [];

    for (const [코인이름, coinDecisions] of coinDecisionsMap.entries()) {
      const info = analyzeCoinConsistency(코인이름, coinDecisions);
      코인별일관성.push(info);
    }

    // 일관성 점수 내림차순 정렬
    코인별일관성.sort((a, b) => b.일관성점수 - a.일관성점수);

    // 전체 메트릭 계산
    const 총코인수 = 코인별일관성.length;
    const 평균변경횟수 =
      코인별일관성.reduce((sum, c) => sum + c.변경횟수, 0) / 총코인수;
    const 급변경고코인수 = 코인별일관성.filter((c) => c.급변경고).length;

    // 전체 일관성 점수 = 코인별 점수의 평균
    const 전체일관성점수 = Math.round(
      코인별일관성.reduce((sum, c) => sum + c.일관성점수, 0) / 총코인수
    );

    const 평가 = evaluateConsistency(전체일관성점수);

    return {
      전체일관성점수,
      평균변경횟수,
      코인별일관성,
      급변경고코인수,
      총코인수,
      평가,
    };
  }, [decisions, error]);

  return {
    consistencyMetrics,
    isLoading,
    error,
  };
}
