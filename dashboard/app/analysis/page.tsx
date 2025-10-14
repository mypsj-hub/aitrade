'use client';

export default function AnalysisPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">분석</h1>
        <p className="text-slate-600 mt-1">AI의 모든 판단을 투명하게 분석하세요</p>
      </div>

      {/* 개발 중 안내 */}
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">🔬</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Analysis 페이지</h2>
        <p className="text-slate-600 mb-4">Phase 3에서 개발 예정</p>
        <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
          거래 내역 상세 분석, 필터링, AI 판단 드릴다운 기능이 추가됩니다
        </div>
      </div>
    </div>
  );
}
