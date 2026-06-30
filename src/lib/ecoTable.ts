import type { EcoResult, EcoStatus } from '@/lib/ecoCalc';

/**
 * 생태면적률 산정표 공통 빌더.
 * 미리보기(PRD 2.4)와 엑셀 내보내기(PRD 2.5)가 동일한 데이터를 사용하도록
 * 단일 소스로 행/요약을 구성한다.
 */

/** 산정표 한 행 */
export interface EcoTableRow {
  no: number;
  name: string;
  area: number | null;
  weight: number | null;
  convertedArea: number | null;
  /** 비고 — "검증 필요" / "가중치 미확정" / "" */
  remark: string;
}

const STATUS_LABEL: Record<EcoStatus, string> = {
  fit: '적합',
  unfit: '부적합',
  pending: '판정 보류',
};

export function ecoStatusLabel(status: EcoStatus): string {
  return STATUS_LABEL[status];
}

/**
 * 계산 결과에서 산정표 행을 만든다.
 * 공간유형이 선택된 행만 포함(미선택 빈 행 제외).
 * 비고 우선순위: verified===false → "검증 필요", 그 외 가중치 미확정 → "가중치 미확정".
 */
export function buildEcoTableRows(result: EcoResult): EcoTableRow[] {
  return result.rows
    .filter((r) => r.spaceType !== undefined)
    .map((r, idx) => {
      let remark = '';
      if (r.unverified) {
        remark = '검증 필요';
      } else if (r.weightUnconfirmed) {
        remark = '가중치 미확정';
      }
      return {
        no: idx + 1,
        name: r.spaceType?.name ?? '',
        area: r.area,
        weight: r.weight,
        convertedArea: r.convertedArea,
        remark,
      };
    });
}

/** 산정표에 표시할 요약 정보 */
export interface EcoTableSummary {
  totalInputArea: number;
  totalConvertedArea: number;
  siteArea: number | null;
  ecoRatioPercent: number | null;
  targetPercent: number | null;
  status: EcoStatus;
  statusLabel: string;
  deficitPercent: number | null;
  requiredConvertedArea: number | null;
  hasUnverified: boolean;
}

export function buildEcoTableSummary(
  result: EcoResult,
  siteArea: number | null,
  rows: EcoTableRow[],
): EcoTableSummary {
  return {
    totalInputArea: result.totalInputArea,
    totalConvertedArea: result.totalConvertedArea,
    siteArea,
    ecoRatioPercent: result.ecoRatioPercent,
    targetPercent: result.targetPercent,
    status: result.status,
    statusLabel: ecoStatusLabel(result.status),
    deficitPercent: result.deficitPercent,
    requiredConvertedArea: result.requiredConvertedArea,
    hasUnverified: rows.some((r) => r.remark === '검증 필요'),
  };
}
