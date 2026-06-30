import type { EcoTableRow, EcoTableSummary } from '@/lib/ecoTable';
import {
  numCell,
  safeFileNamePart,
  writeWorkbook,
  type SheetSpec,
} from '@/lib/xlsxSheet';

/**
 * 생태면적률 산정표 엑셀(xlsx) 내보내기 — SheetJS 사용.
 * 시트 구성은 buildEcoSheet(순수)로 분리하여 통합 리포트에서도 재사용한다.
 * 외부 파일을 읽지 않고 작성만 하므로 파서 측 취약점과 무관.
 */

export interface EcoExportParams {
  projectName: string;
  siteArea: number | null;
  standardName: string;
  source: string;
  effectiveDate: string;
  rows: EcoTableRow[];
  summary: EcoTableSummary;
}

/** 가중치 셀 — 미확정은 문자열로 명시 */
function weightCell(value: number | null): number | string {
  return value === null ? '미확정' : value;
}

/** 생태면적률 산정표 시트 명세를 만든다(순수). */
export function buildEcoSheet(p: EcoExportParams): SheetSpec {
  const { summary } = p;
  const aoa: (string | number)[][] = [];

  aoa.push(['생태면적률 산정표']);
  aoa.push([]);
  aoa.push(['프로젝트명', p.projectName || '—']);
  aoa.push(['대지면적(㎡)', numCell(p.siteArea)]);
  aoa.push(['적용기준', p.standardName]);
  aoa.push(['출처', p.source]);
  aoa.push(['시행일', p.effectiveDate]);
  aoa.push([]);

  aoa.push(['No', '공간유형', '면적(㎡)', '가중치', '환산면적(㎡)', '비고']);
  for (const r of p.rows) {
    const converted =
      r.remark === '검증 필요' || r.remark === '가중치 미확정' ? '' : numCell(r.convertedArea);
    aoa.push([r.no, r.name, numCell(r.area), weightCell(r.weight), converted, r.remark]);
  }

  aoa.push(['', '합계', numCell(summary.totalInputArea), '', numCell(summary.totalConvertedArea), '']);
  aoa.push([]);

  aoa.push(['총 환산면적(㎡)', numCell(summary.totalConvertedArea)]);
  aoa.push(['대지면적(㎡)', numCell(summary.siteArea)]);
  aoa.push(['생태면적률(%)', numCell(summary.ecoRatioPercent)]);
  aoa.push(['목표 생태면적률(%)', numCell(summary.targetPercent)]);
  aoa.push(['판정', summary.statusLabel]);
  if (summary.status === 'unfit') {
    aoa.push(['부족분(%p)', numCell(summary.deficitPercent)]);
    aoa.push(['추가 필요 환산면적(㎡)', numCell(summary.requiredConvertedArea)]);
  }
  if (summary.hasUnverified) {
    aoa.push([]);
    aoa.push(['※ 비고', '검증이 필요한(가중치 미확정) 공간유형이 포함되어 있어 환산면적에서 제외되었습니다.']);
  }

  return {
    name: '생태면적률 산정표',
    aoa,
    cols: [{ wch: 8 }, { wch: 24 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 24 }],
    merges: [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }],
  };
}

export async function exportEcoAreaRatioXlsx(params: EcoExportParams): Promise<void> {
  await writeWorkbook(
    [buildEcoSheet(params)],
    `생태면적률_산정표_${safeFileNamePart(params.projectName)}.xlsx`,
  );
}
