import { VerifyBadge } from '@/components/ui/VerifyBadge';

/**
 * 리포트 각 섹션의 적용 기준 출처 + 검증상태 표시.
 * valuesVerified: true(검증됨) / "partial"(부분 검증) / false·기타(검증 필요).
 */
interface ReportSectionMetaProps {
  name: string;
  source: string;
  verified: boolean | string;
}

export function ReportSectionMeta({ name, source, verified }: ReportSectionMetaProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-md bg-surface-2 px-3 py-2.5">
      <div className="min-w-0 text-xs">
        <p className="font-medium text-ink">{name}</p>
        <p className="mt-1 leading-relaxed text-ink-subtle">{source}</p>
      </div>
      <VerifyBadge verified={verified} />
    </div>
  );
}
