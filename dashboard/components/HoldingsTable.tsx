/**
 * 보유 자산 테이블
 *
 * 목적: 현재 보유 중인 암호화폐 자산을 상세하게 표시하기 위함
 * 역할: 각 코인별 보유수량, 평가금액, 수익률, 상태, AI 판단 정보 제공
 *
 * 주요 기능:
 * - 보유 코인 목록을 테이블 형식으로 표시
 * - 관리상태별 탭 필터링 (전체/활성/제외) - 기본값: 활성
 * - 보유수량, 평가금액, 수익률 표시
 * - 수익률에 따른 색상 구분 (양수: 빨강, 음수: 파랑)
 * - 현재 상태 배지 표시 (보유중/청산)
 * - 관리상태 배지 표시 (활성/제외)
 * - AI의 매매판단 표시
 * - 호버 시 행 하이라이트
 * - 신규 편입 코인 🆕 배지 표시 (최근 7일)
 *
 * Props:
 * - holdings: HoldingStatus[] - 보유 자산 배열
 *
 * 데이터 소스: holding_status 테이블
 * 기술 스택: React, TypeScript, Tailwind CSS
 */
'use client';

import { useState, useMemo } from 'react';
import type { HoldingStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { useNewCoins } from '@/lib/hooks/useNewCoins';

type TabType = '전체' | '활성' | '제외';

interface Props {
  holdings: HoldingStatus[];
}

export function HoldingsTable({ holdings }: Props) {
  const { newCoins } = useNewCoins(7);
  const [activeTab, setActiveTab] = useState<TabType>('활성');

  // 신규 편입 코인 체크 함수
  const isNewCoin = (코인이름: string) => {
    return newCoins.some((coin) => coin.코인이름 === 코인이름);
  };

  // 관리상태별 필터링
  const filteredHoldings = useMemo(() => {
    if (activeTab === '전체') return holdings;
    if (activeTab === '활성') {
      return holdings.filter((h) => {
        const status = h.관리상태?.toUpperCase();
        return status === 'ACTIVE' || status === '활성';
      });
    }
    if (activeTab === '제외') {
      return holdings.filter((h) => {
        const status = h.관리상태?.toUpperCase();
        return status === 'EXCLUDED' || status === '제외';
      });
    }
    return holdings;
  }, [holdings, activeTab]);

  // 탭별 개수 계산
  const tabCounts = useMemo(() => {
    const active = holdings.filter((h) => {
      const status = h.관리상태?.toUpperCase();
      return status === 'ACTIVE' || status === '활성';
    }).length;
    const excluded = holdings.filter((h) => {
      const status = h.관리상태?.toUpperCase();
      return status === 'EXCLUDED' || status === '제외';
    }).length;
    return {
      전체: holdings.length,
      활성: active,
      제외: excluded,
    };
  }, [holdings]);

  if (holdings.length === 0) {
    return <p className="text-slate-500">보유 자산이 없습니다.</p>;
  }

  return (
    <div>
      {/* 탭 메뉴 */}
      <div className="flex gap-2 mb-4 border-b border-slate-200">
        {(['전체', '활성', '제외'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold text-sm transition-colors relative ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            <span className="ml-2 text-xs">({tabCounts[tab]})</span>
          </button>
        ))}
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 border-b-2 border-slate-300">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">코인</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">보유수량</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">평가금액</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">수익률</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">상태</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">관리상태</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">AI 판단</th>
          </tr>
        </thead>
        <tbody>
          {filteredHoldings.map((holding) => {
            const 관리상태Upper = holding.관리상태?.toUpperCase();
            const isActive = 관리상태Upper === 'ACTIVE' || 관리상태Upper === '활성';
            const isExcluded = 관리상태Upper === 'EXCLUDED' || 관리상태Upper === '제외';

            return (
              <tr key={holding.코인이름} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span>{holding.코인이름}</span>
                    {isNewCoin(holding.코인이름) && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-400 rounded animate-pulse">
                        🆕 NEW
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{holding.보유수량.toFixed(4)}</td>
                <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(holding.평가금액)}</td>
                <td className={`px-4 py-3 text-right font-bold ${holding.수익률 >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {holding.수익률.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    holding.현재상태 === '보유중' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {holding.현재상태}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : isExcluded
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isActive ? '활성' : isExcluded ? '제외' : holding.관리상태 || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-slate-600">{holding.매매판단}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {filteredHoldings.length === 0 && (
        <div className="py-8 text-center text-slate-500">
          {activeTab} 상태의 자산이 없습니다.
        </div>
      )}
    </div>
    </div>
  );
}
