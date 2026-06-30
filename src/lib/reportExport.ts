import { buildEcoSheet, type EcoExportParams } from '@/lib/ecoExport';
import { buildPlantingSheet, type PlantingExportParams } from '@/lib/plantingExport';
import { safeFileNamePart, writeWorkbook } from '@/lib/xlsxSheet';

/**
 * 통합 엑셀 내보내기 (PRD 4.3).
 * 생태면적률 산정표와 수목 목록표를 하나의 xlsx 파일에 두 시트로 묶는다.
 */

export interface CombinedExportParams {
  projectName: string;
  eco: EcoExportParams;
  planting: PlantingExportParams;
}

export async function exportCombinedXlsx(params: CombinedExportParams): Promise<void> {
  await writeWorkbook(
    [buildEcoSheet(params.eco), buildPlantingSheet(params.planting)],
    `통합리포트_${safeFileNamePart(params.projectName)}.xlsx`,
  );
}
