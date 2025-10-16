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

## 🔧 Dashboard Data & Display Improvements (2025-10-16)

> **목표**: Dashboard 페이지 데이터 정합성 및 표시 개선
> **실제 기간**: 반나절 (2025-10-16)
> **상태**: ✅ 완료

### [2025-10-16 11:06] Dashboard 개선 작업 완료

**✅ 완료 항목**:
- [x] 1. MarketIndicators 실시간 데이터 통합
- [x] 2. SystemMetricsCard 평균 보유기간 실제 계산
- [x] 3. 통화 포맷 표준화 (₩ 제거, "원" 사용)
- [x] 4. 날짜/시간 포맷 표준화 (yyyy-MM-dd HH:mm:ss)
- [x] 5. PerformanceChart 수익률 → 총순자산 전환
- [x] 6. 차트 단위 만원 변환
- [x] 7. Y축 표시 버그 수정

**📝 개선 상세 내역**:

#### 1. MarketIndicators 실시간 데이터 통합
**파일**: `components/MarketIndicators.tsx`

**기존**: 하드코딩된 임시 데이터 사용
```typescript
const fearGreedIndex = 65;
const btcDominance = 52.3;
const kimchiPremium = 0.8;
```

**개선**: Supabase system_status 테이블에서 실시간 조회
```typescript
async function fetchMarketIndicators(): Promise<MarketData> {
  const { data: fearGreed } = await supabase
    .from('system_status')
    .select('status_value')
    .eq('status_key', 'fear_greed_index')
    .single();

  const { data: btcDom } = await supabase
    .from('system_status')
    .select('status_value')
    .eq('status_key', 'btc_dominance')
    .single();

  const { data: kimchi } = await supabase
    .from('system_status')
    .select('status_value')
    .eq('status_key', 'kimchi_premium')
    .single();

  const fearGreedIndex = fearGreed ? parseInt(fearGreed.status_value) : 50;
  const btcDominance = btcDom ? parseFloat(btcDom.status_value) : 50;
  const kimchiPremium = kimchi ? parseFloat(kimchi.status_value) : 0;

  // 동적 라벨 생성
  let fearGreedLabel = '중립';
  if (fearGreedIndex < 25) fearGreedLabel = '극단적 공포';
  else if (fearGreedIndex < 45) fearGreedLabel = '공포';
  else if (fearGreedIndex < 55) fearGreedLabel = '중립';
  else if (fearGreedIndex < 75) fearGreedLabel = '탐욕';
  else fearGreedLabel = '극단적 탐욕';

  return { fearGreedIndex, fearGreedLabel, btcDominance, kimchiPremium };
}

export function MarketIndicators() {
  const { data, isLoading } = useSWR<MarketData>(
    'market-indicators',
    fetchMarketIndicators,
    { refreshInterval: 60000 } // 1분마다 갱신
  );
}
```

**효과**: process1에서 5분 간격으로 수집된 최신 시장 지표를 실시간 반영

#### 2. SystemMetricsCard 평균 보유기간 실제 계산
**파일**: `components/SystemMetricsCard.tsx`

**기존**: 하드코딩된 값 `"2.3일"`

**개선**: 매수-청산 페어 매칭 알고리즘으로 실제 계산
```typescript
// 평균 보유 기간 계산 (매수 후 청산까지)
const { data: allTradesWithType } = await supabase
  .from('trade_history')
  .select('코인이름, 거래유형, 거래일시')
  .gte('거래일시', thirtyDaysAgo.toISOString())
  .order('거래일시', { ascending: true });

let totalHoldingHours = 0;
let pairCount = 0;
const buyTrades: Record<string, string> = {};

if (allTradesWithType) {
  for (const trade of allTradesWithType as unknown as Array<{
    코인이름: string;
    거래유형: string;
    거래일시: string
  }>) {
    if (trade.거래유형.includes('매수')) {
      buyTrades[trade.코인이름] = trade.거래일시;
    } else if (
      (trade.거래유형.includes('익절') || trade.거래유형.includes('손절')) &&
      buyTrades[trade.코인이름]
    ) {
      const buyTime = new Date(buyTrades[trade.코인이름]).getTime();
      const sellTime = new Date(trade.거래일시).getTime();
      const holdingHours = (sellTime - buyTime) / (1000 * 60 * 60);
      totalHoldingHours += holdingHours;
      pairCount++;
      delete buyTrades[trade.코인이름];
    }
  }
}

const avgHoldingTime = pairCount > 0
  ? `${(totalHoldingHours / pairCount / 24).toFixed(1)}일`
  : '-';
```

