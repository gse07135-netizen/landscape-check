import type { PlantingRuleset } from '@/lib/plantingLoader';
import type { DensityByUseZone, LandscapeRule } from '@/schemas/plantingRules.schema';
import type { TreeRow } from '@/types/planting';

/**
 * 식재 법규 검토 계산 엔진 (순수 함수).
 *
 * 산출 흐름:
 *   조경 의무면적 = 대지면적 × landscapeAreaRatio(지자체, 적용 조건)
 *   식재의무면적 = 조경 의무면적 × plantingMandatoryAreaRatio (국토부 0.5)
 *   최소 교목 수 = 조경 의무면적 × minTreePerM2 (용도지역별 식재밀도, 올림)
 *   최소 관목 수 = 조경 의무면적 × minShrubPerM2 (올림)
 *   상록 규정 수량 = (최소 교목+관목) × evergreenMinRatio (0.2, 올림)
 *   지역특성수 규정 수량 = 최소 교목 × regionalSpeciesMinRatio (0.1, 올림)
 *
 * 모든 비율/밀도 값은 검증된 규제 데이터에서만 읽는다.
 */

export type PlantingStatus = 'fit' | 'unfit' | 'pending';

/**
 * 기본정보 용도지역(세부) → 식재밀도표 대분류 매핑.
 * 밀도표(plantingDensity.byUseZone)는 주거/상업/공업/녹지 4개 대분류로 규정된다.
 */
const USE_ZONE_TO_DENSITY_CATEGORY: Record<string, string> = {
  residential_exclusive: '주거지역',
  residential_general: '주거지역',
  semi_residential: '주거지역',
  commercial: '상업지역',
  industrial: '공업지역',
  green: '녹지지역',
};

export function densityCategoryOf(useZone: string): string | undefined {
  return USE_ZONE_TO_DENSITY_CATEGORY[useZone];
}

/**
 * 적용할 조경 의무면적 비율 규칙을 자동 제안한다.
 * 조건이 자유 텍스트이므로 휴리스틱으로 기본값만 제시하고, 사용자가 직접 변경할 수 있다.
 *  - 녹지지역이면 '녹지' 포함 규칙 우선
 *  - 그 외 연면적 구간으로 매칭
 * 매칭 실패 시 null.
 */
export function suggestLandscapeRuleIndex(
  rules: LandscapeRule[],
  densityCategory: string | undefined,
  grossFloorArea: number | null,
): number | null {
  if (densityCategory === '녹지지역') {
    const idx = rules.findIndex((r) => r.condition.includes('녹지'));
    if (idx >= 0) return idx;
  }
  if (grossFloorArea !== null && grossFloorArea > 0) {
    if (grossFloorArea >= 2000) {
      const idx = rules.findIndex(
        (r) => r.condition.includes('2,000') && r.condition.includes('이상') && !r.condition.includes('미만'),
      );
      if (idx >= 0) return idx;
    } else if (grossFloorArea >= 1000) {
      const idx = rules.findIndex(
        (r) => r.condition.includes('1,000') && r.condition.includes('2,000'),
      );
      if (idx >= 0) return idx;
    } else {
      const idx = rules.findIndex(
        (r) => r.condition.includes('1,000') && r.condition.includes('미만') && !r.condition.includes('2,000'),
      );
      if (idx >= 0) return idx;
    }
  }
  return null;
}

/** 산출된 식재 법규 기준 */
export interface PlantingCriteria {
  landSize: number | null;
  /** 조경 의무 적용 대상 여부(대지면적 >= 적용 하한) */
  applies: boolean;
  appliesFromLandSizeM2: number;
  /** 적용된 비율 규칙 */
  rule: LandscapeRule | undefined;
  ruleIndex: number | null;
  /** 조경 의무면적 */
  landscapeMandatoryArea: number | null;
  /** 식재의무면적(조경 의무면적 × 0.5) */
  plantingMandatoryArea: number | null;
  plantingMandatoryRatio: number;
  /** 적용된 식재밀도(용도지역별) */
  density: DensityByUseZone | undefined;
  densityCategory: string | undefined;
  minTrees: number | null;
  minShrubs: number | null;
  evergreenMinRatio: number;
  evergreenMinRatioBasis: string;
  evergreenRequired: number | null;
  regionalMinRatio: number;
  regionalMinRatioBasis: string;
  regionalRequired: number | null;
  /** 비율 규칙 또는 룰셋이 미검증인지 */
  ruleUnverified: boolean;
}

/** 항목별 준수 검토 결과 */
export interface PlantingCheckItem {
  key: 'trees' | 'shrubs' | 'evergreen' | 'regional';
  label: string;
  /** 기준 수량 */
  required: number | null;
  /** 현황 수량 */
  current: number;
  /** 부족분(현황 < 기준일 때) */
  deficit: number | null;
  status: PlantingStatus;
}

/** 입력 수목 집계 */
export interface TreeTotals {
  trees: number;
  shrubs: number;
  groundcover: number;
  /** 상록 교목+관목 합 */
  evergreenTreesShrubs: number;
  /** 지역특성수 교목 합 */
  regionalTrees: number;
}

export interface PlantingResult {
  criteria: PlantingCriteria;
  totals: TreeTotals;
  checks: PlantingCheckItem[];
  overallStatus: PlantingStatus;
  /** 미검증 기준(지자체 룰셋/시목 등) 포함 여부 */
  hasUnverified: boolean;
}

function ceilOrNull(value: number | null): number | null {
  return value === null ? null : Math.ceil(value);
}

function quantityOf(rows: TreeRow[], predicate: (r: TreeRow) => boolean): number {
  return rows.reduce((sum, r) => {
    if (predicate(r) && r.quantity !== null && r.quantity > 0) {
      return sum + r.quantity;
    }
    return sum;
  }, 0);
}

