import { z } from 'zod';

/**
 * 식재 법규 규제 데이터(JSON) 검증 스키마.
 *
 * 실제 파일 구조를 그대로 반영한다.
 *  - NATIONAL: 전국 공통 정량 기준(식재밀도/식재의무면적 비율/상록·지역특성수 비율). baseRuleset 없음.
 *  - SEOUL/NAMYANGJU: scope="municipality", baseRuleset="PLANTING-NATIONAL" 준용.
 *    조경 의무면적 비율(landscapeAreaRatio)과 시목(regionalSpecies)만 지자체별로 규정.
 *  - verified 플래그: 룰셋(meta.valuesVerified), 비율 규칙(rule.verified), 시목(regionalSpecies.verified)
 *    수준에서 화면에 반영한다(남양주는 false).
 */

export const PlantingMetaSchema = z.object({
  source: z.string(),
  referenceUrl: z.string(),
  note: z.string().optional(),
  effectiveBasis: z.string(),
  lastUpdatedInApp: z.string(),
  valuesVerified: z.boolean(),
  verificationNote: z.string().optional(),
});
export type PlantingMeta = z.infer<typeof PlantingMetaSchema>;

/* ── 전국 공통(NATIONAL) ── */

export const DensityByUseZoneSchema = z.object({
  useZone: z.string(),
  minTreePerM2: z.number(),
  minShrubPerM2: z.number(),
});
export type DensityByUseZone = z.infer<typeof DensityByUseZoneSchema>;

const SpeciesRatioItemSchema = z.object({
  _note: z.string().optional(),
  value: z.number(),
  basis: z.string(),
});

export const NationalRulesetSchema = z.object({
  rulesetId: z.string(),
  rulesetName: z.string(),
  scope: z.literal('national'),
  meta: PlantingMetaSchema,
  plantingDensity: z.object({
    _note: z.string().optional(),
    unit: z.string(),
    byUseZone: z.array(DensityByUseZoneSchema),
  }),
  plantingMandatoryAreaRatio: z.object({
    _note: z.string().optional(),
    ratioOfLandscapeArea: z.number(),
  }),
  speciesRatio: z.object({
    evergreenMinRatio: SpeciesRatioItemSchema,
    regionalSpeciesMinRatio: SpeciesRatioItemSchema,
  }),
  treeMinSpec: z
    .object({
      _note: z.string().optional(),
      options: z.array(z.string()),
      minHeightM: z.number(),
    })
    .optional(),
  treeCountWeighting: z
    .object({
      _note: z.string().optional(),
      rules: z.array(z.object({ condition: z.string(), countsAs: z.number() })),
    })
    .optional(),
});
export type NationalRuleset = z.infer<typeof NationalRulesetSchema>;

/* ── 지자체(MUNICIPALITY) ── */

export const LandscapeRuleSchema = z.object({
  condition: z.string(),
  ratioOfLandArea: z.number(),
  verified: z.boolean().optional(),
});
export type LandscapeRule = z.infer<typeof LandscapeRuleSchema>;

export const MunicipalityRulesetSchema = z.object({
  rulesetId: z.string(),
  rulesetName: z.string(),
  scope: z.literal('municipality'),
  baseRuleset: z.string(),
  meta: PlantingMetaSchema,
  landscapeAreaRatio: z.object({
    _note: z.string().optional(),
    appliesFromLandSizeM2: z.number(),
    verified: z.boolean().optional(),
    rules: z.array(LandscapeRuleSchema),
  }),
  regionalSpecies: z.object({
    _note: z.string().optional(),
    cityTree: z.string().nullable(),
    speciesList: z.array(z.string()),
    verified: z.boolean(),
    expandNote: z.string().optional(),
  }),
});
export type MunicipalityRuleset = z.infer<typeof MunicipalityRulesetSchema>;
