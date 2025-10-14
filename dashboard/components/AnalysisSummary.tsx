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
    },
    {
      label: '총 손익',
      value: formatCurrency(totalProfit),
      suffix: '',
      color: totalProfit >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: totalProfit >= 0 ? 'bg-blue-50' : 'bg-red-50',
      icon: totalProfit >= 0 ? '💰' : '📉',
    },
    {
      label: '승률',
      value: winRate.toFixed(1),
      suffix: '%',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      icon: '🎯',
    },
    {
      label: '손익비',
      value: profitFactor.toFixed(2),
      suffix: '',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: '⚖️',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={`${metric.bgColor} rounded-lg p-4 border border-slate-200`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{metric.icon}</span>
            <span className="text-xs text-slate-500">{metric.label}</span>
          </div>
          <div className="flex items-baseline">
            <span className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </span>
            {metric.suffix && (
              <span className="ml-1 text-sm text-slate-500">{metric.suffix}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
