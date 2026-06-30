import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { usePersistentState } from '@/lib/usePersistentState';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { convertResultUnit, type DxfUnit, type DxfExtractResult } from '@/lib/dxfExtract';
import type { TreeCategory } from '@/types/planting';

/**
 * 도면 분석 결과 + 연결 매핑 상태.
 * localStorage 에 저장되어 탭 전환·새로고침에도 유지된다.
 *
 * - 결과(result): 파싱된 도면 객체는 보관하지 않고 추출 결과만 저장. 단위 변경은
 *   결과 면적을 비례 환산(convertResultUnit) → 새로고침 후에도 단위 변경 가능.
 * - 매핑(ecoMapping/ecoSiteLayer/treeMapping): 사용자가 고른 연결 설정. 새 파일을
 *   분석하면 초기화된다.
 * - "적용"은 값을 복사할 뿐 이 상태를 비우지 않는다.
 */

/** 블록 → 식재 행 매핑 (구분 미지정='' 이면 보내지 않음) */
export interface BlockMapping {
  category: TreeCategory | '';
  speciesName: string;
}

interface DrawingAnalysisState {
  fileName: string | null;
  unit: DxfUnit;
  result: DxfExtractResult | null;
  /** 레이어 → 공간유형 code ('' = 보내지 않음) */
  ecoMapping: Record<string, string>;
  /** 대지면적으로 설정할 레이어 (null = 자동 기본값) */
  ecoSiteLayer: string | null;
  /** "레이어 블록이름" → 식재 매핑 */
  treeMapping: Record<string, BlockMapping>;
}

const INITIAL: DrawingAnalysisState = {
  fileName: null,
  unit: 'mm',
  result: null,
  ecoMapping: {},
  ecoSiteLayer: null,
  treeMapping: {},
};

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}

function reviveState(raw: unknown): DrawingAnalysisState | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<DrawingAnalysisState>;
  const unit: DxfUnit = s.unit === 'cm' || s.unit === 'm' || s.unit === 'mm' ? s.unit : 'mm';
  return {
    fileName: typeof s.fileName === 'string' ? s.fileName : null,
    unit,
    result: s.result && typeof s.result === 'object' ? (s.result as DxfExtractResult) : null,
    ecoMapping: asRecord(s.ecoMapping) as Record<string, string>,
    ecoSiteLayer: typeof s.ecoSiteLayer === 'string' ? s.ecoSiteLayer : null,
    treeMapping: asRecord(s.treeMapping) as Record<string, BlockMapping>,
  };
}

interface DrawingAnalysisContextValue {
  fileName: string | null;
  unit: DxfUnit;
  result: DxfExtractResult | null;
  ecoMapping: Record<string, string>;
  ecoSiteLayer: string | null;
  treeMapping: Record<string, BlockMapping>;
  /** 업로드·분석 완료 시 결과 저장(현재 단위 기준 추출). 매핑은 새 파일이므로 초기화 */
  setAnalysis: (fileName: string, result: DxfExtractResult) => void;
  /** 단위 변경 — 저장된 결과 면적을 비례 환산 */
  setUnit: (unit: DxfUnit) => void;
  setEcoMapping: (layer: string, code: string) => void;
  setEcoSiteLayer: (layer: string | null) => void;
  setTreeMapping: (key: string, value: BlockMapping) => void;
  /** 도면 분석 결과·매핑 비우기 */
  clear: () => void;
}

const DrawingAnalysisContext = createContext<DrawingAnalysisContextValue | null>(null);

export function DrawingAnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState, clearState] = usePersistentState<DrawingAnalysisState>(
    STORAGE_KEYS.drawing,
    INITIAL,
    reviveState,
  );

  const value = useMemo<DrawingAnalysisContextValue>(
    () => ({
      fileName: state.fileName,
      unit: state.unit,
      result: state.result,
      ecoMapping: state.ecoMapping,
      ecoSiteLayer: state.ecoSiteLayer,
      treeMapping: state.treeMapping,
      setAnalysis: (fileName, result) =>
        setState((prev) => ({
          ...prev,
          fileName,
          result,
          unit: result.unit,
          // 새 파일 → 매핑 초기화
          ecoMapping: {},
          ecoSiteLayer: null,
          treeMapping: {},
        })),
      setUnit: (unit) =>
        setState((prev) => ({
          ...prev,
          unit,
          result: prev.result ? convertResultUnit(prev.result, unit) : prev.result,
        })),
      setEcoMapping: (layer, code) =>
        setState((prev) => ({
          ...prev,
          ecoMapping: { ...prev.ecoMapping, [layer]: code },
        })),
      setEcoSiteLayer: (layer) => setState((prev) => ({ ...prev, ecoSiteLayer: layer })),
      setTreeMapping: (key, mapValue) =>
        setState((prev) => ({
          ...prev,
          treeMapping: { ...prev.treeMapping, [key]: mapValue },
        })),
      clear: () => clearState({ ...INITIAL }),
    }),
    [state, setState, clearState],
  );

  return <DrawingAnalysisContext value={value}>{children}</DrawingAnalysisContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDrawingAnalysis(): DrawingAnalysisContextValue {
  const ctx = useContext(DrawingAnalysisContext);
  if (!ctx) {
    throw new Error('useDrawingAnalysis 는 DrawingAnalysisProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
