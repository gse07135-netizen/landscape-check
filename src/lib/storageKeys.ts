/** localStorage 저장 키 (한 곳에서 관리). 스키마 변경 시 버전 접미사를 올린다. */
export const STORAGE_KEYS = {
  project: 'landscape-check:project:v1',
  ecoRows: 'landscape-check:eco.rows:v1',
  ecoTarget: 'landscape-check:eco.target:v1',
  plantingMunicipality: 'landscape-check:planting.municipality:v1',
  plantingGrossFloorArea: 'landscape-check:planting.grossFloorArea:v1',
  plantingSelectedRuleIndex: 'landscape-check:planting.selectedRuleIndex:v1',
  plantingTrees: 'landscape-check:planting.trees:v1',
} as const;
