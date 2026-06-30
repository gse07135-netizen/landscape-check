import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { NumberField, SelectField } from '@/components/ui/Field';
import { useProject } from '@/state/ProjectContext';
import { usePlanting } from '@/state/PlantingContext';
import { loadPlantingRuleset } from '@/lib/plantingLoader';
import { calculatePlanting } from '@/lib/plantingCalc';
import { buildTreeListRows } from '@/lib/plantingTable';
import { exportPlantingXlsx } from '@/lib/plantingExport';
import { PLANTING_MUNICIPALITY_OPTIONS, type PlantingMunicipalityId } from '@/types/planting';
import { USE_ZONE_OPTIONS } from '@/lib/projectOptions';
import { formatArea } from '@/lib/format';
import { TreeInputTable } from './TreeInputTable';
import { PlantingCriteriaSummary } from './PlantingCriteriaSummary';
import { PlantingResultPanel } from './PlantingResultPanel';
import { PlantingRulesetInfo } from './PlantingRulesetInfo';
import { PlantingPreviewTable } from './PlantingPreviewTable';

/**
 * 식재 법규 검토 탭 (PRD 3장).
 * 좌(검토 조건 + 수목 입력) / 우(기준 요약 + 검토 결과) + 하단 수목 목록표 미리보기/내보내기.
 * 입력 변경 시 useMemo 로 렌더 중 즉시 재계산(실시간).
 */
export function PlantingCheckTab() {
  const { project } = useProject();
  const {
    municipality,
    grossFloorArea,
    selectedRuleIndex,
    trees,
    setMunicipality,
    setGrossFloorArea,
    setSelectedRuleIndex,
    addTree,
    removeTree,
    updateTree,
    resetTrees,
  } = usePlanting();

  const [showPreview, setShowPreview] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const ruleset = useMemo(() => loadPlantingRuleset(municipality), [municipality]);

  const result = useMemo(
    () =>
      calculatePlanting({
        ruleset,
        landSize: project.siteArea,
        useZone: project.useZone,
        grossFloorArea,
        selectedRuleIndex,
        trees,
      }),
    [ruleset, project.siteArea, project.useZone, grossFloorArea, selectedRuleIndex, trees],
  );

  const treeListRows = useMemo(() => buildTreeListRows(trees), [trees]);

  const useZoneLabel =
    USE_ZONE_OPTIONS.find((o) => o.value === project.useZone)?.label ?? '미선택';
  const canExport = treeListRows.length > 0;

  const ruleOptions = [
    { value: 'auto', label: '자동 (연면적 기준)' },
    ...ruleset.municipality.landscapeAreaRatio.rules.map((r, idx) => ({
      value: String(idx),
      label: `${(r.ratioOfLandArea * 100).toFixed(0)}% · ${r.condition}${r.verified === false ? ' ⚠' : ''}`,
    })),
  ];

  const handleExport = async () => {
    setExportError(null);
    setIsExporting(true);
    try {
      await exportPlantingXlsx({
        projectName: project.projectName,
        landSize: project.siteArea,
        grossFloorArea,
        municipalityName: ruleset.municipality.rulesetName,
        source: ruleset.municipality.meta.source,
        effectiveBasis: ruleset.municipality.meta.effectiveBasis,
        valuesVerified: ruleset.municipality.meta.valuesVerified,
        rows: treeListRows,
        result,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      setExportError(`엑셀 내보내기에 실패했습니다: ${message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* 좌: 조건 + 수목 입력 */}
        <div className="flex flex-col gap-6">
          <Card title="검토 조건" description="지자체·연면적·적용 조건을 설정합니다.">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                id="plantingMunicipality"
                label="지자체 (식재 기준)"
                value={municipality}
                onChange={(v) => setMunicipality(v as PlantingMunicipalityId)}
                options={PLANTING_MUNICIPALITY_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
              />
              <NumberField
                id="grossFloorArea"
                label="연면적 합계"
                unit="㎡"
                min={0}
                step={0.01}
                placeholder="0.00"
                value={grossFloorArea}
                onChange={setGrossFloorArea}
                hint="조경 의무면적 비율 결정에 사용"
              />
              <div className="sm:col-span-2">
                <SelectField
                  id="landscapeRule"
                  label="조경 의무면적 적용 조건"
                  value={selectedRuleIndex === null ? 'auto' : String(selectedRuleIndex)}
                  onChange={(v) => setSelectedRuleIndex(v === 'auto' ? null : Number(v))}
                  options={ruleOptions}
                  hint="자동 선택값을 확인하고 필요 시 직접 변경하세요."
                />
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
              <div>
                <dt className="text-xs text-ink-muted">대지면적 (기본정보)</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-ink">
                  {project.siteArea !== null ? `${formatArea(project.siteArea)} ㎡` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-muted">용도지역 (기본정보)</dt>
                <dd className="mt-0.5 font-medium text-ink">{useZoneLabel}</dd>
              </div>
            </dl>
          </Card>

          <Card
            title="수목 정보 입력"
            description="수종·구분·규격·수량·지역특성수 여부를 입력합니다."
            actions={
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addTree}
                  className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                >
                  + 행 추가
                </button>
                <button
                  type="button"
                  onClick={resetTrees}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface-2 hover:text-ink"
                >
                  초기화
                </button>
              </div>
            }
          >
            <TreeInputTable
              trees={trees}
              canRemove={trees.length > 1}
              onUpdate={updateTree}
              onRemove={removeTree}
            />
          </Card>
        </div>

        {/* 우: 기준 요약 + 검토 결과 */}
        <div className="flex flex-col gap-6">
          <PlantingCriteriaSummary criteria={result.criteria} />
          <PlantingResultPanel result={result} />
          <PlantingRulesetInfo ruleset={ruleset} />
        </div>
      </div>

      {/* 하단: 수목 목록표 미리보기 / 엑셀 내보내기 */}
      <Card
        title="수목 목록표"
        description="입력된 수목을 목록표 형식으로 확인하고 엑셀로 내보냅니다."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!canExport || isExporting}
              className="rounded-lg bg-fit px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isExporting ? '내보내는 중…' : '엑셀 내보내기'}
            </button>
          </div>
        }
      >
        {exportError && (
          <p className="mb-3 rounded-lg bg-unfit-soft px-3 py-2 text-xs text-unfit">{exportError}</p>
        )}
        {showPreview ? (
          <PlantingPreviewTable rows={treeListRows} />
        ) : (
          <p className="text-xs text-ink-muted">
            "미리보기 보기"를 누르면 수목 목록표가 표시됩니다.
            {!canExport && ' (수종명·수량을 입력해야 내보낼 수 있습니다.)'}
          </p>
        )}
      </Card>
    </div>
  );
}
