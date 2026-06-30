import type { PlantingCriteria } from '@/lib/plantingCalc';
import { Card } from '@/components/ui/Card';
import { formatArea, formatCount } from '@/lib/format';

/**
 * 식재 법규 기준 요약 (PRD 3.1).
 * 선택된 지자체+용도+연면적으로 산출된 조경/식재 의무면적과 최소 수량·비율 기준을 표시.
 */
interface PlantingCriteriaSummaryProps {
  criteria: PlantingCriteria;
}

export function PlantingCriteriaSummary({ criteria }: PlantingCriteriaSummaryProps) {
  const pct = (v: number) => `${(v * 100).toFixed(0)}%`;

  return (
    <Card title="식재 법규 기준 요약" description="선택된 지자체·용도지역·연면적 기준 자동 산출">
      {!criteria.applies && (
        <p className="mb-3 rounded-lg bg-pending-soft px-3 py-2 text-xs text-pending-strong">
          {criteria.landSize === null
            ? '대지면적을 기본정보 탭에서 입력하세요.'
            : `대지면적이 조경 의무 적용 하한(${formatArea(criteria.appliesFromLandSizeM2, 0)}㎡) 미만이라 조경 의무가 없습니다.`}
        </p>
      )}

      {criteria.applies && !criteria.density && (
        <p className="mb-3 rounded-lg bg-pending-soft px-3 py-2 text-xs text-pending-strong">
          기본정보 탭에서 용도지역을 선택하면 식재밀도 기준이 적용됩니다.
        </p>
      )}

      {criteria.applies && !criteria.rule && (
        <p className="mb-3 rounded-lg bg-pending-soft px-3 py-2 text-xs text-pending-strong">
          적용할 조경 의무면적 비율 조건을 선택하세요.
        </p>
      )}

      <dl className="flex flex-col divide-y divide-border text-sm">
        <Row
          label="조경 의무면적"
          value={`${formatArea(criteria.landscapeMandatoryArea)} ㎡`}
          note={criteria.rule ? `대지면적 × ${pct(criteria.rule.ratioOfLandArea)} · ${criteria.rule.condition}` : undefined}
          warn={criteria.ruleUnverified}
        />
        <Row
          label="식재의무면적"
          value={`${formatArea(criteria.plantingMandatoryArea)} ㎡`}
          note={`조경 의무면적 × ${pct(criteria.plantingMandatoryRatio)}`}
        />
        <Row
          label="식재밀도"
          value={
            criteria.density
              ? `교목 ${criteria.density.minTreePerM2}/㎡ · 관목 ${criteria.density.minShrubPerM2}/㎡`
              : '—'
          }
          note={criteria.densityCategory ? `용도: ${criteria.densityCategory}` : undefined}
        />
        <Row label="최소 교목 수" value={`${formatCount(criteria.minTrees)} 주`} />
        <Row label="최소 관목 수" value={`${formatCount(criteria.minShrubs)} 주`} />
        <Row
          label="상록 규정 수량"
          value={`${formatCount(criteria.evergreenRequired)} 주`}
          note={`${pct(criteria.evergreenMinRatio)} (${criteria.evergreenMinRatioBasis})`}
        />
        <Row
          label="지역특성수 규정 수량"
          value={`${formatCount(criteria.regionalRequired)} 주`}
          note={`${pct(criteria.regionalMinRatio)} (${criteria.regionalMinRatioBasis})`}
        />
      </dl>
    </Card>
  );
}

function Row({
  label,
  value,
  note,
  warn,
}: {
  label: string;
  value: string;
  note?: string;
  warn?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <div>
        <dt className="text-ink">{label}</dt>
        {note && <p className="mt-0.5 text-xs leading-relaxed text-ink-subtle">{note}</p>}
        {warn && <p className="mt-1 text-xs font-medium text-pending-strong">⚠ 검증 필요</p>}
      </div>
      <dd className="shrink-0 text-right font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}
