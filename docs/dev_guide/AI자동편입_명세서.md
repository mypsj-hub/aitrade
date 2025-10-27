# AI 자동편입 프롬프트 명세서

> **📅 최초 작성**: 2025-10-24
> **📅 최종 업데이트**: 2025-10-24
> **📦 버전**: v1.1
> **🔗 실제 프롬프트 위치**: `data_manager/universe.py` (Line 430~750)

---

## 1. 핵심 철학

### 1.1 듀얼 퍼널 시스템의 본질

**AI 자동편입은 "모멘텀"과 "퀄리티"의 균형을 통한 유망 코인 발굴 시스템입니다.**

```
┌─────────────────────────────────────────┐
│   AI 자동편입 = Dual Funnel System      │
├─────────────────────────────────────────┤
│ 1. Momentum Hunter (모멘텀 사냥꾼)       │
│    → 단기 급등 가능성 포착               │
│                                         │
│ 2. Quality Compounder (품질 컴파운더)   │
│    → 장기 안정 성장 가능성 포착          │
│                                         │
│ 3. AI Final Interview (AI 최종 면접)    │
│    → 데이터 종합 + 자율 판단             │
└─────────────────────────────────────────┘
```

### 1.2 백테스팅 기반 검증 원칙

**모든 판단은 백테스팅 데이터로 검증되어야 합니다.**

- **백테스팅 통과 = 신뢰 가능한 신호**
- **백테스팅 미통과 = 추가 검증 필요**
- **백테스팅 데이터 없음 = AI 최종 면접 강화**

### 1.3 데이터 기반 자율 판단

**AI는 규칙 기반 결정 트리가 아니라 데이터를 종합 분석하는 전문가입니다.**

- ✅ 데이터를 종합적으로 분석
- ✅ 맥락을 고려한 판단
- ✅ 예외 상황 자율 처리
- ❌ 기계적 체크리스트 적용
- ❌ 단일 지표 의존
- ❌ 경직된 규칙 적용

---

## 2. 판단 원칙 (우선순위)

### 2.1 1순위: 듀얼 퍼널 통과 여부

**Momentum Hunter OR Quality Compounder 중 하나라도 통과하면 후보 자격**

#### Momentum Hunter 기준 (단기 급등 포착)
```python
# 1. 거래량 급증 (최근 7일 평균 대비)
volume_surge >= 2.0  # 200% 이상

# 2. 가격 모멘텀 (7일 상승률)
price_change_7d >= 15.0  # 15% 이상

# 3. RSI 과열 회피
rsi_14 < 80  # RSI 80 미만
```

#### Quality Compounder 기준 (장기 안정 성장)
```python
# 1. 안정적 상승 추세 (30일)
price_change_30d >= 10.0  # 10% 이상

# 2. 시총 상위권
market_cap_rank <= 100  # Top 100

# 3. 기술적 지지
above_ma20 = True  # 20일 이동평균선 위
```

### 2.2 2순위: 백테스팅 검증 결과

**백테스팅 통과 = 신뢰도 대폭 상승**

```python
if backtest_passed:
    verification_tier = "VERIFIED"  # 검증 완료
    ai_judgment_weight = 0.7  # AI 판단 70%
else:
    verification_tier = "PARTIAL"  # 부분 검증
    ai_judgment_weight = 0.5  # AI 판단 50%
```

### 2.3 3순위: AI 최종 면접 (종합 분석)

**AI는 다음 데이터를 종합적으로 분석합니다:**

1. **기술적 지표**
   - MA20, MA60, MA120 지지 여부
   - MACD, RSI 추세
   - 거래량 패턴

2. **펀더멘털**
   - 시가총액 순위
   - 거래소 상장 여부
   - 섹터 트렌드

3. **시장 맥락**
   - Fear & Greed Index
   - BTC 도미넌스
   - 전체 시장 흐름

4. **리스크 요소**
   - 유동성 등급
   - 변동성 수준
   - 최근 뉴스/이벤트

### 2.4 판단 우선순위 요약

```
1순위: 듀얼 퍼널 통과 여부
   ↓
2순위: 백테스팅 검증 결과
   ↓
3순위: AI 최종 면접 (종합 분석)
   ↓
최종 결정: verification_tier (VERIFIED, PARTIAL, ALTERNATIVE)
```

---

## 3. 특수 규칙

### 3.1 검증 티어 시스템 ⭐

**3단계 검증 티어로 신뢰도를 표현합니다.**

#### VERIFIED (검증 완료)
```
조건:
- Momentum Hunter 또는 Quality Compounder 통과
- 백테스팅 통과
- AI 최종 면접 긍정적

신뢰도: ★★★★★ (매우 높음)
CIO 존중 의무: 있음 (AI 자동편입 존중 원칙)
```

#### PARTIAL (부분 검증)
```
조건:
- Momentum Hunter 또는 Quality Compounder 통과
- 백테스팅 미통과 또는 데이터 없음
- AI 최종 면접 보통~긍정적

신뢰도: ★★★☆☆ (보통)
CIO 존중 의무: 제한적 (예외적 제외 가능)
```

#### ALTERNATIVE (대안 후보)
```
조건:
- Momentum Hunter 및 Quality Compounder 미통과
- 하지만 AI 최종 면접에서 특별한 이유 발견
- 예: 신규 상장, 특별 이벤트, 섹터 급등

신뢰도: ★★☆☆☆ (낮음)
CIO 존중 의무: 없음 (CIO 자율 판단)
```

