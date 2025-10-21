/**
 * 분석 기간 성과 요약
 *
 * 목적: 선택된 기간 동안의 거래 성과를 한눈에 보여주기 위함
 * 역할: 총 거래수, 총 손익, 승률, 손익비를 4개 카드로 표시
 *
 * 주요 기능:
 * - 총 거래 건수 표시
 * - 총 손익 금액 표시 (양수: 빨강, 음수: 파랑)
 * - 승률 퍼센트 표시
 * - 손익비(Profit Factor) 표시
 * - 각 지표별 아이콘과 색상 구분
 * - 반응형 그리드 레이아웃
 *
 * Props:
 * - totalTrades: number - 총 거래 건수
 * - totalProfit: number - 총 손익 금액
 * - winRate: number - 승률 (%)
 * - profitFactor: number - 손익비
 *
 * 데이터 소스: 부모 컴포넌트에서 계산된 통계 데이터
 * 기술 스택: React, Tailwind CSS
 */
'use client';

interface AnalysisSummaryProps {
  totalTrades: number;
  totalProfit: number;
  winRate: number;
  profitFactor: number;
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
  totalProfit,
  winRate,
  profitFactor,
}: AnalysisSummaryProps) {
  const metrics = [
    {
      label: '총 거래',
      value: totalTrades,
      suffix: '건',
      color: 'text-slate-700',
      bgColor: 'bg-slate-50',
      icon: '📊',
      tooltip: '매도 완료 거래 수',
    },
    {
      label: '총 손익',
      value: formatCurrency(totalProfit),
      suffix: '',
      color: totalProfit >= 0 ? 'text-red-600' : 'text-blue-600',
      bgColor: totalProfit >= 0 ? 'bg-red-50' : 'bg-blue-50',
      icon: totalProfit >= 0 ? '💰' : '📉',
      tooltip: '실현 수익 합계',
    },
    {
      label: '승률',
      value: winRate.toFixed(1),
      suffix: '%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '🎯',
      tooltip: '수익 거래 비율',
    },
    {
      label: '손익비',
      value: profitFactor.toFixed(2),
      suffix: '',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '⚖️',
      tooltip: '총이익 ÷ 총손실',
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
            <p className="text-[10px] text-slate-400">{metric.tooltip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
