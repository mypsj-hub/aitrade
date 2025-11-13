// TypeScript 인터페이스 정의 - Supabase 데이터 구조

export interface HoldingStatus {
  코인이름: string;
  보유수량: number;
  평가금액: number;
  매수금액: number;
  매수평균가: number;
  수익률: number;
  평가손익: number;
  현재상태: string;
  보유비중: number;
  매매판단: string;
  GPT매매비중: number;
  GPT목표수익률: number;
  GPT목표손절률: number;
  GPT보유비중: number;
  마지막거래시간: string | null;
  진입일시: string | null;
  청산일시: string | null;
  총매수금액: number;
  총매도금액: number;
  실현손익: number;
  거래횟수: number;
  승률: number;
  관리상태: string;
}

export interface TradeHistory {
  id: number;
  코인이름: string;
  거래유형: string;
  거래수량: number;
  거래금액: number;
  거래사유: string;
  거래일시: string;
  ai_thinking_process: string;
  수익금: number;
  판단확신: number;
  주요지표: Record<string, unknown>; // JSONB
}

// Analysis 페이지용 Trade 타입
export interface Trade {
  id: number;
  코인이름: string;
  거래유형: string;
  거래금액: number;
  수익금: number | null;
  거래일시: string;
  ai_thinking_process: string | null;
  주요지표: Record<string, unknown> | null;
}

export interface PortfolioSummary {
  날짜: string;
  총포트폴리오가치: number;
  원화잔고: number;
  총코인가치: number;
  일일수익률: number;
  누적수익률: number;
  총순자산: number;
}

export interface CIOReport {
  id: number;
  report_date: string;
  report_type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  title: string;
  market_summary: string;
  performance_review: string;
  self_critique: Record<string, unknown>;
  outlook: string;
  full_content_md: string;
  raw_json_data: Record<string, unknown>;
  cio_latest_rationale: string;
  process2_latest_advice: string;        // ✅ 신규 추가
  execution_summary?: string;  
}

export interface SystemStatus {
  status_key: string;
  status_value: string;
  last_updated: string;
}

// AI 관심 코인 (coin_watch_history 테이블)
export interface WatchlistCoin {
  코인이름: string;
  순위: number;
  퍼널타입: string;
  점수: number;
  최초등록일: string;
}

// 대시보드용 통합 데이터 타입
export interface DashboardData {
  holdings: HoldingStatus[];
  summary: PortfolioSummary | null;
  summaryHistory: PortfolioSummary[];
  recentTrades: TradeHistory[];
  latestReport: CIOReport | null;
  marketRegime: string;
  watchlist: WatchlistCoin[];
}