**효과**: 실제 매수-청산 데이터 기반 정확한 평균 보유기간 표시

#### 3. 통화 포맷 표준화
**파일**: `lib/utils/formatters.ts`, 다수의 컴포넌트

**개선 사항**:
- 상세 테이블(보유자산현황, 거래내역): ₩ 제거, 숫자만 표시
- 요약 카드(포트폴리오 요약): "원" 단위 표시

```typescript
// 상세 테이블용 - 통화 기호 없음
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value));
}

// 요약 카드용 - '원' 접미사 포함
export function formatCurrencyWithUnit(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원';
}
```

**적용 파일**:
- `components/PortfolioSummaryCard.tsx` - formatCurrencyWithUnit 사용
- `components/HoldingsTable.tsx` - formatCurrency 사용
- `components/RecentTradesTable.tsx` - formatCurrency 사용
- `components/EnhancedTradesTable.tsx` - formatCurrency 사용

#### 4. 날짜/시간 포맷 표준화
**파일**: `lib/utils/formatters.ts`, 관련 컴포넌트

**개선**: 모든 날짜/시간 표시를 `yyyy-MM-dd HH:mm:ss` 형식으로 통일

```typescript
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'yyyy-MM-dd');
}
```

**기존 표시**: `2025-10-15T23:54:57.579711+00:00`
**개선 표시**: `2025-10-15 23:54:57`

#### 5. PerformanceChart 수익률 → 총순자산 전환
**파일**: `components/PerformanceChartEnhanced.tsx`, `app/dashboard/page.tsx`

**기존**: "누적수익률 추이" - 백분율 그래프
**개선**: "총순자산 추이" - 절대 금액 그래프 (만원 단위)

```typescript
interface ChartData {
  date: string;
  총자산: number;
  수익률: number;
}

useEffect(() => {
  async function fetchInitialAsset() {
    const { data: statusData } = await supabase
      .from('system_status')
      .select('status_value')
      .eq('status_key', 'initial_total_asset')
      .single();

    if (statusData?.status_value) {
      setInitialAsset(parseFloat(statusData.status_value));
    }
  }

  fetchInitialAsset();
}, []);

// 1일 기준으로 데이터 그룹핑 (날짜별 마지막 값만 사용)
const dailyData = new Map<string, { asset: number, date: string }>();

data.forEach((item) => {
  const dateKey = item.날짜.split('T')[0]; // YYYY-MM-DD 형식
  const currentAsset = item.총포트폴리오가치 || item.총순자산;

  // 같은 날짜의 데이터가 있으면 더 최근 것으로 업데이트
  if (!dailyData.has(dateKey) || item.날짜 > (dailyData.get(dateKey)?.date || '')) {
    dailyData.set(dateKey, { asset: currentAsset, date: item.날짜 });
  }
});
```

**차트 제목 변경**:
- Dashboard 페이지: `📊 누적수익률 추이` → `📊 총순자산 추이`

#### 6. 차트 단위 만원 변환
**파일**: `components/PerformanceChartEnhanced.tsx`

**기존**: 백만원(M) 단위
**개선**: 만원 단위 표시

```typescript
// 총자산을 만원 단위로 변환
const chartDataInManwon = chartData.map(item => ({
  date: item.date,
  총자산만원: Math.round(item.총자산 / 10000),
  총자산원본: item.총자산,
  수익률: item.수익률,
}));

const initialAssetManwon = Math.round(initialAsset / 10000);

<YAxis
  tickFormatter={formatYAxis}
  label={{
    value: '총자산 (만원)',
    angle: -90,
    position: 'insideLeft',
    style: { fontSize: 12 }
  }}
/>
<ReferenceLine
  y={initialAssetManwon}
  stroke="#94a3b8"
  strokeDasharray="3 3"
  label={{ value: '초기자산', position: 'right', fontSize: 10, fill: '#64748b' }}
/>
<Line
  type="monotone"
  dataKey="총자산만원"
  stroke="#2563eb"
  strokeWidth={2}
/>
```

