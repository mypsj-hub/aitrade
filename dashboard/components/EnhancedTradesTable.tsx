/**
 * 고급 거래 내역 테이블
 *
 * 목적: 거래 데이터를 정렬, 필터링, 페이지네이션과 함께 상세하게 표시하기 위함
 * 역할: TanStack Table을 활용한 인터랙티브한 거래 내역 테이블
 *
 * 주요 기능:
 * - 거래일시, 코인, 유형, 거래금액, 손익 컬럼 표시
 * - 컬럼별 정렬 기능 (오름차순/내림차순)
 * - 코인 이름으로 검색 필터링
 * - 행 확장 기능으로 AI 사고 과정과 주요 지표 상세 보기
 * - 페이지네이션 (페이지당 20건)
 * - 거래유형별 색상 배지
 * - 손익에 따른 색상 구분
 *
 * Props:
 * - trades: Trade[] - 거래 내역 배열
 *
 * 데이터 소스: trade_history 테이블
 * 기술 스택: TanStack Table v8, date-fns
 */
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
  const [globalFilter, setGlobalFilter] = useState<string>('');

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
          const row = info.row.original;
          const profit = row.수익금;
          let colorClass = 'bg-slate-100 text-slate-700';

          // 통일된 색상 규칙:
          // 1. 매수 계열: 초록색 (손익 없음)
          // 2. 매도/익절/손절 계열: 손익에 따라 색상 결정
          //    - 손익 > 0: 빨간색 (수익)
          //    - 손익 < 0: 파란색 (손실)
          //    - 손익 = 0: 회색

          if (type.includes('매수') || type.includes('신규') || type.includes('추가')) {
            // 매수 계열은 항상 초록색
            colorClass = 'bg-green-100 text-green-700';
          } else if (type.includes('익절') || type.includes('손절') || type.includes('매도')) {
            // 매도/익절/손절 계열은 손익에 따라 색상 결정
            if (profit !== null && profit !== undefined) {
              if (profit > 0) {
                colorClass = 'bg-red-100 text-red-700'; // 수익 (+)
              } else if (profit < 0) {
                colorClass = 'bg-blue-100 text-blue-700'; // 손실 (-)
              } else {
                colorClass = 'bg-slate-100 text-slate-700'; // 손익 0
              }
            } else {
              colorClass = 'bg-slate-100 text-slate-700';
            }
          }

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

          // 손익 색상:
          // - 양수 (+): 빨간색 (수익)
          // - 음수 (-): 파란색 (손실)
          // - 0: 검정색
          let colorClass = 'text-slate-900';
          if (value > 0) {
            colorClass = 'text-red-600';
          } else if (value < 0) {
            colorClass = 'text-blue-600';
          }

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
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
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
      {/* 검색창 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="코인 이름으로 검색... (예: BTC, ETH)"
            className="w-full px-4 py-2 pl-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {globalFilter && (
          <button
            onClick={() => setGlobalFilter('')}
            className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            초기화
          </button>
        )}
      </div>

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
