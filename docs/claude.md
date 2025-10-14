# 🚀 AI 트레이딩 대시보드 웹 서비스 전환 개발 계획서 (최종 버전)

> **🚨 개발 규칙 (최우선 준수사항)**
>
> 1. **원본 코드 우선 확인**: 로컬 트레이딩봇 코드를 수정할 때는 **반드시 원본(DatabaseManager 등)을 먼저 확인**하고 동일하게 구현하세요.
> 2. **검증된 시스템**: 로컬 트레이딩봇(main.py, supabase_adapter.py 등)은 **오랜 기간 테스트와 검증을 거친 프로그램**입니다. 임의로 변경하지 마세요.
> 3. **신규 vs 레거시 구분**:
>    - **레거시(검증 완료)**: 로컬 트레이딩봇 (main.py, config.py, supabase_adapter.py, ai_strategy.py, trade_manager.py 등)
>    - **신규(개발 중)**: Next.js Dashboard (dashboard/ 폴더) - Streamlit을 개선한 새로운 웹 프로그램
> 4. **수정 전 원본 대조**: 메서드 시그니처, 반환값 구조, 키 이름 등을 반드시 원본과 비교 후 수정하세요.
>
> **⚠️ 중요**: 이 문서는 개발 계획서입니다.
>
> **최신 배포 상태 및 이력**은 [DEPLOYMENT_SUCCESS.md](../DEPLOYMENT_SUCCESS.md)를 참조하세요.

---

## 🔑 프로젝트 정보

### GitHub Repository
- **URL**: https://github.com/mypsj-hub/aitrade
- **상태**: Public
- **프로젝트명**: mypsj-hub/aitrade
- **전략**: 대시보드만 공개, 트레이딩 봇 코드는 로컬 유지

