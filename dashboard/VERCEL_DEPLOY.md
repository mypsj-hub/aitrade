# Vercel 배포 가이드 - Next.js Dashboard

## 🎉 준비 완료!

Next.js + TypeScript + Supabase 대시보드가 준비되었습니다.

---

## 📦 프로젝트 구조

```
dashboard/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 대시보드 페이지
│   ├── layout.tsx         # 레이아웃
│   └── globals.css        # 글로벌 스타일
├── components/            # React 컴포넌트
│   ├── PortfolioSummaryCard.tsx
│   ├── HoldingsTable.tsx
│   ├── RecentTradesTable.tsx
│   ├── PerformanceChart.tsx
│   └── MarketRegimeBadge.tsx
├── lib/                   # 유틸리티 및 데이터 레이어
│   ├── types.ts          # TypeScript 인터페이스
│   ├── supabase.ts       # Supabase 클라이언트
│   └── hooks/
│       └── useDashboardData.ts  # SWR 데이터 페칭
├── package.json
├── next.config.ts
└── .env.local            # 로컬 환경 변수 (Git 제외)
```

---

## 🚀 Vercel 배포 단계 (5분)

### 1단계: Vercel 계정 접속
1. https://vercel.com 접속
2. **Continue with GitHub** 클릭하여 로그인

### 2단계: 새 프로젝트 Import
1. 우측 상단 **Add New...** → **Project** 클릭
2. **Import Git Repository** 섹션에서 `mypsj-hub/aitrade` 선택
3. **Import** 버튼 클릭

### 3단계: 프로젝트 설정

**Configure Project** 화면에서:

#### Framework Preset
- **자동 감지됨**: `Next.js` ✅

#### Root Directory
- **중요**: `dashboard` 입력 (프로젝트가 dashboard 폴더 안에 있음)
- 또는 **Edit** 버튼 클릭 → `dashboard` 선택

#### Build and Output Settings
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

### 4단계: 환경 변수 설정 ⚠️ 매우 중요!

**Environment Variables** 섹션에서 **+ Add** 버튼을 클릭하여 2개 추가:

#### 첫 번째 변수:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://nlkbkyambjnlmuplpnrd.supabase.co
```
- Environments: **Production**, **Preview**, **Development** 모두 체크 ✅

#### 두 번째 변수:
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sa2JreWFtYmpubG11cGxwbnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDE2MzksImV4cCI6MjA3NDI3NzYzOX0.sFYud66oodoxQ1JritdZZeXYXgM2eHxeCEy3YhRqA_8
```
- Environments: **Production**, **Preview**, **Development** 모두 체크 ✅

⚠️ **주의**:
- `NEXT_PUBLIC_` 접두사가 있어야 브라우저에서 접근 가능합니다!
- ANON_KEY 사용 (SERVICE_ROLE_KEY 아님 - 읽기 전용)

### 5단계: 배포 시작
1. 화면 하단 **Deploy** 버튼 클릭
2. 빌드 진행 상황 모니터링 (2-4분 소요)
3. 배포 완료 후 축하 화면 표시 🎉

### 6단계: 대시보드 접속
1. **Visit** 또는 **Go to Dashboard** 버튼 클릭
2. 생성된 URL:
   ```
   https://aitrade-<랜덤문자>.vercel.app
   ```
3. 대시보드가 정상적으로 로드되는지 확인

---

## ✅ 배포 성공 확인 체크리스트

- [ ] Vercel 빌드가 "Ready" 상태
- [ ] 생성된 URL로 접속 가능
- [ ] "AI Trading Dashboard" 타이틀 표시
- [ ] 포트폴리오 요약 카드 4개 표시
- [ ] 보유 자산 테이블 표시 (데이터가 있는 경우)
- [ ] 거래 내역 표시
- [ ] 차트 표시
- [ ] 에러 메시지 없음
- [ ] 모바일에서도 정상 표시

---

## 🔧 문제 해결

