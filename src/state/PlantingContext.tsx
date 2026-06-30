import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  PLANTING_MUNICIPALITY_OPTIONS,
  TREE_CATEGORIES,
  LEAF_TYPES,
  type PlantingMunicipalityId,
  type TreeRow,
  type TreeCategory,
  type LeafType,
} from '@/types/planting';
import { usePersistentState } from '@/lib/usePersistentState';
import { STORAGE_KEYS } from '@/lib/storageKeys';

/**
 * 식재 법규 입력 상태(지자체 선택 · 연면적 · 적용 비율 규칙 · 수목 목록).
 * localStorage 에 자동 저장/복원되어 새로고침 후에도 유지된다.
 */

function createTreeRow(): TreeRow {
  return {
    id: crypto.randomUUID(),
    speciesName: '',
    category: '교목',
    leafType: '낙엽',
    spec: '',
    quantity: null,
    isRegional: false,
  };
}

function reviveMunicipality(raw: unknown): PlantingMunicipalityId | null {
  return PLANTING_MUNICIPALITY_OPTIONS.some((o) => o.id === raw)
    ? (raw as PlantingMunicipalityId)
    : null;
}

function reviveNumber(raw: unknown): number | null {
  return typeof raw === 'number' ? raw : null;
}

/** 저장된 수목 배열을 안전하게 복원(형태/열거형 검증 + id 보정) */
function reviveTrees(raw: unknown): TreeRow[] | null {
  if (!Array.isArray(raw)) return null;
  const rows: TreeRow[] = raw.map((item) => {
    const t = (item ?? {}) as Partial<TreeRow>;
    const category = TREE_CATEGORIES.includes(t.category as TreeCategory)
      ? (t.category as TreeCategory)
      : '교목';
    const leafType = LEAF_TYPES.includes(t.leafType as LeafType)
      ? (t.leafType as LeafType)
      : '낙엽';
    return {
      id: typeof t.id === 'string' ? t.id : crypto.randomUUID(),
      speciesName: typeof t.speciesName === 'string' ? t.speciesName : '',
      category,
      leafType,
      spec: typeof t.spec === 'string' ? t.spec : '',
      quantity: typeof t.quantity === 'number' ? t.quantity : null,
      isRegional: t.isRegional === true,
    };
  });
  return rows.length > 0 ? rows : [createTreeRow()];
}

interface PlantingContextValue {
  municipality: PlantingMunicipalityId;
  /** 연면적 합계 ㎡ (조경 의무면적 비율 결정에 사용) */
  grossFloorArea: number | null;
  /** 적용 비율 규칙 인덱스. null = 자동 제안 */
  selectedRuleIndex: number | null;
  trees: TreeRow[];
  setMunicipality: (id: PlantingMunicipalityId) => void;
  setGrossFloorArea: (value: number | null) => void;
  setSelectedRuleIndex: (index: number | null) => void;
  addTree: () => void;
  removeTree: (id: string) => void;
  updateTree: (id: string, patch: Partial<Omit<TreeRow, 'id'>>) => void;
  /** 수목 목록만 초기화(탭 내 "초기화" 버튼) */
  resetTrees: () => void;
  /** 식재 입력 전체 초기화(지자체·연면적·적용규칙·수목) */
  resetAll: () => void;
}

const PlantingContext = createContext<PlantingContextValue | null>(null);

export function PlantingProvider({ children }: { children: ReactNode }) {
  const [municipality, setMunicipalityState, clearMunicipality] =
    usePersistentState<PlantingMunicipalityId>(
      STORAGE_KEYS.plantingMunicipality,
      'SEOUL',
      reviveMunicipality,
    );
  const [grossFloorArea, setGrossFloorArea, clearGrossFloorArea] = usePersistentState<number | null>(
    STORAGE_KEYS.plantingGrossFloorArea,
    null,
    reviveNumber,
  );
  const [selectedRuleIndex, setSelectedRuleIndex, clearSelectedRuleIndex] = usePersistentState<
    number | null
  >(STORAGE_KEYS.plantingSelectedRuleIndex, null, reviveNumber);
  const [trees, setTrees, clearTrees] = usePersistentState<TreeRow[]>(
    STORAGE_KEYS.plantingTrees,
    [createTreeRow()],
    reviveTrees,
  );

  const value = useMemo<PlantingContextValue>(
    () => ({
      municipality,
      grossFloorArea,
      selectedRuleIndex,
      trees,
      // 지자체 변경 시 적용 규칙 인덱스는 룰셋이 달라지므로 자동(null)로 초기화
      setMunicipality: (id) => {
        setMunicipalityState(id);
        setSelectedRuleIndex(null);
      },
      setGrossFloorArea,
      setSelectedRuleIndex,
      addTree: () => setTrees((prev) => [...prev, createTreeRow()]),
      removeTree: (id) =>
        setTrees((prev) => (prev.length <= 1 ? prev : prev.filter((t) => t.id !== id))),
      updateTree: (id, patch) =>
        setTrees((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      resetTrees: () => clearTrees([createTreeRow()]),
      resetAll: () => {
        clearMunicipality('SEOUL');
        clearGrossFloorArea(null);
        clearSelectedRuleIndex(null);
        clearTrees([createTreeRow()]);
      },
    }),
    [
      municipality,
      grossFloorArea,
      selectedRuleIndex,
      trees,
      setMunicipalityState,
      setGrossFloorArea,
      setSelectedRuleIndex,
      setTrees,
      clearMunicipality,
      clearGrossFloorArea,
      clearSelectedRuleIndex,
      clearTrees,
    ],
  );

  return <PlantingContext value={value}>{children}</PlantingContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlanting(): PlantingContextValue {
  const ctx = useContext(PlantingContext);
  if (!ctx) {
    throw new Error('usePlanting 은 PlantingProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