**표시 예시**:
- 초기 자산: 10,000,000원 → 1,000만원
- 2025-10-14: 10,000,000원 → 1,000만원
- 2025-10-15: 5,000,000원 → 500만원
- 2025-10-16: 8,000,000원 → 800만원

#### 7. Y축 표시 버그 수정
**파일**: `components/PerformanceChartEnhanced.tsx`

**문제**: Y축이 모두 0으로 표시됨

**원인**: formatYAxis 함수에서 이미 만원 단위로 변환된 값을 다시 10000으로 나눔
```typescript
// 버그 코드
const formatYAxis = (value: number) => {
  const manwon = Math.round(value / 10000);  // 중복 변환
  return `${manwon.toLocaleString('ko-KR')}`;
};
```

**수정**: 이미 변환된 값을 그대로 포맷팅
```typescript
// 수정된 코드
const formatYAxis = (value: number) => {
  return `${Math.round(value).toLocaleString('ko-KR')}`;
};
```

**효과**: Y축에 정확한 만원 단위 값 표시 (예: 1,000, 500, 800)

**✅ 검증 완료**:
- ✅ MarketIndicators 실시간 데이터 업데이트 (60초 간격)
- ✅ SystemMetricsCard 평균 보유기간 정확한 계산
- ✅ 모든 통화 포맷 통일 (상세: 숫자만, 요약: 원 포함)
- ✅ 모든 날짜/시간 표시 통일 (yyyy-MM-dd HH:mm:ss)
- ✅ PerformanceChart 총순자산 만원 단위 표시
- ✅ Y축 만원 값 정확히 표시
- ✅ 로컬 테스트 정상 작동 (localhost:3000)

**📊 개선 효과**:
- 시장 지표: 5분마다 최신 데이터 자동 반영
- 시스템 성과: 실제 데이터 기반 정확한 지표
- 사용자 경험: 일관된 포맷으로 가독성 향상
- 데이터 신뢰도: 하드코딩 제거로 정합성 확보

**수정된 파일** (총 9개):
- `components/MarketIndicators.tsx`
- `components/SystemMetricsCard.tsx`
- `components/PerformanceChartEnhanced.tsx`
- `components/PortfolioSummaryCard.tsx`
- `components/HoldingsTable.tsx`
- `components/RecentTradesTable.tsx`
- `components/EnhancedTradesTable.tsx`
- `lib/utils/formatters.ts`
- `app/dashboard/page.tsx`

---

## 📊 Analysis Tab Comprehensive Enhancement (2025-10-16)

> **목표**: Analysis 탭 완전 개선 - 기간별 추이, AI 패턴 분석, 코인별 통계, 검색 기능
> **실제 기간**: 반나절 (2025-10-16)
> **상태**: ✅ 완료

### [2025-10-16 15:00] Analysis 탭 전면 개선 완료

**✅ 완료 항목**:
- [x] 1. PerformanceTrendChart 컴포넌트 생성 (기간별 누적 손익 추이)
- [x] 2. CoinStatsTable 컴포넌트 생성 (코인별 상세 통계)
- [x] 3. AIPatternAnalysis 컴포넌트 생성 (AI 매매 패턴 분석)
- [x] 4. EnhancedTradesTable 검색 기능 추가
- [x] 5. AnalysisSummary 카드 레이아웃 개선
- [x] 6. 날짜 필터 버그 수정 (당일 데이터 미표시 문제)
- [x] 7. 손익 색상 통일 (수익=빨강, 손실=파랑)
- [x] 8. Analysis 페이지 레이아웃 재구성

**📝 개선 상세 내역**:

#### 1. PerformanceTrendChart - 기간별 누적 손익 추이
**파일**: `components/PerformanceTrendChart.tsx` (NEW)

**기능**:
- 일자별 거래 데이터 집계 및 누적 손익 계산
- 만원 단위 변환으로 Dashboard와 통일성 확보
- 커스텀 툴팁으로 원/만원 동시 표시
- 일별 거래 건수 표시

```typescript
interface DailyPerformance {
  date: string;
  cumulativeProfit: number;
  cumulativeProfitManwon: number;  // 만원 단위
  dailyProfit: number;
  tradeCount: number;
  displayDate: string;
}

// 만원 단위 변환
cumulativeProfitManwon: Math.round(cumulative / 10000)

// Y축 라벨
<YAxis
  tickFormatter={formatYAxis}
  label={{
    value: '누적 손익 (만원)',
    angle: -90,
    position: 'insideLeft',
  }}
/>
```

