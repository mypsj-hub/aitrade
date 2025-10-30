/**
 * 최근 거래 내역 테이블
 *
 * 목적: 최근 발생한 거래 내역을 시간순으로 보여주기 위함
 * 역할: 거래 시간, 코인, 유형, 수량, 금액, 사유를 테이블 형식으로 표시
 *
 * 주요 기능:
 * - 최근 거래 내역을 시간순으로 정렬하여 표시
 * - 거래유형별 배지 색상 구분 (매수: 빨강, 매도: 파랑)
 * - 거래 시간을 날짜-시간 형식으로 표시
 * - 거래 사유를 말줄임으로 간결하게 표시
 * - 호버 시 행 하이라이트
 *
 * Props:
 * - trades: TradeHistory[] - 거래 내역 배열
 *
 * 데이터 소스: trade_history 테이블
 * 기술 스택: React, TypeScript, Tailwind CSS
 */
import type { TradeHistory } from '@/lib/types';
import { formatDateTime, formatCurrency } from '@/lib/utils/formatters';

interface Props {
  trades: TradeHistory[];
}

export function RecentTradesTable({ trades }: Props) {
  if (trades.length === 0) {
    return <p className="text-slate-500">거래 내역이 없습니다.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 border-b-2 border-slate-300">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">시간</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">코인</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">유형</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">수량</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">금액</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">손익</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">사유</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="border-b border-slate-200 hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-600 text-xs">{formatDateTime(trade.거래일시)}</td>
              <td className="px-4 py-3 font-semibold text-slate-800">{trade.코인이름}</td>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  (() => {
                    const type = trade.거래유형;
                    const profit = trade.수익금;

                    // 통일된 색상 규칙:
                    // 1. 매수 계열: 초록색 (손익 없음)
                    // 2. 매도/익절/손절 계열: 손익에 따라 색상 결정
                    //    - 손익 > 0: 빨간색 (수익)
                    //    - 손익 < 0: 파란색 (손실)
                    //    - 손익 = 0: 회색

                    if (type.includes('매수') || type.includes('신규') || type.includes('추가')) {
                      return 'bg-green-100 text-green-700';
                    } else if (type.includes('익절') || type.includes('손절') || type.includes('매도')) {
                      if (profit > 0) {
                        return 'bg-red-100 text-red-700'; // 수익 (+)
                      } else if (profit < 0) {
                        return 'bg-blue-100 text-blue-700'; // 손실 (-)
                      } else {
                        return 'bg-slate-100 text-slate-700'; // 손익 0
                      }
                    }

                    return 'bg-slate-100 text-slate-700';
                  })()
                }`}>
                  {trade.거래유형}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-slate-600">{trade.거래수량.toFixed(4)}</td>
              <td className="px-4 py-3 text-right text-slate-900">{formatCurrency(trade.거래금액)}</td>
              <td className="px-4 py-3 text-right">
                {(() => {
                  const value = trade.수익금;
                  if (value === null || value === undefined) return <span className="text-slate-500">-</span>;

                  let colorClass = "text-slate-900";
                  if (value > 0) {
                    colorClass = "text-red-600"; // 수익 (+)
                  } else if (value < 0) {
                    colorClass = "text-blue-600"; // 손실 (-)
                  }

                  return <span className={`font-semibold ${colorClass}`}>{formatCurrency(value)}</span>;
                })()}
              </td>
              <td className="px-4 py-3 text-slate-600 text-xs max-w-xs truncate">{trade.거래사유}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
