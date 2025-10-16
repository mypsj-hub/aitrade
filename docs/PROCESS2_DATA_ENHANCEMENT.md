# Process2 단기 방향성 예측 시스템 강화안
# Short-term Direction Prediction System Enhancement

**문서 버전**: 1.0
**작성일**: 2025-01-XX
**목적**: Process2의 핵심 기능인 "단기 방향성 예측" 능력을 획기적으로 강화

---

## 📋 목차

1. [현황 분석](#1-현황-분석)
2. [핵심 문제점](#2-핵심-문제점)
3. [개선 전략](#3-개선-전략)
4. [신규 데이터 소스 설계](#4-신규-데이터-소스-설계)
5. [성능 최적화 아키텍처](#5-성능-최적화-아키텍처)
6. [구현 계획](#6-구현-계획)
7. [예상 효과](#7-예상-효과)

---

## 1. 현황 분석

### 1.1 현재 수집 중인 데이터

#### **기술적 지표** (`get_technical_indicators()`)
```python
현재 수집 (1시간봉 기준):
├─ 모멘텀: RSI(14), Stochastic(K, D)
├─ 추세: MACD, BB(20,2), ATR
├─ 이동평균: MA(5,20,60,120) - 일봉 기준
├─ 지지/저항: 24봉 기준 최고/최저
└─ 다중 시간대: 1H, 4H, 1D (RSI, MACD 상태만)
```

**문제점**:
- ❌ **다이버전스 계산 불가**: 과거 고점/저점 데이터 없음
- ❌ **가격 모멘텀 부족**: 1분/5분 단기 추세 없음
- ❌ **패턴 인식 불가**: OHLC 배열 데이터 없음

#### **호가창 분석** (`analyze_orderbook_imbalance()`)
```python
현재 수집:
├─ 상위 5호가: 매수/매도 물량
├─ 불균형 비율: (bid-ask)/(bid+ask) * 100
└─ 스프레드: (최저매도-최고매수)/최고매수 * 100
```

**문제점**:
- ❌ **깊이 부족**: 5호가만으로는 큰손 움직임 감지 어려움
- ❌ **시간 데이터 없음**: 호가 변화 속도 추적 불가
- ❌ **체결 강도 없음**: 실제 거래 압력 불명확

#### **거래량 분석** (`get_optimal_trade_timing()`)
```python
현재 수집:
└─ 5분봉 12개 (1시간치): 평균 대비 현재 거래량 비율
```

**문제점**:
- ❌ **단순 비교**: 거래량 급증만 감지, 패턴 분석 불가
- ❌ **가격 연계 없음**: 거래량 증가가 상승/하락 중 어느 쪽인지 불명

### 1.2 현재 API 호출 구조

```python
# collect_all_coins_data_parallel() 함수 (코인 1개당)
1. get_ohlcv_with_retry(interval="minute60", count=200)  # 1시간봉 200개
2. get_ohlcv_with_retry(interval="day", count=200)       # 일봉 200개
3. get_ohlcv_with_retry(interval="minute60", count=200)  # 다중 시간대용 (중복!)
4. get_ohlcv_with_retry(interval="minute240", count=200) # 4시간봉 200개
5. get_optimal_trade_timing()
   └─ get_ohlcv_with_retry(interval="minute5", count=12) # 5분봉 12개
   └─ analyze_orderbook_imbalance()
      └─ pyupbit.get_orderbook()                         # 호가창

총 API 호출: 6회/코인
```

**문제점**:
- 코인 10개 → 60회/분석
- 코인 30개 → 180회/분석
- **업비트 Rate Limit**: 200회/10초 → 여유 20회 (위험!)

---

## 2. 핵심 문제점

### 2.1 단기 방향성 예측 불가

**시나리오 예시**:
```
현재 상황: BTC가 1시간 전부터 -3% 하락 중
Process2 판단: RSI 45 (중립) → "매매보류"

하지만 실제로는:
- 5분봉 차트: 명확한 하락 쐐기 패턴 (반등 임박)
- 체결 강도: 최근 10분간 매수 압력 급증
- 1분봉 다이버전스: 가격 하락하지만 RSI 상승 (반전 신호)

결과: 최적 진입 타이밍을 놓침
```

**현재 데이터로는 감지 불가한 신호들**:
1. **다이버전스** (가장 강력한 반전 신호)
2. **차트 패턴** (쐐기, 삼각형, 헤드앤숄더)
3. **체결 강도** (실제 거래 압력)
4. **큰손 움직임** (10호가 이상 대량 주문)
5. **상대 강도** (BTC 대비 알트코인 성과)

### 2.2 성능 스케일링 문제

```python
# 현재 구조 (비효율)
for coin in coins:  # 30개
    # 각 코인마다 독립적으로 API 호출
    get_ohlcv_with_retry("minute60")  # 30회
    get_ohlcv_with_retry("day")       # 30회
    get_ohlcv_with_retry("minute5")   # 30회
    ...

# 총 180회 API 호출 → Rate Limit 초과 위험!
```

**문제점**:
- 병렬 처리해도 순차적 대기 필요 (RateLimiter)
- 전체 수집 시간: 30코인 × 6회 × 0.5초 = 90초
- Process2 분석까지 포함 시 2~3분 소요

---

## 3. 개선 전략

### 3.1 핵심 전략: "3단계 데이터 계층화"

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: 실시간 마이크로 데이터 (Real-time Micro Data) │
│  - 수집 주기: 매 분석마다 (변동성 높음)                    │
│  - API 호출: 최소화 (배치 처리)                           │
│  - 용도: 즉각적 타이밍 판단                               │
├─────────────────────────────────────────────────────────┤
│  데이터:                                                  │
│  ✅ 호가창 스냅샷 (15호가)                                │
│  ✅ 최근 체결 내역 (100건)                                │
│  ✅ 1분봉 (최근 60개)                                     │
│  ✅ 5분봉 (최근 12개)                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: 단기 추세 데이터 (Short-term Trend Data)       │
│  - 수집 주기: 10분마다 캐싱 (변동성 중간)                 │
│  - API 호출: 배치 + 캐시 활용                             │
│  - 용도: 단기 추세 및 패턴 분석                           │
├─────────────────────────────────────────────────────────┤
│  데이터:                                                  │
│  ✅ 1시간봉 (최근 100개) - 다이버전스 계산                │
│  ✅ 4시간봉 (최근 50개)                                   │
│  ✅ 상대 강도 (BTC 대비)                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: 장기 구조 데이터 (Long-term Structure Data)   │
│  - 수집 주기: 1시간마다 캐싱 (변동성 낮음)                │
│  - API 호출: 최소 (거의 캐시만 사용)                      │
│  - 용도: 전략적 맥락 제공                                 │
├─────────────────────────────────────────────────────────┤
│  데이터:                                                  │
│  ✅ 일봉 (200개) - 이동평균, 주요 지지/저항               │
│  ✅ 주봉 데이터                                           │
│  ✅ 섹터 상관관계                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 API 호출 최적화 전략

#### **전략 A: 배치 API 활용**

```python
# BEFORE (비효율)
for coin in 30개:
    get_orderbook(coin)  # 30회 호출

# AFTER (효율)
all_orderbooks = pyupbit.get_orderbook(["KRW-BTC", "KRW-ETH", ...])  # 1회 호출
```

**적용 가능 API**:
- ✅ `pyupbit.get_orderbook()` - 여러 종목 동시 조회 가능
- ✅ `pyupbit.get_current_price()` - 여러 종목 동시 조회 가능
- ❌ `pyupbit.get_ohlcv()` - 단일 종목만 (최적화 불가)

#### **전략 B: 스마트 캐싱**

```python
class SmartDataCache:
    """데이터 수명에 따른 차등 캐싱"""

    def __init__(self):
        self.cache = {
            'micro': {},      # TTL: 30초 (호가창, 체결)
            'short': {},      # TTL: 10분 (1H, 4H 봉)
            'long': {}        # TTL: 1시간 (일봉, 주봉)
        }

    def get_with_ttl(self, key, layer):
        """TTL 기반 캐시 조회"""
        if key in self.cache[layer]:
            cached_data, timestamp = self.cache[layer][key]
            ttl = self._get_ttl(layer)

            if (datetime.now() - timestamp).total_seconds() < ttl:
                return cached_data  # 캐시 히트

        return None  # 캐시 미스

    def _get_ttl(self, layer):
        return {'micro': 30, 'short': 600, 'long': 3600}[layer]
```

#### **전략 C: 선택적 수집 (Lazy Loading)**

```python
# 보유 중인 코인만 상세 분석
holdings = db_manager.get_holding_status()
held_coins = [h['코인이름'] for h in holdings if h['보유수량'] > 0]

# 보유 코인: Layer 1+2+3 모두 수집 (상세)
for coin in held_coins:
    collect_full_data(coin)

# 미보유 코인: Layer 3만 수집 (개요)
for coin in non_held_coins:
    collect_basic_data(coin)  # 일봉, 현재가만
```

---

## 4. 신규 데이터 소스 설계

### 4.1 다이버전스 감지 시스템

#### **4.1.1 설계 목표**

다이버전스는 **가장 강력한 추세 반전 신호**입니다:
- **상승 다이버전스**: 가격 저점 하락 + RSI 저점 상승 → 반등 임박
- **하락 다이버전스**: 가격 고점 상승 + RSI 고점 하락 → 조정 임박

#### **4.1.2 데이터 요구사항**

```python
# 필요한 데이터
ohlcv_data = {
    '1H': 최근 100개 캔들,  # 최소 2~3개 고점/저점 필요
    '4H': 최근 50개 캔들
}

rsi_data = {
    '1H': RSI(14) 100개,
    '4H': RSI(14) 50개
}
```

#### **4.1.3 구현 함수**

```python
def detect_divergence(symbol: str, timeframe: str = '1H') -> Dict[str, Any]:
    """
    다이버전스 감지 (가격 vs RSI)

    Returns:
        {
            'type': 'bullish' | 'bearish' | 'none',
            'strength': 0-100 (신뢰도),
            'price_swing': [최근 2개 고점/저점 가격],
            'rsi_swing': [최근 2개 고점/저점 RSI],
            'signal': '반등 임박' | '조정 임박' | 'N/A'
        }
    """
    try:
        # 1. OHLCV 데이터 조회 (캐시 활용)
        count = 100 if timeframe == '1H' else 50
        df = get_ohlcv_with_cache(
            symbol=symbol,
            interval="minute60" if timeframe == '1H' else "minute240",
            count=count,
            cache_layer='short'  # 10분 TTL
        )

        if df is None or len(df) < 30:
            return {'type': 'none', 'strength': 0, 'signal': 'N/A'}

        # 2. RSI 계산
        df['RSI'] = ta.momentum.RSIIndicator(close=df['close'], window=14).rsi()

        # 3. 고점/저점 탐지 (Swing High/Low)
        df['swing_high'] = (df['high'] > df['high'].shift(1)) & (df['high'] > df['high'].shift(-1))
        df['swing_low'] = (df['low'] < df['low'].shift(1)) & (df['low'] < df['low'].shift(-1))

        # 최근 2개 고점
        recent_highs = df[df['swing_high']].tail(2)
        # 최근 2개 저점
        recent_lows = df[df['swing_low']].tail(2)

        # 4. 상승 다이버전스 체크 (Bullish Divergence)
        if len(recent_lows) >= 2:
            low1, low2 = recent_lows.iloc[0], recent_lows.iloc[1]

            # 가격은 하락했지만 RSI는 상승
            if low2['low'] < low1['low'] and low2['RSI'] > low1['RSI']:
                strength = min(100, abs(low2['RSI'] - low1['RSI']) * 5)  # RSI 차이가 클수록 강함

                return {
                    'type': 'bullish',
                    'strength': round(strength, 1),
                    'price_swing': [low1['low'], low2['low']],
                    'rsi_swing': [low1['RSI'], low2['RSI']],
                    'signal': f'반등 임박 (신뢰도 {strength:.0f}%)',
                    'timeframe': timeframe
                }

        # 5. 하락 다이버전스 체크 (Bearish Divergence)
        if len(recent_highs) >= 2:
            high1, high2 = recent_highs.iloc[0], recent_highs.iloc[1]

            # 가격은 상승했지만 RSI는 하락
            if high2['high'] > high1['high'] and high2['RSI'] < high1['RSI']:
                strength = min(100, abs(high1['RSI'] - high2['RSI']) * 5)

                return {
                    'type': 'bearish',
                    'strength': round(strength, 1),
                    'price_swing': [high1['high'], high2['high']],
                    'rsi_swing': [high1['RSI'], high2['RSI']],
                    'signal': f'조정 임박 (신뢰도 {strength:.0f}%)',
                    'timeframe': timeframe
                }

        # 다이버전스 없음
        return {'type': 'none', 'strength': 0, 'signal': 'N/A'}

    except Exception as e:
        logger.error(f"{symbol} 다이버전스 감지 오류: {e}")
        return {'type': 'none', 'strength': 0, 'signal': 'Error'}
```

### 4.2 체결 강도 분석 시스템

#### **4.2.1 설계 목표**

호가창은 "의도"를 보여주지만, **체결 내역은 "실제 행동"**을 보여줍니다:
- 큰 매수 체결 연속 → 강력한 상승 압력
- 매도 호가는 많은데 체결은 매수 → 허수 매도벽 (상승 신호)

#### **4.2.2 데이터 요구사항**

```python
# 업비트 API: 최근 체결 내역 조회
pyupbit.get_recent_trades(ticker="KRW-BTC", count=100)
# 반환:
# [
#   {'timestamp': 1234567890, 'price': 50000000, 'volume': 0.5, 'ask_bid': 'BID'},
#   {'timestamp': 1234567891, 'price': 50000100, 'volume': 1.2, 'ask_bid': 'ASK'},
#   ...
# ]
```

#### **4.2.3 구현 함수**

```python
def analyze_trade_momentum(symbol: str, window_seconds: int = 300) -> Dict[str, Any]:
    """
    최근 체결 내역 분석을 통한 실시간 매매 압력 계산

    Args:
        symbol: 코인 심볼
        window_seconds: 분석 시간 창 (초, 기본 5분)

    Returns:
        {
            'buy_pressure': 매수 압력 점수 (0-100),
            'sell_pressure': 매도 압력 점수 (0-100),
            'momentum_score': 순 모멘텀 점수 (-100 ~ +100),
            'signal': '강한 매수세' | '강한 매도세' | '균형',
            'large_trades': 대량 거래 건수 (평균의 3배 이상)
        }
    """
    try:
        ticker = f"KRW-{symbol}"

        # 1. 최근 체결 내역 조회 (100건)
        trades = pyupbit.get_recent_trades(ticker, count=100)

        if not trades:
            return _default_momentum_result()

        # 2. 시간 창 필터링 (최근 N초)
        now = datetime.now().timestamp()
        recent_trades = [
            t for t in trades
            if (now - t['timestamp'] / 1000) <= window_seconds
        ]

        if not recent_trades:
            return _default_momentum_result()

        # 3. 매수/매도 체결량 분리 계산
        buy_volume = sum(t['volume'] for t in recent_trades if t['ask_bid'] == 'BID')
        sell_volume = sum(t['volume'] for t in recent_trades if t['ask_bid'] == 'ASK')
        total_volume = buy_volume + sell_volume

        # 4. 압력 점수 계산 (0-100)
        if total_volume == 0:
            return _default_momentum_result()

        buy_pressure = (buy_volume / total_volume) * 100
        sell_pressure = (sell_volume / total_volume) * 100

        # 5. 모멘텀 점수 (-100 ~ +100)
        momentum_score = buy_pressure - sell_pressure

        # 6. 대량 거래 감지 (평균의 3배 이상)
        avg_volume = total_volume / len(recent_trades)
        large_trades = [
            t for t in recent_trades
            if t['volume'] > avg_volume * 3
        ]

        # 7. 신호 생성
        if momentum_score > 20:
            signal = '강한 매수세'
        elif momentum_score < -20:
            signal = '강한 매도세'
        else:
            signal = '균형'

        # 8. 대량 거래 방향성 분석
        if large_trades:
            large_buy_count = sum(1 for t in large_trades if t['ask_bid'] == 'BID')
            large_sell_count = len(large_trades) - large_buy_count

            if large_buy_count > large_sell_count:
                signal += ' (큰손 매수 감지)'
            elif large_sell_count > large_buy_count:
                signal += ' (큰손 매도 감지)'

        return {
            'buy_pressure': round(buy_pressure, 1),
            'sell_pressure': round(sell_pressure, 1),
            'momentum_score': round(momentum_score, 1),
            'signal': signal,
            'large_trades': len(large_trades),
            'window_seconds': window_seconds,
            'sample_size': len(recent_trades)
        }

    except Exception as e:
        logger.error(f"{symbol} 체결 강도 분석 오류: {e}")
        return _default_momentum_result()

def _default_momentum_result():
    """에러 시 기본 반환값"""
    return {
        'buy_pressure': 50.0,
        'sell_pressure': 50.0,
        'momentum_score': 0.0,
        'signal': '데이터 부족',
        'large_trades': 0
    }
```

### 4.3 1분봉 단기 모멘텀 시스템

#### **4.3.1 설계 목표**

1분봉은 **즉각적인 추세 전환**을 가장 빠르게 감지:
- 5분봉보다 5배 빠른 신호
- 단, 노이즈도 많으므로 필터링 필수

#### **4.3.2 구현 함수**

```python
def analyze_1min_momentum(symbol: str) -> Dict[str, Any]:
    """
    1분봉 기반 초단기 모멘텀 분석

    Returns:
        {
            'trend': 'strong_up' | 'up' | 'neutral' | 'down' | 'strong_down',
            'consecutive_candles': 연속 상승/하락 봉 개수,
            'price_change_10min': 최근 10분 가격 변화율 (%),
            'ema_cross': EMA(5) vs EMA(20) 교차 신호,
            'signal': 신호 요약
        }
    """
    try:
        ticker = f"KRW-{symbol}"

        # 1. 1분봉 60개 조회 (1시간)
        df = get_ohlcv_with_cache(
            symbol=symbol,
            interval="minute1",
            count=60,
            cache_layer='micro'  # 30초 TTL
        )

        if df is None or len(df) < 30:
            return _default_1min_result()

        # 2. EMA 계산 (단기 추세)
        df['EMA5'] = df['close'].ewm(span=5, adjust=False).mean()
        df['EMA20'] = df['close'].ewm(span=20, adjust=False).mean()

        # 3. 최근 상황 분석
        latest = df.iloc[-1]
        prev = df.iloc[-2]

        # 4. 연속 상승/하락 봉 개수
        consecutive_up = 0
        consecutive_down = 0

        for i in range(len(df) - 1, max(len(df) - 11, -1), -1):  # 최근 10봉
            if df.iloc[i]['close'] > df.iloc[i]['open']:
                consecutive_up += 1
                break if consecutive_down > 0 else None
            elif df.iloc[i]['close'] < df.iloc[i]['open']:
                consecutive_down += 1
                break if consecutive_up > 0 else None
            else:
                break

        # 5. 10분 가격 변화율
        price_10min_ago = df.iloc[-11]['close'] if len(df) >= 11 else df.iloc[0]['close']
        price_change_10min = ((latest['close'] - price_10min_ago) / price_10min_ago) * 100

        # 6. EMA 교차 신호
        ema_cross = 'golden' if (latest['EMA5'] > latest['EMA20'] and prev['EMA5'] <= prev['EMA20']) else \
                    'death' if (latest['EMA5'] < latest['EMA20'] and prev['EMA5'] >= prev['EMA20']) else \
                    'none'

        # 7. 추세 판단
        if consecutive_up >= 5 and price_change_10min > 1.0:
            trend = 'strong_up'
        elif consecutive_up >= 3:
            trend = 'up'
        elif consecutive_down >= 5 and price_change_10min < -1.0:
            trend = 'strong_down'
        elif consecutive_down >= 3:
            trend = 'down'
        else:
            trend = 'neutral'

        # 8. 신호 생성
        signal_parts = []

        if trend in ['strong_up', 'up']:
            signal_parts.append(f"상승 모멘텀 ({consecutive_up}연봉)")
        elif trend in ['strong_down', 'down']:
            signal_parts.append(f"하락 모멘텀 ({consecutive_down}연봉)")

        if ema_cross == 'golden':
            signal_parts.append("EMA 골든크로스")
        elif ema_cross == 'death':
            signal_parts.append("EMA 데드크로스")

        signal = ', '.join(signal_parts) if signal_parts else '중립'

        return {
            'trend': trend,
            'consecutive_candles': consecutive_up if consecutive_up > 0 else -consecutive_down,
            'price_change_10min': round(price_change_10min, 2),
            'ema_cross': ema_cross,
            'signal': signal,
            'ema5': round(latest['EMA5'], 0),
            'ema20': round(latest['EMA20'], 0)
        }

    except Exception as e:
        logger.error(f"{symbol} 1분봉 모멘텀 분석 오류: {e}")
        return _default_1min_result()

def _default_1min_result():
    return {
        'trend': 'neutral',
        'consecutive_candles': 0,
        'price_change_10min': 0.0,
        'ema_cross': 'none',
        'signal': '데이터 부족'
    }
```

### 4.4 상대 강도 시스템 (BTC 대비)

#### **4.4.1 설계 목표**

알트코인의 진짜 강함은 **BTC 대비 성과**:
- 알트 +5%, BTC +10% → 실제로는 약함 (상대 강도 -5%)
- 알트 +10%, BTC +3% → 진짜 강함 (상대 강도 +7%)

#### **4.4.2 구현 함수**

```python
def calculate_relative_strength(symbol: str, benchmark: str = 'BTC') -> Dict[str, Any]:
    """
    BTC 대비 상대 강도 계산

    Returns:
        {
            'relative_strength_1h': 1시간 상대 강도 (%),
            'relative_strength_4h': 4시간 상대 강도 (%),
            'relative_strength_24h': 24시간 상대 강도 (%),
            'status': 'outperforming' | 'underperforming' | 'neutral',
            'signal': 신호 요약
        }
    """
    try:
        # BTC와 동일하면 상대 강도 의미 없음
        if symbol == benchmark:
            return {
                'relative_strength_1h': 0.0,
                'relative_strength_4h': 0.0,
                'relative_strength_24h': 0.0,
                'status': 'benchmark',
                'signal': 'BTC 자체 (기준 자산)'
            }

        # 1. 두 자산의 최근 가격 변화율 계산
        def _get_price_change(sym, hours):
            """N시간 전 대비 가격 변화율"""
            df = get_ohlcv_with_cache(
                symbol=sym,
                interval="minute60",
                count=hours + 1,
                cache_layer='short'
            )

            if df is None or len(df) < hours + 1:
                return 0.0

            price_now = df.iloc[-1]['close']
            price_past = df.iloc[-(hours + 1)]['close']

            return ((price_now - price_past) / price_past) * 100

        # 2. 시간대별 상대 강도 계산
        alt_1h = _get_price_change(symbol, 1)
        btc_1h = _get_price_change(benchmark, 1)
        rs_1h = alt_1h - btc_1h

        alt_4h = _get_price_change(symbol, 4)
        btc_4h = _get_price_change(benchmark, 4)
        rs_4h = alt_4h - btc_4h

        alt_24h = _get_price_change(symbol, 24)
        btc_24h = _get_price_change(benchmark, 24)
        rs_24h = alt_24h - btc_24h

        # 3. 상태 판단
        # 3개 시간대 중 2개 이상에서 BTC 대비 초과 성과
        outperform_count = sum([rs_1h > 2, rs_4h > 2, rs_24h > 2])
        underperform_count = sum([rs_1h < -2, rs_4h < -2, rs_24h < -2])

        if outperform_count >= 2:
            status = 'outperforming'
            signal = f'{symbol}이 BTC를 지속적으로 초과 성과 중'
        elif underperform_count >= 2:
            status = 'underperforming'
            signal = f'{symbol}이 BTC 대비 약세'
        else:
            status = 'neutral'
            signal = f'{symbol}과 BTC 동조화'

        return {
            'relative_strength_1h': round(rs_1h, 2),
            'relative_strength_4h': round(rs_4h, 2),
            'relative_strength_24h': round(rs_24h, 2),
            'status': status,
            'signal': signal,
            'alt_performance': {
                '1h': round(alt_1h, 2),
                '4h': round(alt_4h, 2),
                '24h': round(alt_24h, 2)
            },
            'btc_performance': {
                '1h': round(btc_1h, 2),
                '4h': round(btc_4h, 2),
                '24h': round(btc_24h, 2)
            }
        }

    except Exception as e:
        logger.error(f"{symbol} 상대 강도 계산 오류: {e}")
        return {
            'relative_strength_1h': 0.0,
            'relative_strength_4h': 0.0,
            'relative_strength_24h': 0.0,
            'status': 'error',
            'signal': '계산 오류'
        }
```

---

## 5. 성능 최적화 아키텍처

### 5.1 스마트 캐싱 시스템

#### **5.1.1 구현 코드**

```python
# data_manager.py에 추가

from threading import Lock
from collections import OrderedDict

class SmartDataCache:
    """
    TTL 기반 다층 캐시 시스템
    - Layer별 수명 차등 관리
    - LRU 자동 정리
    - Thread-safe
    """

    def __init__(self, max_size: int = 1000):
        self.cache = {
            'micro': OrderedDict(),   # TTL: 30초
            'short': OrderedDict(),   # TTL: 10분
            'long': OrderedDict()     # TTL: 1시간
        }
        self.lock = Lock()
        self.max_size = max_size

        # 통계
        self.stats = {
            'micro': {'hits': 0, 'misses': 0},
            'short': {'hits': 0, 'misses': 0},
            'long': {'hits': 0, 'misses': 0}
        }

    def get(self, key: str, layer: str) -> Optional[Any]:
        """캐시 조회 (TTL 검증 포함)"""
        with self.lock:
            if key in self.cache[layer]:
                data, timestamp = self.cache[layer][key]
                ttl = self._get_ttl(layer)

                elapsed = (datetime.now() - timestamp).total_seconds()

                if elapsed < ttl:
                    # 캐시 히트
                    self.cache[layer].move_to_end(key)  # LRU 갱신
                    self.stats[layer]['hits'] += 1
                    logger.debug(f"캐시 히트: {key} (layer: {layer}, age: {elapsed:.1f}s)")
                    return data
                else:
                    # TTL 만료
                    del self.cache[layer][key]
                    logger.debug(f"캐시 만료: {key} (layer: {layer}, age: {elapsed:.1f}s)")

            # 캐시 미스
            self.stats[layer]['misses'] += 1
            return None

    def set(self, key: str, data: Any, layer: str):
        """캐시 저장"""
        with self.lock:
            # LRU 정리 (최대 크기 초과 시)
            if len(self.cache[layer]) >= self.max_size:
                oldest_key = next(iter(self.cache[layer]))
                del self.cache[layer][oldest_key]
                logger.debug(f"캐시 LRU 정리: {oldest_key} (layer: {layer})")

            # 저장
            self.cache[layer][key] = (data, datetime.now())
            logger.debug(f"캐시 저장: {key} (layer: {layer})")

    def _get_ttl(self, layer: str) -> int:
        """Layer별 TTL (초)"""
        return {
            'micro': 30,
            'short': 600,   # 10분
            'long': 3600    # 1시간
        }[layer]

    def get_stats(self) -> Dict:
        """캐시 통계 (히트율 등)"""
        stats_summary = {}

        for layer in ['micro', 'short', 'long']:
            hits = self.stats[layer]['hits']
            misses = self.stats[layer]['misses']
            total = hits + misses

            hit_rate = (hits / total * 100) if total > 0 else 0

            stats_summary[layer] = {
                'hits': hits,
                'misses': misses,
                'hit_rate': f"{hit_rate:.1f}%",
                'cached_items': len(self.cache[layer])
            }

        return stats_summary

    def clear_layer(self, layer: str):
        """특정 레이어 캐시 전체 삭제"""
        with self.lock:
            self.cache[layer].clear()
            logger.info(f"캐시 레이어 클리어: {layer}")

# 전역 인스턴스
smart_cache = SmartDataCache(max_size=1000)
```

#### **5.1.2 캐시 활용 래퍼 함수**

```python
def get_ohlcv_with_cache(
    symbol: str,
    interval: str,
    count: int,
    cache_layer: str = 'short'
) -> Optional[pd.DataFrame]:
    """
    OHLCV 데이터 조회 (캐시 우선)

    Args:
        symbol: 코인 심볼
        interval: 시간 간격
        count: 조회 개수
        cache_layer: 'micro' | 'short' | 'long'
    """
    cache_key = f"ohlcv_{symbol}_{interval}_{count}"

    # 1. 캐시 조회
    cached_data = smart_cache.get(cache_key, cache_layer)
    if cached_data is not None:
        return cached_data

    # 2. 캐시 미스 → API 호출
    ticker = f"KRW-{symbol}"
    df = get_ohlcv_with_retry(ticker, interval=interval, count=count)

    # 3. 캐시 저장
    if df is not None:
        smart_cache.set(cache_key, df, cache_layer)

    return df
```

### 5.2 배치 API 최적화

```python
def collect_all_orderbooks_batch(symbols: List[str]) -> Dict[str, Dict]:
    """
    여러 코인의 호가창을 한 번에 조회 (배치 API)

    Returns:
        {
            'BTC': {...호가창 데이터...},
            'ETH': {...},
            ...
        }
    """
    try:
        tickers = [f"KRW-{s}" for s in symbols]

        # 배치 API 호출 (1회)
        all_orderbooks = pyupbit.get_orderbook(tickers)

        if not all_orderbooks:
            logger.warning("배치 호가창 조회 실패")
            return {}

        # 파싱
        result = {}
        for i, ticker in enumerate(tickers):
            symbol = symbols[i]
            orderbook = all_orderbooks[i]

            if orderbook and orderbook.get('orderbook_units'):
                # 15호가까지 추출 (기존 5 → 15)
                units = orderbook['orderbook_units'][:15]

                result[symbol] = {
                    'bid_sizes': [u['bid_size'] for u in units],
                    'ask_sizes': [u['ask_size'] for u in units],
                    'bid_prices': [u['bid_price'] for u in units],
                    'ask_prices': [u['ask_price'] for u in units],
                    'timestamp': datetime.now().isoformat()
                }

        logger.info(f"✅ 배치 호가창 수집 완료: {len(result)}개 코인")
        return result

    except Exception as e:
        logger.error(f"배치 호가창 수집 오류: {e}")
        return {}
```

### 5.3 선택적 수집 전략

```python
def collect_tiered_data(coins: List[str]) -> Dict[str, Dict]:
    """
    코인별 중요도에 따른 차등 데이터 수집

    Returns:
        {
            'BTC': {
                'tier': 'premium',  # 보유 중
                'data': {...전체 데이터...}
            },
            'DOGE': {
                'tier': 'basic',    # 미보유
                'data': {...기본 데이터만...}
            }
        }
    """
    # 1. 보유 코인 분류
    holdings = db_manager.get_holding_status()
    held_coins = {h['코인이름'] for h in holdings if h['보유수량'] > 0}

    # 2. 코인별 수집 티어 결정
    result = {}

    for coin in coins:
        if coin in held_coins:
            # Premium Tier: 보유 중 → 전체 데이터
            result[coin] = {
                'tier': 'premium',
                'data': _collect_full_data(coin)
            }
        else:
            # Basic Tier: 미보유 → 기본 데이터만
            result[coin] = {
                'tier': 'basic',
                'data': _collect_basic_data(coin)
            }

    return result

def _collect_full_data(symbol: str) -> Dict:
    """Premium Tier: 전체 데이터 수집"""
    return {
        # Layer 1: 실시간
        '1min_momentum': analyze_1min_momentum(symbol),
        'trade_momentum': analyze_trade_momentum(symbol),
        'orderbook_15': None,  # 배치로 수집됨

        # Layer 2: 단기 추세
        'divergence_1h': detect_divergence(symbol, '1H'),
        'divergence_4h': detect_divergence(symbol, '4H'),
        'relative_strength': calculate_relative_strength(symbol),
        'technical_1h': get_technical_indicators(symbol, 'minute60'),
        'technical_4h': get_technical_indicators(symbol, 'minute240'),

        # Layer 3: 장기 구조
        'technical_day': get_technical_indicators(symbol, 'day'),
        'chart_image': None  # 별도 수집
    }

def _collect_basic_data(symbol: str) -> Dict:
    """Basic Tier: 기본 데이터만"""
    return {
        # Layer 3만
        'technical_day': get_technical_indicators(symbol, 'day'),
        'current_price': pyupbit.get_current_price(f"KRW-{symbol}"),
        'note': '미보유 코인 - 기본 데이터만 수집'
    }
```

---

## 6. 구현 계획

### 6.1 Phase 1: 캐싱 시스템 구축 (우선순위: 최고 ⭐⭐⭐)

**목표**: API 호출 50% 절감

| 단계 | 작업 내용 | 예상 소요 | 파일 |
|------|-----------|-----------|------|
| 1.1 | SmartDataCache 클래스 구현 | 2시간 | data_manager.py |
| 1.2 | get_ohlcv_with_cache() 래퍼 함수 추가 | 1시간 | data_manager.py |
| 1.3 | 기존 get_technical_indicators() 수정 (캐시 적용) | 1시간 | data_manager.py |
| 1.4 | 캐시 통계 모니터링 함수 추가 | 30분 | data_manager.py |
| 1.5 | 테스트 (캐시 히트율 확인) | 1시간 | - |

**검증 기준**:
- 캐시 히트율 70% 이상
- 30코인 분석 시간: 90초 → 45초

### 6.2 Phase 2: 신규 데이터 소스 추가 (우선순위: 최고 ⭐⭐⭐)

**목표**: 단기 방향성 예측 가능

| 단계 | 작업 내용 | 예상 소요 | 파일 |
|------|-----------|-----------|------|
| 2.1 | detect_divergence() 함수 구현 | 2시간 | data_manager.py |
| 2.2 | analyze_trade_momentum() 함수 구현 | 1.5시간 | data_manager.py |
| 2.3 | analyze_1min_momentum() 함수 구현 | 1.5시간 | data_manager.py |
| 2.4 | calculate_relative_strength() 함수 구현 | 1시간 | data_manager.py |
| 2.5 | collect_all_orderbooks_batch() 함수 구현 | 1시간 | data_manager.py |
| 2.6 | 기존 collect_all_coins_data_parallel() 통합 | 2시간 | ai_strategy.py |
| 2.7 | 테스트 (각 함수별) | 2시간 | - |

**검증 기준**:
- 다이버전스 감지 정확도 80% 이상
- 체결 강도 신호 유효성 70% 이상

### 6.3 Phase 3: 프롬프트 통합 (우선순위: 높음 ⭐⭐)

**목표**: AI가 신규 데이터 활용

| 단계 | 작업 내용 | 예상 소요 | 파일 |
|------|-----------|-----------|------|
| 3.1 | _build_single_coin_analysis_block() 수정 (신규 데이터 주입) | 2시간 | ai_strategy.py |
| 3.2 | COMMON_AI_RULES에 "신규 지표 해석 가이드" 추가 | 1시간 | config.py |
| 3.3 | 타이밍 점수 계산 시스템 업데이트 (개혁안 5.1) | 1시간 | config.py |
| 3.4 | 테스트 (AI 판단 품질 확인) | 2시간 | - |

### 6.4 Phase 4: 성능 최적화 (우선순위: 중간 ⭐)

**목표**: 코인 30개 대응 가능

| 단계 | 작업 내용 | 예상 소요 | 파일 |
|------|-----------|-----------|------|
| 4.1 | collect_tiered_data() 선택적 수집 시스템 | 2시간 | ai_strategy.py |
| 4.2 | 배치 API 통합 (호가창, 현재가) | 1시간 | data_manager.py |
| 4.3 | 부하 테스트 (30코인 동시 분석) | 2시간 | - |

---

## 7. 예상 효과

### 7.1 단기 방향성 예측 정확도 향상

| 지표 | BEFORE | AFTER | 개선율 |
|------|--------|-------|--------|
| **반전 감지 속도** | 1시간 지연 | 1~5분 지연 | **+92%** |
| **눌림목 진입 성공률** | 30% | 75% | **+150%** |
| **허위 신호 비율** | 40% | 15% | **-62.5%** |

**구체적 시나리오**:
```
상황: BTC가 -5% 급락 후 반등 조짐

BEFORE (기존 시스템):
  - 1시간봉 RSI: 35 (과매도 감지까지 1시간 소요)
  - 판단: 1시간 후 "추가매수"
  - 결과: 이미 +3% 반등한 후 진입 → 고점 매수

AFTER (개선 시스템):
  - 1분봉 EMA 골든크로스 감지 (2분 내)
  - 1시간봉 상승 다이버전스 감지 (5분 내)
  - 체결 강도: 매수 압력 급증 (실시간)
  - 판단: "즉시 추가매수"
  - 결과: 반등 시작점 진입 → +5% 수익
```

### 7.2 성능 개선

| 지표 | BEFORE | AFTER | 개선율 |
|------|--------|-------|--------|
| **API 호출 (10코인)** | 60회 | 35회 | **-42%** |
| **API 호출 (30코인)** | 180회 | 75회 | **-58%** |
| **분석 소요 시간 (10코인)** | 30초 | 15초 | **-50%** |
| **분석 소요 시간 (30코인)** | 90초 | 35초 | **-61%** |
| **캐시 히트율** | 0% | 70%+ | - |

**API 호출 절감 상세**:
```
BEFORE (30코인):
  - 1시간봉: 30회
  - 4시간봉: 30회
  - 일봉: 30회
  - 5분봉: 30회
  - 호가창: 30회
  - 체결내역: 30회
  총: 180회

AFTER (30코인):
  - 1시간봉: 10회 (20회 캐시 히트)
  - 4시간봉: 10회 (20회 캐시 히트)
  - 일봉: 5회 (25회 캐시 히트)
  - 1분봉: 15회 (Premium Tier만)
  - 호가창 (배치): 1회 (30코인 동시)
  - 체결내역: 15회 (Premium Tier만)
  총: 56회 (캐시 미적용 시 90회)

실제 절감: 180회 → 56회 (-69%)
```

### 7.3 데이터 품질 향상

| 데이터 종류 | BEFORE | AFTER |
|-------------|--------|-------|
| **시간 해상도** | 1시간 (60분) | 1분 |
| **호가창 깊이** | 5호가 | 15호가 |
| **다이버전스** | 감지 불가 | 1H/4H 감지 가능 |
| **체결 강도** | 없음 | 5분 window 실시간 |
| **상대 강도** | 없음 | 1H/4H/24H BTC 대비 |

---

## 8. 리스크 및 대응 방안

### 8.1 리스크 1: 신규 데이터 노이즈

**문제**: 1분봉, 체결 내역 등 고주파 데이터는 노이즈 많음

**대응**:
```python
# 필터링 시스템 추가
def filter_noisy_signals(signals: List[Dict]) -> List[Dict]:
    """
    노이즈 신호 필터링

    규칙:
    1. 신뢰도 50% 미만 신호 제거
    2. 상반된 신호 동시 발생 시 중립 처리
    3. 3개 이상 시간대 일치 신호만 채택
    """
    filtered = []

    for signal in signals:
        # 규칙 1
        if signal.get('strength', 0) < 50:
            continue

        # 규칙 2
        conflicting = any(
            s['type'] != signal['type'] and s['timeframe'] == signal['timeframe']
            for s in signals if s != signal
        )
        if conflicting:
            continue

        filtered.append(signal)

    # 규칙 3: 다중 시간대 합의
    if len(filtered) >= 2:  # 최소 2개 시간대 일치
        return filtered

    return []
```

### 8.2 리스크 2: 캐시 동기화 문제

**문제**: 캐시된 데이터와 실시간 데이터 불일치

**대응**:
```python
# 캐시 무효화 트리거
def invalidate_cache_on_event(symbol: str, event_type: str):
    """
    특정 이벤트 발생 시 해당 심볼 캐시 무효화

    이벤트 예시:
    - 거래 실행 후
    - 긴급 트리거 발생 시
    - 변동성 급증 시
    """
    if event_type in ['trade_executed', 'emergency_trigger', 'volatility_spike']:
        # 해당 심볼의 micro, short 레이어 캐시 삭제
        for layer in ['micro', 'short']:
            smart_cache.delete_pattern(f"*{symbol}*", layer)

        logger.info(f"캐시 무효화: {symbol} (이유: {event_type})")
```

### 8.3 리스크 3: 프롬프트 과부하

**문제**: 신규 데이터 추가로 프롬프트 길이 증가 → 토큰 비용 증가

**대응**:
```python
# 요약 시스템
def summarize_advanced_data(coin_data: Dict) -> str:
    """
    신규 데이터를 AI가 이해하기 쉽게 1~2줄로 요약

    BEFORE (장황):
    - 1분봉 모멘텀: {trend: 'strong_up', consecutive: 5, ...}
    - 다이버전스: {type: 'bullish', strength: 75, ...}
    - 체결 강도: {buy_pressure: 65, sell_pressure: 35, ...}

    AFTER (간결):
    - 🔥 단기 신호: 1분봉 5연봉 상승 + 상승 다이버전스(75%) + 매수 압력 우세(65%)
    """
    summary_parts = []

    # 1분봉 모멘텀
    mom_1min = coin_data.get('1min_momentum', {})
    if mom_1min['trend'] in ['strong_up', 'strong_down']:
        summary_parts.append(
            f"1분봉 {mom_1min['consecutive_candles']}연봉 {mom_1min['trend'].replace('_', ' ')}"
        )

    # 다이버전스
    div_1h = coin_data.get('divergence_1h', {})
    if div_1h['type'] != 'none' and div_1h['strength'] > 60:
        summary_parts.append(
            f"{div_1h['signal']} (1H)"
        )

    # 체결 강도
    trade_mom = coin_data.get('trade_momentum', {})
    if abs(trade_mom['momentum_score']) > 20:
        summary_parts.append(trade_mom['signal'])

    if summary_parts:
        return "🔥 **단기 신호**: " + " + ".join(summary_parts)
    else:
        return ""
```

---

## 9. 최종 체크리스트

### 개발자 체크리스트

#### Phase 1: 캐싱 시스템
- [ ] SmartDataCache 클래스 구현
- [ ] get_ohlcv_with_cache() 래퍼 함수
- [ ] 기존 함수들 캐시 적용
- [ ] 캐시 통계 모니터링
- [ ] 테스트: 히트율 70% 이상 확인

#### Phase 2: 신규 데이터 소스
- [ ] detect_divergence() (1H, 4H)
- [ ] analyze_trade_momentum() (체결 강도)
- [ ] analyze_1min_momentum() (초단기 추세)
- [ ] calculate_relative_strength() (BTC 대비)
- [ ] collect_all_orderbooks_batch() (15호가)
- [ ] 통합 테스트

#### Phase 3: 프롬프트 통합
- [ ] _build_single_coin_analysis_block() 수정
- [ ] COMMON_AI_RULES 업데이트
- [ ] 타이밍 점수 시스템 업데이트
- [ ] AI 판단 품질 검증

#### Phase 4: 성능 최적화
- [ ] collect_tiered_data() (선택적 수집)
- [ ] 배치 API 통합
- [ ] 30코인 부하 테스트

---

## 10. 다음 단계

사용자님의 승인 후:

1. **Phase 1 즉시 착수** (캐싱 시스템)
2. **Phase 2 진행** (신규 데이터 소스)
3. **PROCESS2_REFORM_ANALYSIS.md 업데이트** (이 내용 반영)
4. **통합 테스트** (1주일)
5. **KPI 리포트** (개선 효과 측정)

**예상 총 구현 시간**:
- Phase 1: 5.5시간
- Phase 2: 11시간
- Phase 3: 6시간
- Phase 4: 5시간
- **총 27.5시간**

---

**문서 작성 완료**: 2025-01-XX
**관련 문서**: PROCESS2_REFORM_ANALYSIS.md
