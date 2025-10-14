# DatabaseManager → SupabaseAdapter 완전 비교 보고서

## 🔴 **심각한 차이점 발견!**

### 1. **`get_active_coin_list()` - 반환 타입 불일치** ⚠️⚠️⚠️

**원본 (SQLite DatabaseManager)**:
```python
def get_active_coin_list(self) -> List[CoinConfig]:
    """DB에서 '활성' 상태인 코인 목록을 조회하여 CoinConfig 리스트로 반환"""
    conn = self.get_connection()
    c = conn.cursor()
    c.execute("SELECT 코인이름 FROM holding_status WHERE 관리상태 IN ('활성', '재평가')")
    active_symbols = [row[0] for row in c.fetchall()]
    conn.close()

    active_coins = []
    all_config_coins = {c.symbol: c for c in TRADING_COINS}

    for symbol in active_symbols:
        if symbol in all_config_coins:
            active_coins.append(all_config_coins[symbol])  # ✅ CoinConfig 객체
        else:
            active_coins.append(CoinConfig(
                symbol=symbol,
                **DEFAULT_COIN_CONFIG
            ))  # ✅ CoinConfig 객체
    return active_coins  # ✅ List[CoinConfig] 반환
```

**현재 (Supabase SupabaseAdapter)**:
```python
def get_active_coin_list(self) -> List[str]:
    """활성 상태의 코인 심볼 목록 조회"""
    try:
        response = self.supabase.table('holding_status')\
            .select('코인이름')\
            .in_('관리상태', ['활성', '재평가'])\
            .execute()

        if not response.data:
            return []

        # ❌ 심볼 문자열만 반환
        return [row['코인이름'] for row in response.data]  # ❌ List[str] 반환
    except Exception as e:
        logger.error(f"활성 코인 목록 조회 오류: {e}")
        return []
```

**영향**:
- 모든 코드에서 `coin.symbol` 호출 시 AttributeError 발생
- 우리가 수정한 5개 파일이 모두 이 문제 때문에 에러 발생

---

### 2. **`get_investment_narrative()` - 완전히 다른 메서드** ⚠️⚠️⚠️

**원본 (SQLite)**:
```python
def get_investment_narrative(self, symbol: str) -> Optional[Dict[str, Dict]]:
    """trade_history에서 현재 포지션의 전체 '투자 연혁'을 조회합니다."""
    # ... trade_history 조회 로직 ...
    return {
        "initial_entry": {
            "type": "신규매수",
            "thesis": "AI 사고 과정...",
            "timestamp": "2025-01-XX"
        },
        "recent_action": {
            "type": "추가매수",
            "thesis": "AI 사고 과정...",
            "timestamp": "2025-01-YY"
        }
    }
```

**현재 (Supabase - 잘못 구현됨)**:
```python
def get_investment_narrative(self) -> str:  # ❌ symbol 파라미터 누락!
    """투자 내러티브 조회 (최신 CIO 보고서 요약)"""  # ❌ 완전히 다른 기능!
    # ... cio_reports 조회 로직 ...
    return f"{market_summary}\n\n{outlook}"  # ❌ 문자열 반환
```

**수정 후 (2025-10-14)**:
```python
def get_investment_narrative(self, symbol: str) -> Optional[Dict[str, Dict]]:
    """[원본 DatabaseManager와 동일] trade_history에서 현재 포지션의 전체 '투자 연혁'을 조회합니다."""
    # ✅ Supabase를 사용하여 원본과 동일한 로직 구현
    return {
        "initial_entry": initial_entry,
        "recent_action": recent_action
    }
```

**영향**:
- `db_manager.get_investment_narrative(symbol)` 호출 시 `TypeError: takes 1 positional argument but 2 were given` 발생
- 특정 코인의 투자 논리를 조회하는 기능 완전 상실
- CIO 보고서 조회 기능과 혼동됨

---

### 3. **`get_performance_metrics()` - 완전히 다른 메서드** ⚠️⚠️

