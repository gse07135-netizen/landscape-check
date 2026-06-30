import type { SpaceType } from '@/schemas/ecoAreaRatio.schema';
import type { EcoRowResult } from '@/lib/ecoCalc';
import type { EcoRow } from '@/types/eco';
import { formatArea, formatWeight } from '@/lib/format';
import { cn } from '@/lib/cn';
import { SourceTag } from '@/components/ui/SourceTag';

interface EcoInputTableProps {
  /** 계산된 행 결과(입력값 + 가중치/환산면적 포함) */
  rowResults: EcoRowResult[];
  /** 공간유형 드롭다운 옵션(선택된 기준 JSON의 spaceTypes) */
  spaceTypes: SpaceType[];
  canRemove: boolean;
  onUpdateRow: (id: string, patch: Partial<Omit<EcoRow, 'id'>>) => void;
  onRemoveRow: (id: string) => void;
}

const cellInput =
  'h-8 w-full rounded-md border border-border bg-surface px-2 text-sm text-ink ' +
  'outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';

/** 공간유형별 면적 입력 테이블. 가중치·환산면적은 자동 표시(읽기 전용). */
export function EcoInputTable({
  rowResults,
  spaceTypes,
  canRemove,
  onUpdateRow,
  onRemoveRow,
}: EcoInputTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-medium text-ink-subtle">
            <th className="py-2.5 pr-3">공간 유형</th>
            <th className="w-28 py-2.5 pr-3 text-right">면적(㎡)</th>
            <th className="w-20 py-2.5 pr-3 text-right">가중치</th>
            <th className="w-28 py-2.5 pr-3 text-right">환산면적</th>
            <th className="w-10 py-2.5" aria-label="삭제" />
          </tr>
        </thead>
        <tbody>
          {rowResults.map((r) => {
            const code = r.spaceType?.code ?? '';
            return (
              <tr key={r.id} className="border-b border-border/60 align-top">
                <td className="py-2 pr-3">
                  <select
                    aria-label="공간 유형 선택"
                    value={code}
                    onChange={(e) => onUpdateRow(r.id, { code: e.target.value })}
                    className={cn(cellInput, 'appearance-none')}
                  >
                    <option value="" disabled>
                      선택하세요
                    </option>
                    {spaceTypes.map((st) => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({formatWeight(st.weight)})
                      </option>
                    ))}
                  </select>
                  {(r.source === 'drawing' || r.unverified) && (
                    <div className="mt-1 flex items-center gap-1.5">
                      {r.source === 'drawing' && <SourceTag />}
                      {r.unverified && (
                        <span className="text-xs font-medium text-pending-strong">⚠ 검증 필요</span>
                      )}
                    </div>
                  )}
                </td>

                <td className="py-2 pr-3">
                  <input
                    type="number"
                    inputMode="decimal"
                    aria-label="면적"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={r.area ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value;
                      onUpdateRow(r.id, { area: raw === '' ? null : Number(raw) });
                    }}
                    className={cn(cellInput, 'text-right tabular-nums')}
                  />
                </td>

                <td className="py-2 pr-3 text-right tabular-nums text-ink-muted">
                  {formatWeight(r.weight)}
                </td>

                <td className="py-2 pr-3 text-right tabular-nums font-medium text-ink">
                  {r.weightUnconfirmed ? (
                    <span className="text-pending-strong">미확정</span>
                  ) : (
                    formatArea(r.convertedArea)
                  )}
                </td>

                <td className="py-2 text-center">
                  <button
                    type="button"
                    aria-label="행 삭제"
                    disabled={!canRemove}
                    onClick={() => onRemoveRow(r.id)}
                    className="rounded-md px-2 py-1 text-xs text-ink-muted transition hover:bg-unfit-soft hover:text-unfit disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
