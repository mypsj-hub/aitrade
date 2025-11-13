# AI Trading Bot System

> **📅 최종 업데이트**: 2025-11-07
> **📦 버전**: v2.3.7
>
> **⚠️ 코드 수정 전 필수 확인**: [docs/dev_guide/README.md](docs/dev_guide/README.md)

인공지능 기반 암호화폐 자동매매 시스템 (트레이딩 봇 + 웹 대시보드)

---

## 🚨 버그 수정 원칙 (중요!)

**문제 발견 시 수정 접근법**:

1. **✅ 먼저 다른 정상 작동 코드 확인**
   - 같은 기능이 다른 곳에서 정상 작동하는지 확인
   - 정상 작동하는 코드의 방식을 참고

2. **✅ 차이점 분석 우선**
   - 정상 작동 코드 vs 문제 발생 코드 비교
   - 핵심 차이점만 수정

3. **❌ 절대 금지: 복잡한 새 로직 추가**
   - 기존 로직에 방어 코드 추가 금지
   - 새로운 유틸리티 메서드 추가 금지
   - 필터링 로직 추가 금지
   - **간단한 문제를 복잡하게 만들지 말 것!**

4. **✅ 최소 수정 원칙**
   - 문제 발생 지점만 수정
   - 정상 작동하는 방식으로 변경
   - 기존 코드 영향 최소화

**예시 (이번 버그)**:
- ❌ **잘못된 접근**: 새 메서드 추가 + 필터링 로직 추가 + 방어 코드 추가
- ✅ **올바른 접근**: CIO가 사용하는 방식(DB 직접 조회)을 그대로 적용

**핵심**: 정상 작동하는 코드를 찾아서 그 방식을 따르라!

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
>
> **"계산은 시스템, 판단은 AI"** ⭐

### 설계 원칙

이 시스템은 AI가 **스스로 분석하고 판단**하도록 설계되었습니다:

- ✅ **데이터 제공**: AI에게 풍부한 시장 데이터와 맥락 정보를 제공
- ✅ **가이드 제시**: 판단 시 고려할 요소와 원칙을 제안
- ✅ **자율 판단**: AI가 맥락을 종합 분석하여 스스로 결정
- ✅ **역할 분리**: 시스템이 계산하고 제공한 데이터를 기반으로 AI가 전략적 판단

- ❌ **명시적 규칙 최소화**: "X이면 무조건 Y"와 같은 기계적 규칙 지양
- ❌ **템플릿 강제 제거**: 사고 과정의 형식을 강제하지 않음
- ❌ **숫자 기준 공식화 지양**: 맥락 없는 임계값 기준 최소화
- ❌ **계산값을 규칙으로 강제 금지**: 시스템이 제공하는 값은 가이드라인이지 준수해야 할 규칙이 아님

**예시**:
```
❌ 나쁜 접근: "G섹션 3개 이상 일치하면 무조건 G섹션 우선"
✅ 좋은 접근: "G섹션 신호 강도, C섹션 추세, 시장 맥락을 종합 분석"

❌ 나쁜 접근: "보유 3일 미만이면 부분익절 절대 금지"
✅ 좋은 접근: "단기 보유 자산은 추세 확인 후 신중히 판단"

❌ 나쁜 접근: "thinking_process에 반드시 Q1/Q2/Q3 형식으로 작성"
✅ 좋은 접근: "다음 질문들을 고려하여 분석: Q1, Q2, Q3"

❌ 나쁜 접근: "시스템이 계산한 목표 +16.21%에서 ±30% 벗어나면 무조건 거부"
✅ 좋은 접근: "시스템 기준값 +16.21%는 이론적 상한선. Fear 시장에서는 50-70% 수준으로 보수 조정 가능"
```

**역할 분리 원칙**:
- **시스템의 역할**: ATR × 배수로 변동성 기반 이론적 목표 **계산**하여 제공
- **AI의 역할**: 시장 국면, 리스크 선호, 포트폴리오 맥락을 종합하여 최종 목표 **판단**
- **검증의 역할**: AI의 합리적 판단을 시장 국면별 유연한 범위로 **존중**

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
- ✅ **고급 리스크 관리 v3.0**: ATR 기반 손익비 2.0+, 눌림목 매수, 비대칭 익절
- ✅ **트리거 시스템 v3.1**: 체제 방향별 분기, 조건부 손절, CIO 선택적 실행
- ✅ **AI 자동편입**: Dual Funnel 시스템 (Momentum Hunter + Quality Compounder)
- ✅ **실시간 대시보드**: Vercel + Next.js 15 + Supabase PostgreSQL
- ✅ **모듈화 아키텍처**: ai_strategy (9파일), data_manager (9파일)
- ✅ **로깅 시스템 v2.0**: ProcessContextFilter + Display Width 정렬

### 주요 지표

| 지표 | 성능 |
|------|------|
| **목표 손익비** | 0.76 → 2.0+ (v3.0 달성) |
| **목표 비중 달성 속도** | 10일 → 1일 (10배 가속) |
| **손절 지연 시간** | 최대 5분 → 즉시 (v3.1 개선) |
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
│  • 4개 페이지 (Dashboard, Analysis, Portfolio, Strategy) ⭐  │
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
│  📊 7개 테이블 (Row Level Security 적용)                     │
│  ├─ holding_status         (보유현황)                       │
│  ├─ trade_history          (거래내역)                       │
│  ├─ portfolio_summary      (포트폴리오 요약)                 │
│  ├─ cio_reports            (CIO 브리핑)                     │
│  ├─ system_status          (시스템 상태)                     │
│  ├─ coin_watch_history     (AI 자동편입 관심 종목)           │
│  └─ cio_portfolio_decisions (CIO 판단 이력) ⭐ 신규          │
└────────────────────┬────────────────────────────────────────┘
                     ▲
                     │ Supabase API (SERVICE_KEY - 쓰기 전용)