**원본 (SQLite)**:
```python
def get_performance_metrics(self, days: int = 30, symbol: Optional[str] = None) -> Dict[str, Any]:
    """[고도화 5단계 최종본] 최근 거래 성과를 종합 분석하고, AI의 판단 편향을 통계적으로 도출"""
    # ... 복잡한 거래 분석 로직 ...

    return {
        "win_rate": round(win_rate, 2),              # ✅ 승률
        "profit_factor": round(profit_factor, 2),    # ✅ 손익비
        "total_trades": total_trades,                # ✅ 총 거래 수
        "avg_profit_percent": round(avg_profit_percent, 2),  # ✅ 평균 수익률
        "avg_loss_percent": round(avg_loss_percent, 2),      # ✅ 평균 손실률
        "net_profit": int(net_profit),                       # ✅ 순수익
        "summary": summary,                          # ✅ 요약 문자열
        "bias_summary": bias_summary                 # ✅ AI 편향 분석
    }
```

**현재 (Supabase)**:
```python
def get_performance_metrics(self, days: int = 7) -> Dict[str, Any]:
    """성과 지표 조회"""
    # ... 포트폴리오 요약 조회 로직 ...

    return {
        'cumulative_return': cumulative_return,  # ✅ 누적 수익률
        'daily_return': daily_return,            # ✅ 일일 수익률
        'total_trades': total_trades,            # ✅ 총 거래 수 (유일한 공통 필드)
        'total_net_asset': total_net_asset,      # ❌ 원본에 없음
        'summary': summary                       # ✅ 추가됨 (KeyError 수정)
        # ❌ win_rate 누락
        # ❌ profit_factor 누락
        # ❌ avg_profit_percent 누락
        # ❌ avg_loss_percent 누락
        # ❌ net_profit 누락
        # ❌ bias_summary 누락
    }
```

**영향**:
- 호출하는 코드에서 원본 필드 접근 시 KeyError 발생 가능
- AI 편향 분석 기능 완전 상실
- 거래 성과 상세 분석 기능 상실

---

## 📊 전체 메서드 비교표

| 메서드명 | 원본(SQLite) | 현재(Supabase) | 상태 |
|---------|-------------|---------------|------|
| `get_holding_status()` | ✅ | ✅ | 호환 |
| `update_holding_status()` | ✅ | ✅ | 호환 |
| `log_trade()` | ✅ | ✅ | 호환 |
| `get_recent_trades()` | ✅ | ✅ | 호환 |
| `save_portfolio_summary()` | ✅ | ✅ | 호환 |
| `get_latest_portfolio_summary()` | ❌ 없음 | ✅ | 신규 |
| `get_system_status()` | ✅ | ✅ | 호환 |
| `set_system_status()` | ❌ (update_system_status) | ✅ | 호환 |
| **`get_active_coin_list()`** | ✅ `List[CoinConfig]` | ❌ `List[str]` | **불일치** |
| **`get_performance_metrics()`** | ✅ 거래 분석 | ❌ 포트폴리오 요약 | **불일치** |
| `get_portfolio_holdings()` | ✅ | ✅ | 호환 |
| `get_trade_history_for_coin()` | ✅ | ✅ | 호환 |
| `get_target_thresholds()` | ✅ | ✅ | 호환 |
| `ensure_coins_in_db()` | ✅ | ✅ | 호환 |
| `cleanup_portfolio()` | ✅ | ✅ | 호환 |
| `save_cio_report()` | ✅ | ✅ | 호환 |
| `get_past_daily_reports()` | ✅ | ✅ | 호환 |
| `upsert_report_rationale()` | ✅ | ✅ | 호환 |
| `get_rationale_for_date()` | ✅ | ✅ | 호환 |
| `get_latest_report_critique()` | ✅ | ✅ | 호환 |
| `get_data_for_daily_briefing()` | ✅ | ✅ | 호환 |
| `get_recent_trade_summary()` | ❌ 없음 | ✅ | 신규 |
| `get_trade_cycle_analysis()` | ✅ | ✅ | 호환 |
| **`get_investment_narrative()`** | ✅ `(symbol)` → `Dict` | ❌ `()` → `str` | **완전 불일치** ⚠️ |
| `get_trade_percentage()` | ✅ | ❌ 누락 | **누락** (2025-10-14 추가) |
| `update_all_krw_balance()` | ✅ | ✅ | 호환 |
| `update_all_portfolio_weights()` | ✅ | ✅ | 호환 |
| `update_portfolio_weights()` | ✅ | ✅ | 호환 |
| `save_last_market_regime()` | ✅ | ✅ | 호환 |
| `get_last_market_regime()` | ✅ | ✅ | 호환 |

