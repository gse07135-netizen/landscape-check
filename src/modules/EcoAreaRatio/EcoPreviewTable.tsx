import type { EcoTableRow, EcoTableSummary } from '@/lib/ecoTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatBadge } from '@/components/ui/StatBadge';
import { formatArea, formatPercent, formatWeight } from '@/lib/format';

interface EcoPreviewTableProps {
  rows: EcoTableRow[];
  summary: EcoTableSummary;
}

/** 생태면적률 산정표 미리보기 (PRD 2.4). 엑셀 내보내기와 동일한 데이터. */
export function EcoPreviewTable({ rows, summary }: EcoPreviewTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="산정표에 표시할 입력이 없습니다"
        description="공간 유형을 선택하고 면적을 입력하면 산정표가 생성됩니다."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 산정표 본문 */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-border-strong bg-surface-3 text-left text-xs font-medium text-ink-subtle">
              <th className="w-12 px-3 py-2.5">No</th>
              <th className="px-3 py-2.5">공간유형</th>
              <th className="px-3 py-2.5 text-right">면적(㎡)</th>
              <th className="px-3 py-2.5 text-right">가중치</th>
              <th className="px-3 py-2.5 text-right">환산면적(㎡)</th>
              <th className="px-3 py-2.5">비고</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.no} className="border-b border-border/60">
                <td className="px-3 py-2 tabular-nums text-ink-muted">{r.no}</td>
                <td className="px-3 py-2 text-ink">{r.name}</td>
                <td className="px-3 py-2 text-right tabular-nums text-ink">{formatArea(r.area)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-ink-muted">
                  {formatWeight(r.weight)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-medium text-ink">
                  {r.remark ? '—' : formatArea(r.convertedArea)}
                </td>
                <td className="px-3 py-2">
                  {r.remark && (
                    <span className="text-xs font-medium text-pending-strong">{r.remark}</span>
                  )}
                </td>
              </tr>
            ))}
            {/* 합계 */}
            <tr className="border-y-2 border-border-strong bg-surface-3 font-semibold">
              <td className="px-3 py-2" />
              <td className="px-3 py-2 text-ink">합계</td>
              <td className="px-3 py-2 text-right tabular-nums text-ink">
                {formatArea(summary.totalInputArea)}
              </td>
              <td className="px-3 py-2" />
              <td className="px-3 py-2 text-right tabular-nums text-ink">
                {formatArea(summary.totalConvertedArea)}
              </td>
              <td className="px-3 py-2" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* 요약 */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-surface-2 p-4 text-sm sm:grid-cols-3">
        <SummaryItem label="총 환산면적" value={`${formatArea(summary.totalConvertedArea)} ㎡`} />
        <SummaryItem label="대지면적" value={`${formatArea(summary.siteArea)} ㎡`} />
        <SummaryItem label="생태면적률" value={formatPercent(summary.ecoRatioPercent)} />
        <SummaryItem
          label="목표 생태면적률"
          value={summary.targetPercent !== null ? formatPercent(summary.targetPercent) : '미입력'}
        />
        {summary.status === 'unfit' && (
          <SummaryItem label="부족분" value={`${formatPercent(summary.deficitPercent)}p`} />
        )}
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-ink-subtle">판정</dt>
          <dd>
            <StatBadge status={summary.status} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}
