# 📝 Dashboard 개발 변경 이력

> **목적**: 모든 개발 과정을 실시간으로 기록하여 중단 시 빠른 재개 가능
> **작성 규칙**: 작업 시작/완료/문제 발생 시 즉시 기록

---

## 📌 현재 상태

**버전**: 2.0.4-youtube-visitor-counter
**현재 Phase**: YouTube 채널 통합 및 방문자 카운터 추가 완료
**다음 작업**: GitHub 배포
**마지막 업데이트**: 2025-10-16 19:30

---

## 🎯 Phase 0: 계획 수립 및 문서화

### [2025-10-14] Phase 0 완료

**✅ 완료 항목**:
1. v2.0 고도화 계획 수립
   - 3페이지 구조 설계 (/dashboard, /analysis, /portfolio)
   - Phase 1-6 상세 계획
   - 컴포넌트 설계
   
2. 문서 작성
   - DASHBOARD_GUIDE.md v2.0 작성 완료
   - DASHBOARD_CHANGELOG.md 초기 작성
   - 기존 v1.0 문서 백업 (docs/archive/)

3. 기술 스택 선정
   - Phase 3: TanStack Table, Zustand
   - Phase 4: Supabase Realtime
   - Phase 5-6: Lightweight Charts, Framer Motion, react-hot-toast

