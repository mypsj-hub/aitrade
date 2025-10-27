# 🎨 AI 트레이딩 대시보드

> **📅 최종 업데이트**: 2025-10-24
> **📦 버전**: v2.0.4
> **🚀 배포 URL**: https://aitrade-liard.vercel.app

---

## 📌 개요

AI 트레이딩 봇의 실시간 모니터링 및 분석을 위한 **Next.js 15** 기반 웹 대시보드입니다.

### 핵심 기능

- **실시간 모니터링**: 포트폴리오, 거래 내역, 시장 지표 실시간 추적
- **AI 분석 시각화**: AI CIO 전략, 자가 평가, 판단 근거 투명 공개
- **고급 데이터 분석**: TanStack Table v8 기반 정렬, 필터링, 검색
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원

---

## 🗺️ 학습 경로

이 문서를 효과적으로 활용하기 위한 권장 순서:

```
1. gptbitcoin4/README.md (루트)
   → 전체 시스템 이해
   ↓
2. dashboard/README.md (이 문서)
   → 대시보드 시스템 개요
   ↓
3. dashboard/docs/dev_guide/배포가이드.md
   → 개발, 배포, 문제 해결
   ↓
4. dashboard/docs/dev_guide/변경이력.md
   → 개발 변경 이력 및 주요 결정 사항
```

---

## 🏗️ 시스템 구조

### 3개 페이지 구성

```
https://aitrade-liard.vercel.app
├── /dashboard  - 시장 상황실 (메인 대시보드)
│   └── 목표: 3초 안에 전체 상황 파악
│
├── /analysis   - AI 분석실 (심층 분석)
│   └── 목표: 30초 안에 심층 분석
│
└── /portfolio  - AI CIO 전략실 (포트폴리오 관리)
    └── 목표: AI CIO 전략 중심 관리
```

### 디렉토리 구조

```
dashboard/
├── app/                        # Next.js 15 App Router
│   ├── layout.tsx             # 전역 레이아웃 + 네비게이션
│   ├── page.tsx              # 랜딩 (리다이렉트)
│   ├── dashboard/page.tsx    # 메인 대시보드
│   ├── analysis/page.tsx     # 분석 페이지
│   └── portfolio/page.tsx    # 포트폴리오 페이지
│
├── components/                # React 컴포넌트 (총 17개)
│   ├── Navigation.tsx        # 전역 네비게이션
│   ├── PortfolioSummaryCard.tsx
│   ├── HoldingsTable.tsx
│   └── ... (나머지 컴포넌트)
│
├── lib/                       # 유틸리티 및 훅
│   ├── supabase.ts           # Supabase 클라이언트
│   ├── types.ts              # TypeScript 타입
│   ├── store/                # Zustand 상태 관리
│   │   └── filterStore.ts
│   ├── hooks/                # 커스텀 훅
│   │   ├── useDashboardData.ts
│   │   └── usePageViewCounter.ts
│   └── utils/                # 유틸리티 함수
│       └── formatters.ts
│
├── docs/                      # 문서 (Level 3)
│   ├── README.md             # 문서 인덱스
│   └── dev_guide/            # 개발 가이드
│       ├── 배포가이드.md     # 배포 및 개발 가이드
│       └── 변경이력.md       # 개발 변경 이력
│
├── package.json              # 의존성 정의
├── next.config.ts            # Next.js 설정
├── tailwind.config.ts        # Tailwind CSS 설정
└── tsconfig.json             # TypeScript 설정
```

---

## 🎯 페이지별 상세 설명

### 1. /dashboard (시장 상황실)

**목표**: 3초 안에 전체 상황 파악

**주요 컴포넌트**:
- **PortfolioSummaryCard** - 4개 요약 카드 (총보유액, 손익률, 코인수, 원화잔고)
- **SystemMetricsCard** - 시스템 메트릭 (승률, 손익비, 24h 거래, 평균 보유기간)
- **CIOStrategyCard** - AI CIO 최신 전략
- **KeyTradesCard** - 주요 거래 5건
- **MarketIndicators** - 시장 지표 (공포탐욕지수, BTC도미넌스, 김치프리미엄)
- **QuickLinksCard** - 빠른 링크 (외부 사이트)
- **PerformanceChartEnhanced** - 총순자산 추이 (만원 단위)
- **HoldingsTable** - 보유 자산 현황
- **RecentTradesTable** - 최근 거래 내역

**데이터 갱신**: SWR 60초 자동 새로고침

**레이아웃**:
```
2컬럼 그리드 (lg 이상)
├── 좌측 1컬럼: SystemMetricsCard (sticky)
└── 우측 2컬럼: 나머지 컴포넌트들
```

