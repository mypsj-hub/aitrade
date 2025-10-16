'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { Trade } from '@/lib/types';

interface AIPatternAnalysisProps {
  trades: Trade[];
}

interface TradeTypeStats {
  type: string;
  count: number;
  winCount: number;
  winRate: number;
  avgProfit: number;
  totalProfit: number;
}

interface HourStats {
  hour: string;
  count: number;
  avgProfit: number;
}

export function AIPatternAnalysis({ trades }: AIPatternAnalysisProps) {
  // 거래유형별 통계
  const tradeTypeStats = useMemo<TradeTypeStats[]>(() => {
    const closedTrades = trades.filter((t) => t.수익금 !== null);
    const typeMap = new Map<string, TradeTypeStats>();

    closedTrades.forEach((trade) => {
      const type = trade.거래유형;
      if (!typeMap.has(type)) {
        typeMap.set(type, {
          type,
          count: 0,
          winCount: 0,
          winRate: 0,
          avgProfit: 0,
          totalProfit: 0,
        });
      }

      const stats = typeMap.get(type)!;
      stats.count += 1;
      stats.totalProfit += trade.수익금 || 0;
      if ((trade.수익금 || 0) > 0) {
        stats.winCount += 1;
      }
    });

    return Array.from(typeMap.values())
      .map((stats) => ({
        ...stats,
        winRate: stats.count > 0 ? (stats.winCount / stats.count) * 100 : 0,
        avgProfit: stats.count > 0 ? stats.totalProfit / stats.count : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [trades]);

  // 시간대별 통계
  const hourStats = useMemo<HourStats[]>(() => {
    const closedTrades = trades.filter((t) => t.수익금 !== null);
    const hourMap = new Map<number, { count: number; totalProfit: number }>();

    closedTrades.forEach((trade) => {
      const hour = new Date(trade.거래일시).getHours();
      if (!hourMap.has(hour)) {
        hourMap.set(hour, { count: 0, totalProfit: 0 });
      }
      const stats = hourMap.get(hour)!;
      stats.count += 1;
      stats.totalProfit += trade.수익금 || 0;
    });

    return Array.from(hourMap.entries())
      .map(([hour, { count, totalProfit }]) => ({
        hour: `${hour}시`,
        count,
        avgProfit: count > 0 ? totalProfit / count : 0,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [trades]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; payload: TradeTypeStats }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
          <p className="text-sm font-semibold text-slate-700 mb-2">{data.type}</p>
          <p className="text-sm text-slate-600">거래 수: {data.count}건</p>
          <p className="text-sm text-green-600">승리: {data.winCount}건</p>
          <p className="text-sm text-slate-600">승률: {data.winRate.toFixed(1)}%</p>
          <p className={`text-sm ${data.avgProfit >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            평균 손익: {data.avgProfit >= 0 ? '+' : ''}
            {data.avgProfit.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원
          </p>
        </div>
      );
    }
    return null;
  };

  const HourTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value: number; name: string; payload: HourStats }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded shadow-lg">
          <p className="text-sm font-semibold text-slate-700 mb-2">{data.hour}</p>
          <p className="text-sm text-slate-600">거래 수: {data.count}건</p>
          <p className={`text-sm ${data.avgProfit >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
            평균 손익: {data.avgProfit >= 0 ? '+' : ''}
            {data.avgProfit.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원
          </p>
        </div>
      );
    }
    return null;
  };

  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        거래 데이터가 없어 패턴을 분석할 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 거래유형별 성과 차트 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">📊 거래 유형별 성과</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={tradeTypeStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: '승률 (%)', angle: -90, position: 'insideLeft', fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: '거래 수', angle: 90, position: 'insideRight', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar yAxisId="right" dataKey="count" name="거래 수" fill="#94a3b8" />
            <Bar yAxisId="left" dataKey="winRate" name="승률 (%)" fill="#3b82f6">
              {tradeTypeStats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.winRate >= 60 ? '#10b981' : entry.winRate >= 40 ? '#3b82f6' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 거래유형별 상세 통계 테이블 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">📋 거래 유형별 상세 통계</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 uppercase">
                  거래 유형
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600 uppercase">
                  거래 수
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600 uppercase">
                  승률
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600 uppercase">
                  평균 손익
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-slate-600 uppercase">
                  총 손익
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tradeTypeStats.map((stat) => (
                <tr key={stat.type} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{stat.type}</td>
                  <td className="px-4 py-3 text-right text-slate-700">{stat.count}건</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-semibold ${
                        stat.winRate >= 60
                          ? 'text-green-600'
                          : stat.winRate >= 40
                          ? 'text-slate-700'
                          : 'text-red-600'
                      }`}
                    >
                      {stat.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${stat.avgProfit >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {stat.avgProfit >= 0 ? '+' : ''}
                      {stat.avgProfit.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-bold ${stat.totalProfit >= 0 ? 'text-red-600' : 'text-blue-600'}`}
                    >
                      {stat.totalProfit >= 0 ? '+' : ''}
                      {stat.totalProfit.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 시간대별 거래 분포 - 마지막으로 이동 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">⏰ 시간대별 거래 패턴</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip content={<HourTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" name="거래 수" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
