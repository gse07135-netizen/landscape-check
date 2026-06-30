/**
 * SheetJS 워크시트 공통 명세 + 워크북 작성 헬퍼.
 *
 * 시트 구성(AOA/열너비/병합)은 순수 데이터(SheetSpec)로 표현하고,
 * 실제 xlsx 작성은 writeWorkbook 에서 동적 import 로 처리한다.
 * 덕분에 단일 시트 내보내기와 다중 시트 통합 내보내기가 같은 빌더를 재사용한다.
 */

export interface CellMerge {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

export interface SheetSpec {
  name: string;
  aoa: (string | number)[][];
  cols?: { wch: number }[];
  merges?: CellMerge[];
}

/** null/NaN → 빈 셀 */
export function numCell(value: number | null): number | string {
  return value === null || Number.isNaN(value) ? '' : value;
}

/** 시트 명세 배열로 워크북을 만들어 파일로 저장한다. */
export async function writeWorkbook(sheets: SheetSpec[], fileName: string): Promise<void> {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  for (const spec of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(spec.aoa);
    if (spec.cols) ws['!cols'] = spec.cols;
    if (spec.merges) ws['!merges'] = spec.merges;
    XLSX.utils.book_append_sheet(wb, ws, spec.name);
  }
  XLSX.writeFile(wb, fileName);
}

/** 파일명에 부적합한 문자 제거 */
export function safeFileNamePart(name: string): string {
  return (name.trim() || '무제').replace(/[\\/:*?"<>|]/g, '_');
}
