import type { PlantingResult } from '@/lib/plantingCalc';
import { plantingStatusLabel, type TreeListRow } from '@/lib/plantingTable';
import {
  numCell,
  safeFileNamePart,
  writeWorkbook,
  type SheetSpec,
} from '@/lib/xlsxSheet';

/**
 * 수목 목록표 + 식재 법규 검토 결과 엑셀(xlsx) 내보내기 — SheetJS 사용.
 * 시트 구성은 buildPlantingSheet(순수)로 분리하여 통합 리포트에서도 재사용한다.
 */

export interface PlantingExportParams {
  projectName: string;
  landSize: number | null;
  grossFloorArea: number | null;
  municipalityName: string;
  source: string;
  effectiveBasis: string;
  valuesVerified: boolean;
  rows: TreeListRow[];
  result: PlantingResult;
}

/** 수목 목록표 시트 명세를 만든다(순수). */
export function buildPlantingSheet(p: PlantingExportParams): SheetSpec {
  const { criteria, checks } = p.result;
  const aoa: (string | number)[][] = [];

  aoa.push(['수목 목록표 / 식재 법규 검토']);
  aoa.push([]);
  aoa.push(['프로젝트명', p.projectName || '—']);
  aoa.push(['대지면적(㎡)', numCell(p.landSize)]);
  aoa.push(['연면적(㎡)', numCell(p.grossFloorArea)]);
  aoa.push(['적용 식재기준', p.municipalityName]);
  aoa.push(['출처', p.source]);
  aoa.push(['근거', p.effectiveBasis]);
  aoa.push(['검증상태', p.valuesVerified ? '검증됨' : '검증 필요']);
  aoa.push([]);

  aoa.push(['No', '수종명', '구분', '상록/낙엽', '규격', '수량', '지역특성수', '비고']);
  for (const r of p.rows) {
    aoa.push([
      r.no,
      r.speciesName,
      r.category,
      r.leafType,
      r.spec,
      numCell(r.quantity),
      r.isRegional ? 'O' : '',
      r.remark,
    ]);
  }
  aoa.push([]);

  aoa.push(['[식재 법규 기준]']);
  aoa.push(['조경 의무면적(㎡)', numCell(criteria.landscapeMandatoryArea)]);
  aoa.push(['식재의무면적(㎡)', numCell(criteria.plantingMandatoryArea)]);
  aoa.push(['최소 교목 수(주)', numCell(criteria.minTrees)]);
  aoa.push(['최소 관목 수(주)', numCell(criteria.minShrubs)]);
  aoa.push(['상록 규정 수량(주)', numCell(criteria.evergreenRequired)]);
  aoa.push(['지역특성수 규정 수량(주)', numCell(criteria.regionalRequired)]);
  aoa.push([]);

  aoa.push(['[검토 결과]', '기준', '현황', '부족분', '판정']);
  for (const c of checks) {
    aoa.push([
      c.label,
      numCell(c.required),
      c.current,
      c.status === 'unfit' && c.deficit ? c.deficit : '',
      plantingStatusLabel(c.status),
    ]);
  }
  aoa.push(['종합 판정', '', '', '', plantingStatusLabel(p.result.overallStatus)]);

  if (p.result.hasUnverified) {
    aoa.push([]);
    aoa.push(['※ 비고', '검증되지 않은 기준(미확정 비율·시목 등)이 포함되어 있어 결과는 참고용입니다.']);
  }

  return {
    name: '수목 목록표',
    aoa,
    cols: [
      { wch: 18 },
      { wch: 18 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 8 },
      { wch: 10 },
      { wch: 14 },
    ],
    merges: [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }],
  };
}

export async function exportPlantingXlsx(params: PlantingExportParams): Promise<void> {
  await writeWorkbook(
    [buildPlantingSheet(params)],
    `수목목록표_${safeFileNamePart(params.projectName)}.xlsx`,
  );
}
