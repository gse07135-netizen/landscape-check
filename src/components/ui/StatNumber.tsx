import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * 핵심 지표를 큰 숫자로 강조 표시한다(생태면적률 %, 부족분 등).
 * tone 으로 적합/부적합/보류 색을 입히고, size 로 hero 지표를 더 크게 강조한다.
 */

type Tone = 'default' | 'fit' | 'unfit' | 'pending';
type Size = 'md' | 'lg';

const TONE_CLASS: Record<Tone, string> = {
  default: 'text-ink',
  fit: 'text-fit-strong',
  unfit: 'text-unfit-strong',
  pending: 'text-pending-strong',
};

const SIZE_CLASS: Record<Size, string> = {
  md: 'text-3xl',
  lg: 'text-4xl',
};

interface StatNumberProps {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  tone?: Tone;
  size?: Size;
  className?: string;
}

export function StatNumber({
  label,
  value,
  unit,
  tone = 'default',
  size = 'md',
  className,
}: StatNumberProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-xs font-medium text-ink-subtle">{label}</span>
      <span className="flex items-baseline gap-1">
        <span
          className={cn(
            'font-bold leading-none tabular-nums tracking-tight',
            SIZE_CLASS[size],
            TONE_CLASS[tone],
          )}
        >
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-ink-subtle">{unit}</span>}
      </span>
    </div>
  );
}
