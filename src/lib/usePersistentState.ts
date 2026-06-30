import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

/**
 * localStorage 와 동기화되는 useState.
 *
 * - 마운트 시 저장값을 복원(없거나 손상되면 initial 로 폴백).
 * - 상태가 바뀔 때마다 자동 저장.
 * - clear(value): 저장 키를 즉시 제거하고 state 를 value 로 되돌린다(초기화 버튼용).
 *   재렌더가 일어나는 경우(value 가 현재 state 와 다른 참조)에는 직후 1회 저장을 건너뛰어
 *   제거된 키가 기본값으로 다시 채워지지 않게 한다. 값이 동일해 재렌더가 없으면
 *   동기 removeItem 만으로 충분히 비워진다.
 *
 * revive 로 외부에서 불러온 raw 값을 검증/정규화한다(스키마 드리프트·손상 방지).
 * 저장/복원 실패(프라이빗 모드·용량 초과 등)는 조용히 무시하여 앱 동작에 영향을 주지 않는다.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  revive?: (raw: unknown) => T | null,
): readonly [T, Dispatch<SetStateAction<T>>, (value: T) => void] {
  const [state, setState] = useState<T>(() => loadInitial(key, initial, revive));

  // 최신 state 참조(clear 에서 재렌더 발생 여부 판단용)
  const stateRef = useRef(state);
  stateRef.current = state;

  // clear 직후 1회 저장을 건너뛰기 위한 플래그
  const skipNextPersist = useRef(false);

  useEffect(() => {
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // 무시
    }
  }, [key, state]);

  const clear = useCallback(
    (value: T) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // 무시
      }
      // value 가 현재 state 와 다르면 재렌더 → 직후 저장 1회 건너뜀
      if (!Object.is(value, stateRef.current)) {
        skipNextPersist.current = true;
      }
      setState(value);
    },
    [key],
  );

  return [state, setState, clear] as const;
}

function loadInitial<T>(key: string, initial: T, revive?: (raw: unknown) => T | null): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return initial;
    const parsed: unknown = JSON.parse(raw);
    if (revive) {
      const revived = revive(parsed);
      return revived ?? initial;
    }
    return parsed as T;
  } catch {
    return initial;
  }
}