**효과**: "통합 예정" 플레이스홀더를 실제 작동하는 차트로 전환

#### 2. CoinStatsTable - 코인별 상세 통계
**파일**: `components/CoinStatsTable.tsx` (NEW)

**기능**:
- 코인별 집계: 거래 수, 승률, 평균 손익, 최대 이익, 최대 손실, 총 손익, 손익비
- TanStack Table 기반 정렬 가능한 테이블
- 승률 기반 색상 코딩 (60% 이상=초록, 40-60%=검정, 40% 미만=빨강)
- 손익 표시: 수익=빨강, 손실=파랑

```typescript
interface CoinStats {
  coin: string;
  tradeCount: number;
  winRate: number;
  avgProfit: number;
  maxProfit: number;
  maxLoss: number;
  totalProfit: number;
  profitFactor: number;
}

// 코인별 집계 로직
closedTrades.forEach((trade) => {
  const coin = trade.코인이름;
  if (!coinMap.has(coin)) {
    coinMap.set(coin, {
      coin,
      tradeCount: 0,
      winCount: 0,
      totalProfit: 0,
      maxProfit: 0,
      maxLoss: 0,
      profits: [],
      losses: [],
    });
  }

  const stats = coinMap.get(coin)!;
  stats.tradeCount += 1;
  const profit = trade.수익금 || 0;
  stats.totalProfit += profit;

  if (profit > 0) {
    stats.winCount += 1;
    stats.profits.push(profit);
    stats.maxProfit = Math.max(stats.maxProfit, profit);
  } else if (profit < 0) {
    stats.losses.push(Math.abs(profit));
    stats.maxLoss = Math.max(stats.maxLoss, Math.abs(profit));
  }
});
```

**효과**: 코인별 성과를 한눈에 파악 가능

#### 3. AIPatternAnalysis - AI 매매 패턴 분석
**파일**: `components/AIPatternAnalysis.tsx` (NEW)

**기능**:
- 거래 유형별 성과 차트 (듀얼 Y축: 승률 % + 거래 수)
- 거래 유형별 상세 통계 테이블
- 시간대별 거래 패턴 차트
- 승률 기반 동적 색상 (60% 이상=초록, 40-60%=파랑, 40% 미만=빨강)

```typescript
interface TradeTypeStats {
  type: string;
  count: number;
  winCount: number;
  winRate: number;
  avgProfit: number;
  totalProfit: number;
}

// 거래 유형별 집계
const typeMap = new Map<string, TradeTypeStats>();
closedTrades.forEach((trade) => {
  const type = trade.거래유형;
  if (!typeMap.has(type)) {
    typeMap.set(type, {
      type,
      count: 0,
      winCount: 0,
      winRate: 0,
      avgProfit: 0,
      totalProfit: 0,
    });
  }

  const stats = typeMap.get(type)!;
  stats.count += 1;
  stats.totalProfit += trade.수익금 || 0;
  if ((trade.수익금 || 0) > 0) {
    stats.winCount += 1;
  }
});
```

**레이아웃 구성**:
1. 거래 유형별 성과 차트 (상단)
2. 거래 유형별 상세 통계 테이블 (중간)
3. 시간대별 거래 패턴 (하단) - 사용자 요청으로 마지막에 배치

**효과**: AI의 매매 패턴을 다각도로 분석 가능

#### 4. EnhancedTradesTable - 검색 기능 추가
**파일**: `components/EnhancedTradesTable.tsx` (MODIFIED)

**추가 기능**:
- globalFilter 상태 추가
- 검색 아이콘이 포함된 검색 입력 필드
- 초기화 버튼
- 실시간 필터링

```typescript
const [globalFilter, setGlobalFilter] = useState<string>('');

const table = useReactTable({
  state: {
    sorting,
    globalFilter,
  },
  onGlobalFilterChange: setGlobalFilter,
  globalFilterFn: 'includesString',
  // ...
});

// 검색 UI
<div className="relative flex-1 max-w-md">
  <input
    type="text"
    value={globalFilter ?? ''}
    onChange={(e) => setGlobalFilter(e.target.value)}
    placeholder="코인 이름으로 검색... (예: BTC, ETH)"
    className="w-full px-4 py-2 pl-10..."
  />
  <svg className="absolute left-3 top-1/2...">
    {/* 검색 아이콘 */}
  </svg>
</div>
```

