import { cn } from '@/lib/cn';

/**
 * 규제 기준 검증상태 칩(공용).
 *  - true       → 검증됨 (녹색)
 *  - "partial"  → 부분 검증 (앰버)
 *  - 그 외/false → ⚠ 검증 필요 (앰버) — 부적합(빨강)과 구분되는 "주의" 신호
 */
type VerifyValue = boolean | string;

function resolve(verified: VerifyValue): { label: string; className: string } {
  if (verified === true) return { label: '검증됨', className: 'bg-fit-soft text-fit-strong ring-fit/20' };
  if (verified === 'partial')
    return { label: '부분 검증', className: 'bg-pending-soft text-pending-strong ring-pending/25' };
  return { label: '⚠ 검증 필요', className: 'bg-pending-soft text-pending-strong ring-pending/25' };
}

export function VerifyBadge({
  verified,
  className,
}: {
  verified: VerifyValue;
  className?: string;
}) {
  const { label, className: toneClass } = resolve(verified);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        toneClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