function checkItem(
  key: PlantingCheckItem['key'],
  label: string,
  required: number | null,
  current: number,
): PlantingCheckItem {
  if (required === null) {
    return { key, label, required, current, deficit: null, status: 'pending' };
  }
  const meets = current >= required;
  return {
    key,
    label,
    required,
    current,
    deficit: meets ? 0 : required - current,
    status: meets ? 'fit' : 'unfit',
  };
}

export interface PlantingCalcInput {
  ruleset: PlantingRuleset;
  landSize: number | null;
  /** 기본정보 용도지역(세부) */
  useZone: string;
  grossFloorArea: number | null;
  /** 사용자가 선택한 비율 규칙 인덱스. null 이면 자동 제안 */
  selectedRuleIndex: number | null;
  trees: TreeRow[];
}

export function calculatePlanting(input: PlantingCalcInput): PlantingResult {
  const { ruleset, landSize, useZone, grossFloorArea, selectedRuleIndex, trees } = input;
  const { national, municipality } = ruleset;

  const densityCategory = densityCategoryOf(useZone);
  const density = densityCategory
    ? national.plantingDensity.byUseZone.find((d) => d.useZone === densityCategory)
    : undefined;

  const appliesFromLandSizeM2 = municipality.landscapeAreaRatio.appliesFromLandSizeM2;
  const applies = landSize !== null && landSize >= appliesFromLandSizeM2;

  // 적용 비율 규칙: 사용자 선택 우선, 없으면 자동 제안
  const rules = municipality.landscapeAreaRatio.rules;
  const ruleIndex =
    selectedRuleIndex !== null && selectedRuleIndex >= 0 && selectedRuleIndex < rules.length
      ? selectedRuleIndex
      : suggestLandscapeRuleIndex(rules, densityCategory, grossFloorArea);
  const rule = ruleIndex !== null ? rules[ruleIndex] : undefined;

  // 조경 의무면적 / 식재의무면적
  const plantingMandatoryRatio = national.plantingMandatoryAreaRatio.ratioOfLandscapeArea;
  const landscapeMandatoryArea =
    applies && landSize !== null && rule ? landSize * rule.ratioOfLandArea : null;
  const plantingMandatoryArea =
    landscapeMandatoryArea !== null ? landscapeMandatoryArea * plantingMandatoryRatio : null;

  // 최소 교목/관목 수 (조경 의무면적 × 식재밀도, 올림)
  const minTrees =
    landscapeMandatoryArea !== null && density
      ? ceilOrNull(landscapeMandatoryArea * density.minTreePerM2)
      : null;
  const minShrubs =
    landscapeMandatoryArea !== null && density
      ? ceilOrNull(landscapeMandatoryArea * density.minShrubPerM2)
      : null;

  // 상록 / 지역특성수 규정 수량
  const evergreenMinRatio = national.speciesRatio.evergreenMinRatio.value;
  const regionalMinRatio = national.speciesRatio.regionalSpeciesMinRatio.value;
  const evergreenRequired =
    minTrees !== null && minShrubs !== null
      ? Math.ceil((minTrees + minShrubs) * evergreenMinRatio)
      : null;
  const regionalRequired = minTrees !== null ? Math.ceil(minTrees * regionalMinRatio) : null;

  // 미검증 여부: 지자체 룰셋 meta, 비율표/규칙, 시목
  const ruleUnverified =
    municipality.landscapeAreaRatio.verified === false || rule?.verified === false;
  const hasUnverified =
    municipality.meta.valuesVerified === false ||
    municipality.landscapeAreaRatio.verified === false ||
    rule?.verified === false ||
    municipality.regionalSpecies.verified === false;

  const criteria: PlantingCriteria = {
    landSize,
    applies,
    appliesFromLandSizeM2,
    rule,
    ruleIndex,
    landscapeMandatoryArea,
    plantingMandatoryArea,
    plantingMandatoryRatio,
    density,
    densityCategory,
    minTrees,
    minShrubs,
    evergreenMinRatio,
    evergreenMinRatioBasis: national.speciesRatio.evergreenMinRatio.basis,
    evergreenRequired,
    regionalMinRatio,
    regionalMinRatioBasis: national.speciesRatio.regionalSpeciesMinRatio.basis,
    regionalRequired,
    ruleUnverified: ruleUnverified === true,
  };

  // 입력 집계
  const totals: TreeTotals = {
    trees: quantityOf(trees, (r) => r.category === '교목'),
    shrubs: quantityOf(trees, (r) => r.category === '관목'),
    groundcover: quantityOf(trees, (r) => r.category === '지피'),
    evergreenTreesShrubs: quantityOf(
      trees,
      (r) => r.leafType === '상록' && (r.category === '교목' || r.category === '관목'),
    ),
    regionalTrees: quantityOf(trees, (r) => r.isRegional && r.category === '교목'),
  };

  // 항목별 검토
  const checks: PlantingCheckItem[] = [
    checkItem('trees', '교목 수', minTrees, totals.trees),
    checkItem('shrubs', '관목 수', minShrubs, totals.shrubs),
    checkItem('evergreen', '상록 비율', evergreenRequired, totals.evergreenTreesShrubs),
    checkItem('regional', '지역특성수 비율', regionalRequired, totals.regionalTrees),
  ];

  // 종합 판정
  let overallStatus: PlantingStatus = 'pending';
  if (checks.every((c) => c.status === 'fit')) {
    overallStatus = 'fit';
  } else if (checks.some((c) => c.status === 'unfit')) {
    overallStatus = 'unfit';
  }

  return { criteria, totals, checks, overallStatus, hasUnverified };
}