**효과**: 특정 코인 거래 내역을 빠르게 검색 가능

#### 5. AnalysisSummary - 카드 레이아웃 개선
**파일**: `components/AnalysisSummary.tsx` (MODIFIED)

**변경 사항**:
- "📈 기간내 성과" 타이틀 추가
- 독립된 카드 레이아웃으로 감싸기
- 손익 색상 변경: 수익=빨강, 손실=파랑

```typescript
return (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-xl font-bold text-slate-800 mb-4">📈 기간내 성과</h2>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 4개 메트릭 카드 */}
    </div>
  </div>
);
```

#### 6. 날짜 필터 버그 수정
**파일**: `app/analysis/page.tsx` (MODIFIED)

**문제**: 당일 날짜(10월 16일) 선택 시 해당 날짜의 거래가 표시되지 않음
**원인**: 종료일이 `00:00:00`으로 설정되어 당일 거래가 제외됨

**수정**:
```typescript
// 기존 (버그)
const endOfDay = new Date(filters.dateRange.end);
// endOfDay는 00:00:00 상태

// 수정 (정상)
const endOfDay = new Date(filters.dateRange.end);
endOfDay.setHours(23, 59, 59, 999);  // 하루의 끝까지 포함
```

**효과**: 당일 거래가 정상적으로 필터링됨

#### 7. 손익 색상 통일 (일봉 차트 규칙)
**적용 파일**:
- `components/AnalysisSummary.tsx`
- `components/AIPatternAnalysis.tsx`
- `components/CoinStatsTable.tsx`
- `components/EnhancedTradesTable.tsx`

**변경 사항**:
- 기존: 수익=파랑, 손실=빨강 (회계 규칙)
- 개선: 수익=빨강, 손실=파랑 (일봉 차트 규칙, 직관적)

```typescript
// 모든 손익 표시 통일
const colorClass = value >= 0 ? 'text-red-600' : 'text-blue-600';
```

**효과**: 주식/암호화폐 차트와 동일한 색상 규칙으로 사용자 혼란 방지

#### 8. Analysis 페이지 레이아웃 재구성
**파일**: `app/analysis/page.tsx` (MODIFIED)

**최종 레이아웃**:
```
├── 필터 (좌측 1컬럼, sticky)
└── 메인 콘텐츠 (우측 3컬럼)
    ├── 기간내 성과 (AnalysisSummary)
    ├── 2컬럼 그리드
    │   ├── 자산별 실현 손익 (PnlByAssetChart)
    │   └── 기간별 누적 손익 추이 (PerformanceTrendChart)
    ├── 코인별 상세 통계 (CoinStatsTable)
    ├── AI 매매 패턴 분석 (AIPatternAnalysis)
    └── 상세 거래 내역 (EnhancedTradesTable)
```

**✅ 검증 완료**:
- ✅ 기간별 누적 손익 추이 차트 정상 표시 (만원 단위)
- ✅ 코인별 상세 통계 정확한 계산
- ✅ AI 패턴 분석 차트 정상 렌더링
- ✅ 거래 내역 검색 기능 정상 작동
- ✅ 날짜 필터 당일 데이터 정상 표시
- ✅ 모든 손익 색상 통일 (빨강/파랑)
- ✅ 로컬 빌드 성공 (npm run dev)
- ✅ TypeScript 컴파일 오류 없음

**📊 개선 효과**:
- **기간별 추이 시각화**: 누적 손익 추세를 한눈에 파악
- **코인별 성과 분석**: 각 코인의 승률, 손익비, 평균 손익 비교
- **AI 패턴 인사이트**: 거래 유형별/시간대별 성과 분석
- **빠른 검색**: 특정 코인 거래 내역 즉시 조회
- **직관적인 색상**: 일봉 차트와 동일한 색상 규칙
- **데이터 정합성**: 날짜 필터 버그 수정으로 정확한 데이터 표시

**생성된 파일** (총 3개):
- `components/PerformanceTrendChart.tsx` (NEW)
- `components/CoinStatsTable.tsx` (NEW)
- `components/AIPatternAnalysis.tsx` (NEW)

**수정된 파일** (총 3개):
- `components/AnalysisSummary.tsx` (MODIFIED)
- `components/EnhancedTradesTable.tsx` (MODIFIED)
- `app/analysis/page.tsx` (MODIFIED)

