# AI Trading Dashboard

인공지능 기반 암호화폐 자동매매 시스템

## 프로젝트 개요

24시간 실시간 AI 트레이딩 시스템으로, 로컬에서 실행되는 트레이딩 봇과 클라우드 기반 웹 대시보드로 구성되어 있습니다.

### 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                   사용자 (브라우저)                        │
│              PC / 모바일 / 태블릿                          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│            Vercel (Next.js Dashboard)                    │
│        https://aitrade-liard.vercel.app                  │
│  • 포트폴리오 요약 • 수익률 차트                          │
│  • 보유 자산 • 거래 내역 • AI CIO 브리핑                 │
└────────────────────┬────────────────────────────────────┘
                     │ Supabase API (읽기 전용)
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Supabase PostgreSQL (클라우드 DB)                │
│     https://nlkbkyambjnlmuplpnrd.supabase.co            │
│  • holding_status • trade_history                       │
│  • portfolio_summary • cio_reports • system_status      │
└────────────────────┬────────────────────────────────────┘
                     ▲
                     │ Supabase API (쓰기 전용)
┌─────────────────────────────────────────────────────────┐
│           로컬 PC (트레이딩 봇)                            │
│  • main.py (메인 실행)                                    │
│  • data_manager.py (Supabase 통합)                       │
│  • ai_strategy.py (AI 전략)                              │
└─────────────────────────────────────────────────────────┘
```

## 배포 정보

### 웹 대시보드
- **배포 URL**: https://aitrade-liard.vercel.app
- **플랫폼**: Vercel (Next.js + TypeScript)
- **기능**: 실시간 포트폴리오 모니터링, 거래 내역, AI 브리핑

### 데이터베이스
- **플랫폼**: Supabase PostgreSQL
- **리전**: 서울 (Asia Northeast)
- **보안**: Row Level Security (RLS) 활성화

### 트레이딩 봇
- **실행 환경**: 로컬 PC / AWS EC2
- **언어**: Python 3.11+
- **역할**: 시장 분석, 거래 실행, 데이터 저장

## 주요 기능

### 웹 대시보드
- 포트폴리오 요약 (총 자산, 수익률, 잔고)
- 실시간 차트 (수익률 추이)
- 보유 자산 테이블
- 거래 내역
- AI CIO 일일 브리핑
- 60초 자동 새로고침
- 반응형 디자인 (모바일/태블릿/데스크톱)

### 트레이딩 봇
- AI 기반 시장 분석 (OpenAI GPT / Google Gemini)
- 자동 매매 실행 (Upbit API)
- 리스크 관리 (손절/익절)
- 시장 체제 분석 (상승/하락/횡보)
- 실시간 데이터 동기화 (Supabase)

## 기술 스택

### 프론트엔드
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SWR (데이터 페칭)
- Recharts (차트)

### 백엔드
- Python 3.11+
- Supabase (PostgreSQL)
- OpenAI API
- Google Gemini API
- Upbit API

### 인프라
- Vercel (호스팅)
- GitHub (소스 관리)
- Supabase (데이터베이스)

## 시작하기

### 트레이딩 봇 실행

1. 환경 변수 설정 (`.env`)
```bash
# Upbit API
UPBIT_ACCESS_KEY=your_key
UPBIT_SECRET_KEY=your_secret

# AI API
OPENAI_API_KEY=your_key
GEMINI_API_KEY=your_key

# Supabase (쓰기 권한)
SUPABASE_URL=https://nlkbkyambjnlmuplpnrd.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

2. 의존성 설치
```bash
pip install -r requirements.txt
```

3. 봇 실행
```bash
python main.py
```

### 대시보드 접속

웹 브라우저에서 https://aitrade-liard.vercel.app 접속

## 프로젝트 구조

```
c:\gptbitcoin4\
├── main.py                 # 메인 실행 파일
├── config.py               # 설정
├── data_manager.py         # DB 관리 (Supabase 통합)
├── trade_manager.py        # 거래 실행
├── ai_strategy.py          # AI 전략 (OpenAI)
├── ai_strategy_gemini.py   # AI 전략 (Gemini)
├── supabase_adapter.py     # Supabase 어댑터
├── requirements.txt        # Python 의존성
├── dashboard/              # Next.js 대시보드
│   ├── app/               # Next.js App Router
│   ├── components/        # React 컴포넌트
│   ├── lib/               # 유틸리티 (Supabase, 타입)
│   └── package.json       # Node.js 의존성
└── docs/                  # 문서
    └── claude.md          # 개발 계획서
```

## 비용

### 무료 플랜으로 운영 가능
- **Vercel** (Hobby): $0/월
  - 무제한 배포
  - 100GB 대역폭
  - Global CDN
- **Supabase** (Free Tier): $0/월
  - 500MB 데이터베이스
  - 2GB 대역폭
  - Row Level Security
- **총 비용**: $0/월

## 보안

### Supabase RLS (Row Level Security)
- **ANON KEY** (대시보드): 읽기 전용
- **SERVICE_ROLE KEY** (봇): 읽기/쓰기
- 환경 변수로 민감 정보 관리
- `.env` 파일은 Git에서 제외

## 모니터링

### 대시보드
- 실시간 포트폴리오 현황
- 수익률 추이 차트
- 거래 내역
- AI 브리핑

### 로그
- `trading_system.log`: 봇 실행 로그
- Supabase Dashboard: 데이터베이스 로그
- Vercel Dashboard: 배포 및 빌드 로그

## 문서

자세한 개발 계획 및 배포 가이드는 [docs/claude.md](docs/claude.md)를 참조하세요.

## 라이선스

Private Repository

## GitHub Repository

https://github.com/mypsj-hub/aitrade
