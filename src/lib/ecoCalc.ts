import type { EcoStandard, SpaceType } from '@/schemas/ecoAreaRatio.schema';
import type { EcoRow } from '@/types/eco';

/**
 * 생태면적률 계산 엔진 (순수 함수).
 *
 * 공식 (규제 데이터 formula 참조):
 *   환산면적 = 면적 × 가중치
 *   생태면적률(%) = (총 환산면적 / 대지면적) × 100
 *   소수점 자리수 = standard.formula.decimalPlaces (하드코딩하지 않음)
 *
 * 목표 생태면적률(targetRatios)은 현재 데이터에 비어 있어, 사용자가 직접 입력한
 * targetPercent 와 비교하여 적합/부적합·부족분을 산정한다.
 */

export type EcoStatus = 'fit' | 'unfit' | 'pending';

/** 행 단위 계산 결과 */
export interface EcoRowResult {
  id: string;
  /** 선택된 공간유형(없으면 undefined) */
  spaceType: SpaceType | undefined;
  area: number | null;
  /** 가중치 (공간유형 미선택 또는 미확정이면 null) */
  weight: number | null;
  /** 환산면적 = area × weight. 계산 불가 시 null */
  convertedArea: number | null;
  /** 가중치 미확정(weight === null) 공간유형 여부 */
  weightUnconfirmed: boolean;
  /** 검증되지 않은 공간유형(verified === false) 여부 → "⚠ 검증 필요" */
  unverified: boolean;
}

/** 전체 계산 결과 */
export interface EcoResult {
  rows: EcoRowResult[];
  /** 총 환산면적 (유효 행 합계) */
  totalConvertedArea: number;
  /** 총 입력면적 (참고용) */
  totalInputArea: number;
  /** 생태면적률(%) — 대지면적 미입력/0 이하이면 null */
  ecoRatioPercent: number | null;
  /** 사용자가 입력한 목표 생태면적률(%) */
  targetPercent: number | null;
  /** 적합/부적합/판정보류 */
  status: EcoStatus;
  /** 부족분(%) — 부적합일 때 (목표 - 현재), 그 외 null */
  deficitPercent: number | null;
  /** 목표 달성에 추가로 필요한 환산면적(㎡) — 부적합일 때, 그 외 null */
  requiredConvertedArea: number | null;
  /** 가중치 미확정 공간유형이 입력에 포함되어 있는지 */
  hasUnconfirmedRows: boolean;
}

/** 소수점 d자리 반올림 */
function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * 생태면적률 전체 계산.
 * @param standard   선택된 기준의 검증된 규제 데이터
 * @param rows       사용자 입력 행
 * @param siteArea   대지면적 ㎡
 * @param targetPercent 사용자가 입력한 목표 생태면적률(%)
 */
export function calculateEcoAreaRatio(
  standard: EcoStandard,
  rows: EcoRow[],
  siteArea: number | null,
  targetPercent: number | null,
): EcoResult {
  const decimals = standard.formula.decimalPlaces;
  const byCode = new Map(standard.spaceTypes.map((st) => [st.code, st]));

  let totalConvertedArea = 0;
  let totalInputArea = 0;
  let hasUnconfirmedRows = false;

  const rowResults: EcoRowResult[] = rows.map((row) => {
    const spaceType = row.code ? byCode.get(row.code) : undefined;
    const weight = spaceType?.weight ?? null;
    const weightUnconfirmed = spaceType !== undefined && spaceType.weight === null;
    const unverified = spaceType?.verified === false;

    if (row.area !== null && row.area > 0) {
      totalInputArea += row.area;
    }

    let convertedArea: number | null = null;
    if (spaceType && weight !== null && row.area !== null && row.area > 0) {
      convertedArea = roundTo(row.area * weight, decimals);
      totalConvertedArea += convertedArea;
    }

    if (weightUnconfirmed && row.area !== null && row.area > 0) {
      hasUnconfirmedRows = true;
    }

    return {
      id: row.id,
      spaceType,
      area: row.area,
      weight,
      convertedArea,
      weightUnconfirmed,
      unverified,
    };
  });

  totalConvertedArea = roundTo(totalConvertedArea, decimals);
  totalInputArea = roundTo(totalInputArea, decimals);

  const hasValidSite = siteArea !== null && siteArea > 0;
  const ecoRatioPercent = hasValidSite
    ? roundTo((totalConvertedArea / siteArea) * 100, decimals)
    : null;

  // 적합/부적합 판정
  let status: EcoStatus = 'pending';
  let deficitPercent: number | null = null;
  let requiredConvertedArea: number | null = null;

  const hasTarget = targetPercent !== null && targetPercent > 0;
  if (hasValidSite && hasTarget && ecoRatioPercent !== null) {
    if (ecoRatioPercent >= targetPercent) {
      status = 'fit';
    } else {
      status = 'unfit';
      deficitPercent = roundTo(targetPercent - ecoRatioPercent, decimals);
      const requiredTotal = (targetPercent / 100) * siteArea;
      requiredConvertedArea = roundTo(requiredTotal - totalConvertedArea, decimals);
    }
  }

  return {
    rows: rowResults,
    totalConvertedArea,
    totalInputArea,
    ecoRatioPercent,
    targetPercent: hasTarget ? targetPercent : null,
    status,
    deficitPercent,
    requiredConvertedArea,
    hasUnconfirmedRows,
  };
}
