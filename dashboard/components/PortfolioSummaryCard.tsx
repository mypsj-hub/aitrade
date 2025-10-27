/**
 * 포트폴리오 요약 카드
 *
 * 목적: 사용자의 포트폴리오 핵심 지표를 한눈에 보여주기 위함
 * 역할: 총순자산, 일일수익률, 누적수익률, 원화잔고 등 주요 재무지표 표시
 *
 * 주요 기능:
 * - 4개의 핵심 메트릭 카드로 구성 (총순자산, 일일수익률, 누적수익률, 원화잔고)
 * - 수익률에 따른 색상 구분 (양수: 빨강, 음수: 파랑)
 * - 만원 단위로 포맷된 금액 표시
 * - 그리드 레이아웃으로 반응형 배치
 *
 * Props:
 * - summary: PortfolioSummary | null - 포트폴리오 요약 데이터
 *
 * 데이터 소스: portfolio_summary 테이블
 * 기술 스택: React, TypeScript, Tailwind CSS
 */
import type { PortfolioSummary } from '@/lib/types';
import { formatDateTime, formatCurrencyWithUnit } from '@/lib/utils/formatters';

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
        subtitle={formatDateTime(summary.날짜)}
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
