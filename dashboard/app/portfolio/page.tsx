'use client';

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">포트폴리오</h1>
        <p className="text-slate-600 mt-1">실시간 자산 변동을 모니터링하세요</p>
      </div>

      {/* 개발 중 안내 */}
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">💼</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Portfolio 페이지</h2>
        <p className="text-slate-600 mb-4">Phase 4에서 개발 예정</p>
        <div className="inline-block bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm">
          Supabase Realtime 구독으로 실시간 자산 변동을 즉시 확인할 수 있습니다
        </div>
      </div>
    </div>
  );
}
