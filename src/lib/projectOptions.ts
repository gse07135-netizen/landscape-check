/**
 * 기본정보 드롭다운 선택지 (Phase 0 임시 상수).
 *
 * TODO(Phase 1+): PRD 1.2.1 에 따라 "실제 규제 데이터가 구축된 지자체만" 노출하고,
 *   용도지역·사업유형은 선택된 지자체/기준 데이터에서 파생하도록 교체한다.
 *   현재는 골격 확인용 임시값이다.
 */

export interface Option {
  value: string;
  label: string;
}

/** 지자체 — MVP는 데이터가 있는 곳만 (서울 / 그 외=환경부 일반) */
export const MUNICIPALITY_OPTIONS: readonly Option[] = [
  { value: 'seoul', label: '서울특별시' },
  { value: 'etc', label: '기타 (환경부 일반)' },
] as const;

/** 용도지역 (임시) */
export const USE_ZONE_OPTIONS: readonly Option[] = [
  { value: 'residential_exclusive', label: '전용주거지역' },
  { value: 'residential_general', label: '일반주거지역' },
  { value: 'semi_residential', label: '준주거지역' },
  { value: 'commercial', label: '상업지역' },
  { value: 'industrial', label: '공업지역' },
  { value: 'green', label: '녹지지역' },
] as const;

/** 사업유형 (임시) */
export const PROJECT_TYPE_OPTIONS: readonly Option[] = [
  { value: 'apartment', label: '공동주택' },
  { value: 'house', label: '단독주택' },
  { value: 'general_building', label: '일반건축물' },
  { value: 'park', label: '공원' },
  { value: 'school', label: '학교' },
] as const;
