// SWR을 사용한 데이터 페칭 훅

import useSWR from 'swr';
import { supabase } from '../supabase';
import type {
  DashboardData,
  HoldingStatus,
  PortfolioSummary,
  TradeHistory,
  CIOReport,
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

    // 3. 포트폴리오 요약 (전체 - 차트용)
    const { data: summaryHistory, error: summaryHistoryError } = await supabase
      .from('portfolio_summary')
      .select('*')
      .order('날짜', { ascending: true });

    if (summaryHistoryError) throw summaryHistoryError;

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

    return {
      holdings: (holdings as HoldingStatus[]) || [],
      summary: summaryData?.[0] as PortfolioSummary || null,
      summaryHistory: (summaryHistory as PortfolioSummary[]) || [],
      recentTrades: (recentTrades as TradeHistory[]) || [],
      latestReport: reportData?.[0] as CIOReport || null,
      marketRegime: statusData?.status_value || 'Range_Bound',
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
