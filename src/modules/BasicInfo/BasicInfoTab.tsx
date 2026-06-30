import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { TextField, NumberField, SelectField } from '@/components/ui/Field';
import { StandardInfoBox } from '@/components/StandardInfoBox';
import { useProject } from '@/state/ProjectContext';
import { loadEcoStandard } from '@/lib/ecoStandardLoader';
import { STANDARD_OPTIONS, type StandardId } from '@/types/project';
import {
  MUNICIPALITY_OPTIONS,
  USE_ZONE_OPTIONS,
  PROJECT_TYPE_OPTIONS,
} from '@/lib/projectOptions';

/**
 * 기본정보 탭 — 좌(입력 폼) / 우(요약·기준정보) 2분할.
 * Phase 0: 계산 로직 없이 입력 UI와 상위 상태 연동, 선택 기준 메타 표시까지.
 */
export function BasicInfoTab() {
  const { project, updateField, reset } = useProject();

  // 선택된 기준의 검증된 규제 데이터(메타 표시에 사용)
  const standard = useMemo(() => loadEcoStandard(project.standard), [project.standard]);

  const siteAreaError =
    project.siteArea !== null && project.siteArea <= 0
      ? '대지면적은 0보다 큰 값이어야 합니다.'
      : undefined;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* 좌: 입력 영역 */}
      <div className="flex flex-col gap-6">
        <Card
          title="프로젝트 기본정보"
          description="검토에 사용할 프로젝트 정보를 입력하세요."
          actions={
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface-2 hover:text-ink"
            >
              초기화
            </button>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                id="projectName"
                label="프로젝트명"
                required
                maxLength={100}
                placeholder="예: ○○ 아파트 조경 설계"
                value={project.projectName}
                onChange={(v) => updateField('projectName', v)}
                hint="최대 100자"
              />
            </div>

            <NumberField
              id="siteArea"
              label="대지면적"
              required
              unit="㎡"
              min={0}
              step={0.01}
              placeholder="0.00"
              value={project.siteArea}
              onChange={(v) => updateField('siteArea', v)}
              error={siteAreaError}
              hint="소수점 2자리까지"
            />

            <SelectField
              id="standard"
              label="적용 기준"
              required
              value={project.standard}
              onChange={(v) => updateField('standard', v as StandardId)}
              options={STANDARD_OPTIONS.map((o) => ({ value: o.id, label: o.label }))}
              hint="생태면적률·식재 법규 계산에 적용"
            />

            <SelectField
              id="municipality"
              label="지자체"
              required
              placeholder="선택하세요"
              value={project.municipality}
              onChange={(v) => updateField('municipality', v)}
              options={MUNICIPALITY_OPTIONS}
            />

            <SelectField
              id="useZone"
              label="용도지역"
              required
              placeholder="선택하세요"
              value={project.useZone}
              onChange={(v) => updateField('useZone', v)}
              options={USE_ZONE_OPTIONS}
            />

            <SelectField
              id="projectType"
              label="사업유형"
              required
              placeholder="선택하세요"
              value={project.projectType}
              onChange={(v) => updateField('projectType', v)}
              options={PROJECT_TYPE_OPTIONS}
            />
          </div>
        </Card>
      </div>

      {/* 우: 요약 / 기준정보 영역 */}
      <div className="flex flex-col gap-6">
        <Card title="입력 요약">
          <dl className="flex flex-col divide-y divide-border text-sm">
            <SummaryRow label="프로젝트명" value={project.projectName || '—'} />
            <SummaryRow
              label="대지면적"
              value={project.siteArea !== null ? `${project.siteArea.toLocaleString('ko-KR')} ㎡` : '—'}
            />
            <SummaryRow label="지자체" value={labelOf(MUNICIPALITY_OPTIONS, project.municipality)} />
            <SummaryRow label="용도지역" value={labelOf(USE_ZONE_OPTIONS, project.useZone)} />
            <SummaryRow label="사업유형" value={labelOf(PROJECT_TYPE_OPTIONS, project.projectType)} />
            <SummaryRow
              label="적용 기준"
              value={STANDARD_OPTIONS.find((o) => o.id === project.standard)?.label ?? '—'}
            />
          </dl>
        </Card>

        <StandardInfoBox standardName={standard.standardName} meta={standard.meta} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function labelOf(options: readonly { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? '—';
}
