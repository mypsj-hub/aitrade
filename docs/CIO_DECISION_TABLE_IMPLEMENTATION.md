# CIO 포트폴리오 결정 이력 테이블 구현 설계서

> **📅 작성일**: 2025-10-27
> **📦 버전**: v1.0
> **🎯 목적**: CIO 일관성 문제 해결 및 포트폴리오 결정 이력 추적
> **⚠️ 중요도**: 최상 (시스템 신뢰성 핵심)

---

## 📋 목차

1. [문제 정의 및 배경](#1-문제-정의-및-배경)
2. [시스템 현황 분석](#2-시스템-현황-분석)
3. [테이블 설계 명세](#3-테이블-설계-명세)
4. [구현 단계별 체크리스트](#4-구현-단계별-체크리스트)
5. [데이터 흐름도](#5-데이터-흐름도)
6. [코드 수정 상세](#6-코드-수정-상세)
7. [검증 및 테스트 계획](#7-검증-및-테스트-계획)
8. [롤백 계획](#8-롤백-계획)

---

## 1. 문제 정의 및 배경

### 🔴 핵심 문제

**현상**: SOL 목표 비중이 1시간 내 14% → 18% → 14% → 12%로 급격히 변경

**타임라인**:
```
09:45:02  CIO #1: SOL 18% 목표 설정 (메가캡 추세 추종 전략)
09:56:37  Process2: 부분익절 실행 (목표 18% 기록)
   ↓ (11분)
09:57:19  CIO #2: SOL 14% 목표 변경 (Range_Bound 전환)
10:10:21  Process2: 부분익절 실행 (목표 14% 기록)
   ↓ (5분)
10:02:14  CIO #3: SOL 14% 유지
   ↓ (13분)
10:15:41  CIO #4: SOL 12% 목표 변경
10:27:27  Process2: 부분익절 실행 (목표 12% 기록)
```

### 🎯 근본 원인

1. **CIO가 "이전 자신의 판단"을 모름**
   - `holding_status` 테이블은 현재 상태만 저장 (UPSERT 방식)
   - 이전 CIO 결정과의 비교 불가능

2. **시간 격차 문제**
   - CIO 결정 시각 ≠ DB 기록 시각
   - `trade_history`는 Process2 실행 시에만 기록

3. **맥락 정보 부족**
   - CIO가 18% 설정한 근거(rationale)가 DB에 없음
   - 시장 맥락(체제, Fear & Greed, 긴급도) 기록 없음

### 💡 해결 목표

- ✅ CIO 실행 즉시 모든 결정 기록
- ✅ 이전 CIO 결정과 비교하여 일관성 검증
- ✅ 시장 맥락 정보 함께 저장
- ✅ 대시보드에서 시계열 분석 가능

---

## 2. 시스템 현황 분석

### 📊 기존 테이블 구조

#### 2.1 `holding_status` (보유현황)
```sql
-- 현재 상태만 저장 (히스토리 없음)
"코인이름" TEXT PRIMARY KEY  -- BTC, ETH, SOL 등
"GPT보유비중" REAL            -- CIO가 설정한 목표 비중 (%)
"GPT목표수익률" REAL          -- 익절 기준 (%)
"GPT목표손절률" REAL          -- 손절 기준 (%)
"관리상태" TEXT               -- '활성', '재평가', '제외'
```

**문제점**: UPSERT 방식으로 이전 값 덮어쓰기 → 히스토리 추적 불가

#### 2.2 `trade_history` (거래내역)
```sql
id SERIAL PRIMARY KEY
"코인이름" TEXT
"거래일시" TIMESTAMPTZ
"ai_thinking_process" TEXT    -- "목표 18.0% vs 현재 12.77%" 포함
```

**문제점**: Process2 실행 시에만 기록 → CIO 결정과 시간 격차

#### 2.3 `system_status` (시스템 상태)
```sql
status_key TEXT PRIMARY KEY   -- 'cio_latest_rationale'
status_value TEXT             -- 최신 rationale만 저장
```

**문제점**: 최신 값만 덮어쓰기 → 과거 rationale 조회 불가

#### 2.4 `cio_reports` (CIO 보고서)
```sql
report_date DATE NOT NULL
report_type TEXT              -- 'DAILY', 'WEEKLY', 'MONTHLY'
cio_latest_rationale TEXT
```

**문제점**: 일일 보고서만 저장 → 실시간 CIO 결정 이력 없음

### 📁 기존 데이터 흐름

```python
# ai_strategy/cio.py - recalculate_portfolio_weights()

# CIO 실행
ai_result = analyze_cio_portfolio(...)  # AI가 목표 비중 결정

# DB 업데이트 (현재 상태만 저장)
for symbol, target_info in ai_result['targets'].items():
    db_manager.update_holding_status(symbol, {
        'GPT보유비중': target_info['weight'],
        'GPT목표수익률': target_info['target_profit'],
        'GPT목표손절률': target_info['stop_loss'],
        '관리상태': '활성'
    })

# rationale은 system_status에만 저장 (최신 값만)
db_manager.update_system_status('cio_latest_rationale', ai_result['rationale'])
```

**결과**: 이전 CIO 결정 추적 불가 → 일관성 검증 불가

---

## 3. 테이블 설계 명세

### 📐 테이블명: `cio_portfolio_decisions`

#### 3.1 스키마 정의

```sql
CREATE TABLE IF NOT EXISTS cio_portfolio_decisions (
    id SERIAL PRIMARY KEY,

    -- ========== 기본 정보 ==========
    "결정시각" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "코인이름" TEXT NOT NULL,

    -- ========== 목표 비중 정보 ==========
    "목표비중" REAL NOT NULL,
    "이전목표비중" REAL,
    "비중변화량" REAL,
    "현재보유비중" REAL,

    -- ========== 리스크 관리 ==========
    "목표수익률" REAL,
    "목표손절률" REAL,

    -- ========== CIO 근거 및 맥락 ==========
    "전략근거" TEXT,
    "관리상태" TEXT,

    -- ========== 시장 맥락 정보 ==========
    "시장체제" TEXT,
    "공포탐욕지수" INTEGER,
    "긴급도" INTEGER,
    "BTC도미넌스" REAL,

    -- ========== 코인 정체성 정보 ==========
    "시가총액등급" TEXT,
    "섹터" TEXT,
    "유동성등급" TEXT,

    -- ========== 기술지표 스냅샷 ==========
    "기술지표" JSONB,

    -- ========== 전체 포트폴리오 스냅샷 ==========
    "전체포트폴리오" JSONB
);
```

#### 3.2 인덱스 정의

```sql
CREATE INDEX IF NOT EXISTS idx_cio_decision_time
    ON cio_portfolio_decisions("결정시각" DESC);

CREATE INDEX IF NOT EXISTS idx_cio_decision_coin
    ON cio_portfolio_decisions("코인이름");

CREATE INDEX IF NOT EXISTS idx_cio_decision_coin_time
    ON cio_portfolio_decisions("코인이름", "결정시각" DESC);

CREATE INDEX IF NOT EXISTS idx_cio_decision_market_regime
    ON cio_portfolio_decisions("시장체제");

CREATE INDEX IF NOT EXISTS idx_cio_decision_management
    ON cio_portfolio_decisions("관리상태");
```

#### 3.3 필드 상세 명세

| 필드명 | 타입 | NULL | 설명 | 예시 값 |
|--------|------|------|------|---------|
| `id` | SERIAL | NO | 자동 증가 PK | 1, 2, 3... |
| `결정시각` | TIMESTAMPTZ | NO | CIO 실행 시각 | 2025-10-27 09:45:02+00 |
| `코인이름` | TEXT | NO | 코인 심볼 | "SOL", "BTC" |
| `목표비중` | REAL | NO | CIO 목표 비중 (%) | 18.0 |
| `이전목표비중` | REAL | YES | 직전 CIO 목표 (%) | 14.0 |
| `비중변화량` | REAL | YES | 목표 - 이전목표 (%) | +4.0 |
| `현재보유비중` | REAL | YES | 실제 보유 비중 (%) | 12.77 |
| `목표수익률` | REAL | YES | 익절 기준 (%) | 15.0 |
| `목표손절률` | REAL | YES | 손절 기준 (%) | -7.0 |
| `전략근거` | TEXT | YES | CIO rationale | "메가캡 추세 추종..." |
| `관리상태` | TEXT | YES | 활성/재평가/제외 | "활성" |
| `시장체제` | TEXT | YES | Uptrend/Range_Bound | "Uptrend" |
| `공포탐욕지수` | INTEGER | YES | 0-100 | 51 |
| `긴급도` | INTEGER | YES | 0-100 | 85 |
| `BTC도미넌스` | REAL | YES | % | 56.8 |
| `시가총액등급` | TEXT | YES | 메가캡/미드캡/스몰캡 | "메가캡" |
| `섹터` | TEXT | YES | Layer-1/DeFi/Meme | "Layer-1" |
| `유동성등급` | TEXT | YES | A/B/C/D | "A" |
| `기술지표` | JSONB | YES | RSI, MACD 등 | {"RSI_1d": 74.7} |
| `전체포트폴리오` | JSONB | YES | 전체 비중 맵 | {"BTC": 30, "SOL": 18} |

#### 3.4 데이터 예시

```json
{
  "id": 1,
  "결정시각": "2025-10-27T09:45:02+00:00",
  "코인이름": "SOL",
  "목표비중": 18.0,
  "이전목표비중": 14.0,
  "비중변화량": 4.0,
  "현재보유비중": 12.77,
  "목표수익률": 15.0,
  "목표손절률": -7.0,
  "전략근거": "[정체성] SOL은 메가캡, Layer-1, B등급 유동성. [전략적 딜레마 분석] 1. 추세: 장기/단기 모두 상승...",
  "관리상태": "활성",
  "시장체제": "Uptrend",
  "공포탐욕지수": 51,
  "긴급도": 85,
  "BTC도미넌스": 56.8,
  "시가총액등급": "메가캡",
  "섹터": "Layer-1",
  "유동성등급": "B",
  "기술지표": {
    "RSI_1d": 74.7,
    "MACD_1d": 426.48,
    "MA120_distance": 11.2,
    "거래량비율": 2.62
  },
  "전체포트폴리오": {
    "BTC": 30.0,
    "ETH": 20.0,
    "SOL": 18.0,
    "KRW": 32.0
  }
}
```

---

## 4. 구현 단계별 체크리스트

### ✅ Phase 1: 테이블 생성 (30분)

- [ ] **Step 1.1**: SQL 파일 생성
  - 파일: `c:\gptbitcoin4\supabase\03_create_cio_decisions_table.sql`
  - 내용: 테이블 생성 + 인덱스 + COMMENT

- [ ] **Step 1.2**: Supabase에서 SQL 실행
  - Supabase 대시보드 접속
  - SQL Editor에서 실행
  - 테이블 생성 확인

- [ ] **Step 1.3**: RLS (Row Level Security) 설정
  - 읽기: ANON_KEY 허용 (대시보드)
  - 쓰기: SERVICE_ROLE_KEY만 허용 (트레이딩봇)

- [ ] **Step 1.4**: 테이블 생성 검증
  - `SELECT * FROM cio_portfolio_decisions LIMIT 1;`
  - 스키마 확인: `\d cio_portfolio_decisions`

---

### ✅ Phase 2: supabase_adapter.py 메서드 추가 (1시간)

- [ ] **Step 2.1**: `save_cio_decision()` 메서드 작성
  - 위치: `c:\gptbitcoin4\supabase_adapter.py`
  - 기능: CIO 결정 저장 + 이전 목표 비중 자동 조회
  - 파라미터: 17개 (symbol, target_weight, ...)

- [ ] **Step 2.2**: `get_latest_cio_decision()` 메서드 작성
  - 기능: 최근 N분 이내 CIO 결정 조회
  - 파라미터: symbol, minutes (기본값 30)
  - 반환: Dict 또는 None

- [ ] **Step 2.3**: `get_cio_decision_history()` 메서드 작성
  - 기능: 특정 코인의 시계열 히스토리 조회
  - 파라미터: symbol, days (기본값 7)
  - 반환: List[Dict]

- [ ] **Step 2.4**: `get_recent_cio_decisions()` 메서드 작성
  - 기능: 모든 코인의 최근 결정 조회
  - 파라미터: hours (기본값 1)
  - 반환: Dict[symbol, List[Dict]]

- [ ] **Step 2.5**: 메서드 Docstring 작성
  - Args, Returns, Raises 명시
  - 사용 예시 코드 추가

---

### ✅ Phase 3: CIO 실행 로직 통합 (1.5시간)

- [ ] **Step 3.1**: `ai_strategy/cio.py` 수정 준비
  - 백업 파일 생성: `cio.py.backup_20251027`
  - 수정 위치 확인: Line 2490~2515 (targets 저장 로직)

- [ ] **Step 3.2**: CIO 결정 저장 로직 추가
  - 위치: `recalculate_portfolio_weights()` 함수 내부
  - 타이밍: `db_manager.update_holding_status()` 직후
  - 각 코인별로 `save_cio_decision()` 호출

- [ ] **Step 3.3**: 시장 맥락 정보 수집
  - `market_regime` (현재 시장 체제)
  - `fear_greed_index` (공포탐욕지수)
  - `urgency_level` (긴급도)
  - `btc_dominance` (BTC 도미넌스)

- [ ] **Step 3.4**: 코인 정체성 정보 수집
  - `시가총액등급` (메가캡/미드캡/스몰캡)
  - `섹터` (Layer-1, DeFi, Meme 등)
  - `유동성등급` (A/B/C/D)

- [ ] **Step 3.5**: 기술지표 스냅샷 생성
  - RSI_1d, MACD_1d, MA120_distance
  - 거래량비율, 볼린저밴드 등

- [ ] **Step 3.6**: 에러 핸들링 추가
  - try-except 블록으로 감싸기
  - 실패 시 로그 기록 + 시스템 계속 실행

---

### ✅ Phase 4: CIO 프롬프트 개선 (1시간)

- [ ] **Step 4.1**: `ai_strategy/prompts/cio_base_rules.txt` 백업
  - 백업: `cio_base_rules.txt.backup_20251027`

- [ ] **Step 4.2**: 일관성 검증 섹션 추가
  - 위치: Part 0 또는 Part 1 상단
  - 내용: "직전 CIO 결정" 정보 제공

- [ ] **Step 4.3**: `ai_strategy/cio.py` 프롬프트 생성 로직 수정
  - `get_latest_cio_decision()` 호출
  - 30분 이내 결정 있으면 프롬프트에 추가
  - 비중 변경 ±5% 이상 시 명시적 정당화 요구

- [ ] **Step 4.4**: 프롬프트 템플릿 작성
```python
if previous_cio:
    prompt += f"""

[⚠️ 직전 CIO 결정 (30분 이내)]
- 시간: {previous_cio['결정시각']}
- 목표 비중: {previous_cio['목표비중']}%
- 전략 근거: {previous_cio['전략근거'][:100]}...
- 시장 체제: {previous_cio['시장체제']}

⚠️ 일관성 검증 필수:
목표 비중 변경이 ±5% 이상이라면, 다음을 반드시 설명하세요:
1. 어떤 근본적 변화가 발생했는가?
2. 왜 직전 판단을 수정하는가?
3. 메가캡이라면 "급격한 변경 지양" 원칙은?
"""
```

---

### ✅ Phase 5: 모니터링 및 알림 (30분)

- [ ] **Step 5.1**: CIO 일관성 체크 함수 작성
  - 위치: `main.py` 또는 `ai_strategy/cio.py`
  - 기능: 최근 1시간 내 ±5% 이상 변경 감지

- [ ] **Step 5.2**: 로깅 강화
  - CIO 결정 저장 시 INFO 레벨 로그
  - 급격한 변경 감지 시 WARNING 로그

- [ ] **Step 5.3**: 대시보드 준비 (추후)
  - API 엔드포인트 설계 (선택 사항)
  - Recharts 차트 컴포넌트 설계

---

### ✅ Phase 6: 검증 및 테스트 (1시간)

- [ ] **Step 6.1**: 단위 테스트
  - `save_cio_decision()` 정상 저장 확인
  - `get_latest_cio_decision()` 조회 확인
  - 이전목표비중 자동 계산 확인

- [ ] **Step 6.2**: 통합 테스트
  - CIO 실행 → DB 저장 확인
  - 연속 2회 CIO 실행 → 이전목표비중 자동 설정 확인

- [ ] **Step 6.3**: 시나리오 테스트
  - **시나리오 1**: SOL 18% → 14% 급격한 변경
    - 프롬프트에 이전 결정 정보 포함 확인
    - AI가 정당화 근거 제시 확인

  - **시나리오 2**: 시간 여행
    - 7일 전 CIO 결정 조회 가능 확인

  - **시나리오 3**: 대시보드 조회
    - SQL 쿼리로 시계열 데이터 추출 확인

- [ ] **Step 6.4**: 성능 테스트
  - 인덱스 성능 확인 (EXPLAIN ANALYZE)
  - 대량 데이터 조회 속도 확인

---

## 5. 데이터 흐름도

### 🔄 Before (현재)

```
┌─────────────────────────────────────────────────────────────┐
│                   CIO 실행 (cio.py)                          │
│          AI가 목표 비중 결정 (JSON 응답)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              holding_status 테이블 업데이트                   │
│  • GPT보유비중 = 18.0 (UPSERT - 이전 값 덮어쓰기)            │
│  • GPT목표수익률 = 15.0                                      │
│  • GPT목표손절률 = -7.0                                      │
│  • 관리상태 = '활성'                                         │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           system_status 테이블 업데이트                      │
│  • cio_latest_rationale = "메가캡 추세 추종..."             │
│    (UPSERT - 이전 rationale 덮어쓰기)                       │
└─────────────────────────────────────────────────────────────┘

❌ 문제점:
- 이전 CIO 결정 추적 불가
- 시간 여행 불가 (히스토리 없음)
- 시장 맥락 정보 손실
```

### 🔄 After (개선)

```
┌─────────────────────────────────────────────────────────────┐
│                   CIO 실행 (cio.py)                          │
│          AI가 목표 비중 결정 (JSON 응답)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──────────────┬──────────────────────────┐
                     ▼              ▼                          ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  holding_status      │ │  system_status       │ │ cio_portfolio_       │
│  (현재 상태)          │ │  (최신 rationale)    │ │ decisions ⭐ NEW    │
│                      │ │                      │ │ (히스토리)           │
│ GPT보유비중 = 18.0   │ │ cio_latest_rationale │ │ 결정시각             │
│ GPT목표수익률 = 15.0 │ │ = "메가캡 추세..."   │ │ 코인이름 = SOL       │
│ GPT목표손절률 = -7.0 │ │                      │ │ 목표비중 = 18.0      │
│ 관리상태 = 활성      │ │                      │ │ 이전목표비중 = 14.0  │
└──────────────────────┘ └──────────────────────┘ │ 비중변화량 = +4.0    │
                                                   │ 전략근거 = "..."     │
                                                   │ 시장체제 = Uptrend   │
                                                   │ 공포탐욕지수 = 51    │
                                                   │ 긴급도 = 85          │
                                                   │ ...                  │
                                                   └──────────────────────┘
                                                            │
                                                            ▼
┌─────────────────────────────────────────────────────────────┐
│            다음 CIO 실행 시 활용                             │
│  1. get_latest_cio_decision(symbol, minutes=30)             │
│  2. 이전목표비중 자동 계산                                   │
│  3. 프롬프트에 이전 결정 정보 포함                           │
│  4. AI가 일관성 검증 수행                                    │
└─────────────────────────────────────────────────────────────┘

✅ 개선점:
- 모든 CIO 결정 이력 추적
- 시간 여행 가능 (7일, 30일 등)
- 시장 맥락 정보 보존
- 일관성 검증 자동화
```

---

## 6. 코드 수정 상세

### 📄 File 1: `supabase/03_create_cio_decisions_table.sql`

**파일 경로**: `c:\gptbitcoin4\supabase\03_create_cio_decisions_table.sql`

**내용**: (완전한 SQL 파일)

```sql
-- ============================================================
-- AI 트레이딩 시스템 - CIO 포트폴리오 결정 이력 테이블
-- 작성일: 2025-10-27
-- 목적: CIO 일관성 문제 해결 및 포트폴리오 결정 이력 추적
-- ============================================================

-- 한글 컬럼명을 큰따옴표로 감싸서 PostgreSQL에서 사용

-- ============================================================
-- 6. CIO 포트폴리오 결정 이력 테이블 (cio_portfolio_decisions)
-- ============================================================
CREATE TABLE IF NOT EXISTS cio_portfolio_decisions (
    id SERIAL PRIMARY KEY,

    -- ========== 기본 정보 ==========
    "결정시각" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "코인이름" TEXT NOT NULL,

    -- ========== 목표 비중 정보 ==========
    "목표비중" REAL NOT NULL,
    "이전목표비중" REAL,
    "비중변화량" REAL,
    "현재보유비중" REAL,

    -- ========== 리스크 관리 ==========
    "목표수익률" REAL,
    "목표손절률" REAL,

    -- ========== CIO 근거 및 맥락 ==========
    "전략근거" TEXT,
    "관리상태" TEXT,

    -- ========== 시장 맥락 정보 ==========
    "시장체제" TEXT,
    "공포탐욕지수" INTEGER,
    "긴급도" INTEGER,
    "BTC도미넌스" REAL,

    -- ========== 코인 정체성 정보 ==========
    "시가총액등급" TEXT,
    "섹터" TEXT,
    "유동성등급" TEXT,

    -- ========== 기술지표 스냅샷 ==========
    "기술지표" JSONB,

    -- ========== 전체 포트폴리오 스냅샷 ==========
    "전체포트폴리오" JSONB
);

-- ============================================================
-- 인덱스 (조회 성능 최적화)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cio_decision_time
    ON cio_portfolio_decisions("결정시각" DESC);

CREATE INDEX IF NOT EXISTS idx_cio_decision_coin
    ON cio_portfolio_decisions("코인이름");

CREATE INDEX IF NOT EXISTS idx_cio_decision_coin_time
    ON cio_portfolio_decisions("코인이름", "결정시각" DESC);

CREATE INDEX IF NOT EXISTS idx_cio_decision_market_regime
    ON cio_portfolio_decisions("시장체제");

CREATE INDEX IF NOT EXISTS idx_cio_decision_management
    ON cio_portfolio_decisions("관리상태");

-- ============================================================
-- 테이블 및 컬럼 설명
-- ============================================================
COMMENT ON TABLE cio_portfolio_decisions IS 'CIO AI의 포트폴리오 목표 비중 결정 이력 (시계열 데이터)';

COMMENT ON COLUMN cio_portfolio_decisions."결정시각" IS 'CIO 실행 시각 (timestamptz)';
COMMENT ON COLUMN cio_portfolio_decisions."코인이름" IS '코인 심볼 (BTC, ETH, SOL 등)';
COMMENT ON COLUMN cio_portfolio_decisions."목표비중" IS 'CIO가 설정한 목표 보유 비중 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."이전목표비중" IS '직전 CIO 결정의 목표 비중 (일관성 검증용, %)';
COMMENT ON COLUMN cio_portfolio_decisions."비중변화량" IS '목표비중 - 이전목표비중 (급격한 변경 감지용, %)';
COMMENT ON COLUMN cio_portfolio_decisions."현재보유비중" IS '결정 시점의 실제 포트폴리오 보유 비중 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."목표수익률" IS 'CIO가 설정한 익절 기준 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."목표손절률" IS 'CIO가 설정한 손절 기준 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."전략근거" IS 'CIO rationale: 투자 논리 및 비중 설정 근거';
COMMENT ON COLUMN cio_portfolio_decisions."관리상태" IS '활성(매매 대상) / 재평가(CIO 재검토) / 제외(매매 중단)';
COMMENT ON COLUMN cio_portfolio_decisions."시장체제" IS 'Process1이 감지한 시장 체제 (Uptrend/Range_Bound/Downtrend)';
COMMENT ON COLUMN cio_portfolio_decisions."공포탐욕지수" IS 'Crypto Fear & Greed Index (0=극단적 공포, 100=극단적 탐욕)';
COMMENT ON COLUMN cio_portfolio_decisions."긴급도" IS 'Process1 긴급도 점수 (0=정상, 100=최고 긴급)';
COMMENT ON COLUMN cio_portfolio_decisions."BTC도미넌스" IS 'BTC 시장 점유율 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."시가총액등급" IS '메가캡(>1조원) / 미드캡(1천억~1조) / 스몰캡(<1천억)';
COMMENT ON COLUMN cio_portfolio_decisions."섹터" IS 'Layer-1, Layer-2, DeFi, GameFi, Meme, AI, Other 등';
COMMENT ON COLUMN cio_portfolio_decisions."유동성등급" IS 'A(최고) / B(양호) / C(보통) / D(낮음)';
COMMENT ON COLUMN cio_portfolio_decisions."기술지표" IS 'JSON 형태의 주요 기술지표 스냅샷 (RSI, MACD, MA120 거리 등)';
COMMENT ON COLUMN cio_portfolio_decisions."전체포트폴리오" IS '전체 포트폴리오 비중 맵 (선택 사항, 디버깅용)';

-- ============================================================
-- 스키마 생성 완료 확인
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CIO 결정 이력 테이블 생성 완료!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '테이블명: cio_portfolio_decisions';
    RAISE NOTICE '인덱스: 5개 생성';
    RAISE NOTICE '용도: CIO 일관성 검증 및 이력 추적';
    RAISE NOTICE '========================================';
END $$;
```

**체크포인트**:
- [ ] SQL 파일 생성 완료
- [ ] Supabase에서 실행 완료
- [ ] `SELECT * FROM cio_portfolio_decisions LIMIT 1;` 성공

---

### 📄 File 2: `supabase_adapter.py` (메서드 추가)

**파일 경로**: `c:\gptbitcoin4\supabase_adapter.py`

**수정 위치**: SupabaseAdapter 클래스 내부 (Line ~2000 이후)

**추가 메서드 1**: `save_cio_decision()`

```python
def save_cio_decision(
    self,
    symbol: str,
    target_weight: float,
    target_profit: float = None,
    stop_loss: float = None,
    rationale: str = None,
    management_status: str = None,
    market_regime: str = None,
    fear_greed: int = None,
    urgency: int = None,
    btc_dominance: float = None,
    coin_identity: Dict = None,
    technical_indicators: Dict = None,
    full_portfolio: Dict = None
) -> Dict:
    """
    CIO 포트폴리오 결정 이력 저장

    Args:
        symbol: 코인 심볼 (예: 'BTC', 'ETH', 'SOL')
        target_weight: CIO가 설정한 목표 비중 (%)
        target_profit: 익절 기준 (%, 선택)
        stop_loss: 손절 기준 (%, 선택)
        rationale: CIO 전략 근거 (선택)
        management_status: '활성', '재평가', '제외' (선택)
        market_regime: 시장 체제 (Uptrend/Range_Bound/Downtrend, 선택)
        fear_greed: 공포탐욕지수 0-100 (선택)
        urgency: 긴급도 0-100 (선택)
        btc_dominance: BTC 도미넌스 % (선택)
        coin_identity: {'시총등급': str, '섹터': str, '유동성': str} (선택)
        technical_indicators: {'RSI_1d': float, 'MACD_1d': float, ...} (선택)
        full_portfolio: {'BTC': 30.0, 'ETH': 20.0, ...} (선택)

    Returns:
        Supabase insert 응답 딕셔너리

    Example:
        >>> adapter.save_cio_decision(
        ...     symbol='SOL',
        ...     target_weight=18.0,
        ...     target_profit=15.0,
        ...     stop_loss=-7.0,
        ...     rationale='메가캡 추세 추종 전략',
        ...     management_status='활성',
        ...     market_regime='Uptrend',
        ...     fear_greed=51,
        ...     urgency=85,
        ...     coin_identity={'시총등급': '메가캡', '섹터': 'Layer-1', '유동성': 'B'}
        ... )
    """
    from datetime import datetime, timezone, timedelta

    try:
        # 1. 직전 CIO 결정 조회 (3시간 이내)
        previous_decision = self.get_latest_cio_decision(symbol, minutes=180)
        previous_weight = previous_decision.get('목표비중') if previous_decision else None
        weight_change = target_weight - previous_weight if previous_weight is not None else 0

        # 2. 현재 보유 비중 조회
        holding = self.get_holding_status(symbol)
        current_holding_weight = holding.get('보유비중', 0.0) if holding else 0.0

        # 3. 코인 정체성 정보 추출
        coin_identity = coin_identity or {}
        market_cap_grade = coin_identity.get('시총등급')
        sector = coin_identity.get('섹터')
        liquidity_grade = coin_identity.get('유동성')

        # 4. 데이터 준비
        data = {
            '코인이름': symbol,
            '목표비중': target_weight,
            '이전목표비중': previous_weight,
            '비중변화량': weight_change,
            '현재보유비중': current_holding_weight,
            '목표수익률': target_profit,
            '목표손절률': stop_loss,
            '전략근거': rationale,
            '관리상태': management_status,
            '시장체제': market_regime,
            '공포탐욕지수': fear_greed,
            '긴급도': urgency,
            'BTC도미넌스': btc_dominance,
            '시가총액등급': market_cap_grade,
            '섹터': sector,
            '유동성등급': liquidity_grade,
            '기술지표': technical_indicators,  # JSONB
            '전체포트폴리오': full_portfolio    # JSONB
        }

        # 5. DB 저장
        result = self.supabase.table('cio_portfolio_decisions').insert(data).execute()

        # 6. 로깅
        logger.info(
            f"✅ CIO 결정 저장: {symbol} "
            f"목표 {target_weight:.1f}% "
            f"(이전: {previous_weight:.1f}% → 변화: {weight_change:+.1f}%p)"
            if previous_weight is not None
            else f"✅ CIO 결정 저장: {symbol} 목표 {target_weight:.1f}% (최초)"
        )

        # 7. 급격한 변경 감지 (±5% 이상)
        if abs(weight_change) >= 5.0:
            logger.warning(
                f"⚠️ CIO 급격한 변경 감지: {symbol} "
                f"{previous_weight:.1f}% → {target_weight:.1f}% "
                f"({weight_change:+.1f}%p 변경)"
            )

        return result.data[0] if result.data else {}

    except Exception as e:
        logger.error(f"❌ CIO 결정 저장 실패: {symbol}, {e}")
        return {}
```

**추가 메서드 2**: `get_latest_cio_decision()`

```python
def get_latest_cio_decision(self, symbol: str, minutes: int = 30) -> Dict:
    """
    최근 N분 이내 CIO 결정 조회

    Args:
        symbol: 코인 심볼
        minutes: 조회 시간 범위 (분, 기본값 30분)

    Returns:
        CIO 결정 딕셔너리 (없으면 None)

    Example:
        >>> decision = adapter.get_latest_cio_decision('SOL', minutes=30)
        >>> if decision:
        ...     print(f"목표: {decision['목표비중']}%")
        ...     print(f"근거: {decision['전략근거']}")
    """
    from datetime import datetime, timezone, timedelta

    try:
        cutoff_time = (datetime.now(timezone.utc) - timedelta(minutes=minutes)).isoformat()

        result = self.supabase.table('cio_portfolio_decisions') \
            .select('*') \
            .eq('코인이름', symbol) \
            .gte('결정시각', cutoff_time) \
            .order('결정시각', desc=True) \
            .limit(1) \
            .execute()

        return result.data[0] if result.data else None

    except Exception as e:
        logger.error(f"❌ 최근 CIO 결정 조회 실패: {symbol}, {e}")
        return None
```

**추가 메서드 3**: `get_cio_decision_history()`

```python
def get_cio_decision_history(self, symbol: str, days: int = 7) -> List[Dict]:
    """
    특정 코인의 CIO 결정 히스토리 조회 (시계열)

    Args:
        symbol: 코인 심볼
        days: 조회 기간 (일, 기본값 7일)

    Returns:
        CIO 결정 리스트 (시간 역순)

    Example:
        >>> history = adapter.get_cio_decision_history('SOL', days=7)
        >>> for decision in history:
        ...     print(f"{decision['결정시각']}: {decision['목표비중']}%")
    """
    from datetime import datetime, timezone, timedelta

    try:
        cutoff_time = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()

        result = self.supabase.table('cio_portfolio_decisions') \
            .select('*') \
            .eq('코인이름', symbol) \
            .gte('결정시각', cutoff_time) \
            .order('결정시각', desc=True) \
            .execute()

        return result.data if result.data else []

    except Exception as e:
        logger.error(f"❌ CIO 히스토리 조회 실패: {symbol}, {e}")
        return []
```

**추가 메서드 4**: `get_recent_cio_decisions()`

```python
def get_recent_cio_decisions(self, hours: int = 1) -> Dict[str, List[Dict]]:
    """
    모든 코인의 최근 N시간 이내 CIO 결정 조회

    Args:
        hours: 조회 시간 범위 (시간, 기본값 1시간)

    Returns:
        {symbol: [decisions]} 딕셔너리

    Example:
        >>> recent = adapter.get_recent_cio_decisions(hours=1)
        >>> for symbol, decisions in recent.items():
        ...     print(f"{symbol}: {len(decisions)}건")
    """
    from datetime import datetime, timezone, timedelta

    try:
        cutoff_time = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()

        result = self.supabase.table('cio_portfolio_decisions') \
            .select('*') \
            .gte('결정시각', cutoff_time) \
            .order('결정시각', desc=True) \
            .execute()

        # 코인별로 그룹화
        decisions_by_coin = {}
        for decision in result.data:
            symbol = decision['코인이름']
            if symbol not in decisions_by_coin:
                decisions_by_coin[symbol] = []
            decisions_by_coin[symbol].append(decision)

        return decisions_by_coin

    except Exception as e:
        logger.error(f"❌ 최근 CIO 결정 조회 실패: {e}")
        return {}
```

**체크포인트**:
- [ ] 4개 메서드 추가 완료
- [ ] Docstring 작성 완료
- [ ] Import 문 추가 (datetime, timezone, timedelta)
- [ ] logger 사용 확인

---

### 📄 File 3: `ai_strategy/cio.py` (CIO 실행 로직 통합)

**파일 경로**: `c:\gptbitcoin4\ai_strategy\cio.py`

**수정 위치**: `recalculate_portfolio_weights()` 함수 내부

**백업**: `cio.py.backup_20251027` 생성

**수정 내용**:

```python
# ===== Line ~2490: targets 저장 로직 수정 =====

# [CIO 개혁안 Part 6] CIO가 설정한 targets를 DB에 저장
targets = ai_result.get('targets', {})
if targets:
    logger.info("[CIO] 개별 자산 목표 비중 및 리스크 설정 DB 반영 시작")

    # 시장 맥락 정보 수집
    market_regime = db_manager.get_system_status('last_market_regime') or 'Unknown'
    fear_greed_index = market_cache.get_fear_greed_index()
    btc_dominance = market_cache.get_btc_dominance()

    # 긴급도 정보 (emergency_coins에서 추출 또는 기본값)
    urgency_level = 0
    if emergency_coins:
        # 긴급 상황 코인이 있다면 최대 긴급도 사용
        urgency_level = max([coin.get('긴급도', 0) for coin in emergency_coins], default=0)

    for symbol, target_info in targets.items():
        target_weight = target_info.get('weight')
        target_profit = target_info.get('target_profit')
        stop_loss = target_info.get('stop_loss')
        rationale = target_info.get('rationale', '')
        management_status = target_info.get('management_status', '활성')

        # 코인 정체성 정보 수집
        coin_identity = {}
        coin_config = None
        for coin in analysis_target_coins:
            if coin.symbol == symbol:
                coin_config = coin
                break

        if coin_config:
            # 시가총액 등급 계산
            market_data = market_cache.get_ticker(f"KRW-{symbol}")
            if market_data:
                market_cap_krw = market_data.get('acc_trade_price_24h', 0)
                if market_cap_krw > 1_000_000_000_000:  # 1조원
                    market_cap_grade = '메가캡'
                elif market_cap_krw > 100_000_000_000:  # 1천억원
                    market_cap_grade = '미드캡'
                else:
                    market_cap_grade = '스몰캡'
            else:
                market_cap_grade = 'Unknown'

            # 유동성 등급
            liquidity_grades_map = get_liquidity_grades([symbol])
            liquidity_grade = liquidity_grades_map.get(symbol, 'Unknown')

            # 섹터 정보 (config에서 추출 또는 기본값)
            sector = getattr(coin_config, 'sector', 'Other')

            coin_identity = {
                '시총등급': market_cap_grade,
                '섹터': sector,
                '유동성': liquidity_grade
            }

        # 기술지표 수집
        technical_indicators = {}
        try:
            indicators = get_technical_indicators(f"KRW-{symbol}")
            if indicators:
                technical_indicators = {
                    'RSI_1d': indicators.get('rsi', {}).get('1d'),
                    'MACD_1d': indicators.get('macd', {}).get('1d'),
                    'MA120_distance': indicators.get('ma120_distance'),
                    '거래량비율': indicators.get('volume_ratio')
                }
        except Exception as e:
            logger.debug(f"기술지표 수집 실패: {symbol}, {e}")

        # 전체 포트폴리오 스냅샷 (선택 사항)
        full_portfolio = final_weights.copy()  # final_weights 딕셔너리 복사

        # ===== CIO 결정 이력 저장 (신규) =====
        try:
            db_manager.save_cio_decision(
                symbol=symbol,
                target_weight=target_weight,
                target_profit=target_profit,
                stop_loss=stop_loss,
                rationale=rationale,
                management_status=management_status,
                market_regime=market_regime,
                fear_greed=fear_greed_index,
                urgency=urgency_level,
                btc_dominance=btc_dominance,
                coin_identity=coin_identity,
                technical_indicators=technical_indicators,
                full_portfolio=full_portfolio
            )
        except Exception as save_error:
            # CIO 결정 저장 실패해도 시스템은 계속 실행
            logger.error(f"❌ CIO 결정 이력 저장 실패 (시스템은 계속): {symbol}, {save_error}")

        # 기존 holding_status 업데이트 (기존 로직 유지)
        if target_profit is not None and stop_loss is not None:
            db_manager.update_holding_status(symbol, {
                'GPT목표수익률': target_profit,
                'GPT목표손절률': stop_loss
            })
            logger.info(
                f"  ├─ {symbol}: "
                f"목표수익률 {target_profit:+.1f}%, "
                f"목표손절률 {stop_loss:.1f}%"
            )
```

**체크포인트**:
- [ ] `cio.py` 백업 완료
- [ ] Line ~2490 수정 완료
- [ ] 시장 맥락 정보 수집 로직 추가
- [ ] 코인 정체성 정보 수집 로직 추가
- [ ] `save_cio_decision()` 호출 추가
- [ ] 에러 핸들링 추가 (try-except)

---

### 📄 File 4: `ai_strategy/cio.py` (프롬프트 개선)

**수정 위치**: Line ~200-300 (프롬프트 생성 부분)

**추가 내용**: 이전 CIO 결정 정보 포함

```python
# ===== Line ~250: 개별 코인 프롬프트 생성 =====

for coin in analysis_target_coins:
    symbol = coin.symbol

    # ... (기존 데이터 수집 로직) ...

    # ===== 이전 CIO 결정 조회 (신규) =====
    previous_cio = db_manager.get_latest_cio_decision(symbol, minutes=30)

    if previous_cio:
        # 30분 이내 이전 결정이 있으면 프롬프트에 추가
        previous_weight = previous_cio.get('목표비중', 0)
        previous_rationale = previous_cio.get('전략근거', '')
        previous_time = previous_cio.get('결정시각', '')
        previous_regime = previous_cio.get('시장체제', '')

        # 시간 차이 계산
        from datetime import datetime, timezone
        try:
            decision_time = datetime.fromisoformat(previous_time.replace('Z', '+00:00'))
            time_diff_minutes = (datetime.now(timezone.utc) - decision_time).total_seconds() / 60
        except:
            time_diff_minutes = 0

        consistency_prompt = f"""

[⚠️ 직전 CIO 결정 존재 ({time_diff_minutes:.0f}분 전)]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 결정 시각: {previous_time}
- 목표 비중: {previous_weight:.1f}%
- 시장 체제: {previous_regime}
- 전략 근거: {previous_rationale[:200]}{"..." if len(previous_rationale) > 200 else ""}

⚠️ **일관성 검증 프로토콜 (필수)**:

만약 목표 비중을 **±5% 이상 변경**하려 한다면, 다음을 반드시 설명하세요:

1. **근본적 변화**: 어떤 시장/코인 상황이 근본적으로 변화했는가?
   - 일봉 추세 전환? (상승→하락 or 하락→상승)
   - 주요 지지/저항선 돌파? (120일선, 주요 가격대)
   - BTC 동반 급락/급등? (±7% 이상)

2. **이전 논리 반박**: 왜 {time_diff_minutes:.0f}분 전의 판단({previous_weight:.1f}%)이 더 이상 유효하지 않은가?
   - 직전 rationale의 핵심 가정이 깨졌는가?
   - 새로운 정보가 추가되었는가?

3. **정체성 원칙 준수**:
   - **메가캡**이라면: "급격한 변경 지양" 원칙을 어떻게 적용했는가?
   - **미드캡**이라면: 균형 잡힌 접근을 했는가?
   - **스몰캡**이라면: 빠른 대응이 정당한가?

⚠️ **중요**: 목표 비중 변경이 ±5% 미만이라면 위 설명 생략 가능.
          변경이 ±5% 이상이라면 [전략적 딜레마 분석]에 반드시 포함하세요.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
        # 기존 프롬프트에 추가
        coin_prompt = consistency_prompt + coin_prompt

    # ... (나머지 프롬프트 생성 로직) ...
```

**체크포인트**:
- [ ] 이전 CIO 결정 조회 로직 추가
- [ ] 일관성 검증 프롬프트 생성
- [ ] 시간 차이 계산 로직 추가
- [ ] 메가캡/미드캡/스몰캡별 원칙 명시

---

## 7. 검증 및 테스트 계획

### ✅ 단위 테스트

#### Test 1: `save_cio_decision()` 정상 저장

```python
# 테스트 코드
from supabase_adapter import SupabaseAdapter

adapter = SupabaseAdapter()

result = adapter.save_cio_decision(
    symbol='SOL',
    target_weight=18.0,
    target_profit=15.0,
    stop_loss=-7.0,
    rationale='메가캡 추세 추종 전략',
    management_status='활성',
    market_regime='Uptrend',
    fear_greed=51,
    urgency=85,
    coin_identity={'시총등급': '메가캡', '섹터': 'Layer-1', '유동성': 'B'}
)

print(f"✅ 저장 완료: {result}")
```

**예상 결과**:
```
✅ CIO 결정 저장: SOL 목표 18.0% (최초)
✅ 저장 완료: {'id': 1, '코인이름': 'SOL', '목표비중': 18.0, ...}
```

#### Test 2: `get_latest_cio_decision()` 조회

```python
decision = adapter.get_latest_cio_decision('SOL', minutes=30)

if decision:
    print(f"✅ 조회 성공:")
    print(f"   목표 비중: {decision['목표비중']}%")
    print(f"   전략 근거: {decision['전략근거'][:50]}...")
else:
    print("❌ 조회 실패: 30분 이내 결정 없음")
```

**예상 결과**:
```
✅ 조회 성공:
   목표 비중: 18.0%
   전략 근거: 메가캡 추세 추종 전략...
```

#### Test 3: 이전목표비중 자동 계산

```python
# 첫 번째 저장
adapter.save_cio_decision(symbol='SOL', target_weight=18.0)

# 5분 후 두 번째 저장
import time
time.sleep(5)
result = adapter.save_cio_decision(symbol='SOL', target_weight=14.0)

print(f"이전목표비중: {result.get('이전목표비중')}")  # 18.0
print(f"비중변화량: {result.get('비중변화량')}")      # -4.0
```

**예상 결과**:
```
✅ CIO 결정 저장: SOL 목표 14.0% (이전: 18.0% → 변화: -4.0%p)
⚠️ CIO 급격한 변경 감지: SOL 18.0% → 14.0% (-4.0%p 변경)
이전목표비중: 18.0
비중변화량: -4.0
```

---

### ✅ 통합 테스트

#### Test 4: CIO 실행 → DB 저장 확인

```bash
# 1. 트레이딩봇 실행
python main.py

# 2. CIO 실행 대기 (09:10 또는 긴급 상황)
# 3. 로그 확인
tail -f trading_system.log | grep "CIO 결정 저장"

# 예상 로그:
# ✅ CIO 결정 저장: SOL 목표 18.0% (최초)
# ✅ CIO 결정 저장: BTC 목표 30.0% (최초)
# ✅ CIO 결정 저장: ETH 목표 20.0% (최초)
```

```sql
-- 4. Supabase에서 직접 확인
SELECT "코인이름", "목표비중", "이전목표비중", "비중변화량", "결정시각"
FROM cio_portfolio_decisions
ORDER BY "결정시각" DESC
LIMIT 10;
```

**예상 결과**:
| 코인이름 | 목표비중 | 이전목표비중 | 비중변화량 | 결정시각 |
|---------|---------|-------------|-----------|---------|
| SOL | 18.0 | NULL | 0 | 2025-10-27 09:45:02 |
| BTC | 30.0 | NULL | 0 | 2025-10-27 09:45:02 |
| ETH | 20.0 | NULL | 0 | 2025-10-27 09:45:02 |

---

### ✅ 시나리오 테스트

#### Test 5: SOL 18% → 14% 급격한 변경 (일관성 검증)

**시나리오**:
1. CIO 실행 #1: SOL 18% 설정
2. 11분 후 CIO 실행 #2: SOL 14% 설정 시도

**예상 프롬프트** (CIO #2):
```
[⚠️ 직전 CIO 결정 존재 (11분 전)]
- 목표 비중: 18.0%
- 전략 근거: 메가캡 추세 추종, RSI 과매수에도 거래량 2.62배

⚠️ 일관성 검증 프로토콜:
목표 비중을 18% → 14% (±4%p 변경)하려면:
1. 근본적 변화: 무엇이 바뀌었는가?
2. 이전 논리 반박: 왜 11분 전 판단이 틀렸는가?
3. 메가캡 원칙: "급격한 변경 지양" 원칙은?
```

**예상 AI 응답**:
```json
{
  "SOL": {
    "weight": 17.0,  // 18% → 14%가 아닌 17%로 소폭 조정
    "rationale": "[일관성 검증] 11분 전 18% 설정했으나, Range_Bound 전환 확인.
                  메가캡 원칙상 급격한 변경(±4%) 지양하여 17%로 소폭 축소.
                  일봉 추세 전환 시 재검토."
  }
}
```

**검증 방법**:
- [ ] 프롬프트에 이전 결정 정보 포함 확인
- [ ] AI가 급격한 변경 자제 확인 (18% → 17%)
- [ ] rationale에 일관성 검증 내용 포함 확인

---

#### Test 6: 시간 여행 (7일 전 CIO 결정 조회)

```python
# 7일간 데이터 축적 후 테스트
history = adapter.get_cio_decision_history('SOL', days=7)

for decision in history:
    print(
        f"{decision['결정시각']}: "
        f"{decision['목표비중']:.1f}% "
        f"(시장: {decision['시장체제']}, F&G: {decision['공포탐욕지수']})"
    )
```

**예상 결과**:
```
2025-10-27 15:00:00: 12.0% (시장: Uptrend, F&G: 55)
2025-10-27 10:15:41: 12.0% (시장: Uptrend, F&G: 51)
2025-10-27 10:02:14: 14.0% (시장: Range_Bound, F&G: 51)
2025-10-27 09:57:19: 14.0% (시장: Range_Bound, F&G: 51)
2025-10-27 09:45:02: 18.0% (시장: Uptrend, F&G: 51)
...
```

---

#### Test 7: 대시보드 조회 (SQL 쿼리)

```sql
-- 시계열 차트 데이터
SELECT
    "결정시각",
    "코인이름",
    "목표비중",
    "현재보유비중",
    "비중변화량",
    "시장체제",
    "공포탐욕지수"
FROM cio_portfolio_decisions
WHERE "코인이름" = 'SOL'
  AND "결정시각" >= NOW() - INTERVAL '7 days'
ORDER BY "결정시각" ASC;
```

**예상 결과**:
```
결정시각               | 코인이름 | 목표비중 | 현재보유비중 | 비중변화량 | 시장체제 | 공포탐욕지수
2025-10-27 09:45:02   | SOL     | 18.0    | 12.77       | 0.0       | Uptrend  | 51
2025-10-27 09:57:19   | SOL     | 14.0    | 12.77       | -4.0      | Range    | 51
2025-10-27 10:02:14   | SOL     | 14.0    | 10.22       | 0.0       | Uptrend  | 51
2025-10-27 10:15:41   | SOL     | 12.0    | 10.22       | -2.0      | Uptrend  | 55
```

**Recharts 활용**:
```typescript
<LineChart data={sqlResult}>
  <XAxis dataKey="결정시각" />
  <YAxis />
  <Line type="monotone" dataKey="목표비중" stroke="#8884d8" name="CIO 목표" />
  <Line type="monotone" dataKey="현재보유비중" stroke="#82ca9d" name="실제 보유" />
</LineChart>
```

---

### ✅ 성능 테스트

#### Test 8: 인덱스 성능 확인

```sql
-- EXPLAIN ANALYZE로 쿼리 성능 측정
EXPLAIN ANALYZE
SELECT * FROM cio_portfolio_decisions
WHERE "코인이름" = 'SOL'
  AND "결정시각" >= NOW() - INTERVAL '30 minutes'
ORDER BY "결정시각" DESC
LIMIT 1;
```

**예상 결과**:
```
Index Scan using idx_cio_decision_coin_time on cio_portfolio_decisions
  (cost=0.15..8.17 rows=1 width=XXX) (actual time=0.025..0.026 rows=1 loops=1)
  Index Cond: (("코인이름" = 'SOL') AND ("결정시각" >= ...))
Planning Time: 0.123 ms
Execution Time: 0.048 ms  ✅ 매우 빠름 (< 1ms)
```

---

## 8. 롤백 계획

### 🔙 Phase 1 롤백: 테이블 삭제

```sql
-- 1. 테이블 삭제 (데이터 손실 주의!)
DROP TABLE IF EXISTS cio_portfolio_decisions;

-- 2. 인덱스 자동 삭제됨
```

**조건**: 테이블 생성 후 심각한 오류 발견 시

---

### 🔙 Phase 2 롤백: 코드 원복

```bash
# 1. 백업 파일에서 원복
cp c:/gptbitcoin4/ai_strategy/cio.py.backup_20251027 c:/gptbitcoin4/ai_strategy/cio.py

# 2. supabase_adapter.py 수정 취소 (Git 사용 시)
git checkout c:/gptbitcoin4/supabase_adapter.py
```

**조건**: CIO 실행 중 오류 발생 시

---

### 🔙 Phase 3 롤백: 부분 비활성화

```python
# ai_strategy/cio.py에서 save_cio_decision() 호출 주석 처리

# ===== CIO 결정 이력 저장 (신규) =====
# try:
#     db_manager.save_cio_decision(...)
# except Exception as save_error:
#     logger.error(f"❌ CIO 결정 이력 저장 실패: {save_error}")
```

**조건**: 저장 로직만 문제 있을 시 (CIO 실행은 정상)

---

## 9. 체크리스트 요약

### ✅ Phase 1: 테이블 생성
- [ ] SQL 파일 생성
- [ ] Supabase 실행
- [ ] RLS 설정
- [ ] 테이블 검증

### ✅ Phase 2: supabase_adapter.py
- [ ] `save_cio_decision()` 추가
- [ ] `get_latest_cio_decision()` 추가
- [ ] `get_cio_decision_history()` 추가
- [ ] `get_recent_cio_decisions()` 추가
- [ ] Docstring 작성

### ✅ Phase 3: CIO 통합
- [ ] `cio.py` 백업
- [ ] 시장 맥락 수집 추가
- [ ] 코인 정체성 수집 추가
- [ ] `save_cio_decision()` 호출 추가
- [ ] 에러 핸들링 추가

### ✅ Phase 4: 프롬프트 개선
- [ ] 이전 CIO 결정 조회
- [ ] 일관성 검증 프롬프트 추가
- [ ] 시간 차이 계산
- [ ] 메가캡 원칙 명시

### ✅ Phase 5: 모니터링
- [ ] CIO 일관성 체크 함수
- [ ] 로깅 강화
- [ ] 대시보드 준비 (선택)

### ✅ Phase 6: 테스트
- [ ] 단위 테스트 (8개)
- [ ] 통합 테스트
- [ ] 시나리오 테스트
- [ ] 성능 테스트

---

## 10. 예상 소요 시간

| Phase | 작업 내용 | 예상 시간 | 난이도 |
|-------|----------|----------|-------|
| Phase 1 | 테이블 생성 | 30분 | ⭐ 쉬움 |
| Phase 2 | supabase_adapter.py | 1시간 | ⭐⭐ 보통 |
| Phase 3 | CIO 통합 | 1.5시간 | ⭐⭐⭐ 어려움 |
| Phase 4 | 프롬프트 개선 | 1시간 | ⭐⭐ 보통 |
| Phase 5 | 모니터링 | 30분 | ⭐ 쉬움 |
| Phase 6 | 테스트 | 1시간 | ⭐⭐ 보통 |
| **총합** | | **5.5시간** | |

---

## 11. 주의사항

### ⚠️ 중요 경고

1. **데이터 손실 방지**
   - 테이블 삭제 전 반드시 백업
   - 롤백 계획 숙지

2. **코드 백업 필수**
   - `cio.py.backup_20251027` 생성
   - Git commit 권장

3. **단계별 검증**
   - 각 Phase 완료 후 반드시 체크포인트 확인
   - 오류 발생 시 즉시 중단 후 롤백

4. **운영 환경 주의**
   - 로컬 테스트 먼저
   - Supabase는 Production DB

5. **프롬프트 토큰 증가**
   - 이전 CIO 정보 추가로 프롬프트 길이 증가
   - API 비용 약간 증가 (허용 범위)

---

## 12. 성공 기준

### ✅ 최소 성공 기준 (MVP)

- [ ] `cio_portfolio_decisions` 테이블 생성 완료
- [ ] CIO 실행 시 DB에 자동 저장
- [ ] `get_latest_cio_decision()` 정상 조회
- [ ] 이전목표비중 자동 계산

### ✅ 완전 성공 기준

- [ ] 프롬프트에 이전 결정 정보 포함
- [ ] AI가 일관성 검증 수행 (±5% 변경 시 정당화)
- [ ] 7일 히스토리 조회 가능
- [ ] 대시보드 시계열 차트 가능 (SQL 쿼리 성공)

---

## 📅 구현 일정

**날짜**: 2025-10-27 (오늘)

**시작 시간**: 작업 개시 시각 기록

**Phase별 완료 예상 시각**:
- Phase 1: +30분
- Phase 2: +1시간 30분
- Phase 3: +3시간
- Phase 4: +4시간
- Phase 5: +4시간 30분
- Phase 6: +5시간 30분

**최종 완료 예상**: 작업 시작 후 약 5.5시간

---

**📝 작성자**: AI Trading Bot Team
**📅 최종 수정**: 2025-10-27
**📦 버전**: v1.0
**✅ 검토 상태**: 완료

---

## 부록: 참고 자료

### A. 관련 문서
- [docs/dev_guide/README.md](dev_guide/README.md) - 개발 규칙
- [docs/dev_guide/CIO비중_명세서.md](dev_guide/CIO비중_명세서.md) - CIO 프롬프트 명세
- [supabase/01_create_schema.sql](../supabase/01_create_schema.sql) - 기존 스키마

### B. 유용한 SQL 쿼리

```sql
-- 급격한 변경 감지 (±5% 이상)
SELECT "코인이름", "결정시각", "목표비중", "이전목표비중", "비중변화량"
FROM cio_portfolio_decisions
WHERE ABS("비중변화량") >= 5.0
ORDER BY "결정시각" DESC;

-- 시장 체제별 CIO 결정 분포
SELECT "시장체제", COUNT(*) as "결정횟수", AVG("목표비중") as "평균목표비중"
FROM cio_portfolio_decisions
GROUP BY "시장체제";

-- 코인별 최신 결정
SELECT DISTINCT ON ("코인이름") *
FROM cio_portfolio_decisions
ORDER BY "코인이름", "결정시각" DESC;
```

### C. 긴급 연락처
- Supabase Support: support@supabase.io
- Upbit API Docs: https://docs.upbit.com/

---

## 9. 구현 중 발생한 버그 및 해결

### 🐛 Bug #1: KRW-KRW-SOL 중복 접두사 에러

**발생 시각**: 2025-10-27 13:33:14

**에러 메시지**:
```
[KRW-KRW-SOL-minute60] data retrieval failed
[KRW-KRW-SOL-day] data retrieval failed
```

**근본 원인**:
1. AI 응답에서 symbol은 정상: `"asset": "SOL"` (KRW- 접두사 없음)
2. `targets` dict도 정상: `{"SOL": {...}, "KAITO": {...}}`
3. **문제 발생 지점**: [cio.py:2663](c:\gptbitcoin4\ai_strategy\cio.py#L2663)
   ```python
   # BEFORE (잘못된 코드)
   ticker_symbol = symbol if symbol.startswith('KRW-') else f"KRW-{symbol}"
   indicators = get_technical_indicators(ticker_symbol)  # "KRW-SOL" 전달
   ```

4. **중복 발생**: [ohlcv.py:195](c:\gptbitcoin4\data_manager\ohlcv.py#L195)
   ```python
   def get_technical_indicators(symbol: str, interval: str = "minute60"):
       ticker = f"KRW-{symbol}"  # "KRW-SOL" → "KRW-KRW-SOL"
   ```

**해결책**:
```python
# AFTER (수정된 코드) - cio.py Line 2661-2663
# get_technical_indicators는 내부에서 "KRW-" 접두사를 추가하므로
# clean_symbol (KRW- 제거된 심볼)을 전달해야 함
indicators = get_technical_indicators(clean_symbol)  # "SOL" 전달
```

**적용 파일**: [ai_strategy/cio.py:2663](c:\gptbitcoin4\ai_strategy\cio.py#L2663)

**검증 필요사항**:
- ✅ cio.py Line 1730은 정상 (`coin.symbol`은 이미 clean symbol)
- ✅ `get_technical_indicators` 함수 시그니처는 유지 (다른 모듈 호환성)
- ⏳ 실행 로그에서 KRW-KRW- 에러 사라졌는지 확인 필요

---

### 🐛 Bug #2: market_cache 속성 접근 에러

**발생 시각**: 2025-10-27 (Phase 4 진행 중)

**에러 메시지**:
```
'MarketDataCache' object has no attribute 'get_fear_greed_index'
```

**근본 원인**:
- `market_cache.fear_greed_index`와 `market_cache.btc_dominance`는 **속성(attribute)**이지 메서드가 아님
- 반환값은 dict 형태: `{'status': 'success', 'data': {...}}`

**해결책**: [cio.py:2576-2581](c:\gptbitcoin4\ai_strategy\cio.py#L2576-L2581)
```python
# BEFORE (잘못된 코드)
fear_greed_index = market_cache.get_fear_greed_index()
btc_dominance = market_cache.get_btc_dominance()

# AFTER (수정된 코드)
fear_greed_data = market_cache.fear_greed_index or {}
fear_greed_index = fear_greed_data.get('data', {}).get('value') if fear_greed_data.get('status') == 'success' else None

btc_dom_data = market_cache.btc_dominance or {}
btc_dominance = btc_dom_data.get('data') if btc_dom_data.get('status') == 'success' else None
```

**상태**: ✅ 해결됨

---

### 🐛 Bug #3: emergency_coins 변수 스코프 에러

**발생 시각**: 2025-10-27 (Phase 4 진행 중)

**에러 메시지**:
```
name 'emergency_coins' is not defined
```

**근본 원인**:
- `_finalize_and_log_weights` 함수 내부에서 `emergency_coins` 변수 사용
- 하지만 함수 파라미터로 전달되지 않음

**해결책**:
1. 함수 시그니처 수정 [cio.py:2433](c:\gptbitcoin4\ai_strategy\cio.py#L2433)
   ```python
   def _finalize_and_log_weights(
       ai_result: Dict,
       analyzed_coins: List[CoinConfig],
       watchlist_coins: List[Dict] = None,
       emergency_coins: List[Dict] = None  # ← 추가
   )
   ```

2. 호출부 수정 [cio.py:1351](c:\gptbitcoin4\ai_strategy\cio.py#L1351)
   ```python
   return _finalize_and_log_weights(result, analysis_target_coins, watchlist_coins, emergency_coins)
   ```

**상태**: ✅ 해결됨

---

### 🐛 Bug #4: analysis_target_coins 변수명 오류

**발생 시각**: 2025-10-27 (Phase 4 진행 중)

**에러 메시지**: Pylance warning
```
"analysis_target_coins" is not defined
```

**근본 원인**:
- 함수 파라미터명: `analyzed_coins`
- 함수 내부에서 잘못된 변수명 사용: `analysis_target_coins`

**해결책**: [cio.py:2611](c:\gptbitcoin4\ai_strategy\cio.py#L2611)
```python
# BEFORE
for coin in analysis_target_coins:

# AFTER
for coin in analyzed_coins:
```

**상태**: ✅ 해결됨

---

### 🐛 Bug #5: 3-4순위 코인 관심종목 등록 안됨 (2차 수정 완료)

**발생 시각**: 2025-10-27 13:33:14 (1차), 13:53:28 (2차)

---

#### 📌 1차 문제 및 해결

**현상**:
- AI 코멘트: "3순위 FLOCK은 관심 종목으로, 4순위 PROVE는 관심 종목으로"
- 실제 로그: `select_best_coin_from_candidates` 반환값 = `['VIRTUAL', 'WLFI']` (2개만)
- `top_4_coins = final_candidates[:4]` → 2개만 존재
- `top_4_coins[2:4]` → 빈 리스트 → 3-4순위 등록 안됨

**근본 원인**:
- AI 응답의 `ranking` 필드: 4개 코인
- AI 응답의 `final_selection` 필드: 2개 코인만
- 코드는 `final_selection`만 사용 → 3-4순위 정보 손실

**해결책**: [market_analysis.py:1259-1275](c:\gptbitcoin4\ai_strategy\market_analysis.py#L1259-L1275)
```python
# [Fix] ranking 필드에서 전체 순위 정보를 추출하여 3-4순위 보존
ranking = result.get("ranking", [])
final_selection = result.get("final_selection", [])

if ranking and len(ranking) > len(final_selection):
    ranked_symbols = [r.get("symbol") for r in ranking if r.get("symbol")]
    # ... 검증 로직
    final_selection = valid_ranked  # 3-4순위 포함
```

---

#### 📌 2차 문제 및 해결 (추가 발견)

**현상**:
- AI 코멘트: "VANA는 3순위로 선정되어..."
- 로그: `✅ 퀀트 선택 수정: ['FLOCK', 'WLFI']` (2개)
- DB: coin_watch_history에 VANA 없음 ❌

**근본 원인**:
- 1차 수정으로 `final_selection = ["FLOCK", "ENA", "VANA"]` (3개) 생성 ✅
- **하지만 "1-2순위 퀀트 검증" 로직이 3-4순위를 삭제!** ❌

**데이터 흐름**:
```python
# Line 1259-1275: AI 선택 (1차 수정 적용)
final_selection = ["FLOCK", "ENA", "VANA"]  # 3개 ✅

# Line 1450-1473: 퀀트 검증
ai_pick = "FLOCK"  # final_selection[0]
quant_pick = "ENA"  # final_selection[1]
top_sharpe = "WLFI"  # Sharpe 1위

# 경우 2: quant_pick != top_sharpe and ai_pick != top_sharpe
# BEFORE (문제)
final_selection = [ai_pick, top_sharpe]  # ["FLOCK", "WLFI"]
# ❌ VANA (3순위) 완전 소실!
```

**해결책**: [market_analysis.py:1450-1515](c:\gptbitcoin4\ai_strategy\market_analysis.py#L1450-L1515)

**수정 1: 퀀트 검증 시 3-4순위 보존**
```python
# [Fix] 3-4순위 보존을 위해 별도 저장
remaining_ranks = final_selection[2:] if len(final_selection) > 2 else []

# 경우 1: AI와 퀀트가 동일한 코인 선택 (중복)
if ai_pick == quant_pick:
    new_quant = second_sharpe if second_sharpe != ai_pick else (...)
    final_selection = [ai_pick, new_quant] + remaining_ranks  # ← 복원

# 경우 2: 퀀트 선택이 Sharpe 1위가 아님
elif quant_pick != top_sharpe and ai_pick != top_sharpe:
    final_selection = [ai_pick, top_sharpe] + remaining_ranks  # ← 복원

# 경우 3: AI가 Sharpe 1위를 선택 (중복)
elif ai_pick == top_sharpe and quant_pick == top_sharpe:
    final_selection = [ai_pick, second_sharpe] + remaining_ranks  # ← 복원
```

**수정 2: 중복 제거 로직 개선**
```python
# [Fix] 순서 보존하면서 중복 제거
unique_selection = []
seen = set()
for symbol in final_selection:
    if symbol not in seen:
        unique_selection.append(symbol)
        seen.add(symbol)

# 중복 교체 시에도 3-4순위 보존
if len(unique_selection) == 1:
    remaining_ranks_dup = unique_selection[1:]
    final_selection = [duplicated_coin, new_coin] + remaining_ranks_dup
```

---

**상태**: ✅ 2차 수정 완료

**검증 필요사항**:
- ⏳ 다음 실행 시 3-4순위가 coin_watch_history에 정상 등록되는지 확인
- ⏳ 퀀트 검증 로직이 3순위를 보존하는지 확인
- ⏳ 중복 제거 로직이 3순위를 유지하는지 확인

---

**END OF DOCUMENT**
