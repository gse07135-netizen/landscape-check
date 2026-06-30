import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { formatCount } from '@/lib/format';
import { usePlanting } from '@/state/PlantingContext';
import { useDrawingAnalysis, type BlockMapping } from '@/state/DrawingAnalysisContext';
import { SentBadge } from '@/components/ui/SentBadge';
import { TREE_CATEGORIES, type TreeCategory, type TreeRow } from '@/types/planting';
import type { DxfExtractResult } from '@/lib/dxfExtract';

const inputCls =
  'h-8 w-full rounded-lg border border-border bg-surface px-2 text-sm text-ink ' +
  'outline-none focus:border-brand focus:ring-2 focus:ring-brand/25';

/**
 * 도면 블록별 수목 수량을 식재 법규 탭으로 보내는 보조 입력 패널.
 * - 블록마다 구분(교목/관목/지피)과 수종명을 지정(미지정 블록은 제외)
 * - 적용 시 도면에서 온 행만 교체(중복 방지) — 수동 입력 행은 보존
 */
export function DrawingToPlantingPanel({ result }: { result: DxfExtractResult }) {
  const { replaceDrawingTrees } = usePlanting();
  const { treeMapping, setTreeMapping } = useDrawingAnalysis();
  const [message, setMessage] = useState<string | null>(null);

  const keyOf = (layer: string, name: string) => `${layer} ${name}`;
  // 미초기화 블록은 기본값(구분 미지정, 수종명=블록이름)
  const getMapping = (layer: string, name: string): BlockMapping =>
    treeMapping[keyOf(layer, name)] ?? { category: '', speciesName: name };

  const update = (layer: string, name: string, patch: Partial<BlockMapping>) =>
    setTreeMapping(keyOf(layer, name), { ...getMapping(layer, name), ...patch });

  const selectedCount = result.blockCounts.filter(
    (b) => getMapping(b.layer, b.blockName).category !== '',
  ).length;

  const handleApply = () => {
    // 도면 행은 "교체" — 기존 도면 행 제거 후 새로 넣어 중복 적용 방지
    const newTrees: TreeRow[] = result.blockCounts
      .map((b) => ({ b, m: getMapping(b.layer, b.blockName) }))
      .filter(({ m }) => m.category !== '')
      .map(({ b, m }) => ({
        id: crypto.randomUUID(),
        speciesName: m.speciesName.trim() || b.blockName,
        category: m.category as TreeCategory,
        leafType: '낙엽' as const,
        spec: '',
        quantity: b.count,
        isRegional: false,
        source: 'drawing' as const,
      }));

    if (newTrees.length === 0) return;
    replaceDrawingTrees(newTrees);
    const total = newTrees.reduce((s, t) => s + (t.quantity ?? 0), 0);
    setMessage(
      `✓ 식재 법규 탭에 도면 ${newTrees.length}종(${formatCount(total)}주) 반영 (재적용해도 중복되지 않음 · 수동 입력은 보존)`,
    );
  };

  return (
    <Card
      title="식재 법규 탭으로 보내기"
      description="블록의 구분·수종명을 지정하면 수목 입력에 행으로 추가됩니다(선택 사항)."
      actions={
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-muted">
            보낼 항목: <span className="font-semibold text-ink">{selectedCount}</span>개
          </span>
          <button
            type="button"
            onClick={handleApply}
            disabled={selectedCount === 0}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            적용
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-ink-subtle">
              <th className="py-2.5 pr-3">블록(레이어)</th>
              <th className="w-16 py-2.5 pr-3 text-right">수량</th>
              <th className="w-24 py-2.5 pr-3">구분</th>
              <th className="w-40 py-2.5">수종명</th>
            </tr>
          </thead>
          <tbody>
            {result.blockCounts.map((b) => {
              const m = getMapping(b.layer, b.blockName);
              const sent = m.category !== '';
              return (
                <tr
                  key={keyOf(b.layer, b.blockName)}
                  className={cn(
                    'border-b border-border/70 transition-colors',
                    sent ? 'bg-brand-soft/60' : 'opacity-55',
                  )}
                >
                  <td
                    className={cn(
                      'border-l-2 py-2.5 pl-3 pr-3',
                      sent ? 'border-brand' : 'border-transparent',
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      {sent && <span className="text-brand-strong">✓</span>}
                      <span className="text-ink">{b.blockName}</span>
                      <span className="text-xs text-ink-subtle">({b.layer})</span>
                      {sent && <SentBadge className="ml-0.5 shrink-0" />}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-ink">
                    {formatCount(b.count)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <select
                      aria-label={`${b.blockName} 구분`}
                      value={m.category}
                      onChange={(e) =>
                        update(b.layer, b.blockName, {
                          category: e.target.value as TreeCategory | '',
                        })
                      }
                      className={`${inputCls} appearance-none`}
                    >
                      <option value="">(보내지 않음)</option>
                      {TREE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5">
                    <input
                      type="text"
                      aria-label={`${b.blockName} 수종명`}
                      value={m.speciesName}
                      onChange={(e) =>
                        update(b.layer, b.blockName, { speciesName: e.target.value })
                      }
                      className={inputCls}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {message && (
        <p className="mt-3 rounded-lg bg-fit-soft px-3 py-2 text-xs font-medium text-fit-strong">
          {message}
        </p>
      )}
    </Card>
  );
}
