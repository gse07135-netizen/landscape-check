import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** 업무용 톤의 기본 표면 카드. 제목/설명/액션 슬롯을 가진다. */
export function Card({ title, description, actions, children, className }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-surface shadow-card',
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
            )}
            {description && (
              <p className="mt-1.5 text-xs leading-relaxed text-ink-subtle">{description}</p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </header>
      )}
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}
