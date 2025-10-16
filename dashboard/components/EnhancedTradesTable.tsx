'use client';

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import type { Trade } from '@/lib/types';

interface EnhancedTradesTableProps {
  trades: Trade[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}

export function EnhancedTradesTable({ trades }: EnhancedTradesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: '거래일시', desc: true },
  ]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const columns = useMemo<ColumnDef<Trade>[]>(
    () => [
      {
        accessorKey: '거래일시',
        header: '날짜',
        cell: (info) => formatDateTime(info.getValue() as string),
        size: 100,
      },
      {
        accessorKey: '코인이름',
        header: '코인',
        size: 80,
      },
      {
        accessorKey: '거래유형',
        header: '유형',
        cell: (info) => {
          const type = info.getValue() as string;
          let colorClass = 'bg-slate-100 text-slate-700';
          if (type.includes('익절')) colorClass = 'bg-green-100 text-green-700';
          else if (type.includes('손절')) colorClass = 'bg-red-100 text-red-700';
          else if (type.includes('매수')) colorClass = 'bg-blue-100 text-blue-700';
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
              {type}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: '거래금액',
        header: '거래금액',
        cell: (info) => formatCurrency(info.getValue() as number),
        size: 120,
      },
      {
        accessorKey: '수익금',
        header: '손익',
        cell: (info) => {
          const value = info.getValue() as number | null;
          if (value === null) return '-';
          const colorClass = value >= 0 ? 'text-blue-600' : 'text-red-600';
          return <span className={`font-semibold ${colorClass}`}>{formatCurrency(value)}</span>;
        },
        size: 120,
      },
      {
        id: 'expand',
        header: '상세',
        cell: ({ row }) => (
          <button
            onClick={() => {
              const newExpanded = new Set(expandedRows);
              if (newExpanded.has(row.original.id)) {
                newExpanded.delete(row.original.id);
              } else {
                newExpanded.add(row.original.id);
              }
              setExpandedRows(newExpanded);
            }}
            className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded transition"
          >
            {expandedRows.has(row.original.id) ? '닫기 ▲' : '보기 ▼'}
          </button>
        ),
        size: 80,
      },
    ],
    [expandedRows]
  );

  const table = useReactTable({
    data: trades,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (trades.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        필터 조건에 맞는 거래가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 테이블 */}
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
              <React.Fragment key={row.id}>
                <tr className="hover:bg-slate-50 transition">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {/* 확장된 행 */}
                {expandedRows.has(row.original.id) && (
                  <tr>
                    <td colSpan={columns.length} className="bg-slate-50 px-4 py-4">
                      <div className="space-y-3">
                        {/* AI 사고 과정 */}
                        {row.original.ai_thinking_process && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">
                              💭 AI 사고 과정
                            </h4>
                            <p className="text-sm text-slate-600 whitespace-pre-wrap bg-white p-3 rounded border border-slate-200">
                              {row.original.ai_thinking_process}
                            </p>
                          </div>
                        )}
                        {/* 주요 지표 */}
                        {row.original.주요지표 && (
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-2">
                              📊 거래 당시 지표
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {Object.entries(row.original.주요지표).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="bg-white p-2 rounded border border-slate-200"
                                >
                                  <div className="text-xs text-slate-500">{key}</div>
                                  <div className="text-sm font-medium text-slate-700">
                                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          총 {table.getFilteredRowModel().rows.length}건 중{' '}
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}
          건 표시
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="text-sm text-slate-600">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
