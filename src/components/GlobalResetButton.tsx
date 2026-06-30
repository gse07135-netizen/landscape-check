import { useProject } from '@/state/ProjectContext';
import { useEcoAreaRatio } from '@/state/EcoAreaRatioContext';
import { usePlanting } from '@/state/PlantingContext';

/**
 * 전체 초기화 버튼.
 * 프로젝트 기본정보 + 생태면적률 입력(행·목표치) + 식재 입력(수목 목록 등)을
 * 한 번에 초기화하고 localStorage 저장값도 비운다. 실수 방지를 위해 confirm 후 실행.
 */
export function GlobalResetButton() {
  const { reset: resetProject } = useProject();
  const { resetAll: resetEco } = useEcoAreaRatio();
  const { resetAll: resetPlanting } = usePlanting();

  const handleClick = () => {
    if (window.confirm('모든 입력을 초기화할까요?')) {
      resetProject();
      resetEco();
      resetPlanting();
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