### 1. "Root Directory" 설정 오류
**증상**: 빌드 시 "Cannot find package.json" 에러
**해결**:
- Vercel Dashboard → Settings → General
- Root Directory를 `dashboard`로 설정
- Redeploy

### 2. 환경 변수 오류
**증상**: "Missing Supabase environment variables" 에러
**해결**:
- Vercel Dashboard → Settings → Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
- 접두사 `NEXT_PUBLIC_` 확인
- Redeploy

### 3. 빌드 에러
**증상**: TypeScript 컴파일 에러
**해결**:
- Vercel Dashboard → Deployments → 최근 배포 클릭
- **Build Logs** 탭에서 에러 메시지 확인
- 로컬에서 `npm run build` 테스트

### 4. 데이터가 표시되지 않음
**증상**: 대시보드는 로드되지만 데이터가 비어있음
**해결**:
- Supabase RLS 정책 확인 (읽기 권한)
- Supabase Dashboard에서 테이블에 데이터가 있는지 확인
- 로컬 트레이딩 봇이 실행 중인지 확인 (`python main.py`)

### 5. CORS 에러
**증상**: 브라우저 콘솔에 CORS 에러
**해결**:
- Supabase Dashboard → Settings → API
- CORS 설정에서 Vercel 도메인 추가

---

## 🔄 자동 재배포

GitHub에 변경사항을 푸시하면 Vercel이 자동으로 재배포:

```bash
cd c:/gptbitcoin4
git add dashboard/
git commit -m "Update dashboard"
git push origin main

# 약 2-3분 후 자동으로 반영됨
```

---

## 🎨 커스텀 도메인 설정 (선택)

Vercel Dashboard → Settings → Domains에서:
1. 소유한 도메인 입력 (예: `trading.yourdomain.com`)
2. DNS 레코드 추가 지침 따라하기
3. 자동 HTTPS 인증서 발급

---

## 📱 모바일 최적화

이 대시보드는 Tailwind CSS를 사용하여 반응형으로 제작되었습니다:
- 모바일: 세로 레이아웃
- 태블릿: 2열 그리드
- 데스크톱: 4열 그리드

---

## 💰 비용

**완전 무료!** 🎉
- Vercel Hobby 플랜 (무료)
  - 100GB 대역폭/월
  - 무제한 배포
  - 자동 HTTPS
- Supabase Free Tier (무료)
  - 500MB 데이터베이스
  - 2GB 대역폭/월

**총 월 비용: $0**

---

## 🔄 전체 시스템 구조

```
[로컬 PC]
  main.py (트레이딩 봇)
    ↓ (쓰기 - SERVICE_ROLE_KEY)
[Supabase PostgreSQL]
  holding_status, trade_history,
  portfolio_summary, cio_reports
    ↓ (읽기 - ANON_KEY)
[Vercel - Next.js Dashboard]
  https://aitrade-xxx.vercel.app
  (24/7 웹 대시보드)
    ↑
[사용자 - 모바일/PC]
  브라우저에서 실시간 모니터링
```

---

## 📊 대시보드 기능

### 실시간 업데이트
- 60초마다 자동 데이터 새로고침 (SWR)
- 탭 전환 시 자동 재검증
- 로딩 스피너 표시

### 표시 항목
1. **포트폴리오 요약**: 총자산, 일일/누적 수익률, 원화 잔고
2. **수익률 차트**: Recharts를 사용한 라인 차트
3. **보유 자산**: 코인별 상세 정보 테이블
4. **거래 내역**: 최근 거래 기록
5. **AI CIO 브리핑**: 최신 AI 분석 리포트
6. **시장 체제**: Bull/Bear/Range 배지

---

## 📞 지원

문제가 있으면:
1. Vercel Build Logs 확인
2. 브라우저 개발자 도구 콘솔 확인
3. Supabase Dashboard Logs 확인

**GitHub Repository**: https://github.com/mypsj-hub/aitrade

---

**이제 Vercel 배포를 시작하세요!** 🚀
