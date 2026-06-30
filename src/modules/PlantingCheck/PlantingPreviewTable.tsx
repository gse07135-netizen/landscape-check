import type { TreeListRow } from '@/lib/plantingTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCount } from '@/lib/format';

/** 수목 목록표 미리보기 (PRD 3.5). 엑셀 내보내기와 동일한 데이터. */
interface PlantingPreviewTableProps {
  rows: TreeListRow[];
}

export function PlantingPreviewTable({ rows }: PlantingPreviewTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="목록표에 표시할 수목이 없습니다"
        description="수종명과 수량을 입력하면 수목 목록표가 생성됩니다."
      />
    );
  }

  const totalQuantity = rows.reduce((sum, r) => sum + (r.quantity ?? 0), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y border-border-strong bg-surface-3 text-left text-xs font-medium text-ink-subtle">
            <th className="w-12 px-3 py-2.5">No</th>
            <th className="px-3 py-2.5">수종명</th>
            <th className="px-3 py-2.5">구분</th>
            <th className="px-3 py-2.5">상록/낙엽</th>
            <th className="px-3 py-2.5">규격</th>
            <th className="px-3 py-2.5 text-right">수량</th>
            <th className="px-3 py-2.5 text-center">지역특성수</th>
            <th className="px-3 py-2.5">비고</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.no} className="border-b border-border/60">
              <td className="px-3 py-2 tabular-nums text-ink-muted">{r.no}</td>
              <td className="px-3 py-2 text-ink">{r.speciesName}</td>
              <td className="px-3 py-2 text-ink">{r.category}</td>
              <td className="px-3 py-2 text-ink">{r.leafType}</td>
              <td className="px-3 py-2 text-ink-muted">{r.spec || '—'}</td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-ink">
                {formatCount(r.quantity)}
              </td>
              <td className="px-3 py-2 text-center">{r.isRegional ? 'O' : ''}</td>
              <td className="px-3 py-2 text-xs text-ink-muted">{r.remark}</td>
            </tr>
          ))}
          <tr className="border-y-2 border-border-strong bg-surface-3 font-semibold">
            <td className="px-3 py-2" />
            <td className="px-3 py-2 text-ink">합계</td>
            <td className="px-3 py-2" colSpan={3} />
            <td className="px-3 py-2 text-right tabular-nums text-ink">
              {formatCount(totalQuantity)}
            </td>
            <td className="px-3 py-2" colSpan={2} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
