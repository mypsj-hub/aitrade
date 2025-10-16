/**
 * 분석 필터 컴포넌트
 *
 * 목적: 거래 분석 페이지에서 데이터를 필터링하기 위한 UI 제공
 * 역할: 날짜 범위와 거래 유형을 선택하여 거래 데이터 필터링
 *
 * 주요 기능:
 * - 시작일/종료일 날짜 선택기
 * - 6가지 거래유형 토글 선택 (신규매수, 추가매수, 익절, 손절, 부분손절, 매도)
 * - 선택된 필터 요약 표시
 * - 필터 초기화 버튼
 * - Sticky 위치로 스크롤 시 상단 고정
 * - Zustand store와 연동하여 전역 상태 관리
 *
 * 데이터 소스: filterStore (Zustand)
 * 기술 스택: Zustand, date-fns, Tailwind CSS
 */
'use client';

import { useFilterStore } from '@/lib/store/filterStore';
import { format } from 'date-fns';

export function AnalysisFilters() {
  const { filters, setDateRange, setTradeTypes, resetFilters } = useFilterStore();

  const tradeTypeOptions = [
    { value: '신규매수', label: '신규매수', color: 'bg-blue-100 text-blue-700' },
    { value: '추가매수', label: '추가매수', color: 'bg-cyan-100 text-cyan-700' },
    { value: '익절', label: '익절', color: 'bg-green-100 text-green-700' },
    { value: '손절', label: '손절', color: 'bg-red-100 text-red-700' },
    { value: '부분손절', label: '부분손절', color: 'bg-orange-100 text-orange-700' },
    { value: '매도', label: '매도', color: 'bg-purple-100 text-purple-700' },
  ];

  const handleTradeTypeToggle = (type: string) => {
    if (filters.tradeTypes.includes(type)) {
      setTradeTypes(filters.tradeTypes.filter((t) => t !== type));
    } else {
      setTradeTypes([...filters.tradeTypes, type]);
    }
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const newDate = new Date(value);
    if (type === 'start') {
      setDateRange(newDate, filters.dateRange.end);
    } else {
      setDateRange(filters.dateRange.start, newDate);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20 z-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">🔍 필터</h2>
        <button
          onClick={resetFilters}
          className="text-sm text-slate-500 hover:text-slate-700 transition"
        >
          초기화
        </button>
      </div>

      <div className="space-y-4">
        {/* 날짜 범위 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            기간
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={format(filters.dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              value={format(filters.dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 거래 유형 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            거래 유형
          </label>
          <div className="flex flex-wrap gap-2">
            {tradeTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleTradeTypeToggle(option.value)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition
                  ${
                    filters.tradeTypes.includes(option.value)
                      ? option.color + ' ring-2 ring-offset-1 ring-blue-500'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {option.label}
                {filters.tradeTypes.includes(option.value) && ' ✓'}
              </button>
            ))}
          </div>
        </div>

        {/* 활성 필터 요약 */}
        <div className="pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {filters.tradeTypes.length > 0 && (
              <div className="mb-1">
                필터: {filters.tradeTypes.length}개 유형 선택됨
              </div>
            )}
            <div>
              {format(filters.dateRange.start, 'yyyy.MM.dd')} ~{' '}
              {format(filters.dateRange.end, 'yyyy.MM.dd')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
