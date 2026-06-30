import { cn } from '@/lib/cn';

/** 검토 상태 — 적합(녹색) / 부적합(빨강) / 보류(앰버, 목표치 미입력 등) */
export type CheckStatus = 'fit' | 'unfit' | 'pending';

const STATUS_STYLE: Record<
  CheckStatus,
  { label: string; chip: string; dot: string }
> = {
  fit: { label: '적합', chip: 'bg-fit-soft text-fit-strong ring-fit/20', dot: 'bg-fit' },
  unfit: { label: '부적합', chip: 'bg-unfit-soft text-unfit-strong ring-unfit/25', dot: 'bg-unfit' },
  pending: {
    label: '판정 보류',
    chip: 'bg-pending-soft text-pending-strong ring-pending/20',
    dot: 'bg-pending',
  },
};

interface StatBadgeProps {
  status: CheckStatus;
  /** 기본 라벨 대신 사용할 텍스트 */
  label?: string;
  className?: string;
}

export function StatBadge({ status, label, className }: StatBadgeProps) {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        style.chip,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {label ?? style.label}
    </span>
  );
}
