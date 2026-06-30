import { cn } from '@/lib/cn';

export type TabKey = 'basic' | 'eco' | 'planting' | 'report';

export interface TabItem {
  key: TabKey;
  label: string;
}

export const TABS: readonly TabItem[] = [
  { key: 'basic', label: '기본정보' },
  { key: 'eco', label: '생태면적률' },
  { key: 'planting', label: '식재 법규' },
  { key: 'report', label: '리포트' },
] as const;

interface TabsProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
}

/** 상단 탭 내비게이션. */
export function Tabs({ active, onChange }: TabsProps) {
  return (
    <nav aria-label="검토 단계" className="flex gap-1">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onChange(tab.key)}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-brand text-white shadow-sm'
                : 'text-ink-muted hover:bg-surface-2 hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
