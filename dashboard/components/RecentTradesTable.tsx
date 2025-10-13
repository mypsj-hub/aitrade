import type { TradeHistory } from '@/lib/types';

interface Props {
  trades: TradeHistory[];
}

export function RecentTradesTable({ trades }: Props) {
  if (trades.length === 0) {
    return <p className="text-slate-500">거래 내역이 없습니다.</p>;
  }

  const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(Math.round(num));

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
            <th className="px-4 py-3 text-left font-semibold text-slate-700">사유</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="border-b border-slate-200 hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-600 text-xs">{trade.거래일시}</td>
              <td className="px-4 py-3 font-semibold text-slate-800">{trade.코인이름}</td>
              <td className="px-4 py-3 text-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  trade.거래유형.includes('매수') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {trade.거래유형}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-slate-600">{trade.거래수량.toFixed(4)}</td>
              <td className="px-4 py-3 text-right text-slate-900">₩{formatNumber(trade.거래금액)}</td>
              <td className="px-4 py-3 text-slate-600 text-xs max-w-xs truncate">{trade.거래사유}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
