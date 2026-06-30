import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useProject } from '@/state/ProjectContext';
import { useEcoAreaRatio } from '@/state/EcoAreaRatioContext';
import { usePlanting } from '@/state/PlantingContext';
import { loadEcoStandard } from '@/lib/ecoStandardLoader';
import { calculateEcoAreaRatio } from '@/lib/ecoCalc';
import { buildEcoTableRows, buildEcoTableSummary } from '@/lib/ecoTable';
import { loadPlantingRuleset } from '@/lib/plantingLoader';
import { calculatePlanting } from '@/lib/plantingCalc';
import { buildTreeListRows } from '@/lib/plantingTable';
import { exportCombinedXlsx } from '@/lib/reportExport';
import { STANDARD_OPTIONS } from '@/types/project';
import { PLANTING_MUNICIPALITY_OPTIONS } from '@/types/planting';
import {
  MUNICIPALITY_OPTIONS,
  USE_ZONE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  type Option,
} from '@/lib/projectOptions';
import { formatArea } from '@/lib/format';
import { EcoPreviewTable } from '@/modules/EcoAreaRatio/EcoPreviewTable';
import { PlantingResultPanel } from '@/modules/PlantingCheck/PlantingResultPanel';
import { PlantingPreviewTable } from '@/modules/PlantingCheck/PlantingPreviewTable';
import { ReportSectionMeta } from './ReportSectionMeta';

function labelOf(options: readonly Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—';
}

/**
 * 통합 리포트 탭 (PRD 4장).
 * 프로젝트 개요 → 생태면적률 산정표 → 식재 법규 검토표 → 수목 목록표 순으로 카드 나열.
 * 통합 PDF(인쇄)·통합 엑셀(2시트) 내보내기 제공.
 */
export function ReportTab() {
  const { project } = useProject();
  const { rows: ecoRows, targetPercent } = useEcoAreaRatio();
  const { municipality, grossFloorArea, selectedRuleIndex, trees } = usePlanting();

  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 생태면적률
  const ecoStandard = useMemo(() => loadEcoStandard(project.standard), [project.standard]);
  const ecoResult = useMemo(
    () => calculateEcoAreaRatio(ecoStandard, ecoRows, project.siteArea, targetPercent),
    [ecoStandard, ecoRows, project.siteArea, targetPercent],
  );
  const ecoTableRows = useMemo(() => buildEcoTableRows(ecoResult), [ecoResult]);
  const ecoSummary = useMemo(
    () => buildEcoTableSummary(ecoResult, project.siteArea, ecoTableRows),
    [ecoResult, project.siteArea, ecoTableRows],
  );

  // 식재 법규
  const ruleset = useMemo(() => loadPlantingRuleset(municipality), [municipality]);
  const plantingResult = useMemo(
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

  // 미검증 항목 포함 여부 (생태면적률 미확정 가중치 사용 / 식재 미검증 기준)
  const hasUnverified = ecoResult.hasUnconfirmedRows || plantingResult.hasUnverified;

  const ecoExportParams = {
    projectName: project.projectName,
    siteArea: project.siteArea,
    standardName: ecoStandard.standardName,
    source: ecoStandard.meta.source,
    effectiveDate: ecoStandard.meta.effectiveDate,
    rows: ecoTableRows,
    summary: ecoSummary,
  };

  const plantingExportParams = {
    projectName: project.projectName,
    landSize: project.siteArea,
    grossFloorArea,
    municipalityName: ruleset.municipality.rulesetName,
    source: ruleset.municipality.meta.source,
    effectiveBasis: ruleset.municipality.meta.effectiveBasis,
    valuesVerified: ruleset.municipality.meta.valuesVerified,
    rows: treeListRows,
    result: plantingResult,
  };

  const handleExportPdf = () => {
    window.print();
  };

  const handleExportXlsx = async () => {
    setExportError(null);
    setIsExporting(true);
    try {
      await exportCombinedXlsx({
        projectName: project.projectName,
        eco: ecoExportParams,
        planting: plantingExportParams,
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
      {/* 액션 바 (인쇄 시 숨김) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">통합 리포트</h2>
          <p className="text-xs text-ink-muted">
            프로젝트 개요 · 생태면적률 · 식재 법규 검토 결과를 한 번에 확인하고 내보냅니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface-2 hover:text-ink"
          >
            PDF 내보내기 (인쇄)
          </button>
          <button
            type="button"
            onClick={handleExportXlsx}
            disabled={isExporting}
            className="rounded-lg bg-fit px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isExporting ? '내보내는 중…' : '엑셀 내보내기 (통합)'}
          </button>
        </div>
      </div>

      {exportError && (
        <p className="no-print rounded-lg bg-unfit-soft px-3 py-2 text-xs text-unfit">{exportError}</p>
      )}

      {/* 인쇄 영역 */}
      <div className="report-print-area flex flex-col gap-6">
        {/* 상단 검증 경고 */}
        {hasUnverified && (
          <div className="report-section rounded-lg border border-pending/40 bg-pending-soft px-4 py-3">
            <p className="text-sm font-semibold text-pending-strong">⚠ 검증 필요 항목 포함</p>
            <p className="mt-1 text-xs leading-relaxed text-pending-strong">
              이 리포트에는 아직 검증되지 않은 규제 기준(미확정 가중치·미검증 지자체 기준 등)이
              포함되어 있습니다. 인허가 제출 전 해당 기준 원문에서 값을 반드시 확인하세요.
            </p>
          </div>
        )}

        {/* 1. 프로젝트 개요 */}
        <Card title="1. 프로젝트 개요" className="report-section">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <OverviewItem label="프로젝트명" value={project.projectName || '—'} />
            <OverviewItem
              label="대지면적"
              value={project.siteArea !== null ? `${formatArea(project.siteArea)} ㎡` : '—'}
            />
            <OverviewItem
              label="연면적"
              value={grossFloorArea !== null ? `${formatArea(grossFloorArea)} ㎡` : '—'}
            />
            <OverviewItem label="지자체" value={labelOf(MUNICIPALITY_OPTIONS, project.municipality)} />
            <OverviewItem label="용도지역" value={labelOf(USE_ZONE_OPTIONS, project.useZone)} />
            <OverviewItem label="사업유형" value={labelOf(PROJECT_TYPE_OPTIONS, project.projectType)} />
            <OverviewItem
              label="적용 기준(생태면적률)"
              value={STANDARD_OPTIONS.find((o) => o.id === project.standard)?.label ?? '—'}
            />
            <OverviewItem
              label="적용 기준(식재)"
              value={
                PLANTING_MUNICIPALITY_OPTIONS.find((o) => o.id === municipality)?.label ?? '—'
              }
            />
          </dl>
        </Card>

        {/* 2. 생태면적률 산정표 */}
        <Card title="2. 생태면적률 산정표" className="report-section">
          <ReportSectionMeta
            name={ecoStandard.standardName}
            source={ecoStandard.meta.source}
            verified={ecoStandard.meta.valuesVerified}
          />
          <EcoPreviewTable rows={ecoTableRows} summary={ecoSummary} />
        </Card>

        {/* 3. 식재 법규 검토표 */}
        <div className="report-section">
          <ReportSectionMeta
            name={ruleset.municipality.rulesetName}
            source={ruleset.municipality.meta.source}
            verified={ruleset.municipality.meta.valuesVerified}
          />
          <PlantingResultPanel result={plantingResult} />
        </div>

        {/* 4. 수목 목록표 */}
        <Card title="4. 수목 목록표" className="report-section">
          <PlantingPreviewTable rows={treeListRows} />
        </Card>
      </div>
    </div>
  );
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
