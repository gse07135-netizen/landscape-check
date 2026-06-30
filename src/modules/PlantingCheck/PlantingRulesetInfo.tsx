import type { PlantingRuleset } from '@/lib/plantingLoader';
import { cn } from '@/lib/cn';
import { VerifyBadge } from '@/components/ui/VerifyBadge';

/**
 * 적용 중인 식재 법규 룰셋(지자체 + 전국 베이스)의 출처/근거/검증상태 표시.
 * 지자체 룰셋이 미검증(남양주)이면 "⚠ 검증 필요" 신호를 보여준다.
 */
interface PlantingRulesetInfoProps {
  ruleset: PlantingRuleset;
  className?: string;
}

export function PlantingRulesetInfo({ ruleset, className }: PlantingRulesetInfoProps) {
  const { municipality, national } = ruleset;
  const verified = municipality.meta.valuesVerified;

  return (
    <div className={cn('rounded-lg border border-border bg-surface-2 p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-subtle">적용 식재 기준</p>
          <p className="mt-1 text-sm font-semibold text-ink">{municipality.rulesetName}</p>
        </div>
        <VerifyBadge verified={verified} />
      </div>

      <dl className="mt-4 flex flex-col gap-3 text-xs">
        <div>
          <dt className="text-ink-subtle">조경 의무면적 근거</dt>
          <dd className="mt-1 leading-relaxed text-ink">{municipality.meta.source}</dd>
        </div>
        <div>
          <dt className="text-ink-subtle">정량 기준(식재밀도·비율) 베이스</dt>
          <dd className="mt-1 leading-relaxed text-ink">{national.rulesetName}</dd>
        </div>
      </dl>

      {!verified && municipality.meta.verificationNote && (
        <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-pending-strong">
          {municipality.meta.verificationNote}
        </p>
      )}
    </div>
  );
}