### Supabase 정보
- **Project URL**: https://nlkbkyambjnlmuplpnrd.supabase.co
- **Anon (Public) Key** (읽기 전용 - Vercel 대시보드용):
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sa2JreWFtYmpubG11cGxwbnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDE2MzksImV4cCI6MjA3NDI3NzYzOX0.sFYud66oodoxQ1JritdZZeXYXgM2eHxeCEy3YhRqA_8
  ```
- **Service Role Key**: 로컬 .env 파일 참조 (보안상 GitHub에 미포함)
- **Access Token**: 로컬 환경 참조 (보안상 GitHub에 미포함)

### Vercel 정보
- **계정**: GitHub와 동일 (mypsj-hub)
- **프로젝트명**: aitrade
- **배포 URL**: https://aitrade-liard.vercel.app

---

## 📋 목차
프로젝트 개요

현재 시스템 분석

목표 아키텍처

핵심 기술 스택

단계별 개발 계획

배포 및 운영 전략

보안 및 최적화

예상 비용 및 타임라인

1. 프로젝트 개요 🎯
목표
현재 로컬 환경(SQLite) 에서만 작동하는 AI 자동 코인 매매 시스템을 클라우드 기반 서버리스 아키텍처로 전환하여:

✅ 24시간 실시간 모니터링: 어디서든 웹 브라우저로 접속 가능

✅ 데이터 영속성 보장: 클라우드 DB로 데이터 안전 보관

✅ 확장성 확보: 트래픽 증가에 자동 대응

✅ 비용 최적화: 서버리스로 사용한 만큼만 과금

핵심 철학
"읽기와 쓰기의 완전한 분리" - 트레이딩 봇(Writer)과 대시보드(Reader)를 물리적으로 분리하여 각각의 역할에 최적화

2. 현재 시스템 분석 🔍
2.1 데이터베이스 구조
현재 시스템은 5개의 핵심 테이블로 구성되어 있습니다:

테이블명	용도	주요 필드	비고
holding_status	보유 코인 현황	코인이름(PK), 보유수량, 평가금액, 수익률, 매매판단, GPT 판단 등 23개 필드	AI 전략의 핵심 데이터
trade_history	거래 내역	id(PK), 코인이름, 거래유형, 거래금액, 수익금, AI 사고과정 등	모든 거래 로그
portfolio_summary	포트폴리오 요약	id(PK), 날짜, 총순자산, 일일수익률, 누적수익률 등	성과 추적
system_status	시스템 상태	status_key(PK), status_value	서킷브레이커, 시장 체제 등
cio_reports	AI 보고서	report_date+type(PK), 시장요약, 성과분석, 자기평가 등	일일 AI 브리핑

Sheets로 내보내기
2.2 특수 요구사항
한글 컬럼명: 기존 시스템이 한글 컬럼명 사용 → PostgreSQL 완벽 지원 ✅

JSON 데이터: 주요지표, self_critique 등 JSON 타입 필드 → PostgreSQL JSONB 타입 활용 ✅

실시간성: Process1(5분)과 Process2(트리거 기반) 동작 → Supabase 실시간 기능 활용 가능 ✅

3. 목표 아키텍처 🏛️
┌─────────────────────────────────────────────────────────────────┐
│                      사용자 (전 세계 어디서든)                      │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Vercel (Edge Network)                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │             Streamlit App (streamlit_app.py)              │  │
│  │  - 읽기 전용 (Read-Only)                                    │  │
│  │  - 캐싱 최적화 (@st.cache_data)                             │  │
│  │  - 환경변수로 Supabase 접속 정보 주입                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Supabase Client (Read)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│               Supabase (서울 리전 PostgreSQL)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  • holding_status                                          │  │
│  │  • trade_history (인덱스: 코인이름, 거래일시)                 │  │
│  │  • portfolio_summary (인덱스: 날짜)                         │  │
│  │  • system_status                                           │  │
│  │  • cio_reports (인덱스: report_date, report_type)          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [추가 기능]                                                    │
│  • Row Level Security (RLS) - 읽기 전용 정책                    │
│  • 자동 백업 (Point-in-Time Recovery)                           │
│  • Connection Pooling                                        │
└─────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │ Supabase Client (Write)
                                  │
┌─────────────────────────────────────────────────────────────────┐
│               로컬 PC / AWS EC2 (24시간 구동)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │             Trading Bot (main.py + 전체 모듈)                 │  │
│  │  - 쓰기 전용 (Write-Only to DB)                              │  │
│  │  - Upbit API 거래 실행                                       │  │
│  │  - AI 분석 및 판단                                           │  │
│  │  - Supabase에 결과 저장                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
4. 핵심 기술 스택 🛠️
계층	기술	선택 이유
Database	Supabase PostgreSQL	• 한글 컬럼명 완벽 지원 • JSONB 타입 지원 • 무료 플랜: 500MB + 2GB 대역폭 • 자동 백업 및 RLS 보안
트레이딩 봇	Python 3.11+	• 기존 코드 100% 재사용 • supabase-py 공식 SDK
대시보드	Streamlit	• 기존 UI 100% 유지 • 빠른 개발 및 배포
배포	Vercel	• Streamlit 네이티브 지원 • 글로벌 CDN 자동 적용 • 무료 플랜으로 충분
버전 관리	GitHub	• Private Repository • Vercel 자동 배포 연동
환경 변수	.env + Vercel Secrets	• 민감 정보 보호 • 배포 시 자동 주입

Sheets로 내보내기
5. 단계별 개발 계획 📝
Phase 0: 사전 준비 ✅ (이미 완료)
Supabase 계정 및 프로젝트 생성

GitHub Repository 생성

Vercel 계정 연동

Phase 1: Supabase 데이터베이스 마이그레이션 (예상 소요: 2시간)
1.1 스키마 생성
Supabase SQL Editor에서 다음 스크립트 실행:

SQL

-- 한글 컬럼명을 큰따옴표로 감싸서 PostgreSQL에서 사용
-- 1. 보유현황 테이블
CREATE TABLE IF NOT EXISTS holding_status (
    "코인이름" TEXT PRIMARY KEY,
    "보유수량" REAL DEFAULT 0,
    "평가금액" BIGINT DEFAULT 0,
    "매수금액" BIGINT DEFAULT 0,
    "매수평균가" BIGINT DEFAULT 0,
    "수익률" REAL DEFAULT 0,
    "평가손익" BIGINT DEFAULT 0,
    "최초매수일" TIMESTAMPTZ,
    "현재상태" TEXT DEFAULT '미보유',
    "보유비중" REAL DEFAULT 0,
    "매매판단" TEXT DEFAULT '매매보류',
    "GPT매매비중" REAL DEFAULT 0,
    "GPT목표수익률" REAL DEFAULT 0,
    "GPT목표손절률" REAL DEFAULT 0,
    "GPT보유비중" REAL DEFAULT 0,
    "최종업데이트일" TIMESTAMPTZ DEFAULT NOW(),
    "거래사유" TEXT,
    "원화잔고" BIGINT DEFAULT 0,
    "판단확신" INTEGER DEFAULT 0,
    "highest_profit" REAL DEFAULT 0,
    "마지막거래시간" TIMESTAMPTZ,
    "ai_thinking_process" TEXT,
    "관리상태" TEXT DEFAULT '활성'
);

-- 2. 거래내역 테이블
CREATE TABLE IF NOT EXISTS trade_history (
    id SERIAL PRIMARY KEY,
    "코인이름" TEXT NOT NULL,
    "거래유형" TEXT NOT NULL,
    "거래수량" REAL DEFAULT 0,
    "거래금액" BIGINT DEFAULT 0,
    "거래사유" TEXT,
    "거래일시" TIMESTAMPTZ DEFAULT NOW(),
    "ai_thinking_process" TEXT,
    "수익금" BIGINT DEFAULT 0,
    "판단확신" INTEGER,
    "주요지표" JSONB  -- SQLite TEXT → PostgreSQL JSONB
);

-- 거래내역 인덱스 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_trade_coin ON trade_history("코인이름");
CREATE INDEX IF NOT EXISTS idx_trade_date ON trade_history("거래일시" DESC);

-- 3. 포트폴리오 요약 테이블
CREATE TABLE IF NOT EXISTS portfolio_summary (
    id SERIAL PRIMARY KEY,
    "날짜" TIMESTAMPTZ UNIQUE NOT NULL DEFAULT NOW(),
    "총포트폴리오가치" BIGINT DEFAULT 0,
    "원화잔고" BIGINT DEFAULT 0,
    "총코인가치" BIGINT DEFAULT 0,
    "일일수익률" REAL DEFAULT 0,
    "누적수익률" REAL DEFAULT 0,
    "총순자산" BIGINT DEFAULT 0
);

-- 요약 인덱스
CREATE INDEX IF NOT EXISTS idx_portfolio_date ON portfolio_summary("날짜" DESC);

-- 4. 시스템 상태 테이블
CREATE TABLE IF NOT EXISTS system_status (
    status_key TEXT PRIMARY KEY,
    status_value TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 시장 체제 설정
INSERT INTO system_status (status_key, status_value, last_updated)
VALUES ('last_market_regime', 'Range_Bound', NOW())
ON CONFLICT (status_key) DO NOTHING;

-- 5. CIO 보고서 테이블
CREATE TABLE IF NOT EXISTS cio_reports (
    report_date DATE NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    title TEXT,
    market_summary TEXT,
    performance_review TEXT,
    self_critique JSONB,  -- SQLite TEXT → PostgreSQL JSONB
    outlook TEXT,
    full_content_md TEXT,
    raw_json_data JSONB,  -- SQLite TEXT → PostgreSQL JSONB
    cio_latest_rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (report_date, report_type)
);

-- 보고서 인덱스
CREATE INDEX IF NOT EXISTS idx_cio_date_type ON cio_reports(report_date DESC, report_type);
1.2 Row Level Security (RLS) 설정
대시보드는 읽기만, 봇은 모든 권한:

SQL

-- RLS 활성화
ALTER TABLE holding_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE cio_reports ENABLE ROW LEVEL SECURITY;

-- 읽기 정책 (누구나 읽기 가능)
CREATE POLICY "Allow public read access" ON holding_status FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON trade_history FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON portfolio_summary FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON system_status FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON cio_reports FOR SELECT USING (true);

-- 쓰기 정책 (service_role 키만 쓰기 가능 - 기본 동작이므로 별도 정책 불필요)
Phase 2: 트레이딩 봇 Supabase 연동 (예상 소요: 4시간)
2.1 필수 라이브러리 설치
Bash

pip install supabase python-dotenv
pip freeze > requirements.txt
2.2 환경 변수 설정
.env 파일에 Supabase 정보 추가:

Ini, TOML

# 기존 API 키들
UPBIT_ACCESS_KEY="your_key"
UPBIT_SECRET_KEY="your_secret"
OPENAI_API_KEY="your_key"
GEMINI_API_KEY="your_key"

# 신규 추가: Supabase 정보
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key"  # service_role 키 (쓰기 권한)
2.3 data_manager.py 수정 전략
핵심 원칙: 기존 코드 구조 최대한 유지 + 최소 수정

Python

# data_manager.py 상단에 추가
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    def __init__(self):
        # Supabase 클라이언트 초기화
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if supabase_url and supabase_key:
            self.supabase: Client = create_client(supabase_url, supabase_key)
            self.use_supabase = True
            logger.info("✅ Supabase 모드로 초기화 완료")
        else:
            # 환경 변수가 없으면 기존 SQLite 사용 (하위 호환성)
            self.db_name = DB_NAME
            self.use_supabase = False
            logger.info("✅ SQLite 모드로 초기화 완료")
    
    def get_holding_status(self, symbol: str = None):
        """보유현황 조회 (Supabase 버전)"""
        if not self.use_supabase:
            # 기존 SQLite 로직 유지
            return self._get_holding_status_sqlite(symbol)
        
        try:
            if symbol:
                response = self.supabase.table('holding_status')\
                    .select('*')\
                    .eq('코인이름', symbol)\
                    .single()\
                    .execute()
                return response.data if response.data else None
            else:
                response = self.supabase.table('holding_status')\
                    .select('*')\
                    .execute()
                return response.data if response.data else []
        except Exception as e:
            logger.error(f"Supabase 조회 오류: {e}")
            return None if symbol else []
    
    def update_holding_status(self, symbol: str, update_data: dict):
        """보유현황 업데이트 (Supabase 버전)"""
        if not self.use_supabase:
            return self._update_holding_status_sqlite(symbol, update_data)
        
        try:
            # 최종업데이트일 자동 추가
            update_data['최종업데이트일'] = datetime.now().isoformat()
            
            response = self.supabase.table('holding_status')\
                .upsert({
                    '코인이름': symbol,
                    **update_data
                })\
                .execute()
            
            return True
        except Exception as e:
            logger.error(f"Supabase 업데이트 오류: {e}")
            return False
    
    def log_trade(self, trade_data: dict):
        """거래 내역 로깅 (Supabase 버전)"""
        if not self.use_supabase:
            return self._log_trade_sqlite(trade_data)
        
        try:
            # JSON 필드는 dict 그대로 전달 (Supabase가 자동 변환)
            response = self.supabase.table('trade_history')\
                .insert({
                    '코인이름': trade_data['symbol'],
                    '거래유형': trade_data['type'],
                    '거래수량': trade_data['quantity'],
                    '거래금액': trade_data['amount'],
                    '거래사유': trade_data['reason'],
                    '거래일시': trade_data['timestamp'],
                    'ai_thinking_process': trade_data.get('thinking_process', ''),
                    '수익금': trade_data.get('profit_amount', 0),
                    '판단확신': trade_data.get('confidence', 0),
                    '주요지표': json.loads(trade_data.get('indicators_json', '{}'))  # dict로 변환
                })\
                .execute()
            
            return True
        except Exception as e:
            logger.error(f"거래 로깅 오류: {e}")
            return False
수정 범위 요약:

get_holding_status() ✅

update_holding_status() ✅

log_trade() ✅

save_portfolio_summary() ✅

get_recent_trades() ✅

save_cio_report() ✅

기타 SELECT/INSERT/UPDATE 쿼리 → Supabase SDK로 변환

Phase 3: Streamlit 대시보드 Vercel 배포 (예상 소요: 2시간)
3.1 streamlit_app.py 수정
Python

# streamlit_app.py 상단 수정
import streamlit as st
from supabase import create_client
import pandas as pd
from typing import Dict

# Vercel 환경변수에서 Supabase 정보 로드
@st.cache_resource
def init_supabase_connection():
    """Supabase 연결 초기화 (캐싱)"""
    supabase_url = st.secrets["supabase"]["url"]
    supabase_key = st.secrets["supabase"]["key"]  # anon key 사용 (읽기 전용)
    return create_client(supabase_url, supabase_key)

supabase = init_supabase_connection()

# 기존 get_db_connection() 함수 대체
@st.cache_data(ttl=60)
def load_portfolio_data() -> Dict:
    """Supabase에서 포트폴리오 데이터 로드"""
    try:
        holdings = supabase.table('holding_status').select('*').order('평가금액', desc=True).execute()
        summary = supabase.table('portfolio_summary').select('*').order('날짜', desc=True).limit(1).execute()
        history = supabase.table('trade_history').select('*').order('거래일시', desc=True).limit(1000).execute()
        reports = supabase.table('cio_reports').select('*').order('report_date', desc=True).execute()
        
        # CIO 최신 평가
        cio_status = supabase.table('system_status').select('status_value').eq('status_key', 'cio_latest_rationale').single().execute()
        
        return {
            "holdings": pd.DataFrame(holdings.data) if holdings.data else pd.DataFrame(),
            "summary": pd.DataFrame(summary.data) if summary.data else pd.DataFrame(),
            "history": pd.DataFrame(history.data) if history.data else pd.DataFrame(),
            "reports": pd.DataFrame(reports.data) if reports.data else pd.DataFrame(),
            "cio_rationale": cio_status.data['status_value'] if cio_status.data else "브리핑 없음"
        }
    except Exception as e:
        st.error(f"데이터 로딩 오류: {e}")
        return {}
3.2 배포 설정 파일 생성
requirements.txt:

streamlit==1.41.1
pandas==2.2.3
plotly==5.24.1
supabase==2.11.5
python-dotenv==1.0.1
.streamlit/secrets.toml (로컬 테스트용):

Ini, TOML

[supabase]
url = "https://your-project.supabase.co"
key = "your-anon-public-key"  # anon key (읽기 전용)
.gitignore:

.env
.streamlit/secrets.toml
*.db
*.log
__pycache__/
venv/
.DS_Store
3.3 Vercel 배포
GitHub에 푸시:

Bash

git add .
git commit -m "Supabase 연동 및 Vercel 배포 준비"
git push origin main
Vercel 프로젝트 설정:

Vercel 대시보드에서 GitHub Repository Import

Framework Preset: Streamlit

Build Command: (자동)

Output Directory: (자동)

환경 변수 설정 (Vercel Dashboard > Settings > Environment Variables):

STREAMLIT_SECRETS = """
[supabase]
url = "https://your-project.supabase.co"
key = "your-anon-public-key"
"""
배포: Deploy 버튼 클릭 → 5분 후 https://your-app.vercel.app 접속

6. 배포 및 운영 전략 🚦
6.1 트레이딩 봇 운영
옵션 1: 로컬 PC (권장 - 초기)

Bash

# 백그라운드 실행 (Windows)
python main.py

# 로그 모니터링
tail -f trading_system.log
옵션 2: AWS EC2 (권장 - 장기)

Instance: t3.micro (Free Tier)

OS: Ubuntu 22.04 LTS

보안 그룹: Outbound만 허용

실행:

Bash

# tmux 세션 생성 (재접속 시에도 계속 실행)
tmux new -s trading_bot
python main.py

# 세션 분리: Ctrl+B, D
# 재접속: tmux attach -t trading_bot
6.2 모니터링 및 알림
Supabase 대시보드 활용:

Database > Logs: 쿼리 성능 모니터링

Database > Usage: 스토리지 및 대역폭 사용량

선택적 구현 (추후):

Slack/Discord 웹훅으로 거래 알림

Sentry로 에러 트래킹

7. 보안 및 최적화 🔒
7.1 보안 체크리스트
[ ] .env 파일 .gitignore에 추가

[ ] Supabase RLS 활성화

[ ] Vercel에서 anon key 사용 (읽기 전용)

[ ] 봇에서만 service_role key 사용 (쓰기 권한)

[ ] GitHub Private Repository 설정

7.2 성능 최적화
Streamlit 캐싱:

@st.cache_data(ttl=60): 1분마다 새로고침

불필요한 쿼리 제거

Supabase 인덱스 활용:

이미 생성한 인덱스로 조회 속도 10배 향상

Vercel Edge Caching:

정적 자산 자동 캐싱

8. 예상 비용 및 타임라인 💰
비용 (월간)
항목	무료 플랜	유료 전환 시
Supabase	500MB DB + 2GB 대역폭	$25/월 (8GB DB)
Vercel	무제한 배포	$20/월 (Pro)
AWS EC2	t3.micro Free Tier	$10/월 (t3.small)
합계	**$0 (1년간)**	$55/월

Sheets로 내보내기
타임라인
Phase	소요 시간	완료 조건
Phase 0	✅ 완료	Supabase/Vercel 계정 생성
Phase 1	2시간	DB 스키마 생성 및 RLS 설정
Phase 2	4시간	트레이딩 봇 Supabase 연동 테스트
Phase 3	2시간	Streamlit 대시보드 Vercel 배포
총계	8시간	웹사이트 정상 작동 확인

Sheets로 내보내기