**🎯 사용자 피드백 반영**:
1. ✅ "기간별추이 그래프가 나오지 않아" → PerformanceTrendChart 생성
2. ✅ "코인을 검색할수 있는 기능을 추가해줘" → globalFilter 검색 구현
3. ✅ "supabase내 테이블정보를 세부적으로 관리" → CoinStatsTable, AIPatternAnalysis 추가
4. ✅ "데이터 내보내기는 필요없어" → 제외
5. ✅ "오늘 날짜로 지정하면 데이터가 안나와" → 날짜 필터 버그 수정
6. ✅ "y축을 만원단위 main과 동일하게" → 만원 단위 변환
7. ✅ "기간내성과 타이틀 표시" → AnalysisSummary 타이틀 추가
8. ✅ "시간대별 거래패턴 젤 마지막에" → AIPatternAnalysis 레이아웃 재구성
9. ✅ "수익:빨강, 손해:파랑으로" → 4개 컴포넌트 색상 통일

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

**최종 업데이트**: 2025-10-16 16:00

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


## 🎬 YouTube Channel & Visitor Counter Integration (2025-10-16)

> **목표**: 유튜브 채널 홍보 및 방문자 카운터 추가
> **실제 기간**: 1시간 (2025-10-16)
> **상태**: ✅ 완료

### [2025-10-16 19:30] YouTube 채널 및 방문자 카운터 추가 완료

**✅ 완료 항목**:
- [x] 1. 대시보드 상단 유튜브 채널 배너 추가
- [x] 2. QuickLinksCard에 유튜브 채널 링크 추가
- [x] 3. system_status 테이블 활용한 방문자 카운터 구현
- [x] 4. PostgreSQL RPC 함수 생성 (increment_page_view, get_page_view_count)
- [x] 5. usePageViewCounter 커스텀 훅 생성
- [x] 6. 대시보드 방문자 카운터 UI 추가

**📝 개선 상세 내역**:

#### 1. YouTube 채널 배너 추가
**파일**: `dashboard/app/dashboard/page.tsx` (MODIFIED)

**기능**:
- 유튜브 브랜드 색상 그라디언트 배너 (빨강 계열)
- 유튜브 아이콘 + 채널명 + 설명
- 호버 시 확대 효과 (scale: 1.01)
- 새 탭에서 채널 열기

```typescript
<a
  href="https://www.youtube.com/@코인먹는AI"
  target="_blank"
  rel="noopener noreferrer"
  className="block bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-lg p-4 transition-all duration-300 transform hover:scale-[1.01]"
>
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="bg-white rounded-full p-3">
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
          {/* YouTube 아이콘 */}
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-bold">코인먹는AI 유튜브 채널</h3>
        <p className="text-sm text-red-100">AI 트레이딩 전략과 암호화폐 인사이트를 확인하세요!</p>
      </div>
    </div>
    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg backdrop-blur-sm">
      <span className="text-sm font-semibold">채널 방문</span>
    </div>
  </div>
</a>
```

#### 2. QuickLinksCard 유튜브 링크 추가
**파일**: `dashboard/components/QuickLinksCard.tsx` (MODIFIED)

**변경 사항**:
- 새로운 "콘텐츠" 카테고리 추가
- 코인먹는AI 유튜브 채널 링크 (🎥 아이콘)

```typescript
{
  category: "콘텐츠",
  items: [
    { name: "코인먹는AI", url: "https://www.youtube.com/@코인먹는AI", icon: "🎥" },
  ],
}
```

#### 3. 방문자 카운터 - system_status 활용
**파일**: `migration_temp/add_page_view_counter.sql` (NEW)

**아키텍처**:
- 기존 `system_status` 테이블 활용 (신규 테이블 생성 불필요)
- Key-Value 구조로 `page_view_count` 키 사용
- PostgreSQL RPC 함수로 원자적 업데이트 보장