---

## 🔧 수정 필요 사항

### ⚠️ **최우선 수정: `get_active_coin_list()`**

**문제**: 반환 타입이 `List[str]`이어야 하는데, 기존 코드는 `List[CoinConfig]`를 기대

**해결책 2가지**:

#### 방법 1: SupabaseAdapter 수정 (원본과 동일하게) ✅ 권장
```python
def get_active_coin_list(self) -> List[CoinConfig]:
    """DB에서 '활성' 상태인 코인 목록을 조회하여 CoinConfig 리스트로 반환"""
    from config import TRADING_COINS, DEFAULT_COIN_CONFIG, CoinConfig

    try:
        response = self.supabase.table('holding_status')\
            .select('코인이름')\
            .in_('관리상태', ['활성', '재평가'])\
            .execute()

        if not response.data:
            return []

        active_symbols = [row['코인이름'] for row in response.data]
        active_coins = []
        all_config_coins = {c.symbol: c for c in TRADING_COINS}

        for symbol in active_symbols:
            if symbol in all_config_coins:
                active_coins.append(all_config_coins[symbol])
            else:
                active_coins.append(CoinConfig(
                    symbol=symbol,
                    **DEFAULT_COIN_CONFIG
                ))
        return active_coins
    except Exception as e:
        logger.error(f"활성 코인 목록 조회 오류: {e}")
        return []
```

#### 방법 2: 모든 호출 코드 수정 (이미 완료) ❌ 임시방편
- `for coin in active_coins` → `for symbol in active_coins`
- 이미 5개 파일 수정 완료

---

### ⚠️ **우선순위 2: `get_performance_metrics()` 보강**

**문제**: 원본의 거래 분석 기능 완전히 상실

**해결책**: 원본 로직 이식 필요 (복잡함, 약 100 라인)

**임시방편**: 현재 버전 유지 + 필요한 필드만 추가
```python
def get_performance_metrics(self, days: int = 7) -> Dict[str, Any]:
    # ... 현재 로직 ...

    return {
        'cumulative_return': cumulative_return,
        'daily_return': daily_return,
        'total_trades': total_trades,
        'total_net_asset': total_net_asset,
        'summary': summary,
        # 호환성을 위한 기본값 추가
        'win_rate': 0,                    # TODO: 거래 분석 로직 추가 필요
        'profit_factor': 0,               # TODO: 거래 분석 로직 추가 필요
        'avg_profit_percent': 0,          # TODO: 거래 분석 로직 추가 필요
        'avg_loss_percent': 0,            # TODO: 거래 분석 로직 추가 필요
        'net_profit': 0,                  # TODO: 거래 분석 로직 추가 필요
        'bias_summary': "거래 분석 미구현"  # TODO: AI 편향 분석 로직 추가 필요
    }
```

---

## 📝 결론

1. **`get_active_coin_list()`는 반드시 원본대로 수정해야 함**
   - 현재 임시방편(문자열 리스트)은 유지보수 악몽
   - 모든 코드가 `coin.symbol`, `coin.target_profit` 등 속성에 의존

2. **`get_performance_metrics()`는 기능 상실**
   - AI 편향 분석, 승률, 손익비 등 핵심 지표 누락
   - 당장 에러는 안 나지만 기능 저하

3. **다른 메서드들은 대부분 정상 호환**

---

## 🎯 권장 조치

1. ✅ **즉시 수정**: `get_active_coin_list()` → `List[CoinConfig]` 반환으로 변경
2. ⏰ **중요**: `get_performance_metrics()` 원본 로직 이식
3. ✅ **완료**: 나머지 메서드들은 정상 작동

