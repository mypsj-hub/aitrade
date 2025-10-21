// SWR을 사용한 데이터 페칭 훅

import useSWR from 'swr';
import { supabase } from '../supabase';
import type {
  DashboardData,
  HoldingStatus,
  PortfolioSummary,
  TradeHistory,
  CIOReport,
  WatchlistCoin,
} from '../types';

const fetcher = async (): Promise<DashboardData> => {
  try {
    // 1. 보유 현황 조회
    const { data: holdings, error: holdingsError } = await supabase
      .from('holding_status')
      .select('*')
      .order('평가금액', { ascending: false });

    if (holdingsError) throw holdingsError;

    // 2. 포트폴리오 요약 (최신 1건)
    const { data: summaryData, error: summaryError } = await supabase
      .from('portfolio_summary')
      .select('*')
      .order('날짜', { ascending: false })
      .limit(1);

    if (summaryError) throw summaryError;

    // 3. 포트폴리오 요약 (일별 최신 데이터 - 차트용)
    // 전략: PostgreSQL RPC 함수로 서버에서 일별 집계 (9,110개 → ~40개)
    let summaryHistory: PortfolioSummary[] = [];

    // RPC 함수 시도 (함수가 생성되지 않았으면 폴백)
    // 주의: RPC 함수는 이미 ORDER BY가 포함되어 있으므로 .order() 불필요
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_daily_portfolio_summary');

    if (!rpcError && rpcData) {
      // RPC 함수 성공
      summaryHistory = rpcData;
      console.log('[useDashboardData] ✅ RPC 함수로 데이터 로드:', summaryHistory.length, '일');
    } else {
      // RPC 함수 실패 → 임시 폴백 (Supabase에 함수 생성 필요)
      console.warn('[useDashboardData] ⚠️ RPC 함수 없음. 임시 폴백 사용 (제한된 데이터)');
      console.warn('[useDashboardData] 해결: migration_temp/supabase_rpc_daily_portfolio.sql을 Supabase에 적용하세요');

      const { data: fallbackData, error: fallbackError } = await supabase
        .from('portfolio_summary')
        .select('*')
        .order('날짜', { ascending: true })
        .limit(1000); // 임시로 1000개만 (4일치)

      if (fallbackError) throw fallbackError;

      // 클라이언트에서 일별 집계
      const dailyMap = new Map<string, PortfolioSummary>();
      fallbackData?.forEach((item: PortfolioSummary) => {
        const dateKey = item.날짜.split('T')[0];
        const existing = dailyMap.get(dateKey);
        if (!existing || item.날짜 > existing.날짜) {
          dailyMap.set(dateKey, item);
        }
      });
      summaryHistory = Array.from(dailyMap.values()).sort((a, b) => a.날짜.localeCompare(b.날짜));
    }

    if (summaryHistory.length > 0) {
      console.log('[useDashboardData] 날짜 범위:',
        summaryHistory[0]?.날짜,
        '~',
        summaryHistory[summaryHistory.length - 1]?.날짜
      );
    }

    // 4. 최근 거래 내역
    const { data: recentTrades, error: tradesError } = await supabase
      .from('trade_history')
      .select('*')
      .order('거래일시', { ascending: false })
      .limit(100);

    if (tradesError) throw tradesError;

    // 5. 최신 CIO 보고서
    const { data: reportData, error: reportError } = await supabase
      .from('cio_reports')
      .select('*')
      .order('report_date', { ascending: false })
      .limit(1);

    if (reportError) throw reportError;

    // 6. 시스템 상태 (시장 체제)
    const { data: statusData, error: statusError } = await supabase
      .from('system_status')
      .select('status_value')
      .eq('status_key', 'last_market_regime')
      .single();

    if (statusError && statusError.code !== 'PGRST116') {
      // PGRST116은 "no rows returned" 에러
      throw statusError;
    }

    // 7. AI 관심 코인 (coin_watch_history)
    const { data: watchlistData, error: watchlistError } = await supabase
      .from('coin_watch_history')
      .select('*')
      .order('순위', { ascending: true });

    if (watchlistError) {
      console.warn('[useDashboardData] Watchlist fetch warning:', watchlistError);
    }

    return {
      holdings: (holdings as HoldingStatus[]) || [],
      summary: summaryData?.[0] as PortfolioSummary || null,
      summaryHistory: (summaryHistory as PortfolioSummary[]) || [],
      recentTrades: (recentTrades as TradeHistory[]) || [],
      latestReport: reportData?.[0] as CIOReport || null,
      marketRegime: statusData?.status_value || 'Range_Bound',
      watchlist: (watchlistData as WatchlistCoin[]) || [],
    };
  } catch (error) {
    console.error('Data fetching error:', error);
    throw error;
  }
};

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    'dashboard-data',
    fetcher,
    {
      refreshInterval: 60000, // 60초마다 자동 새로고침
      revalidateOnFocus: true, // 탭 전환 시 재검증
      dedupingInterval: 5000, // 5초 내 중복 요청 방지
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate, // 수동 새로고침 함수
  };
}
