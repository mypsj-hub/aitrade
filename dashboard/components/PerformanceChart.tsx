'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PortfolioSummary } from '@/lib/types';

interface Props {
  data: PortfolioSummary[];
}

export function PerformanceChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-slate-500 text-center py-8">차트 데이터가 없습니다.</p>;
  }

  const chartData = data.map((item) => ({
    date: item.날짜,
    수익률: item.누적수익률,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="수익률" stroke="#2563eb" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
