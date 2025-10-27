# 트레이딩봇 개발 수정 가이드

> **📅 최초 작성**: 2025-10-20
> **📅 최종 업데이트**: 2025-10-24
> **📦 버전**: v1.3
> **⚠️ 중요**: 코드 수정 전 반드시 이 문서를 확인하세요!
> **🚨 신규 추가**: 코드 수정 전 필수 검증 규칙 (Section 2.4) ⭐

---

## 📋 목차

1. [시스템 아키텍처 이해](#1-시스템-아키텍처-이해)
2. [코드 작성 규칙](#2-코드-작성-규칙)
3. [주석 작성 규칙](#3-주석-작성-규칙)
4. [모듈 구조 규칙](#4-모듈-구조-규칙)
5. [데이터베이스 규칙](#5-데이터베이스-규칙)
6. [AI 전략 규칙](#6-ai-전략-규칙)
7. [로깅 규칙](#7-로깅-규칙)
8. [파일 구조 규칙](#8-파일-구조-규칙)
9. [Git 커밋 규칙](#9-git-커밋-규칙)
10. [테스트 및 배포 규칙](#10-테스트-및-배포-규칙)

---

## 1. 시스템 아키텍처 이해

### 1.1 3-Tier 아키텍처 원칙

```
┌─────────────────────────────────────────────────────┐
│             Layer 1: Entry Point (진입점)            │
│                     main.py                          │
│  - 시스템 초기화 및 스케줄링                           │
│  - Process1/Process2 워커 관리                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│          Layer 2: Core Modules (핵심 모듈)           │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ ai_strategy/ │  │data_manager/ │  │trade_mgr.py││
│  │  (9 files)   │  │  (9 files)   │  │            ││
│  └──────────────┘  └──────────────┘  └────────────┘│
│                                                       │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │  config.py   │  │supabase_ad.py│                 │
│  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│       Layer 3: External Services (외부 서비스)       │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Upbit API│  │OpenAI API│  │Gemini API│          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                       │
│  ┌──────────────────────────────────┐               │
│  │      Supabase PostgreSQL         │               │
│  │  (holding_status, trades, etc)   │               │
│  └──────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
```

**⚠️ 절대 규칙:**
- Layer 3 (외부 서비스)는 Layer 2에서만 호출
- Layer 1은 Layer 2의 public API만 사용
- Layer를 건너뛰는 호출 금지 (main.py에서 직접 API 호출 ❌)

---

### 1.2 🚨 아키텍처 변경 금지 규칙 (Critical Rule)

> **⚠️ 중요**: 주요 아키텍처 변경은 **반드시 사용자 승인 후**에만 진행하세요!

#### 1.2.1 아키텍처 변경이란?

다음과 같은 변경은 **주요 아키텍처 변경**으로 간주됩니다:

1. **모듈 로딩 방식 변경**
   - ❌ 정적 로딩(module-level constants) → 동적 로딩(runtime file reading)
   - ❌ import 시 한 번 로드 → 함수 호출 시마다 로드
   - ❌ 기존 캐싱 메커니즘 제거

2. **프롬프트 시스템 변경**
   - ❌ 외부 파일 방식 → 코드 내 하드코딩
   - ❌ config.py의 COMMON_AI_RULES 의존성 제거
   - ❌ 기존 프롬프트 구조 완전 재설계

3. **데이터베이스 구조 변경**
   - ❌ 테이블 스키마 변경
   - ❌ 필드 추가/삭제
   - ❌ 관계 변경

4. **AI 순위 시스템 변경**
   - ❌ 1-2순위 holding_status, 3-4순위 watchlist 규칙 변경
   - ❌ AI 응답 JSON 구조 변경

#### 1.2.2 실제 사례: 동적 로딩 실패 (2025-10-21)

**상황**:
- 프롬프트 파일 변경이 반영되지 않는 문제 발견
- Python 모듈 캐싱이 원인으로 추정

**잘못된 접근** ❌:
```python
# prompts.py (잘못된 동적 로딩 구현)
def _get_system_prompt(provider: str, market_phase: str) -> str:
    # ❌ 함수 호출 시마다 파일을 다시 로드
    CIO_AGGRESSIVE = _load_prompt_from_file('cio_aggressive.txt')
    CIO_DEFENSIVE = _load_prompt_from_file('cio_defensive.txt')
    CIO_NEUTRAL = _load_prompt_from_file('cio_neutral.txt')

    # ❌ config.py의 COMMON_AI_RULES 의존성 제거
    # ❌ 기존 backward compatibility exports 제거
```

**문제점**:
1. 사용자 워크플로우 무시: 사용자는 **파일 수정 → 프로그램 재시작**으로 변경사항 확인
2. 불필요한 복잡성 증가: 매 호출마다 파일 I/O 발생
3. 다른 모듈 파손: import 구조 변경으로 cio.py, reports.py 등에서 ImportError 발생
4. AI 순위 로직 파손: `universe.py`에서 순서 재정렬 로직이 누락됨

**올바른 접근** ✅:
```python
# prompts.py (간단한 정적 로딩 유지)
# 모듈 레벨에서 한 번만 로드
CIO_AGGRESSIVE = _load_prompt_from_file('cio_aggressive.txt')
CIO_DEFENSIVE = _load_prompt_from_file('cio_defensive.txt')
CIO_NEUTRAL = _load_prompt_from_file('cio_neutral.txt')
CIO_BASE_RULES = _load_prompt_from_file('cio_base_rules.txt')

# backward compatibility 유지
AGGRESSIVE_CHARTER = CIO_AGGRESSIVE
DEFENSIVE_PRINCIPLES = CIO_DEFENSIVE
BALANCED_PRINCIPLES = CIO_NEUTRAL

# config.py의 COMMON_AI_RULES 계속 사용
from config import COMMON_AI_RULES
```

**교훈**:
1. 사용자의 실제 워크플로우 먼저 확인
2. "완벽한 해결책"이라도 사용자 승인 없이 적용 금지
3. 간단한 해결책이 복잡한 해결책보다 나을 수 있음

#### 1.2.3 아키텍처 변경 승인 절차

**아키텍처 변경이 필요하다고 판단되면**:

1. **먼저 멈추고 질문**:
   ```
   "이 변경은 주요 아키텍처 변경입니다. 진행하기 전에 승인이 필요합니다."
   ```

2. **변경 사항 설명**:
   - 현재 방식과 제안 방식 비교
   - 변경 이유 (왜 필요한가?)
   - 예상 장단점
   - 영향 받는 모듈 목록

3. **사용자 승인 대기**:
   - 사용자가 명시적으로 "진행해줘" 또는 "변경해줘"라고 응답할 때까지 대기
   - 승인 없이 임의로 진행 금지

4. **승인 후 진행**:
   - 변경 전 현재 코드 백업
   - 단계별로 진행하며 테스트
   - 문제 발생 시 즉시 롤백

**예시 대화**:
```
AI: "프롬프트 캐싱 문제를 해결하기 위해 동적 로딩 방식으로 변경하는 것을 고려했습니다.
     하지만 이는 주요 아키텍처 변경입니다.

     현재 방식: 모듈 import 시 한 번만 로드 (정적)
     제안 방식: 함수 호출 시마다 파일 로드 (동적)

     장점: 파일 수정 후 프로그램 재시작 없이 변경 반영
     단점: 매번 파일 I/O 발생, 복잡성 증가

     진행하시겠습니까?"

사용자: "프로그램 재시작으로 해결되는데 왜 필요해? 동적 로딩 필요없어."

AI: "알겠습니다. 동적 로딩은 적용하지 않고 현재 방식을 유지하겠습니다."
```

#### 1.2.4 허용되는 변경 vs 금지되는 변경

**✅ 사용자 승인 없이 가능한 변경**:
- 버그 수정 (기능 변화 없음)
- 코드 리팩토링 (내부 구조 개선, 외부 동작 동일)
- 로그 메시지 개선
- 주석 추가/수정
- 성능 최적화 (동작 방식 동일)

**❌ 사용자 승인 필수인 변경**:
- 모듈 로딩 방식 변경
- 프롬프트 시스템 구조 변경
- AI 응답 JSON 구조 변경
- 데이터베이스 스키마 변경
- 프로세스 실행 흐름 변경
- 의존성 추가/제거
- 새로운 외부 라이브러리 도입

---

### 1.3 단일 책임 원칙 (SRP)

| 컴포넌트 | 역할 | 책임 | 절대 하지 말아야 할 것 |
|---------|------|------|---------------------|
| **CIO** | 전략가 | 목표 비중 설정, 목표 수익률/손절률 설정 | ❌ 매매 실행, GPT매매비중 결정 |
| **Process2** | 실행자 | 매매 판단, GPT매매비중 결정 | ❌ GPT보유비중 수정, 목표 수익률/손절률 수정 |
| **Process1** | 감시자 | 5분마다 모니터링, 긴급 상황 감지 | ❌ 매매 실행, DB 직접 수정 |

**예시: 잘못된 코드** ❌
```python
# process2.py (잘못된 예시)
def analyze_portfolio_for_process2():
    # ❌ Process2가 GPT보유비중을 수정하려 시도 (CIO의 책임!)
    db_manager.update_holding_status(symbol, {
        'GPT보유비중': 30.0  # ❌ 절대 금지!
    })
```

**예시: 올바른 코드** ✅
```python
# process2.py (올바른 예시)
def analyze_portfolio_for_process2():
    # ✅ CIO가 설정한 목표를 읽기만 함
    target_weight = holding_info.get('GPT보유비중')

    # ✅ Process2는 GPT매매비중만 결정
    gpt_trade_percent = ai_result.get('gpt_trade_percent', 100)
```

---

### 1.3 데이터 소유권 규칙

| 데이터 필드 | 생성 주체 | 읽기 권한 | 업데이트 권한 |
|-----------|----------|----------|--------------|
| **GPT보유비중** | CIO | CIO, Process2 | **CIO만** ⭐ |
| **GPT목표수익률** | CIO | CIO, Process2 | **CIO만** ⭐ |
| **GPT목표손절률** | CIO | CIO, Process2 | **CIO만** ⭐ |
| **GPT매매비중** | Process2 | Process2 | Process2만 |
| **보유수량** | Process2 | CIO, Process2 | Process2만 |
| **관리상태** | CIO | 모두 | CIO만 |

**⚠️ 위반 시 발생하는 문제:**
- Process2가 GPT보유비중을 수정하면 → CIO 전략이 무효화됨
- CIO가 보유수량을 수정하면 → 실제 잔고와 불일치 발생

---

## 2. 코드 작성 규칙

### 2.1 모듈 임포트 순서

```python
# 1. 표준 라이브러리
import os
import sys
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional

# 2. 서드파티 라이브러리
import pandas as pd
import numpy as np
import pyupbit
from openai import OpenAI

# 3. 로컬 모듈 (절대 경로 우선)
from config import logger, setup_logging, UPBIT_ACCESS_KEY
from supabase_adapter import get_supabase_adapter
from trade_manager import TradeManager
from ai_strategy import recalculate_portfolio_weights
from data_manager import get_dynamic_universe
```

**⚠️ 금지 사항:**
- `from module import *` 절대 사용 금지
- 순환 임포트 (circular import) 금지
- 상대 임포트보다 절대 임포트 우선

---

### 2.2 함수 작성 규칙

#### 2.2.1 함수 길이 제한
- **최대 100줄** (100줄 초과 시 반드시 분리)
- **중첩 depth 최대 3단계** (if 안에 if 안에 if까지만)

**잘못된 예시** ❌
```python
def process_all_coins():  # 500줄 함수
    # 데이터 수집 (100줄)
    # ...
    # AI 분석 (200줄)
    # ...
    # 거래 실행 (200줄)
    # ...
```

**올바른 예시** ✅
```python
def process_all_coins():
    """메인 프로세스 - 각 단계를 별도 함수로 분리"""
    coins_data = collect_coins_data()  # 별도 함수
    ai_result = analyze_with_ai(coins_data)  # 별도 함수
    execute_trades(ai_result)  # 별도 함수
```

#### 2.2.2 함수명 규칙
- **동사 + 명사** 형태
- 소문자 + 언더스코어 (snake_case)
- 명확한 의미 전달

**좋은 예시** ✅
```python
get_current_price(symbol)
calculate_portfolio_value()
update_holding_status(symbol, data)
analyze_portfolio_for_process2()
```

**나쁜 예시** ❌
```python
gcp(s)  # ❌ 축약어
do_stuff()  # ❌ 모호함
ProcessData()  # ❌ CamelCase (클래스만 사용)
```

#### 2.2.3 파라미터 개수 제한
- **최대 5개** (5개 초과 시 Dict 또는 dataclass 사용)

**잘못된 예시** ❌
```python
def create_trade(symbol, side, amount, price, order_type, time_in_force, stop_loss, take_profit):
    # ❌ 파라미터 8개 (너무 많음)
```

**올바른 예시** ✅
```python
@dataclass
class TradeConfig:
    symbol: str
    side: str
    amount: float
    price: float
    order_type: str = 'limit'
    time_in_force: str = 'gtc'
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

def create_trade(config: TradeConfig):
    # ✅ 파라미터 1개 (구조화된 데이터)
```

---

### 2.3 에러 처리 규칙

#### 2.3.1 명시적 예외 처리
```python
# ❌ 나쁜 예시
try:
    result = api_call()
except:  # ❌ 모든 예외 catch
    pass  # ❌ 에러 무시

# ✅ 좋은 예시
try:
    result = api_call()
except requests.exceptions.Timeout as e:
    logger.error(f"API 타임아웃: {e}")
    return None
except requests.exceptions.RequestException as e:
    logger.error(f"API 요청 실패: {e}")
    raise  # 상위로 전파
```

#### 2.3.2 재시도 로직
```python
from config import logger
import time

def api_call_with_retry(max_retries=3, delay=2):
    """API 호출 재시도 (최대 3회, 2초 간격)"""
    for attempt in range(1, max_retries + 1):
        try:
            result = external_api_call()
            return result
        except Exception as e:
            logger.warning(f"API 호출 실패 (시도 {attempt}/{max_retries}): {e}")
            if attempt < max_retries:
                time.sleep(delay)
            else:
                logger.error(f"API 호출 최종 실패: {e}")
                raise
```

---

### 2.4 🚨 코드 수정 전 필수 검증 규칙 (Mandatory Code Verification Rules)

> **⚠️ 중요**: 코드 수정 전 반드시 검증하세요! 추측이나 가정으로 코드를 작성하면 시스템 크래시가 발생합니다.

#### 2.4.1 왜 이 규칙이 필요한가?

**실제 사례 (2025-10-24)**:

```python
# ❌ 잘못된 코드 (메서드 존재 여부 미확인)
coin_info = db_manager.get_coin_info(symbol)  # AttributeError 발생!
liquidity_grade = coin_info.get('유동성등급', 'N/A')
```

**문제점**:
1. `get_coin_info()` 메서드가 SupabaseAdapter 클래스에 존재하지 않음
2. "유동성등급" 필드가 데이터베이스 스키마에 존재하지 않음
3. 검증 없이 논리적 필요성만으로 구현 시도

**결과**:
- 시스템 크래시 (2025-10-24 11:09:06)
- AI 자동편입 프로세스 중단
- 긴급 롤백 필요

#### 2.4.2 필수 검증 체크리스트

코드 수정 시 다음 항목을 **반드시** 검증하세요:

**✅ 체크리스트**:

1. **메서드/함수 존재 확인**
   ```python
   # ❌ 나쁜 예시: 추측으로 호출
   result = obj.some_method()  # some_method가 존재하나?

   # ✅ 좋은 예시: 먼저 확인
   if hasattr(obj, 'some_method'):
       result = obj.some_method()
   else:
       logger.error("some_method가 존재하지 않음")
   ```

2. **데이터 필드 존재 확인**
   ```python
   # ❌ 나쁜 예시: 필드 존재 가정
   liquidity = data.get('유동성등급')  # DB에 이 필드가 있나?

   # ✅ 좋은 예시: 스키마 확인 후 사용
   # 1. supabase_adapter.py에서 get_holding_status() 리턴값 확인
   # 2. DB 테이블 스키마 확인 (holding_status 테이블)
   # 3. 필드 존재 확인 후 코드 작성
   ```

3. **클래스 메서드 목록 확인**
   ```python
   # Python 콘솔에서 확인
   from supabase_adapter import get_supabase_adapter
   db = get_supabase_adapter()
   print([m for m in dir(db) if not m.startswith('_')])
   # 또는 파일 직접 읽기
   ```

4. **데이터베이스 스키마 확인**
   ```python
   # Supabase 대시보드에서 확인
   # 또는 Python 콘솔에서 샘플 데이터 조회
   sample = db.get_holding_status('BTC')
   print(sample.keys())  # 실제 필드 목록 확인
   ```

#### 2.4.3 검증 절차 (Step-by-Step)

**코드 수정 전 필수 절차**:

```
Step 1: 요구사항 분석
  ↓ "유동성 등급 기반 필터링이 필요하다"

Step 2: 인프라 존재 확인 ⚠️ [이 단계를 건너뛰면 안 됨!]
  ↓ "유동성 등급 데이터가 DB에 있나?"
  ↓ "유동성 등급을 조회하는 메서드가 있나?"

Step 3: 검증 결과에 따른 행동
  ├─ ✅ 존재함 → 코드 작성 진행
  └─ ❌ 없음 → 다음 중 선택:
       1. 데이터/메서드를 먼저 추가 (사용자 승인 필요)
       2. 대안 방법 제시 (예: 프롬프트 수정)
       3. 요구사항 재검토
```

#### 2.4.4 검증 예시 (Good Practice)

**✅ 올바른 절차**:

```python
# 1단계: 메서드 존재 확인
from supabase_adapter import get_supabase_adapter
db = get_supabase_adapter()

# Python 콘솔에서 확인
available_methods = [m for m in dir(db) if not m.startswith('_')]
print('get_coin_info' in available_methods)  # False → 메서드 없음!

# 2단계: 대안 탐색
print('get_holding_status' in available_methods)  # True → 이 메서드 사용 가능

# 3단계: 실제 데이터 확인
sample = db.get_holding_status('BTC')
print(sample.keys())  # 실제 필드 목록 확인
# → '유동성등급' 필드 없음 확인!

# 4단계: 결론
# - get_coin_info() 메서드 없음
# - 유동성등급 필드 없음
# → 코드 수정 불가, 프롬프트 수정으로 대체
```

#### 2.4.5 금지 사항

**❌ 절대 하지 말아야 할 것**:

1. **"있을 것 같다"로 코드 작성**
   ```python
   # ❌ 나쁜 예시
   # "논리적으로 get_coin_info가 있어야 하니까 사용하자"
   coin_info = db.get_coin_info(symbol)  # 크래시!
   ```

2. **"필요하니까 있겠지"로 가정**
   ```python
   # ❌ 나쁜 예시
   # "유동성 등급이 중요하니까 DB에 당연히 있겠지"
   grade = data['유동성등급']  # KeyError!
   ```

3. **검증 없이 외부 라이브러리 사용**
   ```python
   # ❌ 나쁜 예시
   import some_random_library  # 설치되어 있나?
   ```

4. **샘플 데이터 조회 없이 스키마 가정**
   ```python
   # ❌ 나쁜 예시
   # "holding_status 테이블에는 당연히 이런 필드가 있을 것"
   # → 실제 데이터 조회로 확인 필수!
   ```

#### 2.4.6 빠른 검증 명령어

**즉시 사용 가능한 검증 명령어**:

```python
# Python 콘솔에서 실행

# 1. 클래스 메서드 목록 확인
from supabase_adapter import get_supabase_adapter
db = get_supabase_adapter()
print([m for m in dir(db) if not m.startswith('_')])

# 2. 샘플 데이터로 스키마 확인
sample = db.get_holding_status('BTC')
if sample:
    print("Available fields:", list(sample.keys()))

# 3. 함수 시그니처 확인
import inspect
print(inspect.signature(db.get_holding_status))
```

#### 2.4.7 교훈 요약

> **핵심 원칙**: "Verify before Code" (코드 작성 전 검증)
>
> - ✅ **DO**: 메서드/데이터 존재를 먼저 확인
> - ✅ **DO**: 샘플 데이터로 스키마 확인
> - ✅ **DO**: 불확실하면 사용자에게 질문
> - ❌ **DON'T**: 논리적 필요성만으로 존재 가정
> - ❌ **DON'T**: 검증 없이 코드 작성
> - ❌ **DON'T**: "있을 것 같다"로 추측

**반드시 기억하세요**: 5분의 검증이 5시간의 디버깅을 방지합니다!

---

## 3. 주석 작성 규칙

### 3.1 모듈 Docstring (필수)

**모든 Python 파일 최상단**에 다음 형식의 docstring 추가:

```python
"""
파일명.py - 모듈의 주요 역할 한 줄 요약

주요 역할:
- 역할 1
- 역할 2
- 역할 3

핵심 기능:
1. 기능 1 설명
   - 세부 사항
   - 세부 사항

2. 기능 2 설명
   - 세부 사항

사용 예시:
    from module import function
    result = function(param1, param2)

⚠️ 주의사항:
- 주의사항 1
- 주의사항 2
"""
```

**실제 예시** (trade_manager.py):
```python
"""
trade_manager.py - 거래 실행 및 포트폴리오 관리

주요 역할:
- Upbit API를 통한 실제 거래 실행
- Auto-escalation 및 Smart Fractional 로직
- TWAP 분할 매매 최적화

핵심 기능:
1. Auto-escalation: 목표 비중 달성 시간 10배 가속
   - gap >= 20%p: 3배 가속
   - gap >= 10%p: 2배 가속
   - gap >= 5%p: 1.5배 가속

2. Smart Fractional: 목표 갭의 65% 최소 보장
   - 너무 작은 매수 금액으로 인한 목표 달성 지연 방지

3. TWAP 분할 매매: 3회 split, 1건 DB 기록 (67% 감소)
   - 슬리피지 최소화
   - 시장 충격 감소

사용 예시:
    from trade_manager import TradeManager

    tm = TradeManager(upbit)
    tm.execute_trade_decision(
        symbol='BTC',
        decision_type='신규매수',
        gpt_trade_percent=50
    )

⚠️ 주의사항:
- 거래 실행 전 잔고 확인 필수
- 최소 거래 금액 5,000원 이상
- TWAP 분할은 1만원 이상일 때만 적용
"""
```

---

### 3.2 함수 Docstring (복잡한 함수만)

**복잡한 계산 로직, 100줄 이상 함수**에만 작성:

```python
def calculate_auto_escalation(gap_percent: float, gpt_trade_percent: float) -> float:
    """
    Auto-escalation 배율 계산

    목표 비중 갭이 클수록 더 큰 배율을 적용하여 빠르게 목표 비중 달성

    Args:
        gap_percent: 목표 비중과 현재 비중의 차이 (%)
        gpt_trade_percent: AI가 제안한 기본 매매 비중 (%)

    Returns:
        배율이 적용된 최종 매매 비중 (%)

    Examples:
        >>> calculate_auto_escalation(25, 10)
        30.0  # 25%p 갭 → 3배 가속 → 10% * 3 = 30%
    """
    if gap_percent >= 20:
        return min(100, gpt_trade_percent * 3.0)
    elif gap_percent >= 10:
        return min(100, gpt_trade_percent * 2.0)
    elif gap_percent >= 5:
        return min(100, gpt_trade_percent * 1.5)
    else:
        return gpt_trade_percent
```

**간단한 함수는 docstring 생략 가능**:
```python
def get_current_price(symbol: str) -> float:
    """현재가 조회"""  # 1줄 요약만
    return pyupbit.get_current_price(f"KRW-{symbol}")
```

---

### 3.3 인라인 주석 규칙

#### 3.3.1 간단한 계산: 1줄 주석
```python
total = krw_balance + crypto_value  # 총 자산 = 현금 + 코인 평가액
slice_count = 3  # TWAP 분할 횟수 (고정)
```

#### 3.3.2 복잡한 계산: 목적 + 로직 + 결과
```python
# Auto-escalation: 목표 비중 달성 시간 10배 가속 (10일 → 1일)
# 목표 갭이 클수록 더 큰 배율을 적용하여 빠르게 목표 비중 달성
if gap_percent >= 20:
    effective_percent = min(100, gpt_trade_percent * 3.0)  # 20%p 이상 → 3배 가속
elif gap_percent >= 10:
    effective_percent = min(100, gpt_trade_percent * 2.0)  # 10%p 이상 → 2배 가속
```

#### 3.3.3 자명한 코드: 주석 불필요
```python
# ❌ 불필요한 주석
total = a + b  # a와 b를 더함

# ✅ 주석 없이 명확한 코드
portfolio_value = cash_balance + crypto_holdings
```

---

## 4. 모듈 구조 규칙

### 4.1 모듈 분리 기준

**파일 크기 제한:**
- **최대 1,000줄** (1,000줄 초과 시 분리 고려)
- **ai_strategy.py (4,996줄) → 9개 파일** 분리 완료
- **data_manager.py (3,006줄) → 9개 파일** 분리 완료

**분리 기준:**
1. **기능별 분리** (client.py, utils.py, prompts.py)
2. **역할별 분리** (cio.py, process2.py, market_analysis.py)
3. **데이터 타입별 분리** (ohlcv.py, universe.py, orderbook.py)

---

### 4.2 __init__.py 작성 규칙

**모든 패키지 디렉토리**에 `__init__.py` 필수:

```python
"""
패키지명/ - 패키지 역할 한 줄 요약

모듈 구조 (총 파일 수):
1. module1.py - 설명
2. module2.py - 설명
...

사용 예시:
    from package import function
"""

# Public API만 노출
from .module1 import function1, function2
from .module2 import Class1

__all__ = [
    'function1',
    'function2',
    'Class1'
]
```

**실제 예시** (ai_strategy/__init__.py):
```python
"""
ai_strategy/ - AI 매매전략 및 포트폴리오 관리 모듈

모듈 구조 (4,996줄 → 9개 파일로 분리):
1. client.py: OpenAI/Gemini API 클라이언트
2. utils.py: API 재시도, JSON 파싱
3. prompts.py: 프롬프트 빌더 + 외부 txt 파일 로드
...
"""

from .cio import recalculate_portfolio_weights
from .process2 import analyze_portfolio_for_process2

__all__ = [
    'recalculate_portfolio_weights',
    'analyze_portfolio_for_process2'
]
```

---

## 5. 데이터베이스 규칙

### 5.1 holding_status 테이블 업데이트 규칙

**절대 규칙:**

| 컬럼명 | 업데이트 가능 주체 | 절대 금지 |
|--------|-------------------|----------|
| `GPT보유비중` | **CIO만** | Process2 ❌ |
| `GPT목표수익률` | **CIO만** | Process2 ❌ |
| `GPT목표손절률` | **CIO만** | Process2 ❌ |
| `관리상태` | **CIO만** | Process2 ❌ |
| `보유수량` | **Process2만** | CIO ❌ |
| `매수평균가` | **Process2만** | CIO ❌ |
| `평가금액` | **Process2만** | CIO ❌ |

**예시: CIO 업데이트**
```python
# cio.py
def recalculate_portfolio_weights():
    # ✅ CIO는 목표만 설정
    db_manager.update_holding_status(symbol, {
        'GPT보유비중': 30.0,
        'GPT목표수익률': 20.0,
        'GPT목표손절률': -7.0,
        '관리상태': '활성'
    })
```

**예시: Process2 업데이트**
```python
# process2.py
def execute_trade():
    # ✅ Process2는 실제 보유량만 업데이트
    db_manager.update_holding_status(symbol, {
        '보유수량': new_quantity,
        '매수평균가': avg_price,
        '평가금액': current_value
    })

    # ❌ 절대 금지!
    # db_manager.update_holding_status(symbol, {
    #     'GPT보유비중': 30.0  # ❌❌❌
    # })
```

---

### 5.2 trades 테이블 기록 규칙

**모든 거래는 반드시 기록**:
```python
def record_trade(symbol, side, quantity, price, reason):
    """거래 기록 (필수)"""
    db_manager.insert_trade({
        '거래일시': datetime.now().isoformat(),
        '코인이름': symbol,
        '거래유형': side,  # '매수' 또는 '매도'
        '거래수량': quantity,
        '거래단가': price,
        '거래금액': quantity * price,
        '수수료': quantity * price * 0.0005,
        '거래사유': reason,
        '트리거타입': 'daily_analysis'  # 또는 'emergency'
    })
```

---

## 6. AI 전략 규칙

### 6.0 프롬프트 명세서 관리 규칙 ⭐ (2025-10-24 추가)

> **⚠️ 중요**: AI 프롬프트는 비결정론적 특성으로 인해 **같은 프롬프트라도 매번 다른 결과**를 낼 수 있습니다.
> 따라서 **프롬프트 자체만으로는 일관성을 보장할 수 없으며**, 명세서를 통한 체계적 관리가 필수입니다.

#### 6.0.1 프롬프트 명세서의 필요성

**문제 상황**:
```
반복되는 악순환:
1. 프롬프트 개선 → "완벽하게 수정했다" 응답
2. 다음날 → 동일한 문제 재발견
3. 명시적 조건 추가 → 일관성 확보 시도
4. 철학 위배 발견 ("규칙 기반 결정 트리"化) → 명시적 조건 제거
5. 다시 1번으로... (무한 반복)
```

**근본 원인**:
- ❌ AI의 비결정론적 특성 (같은 입력 → 다른 추론 경로)
- ❌ 프롬프트 해석의 불안정성 (맥락 이해 방식 변동)
- ❌ 명시적 조건 vs 자율 판단의 균형 부재

**해결책**:
- ✅ **프롬프트 명세서**: 판단 원칙, 시나리오, 검증 기준 문서화
- ✅ **일관성 검증 체크리스트**: 프롬프트 수정 후 체계적 테스트
- ✅ **수정 이력 관리**: 변경 사항 및 이유 기록

---

#### 6.0.2 프롬프트 명세서 구조

**디렉토리 구조** (변경 금지):
```
docs/prompts/
├── README.md                      # 이 디렉토리의 목적 및 사용법
├── AI자동편입_명세서.md             # AI 자동편입 프롬프트 명세
├── CIO비중_명세서.md                # CIO 포트폴리오 프롬프트 명세
└── 매매판단_명세서.md               # Process2 매매 판단 프롬프트 명세
```

**각 명세서의 필수 구조** (섹션 순서 고정):
```markdown
# [기능명] 프롬프트 명세서

> **📅 최초 작성**: YYYY-MM-DD
> **📅 최종 업데이트**: YYYY-MM-DD
> **📦 버전**: v1.x
> **🔗 실제 프롬프트 위치**: [파일 경로 또는 코드 위치]

---

## 1. 핵심 철학
- 이 AI가 지켜야 할 근본 원칙
- README.md의 "핵심 철학"과 일치해야 함

## 2. 판단 원칙 (우선순위)
- 판단 시 고려할 요소들의 우선순위
- 숫자로 명시 (1순위, 2순위...)

## 3. 특수 규칙
- 이 AI만의 고유한 규칙 (예: AI 자동편입 존중)
- 예외 상황 처리 방법

## 4. 시나리오 라이브러리
- 구체적 상황별 올바른 판단 예시
- 최소 10개 시나리오 포함

## 5. 금지 사항
- 절대 해서는 안 되는 행동
- 철학 위배 사례

## 6. 검증 체크리스트
- 프롬프트 수정 후 확인할 항목
- 일관성 테스트 방법

## 7. 수정 이력
- 날짜별 변경 내용 및 이유 기록
```

---

#### 6.0.3 프롬프트 수정 시 필수 절차 ⚠️

**프롬프트를 수정할 때 반드시 다음 순서를 따르세요**:

**1단계: 명세서 확인**
```bash
# 해당 기능의 명세서를 먼저 읽기
cat docs/prompts/[기능명]_명세서.md

# 핵심 철학, 판단 원칙 확인
# 금지 사항 확인
```

**2단계: 수정 계획 검증**
```
질문 1: 이 수정이 핵심 철학에 부합하는가?
  - ✅ 데이터 기반 자율 판단을 강화하는가?
  - ❌ 명시적 규칙을 추가하는 것은 아닌가?

질문 2: 기존 판단 원칙과 충돌하지 않는가?
  - 예: 새로운 규칙이 기존 우선순위를 무시하지 않는가?

질문 3: 시나리오 라이브러리의 예시와 일치하는가?
  - 새로운 규칙을 적용했을 때 시나리오 예시의 결과가 바뀌는가?
```

**3단계: 프롬프트 수정**
```bash
# 실제 프롬프트 파일 수정
# - CIO: ai_strategy/prompts/cio_*.txt
# - AI자동편입: ai_strategy/market_analysis.py
# - Process2: ai_strategy/prompts.py
```

**4단계: 명세서 업데이트** (필수! 빠뜨리면 안 됨)
```bash
# 1. docs/prompts/[기능명]_명세서.md 열기

# 2. 최종 업데이트 날짜 수정
📅 최종 업데이트: 2025-XX-XX

# 3. 해당 섹션 업데이트
## 3. 특수 규칙 (예시)
- [신규 추가 2025-XX-XX] 새로운 규칙 설명

# 4. 시나리오 라이브러리에 새 예시 추가 (필요시)
## 4. 시나리오 라이브러리
### 시나리오 11: [새로운 상황]
...

# 5. 수정 이력 기록 (필수!)
## 7. 수정 이력
### 2025-XX-XX (v1.3)
- 변경 내용: [구체적 설명]
- 변경 이유: [문제 상황 및 해결 목적]
- 영향 범위: [어떤 판단이 바뀌는가]
```

**5단계: 검증 체크리스트 실행**
```bash
# 명세서의 "6. 검증 체크리스트" 항목 따라 테스트
# - 시나리오 반복 테스트
# - 일관성 확인
# - 철학 위배 여부 확인
```

**6단계: 테스트 및 모니터링**
```bash
# 시스템 재시작
# 1일 운영 후 일관성 확인
# 문제 발견 시 명세서의 "7. 수정 이력"에 기록
```

---

#### 6.0.4 명세서 관리 원칙

**DO (반드시 할 것)**:
- ✅ **프롬프트 수정 시 명세서 동시 업데이트**
  - 프롬프트만 수정하고 명세서를 업데이트하지 않으면 → 명세서가 낡고 무용지물化

- ✅ **수정 이력 반드시 기록**
  - 날짜, 변경 내용, 이유, 영향 범위 명시

- ✅ **시나리오 라이브러리 지속 확장**
  - 새로운 문제 발견 시 → 시나리오 추가
  - 최소 10개 → 점진적으로 20개, 30개로 확장

- ✅ **철학 위배 사례 기록**
  - 잘못된 수정 사례를 "5. 금지 사항"에 추가
  - 미래의 실수 방지

**DON'T (절대 하지 말 것)**:
- ❌ **프롬프트만 수정하고 명세서 미업데이트**
  - 결과: 명세서와 실제 프롬프트 불일치 → 혼란

- ❌ **명세서 없이 프롬프트 수정**
  - 결과: 철학 위배 위험, 일관성 부재

- ❌ **명세서를 1회성 문서로 간주**
  - 명세서는 **살아있는 문서** (Living Document)
  - 지속적 업데이트 필요

- ❌ **수정 이력 누락**
  - 결과: 왜 이렇게 수정했는지 알 수 없음
  - 같은 실수 반복

---

#### 6.0.5 문서 간 연결 관계

**학습 순서** (신규 개발자 또는 AI):
```
1. README.md (핵심 철학 이해)
   ↓
2. DEVELOPMENT_GUIDE.md (개발 규칙 학습)
   ↓
3. docs/prompts/[기능명]_명세서.md (구체적 판단 기준)
   ↓
4. 실제 프롬프트 파일 수정
```

**문서 일관성 체크**:
```
README.md의 "핵심 철학"
  ↓ (일치해야 함)
명세서의 "1. 핵심 철학"
  ↓ (반영되어야 함)
실제 프롬프트의 System Prompt
```

**예시**:
```markdown
# README.md
> AI 트레이딩 봇은 데이터 기반 자율 판단 시스템이며, 규칙 기반 결정 트리가 아닙니다.

# docs/prompts/CIO비중_명세서.md
## 1. 핵심 철학
- 데이터 기반 자율 판단 (명시적 규칙 최소화)
- CIO 일관성 = 시스템 신뢰성

# ai_strategy/prompts/cio_defensive.txt
당신은 **데이터 기반으로 자율 판단**하는 포트폴리오 전략가입니다.
명시적 규칙보다 **맥락 전체를 이해**하여 판단하세요.
```

---

#### 6.0.6 명세서 버전 관리

**버전 규칙**:
```
v1.0 → 최초 작성
v1.1 → 시나리오 추가 (기능 변경 없음)
v1.2 → 판단 원칙 수정 (소폭 변경)
v2.0 → 핵심 철학 변경 (대폭 변경)
```

**Git 커밋 메시지 규칙**:
```bash
# 프롬프트 수정 시
git commit -m "feat(prompt): CIO 프롬프트에 AI 자동편입 존중 규칙 추가

- 변경 파일: ai_strategy/prompts/cio_defensive.txt
- 명세서 업데이트: docs/prompts/CIO비중_명세서.md v1.3
- 변경 이유: AI 자동편입 코인을 CIO가 즉시 제외하는 문제 해결
- 영향: AI 자동편입 성공률 향상 예상
"
```

---

### 6.1 CIO vs Process2 역할 분리

| 항목 | CIO | Process2 |
|------|-----|----------|
| **호출 빈도** | 하루 3회 + 긴급 시 | 하루 3회 + 긴급 시 |
| **AI 모델** | OpenAI GPT-4 (깊은 분석) | Gemini 2.0 (빠른 판단) |
| **분석 대상** | 전체 포트폴리오 | 개별 코인 |
| **결정 사항** | 목표 비중, 목표 수익률/손절률 | 매매 판단, GPT매매비중 |
| **실행 시간** | 5-10분 (전략 수립) | 1-2분 (빠른 실행) |

**⚠️ 중요:**
- CIO가 목표를 설정하면 → Process2는 그 목표를 읽어서 실행만
- Process2가 CIO의 목표를 수정하면 안 됨!

---

### 6.2 AI 프롬프트 작성 규칙

#### 6.2.1 프롬프트 파일 위치 및 수정 방법

**⚠️ 중요**: `docs/prompts_log/` 폴더의 파일은 **실행 로그**이며 수정해도 반영되지 않습니다!

**📚 프롬프트 종류별 상세 가이드**:
- [AI자동편입.md](AI자동편입.md#4-프롬프트-수정-방법) - AI 자동편입 프롬프트 수정 가이드
- [CIO비중.md](CIO비중.md#4-프롬프트-수정-방법) - CIO 포트폴리오 프롬프트 수정 가이드
- [매매판단.md](매매판단.md#4-프롬프트-수정-방법) - Process2 매매 판단 프롬프트 수정 가이드
- [기타기능.md](기타기능.md) - 환율, 서킷브레이커, 일일 보고서 등 시스템 개선 사항

**프롬프트 종류별 수정 위치:**

| 프롬프트 종류 | 수정 위치 | 설명 |
|------------|---------|------|
| **CIO 매매 전략** | `ai_strategy/prompts/` | 외부 txt 파일 (cio_*.txt) |
| **AI 자동편입** | `ai_strategy/market_analysis.py` | 코드 내 하드코딩 (Line 540~860) |
| **Process2 매매 판단** | `ai_strategy/prompts.py` | 코드 내 하드코딩 |

**1. CIO 매매 전략 프롬프트 수정** (외부 파일):
```python
# ai_strategy/prompts.py에서 로드
def load_prompt_from_file(filename):
    """프롬프트 외부 파일 로드"""
    with open(f'ai_strategy/prompts/{filename}', 'r', encoding='utf-8') as f:
        return f.read()

CIO_AGGRESSIVE = load_prompt_from_file('cio_aggressive.txt')
CIO_DEFENSIVE = load_prompt_from_file('cio_defensive.txt')
CIO_NEUTRAL = load_prompt_from_file('cio_neutral.txt')
CIO_BASE_RULES = load_prompt_from_file('cio_base_rules.txt')
```

**수정 방법**:
1. `ai_strategy/prompts/cio_*.txt` 파일 직접 수정
2. 프로그램 재시작 (모듈 import 시 한 번만 로드됨)
3. `docs/prompts_log/` 폴더에서 로그 확인

**2. AI 자동편입 프롬프트 수정** (코드 내 하드코딩):
```python
# ai_strategy/market_analysis.py의 select_best_coin_from_candidates() 함수
def select_best_coin_from_candidates(...):
    """AI 자동편입 (듀얼 퍼널 최종 면접)"""

    # System Prompt (Line 540~680)
    system_prompt = f"""
당신은 '듀얼 퍼널(Dual Funnel)' 시스템을 통해 선별된 후보 코인들을 최종 평가하는 CIO입니다.

## 🎯 CIO의 핵심 임무 (절대 규칙)
...
    """

    # User Prompt (Line 780~860)
    user_message = f"""
## 1. 현재 시장 브리핑
...
    """
```

**수정 방법**:
1. `ai_strategy/market_analysis.py` 파일 직접 수정
2. `system_prompt` 변수 또는 `user_message` 변수 수정
3. 프로그램 재시작
4. `docs/prompts_log/AI자동편입_*.txt` 로그 파일에서 확인

**3. 로그 파일 확인 방법**:
```bash
# AI 자동편입 최신 로그 확인
ls -lt docs/prompts_log/AI자동편입_*.txt | head -1

# CIO 최신 로그 확인
ls -lt docs/prompts_log/CIO_*.txt | head -1

# Process2 최신 로그 확인
ls -lt docs/prompts_log/Process2_*.txt | head -1
```

**외부 파일 위치:**
- `ai_strategy/prompts/cio_aggressive.txt` - CIO 공격적 전략
- `ai_strategy/prompts/cio_defensive.txt` - CIO 방어적 전략
- `ai_strategy/prompts/cio_neutral.txt` - CIO 균형 전략
- `ai_strategy/prompts/cio_base_rules.txt` - CIO 기본 규칙

#### 6.2.2 AI 응답 JSON 구조 고정
```python
# CIO 응답 형식 (절대 변경 금지)
{
    "weights": [
        {"asset": "BTC", "weight": 30.0},
        {"asset": "ETH", "weight": 20.0},
        {"asset": "KRW", "weight": 50.0}
    ],
    "targets": {
        "BTC": {
            "target_profit": 20.0,
            "stop_loss": -7.0,
            "rationale": "비트코인은..."
        }
    },
    "rationale": "현재 시장은..."
}

# Process2 응답 형식 (절대 변경 금지)
{
    "decision": "신규매수",  # 또는 "추가매수", "부분익절", "전량익절", "보류"
    "confidence": 75,  # 0-100
    "gpt_trade_percent": 50,  # 0-100
    "reason": "120일선 지지 확인...",
    "thinking_process": "1. 현재 상태 분석..."
}
```

---

## 7. 로깅 규칙

### 7.1 로깅 시스템 v2.0 사용

**로그 포맷 (절대 변경 금지):**
```
시간 (19자) | 모듈 (12자) | 함수 (20자) | 레벨 (7자) | 메시지
2025-10-20 16:30:45 | ai_strategy  | 🧠 CIO포트폴리오       | INFO    | 포트폴리오 재구성 시작
```

**프로세스명 매핑 (config.py):**
```python
PROCESS_NAME_MAPPING = {
    'process1': ('5분실시간분석', '🔍'),
    'run_portfolio_rebalance': ('CIO포트폴리오', '🧠'),
    'run_ai_decision_analysis': ('AI매매판단', '🤖'),
    'process2_worker': ('AI매매워커', '⚙️'),
    'initialize_system': ('시스템초기화', '🚀'),
    'update_trading_universe': ('AI자동편입', '🌌'),
    'daily_report': ('일일리포트', '📊'),
    'run_daily_ai_briefing': ('AI일일브리핑', '📝'),
}
```

---

### 7.2 로깅 헬퍼 함수 사용

#### 7.2.1 섹션 헤더/푸터
```python
from config import log_section_header, log_section_footer

def main_process():
    log_section_header(logger, "CIO 포트폴리오 재구성 시작")
    # ... 처리 로직 ...
    log_section_footer(logger)
```

#### 7.2.2 긴 텍스트 출력
```python
from config import log_long_text

# ❌ 나쁜 예시: 수동 자르기
logger.info(f"AI 전략: {strategy[:100]}...")

# ✅ 좋은 예시: log_long_text 사용
log_long_text(logger, strategy, prefix='AI 전략: ', max_width=120)
```

#### 7.2.3 로그 레벨 사용 규칙
| 레벨 | 용도 | 예시 |
|------|------|------|
| DEBUG | 상세 디버깅 정보 | API 요청/응답 전체 |
| INFO | 정상 흐름 정보 | 프로세스 시작/완료, 매매 실행 |
| WARNING | 경고 (시스템 계속 동작) | API 재시도, 캐시 미스 |
| ERROR | 오류 (일부 기능 실패) | DB 조회 실패, AI 분석 실패 |
| CRITICAL | 치명적 오류 (시스템 중단) | 서킷브레이커 발동 |

---

## 8. 파일 구조 규칙

### 8.1 프로젝트 구조 (변경 금지)

```
gptbitcoin4/
├── main.py                    # 시스템 진입점 (Layer 1)
├── config.py                  # 전역 설정 + 로깅 시스템 v2.0
├── trade_manager.py           # 거래 실행 관리
├── supabase_adapter.py        # DB 인터페이스
│
├── ai_strategy/               # AI 전략 모듈 (9 files)
│   ├── __init__.py
│   ├── client.py
│   ├── utils.py
│   ├── prompts.py
│   ├── data_collector.py
│   ├── process2.py
│   ├── cio.py
│   ├── market_analysis.py
│   ├── reports.py
│   └── prompts/               # 외부 프롬프트 파일
│       ├── cio_aggressive.txt
│       ├── cio_defensive.txt
│       ├── cio_neutral.txt
│       └── cio_base_rules.txt
│
├── data_manager/              # 데이터 관리 모듈 (9 files)
│   ├── __init__.py
│   ├── cache.py
│   ├── ohlcv.py
│   ├── universe.py            # AI 자동편입 (Dual Funnel)
│   ├── market.py
│   ├── orderbook.py
│   ├── timing.py
│   ├── charts.py
│   └── portfolio.py
│
└── docs/                      # 문서 디렉토리
    ├── README.md              # 문서 디렉토리 가이드
    ├── DEVELOPMENT_GUIDE.md   # 개발 수정 가이드 (이 파일)
    ├── architecture/          # 시스템 아키텍처 문서
    ├── optimization/          # 최적화 기록
    ├── process_analysis/      # 프로세스 분석
    └── archive/               # 백업 및 구버전 파일
```

---

### 8.2 파일 위치 규칙

**절대 규칙:**
1. **백업 파일 (.bak)** → `docs/archive/backup_files/`
2. **구버전 모듈** → `docs/archive/old_modules/`
3. **테스트 파일** → `docs/archive/` 또는 `tests/` (별도 생성 시)
4. **문서 파일** → `docs/architecture/`, `docs/optimization/`, `docs/process_analysis/`

**금지 사항:**
- ❌ 루트 디렉토리에 백업 파일 생성
- ❌ `_old`, `_backup` 같은 폴더 임의 생성
- ❌ 사용하지 않는 파일 방치

---

## 9. Git 커밋 규칙

### 9.1 커밋 메시지 형식

```
<type>: <subject>

<body>

<footer>
```

**Type 종류:**
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링 (기능 변화 없음)
- `docs`: 문서 수정
- `style`: 코드 포맷 변경 (세미콜론, 공백 등)
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드, 설정 파일 수정

**예시:**
```
feat: Add Auto-escalation logic to trade_manager.py

Auto-escalation 배율 적용 로직 추가:
- gap >= 20%p: 3배 가속
- gap >= 10%p: 2배 가속
- gap >= 5%p: 1.5배 가속

Related: #123
```

---

### 9.2 커밋 단위

**1 커밋 = 1 기능**
- ✅ 한 가지 기능만 포함
- ✅ 빌드/테스트 통과 상태
- ❌ 여러 기능을 한 번에 커밋 금지

**예시:**
```bash
# ❌ 나쁜 예시: 3개 기능을 한 번에
git commit -m "Add Auto-escalation, fix logging, update docs"

# ✅ 좋은 예시: 각각 별도 커밋
git commit -m "feat: Add Auto-escalation logic"
git commit -m "fix: Fix logging format alignment"
git commit -m "docs: Update DEVELOPMENT_GUIDE.md"
```

---

## 10. 테스트 및 배포 규칙

### 10.1 코드 수정 전 체크리스트

- [ ] 이 문서 (DEVELOPMENT_GUIDE.md) 읽음
- [ ] 수정하려는 파일의 모듈 docstring 읽음
- [ ] 관련 문서 확인 (TRADING_BOT_PROCESS_FLOW.md 등)
- [ ] 단일 책임 원칙 준수 확인
- [ ] 데이터 소유권 규칙 준수 확인

---

### 10.2 코드 수정 후 체크리스트

- [ ] 함수 길이 100줄 이하 확인
- [ ] 모듈 docstring 추가/수정 (변경 사항 있을 시)
- [ ] 복잡한 계산 로직에 인라인 주석 추가
- [ ] 로그 출력 확인 (log_long_text 사용 등)
- [ ] 에러 처리 추가 (try-except)
- [ ] Git 커밋 메시지 작성 규칙 준수

---

### 10.3 배포 전 필수 테스트

```bash
# 1. 전체 프로세스 실행 테스트
python main.py

# 2. 로그 파일 확인
tail -f trading_system.log

# 3. DB 상태 확인
# - holding_status 테이블: GPT보유비중, GPT목표수익률, GPT목표손절률 확인
# - trades 테이블: 최근 거래 기록 확인

# 4. 에러 발생 여부 확인
grep ERROR trading_system.log
grep CRITICAL trading_system.log
```

---

## 📌 핵심 원칙 요약

### ✅ 반드시 지켜야 할 6가지

1. **🚨 아키텍처 변경 승인**: 주요 아키텍처 변경은 반드시 사용자 승인 후 진행
2. **단일 책임 원칙**: CIO는 전략, Process2는 실행, Process1은 감시
3. **데이터 소유권**: GPT보유비중/목표수익률/손절률은 CIO만 수정
4. **모듈 docstring**: 모든 Python 파일 최상단에 역할 설명 추가
5. **로깅 규칙**: log_long_text, log_section_header 등 헬퍼 함수 사용
6. **파일 구조**: 백업 파일은 docs/archive/, 새 파일은 적절한 패키지 내부

---

### ❌ 절대 하지 말아야 할 6가지

1. ❌ **사용자 승인 없이 주요 아키텍처 변경 (치명적!)**
2. ❌ Process2가 GPT보유비중 수정
3. ❌ 1,000줄 이상 함수/파일 방치
4. ❌ 루트 디렉토리에 백업 파일 생성
5. ❌ 긴 프롬프트를 코드에 하드코딩
6. ❌ 모든 예외를 `except:` + `pass`로 처리

---

## 📚 참고 문서

### 핵심 가이드 (5개)
- [AI자동편입.md](AI자동편입.md) - AI 자동편입 시스템 (듀얼 퍼널, 관심테이블 관리)
- [CIO비중.md](CIO비중.md) - CIO 포트폴리오 비중 관리 (목표 설정, 페르소나)
- [매매판단.md](매매판단.md) - Process2 매매 판단 (프롬프트 자율성, 템플릿)
- [기타기능.md](기타기능.md) - 시스템 개선 (환율, 서킷브레이커, 보고서)
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - 개발 가이드 (이 파일)

### 아키텍처 문서
- [README.md](../README.md) - 프로젝트 전체 개요
- [TRADING_BOT_PROCESS_FLOW.md](architecture/TRADING_BOT_PROCESS_FLOW.md) - 프로세스 전체 흐름도
- [LOG_IMPROVEMENT.md](optimization/LOG_IMPROVEMENT.md) - 로깅 시스템 v2.0 상세
- [OPTIMIZATION_MASTER_PLAN.md](optimization/OPTIMIZATION_MASTER_PLAN.md) - Week 1-6 최적화 계획

---

**📅 최초 작성**: 2025-10-20
**📅 최종 업데이트**: 2025-10-22
**📦 버전**: v1.2
**🔄 주요 변경**: AI 프롬프트 수정 가이드 추가 (Section 6.2.1)
**🔄 다음 업데이트**: 새로운 최적화 작업 완료 시