### 3.2 이중 편입 방지 규칙

**같은 코인이 관심테이블에 이미 존재하면 추가 금지**

```python
# BEFORE (문제 상황)
if coin in watchlist:
    print("이미 관심 목록에 있음")
    # 하지만 AI 자동편입은 다시 추가 시도 → 이중 편입

# AFTER (해결)
if coin in watchlist:
    print("이미 관심 목록에 있음 - AI 자동편입 스킵")
    continue  # 추가 시도 안 함
```

### 3.3 과도한 편입 방지

**한 번에 너무 많은 코인을 편입하지 않습니다.**

```python
# 최대 편입 제한
MAX_AUTO_ENTRY_PER_RUN = 5

# 우선순위 정렬
1. VERIFIED 티어 우선
2. 백테스팅 수익률 높은 순
3. 모멘텀 점수 높은 순
```

### 3.4 최소 품질 기준

**아무리 모멘텀이 좋아도 최소 품질 기준은 충족해야 합니다.**

```python
# 필수 기준 (하나라도 미충족 시 제외)
✅ 유동성 등급: A ~ C 등급 (D, E 제외)
✅ 시가총액: Top 300 이내
✅ 거래소: 주요 거래소 상장 (Binance, Upbit 등)
✅ RSI: 90 이하 (극단적 과열 회피)
```

---

## 4. 시나리오 라이브러리

### 시나리오 1: Momentum Hunter 통과 + 백테스팅 통과

**상황**:
- 코인: MATIC
- Momentum Hunter: 통과 (거래량 급증 250%, 7일 상승률 22%)
- Quality Compounder: 미통과 (30일 상승률 5%)
- 백테스팅: 통과 (30일 수익률 +18%)
- 시총: Top 50
- 유동성: A등급
- AI 최종 면접: "거래량 급증과 함께 메이저 업데이트 예고. 단기 모멘텀 강함"

**올바른 판단**:
```json
{
  "symbol": "MATIC",
  "verification_tier": "VERIFIED",
  "funnel_passed": "Momentum Hunter",
  "backtest_result": "PASSED",
  "ai_judgment": "STRONG_BUY",
  "reason": "Momentum Hunter 통과 + 백테스팅 검증 완료. 메이저 업데이트 기대감으로 단기 급등 가능성 높음"
}
```

**잘못된 판단**:
```json
❌ "Quality Compounder 미통과로 제외"
→ 이유: Momentum Hunter 통과만으로도 후보 자격 충분
```

---

### 시나리오 2: Quality Compounder 통과 + 백테스팅 미통과

**상황**:
- 코인: AVAX
- Momentum Hunter: 미통과 (거래량 급증 120%, 7일 상승률 8%)
- Quality Compounder: 통과 (30일 상승률 15%, Top 20, MA20 위)
- 백테스팅: 미통과 (데이터 부족)
- 시총: Top 20
- 유동성: A등급
- AI 최종 면접: "안정적 상승 추세. 레이어1 섹터 강세"

**올바른 판단**:
```json
{
  "symbol": "AVAX",
  "verification_tier": "PARTIAL",
  "funnel_passed": "Quality Compounder",
  "backtest_result": "NO_DATA",
  "ai_judgment": "BUY",
  "reason": "Quality Compounder 통과. 백테스팅 데이터 없지만 안정적 상승 추세 확인. 레이어1 섹터 강세 지속"
}
```

**잘못된 판단**:
```json
❌ "백테스팅 미통과로 제외"
→ 이유: Quality Compounder 통과 + AI 최종 면접 긍정적이면 PARTIAL 티어로 편입 가능
```

---

### 시나리오 3: 두 퍼널 모두 통과 + 백테스팅 통과

**상황**:
- 코인: SOL
- Momentum Hunter: 통과 (거래량 급증 300%, 7일 상승률 25%)
- Quality Compounder: 통과 (30일 상승률 40%, Top 10, MA20 위)
- 백테스팅: 통과 (30일 수익률 +35%)
- 시총: Top 10
- 유동성: A등급
- AI 최종 면접: "모멘텀과 퀄리티 모두 확인. 기관 매수세 유입"

**올바른 판단**:
```json
{
  "symbol": "SOL",
  "verification_tier": "VERIFIED",
  "funnel_passed": "BOTH",
  "backtest_result": "PASSED",
  "ai_judgment": "STRONG_BUY",
  "priority": 1,
  "reason": "Dual Funnel 모두 통과 + 백테스팅 검증 완료. 최우선 편입 대상"
}
```

**잘못된 판단**:
```json
❌ "RSI 75로 과열 우려, 관망"
→ 이유: 모든 검증 통과 시 RSI만으로 제외 불가. 종합 판단 필요
```

---

### 시나리오 4: 두 퍼널 모두 미통과 + 특별 이벤트

**상황**:
- 코인: PEPE
- Momentum Hunter: 미통과 (거래량 급증 80%, 7일 상승률 5%)
- Quality Compounder: 미통과 (30일 상승률 2%, Top 150, MA20 아래)
- 백테스팅: 미통과
- 시총: Top 150
- 유동성: B등급
- AI 최종 면접: "밈코인 섹터 전체 급등 시작. Fear & Greed 75. BTC 도미넌스 하락"