---

### 2. /analysis (AI 분석실)

**목표**: 30초 안에 심층 분석

**주요 컴포넌트**:
- **AnalysisFilters** - 날짜/거래유형 필터
- **AnalysisSummary** - 4개 메트릭 (총 거래, 손익, 승률, 손익비)
- **PnlByAssetChart** - 코인별 손익 막대 차트
- **PerformanceTrendChart** - 수익률 추세 차트
- **CoinStatsTable** - 코인별 상세 통계
- **AIPatternAnalysis** - AI 매매 패턴 분석
- **EnhancedTradesTable** - TanStack Table v8 (정렬, 페이징, 검색, 행 확장)

**데이터 갱신**: SWR 300초 (5분)

**기술 스택**:
- `@tanstack/react-table` - 고급 테이블 기능
- `zustand` - 전역 필터 상태 관리
- `recharts` - 차트 시각화

**주요 기능**:
- 날짜 범위 필터 (기본 7일)
- 거래 유형 필터 (매수, 익절, 손절, 매도)
- 코인명 실시간 검색
- 행 확장 시 AI 사고과정 + 주요지표 표시

**레이아웃**:
```
4컬럼 그리드 (lg 이상)
├── 좌측 1컬럼: AnalysisFilters (sticky)
└── 우측 3컬럼: 요약 + 차트 + 테이블
```

---

### 3. /portfolio (AI CIO 전략실)

**목표**: AI CIO 전략 중심 포트폴리오 관리

**핵심 전략**: 비용 Zero (Supabase Realtime 대신 SWR 새로고침)

**주요 컴포넌트**:
- **PortfolioDateSelector** - 날짜 선택기 (input type="date")
- **CIOInsightBanner** - 최신 전략 하이라이트 (확장/축소 토글)
- **PerformanceGauge** - 수익률 게이지 차트 (누적수익률, 승률, 일일수익률)
- **PortfolioComposition** - 포트폴리오 구성 도넛 차트 (원화 vs 코인)
- **CIOSelfCritique** - AI 자가 평가 3컬럼 (강점, 약점, 교훈)

**데이터 갱신**:
- 중요 데이터 (5초): CIOInsightBanner, PerformanceGauge, PortfolioComposition
- 일반 데이터 (30초): CIOSelfCritique

**기술 스택**:
- `react-markdown` + `remark-gfm` - 마크다운 렌더링
- `recharts` - RadialBarChart, PieChart
- `date-fns` - 날짜 처리

**주요 기능**:
- 날짜별 과거 데이터 조회
- AI CIO 전략 전체 내용 보기/숨기기
- 게이지 차트로 직관적인 수익률 표시
- AI 자가 평가 마크다운 렌더링

**레이아웃**:
```
├── PortfolioDateSelector (전체 너비)
├── CIOInsightBanner (전체 너비)
├── 2컬럼 그리드
│   ├── PerformanceGauge (좌측)
│   └── PortfolioComposition (우측)
└── CIOSelfCritique (전체 너비, 3컬럼)
```

---

## 🛠️ 기술 스택

### 코어 프레임워크

- **Next.js 15**: React 기반 풀스택 프레임워크 (App Router)
- **React 19**: UI 라이브러리
- **TypeScript**: 타입 안전성 (any 타입 금지)
- **Tailwind CSS 4**: 유틸리티 CSS

### 데이터 관리

- **Supabase**: PostgreSQL 데이터베이스 + RPC 함수
- **SWR**: 데이터 페칭 및 캐싱 (Realtime 대신 사용, 비용 Zero)

### UI 라이브러리

- **Recharts**: 차트 라이브러리 (Line, Bar, Pie, RadialBar)
- **TanStack Table v8**: 고급 테이블 (정렬, 페이징, 필터링, 행 확장)
- **Zustand**: 전역 상태 관리 (경량)
- **date-fns**: 날짜 포맷팅 및 연산
- **react-markdown**: 마크다운 렌더링
- **remark-gfm**: GitHub Flavored Markdown 지원

---

## 🚀 빠른 시작

### 로컬 개발 환경

```bash
# 1. 디렉토리 이동
cd c:/gptbitcoin4/dashboard

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://nlkbkyambjnlmuplpnrd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 4. 개발 서버 시작
npm run dev

# 5. 브라우저 접속
# http://localhost:3000
```

### 배포 전 체크리스트

```bash
# 1. 로컬 빌드 성공
npm run build

# 2. TypeScript 에러 확인
npm run type-check

# 3. ESLint 에러 확인
npm run lint
```

