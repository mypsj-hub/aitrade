import type { PortfolioSummary } from '@/lib/types';
import { formatDate, formatCurrencyWithUnit } from '@/lib/utils/formatters';

interface Props {
  summary: PortfolioSummary | null;
}

export function PortfolioSummaryCard({ summary }: Props) {
  if (!summary) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-slate-500">포트폴리오 요약 데이터가 없습니다.</p>
      </div>
    );
  }

  const formatPercent = (num: number) => {
    return num.toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="총순자산"
        value={formatCurrencyWithUnit(summary.총포트폴리오가치)}
        subtitle={formatDate(summary.날짜)}
      />
      <MetricCard
        title="일일 수익률"
        value={`${formatPercent(summary.일일수익률)}%`}
        valueColor={summary.일일수익률 >= 0 ? 'text-red-600' : 'text-blue-600'}
      />
      <MetricCard
        title="누적 수익률"
        value={`${formatPercent(summary.누적수익률)}%`}
        valueColor={summary.누적수익률 >= 0 ? 'text-red-600' : 'text-blue-600'}
      />
      <MetricCard
        title="원화 잔고"
        value={formatCurrencyWithUnit(summary.원화잔고)}
        subtitle={`코인: ${formatCurrencyWithUnit(summary.총코인가치)}`}
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  valueColor = 'text-slate-900',
}: {
  title: string;
  value: string;
  subtitle?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg shadow-lg p-6 border border-slate-200 hover:shadow-xl transition">
      <p className="text-sm text-slate-600 font-semibold uppercase mb-2">{title}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
