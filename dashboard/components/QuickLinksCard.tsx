/**
 * 빠른 링크 카드
 *
 * 목적: 자주 사용하는 외부 암호화폐 및 경제 관련 사이트로 빠르게 이동하기 위함
 * 역할: 시장 데이터, 경제 지표, 시장 심리 지표 사이트 링크 제공
 *
 * 주요 기능:
 * - CoinMarketCap: 실시간 암호화폐 시세 및 순위
 * - Investing.com: 글로벌 경제 지표 및 경제 캘린더
 * - 한국은행 경제통계: 국내 금리, 환율, 물가 지표
 * - Fear & Greed Index: 암호화폐 시장 심리 지표
 * - 새 탭에서 외부 링크 열기
 * - 호버 시 시각적 피드백 제공
 *
 * 데이터 소스: 하드코딩된 링크 목록
 * 기술 스택: React, Tailwind CSS
 */
'use client';

export function QuickLinksCard() {
  const links = [
    {
      category: '시장 데이터',
      items: [
        { name: 'CoinMarketCap', url: 'https://coinmarketcap.com/ko/', icon: '📊' },
        { name: 'Investing.com', url: 'https://kr.investing.com/', icon: '💹' },
      ],
    },
    {
      category: '경제 지표',
      items: [
        { name: '한국은행 경제통계', url: 'https://ecos.bok.or.kr/', icon: '🏦' },
        { name: 'Fear & Greed Index', url: 'https://alternative.me/crypto/fear-and-greed-index/', icon: '🎯' },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">🔗 빠른 링크</h2>

      <div className="space-y-4">
        {links.map((category) => (
          <div key={category.category}>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">
              {category.category}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition group"
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">
                    {link.name}
                  </span>
                  <svg
                    className="ml-auto w-3 h-3 text-slate-400 group-hover:text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
