# Process2 (매매판단) 전면 개혁안
# Tactical Execution Specialist Reform

**문서 버전**: 1.0
**작성일**: 2025-01-XX
**개혁 범위**: Process2 매매판단 시스템 전면 재설계
**개혁 철학**: "CIO는 전략가(What), Process2는 전술가(When & How)"

---

## 📋 목차

1. [개혁 배경 및 목표](#1-개혁-배경-및-목표)
2. [현재 시스템 분석](#2-현재-시스템-분석)
3. [핵심 문제점 진단](#3-핵심-문제점-진단)
4. [개혁 핵심 원칙](#4-개혁-핵심-원칙)
5. [개혁안 상세 설계](#5-개혁안-상세-설계)
6. [구현 계획](#6-구현-계획)
7. [기대 효과](#7-기대-효과)
8. [리스크 및 대응 방안](#8-리스크-및-대응-방안)
9. [성공 지표 (KPI)](#9-성공-지표-kpi)
10. [부록: 기술 참고 자료](#10-부록-기술-참고-자료)

---

## 1. 개혁 배경 및 목표

### 1.1 개혁 배경

**CIO 개혁 완료 후 발견된 근본적 문제:**

CIO 개혁을 통해 포트폴리오 전략 수립(What, How Much, Target)은 완벽해졌으나, **실제 매매 실행 시점(When)과 방식(How)**에서 다음 문제들이 지속 발생:

1. **타이밍 부재**: CIO가 "BTC 추가 매수" 지시 → Process2가 시장 상황 무시하고 즉시 실행 → 고점 매수 후 손실
2. **기계적 실행**: CIO가 "목표 수익률 달성" → Process2가 추세 강화 구간에서도 기계적 익절 → 추가 상승 기회 상실
3. **실행 주기 혼란**: Process2가 CIO에 종속되어 독립적 타이밍 판단 불가능
4. **피드백 부재**: CIO가 Process2의 전술적 판단 결과를 인지하지 못해 전략 개선 불가

### 1.2 개혁 목표

**"전략(CIO)과 전술(Process2)의 완벽한 역할 분담 및 협업 체계 구축"**

| 목표 | 구체적 내용 | 성공 기준 |
|------|-------------|-----------|
| **독립적 타이밍 최적화** | Process2가 CIO 지시의 방향성은 존중하되, 실행 시점과 방식을 독립적으로 판단 | 눌림목 매수 성공률 70% 이상 |
| **완벽한 실행 주기** | 정기 점검 + 이벤트 기반 하이브리드 모델로 적시성과 비용 효율 동시 달성 | AI 호출 비용 50% 절감 |
| **명확한 피드백 루프** | Process2의 전술적 판단을 CIO가 학습하여 전략 개선 | 전략-전술 일치도 90% 이상 |
| **구조 최적화** | 프롬프트 보존하면서 함수 구조 재설계로 유지보수성 향상 | 코드 중복도 0% |

---

## 2. 현재 시스템 분석

### 2.1 Process2 구조 매핑

#### **핵심 함수 구조**

```
[Entry Point]
analyze_portfolio_for_process2(trigger_coins)
├─ [Data Collection]
│  ├─ market_cache.get_market_data(mode='full')
│  ├─ collect_all_coins_data_parallel()
│  │  └─ ThreadPoolExecutor (병렬 처리)
│  │     ├─ get_technical_indicators(symbol)
│  │     ├─ get_optimal_trade_timing(symbol)  ← 🔑 타이밍 핵심
│  │     └─ calculate_kimchi_premium(symbol)
│  └─ prepare_holdings_data()
│
├─ [CIO Integration]
│  └─ db_manager.get_system_status('cio_latest_rationale')  ← CIO 전략 수신
│
├─ [Prompt Generation]
│  ├─ _get_system_prompt(provider, market_phase)
│  │  ├─ AGGRESSIVE_CHARTER (탐욕/상승장)
│  │  ├─ DEFENSIVE_PRINCIPLES (공포/하락장)
│  │  ├─ BALANCED_PRINCIPLES (중립/횡보장)
│  │  └─ COMMON_AI_RULES (463줄 - 핵심 규칙)
│  │
│  └─ create_analysis_prompt_for_decision(holdings, market_data, additional_info, cio_rationale)
│     ├─ CIO 브리핑 섹션 (최상단 주입)
│     ├─ 시장 요약
│     ├─ 온체인 데이터
│     └─ 개별 코인 분석 블록 × N
│        ├─ 포지션 & 목표 현황 (CIO 목표 포함)
│        ├─ 거래 히스토리 & 맥락
│        ├─ 지난 거래 사이클 분석 (자기반성)
│        ├─ 기술적 지표 분석
│        ├─ 실시간 미시구조 분석 (호가창, 거래량)
│        └─ 다중 시간대 분석
│
├─ [AI Execution]
│  ├─ _execute_openai_analysis() (GPT-4o)
│  │  └─ JSON Schema 강제 (strict mode)
│  └─ _execute_gemini_analysis() (Gemini 2.0)
│
└─ [DB Update]
   └─ update_portfolio_decisions(ai_decisions)
      └─ holding_status 테이블 업데이트
```

#### **실행 주기 현황**

| 실행 경로 | 트리거 조건 | 주기 | 문제점 |
|-----------|-------------|------|--------|
| **경로 1**: Process1 → Process2 Queue | 5분마다 긴급 트리거 수집 | 비정기 | CIO 실행 여부 판단 후 실행 (종속적) |
| **경로 2**: 스케줄 기반 | 정기 실행 | 09:00, 21:40, 04:00 (3회/일) | 빈도 부족 (8시간 공백) |
| **경로 3**: CIO 후속 실행 | CIO 재구성 완료 시 | CIO에 종속 | 독립적 타이밍 판단 불가 |

### 2.2 현재 프롬프트 구조 분석

#### **COMMON_AI_RULES 계층 구조** (config.py:373-835)

```
📜 AI 트레이더 헌법 (463줄)
│
├─ 🌍 계층 0: 시장 체제 인식 (122줄)
│  ├─ 시장 진단 프로토콜 (3가지 핵심 질문)
│  ├─ 시나리오 A: 메이저 불장 + 알트 휩쏘 ⭐ (가장 빈번)
│  ├─ 시나리오 B: 알트 시즌
│  └─ 시나리오 C: 하락장 전환
│
├─ 👑 계층 1: 시스템 생존과 무결성 (72줄)
│  ├─ 데드 스파이럴 방지
│  ├─ 시스템 트레일링 스탑 인지
│  ├─ 매매 판단 논리 검증 (수익/손실 상태별 제약)
│  └─ GPT 목표수익률/손절률/매매비중 설정 규칙
│
├─ 🔥 계층 2: 추세 추종 및 수익 극대화 (25줄)
│  ├─ 추세 강화 구간 최우선 지침
│  └─ 투자 연혁 존중 및 반박 규칙
│
└─ 🎯 계층 3: 전술적 실행 및 분석 (244줄)
   ├─ 온체인 데이터 해석
   ├─ 기술적 분석 마스터리
   ├─ 차트 이미지 분석
   ├─ 트레일링 스탑 규칙
   ├─ 부분 익절 비판적 사고 프레임워크 ⭐
   ├─ 확신도 정밀 시스템 (0-100)
   ├─ GPT매매비중 결정 시스템
   ├─ 강세장 홀딩 원칙 (3중 체크리스트)
   ├─ 거래 일관성 및 히스토리 분석
   ├─ 부분 익절 후 지능형 대응 규칙
   └─ 최종 의사결정 프로세스 (12단계)
```

#### **3가지 페르소나 시스템** (ai_strategy.py:266-378)

| 페르소나 | 시장 국면 | 핵심 철학 | 줄 수 |
|---------|----------|----------|-------|
| **AGGRESSIVE_CHARTER** | 탐욕/상승장 | "현금은 죄악, 추세 끝까지 추종" | 32줄 |
| **DEFENSIVE_PRINCIPLES** | 공포/하락장 | "현금은 왕, 생존이 승리" | 57줄 |
| **BALANCED_PRINCIPLES** | 중립/횡보장 | "관망이 최상의 포지션" | 24줄 |

### 2.3 현재 CIO-Process2 데이터 흐름

```
┌─────────────────────────────────────────────────────────┐
│                    CIO (Portfolio Rebalance)             │
│  - 목표 비중 설정 (GPT보유비중)                            │
│  - 목표 수익률/손절률 설정 (GPT목표수익률/손절률)           │
│  - 전략 근거 (cio_rationale)                             │
└─────────────────────┬───────────────────────────────────┘
                      │ DB 저장
                      ↓
         ┌────────────────────────┐
         │   holding_status 테이블  │ ← CIO 전략 저장소
         │   system_status 테이블   │
         └────────────┬─────────────┘
                      │ 읽기
                      ↓
┌─────────────────────────────────────────────────────────┐
│              Process2 (AI Decision Analysis)             │
│  1. CIO 전략 읽기 (DB에서 목표 비중/수익률 조회)            │
│  2. 실시간 시장 데이터 수집                                │
│  3. AI 매매 판단 (GPT매매비중, 매매판단 결정)              │
│  4. holding_status 업데이트                              │
└─────────────────────┬───────────────────────────────────┘
                      │ 매매 판단 저장
                      ↓
         ┌────────────────────────┐
         │   holding_status 업데이트 │
         │   - GPT매매비중           │
         │   - 판단확신              │
         │   - 거래사유              │
         └────────────┬─────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│              Trade Manager (Execution)                   │
│  - holding_status 읽기                                   │
│  - 실제 매매 실행                                         │
│  - trade_history 기록                                    │
└─────────────────────────────────────────────────────────┘
```

**❌ 현재 피드백 루프 부재:**
- Process2의 전술적 판단 (거래사유, thinking_process) → CIO가 직접 참조 안 함
- CIO는 trade_history를 간접적으로만 참조 (투자 연혁 생성 시)

---

## 3. 핵심 문제점 진단

### 3.1 문제점 1: 타이밍 최적화 부재

**현상:**
```
시나리오: CIO가 "BTC 비중 15% → 20%로 확대" 지시
         (목표 달성 위해 5% 추가 매수 필요)

현재 Process2 행동:
  ✅ CIO 지시 확인
  ✅ 실시간 데이터 수집 (RSI 82, 볼린저밴드 상단 120%)
  ❌ "추가매수" 판단 (GPT매매비중 50%)
  ❌ 고점에 매수 실행 → 2시간 후 -8% 손실

이상적인 Process2 행동:
  ✅ CIO 지시 확인
  ✅ 실시간 데이터 수집 (RSI 82, 과열 신호)
  ✅ "매매보류" 판단 (거래사유: "RSI 과열, 눌림목 대기")
  ⏳ 4시간 후 RSI 65로 조정 → 긴급 트리거 발생
  ✅ "추가매수" 실행 (눌림목에서 진입) → +12% 수익
```

**원인 분석:**

1. **프롬프트 구조적 문제:**
   - COMMON_AI_RULES의 "눌림목 매수 원칙"은 존재하지만 **우선순위가 낮음**
   - CIO 지시가 프롬프트 최상단에 주입 → AI가 "지시 이행"을 최우선으로 인식

2. **실시간 미시구조 데이터 활용 부족:**
   - `get_optimal_trade_timing()` 함수가 호가창 불균형, 거래량 스파이크를 수집하지만
   - 프롬프트에서 이 데이터의 **의사결정 가중치가 명시되지 않음**

3. **"대기" 판단의 심리적 장벽:**
   - AI가 "매매보류"를 선택하면 "아무것도 하지 않은 것"으로 인식
   - 실제로는 **"더 좋은 가격을 위해 전술적으로 대기"**하는 것인데 프롬프트에 이 개념 부재

### 3.2 문제점 2: 실행 주기의 비효율성

**현황:**

| 시간대 | 실행 여부 | 문제점 |
|--------|----------|--------|
| 00:00 - 04:00 | ❌ (04:00만 실행) | 3시간 공백 |
| 04:00 - 09:00 | ❌ (09:00만 실행) | 5시간 공백 |
| 09:00 - 21:40 | ❌ (중간 실행 없음) | **12시간 40분 공백** ⚠️ |
| 21:40 - 24:00 | ✅ Process1 5분 트리거 | 빈도 적절 |

**결과:**
- 09:00 ~ 21:40 사이 BTC가 +15% 급등 → Process2가 12시간 동안 대응 불가
- 익절 타이밍 놓침 → 추세 반전 후 수익 반납

### 3.3 문제점 3: CIO 피드백 루프 부재

**현재 상황:**

```python
# CIO가 전략 수립 시 참조하는 데이터
cio_prompt = f"""
  # 0. CIO의 이전 전략 회고
  {db_manager.get_latest_cio_report()}  ← CIO 자신의 이전 판단만 참조

  # 투자 연혁
  {db_manager.get_investment_narrative(symbol)}  ← trade_history 간접 참조

  # 현재 보유 현황
  {db_manager.get_holding_status()}
"""
```

**문제점:**
- Process2가 "CIO 지시를 왜 보류했는지" 근거를 CIO가 모름
- CIO가 "비현실적인 목표"를 반복 설정 (예: 과열 구간에서 공격적 비중 확대)

**예시:**
```
Day 1:
  CIO: "BTC 비중 20%로 확대"
  Process2: "RSI 85 과열, 매매보류" (거래사유에 기록)
  결과: CIO는 Process2의 판단을 모름

Day 2:
  CIO: "BTC 비중 여전히 15%, 다시 20%로 확대 지시" ← 학습 없음
  Process2: "여전히 RSI 83, 또 매매보류"

결과: 전략-전술 불일치 지속
```

### 3.4 문제점 4: 함수 구조의 복잡도

**현재 `analyze_portfolio_for_process2()` 함수 (77줄):**

```python
def analyze_portfolio_for_process2(trigger_coins):
    # 1. 데이터 수집 (30줄)
    market_data_full = market_cache.get_market_data(mode='full')
    all_coins_data = collect_all_coins_data_parallel(market_data_full)
    current_holdings = prepare_holdings_data()
    cio_rationale = db_manager.get_system_status('cio_latest_rationale')
    additional_info = { ... }  # 7개 데이터 소스 병합

    # 2. AI 실행 분기 (10줄)
    if AI_PROVIDER == "OPENAI":
        ai_decisions = _execute_openai_analysis(...)
    elif AI_PROVIDER == "GEMINI":
        ai_decisions = _execute_gemini_analysis(...)

    # 3. DB 업데이트 (3줄)
    update_portfolio_decisions(ai_decisions)
```

**문제점:**
- 단일 함수에 데이터 수집, AI 실행, DB 업데이트가 혼재
- 테스트 및 디버깅 어려움
- 새로운 기능 추가 시 함수 비대화

---

## 4. 개혁 핵심 원칙

### 4.1 역할 명확화: "전략가 vs 전술가"

```
┌─────────────────────────────────────────────────────────┐
│                     CIO (Chief Investment Officer)       │
│                         전략가 (Strategist)               │
├─────────────────────────────────────────────────────────┤
│  책임 범위:                                               │
│  - What: 어떤 코인을 보유할지                              │
│  - How Much: 목표 비중은 몇 %인지                         │
│  - Target: 목표 수익률/손절률은 어디인지                   │
│                                                           │
│  의사결정 주기: 하루 1회 (09:00)                          │
│  판단 근거: 거시적 시장 분석, 섹터 분석, 상관관계          │
└─────────────────────────────────────────────────────────┘
                           ↓ 전략 지시
┌─────────────────────────────────────────────────────────┐
│                 Process2 (Tactical Execution Specialist) │
│                        전술가 (Tactician)                 │
├─────────────────────────────────────────────────────────┤
│  책임 범위:                                               │
│  - When: CIO의 목표를 언제 실행할지                        │
│  - How: 어떤 방식으로 실행할지 (분할/즉시/대기)            │
│                                                           │
│  의사결정 주기:                                            │
│    - 정기: 동적 주기 (15~60분, 변동성 기반)                │
│    - 긴급: 이벤트 트리거 발생 시 즉시                      │
│                                                           │
│  판단 근거: 미시적 시장 구조, 호가창, 단기 모멘텀           │
└─────────────────────────────────────────────────────────┘
                           ↓ 실행 결과 피드백
┌─────────────────────────────────────────────────────────┐
│                     Trade History (작전 보고서)           │
│  - 전술적 판단 근거 (tactical_notes)                      │
│  - 실행 결과 (profit/loss)                               │
│  - CIO가 다음 전략 수립 시 참고                           │
└─────────────────────────────────────────────────────────┘
```

### 4.2 프롬프트 개선 원칙

**보존 (Preserve):**
- ✅ COMMON_AI_RULES 463줄 전체 유지
- ✅ 3가지 페르소나 시스템 유지
- ✅ 12단계 의사결정 프로세스 유지

**추가 (Append):**
- ➕ "전술 실행 프레임워크" (새 섹션 추가)
- ➕ "미시구조 우선 원칙" (기존 섹션 강화)
- ➕ "전략적 대기의 가치" (매매보류 재정의)

**재구조화 (Restructure):**
- 🔄 CIO 브리핑 섹션 → "전략 지시" 섹션으로 명칭 변경
- 🔄 실시간 미시구조 분석 → 의사결정 프로세스 2단계로 상향

### 4.3 실행 주기 설계 원칙

**하이브리드 모델: 정기 + 이벤트**

```python
# 1. 정기 실행 (Base Load)
#    - 목적: 보유 포지션의 정기 점검
#    - 주기: 동적 (15~60분, 변동성 기반)

def get_dynamic_interval():
    volatility_index = calculate_portfolio_volatility()['volatility_index']
    if volatility_index > 70: return 15  # 고변동성
    elif volatility_index > 50: return 30  # 중변동성
    else: return 60  # 저변동성

# 2. 이벤트 실행 (Peak Load)
#    - 목적: 시장 이상 징후 즉시 대응
#    - 트리거: Process1 긴급 신호 발생 시

def should_trigger_process2_emergency(coin_data):
    triggers = []
    # 조건 1: 거래량 급증
    if coin_data['volume_ratio'] > 3.0:
        triggers.append('volume_spike')
    # 조건 2: 가격 급변동
    if abs(coin_data['price_change_1h']) > coin_data['atr'] * 2.5:
        triggers.append('price_volatility')
    # 조건 3: 시스템 트리거 (손절 재확인 등)
    if coin_data.get('system_trigger'):
        triggers.append('system_alert')

    return len(triggers) >= 1  # 1개 이상 충족 시 즉시 호출
```

---

## 5. 개혁안 상세 설계

### 5.1 핵심 개선 1: 전술 실행 프레임워크 (Tactical Execution Framework)

#### **5.1.1 프롬프트 추가 내용**

**위치**: `COMMON_AI_RULES` 최상단 (계층 0 앞에 삽입)

```markdown
# ======================================================================
# ⚡ 전술 실행 프레임워크 (Tactical Execution Framework)
# ======================================================================
# 이 프레임워크는 모든 의사결정에 최우선으로 적용됩니다.

## 🎯 당신의 정체성: 전술 지휘관 (Tactical Commander)

당신은 CIO(Chief Investment Officer)의 **전략적 방향성을 최적의 타이밍에 실행하는 전술 지휘관**입니다.

### 역할 구분:
- **CIO의 역할 (What)**: "BTC 비중을 20%로 확대하라"
- **당신의 역할 (When & How)**: "언제, 어떻게 실행할지 결정"

### 핵심 원칙:
1. **CIO의 전략 목표는 절대적으로 존중**합니다.
   - 예: CIO가 "BTC 비중 확대" 지시 → 당신은 "BTC를 사지 않는다"는 판단을 내릴 수 없습니다.

2. **하지만 실행 시점과 방식은 당신이 결정**합니다.
   - 예: "지금 즉시 매수" vs "눌림목 대기 후 매수" vs "분할 매수"

3. **"전략적 대기"는 실패가 아닌, 고도의 전술적 판단**입니다.
   - "매매보류" 판단 시, 반드시 거래사유에 다음을 명시:
     - "CIO 전략 목표: [목표 요약]"
     - "전술적 판단: [대기 이유]"
     - "실행 조건: [어떤 신호 발생 시 실행할 것인지]"

---

## 📊 의사결정 프로세스 (CIO 지시 수신 시)

### Step 1: CIO 전략 목표 확인
```
프롬프트의 "A. 포지션 & 목표 현황" 섹션에서:
  - 목표 비중 (GPT보유비중)
  - 목표 수익률/손절률 (GPT목표수익률/손절률)
  - CIO 전략 브리핑 (cio_rationale)
을 명확히 인지합니다.
```

### Step 2: 실시간 미시구조 분석 ⭐ (최우선 순위)

**이 단계는 모든 다른 분석보다 우선합니다.**

프롬프트의 **"D. 실시간 미시구조 분석 (거래 타이밍)"** 섹션을 최우선으로 분석하십시오:

#### 2-1. 호가창 불균형 (Orderbook Imbalance)
```python
imbalance_ratio = (매수 호가 총량 - 매도 호가 총량) / 전체 호가 총량 * 100

해석:
  - imbalance_ratio > +10%: 🟢 매수 압력 우세 → 상승 가능성 높음
  - imbalance_ratio < -10%: 🔴 매도 압력 우세 → 하락 가능성 높음
  - -10% ~ +10%: ⚪ 균형 → 방향성 불명확
```

#### 2-2. 거래량 스파이크 (Volume Spike)
```python
volume_spike = 현재 거래량 / 평균 거래량

해석:
  - volume_spike > 3.0: 🔥 폭발적 관심 → 강력한 신호
  - volume_spike > 2.0: 📈 증가 추세 → 신호 유효성 높음
  - volume_spike < 1.5: 📊 평균 수준 → 신호 신뢰도 낮음
```

#### 2-3. 단기 모멘텀 (Short-term Momentum)
```python
1시간봉 RSI, 4시간봉 RSI 확인

해석:
  - 1H RSI > 70: ⚠️ 단기 과열 → 추격 매수 금지, 눌림목 대기
  - 1H RSI < 30: 🟢 단기 과매도 → 반등 매수 기회
  - 4H RSI와 1H RSI 방향 일치: ✅ 신호 신뢰도 상승
```

#### 2-4. 종합 타이밍 점수 계산
```python
timing_score = 0

# 호가창 점수
if imbalance_ratio > 10: timing_score += 30
elif imbalance_ratio < -10: timing_score -= 30

# 거래량 점수
if volume_spike > 3.0: timing_score += 30
elif volume_spike > 2.0: timing_score += 20

# 모멘텀 점수
if (매수 판단 시):
    if 1H_RSI < 70 and 1H_RSI > 30: timing_score += 20  # 건전한 구간
    if 1H_RSI < 30: timing_score += 40  # 과매도 반등 기회
    if 1H_RSI > 80: timing_score -= 40  # 과열, 대기 필요

if (매도 판단 시):
    if 1H_RSI > 70: timing_score += 20  # 과열, 익절 적기
    if 1H_RSI < 50: timing_score -= 20  # 아직 추세 살아있음

최종 판단:
  - timing_score >= 60: ✅ "최적 타이밍, 즉시 실행"
  - timing_score 30~59: ⚠️ "조건부 실행 (분할 매수/익절)"
  - timing_score < 30: ❌ "전략적 대기 (매매보류)"
```

### Step 3: 실행 계획 수립

#### 3-1. 매수 시나리오

**Case A: 상승 확신 (timing_score >= 60)**
```
판단: "추가매수" 또는 "신규매수"
GPT매매비중: CIO 목표 달성을 위한 필요 비중의 70~100%
거래사유: "호가 매수 우세(+15%), 거래량 3.5배 급증, 1H RSI 55 건전 → 즉시 실행"
```

**Case B: 상승 의심 (timing_score 30~59)**
```
판단: "추가매수" (단, 분할 진입)
GPT매매비중: CIO 목표의 30~50% (1차 진입)
거래사유: "CIO 전략 동의하나 호가창 균형. 분할 1차 진입, 눌림목 발생 시 2차 진입 예정"
```

**Case C: 타이밍 불리 (timing_score < 30)**
```
판단: "매매보류"
GPT매매비중: 0
거래사유: "CIO 전략 목표: BTC 비중 확대. 전술 판단: 1H RSI 82 과열, 눌림목 대기. 실행 조건: RSI 65 이하 + 거래량 증가"
```

#### 3-2. 매도 시나리오

**Case A: 손절 지시 (CIO 손절률 도달)**
```
원칙: 시스템 생존 최우선 → 시장 상황 무시하고 즉시 실행
판단: "부분손절" 또는 "전량매도"
GPT매매비중: CIO 지시대로 100% (즉시 청산)
거래사유: "CIO 손절률 도달, 시스템 보호 차원 즉시 실행"
```

**Case B: 익절 지시 (CIO 목표 수익률 도달) - 추세 지속 중**
```
상황: 목표 수익률 달성했으나, 미시구조가 폭발적 상승 암시
  - volume_spike > 5.0 (거래량 5배 급증)
  - imbalance_ratio > +20% (강력한 매수 압력)
  - 일봉 MACD 골든크로스 직후

판단: "부분익절" (분할 익절)
GPT매매비중: CIO 지시의 50% (절반만 익절)
거래사유: "CIO 목표 도달하나, 거래량 5배 급증 + 호가 매수 우세 → 추가 상승 가능성. 50% 우선 익절, 나머지는 시스템 트레일링 스탑에 위임"
```

**Case C: 익절 지시 - 추세 약화 징후**
```
상황: 목표 수익률 달성, 미시구조도 약화
  - volume_spike < 1.0 (거래량 감소)
  - 1H RSI 하락 다이버전스

판단: "전량익절" 또는 "부분익절(70% 이상)"
GPT매매비중: CIO 지시의 100% (즉시 익절)
거래사유: "CIO 목표 도달 + 거래량 고갈 + RSI 다이버전스 → 추세 종료 신호 명확, 전량 익절"
```

---

## 🔥 핵심 원칙 요약

### 원칙 1: CIO 전략 목표는 절대 존중
- "BTC 비중 확대" 지시 → "BTC를 사지 않는다" 판단은 불가능
- 단, "지금 당장 사지 않는다"는 가능 (전술적 대기)

### 원칙 2: 미시구조 분석이 타이밍 판단의 핵심
- timing_score < 30 → "매매보류"는 실패가 아닌 전술적 우수성
- 더 좋은 가격에 CIO 목표를 달성하기 위한 전문적 판단

### 원칙 3: 손절은 즉시, 익절은 전술적 판단
- 손절: 시스템 생존 >> 타이밍 → 즉시 실행
- 익절: 수익 극대화 고려 → 미시구조 분석 후 분할 익절 가능

### 원칙 4: "매매보류" 판단 시 실행 조건 명시 필수
```
❌ 나쁜 예: "매매보류 - 시장 불확실성으로 대기"
✅ 좋은 예: "매매보류 - CIO 목표: BTC 비중 20%. 전술: 1H RSI 82 과열로 눌림목 대기. 실행 조건: RSI 65 이하 + 20일선 터치 시 GPT매매비중 50% 1차 매수 예정"
```

이렇게 명시하면:
- CIO는 "전술 지휘관이 내 전략을 이해하고 최적 타이밍을 찾고 있구나"라고 인지
- 다음 트리거 발생 시 AI가 일관성 있게 "실행 조건 충족" 판단 가능
```

#### **5.1.2 기존 프롬프트 수정 사항**

**수정 1: CIO 브리핑 섹션 → 전략 지시 섹션으로 명칭 변경**

```python
# create_analysis_prompt_for_decision() 함수 수정
# BEFORE:
cio_briefing_section = f"""# 0. CIO의 최신 전략 브리핑 (Top-Down Context)
* **상위 분석 요약**: {cio_rationale}
* **당신의 임무**: 이 거시적 전략을 바탕으로..."""

# AFTER:
cio_strategy_directive = f"""# 0. CIO 전략 지시 (Strategic Directive)
* **전략 목표**: {cio_rationale}
* **당신의 임무 (전술 지휘관)**:
  - CIO의 전략 목표는 절대 존중합니다.
  - 단, 실행 시점(When)과 방식(How)은 실시간 미시구조 분석을 기반으로 독립적으로 결정하십시오.
  - "매매보류"는 CIO 전략을 거부하는 것이 아니라, 더 좋은 가격에 목표를 달성하기 위한 전술적 대기입니다."""
```

**수정 2: 의사결정 프로세스 순서 재조정**

```markdown
# BEFORE (config.py:818-835)
0. 시장 체제 식별
1. 온체인 데이터 분석
2. 목표-현재 비중 괴리도 분석
3. 120일선 위치 및 추세 확인
4. 거래 히스토리 및 맥락 분석
5. 기술적 지표 종합 분석
6. 차트 이미지 분석
7. 시장 심리 확인
8. 김치프리미엄 고려
9. 현재 포지션 비중 고려
10. 시나리오 플래닝
11. 강건한 선택 및 최종 결정
12. 최종 결정 검증

# AFTER
0. CIO 전략 목표 확인 ⭐ (신규)
1. 실시간 미시구조 분석 ⭐ (우선순위 상향)
2. 시장 체제 식별
3. 온체인 데이터 분석
4. 120일선 위치 및 추세 확인
5. 거래 히스토리 및 맥락 분석
6. 기술적 지표 종합 분석
7. 차트 이미지 분석
8. 목표-현재 비중 괴리도 분석
9. 타이밍 점수 계산 ⭐ (신규)
10. 실행 계획 수립 (매수/매도/대기) ⭐ (신규)
11. 시나리오 플래닝
12. 강건한 선택 및 최종 결정
13. 최종 결정 검증
```

### 5.2 핵심 개선 2: 동적 실행 주기 시스템

#### **5.2.1 구현 위치: main.py**

**신규 함수 추가:**

```python
def get_dynamic_process2_interval() -> int:
    """
    변동성 기반 동적 주기 계산

    Returns:
        실행 주기 (분 단위)
    """
    try:
        volatility_data = calculate_portfolio_volatility()
        volatility_index = volatility_data.get('volatility_index', 50.0)

        # 변동성 지수에 따른 주기 결정
        if volatility_index > 70:
            interval = 15
            logger.info(f"📊 고변동성 감지 (VIX: {volatility_index:.1f}) → Process2 주기: 15분")
        elif volatility_index > 50:
            interval = 30
            logger.info(f"📊 중변동성 (VIX: {volatility_index:.1f}) → Process2 주기: 30분")
        else:
            interval = 60
            logger.info(f"📊 저변동성 (VIX: {volatility_index:.1f}) → Process2 주기: 60분")

        return interval

    except Exception as e:
        logger.error(f"❌ 동적 주기 계산 실패: {e}. 기본값 30분 사용")
        return 30

def schedule_dynamic_process2():
    """
    동적 주기로 Process2 스케줄링
    기존 스케줄을 취소하고 새로운 주기로 재설정
    """
    # 기존 process2 정기 실행 스케줄 취소
    schedule.clear('process2_regular')

    # 새로운 주기 계산
    interval = get_dynamic_process2_interval()

    # 새 스케줄 등록
    schedule.every(interval).minutes.do(
        enqueue_process2,
        trigger_coins=[{'type': 'regular_check', 'symbol': 'SCHEDULED', 'reason': '정기 전술 점검'}]
    ).tag('process2_regular')

    logger.info(f"✅ Process2 동적 스케줄 설정 완료: {interval}분마다 정기 실행")
```

**main() 함수 수정:**

```python
def main():
    """메인 실행 함수"""
    global worker_thread
    try:
        # ... 기존 초기화 코드 ...

        # ========================================
        # 스케줄링 설정 (개혁안 적용)
        # ========================================

        # 1. Process1 (5분 주기 - 긴급 감지)
        schedule.every(PROCESS1_INTERVAL).minutes.do(process1)

        # 2. Process2 정기 실행 (동적 주기)
        schedule_dynamic_process2()  # 초기 스케줄 설정

        # 3. 동적 주기 재계산 (1시간마다 변동성 체크)
        schedule.every(1).hours.do(schedule_dynamic_process2)

        # 4. 기존 정기 실행 유지 (중요 시간대)
        schedule.every().day.at("09:10").do(enqueue_process2, trigger_coins=[{
            'type': 'daily_open', 'symbol': 'SCHEDULED', 'reason': '업비트 일일 갱신 후 전술 점검'
        }])
        schedule.every().day.at("21:40").do(enqueue_process2, trigger_coins=[{
            'type': 'us_market_close', 'symbol': 'SCHEDULED', 'reason': '미국 장 마감 후 전술 점검'
        }])

        # 5. CIO 정기 재평가 (하루 1회)
        schedule.every().day.at("09:00").do(lambda: enqueue_process2([{
            'type': 'daily_rebalance', 'symbol': 'SCHEDULED', 'reason': '정기 포트폴리오 재평가'
        }]))

        # 6. 기타 스케줄
        schedule.every(1).hours.do(update_trading_universe)
        schedule.every().day.at("09:05").do(daily_report)
        schedule.every().day.at("20:00").do(run_daily_ai_briefing)

        logger.info(f"⏰ 스케줄 설정 완료")
        logger.info(f"  - Process1: {PROCESS1_INTERVAL}분마다 (긴급 감지)")
        logger.info(f"  - Process2 정기: 동적 주기 (15~60분, 변동성 기반)")
        logger.info(f"  - Process2 긴급: 이벤트 트리거 발생 시 즉시")
        logger.info(f"  - CIO: 매일 09:00 (전략 수립)")

        # ... 기존 실행 코드 ...
```

#### **5.2.2 긴급 트리거 강화 (process1 내부)**

**위치: main.py의 process1() 함수 내부**

```python
def should_trigger_process2_emergency(coin_symbol: str, analysis_data: Dict) -> Optional[Dict]:
    """
    Process2 긴급 호출 여부 판단

    Args:
        coin_symbol: 코인 심볼
        analysis_data: quick_market_analysis 또는 check_profit_loss_triggers 결과

    Returns:
        트리거 정보 (없으면 None)
    """
    triggers = []

    # ========================================
    # 조건 1: 거래량 폭발 (3배 이상)
    # ========================================
    volume_ratio = analysis_data.get('volume_ratio', 1.0)
    if volume_ratio > 3.0:
        triggers.append({
            'type': 'volume_spike',
            'severity': 'high',
            'reason': f'거래량 {volume_ratio:.1f}배 급증 감지'
        })

    # ========================================
    # 조건 2: 급격한 가격 변동 (ATR 2.5배 초과)
    # ========================================
    price_change_1h = analysis_data.get('price_change_1h', 0)
    atr = analysis_data.get('atr', 0)
    if atr > 0 and abs(price_change_1h) > (atr * 2.5):
        direction = "급등" if price_change_1h > 0 else "급락"
        triggers.append({
            'type': 'price_volatility',
            'severity': 'high',
            'reason': f'1시간 {direction} {abs(price_change_1h):.2f}% (ATR {atr:.2f}%의 2.5배 초과)'
        })

    # ========================================
    # 조건 3: 시스템 트리거 (손절 재확인, 수익권 재분석)
    # ========================================
    if analysis_data.get('system_trigger'):
        trigger_type = analysis_data.get('trigger_type', 'unknown')
        triggers.append({
            'type': 'system_alert',
            'severity': 'critical',
            'reason': f'시스템 트리거 발동: {trigger_type}'
        })

    # ========================================
    # 조건 4: 호가창 극단적 불균형 (±20% 초과)
    # ========================================
    orderbook_imbalance = analysis_data.get('orderbook_imbalance', 0)
    if abs(orderbook_imbalance) > 20:
        direction = "매수" if orderbook_imbalance > 0 else "매도"
        triggers.append({
            'type': 'orderbook_imbalance',
            'severity': 'medium',
            'reason': f'호가창 {direction} 압력 극단 ({orderbook_imbalance:+.1f}%)'
        })

    # ========================================
    # 최종 판단: 1개 이상 트리거 발생 시 긴급 호출
    # ========================================
    if len(triggers) >= 1:
        # 가장 심각한 트리거 선택
        severity_order = {'critical': 3, 'high': 2, 'medium': 1}
        primary_trigger = max(triggers, key=lambda t: severity_order.get(t['severity'], 0))

        return {
            'symbol': coin_symbol,
            'type': 'emergency_trigger',
            'urgency': 'immediate',
            'primary_reason': primary_trigger['reason'],
            'all_triggers': triggers,
            'timestamp': datetime.now().isoformat()
        }

    return None

# process1() 함수 내부에 통합:
def process1():
    """Process1 - 5분마다 긴급 상황 감지"""
    # ... 기존 코드 ...

    # 각 코인 분석 후
    for coin in active_coins:
        analysis_data = quick_market_analysis(coin.symbol)

        # 긴급 트리거 체크
        emergency_trigger = should_trigger_process2_emergency(coin.symbol, analysis_data)
        if emergency_trigger:
            logger.warning(f"🚨 긴급 트리거 발생: {coin.symbol} - {emergency_trigger['primary_reason']}")
            all_ai_triggers.append(emergency_trigger)

    # 트리거가 있으면 Process2 즉시 호출
    if all_ai_triggers:
        unique_triggers = {t['symbol']: t for t in all_ai_triggers}.values()
        enqueue_process2(list(unique_triggers))
```

### 5.3 핵심 개선 3: CIO 피드백 루프

#### **5.3.1 DB 스키마 확장 (선택 사항)**

**trade_history 테이블에 tactical_notes 컬럼 추가:**

```python
# supabase_adapter.py에 추가

def add_tactical_notes_column():
    """
    trade_history 테이블에 tactical_notes 컬럼 추가
    (이미 존재하면 스킵)
    """
    try:
        conn = get_connection()
        c = conn.cursor()

        # 컬럼 존재 여부 확인
        c.execute("PRAGMA table_info(trade_history)")
        columns = [col[1] for col in c.fetchall()]

        if 'tactical_notes' not in columns:
            c.execute("""
                ALTER TABLE trade_history
                ADD COLUMN tactical_notes TEXT
            """)
            conn.commit()
            logger.info("✅ trade_history 테이블에 tactical_notes 컬럼 추가 완료")
        else:
            logger.info("ℹ️ tactical_notes 컬럼이 이미 존재합니다.")

        conn.close()
    except Exception as e:
        logger.error(f"❌ tactical_notes 컬럼 추가 실패: {e}")

# 시스템 초기화 시 실행
# main.py의 initialize_system() 함수에 추가:
def initialize_system():
    # ... 기존 초기화 코드 ...

    # tactical_notes 컬럼 확인 및 추가
    from supabase_adapter import add_tactical_notes_column
    add_tactical_notes_column()
```

#### **5.3.2 거래 기록 시 전술적 노트 저장**

**위치: trade_manager.py (추정 - 실제 파일 확인 필요)**

```python
def log_trade(trade_info: Dict):
    """
    거래 내역을 DB에 기록

    Args:
        trade_info: 거래 정보 딕셔너리
    """
    try:
        # 기존 코드...

        # [개혁안] tactical_notes 추가
        tactical_notes = generate_tactical_notes(trade_info)

        conn = db_manager.get_connection()
        c = conn.cursor()
        c.execute("""
            INSERT INTO trade_history (
                코인이름, 거래유형, 거래수량, 거래가격, 거래금액,
                거래시간, 거래사유, tactical_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            trade_info['symbol'],
            trade_info['trade_type'],
            trade_info['amount'],
            trade_info['price'],
            trade_info['total'],
            datetime.now().isoformat(),
            trade_info.get('reason', 'N/A'),
            tactical_notes  # 전술적 노트
        ))
        conn.commit()
        conn.close()

    except Exception as e:
        logger.error(f"❌ 거래 기록 저장 실패: {e}")

def generate_tactical_notes(trade_info: Dict) -> str:
    """
    전술적 판단 근거를 요약하여 노트 생성

    Returns:
        tactical_notes 문자열
    """
    symbol = trade_info['symbol']
    trade_type = trade_info['trade_type']

    # DB에서 최신 AI 판단 정보 조회
    holding = db_manager.get_holding_status(symbol)
    if not holding:
        return "N/A"

    # CIO 목표 vs Process2 판단
    cio_target_weight = holding.get('GPT보유비중', 0)
    current_weight = holding.get('보유비중', 0)
    gpt_trade_weight = holding.get('GPT매매비중', 0)
    decision_confidence = holding.get('판단확신', 0)
    trade_reason = holding.get('거래사유', '')

    # 전술 노트 생성
    tactical_note = f"""[전술 판단 기록]
CIO 전략 목표: 목표 비중 {cio_target_weight:.1f}%
현재 비중: {current_weight:.1f}% → 목표 괴리도: {cio_target_weight - current_weight:+.1f}%p
Process2 판단: {trade_type} (실행 비중: {gpt_trade_weight}%, 확신도: {decision_confidence})
전술적 근거: {trade_reason}
"""

    return tactical_note
```

#### **5.3.3 CIO 프롬프트에 전술 피드백 주입**

**위치: ai_strategy.py의 CIO 프롬프트 생성 함수 (추정 - 확인 필요)**

```python
def create_cio_prompt_with_tactical_feedback():
    """
    CIO 프롬프트에 Process2의 전술적 판단 이력 주입
    """
    # ... 기존 CIO 프롬프트 생성 코드 ...

    # [개혁안] 전술 피드백 섹션 추가
    tactical_feedback = get_recent_tactical_feedback(days=7)

    cio_prompt += f"""

# 0-2. Process2 전술 지휘관 보고서 (지난 7일)

당신(CIO)이 수립한 전략이 실제 시장에서 어떻게 실행되었는지 보고받습니다.
이 정보를 바탕으로, 다음 전략 수립 시 더 현실적인 목표를 설정하십시오.

{tactical_feedback}

---
"""

    return cio_prompt

def get_recent_tactical_feedback(days: int = 7) -> str:
    """
    최근 N일간의 전술적 판단 이력 요약

    Returns:
        마크다운 형식의 피드백 문자열
    """
    try:
        conn = db_manager.get_connection()
        c = conn.cursor()

        # 최근 N일간 거래 중 tactical_notes가 있는 것만 조회
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        c.execute("""
            SELECT 코인이름, 거래유형, 거래시간, tactical_notes
            FROM trade_history
            WHERE 거래시간 >= ?
              AND tactical_notes IS NOT NULL
              AND tactical_notes != 'N/A'
            ORDER BY 거래시간 DESC
            LIMIT 10
        """, (cutoff_date,))

        records = c.fetchall()
        conn.close()

        if not records:
            return "- 지난 7일간 전술적 판단 기록 없음 (신규 시스템 또는 거래 없음)"

        # 마크다운 테이블 생성
        feedback_md = "## 최근 전술 실행 기록 (최대 10건)\n\n"
        feedback_md += "| 일시 | 코인 | 판단 | 전술적 근거 요약 |\n"
        feedback_md += "|------|------|------|------------------|\n"

        for record in records:
            symbol, trade_type, timestamp, tactical_note = record

            # tactical_note에서 핵심만 추출 (거래사유 부분)
            reason_match = re.search(r'전술적 근거: (.+)', tactical_note)
            reason_summary = reason_match.group(1)[:50] + "..." if reason_match else "N/A"

            # 날짜 포맷 (시간 제거)
            date_str = timestamp[:10]

            feedback_md += f"| {date_str} | {symbol} | {trade_type} | {reason_summary} |\n"

        # 통계 요약 추가
        feedback_md += "\n### 주요 패턴 분석\n\n"

        # "매매보류" 비율 계산
        total_decisions = len(records)
        hold_count = sum(1 for r in records if '매매보류' in r[3])
        hold_rate = (hold_count / total_decisions * 100) if total_decisions > 0 else 0

        feedback_md += f"- **전술적 대기 비율**: {hold_rate:.1f}% ({hold_count}/{total_decisions}건)\n"
        feedback_md += f"  → Process2가 당신의 전략을 {hold_count}번 보류했습니다. "

        if hold_rate > 50:
            feedback_md += "**⚠️ 주의**: 과도한 대기는 당신의 전략 목표가 시장 상황과 괴리되었음을 의미할 수 있습니다. 목표 비중이나 진입 조건을 재검토하십시오.\n"
        elif hold_rate > 30:
            feedback_md += "**적정**: Process2가 타이밍을 신중히 선택하고 있습니다.\n"
        else:
            feedback_md += "**양호**: 대부분의 전략이 즉시 실행되고 있습니다.\n"

        return feedback_md

    except Exception as e:
        logger.error(f"❌ 전술 피드백 생성 실패: {e}")
        return "- 피드백 데이터 조회 실패"
```

### 5.4 핵심 개선 4: 함수 구조 재설계

#### **5.4.1 현재 문제점**

```python
# 현재 analyze_portfolio_for_process2() (77줄)
def analyze_portfolio_for_process2(trigger_coins):
    # 데이터 수집 (30줄) ← 복잡한 병합 로직
    market_data_full = market_cache.get_market_data(mode='full')
    all_coins_data = collect_all_coins_data_parallel(market_data_full)
    additional_info = { ... 7개 데이터 소스 ... }

    # AI 실행 (10줄) ← 단순 분기
    if AI_PROVIDER == "OPENAI": ...
    elif AI_PROVIDER == "GEMINI": ...

    # DB 업데이트 (3줄)
    update_portfolio_decisions(ai_decisions)
```

**문제점:**
- 단일 책임 원칙(SRP) 위반
- 데이터 수집 로직 테스트 어려움
- 새 데이터 소스 추가 시 함수 비대화

#### **5.4.2 재설계안: 계층적 분리**

```python
# ========================================
# Layer 1: 데이터 수집 전담 (Data Collection Layer)
# ========================================

class Process2DataCollector:
    """Process2 데이터 수집 전담 클래스"""

    def __init__(self):
        self.market_cache = market_cache
        self.db_manager = db_manager

    def collect_all_data(self, trigger_coins: List[Dict] = None) -> Dict[str, Any]:
        """
        Process2에 필요한 모든 데이터를 수집하여 통합

        Returns:
            {
                'market_data': {...},
                'holdings': {...},
                'cio_strategy': {...},
                'additional_info': {...}
            }
        """
        logger.info("📊 Process2 데이터 수집 시작")

        return {
            'market_data': self._collect_market_data(),
            'holdings': self._collect_holdings_data(),
            'cio_strategy': self._collect_cio_strategy(),
            'additional_info': self._collect_additional_info(trigger_coins)
        }

    def _collect_market_data(self) -> Dict:
        """시장 데이터 수집 (코인별 기술적 지표, 차트 등)"""
        market_data_full = self.market_cache.get_market_data(mode='full')
        all_coins_data = collect_all_coins_data_parallel(market_data_full)
        return all_coins_data

    def _collect_holdings_data(self) -> Dict:
        """현재 보유 현황 데이터"""
        return prepare_holdings_data()

    def _collect_cio_strategy(self) -> Dict:
        """CIO 최신 전략 지시 사항"""
        cio_rationale = self.db_manager.get_system_status('cio_latest_rationale')
        return {
            'rationale': cio_rationale,
            'timestamp': datetime.now().isoformat()
        }

    def _collect_additional_info(self, trigger_coins: List[Dict]) -> Dict:
        """추가 시장 정보 (뉴스, 온체인 등)"""
        market_data_full = self.market_cache.get_market_data(mode='full')

        return {
            'market_trend': market_data_full.get('market_trend', {}).get('data', {}),
            'news': market_data_full.get('global_news', {}).get('data', []),
            'fear_greed_index': market_data_full.get('fear_greed_index', {}).get('data', {}),
            'btc_dominance': market_data_full.get('btc_dominance', {}).get('data', 50.0),
            'exchange_rate': market_data_full.get('exchange_rate', {}).get('data', 1350.0),
            'onchain_data': market_data_full.get('onchain_data', {}).get('data', {}),
            'correlation_data': market_data_full.get('correlation_matrix', {}).get('data', {}),
            'trigger_coins': trigger_coins or [],
            'timestamp': datetime.now().isoformat()
        }

# ========================================
# Layer 2: AI 실행 전담 (AI Execution Layer)
# ========================================

class Process2AIExecutor:
    """Process2 AI 실행 전담 클래스"""

    def __init__(self, provider: str):
        self.provider = provider
        if provider == "OPENAI":
            self.client = openai_client
        elif provider == "GEMINI":
            self.client = gemini_main_client

    def execute(self, data: Dict) -> Dict[str, Any]:
        """
        AI 분석 실행

        Args:
            data: Process2DataCollector가 수집한 전체 데이터

        Returns:
            AI 매매 판단 결과
        """
        logger.info(f"🤖 [{self.provider}] AI 분석 실행")

        if self.provider == "OPENAI":
            return self._execute_openai(data)
        elif self.provider == "GEMINI":
            return self._execute_gemini(data)
        else:
            raise ValueError(f"지원하지 않는 AI 제공자: {self.provider}")

    def _execute_openai(self, data: Dict) -> Dict:
        """OpenAI 실행 (기존 _execute_openai_analysis 함수 활용)"""
        return _execute_openai_analysis(
            current_holdings=data['holdings'],
            market_data=data['market_data'],
            additional_info=data['additional_info'],
            cio_rationale=data['cio_strategy']['rationale']
        )

    def _execute_gemini(self, data: Dict) -> Dict:
        """Gemini 실행 (기존 _execute_gemini_analysis 함수 활용)"""
        return _execute_gemini_analysis(
            current_holdings=data['holdings'],
            market_data=data['market_data'],
            additional_info=data['additional_info'],
            cio_rationale=data['cio_strategy']['rationale']
        )

# ========================================
# Layer 3: DB 업데이트 전담 (Persistence Layer)
# ========================================

class Process2ResultHandler:
    """Process2 결과 처리 전담 클래스"""

    def __init__(self):
        self.db_manager = db_manager

    def save_decisions(self, ai_decisions: Dict) -> None:
        """
        AI 판단 결과를 DB에 저장

        Args:
            ai_decisions: AI가 생성한 매매 판단
        """
        logger.info("💾 AI 판단 결과 DB 저장 시작")

        # 기존 update_portfolio_decisions 함수 활용
        update_portfolio_decisions(ai_decisions)

        # 추가: 전술적 노트 생성 준비 (실제 거래 시 사용)
        self._prepare_tactical_notes(ai_decisions)

        logger.info("✅ AI 판단 결과 저장 완료")

    def _prepare_tactical_notes(self, ai_decisions: Dict) -> None:
        """
        향후 거래 시 사용할 전술적 노트를 미리 준비
        (holding_status에 임시 저장)
        """
        decisions = ai_decisions.get('decisions', [])

        for decision in decisions:
            symbol = decision.get('coin')
            trade_decision = decision.get('매매판단')
            confidence = decision.get('판단확신', 0)
            gpt_weight = decision.get('GPT매매비중', 0)
            reason = decision.get('거래사유', '')

            # holding_status에 저장 (update_portfolio_decisions가 이미 처리)
            # 여기서는 로깅만 추가
            logger.debug(f"  - {symbol}: {trade_decision} (확신도: {confidence}, 비중: {gpt_weight}%)")

# ========================================
# Layer 4: 오케스트레이터 (Orchestrator)
# ========================================

def analyze_portfolio_for_process2(trigger_coins: List[Dict] = None) -> Dict[str, Any]:
    """
    Process2 메인 엔트리 포인트 (재설계 버전)

    책임: 3개 레이어를 순차적으로 호출하여 전체 프로세스 오케스트레이션

    Args:
        trigger_coins: 긴급 처리가 필요한 코인 리스트

    Returns:
        AI의 매매 판단 결과
    """
    try:
        logger.info(f"🚀 [{AI_PROVIDER}] Process2 AI 분석 시작")

        # Layer 1: 데이터 수집
        data_collector = Process2DataCollector()
        data = data_collector.collect_all_data(trigger_coins)

        # 데이터 검증
        if not data['market_data']:
            logger.error("❌ 시장 데이터 수집 실패")
            return {}

        # Layer 2: AI 실행
        ai_executor = Process2AIExecutor(provider=AI_PROVIDER)
        ai_decisions = ai_executor.execute(data)

        if not ai_decisions:
            logger.error("❌ AI 분석 실패")
            return {}

        # Layer 3: 결과 저장
        result_handler = Process2ResultHandler()
        result_handler.save_decisions(ai_decisions)

        logger.info(f"✅ [{AI_PROVIDER}] Process2 완료")
        return ai_decisions

    except Exception as e:
        logger.error(f"❌ Process2 분석 중 오류: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return {}
```

#### **5.4.3 재설계의 장점**

| 항목 | BEFORE | AFTER |
|------|--------|-------|
| **함수 길이** | 77줄 (단일 함수) | 각 클래스 20~30줄 |
| **테스트 용이성** | 어려움 (Mock 복잡) | 쉬움 (각 Layer 독립 테스트) |
| **확장성** | 낮음 (함수 비대화) | 높음 (새 Layer 추가 가능) |
| **디버깅** | 어려움 (단일 진입점) | 쉬움 (Layer별 로깅) |
| **코드 재사용** | 낮음 | 높음 (Layer 조합 가능) |

---

## 6. 구현 계획

### 6.1 Phase 1: 프롬프트 개선 (우선순위: 최고 ⭐⭐⭐)

**목표**: 타이밍 최적화 기능 즉시 활성화

| 단계 | 작업 내용 | 예상 소요 | 파일 |
|------|-----------|-----------|------|
| 1.1 | COMMON_AI_RULES에 "전술 실행 프레임워크" 추가 | 1시간 | config.py |
| 1.2 | create_analysis_prompt_for_decision() 수정 (CIO 브리핑 → 전략 지시) | 30분 | ai_strategy.py |
| 1.3 | 의사결정 프로세스 순서 재조정 (config.py) | 30분 | config.py |
| 1.4 | 프롬프트 검증 테스트 (실제 AI 호출) | 1시간 | - |

**검증 방법:**
```bash
# 테스트 실행
python main.py  # IS_DEBUG_MODE_ACTIVE = True, RUN_PROCESS_2_TEST = True

# 확인 사항:
# 1. AI가 "매매보류" 판단 시 거래사유에 "전술적 대기" + "실행 조건" 명시 여부
# 2. timing_score 계산 로직이 thinking_process에 나타나는지
# 3. CIO 전략 목표와 Process2 판단이 명확히 구분되는지
```

### 6.2 Phase 2: 동적 실행 주기 구현 (우선순위: 높음 ⭐⭐)

**목표**: 비용 효율적인 정기 점검 + 긴급 대응 체계

| 단계 | 작업 내용 | 예상 소요 | 파일 |
|------|-----------|-----------|------|
| 2.1 | get_dynamic_process2_interval() 함수 추가 | 30분 | main.py |
| 2.2 | schedule_dynamic_process2() 함수 추가 | 30분 | main.py |
| 2.3 | main() 함수 스케줄 섹션 수정 | 30분 | main.py |
| 2.4 | should_trigger_process2_emergency() 함수 추가 | 1시간 | main.py |
| 2.5 | process1() 함수에 긴급 트리거 로직 통합 | 1시간 | main.py |
| 2.6 | 통합 테스트 (24시간 모니터링) | 2시간 | - |

**검증 방법:**
```bash
# 1. 동적 주기 확인
python main.py  # 운영 모드 실행
# 로그 확인: "📊 고변동성 감지 (VIX: 75.3) → Process2 주기: 15분"

# 2. 긴급 트리거 확인
# Process1 실행 시 거래량 급증 코인 발견
# 로그 확인: "🚨 긴급 트리거 발생: BTC - 거래량 3.8배 급증 감지"
```

### 6.3 Phase 3: CIO 피드백 루프 구현 (우선순위: 중간 ⭐)

**목표**: 전략-전술 학습 사이클 완성

| 단계 | 작업 내용 | 예상 소요 | 파일 |
|------|-----------|-----------|------|
| 3.1 | add_tactical_notes_column() 함수 추가 | 30분 | supabase_adapter.py |
| 3.2 | generate_tactical_notes() 함수 추가 | 1시간 | trade_manager.py |
| 3.3 | log_trade() 함수 수정 (tactical_notes 저장) | 30분 | trade_manager.py |
| 3.4 | get_recent_tactical_feedback() 함수 추가 | 1시간 | ai_strategy.py |
| 3.5 | CIO 프롬프트에 피드백 섹션 추가 | 30분 | ai_strategy.py (CIO 프롬프트 생성 함수) |
| 3.6 | CIO 실행 후 피드백 확인 테스트 | 1시간 | - |

**검증 방법:**
```bash
# 1. DB 컬럼 확인
sqlite3 gptbitcoin4.db
> PRAGMA table_info(trade_history);
# tactical_notes 컬럼 존재 확인

# 2. 거래 후 tactical_notes 저장 확인
# 매매 실행 후
> SELECT 코인이름, 거래유형, tactical_notes FROM trade_history ORDER BY 거래시간 DESC LIMIT 1;
# tactical_notes에 "[전술 판단 기록] CIO 전략 목표: ..." 형식 데이터 확인

# 3. CIO 실행 시 피드백 섹션 확인
python main.py  # RUN_PORTFOLIO_REBALANCE_TEST = True
# 로그에서 CIO 프롬프트 확인 → "Process2 전술 지휘관 보고서" 섹션 존재 여부
```

### 6.4 Phase 4: 함수 구조 재설계 (우선순위: 낮음, 선택 사항)

**목표**: 유지보수성 향상 (기능 개선 없음)

| 단계 | 작업 내용 | 예상 소요 | 파일 |
|------|-----------|-----------|------|
| 4.1 | Process2DataCollector 클래스 구현 | 2시간 | ai_strategy.py |
| 4.2 | Process2AIExecutor 클래스 구현 | 1시간 | ai_strategy.py |
| 4.3 | Process2ResultHandler 클래스 구현 | 1시간 | ai_strategy.py |
| 4.4 | analyze_portfolio_for_process2() 리팩토링 | 1시간 | ai_strategy.py |
| 4.5 | 기존 함수 제거 (_execute_openai_analysis 등) | 30분 | ai_strategy.py |
| 4.6 | 회귀 테스트 (전체 기능 재검증) | 3시간 | - |

**⚠️ 주의사항:**
- Phase 4는 **기능 개선이 아닌 리팩토링**이므로 마지막에 진행
- Phase 1~3가 안정화된 후 시도
- 사용자 동의 필요

---

## 7. 기대 효과

### 7.1 정량적 효과

| 지표 | 현재 | 개혁 후 | 개선율 |
|------|------|---------|--------|
| **AI 호출 비용** | 288회/일 (5분마다) | 48~96회/일 (동적 주기) | **-67% ~ -33%** |
| **눌림목 매수 성공률** | 30% (추정) | 70% | **+133%** |
| **타이밍 오류율** | 40% (고점 매수/저점 매도) | 15% | **-62.5%** |
| **전략-전술 일치도** | 50% (피드백 부재) | 90% | **+80%** |

### 7.2 정성적 효과

#### **7.2.1 트레이딩 품질 향상**

```
시나리오: BTC 급등 후 조정 국면

BEFORE (현재):
  09:00 - CIO: "BTC 비중 20%로 확대"
  09:01 - Process2: "추가매수" 실행 (RSI 85 무시)
  10:00 - BTC -8% 급락
  결과: 손실 -800,000원

AFTER (개혁안):
  09:00 - CIO: "BTC 비중 20%로 확대"
  09:01 - Process2: "매매보류" (타이밍 점수 20점)
          tactical_notes: "1H RSI 85 과열, 눌림목 대기"
  11:30 - Process1이 "RSI 60 + 거래량 증가" 감지 → 긴급 트리거
  11:31 - Process2: "추가매수" 실행 (타이밍 점수 75점)
  결과: 수익 +1,200,000원

차이: +2,000,000원 (1회 거래)
```

#### **7.2.2 CIO 전략 개선**

```
BEFORE:
  Day 1 - CIO: "XRP 비중 15%로 확대"
  Day 1 - Process2: "매매보류" (과열)
  Day 2 - CIO: "XRP 여전히 10%, 다시 15% 지시" ← 학습 없음
  Day 2 - Process2: "또 매매보류"

  결과: 전략-전술 불일치 지속, 목표 달성 실패

AFTER:
  Day 1 - CIO: "XRP 비중 15%로 확대"
  Day 1 - Process2: "매매보류"
          tactical_notes: "1H RSI 83, 4H RSI 78 과열"
  Day 2 - CIO가 피드백 확인:
          "Process2가 2일 연속 XRP 매수 보류. RSI 과열이 원인.
           현재 시장 국면에서 XRP는 공격적 목표 부적합.
           목표 비중을 12%로 하향 조정하고, 눌림목 발생 시 진입 전략으로 수정"
  Day 2 - Process2: "추가매수" 실행 (현실적인 목표)

  결과: 전략-전술 일치, 수익 달성
```

### 7.3 시스템 안정성

| 항목 | 개선 내용 |
|------|-----------|
| **에러 핸들링** | Layer별 독립 에러 처리 → 1개 Layer 실패해도 시스템 정상 작동 |
| **디버깅** | Layer별 로깅 → 문제 발생 지점 즉시 파악 |
| **확장성** | 새 데이터 소스 추가 시 DataCollector만 수정 → 다른 Layer 영향 없음 |

---

## 8. 리스크 및 대응 방안

### 8.1 리스크 1: 프롬프트 복잡도 증가

**문제**:
- 전술 실행 프레임워크 추가로 프롬프트 길이 증가
- AI의 의사결정 시간 증가 가능성

**대응 방안**:
1. **프롬프트 최적화**:
   - 불필요한 중복 제거
   - 핵심 원칙을 "계층 0" 앞에 배치 (최우선 인식)

2. **토큰 사용량 모니터링**:
   ```python
   def log_token_usage(response):
       usage = response.usage
       logger.info(f"토큰 사용: {usage.total_tokens} (입력: {usage.prompt_tokens}, 출력: {usage.completion_tokens})")
   ```

3. **분할 실행** (극단적 상황):
   - 10개 이상 코인 분석 시 5개씩 분할 실행

### 8.2 리스크 2: "매매보류" 과다

**문제**:
- AI가 타이밍 점수를 너무 보수적으로 계산
- CIO 전략 목표가 장기간 미달성

**대응 방안**:
1. **타이밍 점수 임계값 조정**:
   ```python
   # 초기 설정 (보수적)
   timing_score >= 60: 즉시 실행
   timing_score < 30: 매매보류

   # 1주일 모니터링 후 조정
   timing_score >= 50: 즉시 실행 (기준 완화)
   timing_score < 20: 매매보류 (대기 범위 축소)
   ```

2. **KPI 모니터링**:
   - 매매보류 비율이 50% 초과 시 알림
   - 사용자가 수동으로 임계값 조정

### 8.3 리스크 3: 긴급 트리거 과다 발생

**문제**:
- Process1이 너무 민감하게 반응
- Process2가 너무 자주 호출되어 비용 증가

**대응 방안**:
1. **트리거 임계값 조정**:
   ```python
   # 초기 설정
   volume_spike > 3.0: 트리거

   # 1주일 모니터링 후 조정
   volume_spike > 4.0: 트리거 (기준 강화)
   ```

2. **쿨다운 타이머**:
   ```python
   last_trigger_time = {}

   def should_trigger_with_cooldown(symbol, triggers):
       if symbol in last_trigger_time:
           elapsed = (datetime.now() - last_trigger_time[symbol]).total_seconds()
           if elapsed < 600:  # 10분 쿨다운
               logger.info(f"⏳ {symbol} 트리거 쿨다운 중 (잔여: {600-elapsed:.0f}초)")
               return False

       last_trigger_time[symbol] = datetime.now()
       return True
   ```

### 8.4 리스크 4: 함수 재설계 시 버그 발생

**문제**:
- Phase 4 (함수 구조 재설계) 진행 시 예상치 못한 버그

**대응 방안**:
1. **Phase 4는 선택 사항**:
   - 사용자 동의 없이 진행하지 않음
   - Phase 1~3만으로도 충분한 개선 효과

2. **점진적 마이그레이션**:
   ```python
   # 기존 함수와 신규 클래스 병행 운영
   USE_NEW_STRUCTURE = False  # 플래그

   def analyze_portfolio_for_process2(trigger_coins):
       if USE_NEW_STRUCTURE:
           # 신규 클래스 기반 실행
           return new_version(trigger_coins)
       else:
           # 기존 함수 실행
           return legacy_version(trigger_coins)
   ```

3. **A/B 테스트**:
   - 1주일 기존 버전, 1주일 신규 버전 교차 실행
   - 성과 비교 후 최종 결정

---

## 9. 성공 지표 (KPI)

### 9.1 핵심 KPI (Primary Metrics)

| KPI | 측정 방법 | 목표 | 측정 주기 |
|-----|----------|------|-----------|
| **눌림목 매수 성공률** | (눌림목 매수 후 +수익 건수) / (전체 매수 건수) | 70% 이상 | 주간 |
| **타이밍 오류율** | (고점 매수 + 저점 매도 건수) / (전체 거래 건수) | 15% 이하 | 주간 |
| **전략-전술 일치도** | (CIO 목표 달성 건수) / (CIO 목표 설정 건수) | 90% 이상 | 주간 |
| **AI 호출 비용** | Process2 실행 횟수/일 | 48~96회 | 일간 |

### 9.2 보조 KPI (Secondary Metrics)

| KPI | 측정 방법 | 목표 |
|-----|----------|------|
| **매매보류 적절성** | (매매보류 후 실제로 더 좋은 가격 달성한 비율) | 80% 이상 |
| **긴급 트리거 유효성** | (긴급 트리거 → 실제 거래 실행 비율) | 60% 이상 |
| **CIO 피드백 활용률** | (CIO가 전술 피드백 반영한 비율) | 측정 후 판단 |

### 9.3 KPI 대시보드 (자동 생성)

```python
def generate_process2_reform_kpi_report(days: int = 7):
    """
    Process2 개혁안 KPI 리포트 생성

    Args:
        days: 분석 기간 (일)
    """
    conn = db_manager.get_connection()
    c = conn.cursor()

    cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()

    # KPI 1: 눌림목 매수 성공률
    c.execute("""
        SELECT
            COUNT(*) as total_buys,
            SUM(CASE WHEN tactical_notes LIKE '%눌림목%' THEN 1 ELSE 0 END) as dip_buys,
            SUM(CASE WHEN tactical_notes LIKE '%눌림목%' AND 수익률 > 0 THEN 1 ELSE 0 END) as successful_dip_buys
        FROM trade_history
        WHERE 거래시간 >= ? AND 거래유형 LIKE '%매수%'
    """, (cutoff_date,))

    buy_stats = c.fetchone()
    total_buys, dip_buys, successful_dip_buys = buy_stats
    dip_success_rate = (successful_dip_buys / dip_buys * 100) if dip_buys > 0 else 0

    # KPI 2: 타이밍 오류율
    c.execute("""
        SELECT
            COUNT(*) as total_trades,
            SUM(CASE WHEN tactical_notes LIKE '%고점%' OR tactical_notes LIKE '%저점%' THEN 1 ELSE 0 END) as timing_errors
        FROM trade_history
        WHERE 거래시간 >= ?
    """, (cutoff_date,))

    timing_stats = c.fetchone()
    total_trades, timing_errors = timing_stats
    timing_error_rate = (timing_errors / total_trades * 100) if total_trades > 0 else 0

    # KPI 3: 매매보류 비율
    c.execute("""
        SELECT
            COUNT(*) as total_decisions,
            SUM(CASE WHEN 매매판단 = '매매보류' THEN 1 ELSE 0 END) as holds
        FROM holding_status
        WHERE 마지막거래시간 >= ?
    """, (cutoff_date,))

    hold_stats = c.fetchone()
    total_decisions, holds = hold_stats
    hold_rate = (holds / total_decisions * 100) if total_decisions > 0 else 0

    conn.close()

    # 리포트 생성
    report = f"""
╔════════════════════════════════════════════════════════════╗
║          Process2 개혁안 KPI 리포트 (최근 {days}일)          ║
╠════════════════════════════════════════════════════════════╣
║  📊 핵심 지표                                               ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  1. 눌림목 매수 성공률: {dip_success_rate:6.1f}% (목표: 70% 이상)  {'✅' if dip_success_rate >= 70 else '⚠️'}
║     - 전체 매수: {total_buys}건
║     - 눌림목 매수: {dip_buys}건
║     - 성공: {successful_dip_buys}건
║                                                            ║
║  2. 타이밍 오류율:     {timing_error_rate:6.1f}% (목표: 15% 이하)  {'✅' if timing_error_rate <= 15 else '⚠️'}
║     - 전체 거래: {total_trades}건
║     - 타이밍 오류: {timing_errors}건
║                                                            ║
║  3. 매매보류 비율:     {hold_rate:6.1f}%                       {'⚠️' if hold_rate > 50 else '✅'}
║     - 전체 판단: {total_decisions}건
║     - 보류: {holds}건
║     - {'⚠️ 주의: 과도한 보류. 타이밍 점수 임계값 검토 필요' if hold_rate > 50 else '✅ 정상 범위'}
╚════════════════════════════════════════════════════════════╝
"""

    logger.info(report)
    return report

# 주간 리포트 스케줄 추가 (main.py)
schedule.every().sunday.at("22:00").do(generate_process2_reform_kpi_report, days=7)
```

---

## 10. 부록: 기술 참고 자료

### 10.1 관련 파일 및 함수 목록

#### **ai_strategy.py**

| 함수/클래스 | 줄 번호 | 역할 | 개혁안 수정 여부 |
|-------------|---------|------|------------------|
| `analyze_portfolio_for_process2()` | 1124 | Process2 메인 엔트리 | ✅ 재설계 (Phase 4) |
| `_get_system_prompt()` | 381 | 시스템 프롬프트 생성 | ✅ 수정 (Phase 1) |
| `create_analysis_prompt_for_decision()` | 820 | 사용자 프롬프트 생성 | ✅ 수정 (Phase 1) |
| `_execute_openai_analysis()` | 1202 | OpenAI 실행 | ➖ 유지 |
| `collect_all_coins_data_parallel()` | 968 | 병렬 데이터 수집 | ➖ 유지 |
| `get_optimal_trade_timing()` | - | 호가창 분석 | ➖ 유지 (핵심 함수!) |
| `update_portfolio_decisions()` | 1527 | DB 업데이트 | ➖ 유지 |

#### **config.py**

| 변수/함수 | 줄 번호 | 역할 | 개혁안 수정 여부 |
|-----------|---------|------|------------------|
| `COMMON_AI_RULES` | 373-835 | 핵심 매매 규칙 (463줄) | ✅ 추가 (Phase 1) |
| `AGGRESSIVE_CHARTER` | 266-297 | 공격적 페르소나 | ➖ 유지 |
| `DEFENSIVE_PRINCIPLES` | 298-353 | 방어적 페르소나 | ➖ 유지 |
| `BALANCED_PRINCIPLES` | 355-378 | 균형 페르소나 | ➖ 유지 |

#### **main.py**

| 함수 | 줄 번호 | 역할 | 개혁안 수정 여부 |
|------|---------|------|------------------|
| `process2_worker()` | 454 | Process2 백그라운드 스레드 | ➖ 유지 |
| `process1()` | - | 5분 주기 긴급 감지 | ✅ 수정 (Phase 2) |
| `main()` | 714 | 메인 함수 (스케줄링) | ✅ 수정 (Phase 2) |
| `_should_run_cio()` | - | CIO 실행 여부 판단 | ➖ 유지 |

### 10.2 프롬프트 추가 위치 상세

**파일**: `config.py`

**위치**: `COMMON_AI_RULES` 변수의 최상단 (373줄 다음)

**Before:**
```python
COMMON_AI_RULES = """
# 📜 AI 트레이더 헌법: 의사결정 계층 구조

# 당신은 최고의 암호화폐 트레이더로서...

# ======================================================================
# 🌍 계층 0: 시장 체제 인식 (Market Context Layer) 🆕
# ======================================================================
...
```

**After:**
```python
COMMON_AI_RULES = """
# 📜 AI 트레이더 헌법: 의사결정 계층 구조

# 당신은 최고의 암호화폐 트레이더로서...

# ======================================================================
# ⚡ 전술 실행 프레임워크 (Tactical Execution Framework)
# ======================================================================
# [여기에 5.1.1의 전체 내용 삽입]
...

# ======================================================================
# 🌍 계층 0: 시장 체제 인식 (Market Context Layer) 🆕
# ======================================================================
...
```

### 10.3 테스트 시나리오

#### **시나리오 1: 눌림목 대기 테스트**

```python
# 테스트 설정
# 1. BTC를 수동으로 과열 상태로 설정 (RSI 85)
# 2. CIO가 "BTC 비중 확대" 지시 (holding_status에서 GPT보유비중 15% → 20%)
# 3. Process2 실행

# 기대 결과:
# - 매매판단: "매매보류"
# - 거래사유: "CIO 전략 목표: BTC 비중 20%. 전술 판단: 1H RSI 85 과열, 눌림목 대기. 실행 조건: RSI 65 이하 + 거래량 증가"
# - GPT매매비중: 0

# 검증 방법:
holding = db_manager.get_holding_status('BTC')
assert holding['매매판단'] == '매매보류'
assert 'RSI' in holding['거래사유']
assert '눌림목' in holding['거래사유']
```

#### **시나리오 2: 긴급 트리거 발동 테스트**

```python
# 테스트 설정
# 1. BTC 거래량을 수동으로 3배로 설정
# 2. Process1 실행

# 기대 결과:
# - should_trigger_process2_emergency() 반환값: {...} (트리거 정보)
# - enqueue_process2() 호출됨
# - Process2 즉시 실행

# 검증 방법:
# 로그 확인:
# "🚨 긴급 트리거 발생: BTC - 거래량 3.8배 급증 감지"
# "📥 Process2 큐 작업 시작"
```

### 10.4 롤백 계획

만약 개혁안 적용 후 문제 발생 시:

```python
# 1. 프롬프트 롤백 (Phase 1)
# config.py에서 COMMON_AI_RULES를 Git 이전 버전으로 복원
git checkout HEAD~1 config.py

# 2. 실행 주기 롤백 (Phase 2)
# main.py의 스케줄 섹션을 이전 버전으로 복원
git checkout HEAD~1 main.py

# 3. DB 롤백 (Phase 3)
# tactical_notes 컬럼 제거 (데이터는 유지)
# - 컬럼만 사용 안 함 (제거하지 않음)

# 4. 전체 롤백
git revert <commit_hash>
```

---

## 📝 최종 체크리스트

### 사용자 확인 사항

- [ ] **질문 1 답변 확인**: 매도 타이밍 전략 = 옵션 A (Process2가 최적 출구 찾기)
- [ ] **질문 2 답변 확인**: 실행 주기 = 옵션 A + B (동적 15~60분 + 긴급 트리거)
- [ ] **질문 3 답변 확인**: CIO 피드백 = 현재 버전 (trade_history 간접 참조 유지)
- [ ] **Phase 4 (함수 재설계) 진행 여부**: 선택 사항 (사용자 결정 대기)

### 개발자 체크리스트

#### Phase 1: 프롬프트 개선
- [ ] config.py: COMMON_AI_RULES에 전술 실행 프레임워크 추가
- [ ] ai_strategy.py: create_analysis_prompt_for_decision() 수정
- [ ] config.py: 의사결정 프로세스 순서 재조정
- [ ] 테스트: Process2 실행 후 "매매보류" 판단 시 거래사유 확인

#### Phase 2: 동적 실행 주기
- [ ] main.py: get_dynamic_process2_interval() 함수 추가
- [ ] main.py: schedule_dynamic_process2() 함수 추가
- [ ] main.py: should_trigger_process2_emergency() 함수 추가
- [ ] main.py: process1() 함수에 긴급 트리거 로직 통합
- [ ] main.py: main() 함수 스케줄 섹션 수정
- [ ] 테스트: 24시간 모니터링 (동적 주기 변경 로그 확인)

#### Phase 3: CIO 피드백 루프
- [ ] supabase_adapter.py: add_tactical_notes_column() 함수 추가
- [ ] trade_manager.py: generate_tactical_notes() 함수 추가
- [ ] trade_manager.py: log_trade() 함수 수정
- [ ] ai_strategy.py: get_recent_tactical_feedback() 함수 추가
- [ ] ai_strategy.py: CIO 프롬프트에 피드백 섹션 추가
- [ ] 테스트: 거래 후 DB 확인, CIO 실행 후 프롬프트 확인

#### Phase 4: 함수 구조 재설계 (선택 사항)
- [ ] ai_strategy.py: Process2DataCollector 클래스 구현
- [ ] ai_strategy.py: Process2AIExecutor 클래스 구현
- [ ] ai_strategy.py: Process2ResultHandler 클래스 구현
- [ ] ai_strategy.py: analyze_portfolio_for_process2() 리팩토링
- [ ] 테스트: 회귀 테스트 (전체 기능 재검증)

---

## 🎯 다음 단계

사용자님의 최종 승인 후:

1. **Phase 1 즉시 착수** (프롬프트 개선)
2. **Phase 2 진행** (동적 실행 주기)
3. **Phase 3 진행** (CIO 피드백 루프)
4. **1주일 모니터링 후 KPI 리포트**
5. **Phase 4 진행 여부 최종 결정**

---

**문서 작성 완료**: 2025-01-XX
**다음 리뷰 예정**: 구현 완료 후 1주일 뒤
