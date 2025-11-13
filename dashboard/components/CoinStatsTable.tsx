/**
 * 코인별 통계 테이블
 *
 * 목적: 각 코인별 거래 성과를 집계하여 비교 분석하기 위함
 * 역할: 코인별 거래수, 승률, 평균/최대 손익, 손익비, 총 손익을 테이블로 표시
 *
 * 주요 기능:
 * - 코인별 거래 통계 자동 집계
 * - 거래수, 승률, 평균 손익, 최대 이익/손실, 손익비, 총 손익 표시
 * - 승률과 손익비에 따른 색상 구분
 * - 컬럼별 정렬 기능 (기본: 총 손익 내림차순)
 * - 청산된 거래만 통계 계산
 * - TanStack Table로 인터랙티브한 테이블 구현
 *
 * Props:
 * - trades: Trade[] - 거래 내역 배열
 *
 * 데이터 소스: trade_history 테이블
 * 기술 스택: TanStack Table v8, React
 */
'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import type { Trade } from '@/lib/types';

interface CoinStatsTableProps {
  trades: Trade[];
}

interface CoinStats {
  coin: string;
  totalTrades: number;
  winCount: number;
  loseCount: number;
  winRate: number;
  totalProfit: number;
  avgProfit: number;
  maxProfit: number;
  maxLoss: number;
  profitFactor: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function CoinStatsTable({ trades }: CoinStatsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'totalProfit', desc: true },
  ]);

  const coinStats = useMemo<CoinStats[]>(() => {
    const statsMap = new Map<string, CoinStats>();

    // 청산 거래만 필터링
    const closedTrades = trades.filter((t) => t.수익금 !== null);

    closedTrades.forEach((trade) => {
      const coin = trade.코인이름;
      const profit = trade.수익금 || 0;

      if (!statsMap.has(coin)) {
        statsMap.set(coin, {
          coin,
          totalTrades: 0,
          winCount: 0,
          loseCount: 0,
          winRate: 0,
          totalProfit: 0,
          avgProfit: 0,
          maxProfit: -Infinity,
          maxLoss: Infinity,
          profitFactor: 0,
        });
      }

      const stats = statsMap.get(coin)!;
      stats.totalTrades += 1;
      stats.totalProfit += profit;

      if (profit > 0) {
        stats.winCount += 1;
        stats.maxProfit = Math.max(stats.maxProfit, profit);
      } else if (profit < 0) {
        stats.loseCount += 1;
        stats.maxLoss = Math.min(stats.maxLoss, profit);
      }
    });

    // 최종 계산
    return Array.from(statsMap.values()).map((stats) => {
      stats.winRate = stats.totalTrades > 0 ? (stats.winCount / stats.totalTrades) * 100 : 0;
      stats.avgProfit = stats.totalTrades > 0 ? stats.totalProfit / stats.totalTrades : 0;

      // 손익비 계산
      const grossProfit = closedTrades
        .filter((t) => t.코인이름 === stats.coin && (t.수익금 || 0) > 0)
        .reduce((sum, t) => sum + (t.수익금 || 0), 0);
      const grossLoss = Math.abs(
        closedTrades
          .filter((t) => t.코인이름 === stats.coin && (t.수익금 || 0) < 0)
          .reduce((sum, t) => sum + (t.수익금 || 0), 0)
      );
      stats.profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;

      // maxProfit과 maxLoss가 초기값이면 0으로 설정
      if (stats.maxProfit === -Infinity) stats.maxProfit = 0;
      if (stats.maxLoss === Infinity) stats.maxLoss = 0;

      return stats;
    });
  }, [trades]);

  const columns = useMemo<ColumnDef<CoinStats>[]>(
    () => [
      {
        accessorKey: 'coin',
        header: '코인',
        cell: (info) => (
          <span className="font-semibold text-slate-800">{info.getValue() as string}</span>
        ),
        size: 80,
      },
      {
        accessorKey: 'totalTrades',
        header: '거래수',
        cell: (info) => <span className="text-slate-700">{info.getValue() as number}건</span>,
        size: 80,
      },
      {
        accessorKey: 'winRate',
        header: '승률',
        cell: (info) => {
          const value = info.getValue() as number;
          const colorClass =
            value >= 60 ? 'text-green-600' : value >= 40 ? 'text-slate-700' : 'text-red-600';
          return <span className={`font-semibold ${colorClass}`}>{formatPercent(value)}</span>;
        },
        size: 80,
      },
      {
        accessorKey: 'avgProfit',
        header: '평균 손익',
        cell: (info) => {
          const value = info.getValue() as number;
          const colorClass = value >= 0 ? 'text-red-600' : 'text-blue-600';
          return (
            <span className={`font-semibold ${colorClass}`}>
              {value >= 0 ? '+' : ''}
              {formatCurrency(value)}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'maxProfit',
        header: '최대 이익',
        cell: (info) => (
          <span className="text-red-600 font-semibold">
            +{formatCurrency(info.getValue() as number)}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: 'maxLoss',
        header: '최대 손실',
        cell: (info) => {
          const value = info.getValue() as number;
          return (
            <span className="text-blue-600 font-semibold">
              {value === 0 ? '-' : formatCurrency(value)}
            </span>
          );
        },
        size: 120,
      },
      {
        accessorKey: 'profitFactor',
        header: '손익비',
        cell: (info) => {
          const value = info.getValue() as number;
          const displayValue = value >= 999 ? '∞' : value.toFixed(2);
          const colorClass =
            value >= 2 ? 'text-green-600' : value >= 1 ? 'text-slate-700' : 'text-red-600';
          return <span className={`font-semibold ${colorClass}`}>{displayValue}</span>;
        },
        size: 80,
      },
      {
        accessorKey: 'totalProfit',
        header: '총 손익',
        cell: (info) => {
          const value = info.getValue() as number;
          const colorClass = value >= 0 ? 'text-red-600' : 'text-blue-600';
          return (
            <span className={`font-bold ${colorClass}`}>
              {value >= 0 ? '+' : ''}
              {formatCurrency(value)}
            </span>
          );
        },
        size: 140,
      },
    ],
    []
  );

  const table = useReactTable({
    data: coinStats,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (coinStats.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="inline-block p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-lg text-slate-600 mb-2">📊 청산 거래 없음</p>
          <p className="text-sm text-slate-500 mb-3">
            선택된 필터에 청산 거래가 없어 코인별 통계를 집계할 수 없습니다.
          </p>
          <p className="text-xs text-slate-400">
            💡 <strong>매도</strong>, <strong>익절</strong>, <strong>손절</strong> 필터를 포함하여 선택하세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ▲',
                      desc: ' ▼',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
