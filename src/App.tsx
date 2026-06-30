import { useState } from 'react';
import { Tabs, type TabKey } from '@/components/layout/Tabs';
import { GlobalResetButton } from '@/components/GlobalResetButton';
import { ProjectProvider } from '@/state/ProjectContext';
import { EcoAreaRatioProvider } from '@/state/EcoAreaRatioContext';
import { PlantingProvider } from '@/state/PlantingContext';
import { BasicInfoTab } from '@/modules/BasicInfo/BasicInfoTab';
import { EcoAreaRatioTab } from '@/modules/EcoAreaRatio/EcoAreaRatioTab';
import { PlantingCheckTab } from '@/modules/PlantingCheck/PlantingCheckTab';
import { ReportTab } from '@/modules/Report/ReportTab';

/** 활성 탭에 해당하는 모듈을 렌더링한다. */
function TabPanel({ active }: { active: TabKey }) {
  switch (active) {
    case 'basic':
      return <BasicInfoTab />;
    case 'eco':
      return <EcoAreaRatioTab />;
    case 'planting':
      return <PlantingCheckTab />;
    case 'report':
      return <ReportTab />;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  return (
    <ProjectProvider>
      <EcoAreaRatioProvider>
        <PlantingProvider>
          <div className="min-h-full">
        <header className="no-print border-b border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4">
            <div className="flex items-baseline gap-3">
              <h1 className="text-base font-bold tracking-tight text-ink">
                조경 정량검토 웹 도구
              </h1>
              <span className="text-xs text-ink-muted">
                생태면적률 · 식재 법규 검토
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Tabs active={activeTab} onChange={setActiveTab} />
              <GlobalResetButton />
            </div>
          </div>
        </header>

            <main className="mx-auto max-w-6xl px-6 py-6">
              <TabPanel active={activeTab} />
            </main>
          </div>
        </PlantingProvider>
      </EcoAreaRatioProvider>
    </ProjectProvider>
  );
}
