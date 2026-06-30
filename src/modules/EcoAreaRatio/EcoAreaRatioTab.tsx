import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StandardInfoBox } from '@/components/StandardInfoBox';
import { useProject } from '@/state/ProjectContext';
import { useEcoAreaRatio } from '@/state/EcoAreaRatioContext';
import { loadEcoStandard } from '@/lib/ecoStandardLoader';
import { calculateEcoAreaRatio } from '@/lib/ecoCalc';
import { buildEcoTableRows, buildEcoTableSummary } from '@/lib/ecoTable';
import { exportEcoAreaRatioXlsx } from '@/lib/ecoExport';
import { EcoInputTable } from './EcoInputTable';
import { EcoResultPanel } from './EcoResultPanel';
import { EcoPreviewTable } from './EcoPreviewTable';

/**
 * 생태면적률 탭 (Phase 1 + 산정표 미리보기/엑셀 내보내기).
 * 좌(공간유형 면적 입력) / 우(검토 결과) 2분할 + 하단 전체폭 산정표 미리보기.
 *
 * 실시간 재계산: rows/대지면적/목표치 변경 시 useMemo 로 렌더 중 즉시 재계산.
 */
export function EcoAreaRatioTab() {
  const { project } = useProject();
  const { rows, targetPercent, addRow, removeRow, updateRow, setTargetPercent, resetRows } =
    useEcoAreaRatio();

  const [showPreview, setShowPreview] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const standard = useMemo(() => loadEcoStandard(project.standard), [project.standard]);

  const result = useMemo(
    () => calculateEcoAreaRatio(standard, rows, project.siteArea, targetPercent),
    [standard, rows, project.siteArea, targetPercent],
  );

  const tableRows = useMemo(() => buildEcoTableRows(result), [result]);
  const summary = useMemo(
    () => buildEcoTableSummary(result, project.siteArea, tableRows),
    [result, project.siteArea, tableRows],
  );

  const hasSiteArea = project.siteArea !== null && project.siteArea > 0;
  const canExport = tableRows.length > 0;

  const handleExport = async () => {
    setExportError(null);
    setIsExporting(true);
    try {
      await exportEcoAreaRatioXlsx({
        projectName: project.projectName,
        siteArea: project.siteArea,
        standardName: standard.standardName,
        source: standard.meta.source,
        effectiveDate: standard.meta.effectiveDate,
        rows: tableRows,
        summary,
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
        {/* 좌: 입력 */}
        <div className="flex flex-col gap-6">
          <Card
            title="공간 유형별 면적 입력"
            description={`${standard.standardName} · 공간유형 ${standard.spaceTypes.length}종`}
            actions={
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addRow}
                  className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                >
                  + 행 추가
                </button>
                <button
                  type="button"
                  onClick={resetRows}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface-2 hover:text-ink"
                >
                  초기화
                </button>
              </div>
            }
          >
            <EcoInputTable
              rowResults={result.rows}
              spaceTypes={standard.spaceTypes}
              canRemove={rows.length > 1}
              onUpdateRow={updateRow}
              onRemoveRow={removeRow}
            />
            {!hasSiteArea && (
              <p className="mt-3 rounded-lg bg-pending-soft px-3 py-2 text-xs text-pending">
                대지면적이 입력되지 않았습니다. 기본정보 탭에서 대지면적을 입력해야 생태면적률이
                계산됩니다.
              </p>
            )}
          </Card>
        </div>

        {/* 우: 결과 */}
        <div className="flex flex-col gap-6">
          <EcoResultPanel
            result={result}
            hasSiteArea={hasSiteArea}
            targetPercent={targetPercent}
            onChangeTarget={setTargetPercent}
          />
          <StandardInfoBox standardName={standard.standardName} meta={standard.meta} />
        </div>
      </div>

      {/* 하단: 산정표 미리보기 / 엑셀 내보내기 */}
      <Card
        title="산정표 미리보기"
        description="공간유형 · 면적 · 가중치 · 환산면적과 검토 요약을 산정표 형식으로 확인합니다."
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
          <EcoPreviewTable rows={tableRows} summary={summary} />
        ) : (
          <p className="text-xs text-ink-muted">
            "미리보기 보기"를 누르면 산정표가 표시됩니다. "엑셀 내보내기"로 xlsx 파일을 저장할 수
            있습니다.
            {!canExport && ' (공간유형을 선택하고 면적을 입력해야 내보낼 수 있습니다.)'}
          </p>
        )}
      </Card>
    </div>
  );
}
