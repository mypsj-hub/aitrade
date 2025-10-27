# AI Trading Bot System

> **📅 최종 업데이트**: 2025-10-24
> **📦 버전**: v2.0.4
>
> **⚠️ 코드 수정 전 필수 확인**: [docs/dev_guide/README.md](docs/dev_guide/README.md)

인공지능 기반 암호화폐 자동매매 시스템 (트레이딩 봇 + 웹 대시보드)

---

## 🗺️ 학습 경로

이 시스템을 효과적으로 이해하기 위한 권장 순서:

```
1. gptbitcoin4/README.md (이 문서)
   → 전체 시스템 개요 및 아키텍처
   ↓
2. docs/README.md
   → 트레이딩봇 시스템 가이드
   ↓
3. dashboard/README.md
   → 대시보드 시스템 가이드
   ↓
4. docs/dev_guide/README.md
   → 개발 규칙 및 프롬프트 관리 (⚠️ 코드 수정 전 필수)
   ↓
5. dashboard/docs/dev_guide/배포가이드.md
   → 대시보드 배포 및 개발
```

---

## 🎯 핵심 철학 (Core Philosophy)

> **AI 트레이딩 봇은 데이터 기반 자율 판단 시스템이며, 규칙 기반 결정 트리가 아닙니다.**

### 설계 원칙

이 시스템은 AI가 **스스로 분석하고 판단**하도록 설계되었습니다:

- ✅ **데이터 제공**: AI에게 풍부한 시장 데이터와 맥락 정보를 제공
- ✅ **가이드 제시**: 판단 시 고려할 요소와 원칙을 제안
- ✅ **자율 판단**: AI가 맥락을 종합 분석하여 스스로 결정

- ❌ **명시적 규칙 최소화**: "X이면 무조건 Y"와 같은 기계적 규칙 지양
- ❌ **템플릿 강제 제거**: 사고 과정의 형식을 강제하지 않음
- ❌ **숫자 기준 공식화 지양**: 맥락 없는 임계값 기준 최소화

**예시**:
```
❌ 나쁜 접근: "G섹션 3개 이상 일치하면 무조건 G섹션 우선"
✅ 좋은 접근: "G섹션 신호 강도, C섹션 추세, 시장 맥락을 종합 분석"

❌ 나쁜 접근: "보유 3일 미만이면 부분익절 절대 금지"
✅ 좋은 접근: "단기 보유 자산은 추세 확인 후 신중히 판단"

❌ 나쁜 접근: "thinking_process에 반드시 Q1/Q2/Q3 형식으로 작성"
✅ 좋은 접근: "다음 질문들을 고려하여 분석: Q1, Q2, Q3"
```

### CIO 일관성 = 시스템의 신뢰성

> **"긴급도 반복 호출은 문제가 아니라 시장 민감도의 증거입니다."**

**핵심 원칙**:
- ✅ **Process1 민감성**: 시장 변화(급등락, 체제 변경)를 빠르게 감지하여 CIO 트리거
- ✅ **CIO 일관성**: 동일한 시장 상황에서 데이터 전체를 종합하여 **일관된 판단** 유지
- ✅ **Process2 신중함**: CIO 목표 + 시장 신호를 종합하여 **과매매 방지**

**진짜 문제 vs 정상 작동**:
- ❌ **진짜 문제**: CIO가 같은 상황에서 다른 판단을 내리는 것 (일관성 부족)
- ✅ **정상 작동**: CIO가 5분 간격으로 3회 호출되지만 거의 동일한 비중 유지 (일관성 우수)

### API 비용 우선순위

> **"API 호출 비용은 매매 손실에 비하면 아무것도 아닙니다."**

**시스템 개선 시 우선순위**:
1. **1순위**: 매매 정확성, 리스크 관리, 일관성
2. **2순위**: 시스템 안정성, 데이터 품질
3. **3순위**: 개발 생산성, 유지보수성
4. **최하위**: API 호출 비용, 연산 시간

**비용 vs 가치 분석**:
```
CIO 1회 호출 비용: 약 $0.01 (14원)
불필요한 매매 1회 손실: 약 10,000원~100,000원

→ CIO를 100회 호출해도 (1,400원) < 잘못된 매매 1회 (10,000원+)
```

