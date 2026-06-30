import type { PlantingStatus } from '@/lib/plantingCalc';
import type { TreeRow } from '@/types/planting';

/**
 * 수목 목록표 공통 빌더.
 * 미리보기(PRD 3.5)와 엑셀 내보내기가 동일한 데이터를 사용하도록 단일 소스로 구성한다.
 */

export interface TreeListRow {
  no: number;
  speciesName: string;
  category: string;
  leafType: string;
  spec: string;
  quantity: number | null;
  isRegional: boolean;
  remark: string;
}

const STATUS_LABEL: Record<PlantingStatus, string> = {
  fit: '적합',
  unfit: '부적합',
  pending: '판정 보류',
};

export function plantingStatusLabel(status: PlantingStatus): string {
  return STATUS_LABEL[status];
}

/**
 * 수목 입력에서 목록표 행을 만든다.
 * 수종명이 있거나 수량이 입력된 행만 포함(빈 행 제외).
 */
export function buildTreeListRows(trees: TreeRow[]): TreeListRow[] {
  return trees
    .filter((t) => t.speciesName.trim() !== '' || (t.quantity !== null && t.quantity > 0))
    .map((t, idx) => ({
      no: idx + 1,
      speciesName: t.speciesName.trim() || '(미입력)',
      category: t.category,
      leafType: t.leafType,
      spec: t.spec.trim(),
      quantity: t.quantity,
      isRegional: t.isRegional,
      remark: t.isRegional ? '지역특성수' : '',
    }));
}