### Vercel 자동 배포

```bash
# GitHub에 푸시하면 자동 배포
git add .
git commit -m "feat: 새 기능 추가"
git push origin main

# Vercel이 자동으로 감지하여 배포 시작
# 배포 상태: https://vercel.com/dashboard
```

---

## ⚙️ 주요 설계 원칙

### 1. TypeScript 엄격 준수

```typescript
// ❌ any 타입 절대 사용 금지
function bad(data: any) { }

// ✅ 명확한 타입 정의
import { PortfolioSummary } from '@/lib/types';
function good(data: PortfolioSummary) { }

// ✅ Map.get() 항상 undefined 체크
const value = map.get(key);
if (value !== undefined) {
  // 사용
}

// ✅ Optional chaining 사용
const length = array?.length ?? 0;
```

### 2. ESLint 규칙 준수

**Vercel 배포 시 ESLint 에러가 있으면 배포 실패!**

```typescript
// ❌ prefer-const 에러
let content = match[1];  // 재할당 안 함

// ✅ const 사용
const content = match[1];

// ❌ 미사용 import
import ReactMarkdown from 'react-markdown';  // 사용 안 함

// ✅ 사용하는 것만 import
import { format } from 'date-fns';
```

### 3. 비용 최적화

**Supabase Realtime 구독 사용 금지** (비용 발생)

```typescript
// ❌ Realtime 구독 (비용 발생)
supabase.channel('portfolio').on('postgres_changes', ...)

// ✅ SWR refreshInterval (비용 Zero)
const { data } = useSWR('/api/portfolio', fetcher, {
  refreshInterval: 5000  // 5초마다 갱신
});
```

### 4. Props 기반 아키텍처

**Context API 최소화, Props Drilling 선호**

```typescript
// ✅ Props 기반
export function PerformanceGauge({ selectedDate }: { selectedDate: Date }) {
  // ...
}

// portfolio/page.tsx에서
<PerformanceGauge selectedDate={selectedDate} />
```

---

## 🎨 UI/UX 특징

### 1. 모바일 최적화

- **반응형 그리드**: `grid-cols-1 lg:grid-cols-3`
- **모바일 툴팁**: `text-[10px]` 크기, 3-5단어 이내
- **기본 기간**: 분석 탭 7일 (데이터량 최적화)

### 2. 전문 용어 사용

- **강세장/약세장/박스권** (금융 전문 용어)
- **수익률/승률/손익비** (명확한 지표명)
- **만원 단위 표시** (가독성 향상)

### 3. 손익 색상 통일

- **수익**: `text-red-600` / `bg-red-100` (빨강)
- **손실**: `text-blue-600` / `bg-blue-100` (파랑)
- **매수**: `bg-green-100` (초록)
- **무손익**: `bg-slate-100` (회색)

### 4. 직관적인 네비게이션

- **로고 클릭**: /dashboard로 이동
- **현재 페이지**: 파란색 하이라이트
- **Hover 효과**: 회색 배경
- **Sticky 헤더**: 스크롤 시 상단 고정

---

## 📊 데이터 소스 (Supabase)

### 주요 테이블

1. **portfolio_summary** - 포트폴리오 요약 (날짜별)
   - 날짜, 총순자산, 원화잔고, 총코인가치, 누적수익률, 일일수익률

2. **holding_status** - 보유 자산 현황 (실시간)
   - 심볼, 보유수량, 평균매수가, 현재가, 현재가치, 수익금, 수익률

3. **trade_history** - 거래 내역 (전체)
   - 거래일시, 심볼, 거래유형, 수량, 가격, 금액, 수익금, AI사고과정

4. **cio_reports** - AI CIO 리포트 (일별/주별/월별)
   - report_date, report_type, title, cio_latest_rationale, outlook, self_critique

5. **system_status** - 시스템 상태 (실시간)
   - 공포탐욕지수, BTC도미넌스, 김치프리미엄, 시장상황, 조회시각

### RPC 함수

- **increment_page_view()** - 방문자 카운트 증가
- **get_page_view_count()** - 방문자 수 조회

---

## 🔄 데이터 갱신 전략 (SWR)

### refreshInterval 정책

| 페이지 | 컴포넌트 | 갱신 주기 | 이유 |
|--------|----------|-----------|------|
| Dashboard | 전체 | 60초 | 실시간성과 성능 균형 |
| Analysis | 전체 | 300초 (5분) | 과거 데이터, 자주 갱신 불필요 |
| Portfolio | CIOInsightBanner | 5초 | 최신 전략 중요 |
| Portfolio | PerformanceGauge | 5초 | 수익률 실시간 모니터링 |
| Portfolio | PortfolioComposition | 5초 | 자산 구성 실시간 추적 |
| Portfolio | CIOSelfCritique | 30초 | 자가 평가 자주 변경 안 됨 |