**올바른 판단**:
```json
{
  "symbol": "PEPE",
  "verification_tier": "ALTERNATIVE",
  "funnel_passed": "NONE",
  "backtest_result": "FAILED",
  "ai_judgment": "SPECULATIVE_BUY",
  "reason": "Dual Funnel 미통과지만 밈코인 섹터 전체 급등 시작. 단기 투기적 기회 포착"
}
```

**잘못된 판단**:
```json
❌ "Dual Funnel 미통과로 자동 제외"
→ 이유: AI 최종 면접에서 특별한 이유가 있으면 ALTERNATIVE 티어로 편입 가능
```

---

### 시나리오 5: Momentum Hunter 통과 + 극단적 과열

**상황**:
- 코인: SHIB
- Momentum Hunter: 통과 (거래량 급증 500%, 7일 상승률 60%)
- Quality Compounder: 미통과
- 백테스팅: 통과 (하지만 변동성 매우 높음)
- 시총: Top 30
- 유동성: B등급
- RSI: 92 (극단적 과열)
- AI 최종 면접: "밈코인 광풍. 하지만 RSI 92로 조정 임박 가능성"

**올바른 판단**:
```json
{
  "symbol": "SHIB",
  "verification_tier": "NONE",
  "funnel_passed": "Momentum Hunter (but extreme overbought)",
  "backtest_result": "PASSED",
  "ai_judgment": "HOLD",
  "reason": "Momentum Hunter 통과지만 RSI 92로 극단적 과열. 조정 대기 후 재평가"
}
```

**잘못된 판단**:
```json
❌ "Momentum Hunter 통과 + 백테스팅 통과로 VERIFIED 편입"
→ 이유: 최소 품질 기준 (RSI < 90) 미충족. AI 최종 면접에서 제외 가능
```

---

### 시나리오 6: Quality Compounder 통과 + 유동성 D등급

**상황**:
- 코인: ALCX
- Momentum Hunter: 미통과
- Quality Compounder: 통과 (30일 상승률 20%, Top 250, MA20 위)
- 백테스팅: 통과
- 시총: Top 250
- 유동성: D등급 (거래량 매우 낮음)
- AI 최종 면접: "DeFi 섹터 강세. 하지만 유동성 부족으로 슬리피지 우려"

**올바른 판단**:
```json
{
  "symbol": "ALCX",
  "verification_tier": "NONE",
  "funnel_passed": "Quality Compounder (but low liquidity)",
  "backtest_result": "PASSED",
  "ai_judgment": "SKIP",
  "reason": "Quality Compounder 통과지만 유동성 D등급. 최소 품질 기준 미충족"
}
```

**잘못된 판단**:
```json
❌ "Quality Compounder 통과 + 백테스팅 통과로 VERIFIED 편입"
→ 이유: 최소 품질 기준 (유동성 A~C 등급) 미충족
```

---

### 시나리오 7: 이미 관심테이블에 존재

**상황**:
- 코인: LINK
- 관심테이블: 이미 존재 (added_date: 2025-10-20)
- Momentum Hunter: 통과
- Quality Compounder: 통과
- 백테스팅: 통과
- AI 최종 면접: "모든 조건 완벽"

**올바른 판단**:
```json
{
  "symbol": "LINK",
  "action": "SKIP",
  "reason": "이미 관심테이블에 존재 (2025-10-20 편입). 이중 편입 방지"
}
```

**잘못된 판단**:
```json
❌ "조건 완벽하므로 VERIFIED로 재편입"
→ 이유: 이중 편입 방지 규칙 위배
```

---

### 시나리오 8: 5개 초과 후보 발견

**상황**:
- 후보: 8개 코인 발견
- VERIFIED: 3개 (SOL, MATIC, AVAX)
- PARTIAL: 3개 (NEAR, FTM, ATOM)
- ALTERNATIVE: 2개 (PEPE, SHIB)
- 최대 편입 제한: 5개

**올바른 판단**:
```json
{
  "action": "PRIORITY_SORT",
  "selected": [
    {"symbol": "SOL", "tier": "VERIFIED", "priority": 1},
    {"symbol": "MATIC", "tier": "VERIFIED", "priority": 2},
    {"symbol": "AVAX", "tier": "VERIFIED", "priority": 3},
    {"symbol": "NEAR", "tier": "PARTIAL", "priority": 4},
    {"symbol": "FTM", "tier": "PARTIAL", "priority": 5}
  ],
  "skipped": ["ATOM", "PEPE", "SHIB"],
  "reason": "최대 편입 제한 5개. VERIFIED 우선, 다음 PARTIAL 백테스팅 수익률 순"
}
```

**잘못된 판단**:
```json
❌ "8개 모두 편입"
→ 이유: 과도한 편입 방지 규칙 위배
```

---

### 시나리오 9: 백테스팅 데이터 충돌

**상황**:
- 코인: ARB
- Momentum Hunter: 통과
- Quality Compounder: 통과
- 백테스팅 결과: 30일 수익률 -5% (손실)
- 현재 기술적 지표: 모두 긍정적
- AI 최종 면접: "레이어2 섹터 급등 시작. 과거 백테스팅과 현재 상황 다름"

