# 조경 정량검토 웹 도구 (landscape-check)

조경 설계·엔지니어링 실무에서 반복되는 **생태면적률 산정**과 **식재 법규 검토**를 자동화하는 웹 도구입니다.
공간유형·수목 정보를 입력하면 적합/부적합 여부와 부족분을 실시간으로 계산하고, 산정표·수목 목록표·통합 리포트를 PDF·엑셀로 내보낼 수 있습니다.

## 주요 기능

- **기본정보 관리** — 프로젝트명, 대지면적, 지자체, 용도지역, 사업유형, 적용기준 선택
- **생태면적률 산정** — 공간유형별 면적 입력 → 가중치·환산면적·생태면적률 자동 계산, 목표치 대비 적합/부적합 판정
- **식재 법규 검토** — 조경 의무면적·식재밀도 기반 최소 교목/관목 수, 상록·지역특성수 비율 검토
- **통합 리포트** — 프로젝트 개요·생태면적률·식재 법규·수목 목록을 한 화면에서 확인, PDF(인쇄)·엑셀 내보내기
- **실시간 재계산 / 자동 저장** — 입력 변경 시 즉시 재계산, localStorage 자동 저장·복원

> 모든 규제 수치(가중치·목표치·식재밀도 등)는 코드에 하드코딩하지 않고 `src/data/`의 JSON에서 읽으며, [zod](https://zod.dev)로 검증합니다. 각 기준의 출처·시행일·검증상태를 화면에 표시합니다.

## 기술 스택

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) (빌드 / 개발 서버)
- [Tailwind CSS v4](https://tailwindcss.com)
- [zod](https://zod.dev) (외부 데이터 스키마 검증)
- [SheetJS (xlsx)](https://sheetjs.com) (엑셀 내보내기)

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드 (타입체크 + 번들)
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 프로젝트 구조

```
src/
├── components/      # 공용 UI 컴포넌트 (Card, StatBadge, Field 등)
├── modules/         # 기능 모듈 (EcoAreaRatio, PlantingCheck, Report, BasicInfo)
├── lib/             # 계산 엔진·데이터 로더·엑셀/포맷 유틸
├── schemas/         # zod 스키마 (규제 데이터 검증)
├── state/           # React Context (프로젝트/생태면적률/식재 입력 상태)
├── data/            # 규제 기준 JSON (생태면적률·식재 법규)
└── types/           # 도메인 타입
```

## 데이터 관련 주의

규제 기준 데이터는 검증 상태(`verified` / `valuesVerified`)를 포함합니다. **미검증(예: 신설 가중치·일부 지자체 기준)** 항목은 화면에 "⚠ 검증 필요"로 표시되며, 인허가 제출 전 반드시 해당 기준 원문에서 값을 확인해야 합니다.
