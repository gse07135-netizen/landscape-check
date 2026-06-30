import {
  type TreeRow,
  type TreeCategory,
  type LeafType,
  TREE_CATEGORIES,
  LEAF_TYPES,
} from '@/types/planting';
import { cn } from '@/lib/cn';

interface TreeInputTableProps {
  trees: TreeRow[];
  canRemove: boolean;
  onUpdate: (id: string, patch: Partial<Omit<TreeRow, 'id'>>) => void;
  onRemove: (id: string) => void;
}

const cellInput =
  'h-8 w-full rounded-md border border-border bg-surface px-2 text-sm text-ink ' +
  'outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20';

/** 수목 정보 입력 테이블 (PRD 3.2). */
export function TreeInputTable({ trees, canRemove, onUpdate, onRemove }: TreeInputTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-strong text-left text-xs font-medium text-ink-subtle">
            <th className="py-2.5 pr-2">수종명</th>
            <th className="w-20 py-2.5 pr-2">구분</th>
            <th className="w-20 py-2.5 pr-2">상록/낙엽</th>
            <th className="w-24 py-2.5 pr-2">규격</th>
            <th className="w-20 py-2.5 pr-2 text-right">수량</th>
            <th className="w-16 py-2.5 pr-2 text-center">지역특성수</th>
            <th className="w-8 py-2.5" aria-label="삭제" />
          </tr>
        </thead>
        <tbody>
          {trees.map((t) => (
            <tr key={t.id} className="border-b border-border/60">
              <td className="py-2 pr-2">
                <input
                  type="text"
                  aria-label="수종명"
                  placeholder="예: 느티나무"
                  value={t.speciesName}
                  onChange={(e) => onUpdate(t.id, { speciesName: e.target.value })}
                  className={cellInput}
                />
              </td>
              <td className="py-2 pr-2">
                <select
                  aria-label="구분"
                  value={t.category}
                  onChange={(e) => onUpdate(t.id, { category: e.target.value as TreeCategory })}
                  className={cn(cellInput, 'appearance-none')}
                >
                  {TREE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-2">
                <select
                  aria-label="상록/낙엽"
                  value={t.leafType}
                  onChange={(e) => onUpdate(t.id, { leafType: e.target.value as LeafType })}
                  className={cn(cellInput, 'appearance-none')}
                >
                  {LEAF_TYPES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-2">
                <input
                  type="text"
                  aria-label="규격"
                  placeholder="B5"
                  value={t.spec}
                  onChange={(e) => onUpdate(t.id, { spec: e.target.value })}
                  className={cellInput}
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  type="number"
                  inputMode="numeric"
                  aria-label="수량"
                  min={0}
                  step={1}
                  placeholder="0"
                  value={t.quantity ?? ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    onUpdate(t.id, { quantity: raw === '' ? null : Number(raw) });
                  }}
                  className={cn(cellInput, 'text-right tabular-nums')}
                />
              </td>
              <td className="py-2 pr-2 text-center">
                <input
                  type="checkbox"
                  aria-label="지역특성수 여부"
                  checked={t.isRegional}
                  onChange={(e) => onUpdate(t.id, { isRegional: e.target.checked })}
                  className="h-4 w-4 accent-[var(--color-brand)]"
                />
              </td>
              <td className="py-2 text-center">
                <button
                  type="button"
                  aria-label="행 삭제"
                  disabled={!canRemove}
                  onClick={() => onRemove(t.id)}
                  className="rounded-md px-2 py-1 text-xs text-ink-muted transition hover:bg-unfit-soft hover:text-unfit disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