---

## 🐛 주요 이슈 및 해결 방법

### 1. Supabase Timestamp 쿼리

**문제**: `portfolio_summary.날짜`가 `timestamp with time zone` 타입
- 저장 형식: `2025-10-15T15:08:38.625661+00:00`
- 쿼리: `.eq('날짜', '2025-10-15')` → 매치 실패

**해결**: 날짜 범위 쿼리

```typescript
const dateString = format(selectedDate, 'yyyy-MM-dd');
const startOfDay = `${dateString}T00:00:00`;
const endOfDay = `${dateString}T23:59:59`;

const { data } = await supabase
  .from('portfolio_summary')
  .select('*')
  .gte('날짜', startOfDay)
  .lte('날짜', endOfDay)
  .limit(1);
```

### 2. Supabase 406 Not Acceptable

**문제**: Korean column names + `.single()` 처리 불가

**해결**: `.limit(1)` + 배열 접근

```typescript
// Before
.eq('날짜', dateString).single()

// After
.eq('날짜', dateString).limit(1)
const data = rawDataArray[0];
```

### 3. Hydration Error

**문제**: 서버/클라이언트 불일치 (날짜, 난수 등)

**해결**: 클라이언트 전용 렌더링

```typescript
'use client';
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### 4. Vercel 빌드 실패

**해결 순서**:
```bash
# 1. 로컬 빌드 테스트
npm run build

# 2. 에러 확인 및 수정 후
git add .
git commit -m "fix: Build error 수정"
git push origin main
```

---

## 📁 문서 구조

```
Level 1: gptbitcoin4/README.md (전체 시스템 개요)
   ↓
Level 2: dashboard/README.md (이 문서 - 대시보드 총괄 가이드)
   ↓
Level 3: dashboard/docs/dev_guide/ (개발자 가이드)
   ├── 배포가이드.md (배포, 개발, 문제 해결)
   └── 변경이력.md (개발 변경 이력)
```

---

## 🔗 관련 링크

### 배포 및 인프라

- **배포 URL**: https://aitrade-liard.vercel.app
- **GitHub**: https://github.com/mypsj-hub/aitrade
- **Vercel 대시보드**: https://vercel.com/dashboard
- **Supabase**: https://nlkbkyambjnlmuplpnrd.supabase.co

### 공식 문서

- [Next.js 15](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [SWR](https://swr.vercel.app/)
- [TanStack Table](https://tanstack.com/table/latest)
- [Recharts](https://recharts.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 내부 문서

- [배포가이드](./docs/dev_guide/배포가이드.md) - 배포, 개발, 문제 해결
- [변경이력](./docs/dev_guide/변경이력.md) - 개발 변경 이력
- [프로젝트 루트 README](../README.md) - 전체 시스템 개요

---

## 🎯 향후 개발 계획

### Phase 5: 외부 통합 (예정)

- TradingView Lightweight Charts
- 공포탐욕지수 실시간 연동
- Upbit WebSocket 가격 티커

### Phase 6: UX 개선 (예정)

- Framer Motion 애니메이션
- react-hot-toast 알림
- 다크모드
- PWA 지원

### Phase 7: 고급 분석 (예정)

- AI 판단 패턴 분석
- 백테스트 결과 시각화
- PDF 리포트 생성

---

## 💬 도움말

### 문제가 발생하면?

1. **[배포가이드.md](./docs/dev_guide/배포가이드.md)** - 문제 해결 섹션 참조
2. **[변경이력.md](./docs/dev_guide/변경이력.md)** - 유사한 이슈 해결 사례 확인
3. **로컬 빌드 테스트**: `npm run build`로 에러 확인

### 개발 시작하기

1. [배포가이드.md - 로컬 개발 환경 설정](./docs/dev_guide/배포가이드.md#-로컬-개발-환경-설정)
2. [배포가이드.md - 개발 워크플로우](./docs/dev_guide/배포가이드.md#-개발-워크플로우)
3. [배포가이드.md - 주의사항 및 규칙](./docs/dev_guide/배포가이드.md#-주의사항-및-규칙)

---

**📅 최종 업데이트**: 2025-10-24
**📦 작성자**: AI Trading Dashboard Team
**📝 버전**: v2.0 (문서 구조 재편)
