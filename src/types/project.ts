/**
 * 프로젝트 기본정보 도메인 타입.
 * 적용기준(StandardId)은 규제 데이터 JSON 파일과 1:1로 매핑된다.
 */

/** 적용기준 식별자 — eco-area-ratio.<ID>.json 파일과 매핑 */
export type StandardId = 'MOE' | 'SEOUL';

/** 적용기준 선택지(드롭다운 라벨용) */
export interface StandardOption {
  id: StandardId;
  label: string;
}

export const STANDARD_OPTIONS: readonly StandardOption[] = [
  { id: 'MOE', label: '환경부' },
  { id: 'SEOUL', label: '서울시' },
] as const;

/** 프로젝트 기본정보 — 상위 상태로 관리되는 핵심 입력값 */
export interface ProjectInfo {
  /** 프로젝트명 (필수, 최대 100자) */
  projectName: string;
  /** 대지면적 ㎡ (필수, 0 초과). 미입력 상태를 구분하기 위해 null 허용 */
  siteArea: number | null;
  /** 지자체 */
  municipality: string;
  /** 용도지역 */
  useZone: string;
  /** 사업유형 */
  projectType: string;
  /** 적용기준 (환경부/서울시) */
  standard: StandardId;
}

export const INITIAL_PROJECT_INFO: ProjectInfo = {
  projectName: '',
  siteArea: null,
  municipality: '',
  useZone: '',
  projectType: '',
  standard: 'MOE',
};
