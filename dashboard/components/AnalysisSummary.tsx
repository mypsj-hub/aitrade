/**
 * 분석 기간 성과 요약
 *
 * 목적: 선택된 기간 동안의 거래 성과를 한눈에 보여주기 위함
 * 역할: 총 거래수, 청산 거래수, 총 손익, 승률, 손익비를 카드로 표시
 *
 * 주요 기능:
 * - 총 거래 건수 및 청산 거래 건수 표시
 * - 총 손익 금액 표시 (양수: 빨강, 음수: 파랑)
 * - 승률 퍼센트 표시
 * - 손익비(Profit Factor) 표시
 * - 청산 거래가 없을 때 "해당없음" 표시
 * - 각 지표별 아이콘과 색상 구분
 * - 반응형 그리드 레이아웃
 *
 * Props:
 * - totalTrades: number - 전체 거래 건수 (매수 포함)
 * - closedTradesCount: number - 청산 거래 건수 (매도/익절/손절)
 * - totalProfit: number | null - 총 손익 금액 (청산 거래 없으면 null)
 * - winRate: number | null - 승률 (%) (청산 거래 없으면 null)
 * - profitFactor: number | null - 손익비 (청산 거래 없으면 null)
 *
 * 데이터 소스: 부모 컴포넌트에서 계산된 통계 데이터
 * 기술 스택: React, Tailwind CSS
 */
'use client';

interface AnalysisSummaryProps {
  totalTrades: number;
  closedTradesCount: number;
  totalProfit: number | null;
  winRate: number | null;
  profitFactor: number | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

export function AnalysisSummary({
  totalTrades,
  closedTradesCount,
  totalProfit,
  winRate,
  profitFactor,
}: AnalysisSummaryProps) {
  const metrics = [
    {
      label: '총 거래',
      value: totalTrades,
      suffix: '건',
      subText: `(청산: ${closedTradesCount}건)`,
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      icon: '📊',
      tooltip: '필터링된 전체 거래 수',
    },
    {
      label: '총 손익',
      value: totalProfit !== null ? formatCurrency(totalProfit) : '-',
      suffix: '',
      subText: totalProfit === null ? '청산 거래 없음' : '',
      color: totalProfit !== null && totalProfit >= 0 ? 'text-red-600' : totalProfit !== null ? 'text-blue-600' : 'text-slate-500',
      bgColor: totalProfit !== null && totalProfit >= 0 ? 'bg-red-50' : totalProfit !== null ? 'bg-blue-50' : 'bg-slate-50',
      icon: totalProfit !== null && totalProfit >= 0 ? '💰' : totalProfit !== null ? '📉' : '➖',
      tooltip: totalProfit !== null ? '실현 수익 합계' : '매도/익절/손절 필터 선택 필요',
    },
    {
      label: '승률',
      value: winRate !== null ? winRate.toFixed(1) : '-',
      suffix: winRate !== null ? '%' : '',
      subText: winRate === null ? '청산 거래 없음' : '',
      color: winRate !== null ? 'text-green-600' : 'text-slate-500',
      bgColor: winRate !== null ? 'bg-green-50' : 'bg-slate-50',
      icon: winRate !== null ? '🎯' : '➖',
      tooltip: winRate !== null ? '수익 거래 비율' : '매도/익절/손절 필터 선택 필요',
    },
    {
      label: '손익비',
      value: profitFactor !== null ? profitFactor.toFixed(2) : '-',
      suffix: '',
      subText: profitFactor === null ? '청산 거래 없음' : '',
      color: profitFactor !== null ? 'text-purple-600' : 'text-slate-500',
      bgColor: profitFactor !== null ? 'bg-purple-50' : 'bg-slate-50',
      icon: profitFactor !== null ? '⚖️' : '➖',
      tooltip: profitFactor !== null ? '총이익 ÷ 총손실' : '매도/익절/손절 필터 선택 필요',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">📈 기간내 성과</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`${metric.bgColor} rounded-lg p-4 border border-slate-200`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-2xl">{metric.icon}</span>
              <span className="text-xs text-slate-500">{metric.label}</span>
            </div>
            <div className="flex items-baseline mb-1">
              <span className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </span>
              {metric.suffix && (
                <span className="ml-1 text-sm text-slate-500">{metric.suffix}</span>
              )}
            </div>
            {metric.subText && (
              <p className="text-[10px] text-slate-500 mb-1">{metric.subText}</p>
            )}
            <p className="text-[10px] text-slate-400">{metric.tooltip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
