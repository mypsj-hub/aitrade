'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';

interface SystemMetrics {
  winRate: number;
  profitFactor: number;
  trades24h: number;
  avgHoldingTime: string;
}

async function fetchSystemMetrics(): Promise<SystemMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // 최근 30일 마감 거래 조회
  const { data: allTrades } = await supabase
    .from('trade_history')
    .select('거래유형, 수익금, 거래일시')
    .gte('거래일시', thirtyDaysAgo.toISOString())
    .in('거래유형', ['익절', '손절', '매도', '청산']);

  // 24시간 거래 횟수
  const { data: recentTrades } = await supabase
    .from('trade_history')
    .select('id')
    .gte('거래일시', oneDayAgo.toISOString());

  const trades = (allTrades || []) as unknown as Array<{ 거래유형: string; 수익금: number; 거래일시: string }>;

  if (trades.length === 0) {
    return {
      winRate: 0,
      profitFactor: 0,
      trades24h: recentTrades?.length || 0,
      avgHoldingTime: '-',
    };
  }

  // 승률 계산
  const winTrades = trades.filter((t) => (t.수익금 || 0) > 0);
  const winRate = (winTrades.length / trades.length) * 100;

  // 손익비 계산
  const totalProfit = trades
    .filter((t) => (t.수익금 || 0) > 0)
    .reduce((sum, t) => sum + (t.수익금 || 0), 0);
  const totalLoss = Math.abs(
    trades
      .filter((t) => (t.수익금 || 0) < 0)
      .reduce((sum, t) => sum + (t.수익금 || 0), 0)
  );
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? 999 : 0;

  return {
    winRate,
    profitFactor,
    trades24h: recentTrades?.length || 0,
    avgHoldingTime: '2.3일', // TODO: 실제 계산 구현
  };
}

export function SystemMetricsCard() {
  const { data, isLoading } = useSWR<SystemMetrics>(
    'system-metrics',
    fetchSystemMetrics,
    { refreshInterval: 60000 }
  );

  const metrics = [
    {
      label: '승률',
      value: data?.winRate.toFixed(1) || '-',
      suffix: '%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: '🎯',
    },
    {
      label: '손익비',
      value: data?.profitFactor.toFixed(2) || '-',
      suffix: '',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '📊',
    },
    {
      label: '24h 거래',
      value: data?.trades24h || '-',
      suffix: '회',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '⚡',
    },
    {
      label: '평균 보유',
      value: data?.avgHoldingTime || '-',
      suffix: '',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: '⏱️',
    },
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">📈 시스템 성과</h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">📈 시스템 성과 (30일)</h2>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`${metric.bgColor} rounded-lg p-4 border border-slate-200 hover:shadow-md transition`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{metric.icon}</span>
              <span className="text-xs text-slate-500">{metric.label}</span>
            </div>
            <div className="flex items-baseline">
              <span className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </span>
              {metric.suffix && (
                <span className="ml-1 text-sm text-slate-500">{metric.suffix}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
