/**
 * 숫자/면적/퍼센트 표시 포맷 유틸.
 * 소수점 자리수는 규제 데이터의 formula.decimalPlaces 와 맞춰 사용한다(기본 2자리).
 */

const DEFAULT_DECIMALS = 2;

/** 면적(㎡) 포맷. 천단위 구분 + 소수점 자리수 고정 */
export function formatArea(value: number | null, decimals = DEFAULT_DECIMALS): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** 퍼센트 포맷. 값 뒤에 % 부착 */
export function formatPercent(value: number | null, decimals = DEFAULT_DECIMALS): string {
  if (value === null || Number.isNaN(value)) return '—';
  return `${value.toFixed(decimals)}%`;
}

/** 가중치 포맷. null(미확정)은 명시적으로 표기 */
export function formatWeight(value: number | null): string {
  if (value === null) return '미확정';
  return value.toFixed(1);
}

/** 정수 수량 포맷. 천단위 구분 */
export function formatCount(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return Math.round(value).toLocaleString('ko-KR');
}
