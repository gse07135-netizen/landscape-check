import { z } from 'zod';

/**
 * 생태면적률 규제 데이터(JSON) 검증 스키마.
 *
 * 실제 데이터 파일(eco-area-ratio.MOE.json / eco-area-ratio.SEOUL.json)의
 * 구조를 그대로 반영한다. 두 파일의 차이를 흡수하기 위해:
 *  - spaceTypes[].weight  : SEOUL 신설 3종(식생체류지·공중정원·보존수목)이 null → nullable
 *  - spaceTypes[].verified: MOE에는 없고 SEOUL에만 존재 → optional
 *  - meta.valuesVerified  : MOE는 boolean(true), SEOUL은 string("partial") → union
 *
 * 모든 규제 수치는 이 스키마를 통과한 데이터에서만 읽는다. (하드코딩 금지)
 */

export const SpaceTypeSchema = z.object({
  no: z.number().int(),
  code: z.string(),
  name: z.string(),
  /** 가중치. 미확정(예: SEOUL 2023 신설 유형)은 null */
  weight: z.number().nullable(),
  criteria: z.string(),
  /** 가중치 검증 여부. MOE 파일에는 필드 자체가 없음 */
  verified: z.boolean().optional(),
  /** 미확정 사유 등 비고 */
  note: z.string().optional(),
});
export type SpaceType = z.infer<typeof SpaceTypeSchema>;

export const MetaSchema = z.object({
  source: z.string(),
  referenceUrl: z.string(),
  crossCheckedAgainst: z.string().optional(),
  effectiveDate: z.string(),
  version: z.string(),
  lastUpdatedInApp: z.string(),
  /** MOE: boolean(true), SEOUL: string("partial") */
  valuesVerified: z.union([z.boolean(), z.string()]),
  verificationNote: z.string().optional(),
  revisionNotes2023: z.array(z.string()).optional(),
});
export type StandardMeta = z.infer<typeof MetaSchema>;

export const FormulaSchema = z.object({
  ecoAreaRatioPercent: z.string(),
  convertedArea: z.string(),
  decimalPlaces: z.number().int(),
});

/** 목표 생태면적률 1건 (entries 가 채워졌을 때의 형태) */
export const TargetRatioEntrySchema = z.object({
  useZone: z.string(),
  projectType: z.string(),
  targetPercent: z.number(),
});
export type TargetRatioEntry = z.infer<typeof TargetRatioEntrySchema>;

export const TargetRatiosSchema = z.object({
  _note: z.string().optional(),
  verified: z.boolean().optional(),
  entriesSchemaExample: z.unknown().optional(),
  /** 현재 두 파일 모두 빈 배열. 목표치 미입력 시 판정 보류 처리 */
  entries: z.array(TargetRatioEntrySchema),
});
export type TargetRatios = z.infer<typeof TargetRatiosSchema>;

export const EcoStandardSchema = z.object({
  standardId: z.string(),
  standardName: z.string(),
  meta: MetaSchema,
  formula: FormulaSchema,
  spaceTypes: z.array(SpaceTypeSchema),
  specialRules: z.array(z.string()),
  targetRatios: TargetRatiosSchema,
});

/** 검증·추론된 생태면적률 규제 데이터 타입 */
export type EcoStandard = z.infer<typeof EcoStandardSchema>;
