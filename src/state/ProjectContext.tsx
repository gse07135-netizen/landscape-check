import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { INITIAL_PROJECT_INFO, type ProjectInfo } from '@/types/project';
import { usePersistentState } from '@/lib/usePersistentState';
import { STORAGE_KEYS } from '@/lib/storageKeys';

/**
 * 프로젝트 기본정보 상위 상태. localStorage 에 자동 저장/복원된다.
 * 모든 탭(기본정보/생태면적률/식재법규/리포트)이 동일한 ProjectInfo 를 공유한다.
 */

interface ProjectContextValue {
  project: ProjectInfo;
  /** 단일 필드 갱신 — 불변 패턴으로 새 객체 반환 */
  updateField: <K extends keyof ProjectInfo>(key: K, value: ProjectInfo[K]) => void;
  /** 전체 초기화 (저장값도 비움) */
  reset: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

/** 저장된 raw 값을 기본값과 병합하여 누락/드리프트에 안전하게 복원 */
function reviveProject(raw: unknown): ProjectInfo | null {
  if (!raw || typeof raw !== 'object') return null;
  return { ...INITIAL_PROJECT_INFO, ...(raw as Partial<ProjectInfo>) };
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject, clearProject] = usePersistentState(
    STORAGE_KEYS.project,
    INITIAL_PROJECT_INFO,
    reviveProject,
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      project,
      updateField: (key, fieldValue) =>
        setProject((prev) => ({ ...prev, [key]: fieldValue })),
      // 새 객체 사본을 넘겨 항상 리렌더(=저장키 제거)가 일어나도록 보장
      reset: () => clearProject({ ...INITIAL_PROJECT_INFO }),
    }),
    [project, setProject, clearProject],
  );

  return <ProjectContext value={value}>{children}</ProjectContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProject(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject 는 ProjectProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
