'use client';

import { format } from 'date-fns';

interface PortfolioDateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function PortfolioDateSelector({ selectedDate, onDateChange }: PortfolioDateSelectorProps) {
  const handleDateChange = (value: string) => {
    onDateChange(new Date(value));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          📅 조회 날짜
        </label>
        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => handleDateChange(e.target.value)}
          max={format(new Date(), 'yyyy-MM-dd')}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="mt-2 text-xs text-slate-500">
        {format(selectedDate, 'yyyy년 M월 d일')} 기준 데이터
      </div>
    </div>
  );
}