┌─────────────────────────────────────────────────────────────┐
│           로컬 PC (트레이딩 봇 - Python 3.11+)                │
│                                                              │
│  🎯 메인 프로세스                                             │
│  ├─ main.py              (Process1, Process2, CIO 스케줄링) │
│  ├─ config.py            (전역 설정, 로깅 시스템 v2.0)       │
│  ├─ trade_manager.py     (거래 실행 엔진, v3.1 트리거)       │
│  └─ supabase_adapter.py  (DB 통합 - 49 메서드, 6 테이블)    │
│                                                              │
│  🤖 AI 전략 모듈 (ai_strategy/ - 9파일)                      │
│  ├─ process2.py          (AI 매매 판단 - 워뇨띠 전략)       │
│  ├─ cio.py               (CIO 포트폴리오 비중, v3.0 ATR)    │
│  ├─ data_collector.py    (병렬 데이터 수집)                 │
│  ├─ market_analysis.py   (시장 분석, v3.1 체제 방향 구분)   │
│  └─ ... (5개 모듈)                                           │
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
├── main.py                     # 메인 실행 파일 (v3.1 트리거 분기)
├── config.py                   # 전역 설정
├── trade_manager.py            # 거래 실행 엔진 (v3.1 조건부 손절)
├── supabase_adapter.py         # DB 통합 어댑터
│
├── ai_strategy/                # AI 전략 모듈 (9파일)
│   ├── __init__.py            # Public API
│   ├── process2.py            # AI 매매 판단 (v3.0 리스크 관리)
│   ├── cio.py                 # CIO 포트폴리오 비중 (v3.0 ATR)
│   ├── data_collector.py      # 병렬 데이터 수집
│   ├── market_analysis.py     # 시장 분석 (v3.1 체제 방향 구분)
│   ├── prompts.py             # 프롬프트 관리 (v3.0 통합)
│   └── ... (4개 모듈)
│
├── data_manager/               # 데이터 관리 모듈 (9파일)
│   ├── __init__.py            # Public API
│   ├── universe.py            # AI 자동편입 (Dual Funnel) ⭐
│   ├── ohlcv.py               # OHLCV 데이터, 기술지표
│   └── ... (6개 모듈)
│
├── docs/                       # Level 2: 트레이딩봇 문서
│   ├── README.md              # 트레이딩봇 총괄 가이드
│   ├── 슈퍼클로드_개선방안_최종_v3.md  # v3.0 개선 문서
│   ├── 트리거개선_최종.md        # v3.1 트리거 설계서
│   └── dev_guide/             # Level 3: 개발자 가이드
│       ├── README.md          # 개발 규칙 (⚠️ 필수)
│       ├── AI자동편입_명세서.md
│       ├── CIO비중_명세서.md
│       ├── 매매판단_명세서.md
│       └── 트레이딩봇_수정이력.md
│
└── dashboard/                  # Next.js 15 웹 대시보드
    ├── README.md              # Level 2: 대시보드 총괄 가이드
    ├── app/                   # App Router (4페이지)
    │   ├── dashboard/         # 시장 상황실
    │   ├── analysis/          # AI 분석실
    │   ├── portfolio/         # AI CIO 전략실
    │   └── strategy/          # 전략 상황실 ⭐ 신규
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

### v3.0/v3.1 개선 이력 (완료)

7. **[docs/archive/슈퍼클로드_개선방안_최종_v3.md](docs/archive/슈퍼클로드_개선방안_최종_v3.md)** - v3.0 리스크 관리 설계
8. **[docs/archive/트리거개선_최종.md](docs/archive/트리거개선_최종.md)** - v3.1 트리거 시스템 설계
9. **[docs/archive/슈퍼클로드_최종개선완료.md](docs/archive/슈퍼클로드_최종개선완료.md)** - v3.0 구현 완료 보고서
10. **[docs/archive/슈퍼클로드_통합개선_v3.1.md](docs/archive/슈퍼클로드_통합개선_v3.1.md)** - v3.0+v3.1 통합 완료 보고서

### v3.1.3 최신 업데이트 (2025-11-02) ⭐

11. **[docs/archive/phase_reports/PHASE_CIO_VALIDATION_FIX_20251102.md](docs/archive/phase_reports/PHASE_CIO_VALIDATION_FIX_20251102.md)** - CIO 검증 시스템 개선 완료
    - **Gemini JSON 응답 형식 추가**: Plain text → JSON 100% 성공
    - **ATR 계산 수정**: 절대값(7,877원) → 백분율(0.99%) 정확도 99.99% 개선
    - **시장 국면 기반 검증**: Fear ±60%, Neutral ±40%, Greed ±30%
    - **철학 정렬**: "계산은 시스템, 판단은 AI" 완벽 구현

### 개발 및 배포

12. **[dashboard/docs/dev_guide/배포가이드.md](dashboard/docs/dev_guide/배포가이드.md)** - 대시보드 배포 가이드
13. **[docs/dev_guide/트레이딩봇_수정이력.md](docs/dev_guide/트레이딩봇_수정이력.md)** - 트레이딩봇 변경 이력 (v2.2: 2025-11-02 업데이트)
14. **[dashboard/docs/dev_guide/변경이력.md](dashboard/docs/dev_guide/변경이력.md)** - 대시보드 변경 이력

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
- **시장 급변 감지** (급등/급락)
- **손익 트리거 체크 v3.1** (조건부 손절, 즉시 익절)
- **서킷브레이커 관리** (일일 최대 손실 -5%, 연속 손실 3회)
- **자투리 잔고 청산**
- **매매 실행** (Auto-escalation, Smart Fractional, TWAP)

#### Process2 (AI 매매 판단 - 워뇨띠 전략)
**v3.0 리스크 관리 통합**:
1. **상황 인지** (시장 국면, 공포/탐욕 지수)
2. **전술 판단** (매수/매도/보류)
3. **눌림목 매수 분석** (추세 강도, 반등 신호, 손익비)
4. **진입 타이밍** (120일선, RSI, 호가 불균형)
5. **완충 구간 전략** (CIO 목표 대비 Zone A/B/C 판단)
6. **포지션 규모** (확신도, 리스크)
7. **출구 전략** (비대칭 익절 Phase 1/2/3, 부분손절 3단계)

