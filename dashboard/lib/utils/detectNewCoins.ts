/**
 * 신규 편입 코인 감지 유틸리티
 *
 * 목적: cio_portfolio_decisions 테이블의 전략근거 필드에서 신규 편입 코인 정보를 파싱
 *
 * 파싱 대상:
 * - 🆕 **신규 편입 코인** 섹션
 * - AI 순위 (1순위, 2순위, ...)
 * - 검증 티어 (VERIFIED, PARTIAL, MINIMAL, ALTERNATIVE)
 * - 샤프 비율
 *
 * 예시 입력:
 * ```
 * 🆕 **신규 편입 코인**
 * - [1순위] **SOL** (검증 티어: VERIFIED, Sharpe=2.34)
 * - [2순위] **AVAX** (검증 티어: PARTIAL, Sharpe=1.82)
 * ```
 */

export interface NewCoinInfo {
  코인이름: string;
  결정시각: string;
  목표비중: number;
  검증티어?: 'VERIFIED' | 'PARTIAL' | 'MINIMAL' | 'ALTERNATIVE';
  샤프비율?: number;
  AI순위?: number;
}

/**
 * 전략근거 텍스트에서 신규 편입 코인 정보 추출
 */
export function detectNewCoins(
  전략근거: string,
  결정시각: string,
  목표비중: number,
  코인이름: string
): NewCoinInfo | null {
  // 🆕 신규 편입 섹션이 있는지 확인
  const hasNewCoinSection = /🆕\s*\*?\*?신규\s*편입\s*코인\*?\*?/i.test(전략근거);

  if (!hasNewCoinSection) {
    return null;
  }

  // 현재 코인이 신규 편입 섹션에 언급되는지 확인
  const newCoinPattern = new RegExp(
    `\\[?(\\d+)순위\\]?\\s*\\*?\\*?${코인이름}\\*?\\*?`,
    'i'
  );
  const rankMatch = 전략근거.match(newCoinPattern);

  if (!rankMatch) {
    return null;
  }

  const AI순위 = parseInt(rankMatch[1]);

  // 검증 티어 추출 (해당 코인 라인에서)
  const coinLinePattern = new RegExp(
    `${코인이름}[^\\n]*검증\\s*티어[:\\s]*([A-Z]+)`,
    'i'
  );
  const tierMatch = 전략근거.match(coinLinePattern);
  const 검증티어 = tierMatch?.[1]?.toUpperCase() as NewCoinInfo['검증티어'];

  // 샤프 비율 추출 (해당 코인 라인에서)
  const sharpePattern = new RegExp(
    `${코인이름}[^\\n]*Sharpe[=:\\s]*([-\\d.]+)`,
    'i'
  );
  const sharpeMatch = 전략근거.match(sharpePattern);
  const 샤프비율 = sharpeMatch?.[1] ? parseFloat(sharpeMatch[1]) : undefined;

  return {
    코인이름,
    결정시각,
    목표비중,
    검증티어,
    샤프비율,
    AI순위,
  };
}

/**
 * CIO 결정 배열에서 모든 신규 편입 코인 추출
 */
export function extractAllNewCoins(
  decisions: Array<{
    전략근거: string;
    결정시각: string;
    목표비중: number;
    코인이름: string;
  }>
): NewCoinInfo[] {
  const newCoins: NewCoinInfo[] = [];

  for (const decision of decisions) {
    const newCoin = detectNewCoins(
      decision.전략근거,
      decision.결정시각,
      decision.목표비중,
      decision.코인이름
    );

    if (newCoin) {
      newCoins.push(newCoin);
    }
  }

  // AI 순위로 정렬
  return newCoins.sort((a, b) => (a.AI순위 || 999) - (b.AI순위 || 999));
}

/**
 * 검증 티어별 이모지 및 색상 반환
 */
export function getTierDisplay(tier?: string): {
  emoji: string;
  label: string;
  color: string;
} {
  switch (tier?.toUpperCase()) {
    case 'VERIFIED':
      return { emoji: '✅', label: 'VERIFIED', color: 'text-green-600' };
    case 'PARTIAL':
      return { emoji: '⚠️', label: 'PARTIAL', color: 'text-yellow-600' };
    case 'MINIMAL':
      return { emoji: '⚡', label: 'MINIMAL', color: 'text-orange-600' };
    case 'ALTERNATIVE':
      return { emoji: '🔄', label: 'ALTERNATIVE', color: 'text-blue-600' };
    default:
      return { emoji: '❓', label: 'UNKNOWN', color: 'text-slate-400' };
  }
}
