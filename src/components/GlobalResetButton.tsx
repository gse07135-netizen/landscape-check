import { useProject } from '@/state/ProjectContext';
import { useEcoAreaRatio } from '@/state/EcoAreaRatioContext';
import { usePlanting } from '@/state/PlantingContext';
import { useDrawingAnalysis } from '@/state/DrawingAnalysisContext';
import { STORAGE_KEYS } from '@/lib/storageKeys';

/**
 * 전체 초기화 버튼.
 * 기본정보 + 생태면적률(행·목표치) + 식재(수목·연면적·지자체·규칙) + 도면 분석(결과·매핑)을
 * 모두 초기화하고 localStorage 저장값도 비운다. 실수 방지를 위해 confirm 후 실행.
 *
 * 각 Context 의 reset 은 새 객체를 넘겨 리렌더(=저장키 제거)가 일어나게 하고,
 * 추가로 모든 저장 키를 직접 제거해 자동 복원으로 옛 값이 살아나지 않게 한다(안전망).
 */
export function GlobalResetButton() {
  const { reset: resetProject } = useProject();
  const { resetAll: resetEco } = useEcoAreaRatio();
  const { resetAll: resetPlanting } = usePlanting();
  const { clear: clearDrawing } = useDrawingAnalysis();

  const handleClick = () => {
    if (!window.confirm('모든 입력을 초기화할까요?')) return;

    // 1) 각 Context 상태 초기화(새 객체 → 리렌더 + 저장키 제거)
    resetProject();
    resetEco();
    resetPlanting();
    clearDrawing();

    // 2) 안전망: 남은 저장 키가 있으면 모두 제거(자동저장/복원이 옛 값을 되살리지 못하게)
    try {
      Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    } catch {
      // localStorage 접근 불가 환경은 무시
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="no-print rounded-lg border border-unfit/40 px-3 py-1.5 text-xs font-medium text-unfit transition hover:bg-unfit-soft"
    >
      전체 초기화
    </button>
  );
}
