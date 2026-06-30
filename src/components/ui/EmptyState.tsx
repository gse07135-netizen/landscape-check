import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
}

/** 아직 구현되지 않았거나 데이터가 없는 영역의 플레이스홀더. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-2 px-6 py-10 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && (
        <p className="max-w-md text-xs leading-relaxed text-ink-subtle">{description}</p>
      )}
    </div>
  );
}