**올바른 판단**:
```json
{
  "symbol": "ARB",
  "verification_tier": "PARTIAL",
  "funnel_passed": "BOTH",
  "backtest_result": "FAILED",
  "ai_judgment": "CAUTIOUS_BUY",
  "reason": "Dual Funnel 통과지만 백테스팅 손실. 현재 섹터 급등 고려하여 PARTIAL 티어 편입. 모니터링 강화"
}
```

**잘못된 판단**:
```json
❌ "백테스팅 손실로 자동 제외"
→ 이유: 백테스팅은 과거 데이터. 현재 맥락을 고려한 종합 판단 필요

❌ "현재 지표 좋으므로 VERIFIED 편입"
→ 이유: 백테스팅 손실 시 VERIFIED 불가. 최대 PARTIAL
```

---

### 시나리오 10: 신규 상장 코인 (백테스팅 데이터 없음)

**상황**:
- 코인: ARB (신규 상장 3일차)
- Momentum Hunter: 통과 (거래량 급증 1000%, 3일 상승률 50%)
- Quality Compounder: 판단 불가 (30일 데이터 없음)
- 백테스팅: 데이터 없음
- 시총: 즉시 Top 50 진입
- 유동성: A등급
- AI 최종 면접: "Arbitrum 메인넷 출시. Ethereum L2 기대감. 하지만 신규 상장 변동성 매우 높음"

**올바른 판단**:
```json
{
  "symbol": "ARB",
  "verification_tier": "ALTERNATIVE",
  "funnel_passed": "Momentum Hunter (신규 상장)",
  "backtest_result": "NO_DATA",
  "ai_judgment": "SPECULATIVE_BUY",
  "reason": "신규 상장으로 백테스팅 불가. Momentum Hunter 통과 + L2 기대감. 단, 신규 상장 변동성 리스크. ALTERNATIVE 티어로 소량 편입"
}
```

**잘못된 판단**:
```json
❌ "백테스팅 데이터 없으므로 제외"
→ 이유: 신규 상장은 예외 처리. AI 최종 면접 강화하여 판단

❌ "Momentum Hunter 통과로 VERIFIED 편입"
→ 이유: 백테스팅 없으면 VERIFIED 불가. 최대 ALTERNATIVE
```

---

## 5. 금지 사항

### 5.1 절대 금지

#### ❌ 단일 지표만으로 제외 결정
```python
# 잘못된 예시
if liquidity_grade == "B":
    return "제외"  # 유동성 등급만으로 제외 ❌
```

#### ❌ Dual Funnel 통과 코인을 예외 없이 제외
```python
# 잘못된 예시
if backtest_result == "FAILED":
    return "제외"  # Momentum Hunter 통과 무시 ❌
```

#### ❌ 기계적 체크리스트 적용
```python
# 잘못된 예시
checklist = [
    "MA20 위",
    "RSI < 70",
    "거래량 증가",
    "시총 Top 100"
]
if not all(checklist):
    return "제외"  # 맥락 무시한 기계적 판단 ❌
```

### 5.2 철학 위배 사례

#### ❌ "명시적 조건"만으로 판단
```
잘못된 프롬프트 예시:
"RSI > 70이면 무조건 제외"
"시총 Top 100 밖이면 무조건 제외"
"유동성 B등급이면 무조건 제외"

→ 이유: AI의 자율 판단 박탈. 규칙 기반 결정 트리로 전락
```

#### ❌ AI 최종 면접 무시
```
잘못된 프롬프트 예시:
"Momentum Hunter 통과하면 자동 편입"
"백테스팅 통과하면 VERIFIED 확정"

→ 이유: AI 최종 면접 (종합 분석) 생략. 맥락 무시
```

#### ❌ 과거 데이터만 의존
```
잘못된 프롬프트 예시:
"백테스팅 손실이면 현재 지표 무시하고 제외"

→ 이유: 과거와 현재 시장 상황이 다를 수 있음
```

### 5.3 허용되는 예외

#### ✅ 최소 품질 기준은 엄격 적용
```python
# 허용됨
if liquidity_grade in ["D", "E"]:
    return "제외 (최소 품질 기준 미충족)"

if rsi > 90:
    return "제외 (극단적 과열)"
```

#### ✅ 이중 편입 방지는 자동 처리
```python
# 허용됨
if symbol in watchlist:
    return "스킵 (이중 편입 방지)"
```

---

## 6. 검증 체크리스트

### 6.1 프롬프트 수정 후 필수 확인

#### ✅ Test 1: Dual Funnel 존중 확인
```
동일한 조건으로 5회 반복 테스트:
- Momentum Hunter 통과 → 편입 후보 선정 (일관성 100%)
- Quality Compounder 통과 → 편입 후보 선정 (일관성 100%)
```

#### ✅ Test 2: 백테스팅 가중치 확인
```
백테스팅 통과 vs 미통과 비교:
- 통과 → VERIFIED 티어
- 미통과 → PARTIAL 또는 ALTERNATIVE 티어
```

#### ✅ Test 3: AI 최종 면접 작동 확인
```
Dual Funnel 미통과 + 특별 이벤트:
- AI가 맥락을 고려하여 ALTERNATIVE 티어 판단
- 단순 자동 제외 안 함
```