---

## 📋 프로젝트 개요

24시간 실시간 AI 트레이딩 시스템으로, 로컬에서 실행되는 트레이딩 봇과 클라우드 기반 웹 대시보드로 구성되어 있습니다.

### 핵심 특징

- ✅ **AI 자동 매매**: OpenAI GPT-4 / Google Gemini 1.5 Pro 기반
- ✅ **고급 리스크 관리**: Auto-escalation, Smart Fractional, Dynamic Trailing Stop
- ✅ **AI 자동편입**: Dual Funnel 시스템 (Momentum Hunter + Quality Compounder)
- ✅ **실시간 대시보드**: Vercel + Next.js 15 + Supabase PostgreSQL
- ✅ **모듈화 아키텍처**: ai_strategy (9파일), data_manager (9파일)
- ✅ **로깅 시스템 v2.0**: ProcessContextFilter + Display Width 정렬

### 주요 지표

| 지표 | 성능 |
|------|------|
| **목표 비중 달성 속도** | 10일 → 1일 (10배 가속) |
| **모듈 이해도** | 30점 → 95점 (+217%) |
| **코드 가독성** | 40점 → 95점 (+138%) |
| **TWAP 기록 효율** | 3건/회 → 1건/회 (67% 감소) |

---

## 🏗️ 시스템 아키텍처

### 전체 구조도

```
┌─────────────────────────────────────────────────────────────┐
│                   사용자 (브라우저)                            │
│              PC / 모바일 / 태블릿                              │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Vercel (Next.js 15 Dashboard)                        │
│        https://aitrade-liard.vercel.app                      │
│  • 3개 페이지 (Dashboard, Analysis, Portfolio)               │
│  • React 19 + TypeScript + Tailwind CSS 4                    │
│  • TanStack Table v8 + Recharts + SWR                        │
│  • 반응형 디자인 (모바일 최적화)                               │
└────────────────────┬────────────────────────────────────────┘
                     │ Supabase API (ANON_KEY - 읽기 전용)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Supabase PostgreSQL (클라우드 DB)                    │
│     https://nlkbkyambjnlmuplpnrd.supabase.co                │
│                                                              │
│  📊 6개 테이블 (Row Level Security 적용)                     │
│  ├─ holding_status      (보유현황)                          │
│  ├─ trade_history       (거래내역)                          │
│  ├─ portfolio_summary   (포트폴리오 요약)                    │
│  ├─ cio_reports         (CIO 브리핑)                        │
│  ├─ system_status       (시스템 상태)                        │
│  └─ coin_watch_history  (AI 자동편입 관심 종목)              │
└────────────────────┬────────────────────────────────────────┘
                     ▲
                     │ Supabase API (SERVICE_KEY - 쓰기 전용)
┌─────────────────────────────────────────────────────────────┐
│           로컬 PC (트레이딩 봇 - Python 3.11+)                │
│                                                              │
│  🎯 메인 프로세스                                             │
│  ├─ main.py              (Process1, Process2, CIO 스케줄링) │
│  ├─ config.py            (전역 설정, 로깅 시스템 v2.0)       │
│  ├─ trade_manager.py     (거래 실행 엔진)                    │
│  └─ supabase_adapter.py  (DB 통합 - 49 메서드, 6 테이블)    │
│                                                              │
│  🤖 AI 전략 모듈 (ai_strategy/ - 9파일)                      │
│  ├─ process2.py          (AI 매매 판단 - 워뇨띠 전략)       │
│  ├─ cio.py               (CIO 포트폴리오 비중 설정)          │
│  ├─ data_collector.py    (병렬 데이터 수집)                 │
│  └─ ... (6개 모듈)                                           │
│                                                              │
│  📊 데이터 관리 모듈 (data_manager/ - 9파일)                 │
│  ├─ universe.py          (AI 자동편입 - Dual Funnel) ⭐     │
│  ├─ ohlcv.py             (OHLCV 데이터, 기술지표)            │
│  ├─ cache.py             (데이터 캐싱 - RateLimiter)         │
│  └─ ... (6개 모듈)                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 빠른 시작

### 1. 트레이딩 봇 실행

```bash
# 환경 변수 설정 (.env)
UPBIT_ACCESS_KEY=your_access_key
UPBIT_SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
SUPABASE_URL=https://nlkbkyambjnlmuplpnrd.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Python 의존성 설치
pip install -r requirements.txt

