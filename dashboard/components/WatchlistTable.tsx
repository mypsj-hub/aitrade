/**
 * 🔍 AI 관심 코인 테이블 (WatchlistTable)
 *
 * 목적: coin_watch_history 테이블의 관심 코인 목록을 표시
 *
 * 주요 기능:
 * 1. AI가 선정한 3-4순위 관심 코인 표시
 * 2. 순위, 퍼널타입, 점수, 등록일 정보 제공
 * 3. 퍼널타입별 배지 표시 (Momentum Hunter / Quality Compounder)
 *
 * 데이터 소스: coin_watch_history 테이블
 */
'use client';

import type { WatchlistCoin } from '@/lib/types';
import { format } from 'date-fns';

interface WatchlistTableProps {
  watchlist: WatchlistCoin[];
}

export function WatchlistTable({ watchlist }: WatchlistTableProps) {
  if (!watchlist || watchlist.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>현재 관심 코인이 없습니다.</p>
        <p className="text-sm mt-2">AI가 분석한 3-4순위 코인이 여기에 표시됩니다.</p>
      </div>
    );
  }

  // 퍼널타입 배지 색상
  const getFunnelBadgeColor = (funnelType: string) => {
    if (funnelType === 'momentum_hunter') {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    } else if (funnelType === 'quality_compounder') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  // 퍼널타입 한글명
  const getFunnelName = (funnelType: string) => {
    if (funnelType === 'momentum_hunter') return '모멘텀 헌터';
    if (funnelType === 'quality_compounder') return '퀄리티 컴파운더';
    return funnelType;
  };

  // 순위 배지 색상
  const getRankBadgeColor = (rank: number) => {
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (rank === 4) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">순위</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">코인</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">퍼널타입</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">점수</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">등록일</th>
          </tr>
        </thead>
        <tbody>
          {watchlist.map((coin, index) => (
            <tr
              key={coin.코인이름}
              className={`
                border-b border-slate-100 hover:bg-slate-50 transition
                ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
              `}
            >
              {/* 순위 */}
              <td className="px-4 py-3">
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                  ${getRankBadgeColor(coin.순위)}
                `}>
                  {coin.순위}순위
                </span>
              </td>

              {/* 코인 이름 */}
              <td className="px-4 py-3">
                <span className="font-semibold text-slate-900">{coin.코인이름}</span>
              </td>

              {/* 퍼널타입 */}
              <td className="px-4 py-3">
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                  ${getFunnelBadgeColor(coin.퍼널타입)}
                `}>
                  {getFunnelName(coin.퍼널타입)}
                </span>
              </td>

              {/* 점수 */}
              <td className="px-4 py-3 text-right">
                <span className="text-sm font-medium text-slate-900">
                  {coin.점수.toFixed(2)}
                </span>
              </td>

              {/* 등록일 */}
              <td className="px-4 py-3 text-right">
                <span className="text-sm text-slate-600">
                  {format(new Date(coin.최초등록일), 'yyyy-MM-dd')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 하단 안내 문구 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          💡 <span className="font-semibold">관심 코인이란?</span> AI가 선정한 3-4순위 코인으로,
          향후 상승 가능성이 있어 모니터링 중인 종목입니다.
          7일간 관찰 후 자동 제거되며, 긴급도가 높아지면 CIO 분석에 포함됩니다.
        </p>
      </div>
    </div>
  );
}