#### ✅ Test 4: 최소 품질 기준 확인
```
유동성 D등급 or RSI 92:
- 다른 조건 완벽해도 제외 (일관성 100%)
```

#### ✅ Test 5: 이중 편입 방지 확인
```
이미 관심테이블 존재:
- 재편입 시도 안 함 (일관성 100%)
```

### 6.2 일관성 테스트 시나리오

**시나리오 A: MATIC (Momentum Hunter 통과)**
```
5회 반복 테스트 결과:
1회: VERIFIED 편입 ✅
2회: VERIFIED 편입 ✅
3회: VERIFIED 편입 ✅
4회: VERIFIED 편입 ✅
5회: VERIFIED 편입 ✅

→ 일관성 100% 확인
```

**시나리오 B: ALCX (유동성 D등급)**
```
5회 반복 테스트 결과:
1회: 제외 (유동성 D등급) ✅
2회: 제외 (유동성 D등급) ✅
3회: 제외 (유동성 D등급) ✅
4회: 제외 (유동성 D등급) ✅
5회: 제외 (유동성 D등급) ✅

→ 일관성 100% 확인
```

**시나리오 C: PEPE (Dual Funnel 미통과 + 밈코인 섹터 급등)**
```
5회 반복 테스트 결과:
1회: ALTERNATIVE 편입 (섹터 급등) ✅
2회: ALTERNATIVE 편입 (섹터 급등) ✅
3회: 제외 (리스크 과다) ⚠️ (AI 판단 차이)
4회: ALTERNATIVE 편입 (섹터 급등) ✅
5회: ALTERNATIVE 편입 (섹터 급등) ✅

→ 일관성 80% (허용 범위)
→ AI 최종 면접의 자율 판단 작동 확인
```

### 6.3 철학 위배 여부 확인

#### ❌ 철학 위배 시그널
```
"RSI 75이므로 자동 제외"
"시총 Top 100 밖이므로 무조건 제외"
"백테스팅 미통과로 즉시 제외"

→ 즉시 프롬프트 수정 필요
```

#### ✅ 철학 부합 시그널
```
"Momentum Hunter 통과. 백테스팅 손실 있지만 현재 섹터 급등 고려하여 PARTIAL 티어 편입"
"Quality Compounder 통과. 유동성 B등급이지만 메이저 코인으로 리스크 낮음. VERIFIED 편입"

→ 데이터 종합 분석 + 맥락 고려 확인
```

---

## 7. 수정 이력

### 2025-10-24 (v1.1) - Fix 1: CIO 관리 코인 제외 로직 추가

**변경 내용**: AI 자동편입 시 CIO가 이미 관리 중인 코인을 후보에서 제외하는 로직 추가

**배경**:
- AI 자동편입과 CIO의 역할 중복 문제 발견
- AI 자동편입: 신규 유망 코인 발굴
- CIO: 기존 포트폴리오 관리 및 최적화
- 문제: AI 자동편입이 CIO가 이미 관리 중인 코인을 다시 검증하여 리소스 낭비

**해결 방안**:

1. **역할 명확화**
   ```python
   AI 자동편입: 신규 유망 코인 발굴 (CIO 미관리 코인만)
   CIO: 기존 포트폴리오 관리 (편입된 코인 비중 조정)
   ```

2. **구현 위치**: `data_manager/universe.py` (Line 430-470)
   ```python
   # CIO 관리 중인 코인 조회 (활성 + 관망)
   cio_managed = db_manager.get_active_coins()

   # 제외 로직
   candidates = [coin for coin in all_coins if coin not in cio_managed]

   logger.info(f"🔍 [AI자동편입 제외 로직] CIO 관리 중인 코인: {len(cio_managed)}개")
   logger.info(f"📋 AI 자동편입 후보: {len(candidates)}개")
   ```

3. **관련 코드 수정**:
   - `data_manager/universe.py`: Line 430-470 (제외 로직 추가)
   - `data_manager/database.py`: `get_active_coins()` 메서드 활용

4. **효과**:
   - ✅ 역할 분리 명확화: AI 자동편입 = 신규 발굴, CIO = 기존 관리
   - ✅ 리소스 절약: 중복 검증 제거 (API 비용 절감)
   - ✅ 시스템 일관성 향상: 각 모듈의 책임 명확화
   - ✅ 로그 가독성 향상: 디버깅 로그로 제외 과정 투명화

5. **검증 결과**:
   - 실행 로그: "🔍 [AI자동편입 제외 로직] CIO 관리 중인 코인: 8개"
   - 동작 확인: CIO 관리 코인이 AI 자동편입 후보에서 제외됨
   - 일관성 확인: 5회 연속 실행 시 동일한 결과 유지

---

### 2025-10-24 (v1.0)

**변경 내용**: 최초 명세서 작성

**배경**:
- AI 자동편입 프롬프트의 일관성 문제 발견
- 같은 조건에서 다른 판단이 나오는 경우 발생
- "명시적 조건" 추가 → "자율 판단" 철학 위배 → 다시 제거 반복

**해결 방안**:
1. **핵심 철학 명확화**
   - Dual Funnel System의 본질 정의
   - 백테스팅 기반 검증 원칙 확립
   - 데이터 기반 자율 판단 강조

2. **판단 원칙 우선순위 정립**
   - 1순위: Dual Funnel 통과 여부
   - 2순위: 백테스팅 검증 결과
   - 3순위: AI 최종 면접 (종합 분석)