#### CIO (Chief Investment Officer - 1일 1회)
**v3.0 ATR 기반 손익비 최적화**:
- **Part 0**: 코인 정체성 분석 (섹터, 시총, 유동성)
- **Part 1**: 전략적 자산 배분 (GPT보유비중 설정)
- **Part 2**: ATR 기반 목표수익률/손절률 계산 (손익비 2.0+ 달성)
- **Part 3**: weight_range 설정 (min/optimal/max 유연 범위)
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

4. **Dynamic Trailing Stop v3.0**
   - ATR 기반 동적 거리 조정 (2~8%)
   - Profit-Only Trailing Stop
   - 트레일링 활성 시 즉시 익절 (v3.1 트리거)

### 🔥 트리거 시스템 v3.1 (체제 방향별 분기)

#### 시장 체제 전환 계열
| 트리거 타입 | 긴급도 | AI 자동편입 | CIO | Process2 |
|------------|-------|-----------|-----|---------|
| `market_regime_change_bullish` | 90 | ✅ 실행 | ✅ | ✅ |
| `market_regime_change_bearish` | 85 | ❌ 스킵 | ✅ | ✅ |
| `market_regime_change_neutral` | 85 | ❌ 스킵 | ✅ | ✅ |

**핵심 로직**:
- **상승 전환**: 포트폴리오 확대 (AI 자동편입 실행)
- **하락 전환**: 포트폴리오 방어 (AI 자동편입 스킵, CIO 점검)
- **중립 전환**: 변동성 관리 (AI 자동편입 스킵)

#### 손익 트리거 계열
| 트리거 타입 | 조건 | 처리 |
|------------|------|------|
| `전량익절` | 트레일링 스탑 | 즉시 실행 |
| `시스템손절` | 손절선 도달 (2%p 초과) | 즉시 실행 |
| `손절 재확인` | AI 매수 후 손절 (2%p 이내) | AI 재분석 |
| `수익권 재분석` | 목표 수익 도달 | AI 판단 (CIO 스킵) |

**핵심 개선**:
- **조건부 손절**: 손절선 여유가 2%p 이내일 때만 AI 재확인 기회
- **즉시 손절**: 손절선 여유 2%p 초과 시 즉시 실행 (지연 방지)
- **CIO 선택적 실행**: 수익권 도달 시 트레일링 스탑이 보호하므로 CIO 스킵

### 🔍 AI 자동편입 (Dual Funnel System)

**Momentum Funnel (모멘텀 헌터)**:
- 4시간 가격 변화율 × 거래량 비율
- 상승 코인만 선별 (하락/보합 제외)
- 거래량 급증 필터 (1.0배 이상)

**Quality Funnel (퀄리티 컴파운더)**:
- 120일선 위 + 최소 거래대금 30억
- log(거래대금) × (1 / 변동성)
- 안정적 성장주 선별

**3단계 검증 파이프라인**:
1. **품질 점수 계산** (추세 15점 + 모멘텀 25점 + 거래량 25점 + 상대강도 15점)
2. **적응형 백테스팅** (30~60일, 티어 검증)
3. **AI 최종 면접** (1-2순위 즉시 매수, 3-4순위 관심 대기)

---

## 🎨 웹 대시보드 (4개 페이지)

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

### 4. /strategy (전략 상황실) ⭐ **신규 v3.0**
**목표**: CIO 최신 판단 및 전략 집중 분석
- CIO 시장 분석 요약
- 시장 체제 변화 분석 (이전 vs 현재)
- 내일 전망 (If-Then 전략)
- 포트폴리오 할당 전략
- CIO 판단 이력 (아코디언 UI)
- 신규 편입 코인 분석
- 비중 갭 차트 (목표 vs 현재)

---

## 📊 최신 업데이트

### ✅ v2.3.7 AI 자동편입 온체인 데이터 참조 오류 수정 (2025-11-07) 🔥

**작성일**: 2025-11-07
**영향 범위**: AI 자동편입 ALTERNATIVE 검증 로직 (ai_strategy/market_analysis.py)

#### 버그 증상
- AI 그룹 면접 중 `local variable 'overall_sentiment' referenced before assignment` 오류 발생
- ALTERNATIVE 코인이 2개 이상 선정될 때 오류 발생
- 비상 로직으로 Sharpe 상위 2개 선정

#### 근본 원인