**📊 현재 시스템 상태**:
- v1.0.0 운영 중 (https://aitrade-liard.vercel.app)
- 단일 페이지 대시보드
- 모든 기능 정상 작동

**🔜 다음 작업**:
- Phase 1 시작: Navigation 컴포넌트 생성

---

## 📋 작업 템플릿

### 작업 시작 시
```markdown
### [YYYY-MM-DD HH:MM] Phase N: 작업명 시작

**목표**: 구체적인 목표

**작업 내용**:
- [ ] 작업 1
- [ ] 작업 2

**예상 시간**: X시간
```

### 작업 완료 시
```markdown
### [YYYY-MM-DD HH:MM] Phase N: 작업명 완료

**✅ 완료 항목**:
- [x] 작업 1 (소요시간: Xmin)
- [x] 작업 2 (소요시간: Xmin)

**📝 상세 내역**:
- 파일 생성: `path/to/file.tsx`
- 수정 사항: ...

**✅ 테스트**:
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] 기능 테스트 통과
- [ ] 반응형 확인

**🔜 다음 작업**: ...
```

### 문제 발생 시
```markdown
### [YYYY-MM-DD HH:MM] 🐛 문제 발생: 문제명

**문제 상황**: 
상세한 문제 설명

**에러 메시지**:
```
에러 내용
```

**시도한 해결 방법**:
1. ...
2. ...

**해결 방법**:
- 최종 해결 방법

**소요 시간**: Xmin

**교훈**: 향후 주의사항
```

---

## 🚀 Phase 1: 페이지 분리 및 네비게이션

> **목표**: 3개 페이지 구조 구축 + 기존 기능 마이그레이션
> **실제 기간**: 1일 (2025-10-15)
> **상태**: ✅ 완료

### [2025-10-15 14:20] Phase 1 완료

**✅ 완료 항목**:
- [x] 1.1. Navigation.tsx 컴포넌트 생성
- [x] 1.2. layout.tsx에 네비게이션 통합
- [x] 1.3. app/dashboard/page.tsx 생성 (기존 복사)
- [x] 1.4. app/analysis/page.tsx 빈 구조 생성
- [x] 1.5. app/portfolio/page.tsx 빈 구조 생성
- [x] 1.6. app/page.tsx 리다이렉트 설정 (`redirect('/dashboard')`)
- [x] 1.7. 빌드 테스트 (성공)
- [x] 1.8. 배포 테스트 (Vercel 자동 배포 성공)

**📝 생성된 파일**:
- `components/Navigation.tsx` - 3페이지 네비게이션 바 (emoji + 한글명)
- `app/dashboard/page.tsx` - 기존 메인 페이지 기능 이전
- `app/analysis/page.tsx` - "곧 출시됩니다" 플레이스홀더
- `app/portfolio/page.tsx` - "곧 출시됩니다" 플레이스홀더

**🎨 디자인 특징**:
- 상단 고정 네비게이션 (`sticky top-0`)
- 현재 페이지 파란색 하이라이트
- Hover 효과 (회색 배경)
- 반응형 디자인 (모바일 대응)

**✅ 검증 완료**:
- ✅ 3개 페이지 간 이동 자연스러움
- ✅ /dashboard에서 기존 모든 기능 작동
- ✅ 네비게이션 바의 현재 페이지 하이라이트
- ✅ 모바일 반응형
- ✅ 배포 URL: https://aitrade-liard.vercel.app

**커밋**: `phase1-2: Add page structure and dashboard enhancements`

---

## 🎨 Phase 2: Dashboard 페이지 고도화

> **목표**: 시장 상황실 완성
> **실제 기간**: 1일 (2025-10-15)
> **상태**: ✅ 완료

### [2025-10-15 15:30] Phase 2 완료

**✅ 완료 항목**:
- [x] 2.1. SystemMetricsCard.tsx 생성
- [x] 2.2. CIOStrategyCard.tsx 생성
- [x] 2.3. KeyTradesCard.tsx 생성
- [x] 2.4. MarketIndicators.tsx 생성 (미래 기능용 플레이스홀더)
- [x] 2.5. QuickLinksCard.tsx 생성
- [x] 2.6. 2컬럼 레이아웃 적용 (좌측 메트릭 + 우측 콘텐츠)
- [x] 2.7. 반응형 테스트 (성공)
- [x] 2.8. 빌드 + 배포 (성공)

**📝 생성된 파일**:
- `components/SystemMetricsCard.tsx` - 총 보유액, 손익률, 보유 코인 수 표시
- `components/CIOStrategyCard.tsx` - AI CIO의 최신 전략 표시
- `components/KeyTradesCard.tsx` - 최근 5개 주요 거래 내역 표시
- `components/MarketIndicators.tsx` - 공포탐욕지수, BTC도미넌스 플레이스홀더
- `components/QuickLinksCard.tsx` - 빠른 링크 (Upbit, CoinGecko 등)

**🎨 디자인 특징**:
- 2컬럼 그리드 레이아웃 (`grid grid-cols-1 lg:grid-cols-3`)
- 좌측 1개 컬럼: 시스템 메트릭 (sticky)
- 우측 2개 컬럼: 나머지 컴포넌트들
- 모든 카드 통일된 디자인 (흰 배경, rounded-lg, shadow-lg)
- Emoji 아이콘 활용

**✅ 검증 완료**:
- ✅ 모든 컴포넌트 정상 렌더링
- ✅ 데이터 패칭 정상 작동 (SWR)
- ✅ 반응형 레이아웃 (모바일, 태블릿, 데스크톱)
- ✅ 빌드 성공
- ✅ 배포 URL: https://aitrade-liard.vercel.app/dashboard

**커밋**: `phase1-2: Add page structure and dashboard enhancements`

---

## 🔬 Phase 3: Analysis 페이지 구축

> **목표**: AI 분석실 완성
> **실제 기간**: 1일 (2025-10-15)
> **상태**: ✅ 완료

### [2025-10-15 18:45] Phase 3 완료

**✅ 완료 항목**:
- [x] 3.1. Zustand 스토어 설정 (`@tanstack/react-table@^8.21.3`, `zustand@^5.0.8` 설치)
- [x] 3.2. AnalysisFilters.tsx 생성
- [x] 3.3. TanStack Table 설치 및 설정
- [x] 3.4. EnhancedTradesTable.tsx 생성
- [x] 3.5. 행 확장 기능 구현 (AI 사고과정 + 주요지표)
- [x] 3.6. PnlByAssetChart.tsx 생성 (Recharts 막대 차트)
- [x] 3.7. PerformanceChart.tsx 고도화 (스킵 - Analysis 페이지 범위 외)
- [x] 3.8. AnalysisSummary.tsx 생성 (총 거래, 손익, 승률, 손익비)
- [x] 3.9. 필터 연동 테스트 (날짜 범위, 거래 유형 필터링)
- [x] 3.10. 빌드 + 배포 (성공)

**📝 생성된 파일**:
- `lib/store/filterStore.ts` - Zustand 필터 스토어 (날짜 범위, 코인 선택, 거래 유형)
- `components/AnalysisFilters.tsx` - 필터 UI (날짜 선택, 거래 유형 토글)
- `components/AnalysisSummary.tsx` - 4개 핵심 지표 카드
- `components/PnlByAssetChart.tsx` - 코인별 손익 막대 차트 (Recharts)
- `components/EnhancedTradesTable.tsx` - TanStack Table v8 고급 테이블
- `app/analysis/page.tsx` - 전체 통합 페이지 (플레이스홀더 → 완전 구현)

**🎨 디자인 특징**:
- 4컬럼 그리드 레이아웃 (`grid grid-cols-1 lg:grid-cols-4`)
- 좌측 1개 컬럼: 필터 (sticky top-20)
- 우측 3개 컬럼: 요약 + 차트 + 테이블
- 테이블 기능:
  * 모든 컬럼 정렬 가능
  * 페이지당 20개 항목
  * 행 확장 시 AI 사고과정 및 주요지표 표시
  * 거래 유형별 색상 코딩 (매수=파랑, 익절=초록, 손절=빨강)

**⚙️ 기술 구현**:
- **데이터 패칭**: SWR로 최근 500개 거래 내역 조회, 5분 간격 새로고침
- **클라이언트 필터링**: `useMemo`로 필터 적용 (날짜 범위, 거래 유형)
- **상태 관리**: Zustand로 전역 필터 상태 관리
- **테이블 라이브러리**: TanStack Table v8 (정렬, 페이지네이션, 필터링)
- **차트 라이브러리**: Recharts (막대 차트)
- **날짜 처리**: date-fns

**🐛 해결된 문제**:
1. **TypeScript ESLint 오류**: `Record<string, any>` → `Record<string, unknown>` 변경
2. **미사용 변수 경고**: `setSelectedCoins` 제거 (코인 필터는 미구현)

**📊 번들 크기**:
- Analysis 페이지: 169 kB
- First Load JS: 288 kB

**✅ 검증 완료**:
- ✅ 필터링 정상 작동 (날짜 범위, 거래 유형)
- ✅ 테이블 정렬, 페이지네이션 정상
- ✅ 행 확장 시 AI 사고과정 표시
- ✅ 차트 정상 렌더링 (수익=파랑, 손실=빨강)
- ✅ 요약 지표 정확히 계산
- ✅ 빌드 성공 (9.8초)
- ✅ 배포 URL: https://aitrade-liard.vercel.app/analysis

**커밋**: `phase3: Implement advanced Analysis page with TanStack Table and filtering`

---

## 🔧 Dashboard 개선 (2025-10-16)

**✅ 완료 항목**:
- [x] MarketIndicators 실시간 데이터 통합 (system_status 테이블 연동)
- [x] SystemMetricsCard 평균 보유기간 실제 계산 (매수-청산 페어 매칭)
- [x] 통화 포맷 표준화 (테이블: 숫자만, 요약: 원 단위)
- [x] 날짜/시간 포맷 표준화 (yyyy-MM-dd HH:mm:ss)
- [x] PerformanceChart: 수익률 → 총순자산 만원 단위 표시
- [x] 차트 Y축 표시 버그 수정 (중복 변환 제거)

**📝 주요 개선사항**:
- **하드코딩 제거**: 공포탐욕지수, BTC도미넌스, 김치프리미엄 실시간 조회
- **정확한 지표**: 실제 거래 데이터 기반 평균 보유기간 계산
- **차트 개선**: 총순자산 추이를 만원 단위로 표시 (Dashboard와 통일)
- **포맷 통일**: 통화, 날짜/시간 표시 일관성 확보

**수정된 파일** (9개):
- `components/MarketIndicators.tsx`, `SystemMetricsCard.tsx`, `PerformanceChartEnhanced.tsx`
- `components/PortfolioSummaryCard.tsx`, `HoldingsTable.tsx`, `RecentTradesTable.tsx`
- `components/EnhancedTradesTable.tsx`, `lib/utils/formatters.ts`, `app/dashboard/page.tsx`

---

## 📊 Analysis 탭 개선 (2025-10-16)

**✅ 완료 항목**:
- [x] PerformanceTrendChart 생성 (기간별 누적 손익 추이, 만원 단위)
- [x] CoinStatsTable 생성 (코인별 승률, 손익비, 평균 손익 통계)
- [x] AIPatternAnalysis 생성 (거래 유형별/시간대별 성과 분석)
- [x] EnhancedTradesTable 검색 기능 추가 (globalFilter)
- [x] AnalysisSummary 카드 레이아웃 개선 (타이틀 추가)
- [x] 날짜 필터 버그 수정 (당일 23:59:59까지 포함)
- [x] 손익 색상 통일 (수익=빨강, 손실=파랑)

**📝 주요 개선사항**:
- **기간별 추이 시각화**: 누적 손익 차트 (만원 단위)
- **코인별 성과 분석**: 승률, 손익비, 평균 손익 통계
- **AI 패턴 인사이트**: 거래 유형별/시간대별 성과 분석
- **검색 기능**: globalFilter로 코인명 검색
- **버그 수정**: 날짜 필터 당일 23:59:59까지 포함
- **색상 통일**: 수익=빨강, 손실=파랑 (일봉 규칙)

**생성/수정 파일** (6개):
- `components/PerformanceTrendChart.tsx`, `CoinStatsTable.tsx`, `AIPatternAnalysis.tsx` (NEW)
- `components/AnalysisSummary.tsx`, `EnhancedTradesTable.tsx`, `app/analysis/page.tsx` (MODIFIED)

---

## 💼 Phase 4: Portfolio 페이지 (하이브리드 구성) 📋 계획 완료

> **목표**: AI CIO 전략 중심 포트폴리오 관리 페이지
> **핵심 전략**: 비용 Zero + cio_reports 중심 설계
> **예상 기간**: 2-3일
> **상태**: 📋 계획 수립 완료

### [2025-10-16 16:00] Phase 4 계획 수립 완료

**🎯 설계 원칙**:
- ❌ Supabase Realtime 구독 (비용 발생)
- ✅ SWR refreshInterval 전략 (5-60초, 비용 Zero)
- ✅ cio_reports 테이블 데이터를 시각적으로 표현
- ✅ 하이브리드 레이아웃 (전략 중심 + 포트폴리오 현황 + 실적 트렌드)

**📋 컴포넌트 설계** (7개):

#### Phase 4A - 필수 컴포넌트 (4개)

1. **CIOInsightBanner.tsx** (NEW)
   - 목적: 최신 AI CIO 전략 하이라이트 (상단 배너)
   - 데이터: cio_reports (report_date, title, cio_latest_rationale)
   - 새로고침: SWR 5초
   - UI: 그라디언트 배경 (indigo-500 → purple-600), 전략 200자 요약, 날짜 배지

2. **PerformanceGauge.tsx** (NEW)
   - 목적: 누적 수익률을 게이지 차트로 시각화
   - 데이터:
     * portfolio_summary (누적수익률, 일일수익률, 총순자산)
     * trade_history (승률 계산)
   - 새로고침: SWR 5초
   - UI: Recharts RadialBarChart (반원 게이지), 목표 10% 기준 색상 변경
   - 3개 지표 카드: 누적수익률, 승률, 일일수익률

3. **CIOSelfCritique.tsx** (NEW)
   - 목적: AI의 자가 평가를 3컬럼으로 시각화
   - 데이터: cio_reports (self_critique JSONB)
   - JSONB 구조 파싱:
     ```json
     {
       "strengths": ["강점 1", "강점 2"],
       "weaknesses": ["약점 1", "약점 2"],
       "lessons_learned": ["교훈 1", "교훈 2"]
     }
     ```
   - 새로고침: SWR 30초
   - UI: 3컬럼 그리드
     * Strengths: ✅ 초록 배경 (green-50)
     * Weaknesses: ⚠️ 노랑 배경 (yellow-50)
     * Lessons: 💡 파랑 배경 (blue-50)

4. **PortfolioComposition.tsx** (MODIFIED)
   - 목적: 현재 포트폴리오 구성 비율 (도넛 차트)
   - 데이터: portfolio_summary (원화잔고, 총코인가치)
   - 비율 계산: 원화 vs 코인 %
   - 새로고침: SWR 5초
   - UI: Recharts PieChart (도넛), 원화=파랑, 코인=빨강, 중앙에 총자산 표시

#### Phase 4B - 부가 컴포넌트 (3개)

5. **StrategyTimeline.tsx** (NEW)
   - 목적: 최근 7일 CIO 리포트를 타임라인으로 표시
   - 데이터: cio_reports (DAILY, 최근 7일, report_date, title, market_summary)
   - 새로고침: SWR 30초
   - UI: 세로 타임라인 (점선 + 원형 마커), 좌측 sticky, 클릭 시 펼침

6. **MarketOutlookCard.tsx** (NEW)
   - 목적: AI CIO의 시장 전망 표시
   - 데이터: cio_reports (outlook, report_date)
   - 새로고침: SWR 30초
   - UI: 그라디언트 카드 (amber-50 → orange-50), 전문 표시 (whitespace-pre-wrap)

7. **RecentReportsTable.tsx** (NEW)
   - 목적: 최근 리포트 목록 및 상세 보기
   - 데이터: cio_reports (최근 30일, report_date, report_type, title, full_content_md)
   - 새로고침: SWR 60초
   - UI: TanStack Table, DAILY/WEEKLY/MONTHLY 필터, 행 클릭 시 마크다운 모달
   - 필요 패키지: `react-markdown`, `remark-gfm`

**📐 레이아웃 구조**:
```
데스크톱 (lg 이상):
┌─────────────────────────────────────────┐
│ CIOInsightBanner (전체 너비)              │
└─────────────────────────────────────────┘
┌─────────────┬───────────────────────────┐
│ Strategy    │ PerformanceGauge (2컬럼)   │
│ Timeline    ├───────────────────────────┤
│ (1컬럼,     │ CIOSelfCritique (3컬럼)    │
│  sticky)    ├──────────┬────────────────┤
│             │ Market   │ Portfolio      │
│             │ Outlook  │ Composition    │
│             ├──────────┴────────────────┤
│             │ RecentReportsTable        │
└─────────────┴───────────────────────────┘

모바일 (sm 이하):
세로 스택 (CIOInsightBanner → PerformanceGauge →
          CIOSelfCritique → PortfolioComposition →
          MarketOutlook → StrategyTimeline →
          RecentReportsTable)
```

**⚙️ SWR 새로고침 전략**:
- **중요 데이터** (5초): CIOInsightBanner, PerformanceGauge, PortfolioComposition
- **일반 데이터** (30초): StrategyTimeline, MarketOutlookCard, CIOSelfCritique
- **리포트 목록** (60초): RecentReportsTable

**📦 필요 패키지**:
```bash
npm install react-markdown remark-gfm
```
(full_content_md 마크다운 렌더링용, 나머지는 이미 설치됨)

**🎨 데이터 소스**:
- **cio_reports** (주요):
  - report_date, report_type, title
  - cio_latest_rationale, outlook
  - market_summary, performance_review
  - self_critique (JSONB)
  - full_content_md
- **portfolio_summary**:
  - 누적수익률, 일일수익률
  - 원화잔고, 총코인가치, 총순자산
- **trade_history**:
  - 수익금 (승률 계산용)

**💡 기존 구성안 vs 개선안 비교**:

| 항목 | 기존 구성안 | 개선안 (하이브리드) |
|------|-------------|---------------------|
| **RealtimeStatusBanner** | Supabase Realtime 구독 (비용) | CIOInsightBanner (SWR 5초) |
| **PortfolioDonutChart** | 보유 자산 비중 | ✅ PortfolioComposition (유지, 원화 vs 코인) |
| **LiveHoldingsTable** | Realtime 보유 내역 | ❌ 제거 (Dashboard에 이미 존재) |
| **WeightComparisonChart** | 목표 vs 실제 비중 | ❌ 제거 (cio_reports에 데이터 없음) |
| **CIOInsightBanner** | - | ✅ 신규 (전략 하이라이트) |
| **StrategyTimeline** | - | ✅ 신규 (7일 리포트 타임라인) |
| **PerformanceGauge** | - | ✅ 신규 (수익률 게이지) |
| **CIOSelfCritique** | - | ✅ 신규 (AI 자가 평가) |
| **MarketOutlookCard** | - | ✅ 신규 (시장 전망) |
| **RecentReportsTable** | - | ✅ 신규 (리포트 목록 + 마크다운) |

**🔜 다음 작업**:
- Phase 4A 구현 시작: CIOInsightBanner, PerformanceGauge, CIOSelfCritique, PortfolioComposition

**📝 문서 업데이트**:
- ✅ DASHBOARD_GUIDE.md 업데이트 (Phase 4 상세 설계)
- ✅ DASHBOARD_CHANGELOG.md 업데이트 (Phase 4 계획 기록)

---

### [2025-10-16 18:00] Phase 4A 완료 ✅

**✅ 완료 항목**:
- [x] 4A.1. react-markdown, remark-gfm 패키지 설치
- [x] 4A.2. CIOInsightBanner.tsx 생성 (최신 전략 배너)
- [x] 4A.3. PerformanceGauge.tsx 생성 (수익률 게이지 차트)
- [x] 4A.4. CIOSelfCritique.tsx 생성 (AI 자가 평가 3컬럼)
- [x] 4A.5. PortfolioComposition.tsx 생성 (도넛 차트)
- [x] 4A.6. PortfolioDateSelector.tsx 생성 (날짜 선택기)
- [x] 4A.7. portfolio/page.tsx 레이아웃 구성 (필수 컴포넌트 통합)
- [x] 4A.8. Context API 제거 및 Props 기반 아키텍처로 전환
- [x] 4A.9. Supabase timestamp 쿼리 버그 수정
- [x] 4A.10. 배포 준비 완료

**📝 생성된 파일** (5개):
1. `components/CIOInsightBanner.tsx` - AI CIO 최신 전략 배너
2. `components/PerformanceGauge.tsx` - 누적 수익률 게이지 차트
3. `components/CIOSelfCritique.tsx` - AI 자가 평가 (강점/약점/교훈)
4. `components/PortfolioComposition.tsx` - 포트폴리오 구성 도넛 차트
5. `components/PortfolioDateSelector.tsx` - 날짜 선택 컴포넌트

**📝 수정된 파일**:
- `app/portfolio/page.tsx` - 4개 컴포넌트 통합, useState 날짜 관리
- `package.json` / `package-lock.json` - react-markdown, remark-gfm 추가

**🎨 주요 기능**:

#### 1. CIOInsightBanner
- AI CIO의 최신 전략을 시각적으로 하이라이트
- 그라디언트 배경 (indigo → purple)
- 전략 내용 요약 (200자) + "전체 내용 보기" 토글 버튼
- useState로 확장/축소 기능 구현
- SWR 5초 간격 새로고침

```typescript
const [showFullContent, setShowFullContent] = useState(false);
const displayContent = showFullContent ? data.rationale : shortRationale;

<button onClick={() => setShowFullContent(!showFullContent)}>
  {showFullContent ? '← 간략히 보기' : '전체 내용 보기 →'}
</button>
```

#### 2. PerformanceGauge
- Recharts RadialBarChart로 누적 수익률 게이지 시각화
- 0-100% 범위, 목표 10% 기준으로 색상 변경
- 3개 지표 카드: 누적수익률, 승률, 일일수익률
- 만원 단위 표시로 Dashboard와 통일
- portfolio_summary + trade_history 데이터 통합

```typescript
// 승률 계산
const recentTrades = await supabase
  .from('trade_history')
  .select('수익금')
  .gte('거래일시', thirtyDaysAgo.toISOString())
  .not('수익금', 'is', null);

const closedTrades = recentTrades.data?.filter(
  (t: { 수익금: number | null }) => t.수익금 !== null && t.수익금 !== 0
) || [];

const wins = closedTrades.filter((t: { 수익금: number }) => t.수익금 > 0).length;
const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
```

#### 3. CIOSelfCritique
- AI의 자가 평가를 3컬럼으로 시각화
- 강점 (✅ 초록), 약점 (⚠️ 노랑), 교훈 (💡 파랑)
- react-markdown으로 마크다운 렌더링
- SWR 30초 간격 새로고침

```typescript
interface SelfCritique {
  best_decision: string;
  areas_for_improvement: string;
  strategy_consistency: string;
}

// 마크다운 렌더링
<ReactMarkdown remarkPlugins={[remarkGfm]}>
  {data.best_decision}
</ReactMarkdown>
```

#### 4. PortfolioComposition
- 원화 vs 코인 비율 도넛 차트 (Recharts PieChart)
- 중앙에 총자산 표시 (absolute positioning)
- 하단 Legend에 개별 금액 표시 (원화 303만원, 코인 44만원)
- 상세 정보 카드 2개 (파랑 배경 원화, 빨강 배경 코인)

```typescript
<Legend
  verticalAlign="bottom"
  formatter={(value, entry: any) => {
    const itemData = chartData.find(d => d.name === entry.value);
    return (
      <span className="text-sm text-slate-700">
        {value} {itemData ? `${(itemData.value / 10000).toFixed(1)}만원` : ''}
      </span>
    );
  }}
/>

{/* 중앙 총자산 표시 */}
<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
  <div className="text-2xl font-bold">{(data.totalAsset / 10000).toFixed(0)}</div>
  <div className="text-xs text-slate-500">총자산 (만원)</div>
</div>
```

#### 5. PortfolioDateSelector
- input type="date"로 날짜 선택 (Analysis 탭과 동일한 UX)
- 최대 날짜: 오늘 (max 속성)
- date-fns로 날짜 포맷팅

```typescript
<input
  type="date"
  value={format(selectedDate, 'yyyy-MM-dd')}
  onChange={(e) => onDateChange(new Date(e.target.value))}
  max={format(new Date(), 'yyyy-MM-dd')}
  className="px-4 py-2 border rounded-lg"
/>
```

**🐛 해결된 주요 문제들**:

#### 1. Context API 의존성 제거
**문제**: 모든 컴포넌트가 존재하지 않는 `usePortfolioDate()` Context를 사용
**해결**: Props 기반 아키텍처로 전환
```typescript
// Before
const { selectedDate } = usePortfolioDate();

// After
export function PerformanceGauge({ selectedDate }: { selectedDate: Date }) {
  // ...
}
```

#### 2. Supabase 406 Not Acceptable 에러
**문제**: PostgREST가 Korean column names + `.single()`을 처리하지 못함
**해결**: `.limit(1)` + 배열 접근으로 변경
```typescript
// Before
.eq('날짜', dateString).single()

// After
.eq('날짜', dateString).limit(1)
const data = rawDataArray[0];
```

#### 3. Invalid Time Value 에러
**문제**: SSR/CSR 불일치로 date 초기화 전 format() 호출
**해결**: 날짜 유효성 검증 추가
```typescript
const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
  ? format(selectedDate, 'yyyy-MM-dd')
  : 'invalid-date';
```

#### 4. Timestamp vs Date 비교 실패 (CRITICAL)
**문제**: `portfolio_summary.날짜`가 `timestamp with time zone` 타입
- 저장 형식: `2025-10-15T15:08:38.625661+00:00`
- 쿼리: `.eq('날짜', '2025-10-15')` → 매치 실패
**해결**: 날짜 범위 쿼리로 변경
```typescript
const dateString = format(selectedDate, 'yyyy-MM-dd');
const startOfDay = `${dateString}T00:00:00`;
const endOfDay = `${dateString}T23:59:59`;

const { data } = await supabase
  .from('portfolio_summary')
  .select('*')
  .gte('날짜', startOfDay)
  .lte('날짜', endOfDay)
  .order('날짜', { ascending: false })
  .limit(1);
```

#### 5. Legend 표시 오류
**문제**: 모든 legend 항목이 "총자산 347만원"으로 표시
**해결**: Legend를 차트 하단으로 이동 + formatter로 개별 값 표시
```typescript
// Before: Legend가 중앙에 총자산만 표시
<Legend formatter={() => <div>총자산 {total}만원</div>} />

// After: Legend를 하단으로, formatter에서 개별 값 계산
<Legend
  verticalAlign="bottom"
  formatter={(value, entry) => {
    const itemData = chartData.find(d => d.name === entry.value);
    return `${value} ${itemData?.value / 10000}만원`;
  }}
/>
```

**📐 레이아웃 구조**:
```
portfolio/page.tsx:
├── PortfolioDateSelector (날짜 선택)
├── CIOInsightBanner (전체 너비)
├── 2컬럼 그리드
│   ├── PerformanceGauge (좌측)
│   └── PortfolioComposition (우측)
└── CIOSelfCritique (전체 너비, 3컬럼)
```

**⚙️ 기술 구현**:
- **상태 관리**: useState로 selectedDate 관리 (Context 제거)
- **데이터 패칭**: SWR (5초/30초 간격 새로고침)
- **날짜 처리**: date-fns (format, isValid 등)
- **차트**: Recharts (RadialBarChart, PieChart)
- **마크다운**: react-markdown + remark-gfm
- **Props Drilling**: portfolio/page.tsx → 4개 컴포넌트에 selectedDate 전달

**✅ 검증 완료**:
- ✅ 날짜 선택기 정상 작동 (input type="date")
- ✅ CIO 배너 확장/축소 버튼 정상 작동
- ✅ 성과 게이지 데이터 정상 표시 (누적수익률, 승률, 일일수익률)
- ✅ AI 자가 평가 마크다운 렌더링 정상
- ✅ 포트폴리오 구성 차트 + Legend 정상 표시 (총자산 347만, 원화 303만, 코인 44만)
- ✅ 날짜별 데이터 필터링 정상 (2025-10-15, 2025-10-16 등)
- ✅ Timestamp 범위 쿼리 정상 작동
- ✅ 로컬 개발 서버 에러 없음 (HMR 정상)

**📊 개선 효과**:
- **AI CIO 전략 가시성**: 최신 전략을 시각적으로 하이라이트
- **성과 한눈에 파악**: 게이지 차트로 직관적인 수익률 확인
- **투명한 AI**: 자가 평가로 AI의 의사결정 과정 공개
- **포트폴리오 비율 파악**: 원화/코인 비율을 도넛 차트로 시각화
- **날짜별 비교**: 날짜 선택기로 과거 데이터 조회 가능

**🎯 사용자 피드백 반영**:
1. ✅ "성과게이지 포트폴리오구성 데이터가 안나와" → Timestamp 범위 쿼리로 해결
2. ✅ "날짜선택을 드롭박스로 하면 100개가 생긴다" → input type="date"로 변경
3. ✅ "전체보기 button 반응이 없어" → useState 토글 기능 구현
4. ✅ "legend 표시가 의도한바와 맞지않아" → Legend formatter 수정

**📦 추가된 패키지**:
```json
{
  "react-markdown": "^9.0.1",
  "remark-gfm": "^4.0.0"
}
```

**🔜 다음 작업**:
- Phase 4B: StrategyTimeline, MarketOutlookCard, RecentReportsTable 구현 (선택 사항)
- 또는 Phase 5: 외부 통합 (TradingView, Alternative.me API)

---

### 작업 체크리스트

**Phase 4A - 필수 컴포넌트** ✅:
- [x] 4A.1. react-markdown, remark-gfm 패키지 설치
- [x] 4A.2. CIOInsightBanner.tsx 생성 (최신 전략 배너)
- [x] 4A.3. PerformanceGauge.tsx 생성 (수익률 게이지 차트)
- [x] 4A.4. CIOSelfCritique.tsx 생성 (AI 자가 평가 3컬럼)
- [x] 4A.5. PortfolioComposition.tsx 생성 (도넛 차트)
- [x] 4A.6. PortfolioDateSelector.tsx 생성 (날짜 선택기)
- [x] 4A.7. portfolio/page.tsx 레이아웃 구성 (필수 컴포넌트 통합)
- [x] 4A.8. Context API 제거 및 Props 기반 전환
- [x] 4A.9. Timestamp 쿼리 버그 수정
- [x] 4A.10. 로컬 테스트 완료 (에러 없음)

**Phase 4B - 부가 컴포넌트**:
- [ ] 4B.1. StrategyTimeline.tsx 생성 (7일 리포트 타임라인)
- [ ] 4B.2. MarketOutlookCard.tsx 생성 (시장 전망 카드)
- [ ] 4B.3. RecentReportsTable.tsx 생성 (리포트 목록 + 마크다운 모달)
- [ ] 4B.4. portfolio/page.tsx 최종 레이아웃 (7개 컴포넌트 통합)
- [ ] 4B.5. 반응형 테스트 (모바일, 태블릿, 데스크톱)
- [ ] 4B.6. 빌드 + 배포 (최종)

---

## 🌐 Phase 5: 외부 통합

> **목표**: TradingView 차트 등 외부 서비스 통합
> **예상 기간**: 2-3일
> **상태**: 대기 중

### 작업 체크리스트
- [ ] 5.1. Lightweight Charts 설치
- [ ] 5.2. TradingViewWidget.tsx 생성
- [ ] 5.3. 실시간 BTC 차트 연동
- [ ] 5.4. Alternative.me API 연동 (공포탐욕)
- [ ] 5.5. CoinGecko API 연동 (BTC 도미넌스)
- [ ] 5.6. API Routes 프록시 생성
- [ ] 5.7. 빌드 + 배포

---

## ✨ Phase 6: UX 개선

> **목표**: 사용자 경험 극대화
> **예상 기간**: 2-3일
> **상태**: 대기 중

### 작업 체크리스트
- [ ] 6.1. Framer Motion 통합
- [ ] 6.2. 페이지 전환 애니메이션
- [ ] 6.3. react-hot-toast 설치
- [ ] 6.4. 알림 시스템 구현
- [ ] 6.5. Skeleton UI 개선
- [ ] 6.6. 다크모드 (선택)
- [ ] 6.7. 최종 빌드 + 배포

---

## 📊 개발 통계

### Phase별 진행률
| Phase | 상태 | 진행률 | 시작일 | 완료일 | 소요 시간 |
|-------|------|--------|--------|--------|-----------|
| Phase 0 | ✅ 완료 | 100% | 2025-10-14 | 2025-10-14 | 2시간 |
| Phase 1 | ✅ 완료 | 100% | 2025-10-15 | 2025-10-15 | 2시간 |
| Phase 2 | ✅ 완료 | 100% | 2025-10-15 | 2025-10-15 | 1.5시간 |
| Phase 3 | ✅ 완료 | 100% | 2025-10-15 | 2025-10-15 | 3시간 |
| Dashboard 개선 | ✅ 완료 | 100% | 2025-10-16 | 2025-10-16 | 3시간 |
| Analysis 개선 | ✅ 완료 | 100% | 2025-10-16 | 2025-10-16 | 3시간 |
| Phase 4 계획 | ✅ 완료 | 100% | 2025-10-16 | 2025-10-16 | 0.5시간 |
| Phase 4A | ⏳ 대기 | 0% | - | - | - |
| Phase 4B | ⏳ 대기 | 0% | - | - | - |
| Phase 5 | ⏳ 대기 | 0% | - | - | - |
| Phase 6 | ⏳ 대기 | 0% | - | - | - |

**전체 진행률**: 70% (Phase 0-3 + 개선 2회 + Phase 4 계획 완료, Phase 4 구현 + 5-6 남음)

---

## 🔧 기술 부채 & 개선사항

### 발견된 이슈
*현재 없음*

### 향후 개선 필요
1. **Phase 3**: 코인별 필터링 기능 추가 (filterStore에 `setSelectedCoins` 준비됨)
2. **Phase 3**: 승률/손익비 계산 로직 검증 필요 (현재 간단한 계산)
3. **전체**: 에러 바운더리 추가 고려

---

## 📚 참고 사항

### 중요한 결정 사항
1. **페이지 구조**: 3페이지로 분리 (Dashboard, Analysis, Portfolio)
2. **상태 관리**: Zustand 사용 (필터 상태)
3. **실시간 업데이트**: Portfolio 페이지만 Realtime 구독
4. **테이블 라이브러리**: TanStack Table v8

### 주의사항
1. 기존 `/page.tsx`는 보존하여 안전장치 확보
2. 모든 컴포넌트는 재사용 가능하도록 설계
3. 성능 최적화 우선 (React.memo, useMemo 적극 활용)

---

**📌 이 문서는 매 작업마다 즉시 업데이트해야 합니다.**

**최종 업데이트**: 2025-10-22 19:00

---

## 🎨 UX 개선 및 한글화 (2025-10-22)

**✅ 완료 항목**:
- [x] 로고 영역 홈 버튼 변환 (Navigation 컴포넌트)
- [x] 분석 탭 기본 기간 7일(1주일)로 변경
- [x] 빠른 링크 실용적인 사이트로 교체 (4개)
- [x] 시장 상황 표시 한글 전문 용어로 개선
- [x] 거래 유형 색상 통일 (손익 기반 동적 색상)
- [x] 모바일 친화적 툴팁 추가 (모든 지표)
- [x] '청산' 용어 제거 및 실제 데이터 기반 로직 수정

**📝 주요 개선사항**:

### 1. Navigation - 로고 홈 버튼 (Navigation.tsx)
- "코인먹는AI" 로고 클릭 시 /dashboard로 이동
- hover:opacity-80 효과 추가
- 직관적인 네비게이션 UX 개선

### 2. 분석 기간 설정 최적화 (filterStore.ts)
- 기본 날짜 범위: 30일 → 7일(1주일)
- 최근 데이터 중심 분석으로 성능 개선
- 모바일 사용자 고려한 데이터량 최적화

### 3. 빠른 링크 실용성 개선 (QuickLinksCard.tsx)
- **기존**: Upbit, Binance, CoinDesk, CoinTelegraph, TradingView, CoinGecko
- **변경**:
  - 시장 데이터: CoinMarketCap, Investing.com
  - 경제 지표: 한국은행 경제통계, Fear & Greed Index
- 트레이딩에 실질적으로 도움되는 사이트로 교체

### 4. 시장 상황 한글 전문 용어 개선 (MarketRegimeBadge.tsx)
- **용어 변경 및 설명 추가**:
  - Bull_Market → 🚀 강세장 (상승장 → 강세장)
  - Bear_Market → 📉 약세장 (하락장 → 약세장)
  - Range_Bound → 📊 박스권 (횡보장 → 박스권)
  - Uptrend → 📈 상승세 (상승추세 → 상승세)
  - Downtrend → 📉 하락세 (하락추세 → 하락세)
  - Sideways → ➡️ 보합세 (횡보 → 보합세)
- 금융 전문 용어 사용으로 신뢰성 향상
- 용어 변천 과정 표시로 교육적 효과

### 5. 거래 유형 색상 통일 및 동적 색상 결정
**EnhancedTradesTable.tsx, RecentTradesTable.tsx**:
- 기존: 거래 유형 키워드 기반 정적 색상 (부분손절 항상 빨강)
- 개선: 실제 손익 값 기반 동적 색상
  - 손익 > 0: bg-red-100 (수익)
  - 손익 < 0: bg-blue-100 (손실)
  - 손익 = 0: bg-slate-100 (무손익)
  - 매수: bg-green-100 (초록)
- 전량매도의 경우 손익에 따라 색상 자동 결정

**손익 컬럼 색상 코딩**:
- 양수 (+): text-red-600 (수익)
- 음수 (-): text-blue-600 (손실)
- 0: text-slate-900 (무손익)

### 6. 모바일 친화적 툴팁 추가
**SystemMetricsCard.tsx** (4개 지표):
- 승률: "수익 거래 비율"
- 손익비: "총이익 ÷ 총손실"
- 24h 거래: "최근 24시간 거래"
- 평균 보유: "매수~매도 평균일"

**AnalysisSummary.tsx** (4개 지표):
- 총 거래: "매도 완료 거래 수"
- 총 손익: "실현 수익 합계"
- 승률: "수익 거래 비율"
- 손익비: "총이익 ÷ 총손실"

**Dashboard 섹션 설명**:
- 총순자산 추이: "일별 포트폴리오 가치 변화"
- 보유자산현황: "현재 보유 중인 코인 목록 및 수익률"

**Analysis 섹션 설명** (5개):
- 자산별 실현 손익: "코인별 누적 수익/손실"
- 기간별 누적 손익 추이: "일별 손익 누적 그래프"
- 코인별 상세 통계: "코인별 거래 횟수, 승률, 평균 손익"
- AI 매매 패턴 분석: "거래 유형별 성과 및 시간대 분석"
- 상세 거래 내역: "거래별 AI 사고 과정 및 지표"

**특징**:
- 모든 툴팁 text-[10px] 크기 (모바일 최적화)
- 3-5단어 이내 간결한 설명
- 핵심만 전달하는 명확한 표현

### 7. '청산' 용어 검증 및 수정
**문제**: 코드에 '청산' 키워드가 사용되었으나 실제 DB에 존재하지 않음

**데이터베이스 실제 거래 유형** (6개만 존재):
- 신규매수, 추가매수
- 부분익절, 전량익절
- 부분손절, 전량매도

**수정된 파일** (5개):
1. **SystemMetricsCard.tsx (line 91)**:
   - 평균 보유기간 계산에 '매도' 키워드 추가
   - 전량매도 거래도 평균 보유 기간 계산에 포함

2. **SystemMetricsCard.tsx (line 156)**:
   - tooltip: "매수~청산 평균" → "매수~매도 평균일"

3. **AnalysisSummary.tsx (line 55)**:
   - tooltip: "청산 완료 거래 수" → "매도 완료 거래 수"

4. **analysis/page.tsx (line 125)**:
   - 필터: ['익절', '손절', '매도', '청산'] → ['익절', '손절', '매도']

5. **EnhancedTradesTable.tsx, RecentTradesTable.tsx**:
   - 색상 로직에서 '청산' 제거
   - '익절', '손절', '매도' 키워드만 사용

**개선 효과**:
- 실제 데이터와 완전히 일치하는 로직
- 전량매도 거래 누락 없이 정확한 통계 계산
- 유지보수성 향상 (실제 존재하는 값만 참조)

**수정된 파일** (총 9개):
- `components/Navigation.tsx` - 로고 홈 버튼
- `lib/store/filterStore.ts` - 기본 기간 7일
- `components/QuickLinksCard.tsx` - 빠른 링크 4개
- `components/MarketRegimeBadge.tsx` - 한글 전문 용어
- `components/EnhancedTradesTable.tsx` - 동적 색상 + 청산 제거
- `components/RecentTradesTable.tsx` - 동적 색상 + 청산 제거
- `components/SystemMetricsCard.tsx` - 툴팁 + 청산→매도
- `components/AnalysisSummary.tsx` - 툴팁 + 청산→매도
- `app/analysis/page.tsx` - 섹션 설명 + 청산 제거

**📊 개선 효과**:
- **UX 향상**: 로고 클릭 홈 이동, 직관적인 네비게이션
- **모바일 최적화**: 10px 툴팁, 7일 기본 기간
- **실용성**: 트레이딩에 실질적 도움되는 사이트 링크
- **전문성**: 금융 전문 용어 사용 (강세장/약세장/박스권)
- **정확성**: 실제 DB 데이터와 완전히 일치하는 로직
- **직관성**: 손익 기반 동적 색상으로 한눈에 파악
- **교육성**: 용어 변천 표시로 학습 효과

---

**최종 업데이트**: 2025-10-22 19:00

---

## 🎉 주요 성과

### Phase 1-3 완료 (2025-10-15)
- **하루만에 3개 Phase 완료** (Phase 1, 2, 3)
- **3개 페이지 구조 완성**: Dashboard, Analysis, Portfolio
- **5개 Dashboard 컴포넌트** 생성 및 통합
- **5개 Analysis 컴포넌트** 생성 (TanStack Table, Zustand)
- **총 11개 파일** 생성/수정
- **빌드 시간**: 9.8초
- **배포 성공**: https://aitrade-liard.vercel.app

### Dashboard 데이터 정합성 개선 (2025-10-16)
- **하드코딩 제거 완료**: 시장 지표, 평균 보유기간 실제 데이터로 전환
- **7개 주요 개선 항목** 완료
- **9개 파일** 수정
- **실시간 데이터 통합**: 공포탐욕지수, BTC도미넌스, 김치프리미엄
- **포맷 표준화**: 통화(원), 날짜/시간(yyyy-MM-dd HH:mm:ss)
- **차트 개선**: 수익률 → 총순자산 만원 단위 표시
- **버그 수정**: Y축 0원 표시 오류 해결

### Analysis 탭 전면 개선 (2025-10-16)
- **3개 신규 컴포넌트 생성**: PerformanceTrendChart, CoinStatsTable, AIPatternAnalysis
- **8개 주요 개선 항목** 완료
- **6개 파일** 생성/수정 (3개 NEW, 3개 MODIFIED)
- **기간별 추이 시각화**: 누적 손익 차트 (만원 단위)
- **코인별 상세 분석**: 승률, 손익비, 평균 손익 통계 테이블
- **AI 패턴 인사이트**: 거래 유형별/시간대별 성과 분석
- **검색 기능 추가**: globalFilter로 코인명 실시간 검색
- **UX 개선**: 손익 색상 통일 (수익=빨강, 손실=파랑)
- **버그 수정**: 날짜 필터 당일 데이터 미표시 문제 해결

### 기술 스택 도입
- ✅ TanStack Table v8 - 고급 테이블 기능
- ✅ Zustand - 경량 상태 관리
- ✅ Recharts - 데이터 시각화
- ✅ date-fns - 날짜 처리
- ⏳ Supabase Realtime (Phase 4 예정)
- ⏳ Lightweight Charts (Phase 5 예정)
- ⏳ Framer Motion (Phase 6 예정)


## 🎬 YouTube & 방문자 카운터 (2025-10-16)

**✅ 완료 항목**:
- [x] 유튜브 채널 배너 추가 (상단 빨간색 그라디언트)
- [x] QuickLinksCard에 유튜브 링크 추가 (콘텐츠 카테고리)
- [x] 방문자 카운터 구현 (system_status 테이블 + RPC 함수)
- [x] 세션 기반 중복 방지 (sessionStorage)

**📝 주요 변경사항**:
- **YouTube 배너**: https://www.youtube.com/@코인먹는AI 링크 연결
- **RPC 함수**: `increment_page_view()`, `get_page_view_count()` 생성
- **커스텀 훅**: `usePageViewCounter.ts` - 자동 카운트 + 중복 방지

**생성/수정 파일**:
- `dashboard/app/dashboard/page.tsx` - 배너 + 카운터 UI
- `dashboard/components/QuickLinksCard.tsx` - 콘텐츠 카테고리
- `dashboard/lib/hooks/usePageViewCounter.ts` - 카운터 훅
- `migration_temp/add_page_view_counter.sql` - RPC 함수

---