3. **검증 티어 시스템 도입**
   - VERIFIED: 3단계 검증 완료
   - PARTIAL: 부분 검증
   - ALTERNATIVE: 대안 후보

4. **시나리오 라이브러리 구축**
   - 10개 시나리오로 구체적 판단 기준 제시
   - 올바른 판단 vs 잘못된 판단 명시

5. **검증 체크리스트 수립**
   - 5개 필수 테스트
   - 일관성 테스트 시나리오
   - 철학 위배 여부 확인

**기대 효과**:
- AI 자동편입의 일관성 향상
- CIO와의 신뢰 관계 강화 (VERIFIED 티어 존중)
- 프롬프트 수정 시 가이드라인 제공

---

## 8. 관심 코인 생명주기 관리 (2025-10-25 추가)

### 8.1 관심 코인(coin_watch_history) 개요

**coin_watch_history 테이블의 역할**:
- AI 자동편입 3-4순위 코인 저장 (관심 대기)
- CIO 평가 대상 코인 풀 확장
- 실제 매수는 안 되며, CIO 승격 대기 상태

### 8.2 관심 코인 등록 조건

**등록 시점**: AI 자동편입 실행 시, 3-4순위로 선정된 코인

**코드 위치**: `data_manager/universe.py` Lines 717-737

```python
# 3-4순위 처리 (coin_watch_history에 '관심' 등록)
for i, candidate in enumerate(top_4_coins[2:4], start=3):
    symbol = candidate['symbol']

    # [이중 편입 방지] holding_status에 이미 활성 상태로 있으면 스킵
    existing_holding = db_manager.get_holding_status(symbol)
    if existing_holding and existing_holding.get('관리상태') == '활성':
        logger.info(f"⚠️ [{i}순위] {symbol}: 이미 holding_status에 활성 상태로 존재, 관심테이블 등록 스킵")
        continue

    # coin_watch_history에 저장
    db_manager.upsert_coin_watch_history(symbol, rank=i, funnel_type, score)
    logger.info(f"✅ [{i}순위] {symbol}: '관심' 상태로 coin_watch_history에 등록")
```

**등록 조건**:
- ✅ AI 자동편입 3-4순위로 선정됨
- ✅ holding_status에 '활성' 상태로 없음 (이중 편입 방지)

### 8.3 관심 코인 삭제 경로 (총 2가지)

#### 경로 1: AI 자동편입 1-2순위 승격 시 삭제

**시점**: AI 자동편입 실행 시, 관심 코인이 1-2순위로 재선정됨

**코드 위치**: `data_manager/universe.py` Lines 711-715

```python
# 1-2순위 처리 (holding_status에 '활성' 등록)
for i, candidate in enumerate(top_4_coins[:2], start=1):
    symbol = candidate['symbol']

    # holding_status에 '활성' 등록
    db_manager.update_holding_status(symbol, {'관리상태': '활성', 'GPT보유비중': 0})

    # [이중 편입 방지] 관심테이블에 있으면 삭제 (승격 처리)
    watchlist_coins = db_manager.get_watchlist_coins()
    if any(w['코인이름'] == symbol for w in watchlist_coins):
        db_manager.delete_from_watchlist(symbol)
        logger.info(f"   ↳ 관심테이블에서 삭제 (1-2순위 승격)")
```

**삭제 조건**:
- ✅ AI 자동편입에서 1-2순위로 선정됨
- ✅ holding_status에 '활성' 등록과 동시에 coin_watch_history에서 삭제

---

#### 경로 2: CIO 평가 완료 후 승격 또는 제외 시 삭제 ⭐ (2025-10-25 개선)

**시점**: CIO 포트폴리오 재구성 완료 후, 관심 종목 정리 단계

**코드 위치**: `ai_strategy/cio.py` Lines 2548-2587

**개선 전 (버그)**:
```python
# CIO가 이 코인을 '활성'으로 승격시켰는지 확인
if symbol in coin_weights_to_db and coin_weights_to_db[symbol] > 0:
    # 승격: holding_status 등록 + coin_watch_history 삭제
else:
    logger.info(f"⏭️ {symbol}: 승격 보류 → coin_watch_history에 유지")
    # ⚠️ 문제: CIO가 0% 비중 할당 시 coin_watch_history에서 삭제 안 됨!
```

**문제점**:
- CIO가 관심 코인을 분석했지만 **0% 비중으로 결정**하면 삭제되지 않음
- 결과: holding_status와 coin_watch_history에 동시 존재하는 "이중 편입" 발생
- 예시: LA, PROVE가 holding_status '활성' + coin_watch_history에 모두 존재

