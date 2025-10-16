// 날짜/시간 포맷팅 유틸리티

/**
 * ISO 날짜 문자열을 YYYY-MM-DD 형식으로 변환
 * @param dateStr ISO 날짜 문자열 (예: "2025-10-15T23:54:57.579711+00:00")
 * @returns 'YYYY-MM-DD' 형식 문자열
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr.split('T')[0] || dateStr;
  }
}

/**
 * ISO 날짜 문자열을 YYYY-MM-DD HH:MM:SS 형식으로 변환
 * @param dateStr ISO 날짜 문자열
 * @returns 'YYYY-MM-DD HH:MM:SS' 형식 문자열
 */
export function formatDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch {
    return dateStr;
  }
}

/**
 * 숫자를 한국 원화 형식으로 포맷 (세부 내역용 - '원' 없이)
 * @param value 숫자
 * @returns 'N,NNN' 형식 문자열
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value));
}

/**
 * 숫자를 한국 원화 형식으로 포맷 ('원' 포함 - 요약 카드용)
 * @param value 숫자
 * @returns 'N,NNN원' 형식 문자열
 */
export function formatCurrencyWithUnit(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원';
}

/**
 * 숫자를 간단한 형식으로 포맷 (천 단위 구분자만)
 * @param value 숫자
 * @returns 'N,NNN' 형식 문자열
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value));
}
