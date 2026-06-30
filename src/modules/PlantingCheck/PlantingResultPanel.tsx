import type { PlantingResult } from '@/lib/plantingCalc';
import { Card } from '@/components/ui/Card';
import { StatBadge } from '@/components/ui/StatBadge';
import { formatCount } from '@/lib/format';

/**
 * 식재 법규 검토 결과 (PRD 3.4).
 * 항목별 기준값/현황값/부족분/적합·부적합을 표시한다.
 */
interface PlantingResultPanelProps {
  result: PlantingResult;
}

export function PlantingResultPanel({ result }: PlantingResultPanelProps) {
  return (
    <Card
      title="식재 법규 검토 결과"
      actions={<StatBadge status={result.overallStatus} />}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border-strong text-left text-xs font-medium text-ink-subtle">
              <th className="py-2.5 pr-3">항목</th>
              <th className="py-2.5 pr-3 text-right">기준</th>
              <th className="py-2.5 pr-3 text-right">현황</th>
              <th className="py-2.5 pr-3 text-right">부족분</th>
              <th className="w-20 py-2.5">판정</th>
            </tr>
          </thead>
          <tbody>
            {result.checks.map((c) => (
              <tr key={c.key} className="border-b border-border/60">
                <td className="py-2.5 pr-3 text-ink">{c.label}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums text-ink-muted">
                  {formatCount(c.required)}
                </td>
                <td className="py-2.5 pr-3 text-right tabular-nums font-medium text-ink">
                  {formatCount(c.current)}
                </td>
                <td className="py-2.5 pr-3 text-right tabular-nums">
                  {c.status === 'unfit' && c.deficit ? (
                    <span className="font-semibold text-unfit">{formatCount(c.deficit)}</span>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="py-2.5">
                  <StatBadge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result.overallStatus === 'pending' && (
        <p className="mt-3 rounded-md bg-pending-soft px-3 py-2 text-xs leading-relaxed text-pending-strong">
          기준 산출에 필요한 정보(대지면적·용도지역·연면적·적용 조건)가 부족하여 일부 항목의 판정이
          보류됩니다.
        </p>
      )}

      {result.hasUnverified && (
        <p className="mt-3 rounded-md bg-pending-soft px-3 py-2 text-xs leading-relaxed text-pending-strong">
          ⚠ 검증되지 않은 기준(미확정 비율·시목 등)이 포함되어 있습니다. 결과는 참고용이며, 해당
          지자체 조례 원문에서 값을 확인하세요.
        </p>
      )}
    </Card>
  );
}