**개선 후 (2025-10-25)**:
```python
# CIO가 이 코인을 평가했는지 확인
if symbol in coin_weights_to_db:
    # 비중 > 0%: 승격 (holding_status '활성' 등록 + coin_watch_history 삭제)
    if coin_weights_to_db[symbol] > 0:
        logger.info(f"✅ {symbol}: '활성'으로 승격 (비중 {coin_weights_to_db[symbol]:.1f}%)")

        # holding_status에 등록
        db_manager.update_holding_status(symbol, {
            '관리상태': '활성',
            'GPT보유비중': coin_weights_to_db[symbol],
            # ...
        })

        # coin_watch_history에서 삭제
        db_manager.delete_from_watchlist(symbol)

    # 비중 = 0%: 제외 판단 (coin_watch_history 삭제 + holding_status '제외' 상태)
    else:
        logger.info(f"❌ {symbol}: CIO 제외 판단 (0% 비중) → coin_watch_history에서 삭제")

        # coin_watch_history에서 삭제
        db_manager.delete_from_watchlist(symbol)

        # holding_status에 있으면 '제외' 상태로 변경
        existing_holding = db_manager.get_holding_status(symbol)
        if existing_holding:
            db_manager.update_holding_status(symbol, {'관리상태': '제외'})
            logger.info(f"   ↳ holding_status '제외' 상태로 변경")
else:
    # CIO가 분석하지 않은 코인 (이론상 발생 안 함)
    logger.warning(f"⚠️ {symbol}: CIO 분석 대상 아님 → coin_watch_history에 유지")
```

**개선 효과**:
- ✅ CIO가 0% 비중 결정 시 coin_watch_history에서 삭제됨
- ✅ holding_status '제외' 상태로 변경하여 재편입 방지
- ✅ 이중 편입 문제 완전 해결
- ✅ 관심 코인 자동 정리 기능 강화

**삭제 조건 (개선 후)**:
- ✅ CIO가 이 코인을 평가함 (`symbol in coin_weights_to_db`)
- ✅ **비중 > 0%**: 승격 → holding_status 등록 + coin_watch_history 삭제
- ✅ **비중 = 0%**: 제외 → coin_watch_history 삭제 + holding_status '제외' 상태

### 8.4 관심 코인 삭제 플로우차트

```
┌─────────────────────────────────────────────────────────────┐
│ 관심 코인(coin_watch_history) 삭제 경로                      │
└─────────────────────────────────────────────────────────────┘

경로 1: AI 자동편입 1-2순위 승격
┌──────────────────┐
│ AI 자동편입 실행  │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ 1-2순위로 선정된 코인 확인            │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ holding_status에 '활성' 등록          │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ ✅ coin_watch_history에서 삭제        │
└──────────────────────────────────────┘

경로 2: CIO 평가 완료 후 (2025-10-25 개선)
┌──────────────────┐
│ CIO 실행 완료     │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ coin_watch_history 코인 조회          │
└────────┬─────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────┐
│ CIO가 이 코인을 평가했는가?           │
│ (symbol in coin_weights_to_db)       │
└────────┬─────────────────────────────┘
         │ Yes
         ↓
┌──────────────────────────────────────┐
│ 비중 > 0% ?                          │
└────┬─────────────────────────┬───────┘
     │ Yes                     │ No (0%)
     ↓                         ↓
┌─────────────────┐    ┌─────────────────────┐
│ 승격 처리       │    │ 제외 처리 ⭐ (신규)  │
├─────────────────┤    ├─────────────────────┤
│ • holding_status│    │ • coin_watch_history│
│   '활성' 등록   │    │   삭제              │
│ • coin_watch_   │    │ • holding_status    │
│   history 삭제  │    │   '제외' 상태       │
└─────────────────┘    └─────────────────────┘
```

### 8.5 주요 개선 사항 요약

| 항목 | 개선 전 | 개선 후 (2025-10-25) |
|-----|--------|---------------------|
| **CIO 0% 비중 코인** | coin_watch_history에 영구 잔류 ❌ | coin_watch_history에서 삭제 ✅ |
| **holding_status 상태** | '활성' 유지 (이중 편입) ❌ | '제외' 상태로 변경 ✅ |
| **삭제 조건** | `비중 > 0%` (엄격) | `CIO가 평가함` (완화) ✅ |
| **로그 메시지** | "승격 보류 → 유지" | "CIO 제외 판단 → 삭제" ✅ |
| **이중 편입 방지** | 불완전 ❌ | 완전 해결 ✅ |

### 8.6 관련 문서

- **상세 분석 리포트**: [docs/prompts_log/관심코인_삭제_로직_분석.md](../prompts_log/관심코인_삭제_로직_분석.md)
- **수정 이력**: [docs/dev_guide/트레이딩봇_수정이력.md](트레이딩봇_수정이력.md) (Section 추가 예정)

---

**📅 최종 업데이트**: 2025-10-27
**📦 버전**: v1.3
**📦 작성자**: AI Trading Bot Team

---

## 9. 3-4순위 보존 로직 (2025-10-27 추가)

### 9.1 문제 상황

**증상**: AI가 3개 코인 선정 → 퀀트 검증 후 2개만 남음

**원인 분석**:
```python
# market_analysis.py Line 1458 (수정 전)
# 퀀트 검증 로직이 2순위를 수정하면서 3-4순위를 덮어씀
final_selection = [ai_pick, new_quant]  # 3-4순위 손실! ❌
```

**영향**:
- AI 선정 3-4순위 코인이 coin_watch_history에 등록되지 않음
- 듀얼 퍼널 시스템의 후보 풀 축소
- 긴급도 모니터링 대상 감소

### 9.2 해결 방안

#### 핵심 원칙
**"퀀트 검증은 1-2순위만 조정, 3-4순위는 항상 보존"**

#### 구현 로직 (market_analysis.py Line 1458-1497)