```sql
-- 1. 초기 카운트 설정
INSERT INTO system_status (status_key, status_value, last_updated)
VALUES ("page_view_count", "0", NOW())
ON CONFLICT (status_key) DO NOTHING;

-- 2. 카운트 증가 함수
CREATE OR REPLACE FUNCTION increment_page_view()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count BIGINT;
BEGIN
  UPDATE system_status
  SET
    status_value = (COALESCE(status_value::BIGINT, 0) + 1)::TEXT,
    last_updated = NOW()
  WHERE status_key = "page_view_count"
  RETURNING status_value::BIGINT INTO new_count;

  IF new_count IS NULL THEN
    INSERT INTO system_status (status_key, status_value, last_updated)
    VALUES ("page_view_count", "1", NOW())
    RETURNING status_value::BIGINT INTO new_count;
  END IF;

  RETURN new_count;
END;
$$;

-- 3. 카운트 조회 함수
CREATE OR REPLACE FUNCTION get_page_view_count()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(status_value::BIGINT, 0)
  FROM system_status
  WHERE status_key = "page_view_count";
$$;
```

#### 4. usePageViewCounter 커스텀 훅
**파일**: `dashboard/lib/hooks/usePageViewCounter.ts` (NEW)

**기능**:
- 페이지 로드 시 자동 카운트 증가
- 세션 스토리지로 중복 방지 (같은 세션 = 1회만 카운트)
- 이미 방문한 세션은 조회만 수행

```typescript
export function usePageViewCounter() {
  const [viewCount, setViewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function trackPageView() {
      try {
        const sessionKey = "dashboard_visited";
        const hasVisited = sessionStorage.getItem(sessionKey);

        if (!hasVisited) {
          // 방문 카운트 증가
          const { data, error } = await supabase.rpc("increment_page_view");
          if (!error) {
            setViewCount(data || 0);
            sessionStorage.setItem(sessionKey, "true");
          }
        } else {
          // 이미 방문한 세션 → 조회만
          const { data } = await supabase.rpc("get_page_view_count");
          setViewCount(data || 0);
        }
      } finally {
        setIsLoading(false);
      }
    }

    trackPageView();
  }, []);

  return { viewCount, isLoading };
}
```

#### 5. 방문자 카운터 UI
**파일**: `dashboard/app/dashboard/page.tsx` (MODIFIED)

**위치**: 유튜브 배너 아래, 우측 정렬
**디자인**: 눈 아이콘 + "총 방문: X회" 표시

```typescript
<div className="flex justify-end">
  <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {/* 눈 아이콘 */}
    </svg>
    <span className="text-sm text-slate-600">총 방문:</span>
    <span className="text-sm font-bold text-slate-800">
      {isCountLoading ? "..." : viewCount.toLocaleString()}회
    </span>
  </div>
</div>
```

**✅ 검증 완료**:
- ✅ 유튜브 배너 정상 표시 (클릭 시 새 탭에서 채널 열림)
- ✅ QuickLinksCard에 유튜브 링크 추가됨
- ✅ 방문자 카운터 정상 작동 (세션 기반 중복 방지)
- ✅ 페이지 새로고침 시 카운트 유지 (같은 세션에서는 증가 안 함)
- ✅ 새 브라우저/시크릿 모드 시 카운트 증가

**📊 개선 효과**:
- **채널 홍보**: 대시보드 최상단 배너로 유튜브 채널 노출 극대화
- **방문자 추적**: 실제 방문자 수 기반 사이트 인기도 측정
- **중복 방지**: 세션 기반으로 페이지 새로고침 시 무한 증가 방지
- **효율적 구조**: 신규 테이블 불필요, system_status 재활용

**생성된 파일** (총 2개):
- `migration_temp/add_page_view_counter.sql` (NEW) - RPC 함수 및 초기 데이터
- `dashboard/lib/hooks/usePageViewCounter.ts` (NEW) - 방문자 카운터 훅

**수정된 파일** (총 2개):
- `dashboard/app/dashboard/page.tsx` (MODIFIED) - 유튜브 배너 + 방문자 카운터 UI
- `dashboard/components/QuickLinksCard.tsx` (MODIFIED) - 콘텐츠 카테고리 추가

**🎯 사용자 요청 반영**:
1. ✅ "유튜브채널을 알릴수있고 바로 접속가능한 링크" → 상단 배너 + QuickLinks 추가
2. ✅ "빠른링크에도 추가해줘" → QuickLinksCard에 콘텐츠 카테고리 추가
3. ✅ "방문한 방문자의 누적횟수도 표시" → system_status 활용 카운터 구현
4. ✅ "신규테이블 생성할필요없이 status테이블에 필드 추가" → Key-Value 구조 활용

---

