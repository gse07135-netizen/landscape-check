import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { EcoRow } from '@/types/eco';
import { usePersistentState } from '@/lib/usePersistentState';
import { STORAGE_KEYS } from '@/lib/storageKeys';

/**
 * 생태면적률 입력 상태(공간유형 행 목록 + 사용자 목표치).
 * localStorage 에 자동 저장/복원되어 새로고침 후에도 유지된다.
 */

function createRow(): EcoRow {
  return { id: crypto.randomUUID(), code: '', area: null };
}

/** 저장된 행 배열을 안전하게 복원(형태 검증 + id 보정) */
function reviveRows(raw: unknown): EcoRow[] | null {
  if (!Array.isArray(raw)) return null;
  const rows: EcoRow[] = raw.map((item) => {
    const r = (item ?? {}) as Partial<EcoRow>;
    return {
      id: typeof r.id === 'string' ? r.id : crypto.randomUUID(),
      code: typeof r.code === 'string' ? r.code : '',
      area: typeof r.area === 'number' ? r.area : null,
    };
  });
  return rows.length > 0 ? rows : [createRow()];
}

function reviveTarget(raw: unknown): number | null {
  return typeof raw === 'number' ? raw : null;
}

interface EcoAreaRatioContextValue {
  rows: EcoRow[];
  /** 사용자가 직접 입력하는 목표 생태면적률(%) */
  targetPercent: number | null;
  addRow: () => void;
  removeRow: (id: string) => void;
  updateRow: (id: string, patch: Partial<Omit<EcoRow, 'id'>>) => void;
  setTargetPercent: (value: number | null) => void;
  /** 공간유형 행만 초기화(탭 내 "초기화" 버튼) */
  resetRows: () => void;
  /** 생태면적률 입력 전체 초기화(행 + 목표치) */
  resetAll: () => void;
}

const EcoAreaRatioContext = createContext<EcoAreaRatioContextValue | null>(null);

export function EcoAreaRatioProvider({ children }: { children: ReactNode }) {
  const [rows, setRows, clearRows] = usePersistentState<EcoRow[]>(
    STORAGE_KEYS.ecoRows,
    [createRow()],
    reviveRows,
  );
  const [targetPercent, setTargetPercent, clearTarget] = usePersistentState<number | null>(
    STORAGE_KEYS.ecoTarget,
    null,
    reviveTarget,
  );

  const value = useMemo<EcoAreaRatioContextValue>(
    () => ({
      rows,
      targetPercent,
      addRow: () => setRows((prev) => [...prev, createRow()]),
      removeRow: (id) =>
        setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id))),
      updateRow: (id, patch) =>
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),
      setTargetPercent,
      resetRows: () => clearRows([createRow()]),
      resetAll: () => {
        clearRows([createRow()]);
        clearTarget(null);
      },
    }),
    [rows, targetPercent, setRows, setTargetPercent, clearRows, clearTarget],
  );

  return <EcoAreaRatioContext value={value}>{children}</EcoAreaRatioContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEcoAreaRatio(): EcoAreaRatioContextValue {
  const ctx = useContext(EcoAreaRatioContext);
  if (!ctx) {
    throw new Error('useEcoAreaRatio 는 EcoAreaRatioProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
