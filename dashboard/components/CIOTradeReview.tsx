/**
 * CIO 주요 매매 결정 복기 컴포넌트
 *
 * 목적: CIO 리포트의 "주요 매매 결정 복기" 및 "제외 코인 분석" 섹션을 표시
 *
 * 주요 기능:
 * - full_content_md에서 "8. 주요 매매 결정 복기" 섹션 추출 (번호 제거)
 * - "4. 제외 코인 분석"도 함께 표시 (번호 제거)
 * - 마크다운 렌더링으로 가독성 높은 표시
 * - 폴더블 섹션 (펼치기/접기)
 *
 * Props:
 * - selectedDate: Date - 조회할 날짜
 *
 * 데이터 소스: cio_reports.full_content_md
 */
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

async function fetchCIOReport(selectedDate: Date): Promise<string | null> {
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('cio_reports')
    .select('full_content_md')
    .eq('report_type', 'DAILY')
    .eq('report_date', dateString)
    .limit(1);

  if (error || !data || data.length === 0) return null;

  return data[0].full_content_md || null;
}

// "주요 매매 결정 복기" 및 "제외 코인 분석" 섹션 추출 및 파싱
function extractTradeReview(fullContentMd: string): { tradeDecisions: string; excludedCoins: string } | null {
  // "8. 주요 매매 결정 복기" 추출
  const regex8 = /##?\s*8\.\s*주요\s*매매\s*결정\s*복기([\s\S]*?)(?=##?\s*(?:9|10)\.|$)/i;
  const match8 = fullContentMd.match(regex8);

  // "4. 제외 코인 분석" 추출
  const regex4 = /##?\s*4\.\s*제외\s*코인\s*분석([\s\S]*?)(?=##?\s*[5-9]|10\.|$)/i;
  const match4 = fullContentMd.match(regex4);

  if (!match8 && !match4) return null;

  return {
    tradeDecisions: match8 && match8[1] ? match8[1].trim() : '',
    excludedCoins: match4 && match4[1] ? match4[1].trim() : '',
  };
}

// 매매 결정을 파싱하여 구조화된 데이터로 변환
function parseTradeDecisions(content: string): { buys: string[]; sells: string[] } {
  const buys: string[] = [];
  const sells: string[] = [];

  // "매수 결정" 섹션 추출
  const buyRegex = /\*\*매수\s*결정\*\*:([\s\S]*?)(?=\*\*매도\s*결정\*\*:|$)/i;
  const buyMatch = content.match(buyRegex);

  if (buyMatch && buyMatch[1]) {
    // 각 코인별 항목 추출 (- **코인명**: 내용 패턴)
    const buyItems = buyMatch[1].match(/\*\*([A-Z]+)\*\*:\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/g);
    if (buyItems) {
      buyItems.forEach(item => {
        const match = item.match(/\*\*([A-Z]+)\*\*:\s*([\s\S]+)/);
        if (match) buys.push(`**${match[1]}**: ${match[2].trim()}`);
      });
    }
  }

  // "매도 결정" 섹션 추출
  const sellRegex = /\*\*매도\s*결정\*\*:([\s\S]*?)$/i;
  const sellMatch = content.match(sellRegex);

  if (sellMatch && sellMatch[1]) {
    const sellItems = sellMatch[1].match(/\*\*([A-Z]+)\*\*:\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/g);
    if (sellItems) {
      sellItems.forEach(item => {
        const match = item.match(/\*\*([A-Z]+)\*\*:\s*([\s\S]+)/);
        if (match) sells.push(`**${match[1]}**: ${match[2].trim()}`);
      });
    }
  }

  return { buys, sells };
}

// 제외 코인을 파싱하여 배열로 변환
function parseExcludedCoins(content: string): string[] {
  const coins: string[] = [];

  // 각 코인별 항목 추출 (- **코인명**: 내용 패턴)
  const items = content.match(/\*\*([A-Z]+)\*\*:\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/g);

  if (items) {
    items.forEach(item => {
      const match = item.match(/\*\*([A-Z]+)\*\*:\s*([\s\S]+)/);
      if (match) coins.push(`**${match[1]}**: ${match[2].trim()}`);
    });
  }

  return coins;
}

interface CIOTradeReviewProps {
  selectedDate: Date;
}

export function CIOTradeReview({ selectedDate }: CIOTradeReviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const dateKey = selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? format(selectedDate, 'yyyy-MM-dd')
    : 'invalid-date';

  const { data: fullContent, isLoading } = useSWR<string | null>(
    ['cio-trade-review', dateKey],
    () => dateKey !== 'invalid-date' ? fetchCIOReport(selectedDate) : null,
    { refreshInterval: 30000 } // 30초 간격 갱신
  );

  const reviewData = fullContent ? extractTradeReview(fullContent) : null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">🔄 주요 매매 결정 복기 & 제외 코인 분석</h3>
        <p className="text-sm text-slate-500">해당 날짜의 리포트가 없습니다.</p>
      </div>
    );
  }

  const { buys, sells } = parseTradeDecisions(reviewData.tradeDecisions);
  const excludedCoins = parseExcludedCoins(reviewData.excludedCoins);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
      >
        <h3 className="text-lg font-bold text-slate-800">🔄 주요 매매 결정 복기 & 제외 코인 분석</h3>
        <svg
          className={`w-5 h-5 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* 주요 매매 결정 복기 */}
          {(buys.length > 0 || sells.length > 0) && (
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                주요 매매 결정 복기
              </h4>

              <div className="space-y-4">
                {/* 매수 결정 */}
                {buys.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <h5 className="text-sm font-bold text-green-800">매수 결정</h5>
                    </div>
                    <div className="space-y-2">
                      {buys.map((buy, index) => {
                        const match = buy.match(/\*\*([A-Z]+)\*\*:\s*(.*)/);
                        if (!match) return null;
                        const [, coin, description] = match;
                        return (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 min-w-[2.5rem] h-10 px-2 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                {coin}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-800 leading-relaxed">
                                  {description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 매도 결정 */}
                {sells.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <h5 className="text-sm font-bold text-red-800">매도 결정</h5>
                    </div>
                    <div className="space-y-2">
                      {sells.map((sell, index) => {
                        const match = sell.match(/\*\*([A-Z]+)\*\*:\s*(.*)/);
                        if (!match) return null;
                        const [, coin, description] = match;
                        return (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-l-4 border-red-500"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 min-w-[2.5rem] h-10 px-2 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                {coin}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-800 leading-relaxed">
                                  {description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 구분선 */}
          {(buys.length > 0 || sells.length > 0) && excludedCoins.length > 0 && (
            <div className="border-t border-slate-200"></div>
          )}

          {/* 제외 코인 분석 */}
          {excludedCoins.length > 0 && (
            <div>
              <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🚫</span>
                제외 코인 분석
              </h4>

              <div className="space-y-2">
                {excludedCoins.map((coin, index) => {
                  const match = coin.match(/\*\*([A-Z]+)\*\*:\s*(.*)/);
                  if (!match) return null;
                  const [, coinName, description] = match;
                  return (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-4 border-l-4 border-slate-400"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 min-w-[2.5rem] h-10 px-2 bg-slate-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                          {coinName}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-800 leading-relaxed">
                            {description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
