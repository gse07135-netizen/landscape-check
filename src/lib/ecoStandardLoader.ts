import moeRaw from '@/data/eco-area-ratio/eco-area-ratio.MOE.json';
import seoulRaw from '@/data/eco-area-ratio/eco-area-ratio.SEOUL.json';
import { EcoStandardSchema, type EcoStandard } from '@/schemas/ecoAreaRatio.schema';
import type { StandardId } from '@/types/project';

/**
 * 생태면적률 규제 데이터 로더.
 *
 * JSON을 정적 import 한 뒤 zod 스키마로 검증하여 타입 안전한 객체를 반환한다.
 * 기준이 2개뿐이라 코드 스플리팅 대신 단순 매핑을 사용한다(KISS).
 * 기준이 늘어나면 import.meta.glob 으로 전환 가능.
 *
 * 검증 결과는 캐싱하여 동일 기준 재요청 시 재파싱하지 않는다.
 */

const RAW_BY_STANDARD: Record<StandardId, unknown> = {
  MOE: moeRaw,
  SEOUL: seoulRaw,
};

const cache = new Map<StandardId, EcoStandard>();

/**
 * 선택된 기준의 생태면적률 규제 데이터를 검증·반환한다.
 * 데이터가 스키마와 맞지 않으면 ZodError 를 던진다(빠른 실패).
 */
export function loadEcoStandard(id: StandardId): EcoStandard {
  const cached = cache.get(id);
  if (cached) return cached;

  const parsed = EcoStandardSchema.parse(RAW_BY_STANDARD[id]);
  cache.set(id, parsed);
  return parsed;
}
