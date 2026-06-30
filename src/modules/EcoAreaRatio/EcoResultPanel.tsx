import type { EcoResult } from '@/lib/ecoCalc';
import { Card } from '@/components/ui/Card';
import { StatNumber } from '@/components/ui/StatNumber';
import { StatBadge } from '@/components/ui/StatBadge';
import { NumberField } from '@/components/ui/Field';
import { formatArea, formatPercent } from '@/lib/format';

interface EcoResultPanelProps {
  result: EcoResult;
  /** 대지면적 미입력 여부(안내 문구용) */
  hasSiteArea: boolean;
  targetPercent: number | null;
  onChangeTarget: (value: number | null) => void;
}

/** 생태면적률 검토 결과 대시보드. 목표치 입력 + 적합/부적합 + 부족분. */
export function EcoResultPanel({
  result,
  hasSiteArea,
  targetPercent,
  onChangeTarget,
}: EcoResultPanelProps) {
  const ratioTone =
    result.status === 'fit' ? 'fit' : result.status === 'unfit' ? 'unfit' : 'default';

  return (
    <Card title="검토 결과">
      <div className="flex flex-col gap-5">
        {/* 핵심 지표 */}
        <div className="flex items-center justify-between">
          <StatNumber
            label="생태면적률"
            value={formatPercent(result.ecoRatioPercent).replace('%', '')}
            unit="%"
            tone={ratioTone}
            size="lg"
          />
          <StatBadge status={result.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <StatNumber label="총 환산면적" value={formatArea(result.totalConvertedArea)} unit="㎡" />
          <StatNumber label="총 입력면적" value={formatArea(result.totalInputArea)} unit="㎡" />
        </div>

        {/* 목표치 입력 */}
        <div className="border-t border-border pt-4">
          <NumberField
            id="targetPercent"
            label="목표 생태면적률"
            unit="%"
            min={0}
            step={0.01}
            placeholder="협의 기준 목표치 입력"
            value={targetPercent}
            onChange={onChangeTarget}
            hint="현재 기준 데이터에 목표치가 없어 직접 입력합니다."
          />
        </div>

        {/* 부족분 */}
        {result.status === 'unfit' && (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-unfit-soft p-4">
            <StatNumber
              label="부족분"
              value={formatPercent(result.deficitPercent).replace('%', '')}
              unit="%p"
              tone="unfit"
            />
            <StatNumber
              label="추가 필요 환산면적"
              value={formatArea(result.requiredConvertedArea)}
              unit="㎡"
              tone="unfit"
            />
          </div>
        )}

        {result.status === 'fit' && (
          <p className="rounded-lg bg-fit-soft px-3 py-2 text-xs font-medium text-fit-strong">
            목표 생태면적률을 충족합니다.
          </p>
        )}

        {/* 판정 보류 안내 */}
        {result.status === 'pending' && (
          <p className="rounded-lg bg-pending-soft px-3 py-2 text-xs text-pending-strong">
            {!hasSiteArea
              ? '대지면적을 기본정보 탭에서 입력하면 생태면적률이 계산됩니다.'
              : '목표 생태면적률을 입력하면 적합/부적합이 판정됩니다.'}
          </p>
        )}

        {/* 미확정 가중치 경고 — 검증 필요는 앰버(보류) 톤으로 절제 */}
        {result.hasUnconfirmedRows && (
          <p className="rounded-lg bg-pending-soft px-3 py-2 text-xs text-pending-strong">
            ⚠ 가중치가 미확정(검증 필요)인 공간유형이 입력되어 있어 총 환산면적에서 제외되었습니다.
            정확한 산정을 위해 해당 기준 원문에서 가중치를 확인하세요.
          </p>
        )}
      </div>
    </Card>
  );
}
