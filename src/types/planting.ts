import type { RowSource } from '@/types/common';

/** 식재 법규 검토 도메인 타입 */

/** 식재 기준이 구축된 지자체 식별자 — planting-rules.<ID>.json 과 매핑 */
export type PlantingMunicipalityId = 'SEOUL' | 'NAMYANGJU';

export interface PlantingMunicipalityOption {
  id: PlantingMunicipalityId;
  label: string;
}

export const PLANTING_MUNICIPALITY_OPTIONS: readonly PlantingMunicipalityOption[] = [
  { id: 'SEOUL', label: '서울특별시' },
  { id: 'NAMYANGJU', label: '남양주시' },
] as const;

/** 수목 구분 */
export type TreeCategory = '교목' | '관목' | '지피';
export const TREE_CATEGORIES: readonly TreeCategory[] = ['교목', '관목', '지피'] as const;

/** 상록/낙엽 */
export type LeafType = '상록' | '낙엽';
export const LEAF_TYPES: readonly LeafType[] = ['상록', '낙엽'] as const;

/** 수목 입력 행 */
export interface TreeRow {
  id: string;
  /** 수종명 */
  speciesName: string;
  /** 구분(교목/관목/지피) */
  category: TreeCategory;
  /** 상록/낙엽 */
  leafType: LeafType;
  /** 규격 (자유 텍스트, 예: B5, H1.5×W0.4) */
  spec: string;
  /** 수량 */
  quantity: number | null;
  /** 지역특성수 여부 */
  isRegional: boolean;
  /** 출처 — 도면 분석에서 추가된 행이면 'drawing' (미지정=직접 입력) */
  source?: RowSource;
}
