/**
 * 포트폴리오 날짜 선택기
 *
 * 목적: 특정 날짜의 포트폴리오 데이터를 조회하기 위한 날짜 선택 UI 제공
 * 역할: 날짜 입력 필드와 선택된 날짜 정보 표시
 *
 * 주요 기능:
 * - HTML5 date input으로 달력 UI 제공
 * - 오늘 날짜까지만 선택 가능하도록 제한
 * - 선택된 날짜를 한글 형식으로 표시
 * - 부모 컴포넌트로 날짜 변경 이벤트 전달
 * - 깔끔한 카드 형태의 UI
 *
 * Props:
 * - selectedDate: Date - 현재 선택된 날짜
 * - onDateChange: (date: Date) => void - 날짜 변경 핸들러
 *
 * 데이터 소스: 부모 컴포넌트에서 관리하는 state
 * 기술 스택: date-fns, Tailwind CSS
 */
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
