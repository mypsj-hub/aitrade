'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface PnlData {
  coin: string;
  pnl: number;
}

interface PnlByAssetChartProps {
  data: PnlData[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);
}

export function PnlByAssetChart({ data }: PnlByAssetChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        데이터가 없습니다
      </div>
    );
  }

  // 데이터 정렬 (손익 내림차순)
  const sortedData = [...data].sort((a, b) => b.pnl - a.pnl);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="coin"
          tick={{ fill: '#64748b', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={(value: number) => [formatCurrency(value), '손익']}
          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
        />
        <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} />
        <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#3b82f6' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
