import { cn } from '@/lib/cn';

/**
 * 행 출처 표시 칩. 도면 분석에서 추가된 입력에 "도면" 태그를 보여준다.
 * 판정 색(녹/빨/주황)과 혼동되지 않도록 중립 톤 사용.
 */
export function SourceTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] font-medium text-ink-subtle',
        className,
      )}
    >
      도면
    </span>
  );
}
