'use client';

import React from "react";
/**
 * CIO 전략실 테이블 컴포넌트 (아코디언 스타일)
 *
 * 목적: cio_portfolio_decisions 테이블의 모든 필드를 표시하는 종합 테이블
 *
 * 주요 기능:
 * - 활성 코인만 표시
 * - 정렬 기능 (모든 컬럼)
 * - 행 클릭 시 세부 정보 펼치기/접기 (아코디언 스타일)
 * - 모바일 반응형 (카드형 레이아웃)
 *
 * Props:
 * - selectedDate: Date - 조회할 날짜
 *
 * 데이터 소스: cio_portfolio_decisions 테이블
 */

import { useCIODecisions, type CIODecision } from '@/lib/hooks/useCIODecisions';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  selectedDate?: Date;
}

type SortKey = keyof CIODecision;
type SortDirection = 'asc' | 'desc';

export function CIODecisionsTable({ selectedDate }: Props) {
  const { decisions, isLoading, error } = useCIODecisions(selectedDate);
  const [sortKey, setSortKey] = useState<SortKey>('결정시각');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [expandedCoin, setExpandedCoin] = useState<string | null>(null);

  // 코인별 최신 결정만 추출 + 활성 상태만 필터링
  const latestDecisions = useMemo(() => {
    const decisionsMap = new Map<string, CIODecision>();

    for (const decision of decisions) {
      const existing = decisionsMap.get(decision.코인이름);

      if (!existing || decision.결정시각 > existing.결정시각) {
        decisionsMap.set(decision.코인이름, decision);
      }
    }

    // 활성 상태만 필터링
    return Array.from(decisionsMap.values()).filter((d) => {
      const status = d.관리상태?.toUpperCase();
      return status === 'ACTIVE' || status === '활성';
    });
  }, [decisions]);

  // 정렬
  const sortedDecisions = useMemo(() => {
    const sorted = [...latestDecisions];

    sorted.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // null/undefined 처리
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // 숫자 비교
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // 문자열 비교
      const aStr = String(aVal);
      const bStr = String(bVal);
      const comparison = aStr.localeCompare(bStr, 'ko');
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [latestDecisions, sortKey, sortDirection]);

  // 정렬 핸들러
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // 행 클릭 핸들러 (펼치기/접기)
  const handleRowClick = (coinName: string) => {
    setExpandedCoin(expandedCoin === coinName ? null : coinName);
  };

  // 전략근거에서 정보 추출
  const extractMarketCap = (전략근거: string): string | null => {
    if (!전략근거) return null;
    if (전략근거.includes('메가캡')) return '메가캡';
    if (전략근거.includes('미드캡')) return '미드캡';
    if (전략근거.includes('스몰캡')) return '스몰캡';
    return null;
  };

  const extractSector = (전략근거: string): string | null => {
    if (!전략근거) return null;
    const match = 전략근거.match(/,\s*(Layer-\d+|Other|DeFi|AI|Meme|Gaming|Infrastructure)(\s*섹터)?/i);
    return match ? match[1] : null;
  };

  const extractLiquidity = (전략근거: string): string | null => {
    if (!전략근거) return null;
    const match = 전략근거.match(/([A-C])등급\s*유동성/);
    return match ? `${match[1]}등급` : null;
  };

  // 로딩/에러 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-red-600 text-center py-12">
          ⚠️ 데이터 로드 실패: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4 sm:mb-0">
          📊 CIO 의사결정 현황 (활성 코인)
        </h2>
        <div className="text-sm text-slate-500">
          총 {sortedDecisions.length}개 코인
        </div>
      </div>

      {/* 데스크톱: 테이블 뷰 (아코디언 스타일) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b-2 border-slate-200">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <SortableHeader title="코인" sortKey="코인이름" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortableHeader title="결정시각" sortKey="결정시각" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortableHeader title="관리상태" sortKey="관리상태" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortableHeader title="목표비중" sortKey="목표비중" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortableHeader title="이전목표비중" sortKey="이전목표비중" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortableHeader title="현재비중" sortKey="현재보유비중" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
              <SortableHeader title="비중변화" sortKey="비중변화량" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {sortedDecisions.map((decision, index) => {
              const isExpanded = expandedCoin === decision.코인이름;
              const 시총등급 = extractMarketCap(decision.전략근거);
              const 섹터 = extractSector(decision.전략근거);
              const 유동성 = extractLiquidity(decision.전략근거);

              return (
                <React.Fragment key={`${decision.코인이름}-${decision.결정시각}-${index}`}>
                  {/* 메인 행 */}
                  <tr
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(decision.코인이름)}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{decision.코인이름}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {format(new Date(decision.결정시각), 'HH:mm:ss', { locale: ko })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={decision.관리상태} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-600">
                      {decision.목표비중?.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {decision.이전목표비중 !== null ? `${decision.이전목표비중.toFixed(1)}%` : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {decision.현재보유비중?.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      <WeightChange value={decision.비중변화량} />
                    </td>
                  </tr>

                  {/* 펼쳐지는 세부 정보 행 */}
                  {isExpanded && (
                    <tr className="bg-slate-50">
                      <td colSpan={8} className="px-6 py-6">
                        <div className="space-y-5">
                          {/* 관리 정보 */}
                          <section>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                              <span>⚙️</span> 관리 정보
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                              {decision.목표수익률 !== null && (
                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                  <span className="text-xs text-slate-500">목표 수익률</span>
                                  <div className="font-semibold text-green-600 text-sm">{decision.목표수익률?.toFixed(1)}%</div>
                                </div>
                              )}
                              {decision.목표손절률 !== null && (
                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                  <span className="text-xs text-slate-500">목표 손절률</span>
                                  <div className="font-semibold text-red-600 text-sm">{decision.목표손절률?.toFixed(1)}%</div>
                                </div>
                              )}
                              {시총등급 && (
                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                  <span className="text-xs text-slate-500">시총 등급</span>
                                  <div className="font-semibold text-slate-900 text-sm">{시총등급}</div>
                                </div>
                              )}
                              {섹터 && (
                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                  <span className="text-xs text-slate-500">섹터</span>
                                  <div className="font-semibold text-slate-900 text-sm">{섹터}</div>
                                </div>
                              )}
                              {유동성 && (
                                <div className="bg-white p-3 rounded-lg border border-slate-200">
                                  <span className="text-xs text-slate-500">유동성</span>
                                  <div className="font-semibold text-slate-900 text-sm">{유동성}</div>
                                </div>
                              )}
                            </div>
                          </section>

                          {/* 전략 근거 */}
                          {decision.전략근거 && (
                            <section>
                              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <span>📝</span> 전략 근거
                              </h4>
                              <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                  {decision.전략근거}
                                </p>
                              </div>
                            </section>
                          )}

                          {/* 기술 지표 */}
                          {decision.기술지표 && Object.keys(decision.기술지표).length > 0 && (
                            <section>
                              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <span>📈</span> 기술 지표
                              </h4>
                              <div className="bg-white p-4 rounded-lg border border-slate-200">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {Object.entries(decision.기술지표).map(([key, value]) => (
                                    <div key={key} className="text-sm">
                                      <span className="text-slate-500">{key}:</span>{' '}
                                      <span className="font-semibold text-slate-900">
                                        {typeof value === 'number' ? value.toFixed(2) : value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </section>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모바일: 카드 뷰 (아코디언 스타일) */}
      <div className="lg:hidden space-y-4">
        {sortedDecisions.map((decision, index) => {
          const isExpanded = expandedCoin === decision.코인이름;
          const 시총등급 = extractMarketCap(decision.전략근거);
          const 섹터 = extractSector(decision.전략근거);
          const 유동성 = extractLiquidity(decision.전략근거);

          return (
            <div
              key={`${decision.코인이름}-${decision.결정시각}-${index}`}
              className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* 카드 헤더 (클릭 가능) */}
              <div
                className="p-4 cursor-pointer bg-white"
                onClick={() => handleRowClick(decision.코인이름)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`transition-transform inline-block ${isExpanded ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{decision.코인이름}</h3>
                  </div>
                  <StatusBadge status={decision.관리상태} />
                </div>

                <div className="text-xs text-slate-500 mb-3">
                  {format(new Date(decision.결정시각), 'PPP HH:mm:ss', { locale: ko })}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-slate-500">목표 비중</div>
                    <div className="text-lg font-bold text-blue-600">
                      {decision.목표비중?.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">이전 목표</div>
                    <div className="text-sm font-semibold text-slate-500">
                      {decision.이전목표비중 !== null ? `${decision.이전목표비중.toFixed(1)}%` : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">현재 비중</div>
                    <div className="text-lg font-semibold text-slate-700">
                      {decision.현재보유비중?.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {decision.비중변화량 != null && (
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-slate-500">비중 변화:</span>
                    <WeightChange value={decision.비중변화량} />
                  </div>
                )}
              </div>

              {/* 펼쳐지는 세부 정보 */}
              {isExpanded && (
                <div className="bg-slate-50 p-4 space-y-4 border-t border-slate-200">
                  {/* 관리 정보 그리드 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {decision.목표수익률 !== null && (
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500">목표 수익:</span>
                        <span className="ml-1 font-semibold text-green-600">{decision.목표수익률?.toFixed(1)}%</span>
                      </div>
                    )}
                    {decision.목표손절률 !== null && (
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500">목표 손절:</span>
                        <span className="ml-1 font-semibold text-red-600">{decision.목표손절률?.toFixed(1)}%</span>
                      </div>
                    )}
                    {시총등급 && (
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500">시총:</span>
                        <span className="ml-1 font-semibold">{시총등급}</span>
                      </div>
                    )}
                    {섹터 && (
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500">섹터:</span>
                        <span className="ml-1 font-semibold">{섹터}</span>
                      </div>
                    )}
                    {유동성 && (
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500">유동성:</span>
                        <span className="ml-1 font-semibold">{유동성}</span>
                      </div>
                    )}
                  </div>

                  {/* 전략 근거 */}
                  {decision.전략근거 && (
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <h5 className="text-xs font-bold text-slate-800 mb-2">📝 전략 근거</h5>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {decision.전략근거}
                      </p>
                    </div>
                  )}

                  {/* 기술 지표 */}
                  {decision.기술지표 && Object.keys(decision.기술지표).length > 0 && (
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <h5 className="text-xs font-bold text-slate-800 mb-2">📈 기술 지표</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(decision.기술지표).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="text-slate-500">{key}:</span>{' '}
                            <span className="font-semibold text-slate-900">
                              {typeof value === 'number' ? value.toFixed(2) : value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 빈 상태 */}
      {sortedDecisions.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          해당 날짜의 활성 코인이 없습니다.
        </div>
      )}
    </div>
  );
}

/**
 * 정렬 가능한 테이블 헤더
 */
interface SortableHeaderProps {
  title: string;
  sortKey: SortKey;
  currentKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
}

function SortableHeader({ title, sortKey, currentKey, direction, onSort }: SortableHeaderProps) {
  const isActive = sortKey === currentKey;

  return (
    <th
      className="px-4 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{title}</span>
        {isActive && (
          <span className="text-blue-600">
            {direction === 'asc' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </th>
  );
}

/**
 * 관리 상태 배지
 */
function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase();

  let bgColor = 'bg-slate-100';
  let textColor = 'text-slate-700';

  if (normalized === 'ACTIVE' || normalized === '활성') {
    bgColor = 'bg-green-100';
    textColor = 'text-green-700';
  } else if (normalized === 'REVIEW' || normalized === '재평가') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
  } else if (normalized === 'EXCLUDED' || normalized === '제외') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}

/**
 * 비중 변화량 표시
 */
function WeightChange({ value }: { value?: number | null }) {
  if (value == null) return <span className="text-slate-400">-</span>;

  const color = value >= 0 ? 'text-green-600' : 'text-red-600';
  const prefix = value > 0 ? '+' : '';

  return (
    <span className={`font-semibold ${color}`}>
      {prefix}
      {value.toFixed(1)}%p
    </span>
  );
}