# 트레이딩 봇 실행
python main.py
```

**실행 시 자동 시작:**
- Process1 (5분마다 실시간 모니터링)
- Process2 백그라운드 워커 (AI 매매 판단)
- CIO (1일 1회 포트폴리오 재구성)
- 일일 리포트 생성

### 2. 웹 대시보드 접속

- **배포 URL**: https://aitrade-liard.vercel.app
- **로컬 개발**:
  ```bash
  cd dashboard
  npm install
  npm run dev
  # http://localhost:3000
  ```

---

## 📁 프로젝트 구조

```
gptbitcoin4/
├── README.md                   # Level 1: 전체 시스템 개요 (이 문서)
│
├── main.py                     # 메인 실행 파일
├── config.py                   # 전역 설정
├── trade_manager.py            # 거래 실행 엔진
├── supabase_adapter.py         # DB 통합 어댑터
│
├── ai_strategy/                # AI 전략 모듈 (9파일)
│   ├── __init__.py            # Public API
│   ├── process2.py            # AI 매매 판단
│   ├── cio.py                 # CIO 포트폴리오 비중
│   ├── data_collector.py      # 병렬 데이터 수집
│   └── ... (5개 모듈)
│
├── data_manager/               # 데이터 관리 모듈 (9파일)
│   ├── __init__.py            # Public API
│   ├── universe.py            # AI 자동편입 (Dual Funnel) ⭐
│   ├── ohlcv.py               # OHLCV 데이터, 기술지표
│   └── ... (6개 모듈)
│
├── docs/                       # Level 2: 트레이딩봇 문서
│   ├── README.md              # 트레이딩봇 총괄 가이드
│   └── dev_guide/             # Level 3: 개발자 가이드
│       ├── README.md          # 개발 규칙 (⚠️ 필수)
│       ├── AI자동편입_명세서.md
│       ├── CIO비중_명세서.md
│       ├── 매매판단_명세서.md
│       └── 트레이딩봇_수정이력.md
│
└── dashboard/                  # Next.js 15 웹 대시보드
    ├── README.md              # Level 2: 대시보드 총괄 가이드
    ├── app/                   # App Router (3페이지)
    │   ├── dashboard/         # 시장 상황실
    │   ├── analysis/          # AI 분석실
    │   └── portfolio/         # AI CIO 전략실
    ├── components/            # React 컴포넌트 (17개)
    └── docs/                  # Level 3: 대시보드 개발 가이드
        └── dev_guide/
            ├── 배포가이드.md
            └── 변경이력.md