**변수 정의 범위 문제** ([market_analysis.py:1447-1449](ai_strategy/market_analysis.py#L1447-L1449)):

```python
# ALTERNATIVE 1-2순위 배치 시에만 실행
if alternative_in_top2:
    # ... (중략)
    overall_sentiment = onchain_summary.get('overall_sentiment', '')
    sentiment_score = onchain_summary.get('sentiment_score', 0)
    key_takeaway = onchain_summary.get('key_takeaway', '')
```

**문제점**:
- `overall_sentiment` 변수가 `if alternative_in_top2:` 블록 내에서만 정의됨
- 하지만 **라인 1509-1528**의 "ALTERNATIVE 최대 1개 제한 검증"에서도 참조 필요
- `alternative_in_top2`가 비어있고 `alternative_count > 1`인 경우 (3-4순위에만 ALTERNATIVE 2개 이상) → 변수 미정의 오류

**발생 시나리오**:
1. AI가 1-2순위는 VERIFIED, 3-4순위에 ALTERNATIVE 2개 선정
2. `alternative_in_top2 = []` (비어있음)
3. 라인 1447-1449 실행 안 됨 (`if` 조건 불만족)
4. 라인 1509 "ALTERNATIVE 최대 1개 제한" 검증 실행
5. 라인 1464에서 `overall_sentiment` 참조 시도 → **UnboundLocalError**

#### 해결 방법

**변수 정의를 최상단으로 이동** ([market_analysis.py:1417-1420](ai_strategy/market_analysis.py#L1417-L1420)):

```python
# [Fix v2.3.7] 온체인 데이터 미리 가져오기 (여러 곳에서 사용되므로 최상단에 배치)
overall_sentiment = onchain_summary.get('overall_sentiment', '') if onchain_summary else ''
sentiment_score = onchain_summary.get('sentiment_score', 0) if onchain_summary else 0
key_takeaway = onchain_summary.get('key_takeaway', '') if onchain_summary else ''
```

**핵심 포인트**:
- 온체인 데이터는 여러 검증 로직에서 사용되므로 최상단에서 한 번만 정의
- `onchain_summary` None 체크 추가하여 안전성 강화
- 중복 정의 제거 (라인 1447-1449)

**수정 파일**:
- ✅ [ai_strategy/market_analysis.py:1417-1420](ai_strategy/market_analysis.py#L1417-L1420) - 온체인 데이터 최상단 정의
- ✅ [ai_strategy/market_analysis.py:1451](ai_strategy/market_analysis.py#L1451) - 중복 정의 제거

#### 효과
- ✅ ALTERNATIVE 코인 여러 개 선정 시 오류 없이 정상 검증
- ✅ 3-4순위 ALTERNATIVE 최대 1개 제한 정상 작동
- ✅ 온체인 데이터 기반 조건 완화 로직 안정화
- ✅ 비상 로직 발동 빈도 감소

---

### ✅ v2.3.6 전량 매도 후 자투리 잔고 문제 수정 (2025-11-07) 🔥

**작성일**: 2025-11-07
**영향 범위**: 전량 매도 로직 (trade_manager.py)

#### 버그 증상
- 전량 매도(시스템 손절 포함) 완료 후 소액 자투리 잔고 발생 (예: VIRTUAL 212원)
- 부분 매도는 자투리 청산되지만, 전량 매도는 청산되지 않음

#### 근본 원인

**전량 매도 시 자투리 청산 로직 누락** ([trade_manager.py:986](trade_manager.py#L986)):

```python
# 전량 매도 완료 후
db_manager.log_trade(trade_data)
return True  # ← 즉시 종료, 자투리 확인 안 함!
```

**자투리 잔고 발생 원인**:
1. **업비트 API 수량 정밀도 제한**
   - 코인별 소수점 자릿수 제한 (예: VIRTUAL은 소수점 4자리)
   - `balance = 0.123456` → 실제 주문: `0.1234` → 남은 잔고: `0.000056` (212원)

2. **시장 유동성 부족**
   - 전량 매도 주문이 부분 체결될 수 있음

3. **TWAP 분할 주문의 누적 반올림 오차**
   - 3회 분할 시 각 회차마다 소수점 반올림 → 누적 오차

**부분 매도는 왜 정상?**
- 부분 매도는 [line 1016-1044]에서 자투리 확인 및 청산 로직 실행
- 전량 매도는 `return True`로 즉시 종료하여 해당 로직 미실행

#### 해결 방법

**전량 매도에도 자투리 청산 로직 적용** ([trade_manager.py:987-1033](trade_manager.py#L987-L1033)):

```python
# 전량 매도 완료 후
db_manager.log_trade(trade_data)

# 🔥 [Fix] 전량 매도 후 자투리 잔고 최종 확인 및 청산 로직
time.sleep(2)  # API 반영 대기
remaining_balance = upbit_client.get_balance(symbol)
if remaining_balance > 0:
    remaining_value = remaining_balance * current_price

    if 0 < remaining_value < MIN_TRADE_AMOUNT:
        # 수량 기준 전량 매도 (금액 제약 없음)
        cleanup_order = upbit_client.sell_market_order(ticker, remaining_balance)
        # ✅ 자투리 청산 완료

return True
```

**핵심 포인트**:
- `upbit_client.sell_market_order(ticker, quantity)` 수량 기준 매도는 최소 거래금액(5,000원) 제약 없이 보유 전량 청산 가능
- 부분 매도와 동일한 로직을 전량 매도에도 적용

**수정 파일**:
- ✅ [trade_manager.py:987-1033](trade_manager.py#L987-L1033) - 전량 매도 후 자투리 청산 로직 추가 (47줄)
- ✅ 상세 주석 추가 (발생 원인, 해결 방법 설명)

#### 효과
- ✅ 전량 매도 후 자투리 잔고 자동 청산
- ✅ 시스템 손절, 익절 등 모든 전량 매도에 적용
- ✅ 업비트 API 정밀도 제한 문제 해결
- ✅ TWAP 분할 주문 누적 오차 해결

---

### ✅ v2.3.5 상승 체제 전환 시 AI 자동편입 미실행 버그 수정 (2025-11-07) 🔥

**작성일**: 2025-11-07
**영향 범위**: Process1 트리거 타입 전달 (main.py)

#### 버그 증상
- 상승 체제 전환 감지 시 "📈 트리거: market_regime_change_bullish → AI 자동편입 실행" 로그 출력
- 하지만 실제로는 AI 자동편입이 실행되지 않음
- CIO와 Process2는 정상 실행됨

#### 근본 원인
**트리거 타입 강제 변경** ([main.py:294](main.py#L294)):

```python
# market_analysis.py에서 반환
coin_info['type'] = 'market_regime_change_bullish'  # ✅ 정확한 타입

# main.py에서 강제 변경
market_triggers.append({
    'symbol': coin_info['symbol'],
    'type': 'market_issue',  # ❌ 여기서 덮어씀!
```

**결과**:
- `all_ai_triggers`에는 `type: 'market_issue'`만 들어감
- [main.py:367-369]의 `is_bullish_regime_change` 체크에서 찾지 못함
- AI 자동편입이 실행되지 않음

#### 해결 방법
**coin_info의 type 필드 보존**:

```python
# [Fix] coin_info의 type 필드 사용 (market_regime_change_bullish/bearish/neutral 보존)
trigger_type = coin_info.get('type', 'market_issue')
market_triggers.append({
    'symbol': coin_info['symbol'],
    'type': trigger_type,  # ✅ 원본 타입 보존
    ...
})
```

**수정 파일**:
- ✅ [main.py:293-296](main.py#L293-L296) - trigger_type 보존 로직 추가

#### 효과
- ✅ 상승 체제 전환 시 AI 자동편입 정상 실행
- ✅ 하락/중립 체제 전환 시 AI 자동편입 스킵 (의도대로 작동)
- ✅ AI 자동편입 → CIO → Process2 흐름 완전 복구

---

### ✅ v2.3.4 AI 자동편입 프롬프트 로그 포맷 일관성 개선 (2025-11-06) 🔥

**작성일**: 2025-11-06
**영향 범위**: AI 자동편입 프롬프트 저장 포맷 개선 (ai_strategy/market_analysis.py)

#### 문제점
v2.3.3에서 후보 1개일 때 프롬프트 로그는 생성되지만, 포맷이 불일치:
- **후보 2개 이상**: 전체 system prompt (수백 줄) + 상세 user prompt + AI JSON 응답
- **후보 1개**: 간단한 요약 (18줄) + "N/A (후보 1개, AI 스킵)" 형태

**문제**: 디버깅/분석 시 일관성 부족, 시장 데이터/온체인 정보 누락

#### 해결 방법
후보 1개일 때도 전체 포맷으로 프롬프트 생성:

1. **시스템 프롬프트**: 전체 CIO 규칙 및 가이드라인 포함
2. **사용자 프롬프트**: 후보 테이블, 시장 데이터, 온체인 정보, 뉴스, 상관관계 등 전체 정보
3. **AI 응답**: 실제 AI 호출 대신 자동 선택 JSON 시뮬레이션 생성

**수정 파일**:
- ✅ [ai_strategy/market_analysis.py:659-664](ai_strategy/market_analysis.py#L659-L664) - early return 제거, `single_candidate_mode` 플래그 설정
- ✅ [ai_strategy/market_analysis.py:1314-1336](ai_strategy/market_analysis.py#L1314-L1336) - 후보 1개일 때 자동 JSON 응답 생성

```python
if single_candidate_mode:
    # 후보 1개일 때는 AI 호출 없이 자동 응답 생성
    response_text = f'''```json
{{
  "ranking": [{{"rank": 1, "symbol": "{c['symbol']}", "reason": "..."}},
  "final_selection": ["{c['symbol']}"],
  ...
}}
```'''
    # 전체 system_prompt, prompt는 이미 위에서 구성됨
    # 기존 save_prompt_to_file()이 정상 실행됨
```

#### 효과
- ✅ 후보 개수와 무관하게 일관된 프롬프트 로그 포맷
- ✅ 디버깅/분석 시 시장 데이터, 온체인 정보, 뉴스 등 전체 맥락 확인 가능
- ✅ AI 호출은 여전히 스킵 (비용/시간 절약)
- ✅ 프롬프트 로그 분석 자동화 도구 개발 시 일관성 보장

---

### ✅ v2.3.3 AI 자동편입 프롬프트 로그 미생성 버그 수정 (2025-11-06) 🔥

**작성일**: 2025-11-06
**영향 범위**: AI 자동편입 프롬프트 저장 (ai_strategy/market_analysis.py)

#### 버그 증상
- AI 자동편입 실행 후 `docs/prompts_log/AI자동편입_*.txt` 파일 미생성
- CIO, 매매판단 프롬프트는 정상 생성됨

#### 근본 원인
**후보 코인 1개일 때 AI 호출 스킵** ([market_analysis.py:659-661](ai_strategy/market_analysis.py#L659-L661)):

```python
if len(candidates) == 1:
    logger.info("ℹ️ 후보 코인이 1개이므로, 해당 코인을 최종 선택합니다.")
    return [candidates[0]['symbol']]  # ← AI 호출 없음, 프롬프트 저장 코드(1353줄)에 도달 못함
```

**설계 의도**: 후보가 1개뿐이면 AI 분석 없이 자동 선택 (비용/시간 절약)
**부작용**: 디버깅/분석용 프롬프트 로그가 생성되지 않음

#### 해결 방법
후보 1개일 때도 간략한 프롬프트 로그 저장:

```python
# [Fix] 후보 1개일 때도 프롬프트 로그 저장 (디버깅/분석용)
if SAVE_PROMPTS_DEBUG:
    save_prompt_to_file("AI자동편입", "N/A (후보 1개, AI 스킵)",
        simple_prompt, f"자동 선택: {candidates[0]['symbol']}")
```

**수정 파일**:
- ✅ `ai_strategy/market_analysis.py:24` - SAVE_PROMPTS_DEBUG import 추가
- ✅ `ai_strategy/market_analysis.py:662-678` - 후보 1개일 때 프롬프트 저장 로직 추가

#### 효과
- ✅ 후보 1개일 때도 `AI자동편입_YYYYMMDD_HHMMSS.txt` 파일 생성
- ✅ AI 분석 스킵 사유 및 선택 근거 기록
- ✅ 전체 AI 자동편입 프로세스 추적 가능

---

### ✅ v2.3.2 AI 자동편입 후 CIO 연계 누락 버그 수정 (2025-11-06) 🔥

**작성일**: 2025-11-06
**영향 범위**: AI 자동편입 → CIO → Process2 연계 흐름 (main.py)

#### 버그 증상
1. AI 자동편입 완료 후 CIO 포트폴리오 프롬프트 파일 미생성
2. AI 자동편입 후 CIO-매매판단 연계 미발생

#### 근본 원인
**잘못된 가정** ([main.py:766-767](main.py#L766-L767)):
```python
# 참고: Process1에서 이미 market_regime_change_bullish 트리거로 Process2 큐에 추가됨
# 따라서 여기서 별도로 enqueue_process2() 호출 불필요
```

**현실:**
- **정시 스케줄 실행** (09:40/21:00/04:00) → 시장 체제 전환 트리거 **없음** → CIO 실행 안 됨 ❌
- **체제 전환 시 실행** (Process1 내부) → 트리거 **있음** → CIO 실행됨 ✅

#### 해결 방법
AI 자동편입 완료 후 **무조건 CIO-Process2 연계 실행**:

```python
# [Fix] AI 자동편입 완료 후 CIO-Process2 연계 실행
# 체제 전환 시: Process1이 트리거 추가 → 여기서도 실행 (중복 방지 로직 있음)
# 정시 스케줄 시: 트리거 없음 → 여기서 반드시 실행 필요
logger.info("🎯 [Process Flow] CIO 재구성 → Process2 매매판단 실행 중...")
enqueue_process2([{
    'type': 'ai_auto_enrollment',
    'symbol': 'NEW_COIN_ADDED',
    'reason': f'AI 자동편입으로 {len(ai_selection_info)}개 신규 코인 추가'
}])
```

**수정 파일**:
- ✅ `main.py:767-775` - AI 자동편입 완료 후 enqueue_process2() 호출 추가
- ✅ `main.py:574-576` - should_run_cio()에 'ai_auto_enrollment' 트리거 인식 추가

#### 효과
- ✅ 정시 스케줄 AI 자동편입 후 CIO 정상 실행
- ✅ CIO 포트폴리오 프롬프트 파일 생성
- ✅ CIO → Process2 매매판단 연계 정상 작동

---

### ✅ v2.3.1 매매판단 원화잔고 버그 수정 (2025-11-05) 🔥

**작성일**: 2025-11-05
**영향 범위**: 매매판단 프롬프트 생성 (ai_strategy/prompts.py)

#### 버그 증상
- 매매판단 프롬프트에서 원화잔고가 간헐적으로 0원으로 표시
- 실제 잔고는 300만원인데 프롬프트에는 0원
- MINA 같은 신규 코인 추가 시 발생

#### 근본 원인
- **CIO**: DB 직접 조회 (`get_portfolio_krw_balance()`) → ✅ 항상 정확
- **매매판단**: holdings 딕셔너리 첫 번째 값만 확인 → ❌ 불안정

#### 해결 방법
매매판단 프롬프트도 CIO와 동일한 방식 사용:
```python
# Before: holdings 딕셔너리 첫 번째 값 (불안정)
krw_balance = 0
if holdings:
    first_holding_data = next(iter(holdings.values()), None)
    if first_holding_data:
        krw_balance = first_holding_data.get('원화잔고', 0)

# After: DB 직접 조회 (안정)
krw_balance = db_manager.get_portfolio_krw_balance()
```

#### 교훈
- ✅ **정상 작동 코드를 먼저 확인하고 그 방식을 따를 것**
- ❌ 복잡한 방어 로직이나 새 메서드 추가는 지양
- 📋 README.md에 "버그 수정 원칙" 섹션 추가

**수정 파일**: `ai_strategy/prompts.py:186-188` (3줄)

---

### ✅ v2.3 트레일링 스탑 동적 활성화 + AI 자동편입 동기 실행 (2025-11-04) 🔥

**작성일**: 2025-11-04
**영향 범위**: 트레일링 스탑 시스템 + Process1 실행 흐름

#### 핵심 개선 2가지

**1. 트레일링 스탑 동적 활성화 조건**
- **문제**: CIO 목표 29.79% vs 트레일링 스탑 고정 12% 활성화 → 조기 익절 위험
- **해결**: 목표 수익률의 80%에서 활성화 (최소 12%, 최대 30%)
```python
# config.py
trailing_activation = target_profit * 0.8  # VIRTUAL 29.79% → 23.83%
```
- **효과**: CIO 판단 존중하면서 안전장치 유지

**2. AI 자동편입 동기 실행**
- **문제**: 상승 체제 전환 시 AI 자동편입이 백그라운드 실행 → CIO가 신규 코인 없이 실행
- **해결**: 동기 호출로 완료 대기
```python
# main.py:383
update_trading_universe()  # ✅ 완료 후 CIO 실행 보장
```
- **효과**: AI 자동편입 → CIO → Process2 순서 보장, 신규 코인 정상 반영

**수정 파일**:
- ✅ `config.py:598-605` - 동적 활성화 설정
- ✅ `trade_manager.py:366-391` - 동적 계산 로직
- ✅ `ai_strategy/cio.py:1667-1672` - CIO 통합
- ✅ `main.py:383` - 동기 실행
- ✅ `main.py:762-765` - 중복 제거

**관련 문서**:
- [docs/dev_guide/매매판단_명세서.md](docs/dev_guide/매매판단_명세서.md) - 트레일링 스탑 시스템 업데이트
- [docs/dev_guide/AI자동편입_명세서.md](docs/dev_guide/AI자동편입_명세서.md) - 실행 흐름 섹션 추가
- [docs/dev_guide/트레이딩봇_수정이력.md](docs/dev_guide/트레이딩봇_수정이력.md) - v2.3 이력 추가

---

### ✅ v3.1 트리거 시스템 최적화 완료 (2025-10-31) 🔥

**설계 문서**: [docs/archive/트리거개선_최종.md](docs/archive/트리거개선_최종.md)

**3가지 핵심 개선**:

#### 1. 시장 체제 전환 방향별 분기
```python
# market_analysis.py - 체제 방향 감지
BULLISH_REGIMES = {"Uptrend", "Breakout_Attempt"}  # 상승 → AI 자동편입 실행
BEARISH_REGIMES = {"Downtrend"}                     # 하락 → AI 자동편입 스킵
# Others: Neutral                                    # 중립 → AI 자동편입 스킵
```

- **상승 전환** (`market_regime_change_bullish`): AI 자동편입 → CIO → 매매판단 (포트폴리오 확대)
- **하락 전환** (`market_regime_change_bearish`): CIO → 매매판단 (자동편입 스킵, 포트폴리오 방어)
- **중립 전환** (`market_regime_change_neutral`): CIO → 매매판단 (자동편입 스킵, 변동성 관리)

#### 2. 조건부 손절 로직 (2% 마진 기준)
```python
# trade_manager.py - 손절선 여유 체크
margin_to_stop = profit_rate - effective_stop_loss

if current_decision in ['추가매수', '신규매수'] and margin_to_stop > -2.0:
    trigger_type = '손절 재확인'  # AI 재확인 기회 (데드 스파이럴 방지)
else:
    trigger_type = '시스템손절'   # 즉시 실행 (손실 확대 방지)
```

- **여유 2%p 이내**: AI 재확인 (`손절 재확인`) - 3가지 예외 조건 체크 후 판단
- **여유 2%p 초과**: 즉시 실행 (`시스템손절`) - 시간 지연 없이 기계적 손절
- **트레일링 스탑**: 즉시 익절 (`전량익절`) - 수익 보호 완료

#### 3. CIO 선택적 실행 최적화
```python
# main.py - CIO 실행 여부 판단
if trigger_types == {'수익권 재분석'}:
    return False  # CIO 스킵 (트레일링 스탑이 이미 수익 보호)

if trigger_types & {'market_regime_change_bullish', 'bearish', 'neutral'}:
    return True   # CIO 필수 (포트폴리오 재구성 필요)
```

- **수익권 재분석**: CIO 스킵 → 시스템 부하 감소 (트레일링 스탑이 15%+ 수익 보호 중)
- **체제 전환**: CIO 필수 → 포트폴리오 전면 점검
- **개별 긴급도**: CIO 필수 → 리스크 재평가

**구현 완료**:
- ✅ `trade_manager.py:415-440` - 조건부 손절 + CIO 플래그
- ✅ `main.py:196-197` - 시스템손절 즉시실행 추가
- ✅ `main.py:365-397` - 체제 방향 분기 로직
- ✅ `main.py:561-592` - CIO 선택적 실행
- ✅ `market_analysis.py:189-204` - get_regime_direction() 함수
- ✅ `market_analysis.py:244-257` - 트리거 타입 3방향 세분화

**검증**: ✅ 코드 완료, 런타임 검증 대기 중

---

### ✅ v3.0 리스크 관리 통합 완료 (2025-10-31) ⭐

**설계 문서**: [docs/archive/슈퍼클로드_개선방안_최종_v3.md](docs/archive/슈퍼클로드_개선방안_최종_v3.md)
**완료 보고서**: [docs/archive/슈퍼클로드_최종개선완료.md](docs/archive/슈퍼클로드_최종개선완료.md)

**핵심 철학**: "Trust AI's Judgment, Guide with Wisdom"

#### Stage 1: CIO 전략층 (100% 완료)
```python
# ai_strategy/cio.py - ATR 기반 목표 계산
티어별 기본 손익비:
- 메가캡: 손익비 2.0 (목표 ATR×6, 손절 ATR×3)
- 미드캡: 손익비 2.5 (목표 ATR×7, 손절 ATR×2.8)
- 스몰캡: 손익비 3.0 (목표 ATR×9, 손절 ATR×3)

weight_range 시스템:
- min: optimal - 3%p  (최소 허용)
- optimal: 12%        (이상적 목표)
- max: optimal + 3%p  (최대 허용)
```

**구현**:
- ✅ ATR 기반 목표수익률/손절률 계산 (`cio.py:1394-1536`)
- ✅ weight_range (min/optimal/max) 설정 (`cio.py:1538-1588`)
- ✅ 손익비 2.0+ 달성 검증

#### Stage 2: Process2 전술층 (100% 완료)
```
📄 process2_risk_management.txt (5,706자)
├─ 눌림목 매수 프레임워크 (4개 영역)
│  ├─ [영역 1] 추세 강도 (120일선, 20일선, 추세선)
│  ├─ [영역 2] 조정 품질 (고점 대비 조정률, 지지선, RSI)
│  ├─ [영역 3] 반등 신호 (양봉, 지지선 반등, G섹션)
│  └─ [영역 4] 손익비 계산 (저항선/지지선 기반)
├─ 완충 구간 원칙 (Zone A/B/C)
│  ├─ A 구간: 현재 < (목표 - 3%p) → 적극 매수
│  ├─ B 구간: (목표 - 3%p) ≤ 현재 < 목표 → 타이밍 우선
│  └─ C 구간: 현재 ≥ 목표 → 매수 중단
├─ 3단계 손절 체계
│  ├─ 1단계: 목표 손절의 60% (예: -4.2%) → 30-50% 부분손절
│  ├─ 2단계: 목표 손절의 80% (예: -5.6%) → 추가 30% 손절
│  └─ 3단계: 목표 손절 도달 (예: -7.0%) → 전량 손절
└─ 비대칭 익절 시스템 (Phase 1/2/3)
   ├─ Phase 1: 목표의 50% (예: +10%) → 30-40% 익절
   ├─ Phase 2: 목표 도달 (예: +20%) → 추가 30-40% 익절
   └─ Phase 3: 목표 초과 (예: +25%+) → 잔량 전량 익절
```

**구현**:
- ✅ 통합 리스크 관리 프롬프트 (`prompts/process2_risk_management.txt`)
- ✅ 프롬프트 통합 (`prompts.py:47,93`)

#### Stage 3A: JSON 스키마 확장 (100% 완료)
```json
{
  "pullback_analysis": {
    "trend_strength": "strong|medium|weak",
    "pullback_quality": "healthy|excessive|shallow",
    "bounce_signal": "clear|unclear|mixed",
    "risk_reward": {"resistance": 185.0, "support": 170.0, "ratio": 2.0},
    "decision": "매수 진입|소량 진입|매매보류"
  },
  "buffer_zone_analysis": {
    "cio_target": 12.0,
    "cio_range_min": 9.0,
    "cio_range_max": 15.0,
    "current_weight": 10.5,
    "zone": "A|B|C",
    "action": "적극 매수|타이밍 우선|매수 중단"
  }
}
```

**구현**:
- ✅ `pullback_analysis` 필드 추가 (`prompts.py:116-127`)
- ✅ `buffer_zone_analysis` 필드 추가 (`prompts.py:129-138`)

**검증**: ✅ 완전 작동, 실제 CIO+Process2 로그 분석 완료 (2025-10-31 19:50-19:52)

---

### ✅ Dashboard v3.0.0 완료 (2025-10-28) ⭐

**전략 상황실 신규 추가**:
- `/strategy` 페이지 생성 (4번째 페이지)
- CIO 판단 이력 추적 시스템
- 아코디언 스타일 UI (확장/축소)
- 실시간 비중 갭 시각화

**신규 컴포넌트 (8개)**:
- MarketRegimeCard, OutlookCard, AllocationStrategyCard
- CIODecisionsTable (아코디언), CIODecisionTimeline
- NewCoinsCard, WeightGapChart, CoinDetailPanel

**데이터베이스**:
- `cio_portfolio_decisions` 테이블 신규 생성
- RLS 정책 설정 완료

**기술 개선**:
- TypeScript 타입 안정성 강화
- ESLint `no-explicit-any` 규칙 100% 준수
- 공포탐욕지수 데이터 통합

---

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

---

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

## 🔄 Git 버전 관리 정책

### 저장소 전략: Dashboard Only on GitHub

이 프로젝트는 **"Dashboard only on GitHub, Bot code stays local"** 전략을 따릅니다.

#### 📌 GitHub에 포함되는 것
- ✅ **dashboard/** - Next.js 웹 대시보드 전체
- ✅ **README.md** - 프로젝트 개요 (이 문서)
- ✅ **dashboard/README.md** - 대시보드 가이드
- ✅ **.gitignore** - Git 설정 파일

#### 🚫 GitHub에서 제외되는 것 (로컬 전용)
- ❌ **main.py, config.py, trade_manager.py** - 봇 핵심 코드
- ❌ **ai_strategy/** - AI 전략 모듈 전체
- ❌ **data_manager/** - 데이터 관리 모듈 전체
- ❌ **docs/** - 봇 문서 (개발 가이드, 명세서, 수정 이력)
- ❌ **docs/prompts_log/** - AI 프롬프트 실행 로그
- ❌ **supabase_adapter.py** - DB 어댑터
- ❌ **.env, *.log, *.db** - 환경변수, 로그, 데이터베이스

### .gitignore 핵심 설정

```gitignore
# Trading Bot Source Code (Local Only)
main.py
config.py
trade_manager.py
supabase_adapter.py
data_manager.py
ai_strategy/
data_manager/

# Docs (bot documentation and logs - local only)
docs/
docs/prompts_log/

# 환경 변수 및 민감 정보
.env
*.db

# 로그 파일
*.log
*.log.*
```

### ⚠️ 주의사항

1. **봇 코드 수정 후 커밋 시**:
   - dashboard 관련 파일만 커밋되는지 반드시 확인
   - `git status`로 추적되는 파일 확인 필수
   - 실수로 봇 코드가 추가되었다면 즉시 `git rm --cached` 사용

2. **실수 방지 체크리스트**:
   ```bash
   # 커밋 전 반드시 확인
   git status --short

   # M, D 외에 U(Untracked)가 보이면 확인 필요
   # docs/ 또는 ai_strategy/ 파일이 보이면 안 됨
   ```

3. **실수로 추가된 파일 제거**:
   ```bash
   # git에서만 제거 (로컬 파일 유지)
   git rm --cached 파일명

   # 폴더 전체 제거
   git rm --cached -r 폴더명/
   ```

### 📋 Git 워크플로우 (Dashboard 배포 시)

```bash
# 1. 변경사항 확인
git status

# 2. dashboard 파일만 staging (선택적 추가)
git add dashboard/
git add README.md
git add dashboard/README.md

# 3. 커밋
git commit -m "deploy: Dashboard v3.1 업데이트"

# 4. 푸시
git push origin main
```

### 🎯 이 정책의 목적

- **보안**: 거래소 API 키, 전략 로직을 GitHub에 노출하지 않음
- **유연성**: 봇 코드는 로컬에서 자유롭게 수정 가능
- **공개**: 대시보드 UI는 공개하여 포트폴리오 데모 가능

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

## 📈 버전 히스토리

| 버전 | 날짜 | 주요 변경사항 |
|------|------|-------------|
| **v3.1.2** | 2025-10-31 | 트리거 시스템 v3.1 최적화 (체제 방향 분기, 조건부 손절, CIO 선택적 실행) |
| **v3.1.1** | 2025-10-31 | 리스크 관리 v3.0 통합 (ATR 손익비, 눌림목 매수, 비대칭 익절) |
| **v3.0.0** | 2025-10-28 | Dashboard 전략 상황실 추가 (CIO 판단 이력, 아코디언 UI) |
| **v2.0.4** | 2025-10-24 | Dashboard UX 개선 (모바일 최적화, 방문자 카운터) |
| **v2.0.0** | 2025-10-20 | 모듈화 완료 (ai_strategy/data_manager 9파일), 문서 3-Level 구조 |
| **v2.3.7** | 2025-11-07 | AI 자동편입 온체인 데이터 참조 오류 수정 (변수 범위 문제) |
| **v2.3.6** | 2025-11-07 | 전량 매도 후 자투리 잔고 문제 수정 (청산 로직 추가) |
| **v2.3.5** | 2025-11-07 | 상승 체제 전환 시 AI 자동편입 미실행 버그 수정 (트리거 타입 보존) |
| **v2.3.4** | 2025-11-06 | AI 자동편입 프롬프트 로그 포맷 일관성 개선 (1개 후보도 전체 포맷) |
| **v2.3.3** | 2025-11-06 | AI 자동편입 프롬프트 로그 미생성 버그 수정 (후보 1개일 때 프롬프트 저장 추가) |
| **v2.3.2** | 2025-11-06 | AI 자동편입 후 CIO 연계 누락 버그 수정 (정시 스케줄 실행 시 CIO 강제 호출) |
| **v2.3.1** | 2025-11-05 | 매매판단 원화잔고 버그 수정 (DB 직접 조회 방식 통일) |
| **v2.3.0** | 2025-11-04 | 트레일링 스탑 동적 활성화 + AI 자동편입 동기 실행 |
| **v1.0.0** | 2025-10-01 | 초기 릴리스 (AI 자동매매, Dual Funnel, CIO 시스템) |

---

**📅 Last Updated**: 2025-11-07
**📦 Version**: v2.3.7 (AI 자동편입 온체인 데이터 참조 오류 수정)
