/**
 * 보유 자산 테이블
 *
 * 목적: 현재 보유 중인 암호화폐 자산을 상세하게 표시하기 위함
 * 역할: 각 코인별 보유수량, 평가금액, 수익률, 상태, AI 판단 정보 제공
 *
 * 주요 기능:
 * - 보유 코인 목록을 테이블 형식으로 표시
 * - 보유수량, 평가금액, 수익률 표시
 * - 수익률에 따른 색상 구분 (양수: 빨강, 음수: 파랑)
 * - 현재 상태 배지 표시 (보유중/청산)
 * - AI의 매매판단 표시
 * - 호버 시 행 하이라이트
 *
 * Props:
 * - holdings: HoldingStatus[] - 보유 자산 배열
 *
 * 데이터 소스: holding_status 테이블
 * 기술 스택: React, TypeScript, Tailwind CSS
 */
import type { HoldingStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/utils/formatters';

interface Props {
  holdings: HoldingStatus[];
}

export function HoldingsTable({ holdings }: Props) {
  if (holdings.length === 0) {
    return <p className="text-slate-500">보유 자산이 없습니다.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 border-b-2 border-slate-300">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-700">코인</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">보유수량</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">평가금액</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-700">수익률</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">상태</th>
            <th className="px-4 py-3 text-center font-semibold text-slate-700">AI 판단</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.코인이름} className="border-b border-slate-200 hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold text-slate-800">{holding.코인이름}</td>
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
              <td className="px-4 py-3 text-center text-slate-600">{holding.매매판단}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
