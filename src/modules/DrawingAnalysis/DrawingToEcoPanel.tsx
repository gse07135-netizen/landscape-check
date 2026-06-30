import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { formatArea, formatWeight } from '@/lib/format';
import { loadEcoStandard } from '@/lib/ecoStandardLoader';
import { useProject } from '@/state/ProjectContext';
import { useEcoAreaRatio } from '@/state/EcoAreaRatioContext';
import { useDrawingAnalysis } from '@/state/DrawingAnalysisContext';
import { SentBadge } from '@/components/ui/SentBadge';
import type { EcoRow } from '@/types/eco';
import type { DxfExtractResult } from '@/lib/dxfExtract';

const SITE_BOUNDARY_LAYER = '대지경계';
const inputCls =
  'h-8 w-full rounded-lg border border-border bg-surface px-2 text-sm text-ink ' +
  'appearance-none outline-none focus:border-brand focus:ring-2 focus:ring-brand/25';

/**
 * 도면 레이어별 면적을 생태면적률 탭으로 보내는 보조 입력 패널.
 * - 각 레이어를 공간유형에 매핑(미매핑 레이어는 제외)
 * - "대지경계" 등 한 레이어를 기본정보 대지면적으로 설정(선택)
 * - 적용 시 기존 입력을 덮어쓰지 않고 행으로 추가(출처: 도면)
 */
export function DrawingToEcoPanel({ result }: { result: DxfExtractResult }) {
  const { project, updateField } = useProject();
  const { replaceDrawingRows } = useEcoAreaRatio();
  const { ecoMapping, ecoSiteLayer, setEcoMapping, setEcoSiteLayer } = useDrawingAnalysis();
  const standard = useMemo(() => loadEcoStandard(project.standard), [project.standard]);

  const [message, setMessage] = useState<string | null>(null);

  const layers = result.layerAreas;
  const hasBoundary = layers.some((l) => l.layer === SITE_BOUNDARY_LAYER);
  const effectiveSiteLayer = ecoSiteLayer ?? (hasBoundary ? SITE_BOUNDARY_LAYER : '');

  const isSent = (layer: string) => !!ecoMapping[layer] || layer === effectiveSiteLayer;
  const sentCount = layers.filter((l) => isSent(l.layer)).length;
  const canApply = sentCount > 0;

  const handleApply = () => {
    // 도면 행은 "교체" — 기존 도면 행 제거 후 새로 넣어 중복 적용 방지
    const newRows: EcoRow[] = layers
      .filter((l) => ecoMapping[l.layer])
      .map((l) => ({
        id: crypto.randomUUID(),
        code: ecoMapping[l.layer],
        area: l.areaM2,
        source: 'drawing',
      }));

    let siteApplied = false;
    if (effectiveSiteLayer) {
      const la = layers.find((l) => l.layer === effectiveSiteLayer);
      if (la) {
        updateField('siteArea', la.areaM2);
        siteApplied = true;
      }
    }

    replaceDrawingRows(newRows);

    const parts: string[] = [];
    if (newRows.length > 0) parts.push(`생태면적률 탭에 도면 행 ${newRows.length}개 반영`);
    if (siteApplied) parts.push(`대지면적 ${formatArea(layers.find((l) => l.layer === effectiveSiteLayer)!.areaM2)}㎡ 설정`);
    setMessage(parts.length ? `✓ ${parts.join(' · ')} (재적용해도 중복되지 않음 · 수동 입력은 보존)` : null);
  };

  return (
    <Card
      title="생태면적률 탭으로 보내기"
      description="레이어를 공간유형에 매핑하면 생태면적률 입력에 행으로 추가됩니다(선택 사항)."
      actions={
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-muted">
            보낼 항목: <span className="font-semibold text-ink">{sentCount}</span>개
          </span>
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
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
              <th className="py-2.5 pr-3">레이어</th>
              <th className="w-28 py-2.5 pr-3 text-right">면적(㎡)</th>
              <th className="w-56 py-2.5">공간유형 매핑</th>
            </tr>
          </thead>
          <tbody>
            {layers.map((l) => {
              const sent = isSent(l.layer);
              return (
                <tr
                  key={l.layer}
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
                      <span className="text-ink">{l.layer}</span>
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right tabular-nums text-ink">
                    {formatArea(l.areaM2)}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <select
                        aria-label={`${l.layer} 공간유형 매핑`}
                        value={ecoMapping[l.layer] ?? ''}
                        onChange={(e) => setEcoMapping(l.layer, e.target.value)}
                        className={inputCls}
                      >
                        <option value="">(보내지 않음)</option>
                        {standard.spaceTypes.map((st) => (
                          <option key={st.code} value={st.code}>
                            {st.name} ({formatWeight(st.weight)})
                          </option>
                        ))}
                      </select>
                      {sent && <SentBadge className="shrink-0" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 대지면적 설정 */}
      <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4">
        <label htmlFor="ecoSiteLayer" className="text-xs font-medium text-ink">
          대지면적으로 설정할 레이어 <span className="text-ink-subtle">(기본정보에 반영)</span>
        </label>
        <select
          id="ecoSiteLayer"
          value={effectiveSiteLayer}
          onChange={(e) => setEcoSiteLayer(e.target.value)}
          className={cn(inputCls, 'h-9 max-w-xs')}
        >
          <option value="">(설정 안 함)</option>
          {layers.map((l) => (
            <option key={l.layer} value={l.layer}>
              {l.layer} — {formatArea(l.areaM2)}㎡
            </option>
          ))}
        </select>
      </div>

      {message && (
        <p className="mt-3 rounded-lg bg-fit-soft px-3 py-2 text-xs font-medium text-fit-strong">
          {message}
        </p>
      )}
    </Card>
  );
}
