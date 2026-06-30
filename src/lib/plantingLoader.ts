import nationalRaw from '@/data/planting-rules/planting-rules.NATIONAL.json';
import seoulRaw from '@/data/planting-rules/planting-rules.SEOUL.json';
import namyangjuRaw from '@/data/planting-rules/planting-rules.NAMYANGJU.json';
import {
  NationalRulesetSchema,
  MunicipalityRulesetSchema,
  type NationalRuleset,
  type MunicipalityRuleset,
} from '@/schemas/plantingRules.schema';
import type { PlantingMunicipalityId } from '@/types/planting';

/**
 * 식재 법규 규제 데이터 로더.
 *
 * 지자체 룰셋은 baseRuleset(PLANTING-NATIONAL)을 준용하므로,
 * national(베이스)과 municipality(지자체)를 함께 검증·반환한다.
 * 모든 수치는 검증된 이 데이터에서만 읽는다(하드코딩 금지).
 */

const MUNICIPALITY_RAW: Record<PlantingMunicipalityId, unknown> = {
  SEOUL: seoulRaw,
  NAMYANGJU: namyangjuRaw,
};

let nationalCache: NationalRuleset | null = null;
const municipalityCache = new Map<PlantingMunicipalityId, MunicipalityRuleset>();

export interface PlantingRuleset {
  /** 전국 공통 베이스 */
  national: NationalRuleset;
  /** 선택된 지자체 룰셋 */
  municipality: MunicipalityRuleset;
}

export function loadPlantingRuleset(id: PlantingMunicipalityId): PlantingRuleset {
  if (!nationalCache) {
    nationalCache = NationalRulesetSchema.parse(nationalRaw);
  }

  let municipality = municipalityCache.get(id);
  if (!municipality) {
    municipality = MunicipalityRulesetSchema.parse(MUNICIPALITY_RAW[id]);
    municipalityCache.set(id, municipality);
  }

  return { national: nationalCache, municipality };
}