```python
# [Fix] 3-4순위 보존을 위해 별도 저장
remaining_ranks = final_selection[2:] if len(final_selection) > 2 else []

# 경우 1: AI와 퀀트가 동일한 코인 선택 (중복)
if ai_pick == quant_pick:
    # 중복 제거 후 2순위 선정
    verified_coins_no_dup = [c for c in verified_partial if c != ai_pick]
    if verified_coins_no_dup:
        new_quant = verified_coins_no_dup[0]  # Sharpe 2위

        # [Fix] 3-4순위와 중복 체크
        if new_quant in remaining_ranks:
            logger.warning(f"⚠️ 신규 퀀트 선택 {new_quant}가 3-4순위에 있음 → 3-4순위에서 제거")
            remaining_ranks = [r for r in remaining_ranks if r != new_quant]

        final_selection = [ai_pick, new_quant] + remaining_ranks  # ✅ 3-4순위 보존

# 경우 2: 퀀트 선택이 Sharpe 1위가 아님 (규칙 위반)
elif quant_pick != top_sharpe and ai_pick != top_sharpe:
    # Sharpe 1위를 강제 선택
    if top_sharpe in remaining_ranks:
        logger.warning(f"⚠️ Sharpe 1위 {top_sharpe}가 3-4순위에 있음 → 3-4순위에서 제거")
        remaining_ranks = [r for r in remaining_ranks if r != top_sharpe]

    final_selection = [ai_pick, top_sharpe] + remaining_ranks  # ✅ 3-4순위 보존

# 경우 3: AI가 Sharpe 1위를 선택했고, 퀀트도 동일
elif ai_pick == top_sharpe and quant_pick == top_sharpe:
    # Sharpe 2위를 2순위로 선택
    if second_sharpe in remaining_ranks:
        logger.warning(f"⚠️ Sharpe 2위 {second_sharpe}가 3-4순위에 있음 → 3-4순위에서 제거")
        remaining_ranks = [r for r in remaining_ranks if r != second_sharpe]

    final_selection = [ai_pick, second_sharpe] + remaining_ranks  # ✅ 3-4순위 보존
```

### 9.3 핵심 개선 사항

| 항목 | 개선 전 | 개선 후 (2025-10-27) |
|-----|--------|---------------------|
| **3-4순위 보존** | 퀀트 검증 시 손실 ❌ | 모든 경우에 보존 ✅ |
| **중복 체크** | 없음 ❌ | 1-2순위와 중복 시 3-4순위에서 제거 ✅ |
| **로직 복잡도** | 단순 (버그 존재) | 복잡 (안전성 향상) ✅ |
| **코인 등록** | 2개만 등록 | 최대 4개 등록 ✅ |

### 9.4 검증 결과

**테스트 시나리오** (AI자동편입_20251027_150736.txt):
```
AI 선택: ['ENA', 'TOSHI', 'PUMP']
퀀트 검증: TOSHI → WLFI (Sharpe Ratio 높음)
최종 결과: ['ENA', 'WLFI', 'PUMP']  ✅

1-2순위 (ENA, WLFI) → holding_status '활성' 등록
3순위 (PUMP) → coin_watch_history '관심' 등록  ✅
```

**기대 효과**:
- ✅ 듀얼 퍼널 시스템의 후보 풀 완전 활용
- ✅ 긴급도 모니터링 대상 증가
- ✅ AI 판단 존중 (3-4순위도 의미 있는 선택)

### 9.5 프롬프트 명확성 개선 (동시 수행)

#### STEP 2 "기계적" 의미 명확화

**System Prompt (Line 630-633)**:
```
- **IF (남아있음)**: 필터링 후 남아있는 VERIFIED/PARTIAL 코인 중
  **Sharpe Ratio가 가장 높은 코인**을 2순위로 기계적으로 선정합니다.
  ⚠️ **중요**: "기계적"이란 AI 판단 없이 Sharpe 수치만으로 결정한다는 의미입니다.
  - 예: WLFI(Sharpe 13.36) vs TOSHI(Sharpe 13.02) → 무조건 WLFI 선택
```

**User Prompt (Line 985)**:
```
⚠️ **중요**: "기계적"이란 AI 판단 없이 Sharpe 수치만으로 결정한다는 의미입니다.
예: WLFI(Sharpe 13.36) vs TOSHI(Sharpe 13.02) → 무조건 WLFI 선택
```

#### 시장 국면 출처 명확화 (Line 1126-1131)

```python
- **시장 국면**: {market_phase} (Process1 추세 분석 결과)
- **시장 상황 해석**:
  * 시장 국면 '{market_phase}' → **System Prompt의 "시장 국면별 전략 조정" 매트릭스 우선 확인**
  * ⚠️ 주의: 시장 국면(Process1 분석)은 공포탐욕지수와 다른 독립적인 지표입니다
```

### 9.6 관련 파일 및 Line 번호

| 파일 | Line | 내용 |
|-----|------|------|
| `ai_strategy/market_analysis.py` | 630-633 | System Prompt STEP 2 강화 |
| `ai_strategy/market_analysis.py` | 985 | User Prompt STEP 2 강화 |
| `ai_strategy/market_analysis.py` | 1126-1131 | 시장 국면 출처 명확화 |
| `ai_strategy/market_analysis.py` | 1458-1497 | 3-4순위 보존 로직 |

---