```

---

## 📚 주요 문서

### 시스템 이해 (필수 순서)

1. **[docs/README.md](docs/README.md)** - 트레이딩봇 시스템 총괄 가이드
2. **[dashboard/README.md](dashboard/README.md)** - 대시보드 시스템 총괄 가이드

### 개발 규칙 (코드 수정 전 필수)

3. **[docs/dev_guide/README.md](docs/dev_guide/README.md)** - 개발 규칙 및 프롬프트 관리 ⚠️
   - 시스템 아키텍처 이해
   - 코드 작성 규칙
   - 프롬프트 수정 절차 (6단계)
   - 데이터베이스 규칙

### 프롬프트 명세서 (AI 판단 기준)

4. **[docs/dev_guide/AI자동편입_명세서.md](docs/dev_guide/AI자동편입_명세서.md)** - AI 자동편입 명세
5. **[docs/dev_guide/CIO비중_명세서.md](docs/dev_guide/CIO비중_명세서.md)** - CIO 포트폴리오 비중 명세
6. **[docs/dev_guide/매매판단_명세서.md](docs/dev_guide/매매판단_명세서.md)** - Process2 매매 판단 명세

### 개발 및 배포

7. **[dashboard/docs/dev_guide/배포가이드.md](dashboard/docs/dev_guide/배포가이드.md)** - 대시보드 배포 가이드
8. **[docs/dev_guide/트레이딩봇_수정이력.md](docs/dev_guide/트레이딩봇_수정이력.md)** - 트레이딩봇 변경 이력
9. **[dashboard/docs/dev_guide/변경이력.md](dashboard/docs/dev_guide/변경이력.md)** - 대시보드 변경 이력

---

## 🛠️ 기술 스택

### 트레이딩 봇 (Python 3.11+)

**핵심 라이브러리:**
- **AI/ML**: `openai`, `google-generativeai`
- **거래소**: `pyupbit` (Upbit API)
- **데이터베이스**: `postgrest` (Supabase PostgreSQL)
- **데이터 분석**: `pandas`, `numpy`
- **기술지표**: `ta` (Technical Analysis)
- **차트**: `selenium` (Chrome WebDriver)
- **로깅**: Python `logging` (ProcessContextFilter)

### 웹 대시보드 (TypeScript)

**프론트엔드:**
- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript 5.x
- **스타일**: Tailwind CSS 4
- **상태관리**: Zustand
- **데이터 페칭**: SWR (비용 Zero - Realtime 대신)
- **차트**: Recharts
- **테이블**: TanStack Table v8
- **마크다운**: react-markdown, remark-gfm

**백엔드:**
- **데이터베이스**: Supabase PostgreSQL
  - Row Level Security (RLS)
  - RPC 함수 (방문자 카운터)

### 인프라

- **호스팅**: Vercel (Next.js 대시보드)
- **데이터베이스**: Supabase (PostgreSQL, 서울 리전)
- **소스 관리**: GitHub
- **봇 실행**: 로컬 PC / AWS EC2
- **CI/CD**: Vercel Auto Deploy (GitHub main 브랜치)

---

## 💡 주요 기능

### 🤖 AI 매매 시스템

#### Process1 (5분마다 실시간 모니터링)
- 시장 급변 감지 (급등/급락)
- 손익 트리거 체크 (익절/손절)
- 서킷브레이커 관리 (일일 최대 손실 -5%, 연속 손실 3회)
- 자투리 잔고 청산
- 매매 실행

#### Process2 (AI 매매 판단 - 워뇨띠 전략)
1. 상황 인지 (시장 국면, 공포/탐욕 지수)
2. 전술 판단 (매수/매도/보류)
3. 진입 타이밍 (120일선, RSI, 호가 불균형)
4. 포지션 규모 (확신도, 리스크)
5. 출구 전략 (익절/손절 계획)

#### CIO (Chief Investment Officer - 1일 1회)
- **Part 0**: 코인 정체성 분석 (섹터, 시총, 유동성)
- **Part 1**: 전략적 자산 배분 (GPT보유비중 설정)
- **Part 2**: 리스크 관리 (목표 수익률/손절률)
- **AI 자동편입**: Dual Funnel (Momentum + Quality)

### 🎯 고급 거래 로직

1. **Auto-escalation** (목표 달성 10배 가속)
   - gap >= 20%p: 3배 가속
   - gap >= 10%p: 2배 가속
   - gap >= 5%p: 1.5배 가속

2. **Smart Fractional** (65% 최소 보장)
   - 목표 갭의 65%를 1회 매수로 보장

3. **TWAP** (Time-Weighted Average Price)
   - 3회 분할 실행 → DB에 1건 통합 기록

4. **Dynamic Trailing Stop**
   - ATR 기반 동적 거리 조정 (2~8%)
   - Profit-Only Trailing Stop

### 🔍 AI 자동편입 (Dual Funnel System)

**Momentum Funnel (모멘텀 헌터)**:
- 4시간 가격 변화율 × 거래량 비율
- 상승 코인만 선별 (하락/보합 제외)
- 거래량 급증 필터 (1.0배 이상)

**Quality Funnel (퀄리티 컴파운더)**:
- 120일선 위 + 최소 거래대금 30억
- log(거래대금) × (1 / 변동성)
- 안정적 성장주 선별

---

## 🎨 웹 대시보드 (3개 페이지)

### 1. /dashboard (시장 상황실)
**목표**: 3초 안에 전체 상황 파악
- 포트폴리오 요약 (4개 카드)
- 시스템 메트릭 (승률, 손익비, 24h 거래, 평균 보유기간)
- AI CIO 최신 전략
- 주요 거래 5건
- 시장 지표 (공포탐욕지수, BTC도미넌스, 김치프리미엄)

### 2. /analysis (AI 분석실)
**목표**: 30초 안에 심층 분석
- 날짜/거래유형 필터 (기본 7일)
- 코인별 손익 막대 차트
- 수익률 추세 차트
- 코인별 상세 통계 (승률, 손익비)
- AI 매매 패턴 분석
- TanStack Table v8 (정렬, 검색, 행 확장)

### 3. /portfolio (AI CIO 전략실)
**목표**: AI CIO 전략 중심 관리
- 최신 전략 하이라이트 (확장/축소 토글)
- 수익률 게이지 차트 (누적, 승률, 일일)
- 포트폴리오 구성 도넛 차트 (원화 vs 코인)
- AI 자가 평가 (강점, 약점, 교훈)
- 날짜별 과거 데이터 조회

---

## 📊 최신 업데이트 (v2.0.4)

### ✅ 대시보드 v2.0.4 완료 (2025-10-24)

**Phase 1-4 완료 (2025-10-16)**:
- 3개 페이지 구조 완성 (Dashboard, Analysis, Portfolio)
- 17개 컴포넌트 생성
- TanStack Table v8, Zustand, Recharts 통합
- Props 기반 아키텍처 (Context API 제거)
- Supabase Timestamp 쿼리 최적화

**UX 개선 (2025-10-22)**:
- 로고 홈 버튼 변환
- 분석 기간 7일 기본값 (모바일 최적화)
- 빠른 링크 실용화 (CoinMarketCap, 한국은행)
- 전문 용어 사용 (강세장/약세장/박스권)
- 손익 기반 동적 색상
- 모바일 툴팁 추가 (10px, 3-5단어)
- '청산' 용어 제거 (실제 DB 데이터 일치)

**YouTube & 방문자 카운터**:
- 유튜브 채널 배너 추가
- RPC 함수 (increment_page_view, get_page_view_count)
- 세션 기반 중복 방지

### ✅ 트레이딩봇 v2.0 완료 (2025-10-20)

**모듈화 완료**:
- ai_strategy (4,996줄 → 9파일)
- data_manager (3,006줄 → 9파일)
- 프롬프트 외부화 (4개 .txt)

**문서 정리**:
- docs/dev_guide/ (핵심 5개 파일)
- dashboard/docs/dev_guide/ (2개 파일)
- 문서 3-Level 구조화

---

## 💬 지원 및 문의

### 문제가 발생하면?

1. **[docs/dev_guide/README.md](docs/dev_guide/README.md)** - 개발 규칙 확인
2. **[dashboard/docs/dev_guide/배포가이드.md](dashboard/docs/dev_guide/배포가이드.md)** - 문제 해결 섹션
3. **로컬 빌드 테스트**: `npm run build`로 에러 확인

### 관련 링크

**서비스:**
- [Live Dashboard](https://aitrade-liard.vercel.app)
- [GitHub Repository](https://github.com/mypsj-hub/aitrade)

**API 문서:**
- [Upbit API](https://docs.upbit.com/)
- [OpenAI API](https://platform.openai.com/docs/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Supabase API](https://supabase.com/docs)

---

## 🔐 보안 및 비용

### Supabase Row Level Security (RLS)

```sql
-- 대시보드 (읽기 전용)
ANON_KEY → SELECT only

-- 트레이딩 봇 (읽기/쓰기)
SERVICE_ROLE_KEY → SELECT, INSERT, UPDATE, DELETE
```

### 무료 플랜으로 운영 가능

- **Vercel** (Hobby): **$0/월** (100GB 대역폭)
- **Supabase** (Free Tier): **$0/월** (500MB DB)
- **총 비용**: **$0/월** ✅

---

**📅 Last Updated**: 2025-10-24
**📦 Version**: v2.0.4 (대시보드 v2.0.4 + 트레이딩봇 v2.0 + 문서 구조 재편)
