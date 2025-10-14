# 📊 AI Trading Dashboard

**실시간 AI 트레이딩 포트폴리오 모니터링 시스템**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mypsj-hub/aitrade)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 배포 URL

**프로덕션**: https://aitrade-liard.vercel.app

---

## 📖 개요

AI 기반 암호화폐 자동매매 봇의 성과를 실시간으로 모니터링할 수 있는 웹 대시보드입니다.

### 주요 기능

- ✅ **실시간 포트폴리오 모니터링** - 60초마다 자동 업데이트
- ✅ **보유 자산 현황** - 코인별 수량, 평가금액, 수익률
- ✅ **거래 내역 추적** - 매수/매도 이력 및 AI 판단 근거
- ✅ **수익률 차트** - Recharts 기반 시각화
- ✅ **AI CIO 브리핑** - 일일 시장 분석 및 전략 요약
- ✅ **반응형 디자인** - 모바일/태블릿/데스크톱 최적화

---

## 🚀 빠른 시작

### 요구 사항

- **Node.js** 18.x 이상
- **npm** 또는 **yarn**
- **Supabase** 계정 (무료)

### 설치 및 실행

```bash
# 1. 프로젝트 클론
git clone https://github.com/mypsj-hub/aitrade.git
cd aitrade/dashboard

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.local.example .env.local
# .env.local 파일에 Supabase 키 입력

# 4. 개발 서버 실행
npm run dev

# 5. 브라우저에서 확인
# http://localhost:3000
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🏗️ 기술 스택

### Frontend
- **Next.js 15** - React 프레임워크 (App Router)
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Tailwind CSS 4** - 유틸리티 기반 스타일링

### 데이터 & 상태
- **SWR** - 데이터 페칭 및 캐싱
- **Supabase** - PostgreSQL 클라우드 DB

### 차트 & 유틸리티
- **Recharts** - 차트 라이브러리
- **date-fns** - 날짜 포맷팅

### 배포
- **Vercel** - 호스팅 & CI/CD

---

## 📁 프로젝트 구조

```
dashboard/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 메인 페이지
│   ├── layout.tsx           # 전역 레이아웃
│   └── globals.css          # 전역 스타일
├── components/               # React 컴포넌트
│   ├── PortfolioSummaryCard.tsx
│   ├── HoldingsTable.tsx
│   ├── RecentTradesTable.tsx
│   ├── PerformanceChart.tsx
│   └── MarketRegimeBadge.tsx
├── lib/                     # 비즈니스 로직
│   ├── supabase.ts         # Supabase 클라이언트
│   ├── types.ts            # TypeScript 타입
│   └── hooks/
│       └── useDashboardData.ts  # 데이터 페칭 훅
└── docs/                    # 프로젝트 문서
    ├── DASHBOARD_GUIDE.md
    ├── DASHBOARD_CHANGELOG.md
    └── DASHBOARD_ROADMAP.md
```

---

## 📚 문서

### 개발 가이드
- **[DASHBOARD_GUIDE.md](DASHBOARD_GUIDE.md)** - 종합 개발 가이드
  - 기술 스택 상세 설명
  - 프로젝트 구조
  - 개발 워크플로우
  - 코딩 컨벤션
  - 문제 해결

### 변경 이력
- **[DASHBOARD_CHANGELOG.md](DASHBOARD_CHANGELOG.md)** - 버전별 변경 이력
  - 추가된 기능
  - 버그 수정
  - 의존성 변경
  - 성능 개선

### 로드맵
- **[DASHBOARD_ROADMAP.md](DASHBOARD_ROADMAP.md)** - 향후 개발 계획
  - Phase별 기능 계획
  - 우선순위 및 일정
  - 고도화 아이디어

---

## 🛠️ 개발 명령어

```bash
# 개발 서버 실행 (Turbopack)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# TypeScript & ESLint 검사
npm run lint
```

---

## 📊 스크린샷

### 메인 대시보드
![Dashboard](https://via.placeholder.com/800x450?text=Dashboard+Screenshot)

### 수익률 차트
![Chart](https://via.placeholder.com/800x450?text=Performance+Chart)

### 모바일 뷰
![Mobile](https://via.placeholder.com/400x700?text=Mobile+View)

---

## 🚢 배포

### Vercel 자동 배포

```bash
# 1. GitHub에 푸시
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main

# 2. Vercel이 자동으로 감지하여 배포 (2-3분 소요)
# 3. https://aitrade-liard.vercel.app 에서 확인
```

### 수동 배포 (Vercel CLI)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

---

## 🤝 기여

기여를 환영합니다! 다음 절차를 따라주세요:

1. Fork 이 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경 사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
style: UI/스타일 변경
refactor: 코드 리팩토링
docs: 문서 수정
chore: 설정, 의존성 업데이트
```

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 💬 문의

질문이나 제안 사항이 있으시면 이슈를 생성해주세요.

- **GitHub Issues**: https://github.com/mypsj-hub/aitrade/issues
- **Email**: your-email@example.com

---

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들을 활용합니다:

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [SWR](https://swr.vercel.app/)

---

## 📌 버전 정보

**현재 버전**: v1.0.0
**마지막 업데이트**: 2025-10-14

---

**Made with ❤️ by Claude & Human**
