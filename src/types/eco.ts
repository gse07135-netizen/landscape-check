import type { RowSource } from '@/types/common';

/** 생태면적률 입력 행 — 사용자가 입력하는 공간유형별 면적 한 줄 */
export interface EcoRow {
  /** 행 식별자(React key, 불변) */
  id: string;
  /** 선택된 공간유형 code. 미선택 시 '' */
  code: string;
  /** 입력 면적 ㎡. 미입력 시 null */
  area: number | null;
  /** 출처 — 도면 분석에서 추가된 행이면 'drawing' (미지정=직접 입력) */
  source?: RowSource;
}
