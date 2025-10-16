/**
 * 오늘의 주요 거래 카드
 *
 * 목적: 당일 발생한 주요 거래들을 한눈에 파악하기 위함
 * 역할: 최대 수익, 최대 손실, 최근 거래를 각각 카드로 표시
 *
 * 주요 기능:
 * - 오늘 거래 중 최대 수익 거래 표시
 * - 오늘 거래 중 최대 손실 거래 표시
 * - 가장 최근에 발생한 거래 표시
 * - 각 거래의 코인명, 거래유형, 수익금, 시간 표시
 * - 색상으로 거래 유형 구분 (수익: 파랑, 손실: 빨강, 최근: 회색)
 * - 60초마다 자동 갱신
 *
 * 데이터 소스: trade_history 테이블 (당일 데이터만)
 * 기술 스택: SWR, Supabase
 */
'use client';

import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { formatDateTime, formatCurrency } from '@/lib/utils/formatters';

interface Trade {
  코인이름: string;
  거래유형: string;
  수익금: number;
  거래일시: string;
}

interface KeyTrades {
  maxProfit: Trade | null;
  maxLoss: Trade | null;
  latest: Trade | null;
}

async function fetchKeyTrades(): Promise<KeyTrades> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayTrades } = await supabase
    .from('trade_history')
    .select('코인이름, 거래유형, 수익금, 거래일시')
    .gte('거래일시', today.toISOString())
    .order('거래일시', { ascending: false });

  const trades = (todayTrades || []) as unknown as Trade[];

  if (trades.length === 0) {
    return { maxProfit: null, maxLoss: null, latest: null };
  }

  // 최대 수익 거래
  const profitTrades = trades.filter((t) => (t.수익금 || 0) > 0);
  const maxProfit = profitTrades.length > 0
    ? profitTrades.reduce((max, t) => ((t.수익금 || 0) > (max.수익금 || 0) ? t : max))
    : null;

  // 최대 손실 거래
  const lossTrades = trades.filter((t) => (t.수익금 || 0) < 0);
  const maxLoss = lossTrades.length > 0
    ? lossTrades.reduce((max, t) => ((t.수익금 || 0) < (max.수익금 || 0) ? t : max))
    : null;

  // 최근 거래
  const latest = trades[0];

  return { maxProfit, maxLoss, latest };
}

export function KeyTradesCard() {
  const { data, isLoading } = useSWR<KeyTrades>(
    'key-trades-today',
    fetchKeyTrades,
    { refreshInterval: 60000 }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">⭐ 오늘의 주요 거래</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const trades = [
    {
      label: '최대 수익',
      trade: data?.maxProfit,
      icon: '🚀',
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
    },
    {
      label: '최대 손실',
      trade: data?.maxLoss,
      icon: '📉',
      colorClass: 'text-red-600',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-200',
    },
    {
      label: '최근 거래',
      trade: data?.latest,
      icon: '🔔',
      colorClass: 'text-slate-700',
      bgClass: 'bg-slate-50',
      borderClass: 'border-slate-200',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">⭐ 오늘의 주요 거래</h2>

      <div className="space-y-3">
        {trades.map((item) => (
          <div
            key={item.label}
            className={`${item.bgClass} rounded-lg p-4 border ${item.borderClass} hover:shadow-md transition`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-xs text-slate-500 mb-1">{item.label}</div>
                  {item.trade ? (
                    <>
                      <div className="font-semibold text-slate-800">
                        {item.trade.코인이름} · {item.trade.거래유형}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDateTime(item.trade.거래일시)}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-slate-400">거래 없음</div>
                  )}
                </div>
              </div>
              {item.trade && (
                <div className={`text-lg font-bold ${item.colorClass}`}>
                  {formatCurrency(item.trade.수익금 || 0)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!data?.maxProfit && !data?.maxLoss && !data?.latest && (
        <div className="text-center text-slate-500 text-sm mt-4">
          오늘 아직 거래가 없습니다.
        </div>
      )}
    </div>
  );
}
