import { useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { SelectField } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatNumber } from '@/components/ui/StatNumber';
import { StatBadge } from '@/components/ui/StatBadge';
import { cn } from '@/lib/cn';
import { formatArea, formatCount } from '@/lib/format';
import {
  parseDxf,
  extractFromDxf,
  UNIT_LABEL,
  TREE_LAYER,
  type DxfUnit,
  type DxfExtractResult,
} from '@/lib/dxfExtract';
import { useDrawingAnalysis } from '@/state/DrawingAnalysisContext';
import { DrawingToEcoPanel } from './DrawingToEcoPanel';
import { DrawingToPlantingPanel } from './DrawingToPlantingPanel';

/**
 * 도면 분석 탭 (Phase 4).
 * .dxf 업로드 → 면적(레이어별)·수목 수량(블록별) 자동 추출 → 표 2개로 표시.
 *
 * 결과(파일명·단위·추출값)는 DrawingAnalysisContext(localStorage)에 저장되어
 * 탭 전환·새로고침에도 유지된다. "적용"은 값을 복사할 뿐 결과를 비우지 않는다.
 * 단위는 mm 가정(화면 명시). 단위 변경은 저장된 결과 면적을 비례 환산한다.
 */
export function DrawingAnalysisTab() {
  const { fileName, unit, result, setAnalysis, setUnit, clear } = useDrawingAnalysis();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.dxf')) {
      setError('DXF(.dxf) 파일만 업로드할 수 있습니다.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const text = await file.text();
      const dxf = await parseDxf(text);
      const extracted = extractFromDxf(dxf, { unit });
      setAnalysis(file.name, extracted);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : '알 수 없는 오류';
      setError(`도면을 분석하지 못했습니다: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 업로드 */}
      <Card
        title="도면 업로드"
        description="CAD 도면(.dxf)을 업로드하면 면적과 수목 수량을 자동 추출합니다."
        actions={
          <div className="w-40">
            <SelectField
              id="dxfUnit"
              label="도면 단위 가정"
              value={unit}
              onChange={(v) => setUnit(v as DxfUnit)}
              options={(Object.keys(UNIT_LABEL) as DxfUnit[]).map((u) => ({
                value: u,
                label: UNIT_LABEL[u],
              }))}
            />
          </div>
        }
      >
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition',
            isDragging ? 'border-brand bg-brand-soft' : 'border-border bg-surface-2',
          )}
        >
          <p className="text-sm font-medium text-ink">
            DXF 파일을 여기로 끌어다 놓거나
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-brand px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
          >
            파일 선택
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".dxf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = ''; // 같은 파일 재선택 허용
            }}
          />
          <p className="text-xs text-ink-subtle">
            좌표 단위는 <span className="font-medium text-ink-muted">{UNIT_LABEL[unit]}</span>로
            가정하여 ㎡로 환산합니다.
          </p>
        </div>

        {fileName && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-ink-muted">
              분석한 파일: <span className="font-medium text-ink">{fileName}</span>
              <span className="ml-2 text-ink-subtle">(탭 전환·새로고침 후에도 유지됩니다)</span>
            </p>
            <button
              type="button"
              onClick={() => {
                clear();
                setError(null);
              }}
              className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:bg-surface-2 hover:text-ink"
            >
              결과 지우기
            </button>
          </div>
        )}
        {isLoading && <p className="mt-3 text-xs text-ink-muted">분석 중…</p>}
        {error && (
          <p className="mt-3 rounded-lg bg-unfit-soft px-3 py-2 text-xs text-unfit-strong">{error}</p>
        )}
      </Card>

      {/* 결과 */}
      {result && result.isEmpty && (
        <Card title="추출 결과">
          <EmptyState
            title="추출할 내용이 없습니다 (빈 도면)"
            description="닫힌 폴리라인(면적)이나 블록 삽입(수목)이 도면에 없습니다. 레이어·객체 구성을 확인하세요."
          />
        </Card>
      )}

      {result && !result.isEmpty && (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AreaTable result={result} />
            <BlockTable result={result} />
          </div>

          {/* 보조 입력 연결 (선택 사항) — 새 파일마다 매핑 초기화를 위해 key 부여 */}
          <DrawingToEcoPanel key={`eco-${fileName}`} result={result} />
          <DrawingToPlantingPanel key={`planting-${fileName}`} result={result} />
        </>
      )}
    </div>
  );
}

/** (1) 레이어별 면적표 */
function AreaTable({ result }: { result: DxfExtractResult }) {
  return (
    <Card title="레이어별 면적" description="닫힌(또는 4점 이상) 폴리라인을 레이어별로 산정">
      {/* 겹침 오해 방지 안내 — 레이어 면적은 합산 대상이 아님 */}
      <p className="mb-4 rounded-lg bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
        각 레이어 면적은 더해지는 값이 아니라 <span className="font-medium text-ink">각자의 역할</span>로
        사용됩니다(예: 대지경계→대지면적, 녹지→공간유형). 레이어가 서로 겹칠 수 있어 합산하지 않습니다.
      </p>

      {result.layerAreas.length === 0 ? (
        <EmptyState title="면적 폴리라인이 없습니다" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-3 text-left text-xs font-medium text-ink-subtle">
                  <th className="px-4 py-3">레이어</th>
                  <th className="px-4 py-3 text-right">폴리라인</th>
                  <th className="px-4 py-3 text-right">면적(㎡)</th>
                </tr>
              </thead>
              <tbody>
                {result.layerAreas.map((r) => (
                  <tr key={r.layer} className="border-b border-border/70">
                    <td className="px-4 py-3 text-ink">{r.layer}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink-muted">
                      {formatCount(r.polylineCount)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-ink">
                      {formatArea(r.areaM2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 단순 합계 — 작게 + 주의 문구 */}
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3 text-xs">
            <span className="text-ink-subtle">단순 합계(참고용)</span>
            <span className="tabular-nums font-medium text-ink-muted">
              {formatArea(result.totalAreaM2)} ㎡
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-ink-subtle">
            단순 합산값입니다. 레이어가 겹칠 경우 실제 면적과 다를 수 있습니다.
          </p>
        </>
      )}
    </Card>
  );
}

/** (2) 블록별 수목 수량표 */
function BlockTable({ result }: { result: DxfExtractResult }) {
  const hasWarning = result.blockCounts.some((r) => r.needsLayerCheck);
  return (
    <Card
      title="블록별 수목 수량"
      description={`INSERT 블록을 레이어·이름으로 집계 (수목 기준 레이어: ${TREE_LAYER})`}
    >
      <div className="mb-4">
        <StatNumber label="총 수량" value={formatCount(result.totalBlockCount)} unit="주" size="lg" />
      </div>
      {result.blockCounts.length === 0 ? (
        <EmptyState title="블록(INSERT)이 없습니다" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-3 text-left text-xs font-medium text-ink-subtle">
                <th className="px-4 py-3">레이어</th>
                <th className="px-4 py-3">블록 이름</th>
                <th className="px-4 py-3 text-right">수량</th>
                <th className="px-4 py-3">비고</th>
              </tr>
            </thead>
            <tbody>
              {result.blockCounts.map((r) => (
                <tr key={`${r.layer} ${r.blockName}`} className="border-b border-border/70">
                  <td className="px-4 py-3 text-ink">{r.layer}</td>
                  <td className="px-4 py-3 text-ink">{r.blockName}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium text-ink">
                    {formatCount(r.count)}
                  </td>
                  <td className="px-4 py-3">
                    {r.needsLayerCheck && (
                      <StatBadge status="pending" label="⚠ 레이어 확인 필요" />
                    )}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-border-strong bg-surface-3 font-semibold">
                <td className="px-4 py-3 text-ink">합계</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right tabular-nums text-ink">
                  {formatCount(result.totalBlockCount)}
                </td>
                <td className="px-4 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {hasWarning && (
        <p className="mt-3 rounded-lg bg-pending-soft px-3 py-2 text-xs leading-relaxed text-pending-strong">
          ⚠ 일부 수목 블록이 「{TREE_LAYER}」 외 레이어에 있습니다. 레이어 분류가 올바른지
          확인하세요.
        </p>
      )}
    </Card>
  );
}
