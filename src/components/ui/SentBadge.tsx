import { cn } from '@/lib/cn';

/**
 * "보냄"(전송 대상) 표시 칩.
 * 브랜드 세이지 톤(중립 강조)으로, 판정 색(적합/부적합/검증필요)과 구분된다.
 */
export function SentBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white',
        className,
      )}
    >
      ✓ 보냄
    </span>
  );
}
