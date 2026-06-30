import type { StandardMeta } from '@/schemas/ecoAreaRatio.schema';
import { cn } from '@/lib/cn';
import { VerifyBadge } from '@/components/ui/VerifyBadge';

/**
 * 적용 중인 규제 기준의 출처/시행일/버전을 표시하는 소형 정보 박스.
 * (PRD 1.3.2 기준 정보 표시, 6.4 규제 데이터 신뢰성 표시)
 */

interface StandardInfoBoxProps {
  standardName: string;
  meta: StandardMeta;
  className?: string;
}

export function StandardInfoBox({ standardName, meta, className }: StandardInfoBoxProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-surface-2 p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-subtle">적용 기준</p>
          <p className="mt-1 text-sm font-semibold text-ink">{standardName}</p>
        </div>
        <VerifyBadge verified={meta.valuesVerified} />
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <InfoItem label="시행일" value={meta.effectiveDate} />
        <InfoItem label="버전" value={meta.version} />
        <InfoItem label="앱 갱신일" value={meta.lastUpdatedInApp} />
      </dl>

      <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-ink-muted">
        {meta.source}
      </p>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-subtle">{label}</dt>
      <dd className="mt-1 font-medium tabular-nums text-ink">{value}</dd>
    </div>
  );
}
