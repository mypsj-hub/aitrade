/**
 * 코인 상세 정보 패널 컴포넌트
 *
 * 목적: CIO 결정의 상세 정보를 모달/패널 형태로 표시
 *
 * 주요 기능:
 * - 전체 전략 근거 표시
 * - 기술 지표 (RSI, MACD 등)
 * - 코인 정체성 (시총등급, 섹터, 유동성)
 * - 리스크 평가
 * - 목표 수익률 / 손절률
 * - 전체 포트폴리오 구성
 *
 * Props:
 * - decision: CIODecision | null - 표시할 결정 (null이면 패널 숨김)
 * - onClose: () => void - 닫기 버튼 클릭 시 콜백
 *
 * 데이터 소스: cio_portfolio_decisions 테이블
 */

'use client';

import { type CIODecision } from '@/lib/hooks/useCIODecisions';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Props {
  decision: CIODecision | null;
  onClose: () => void;
}

export function CoinDetailPanel({ decision, onClose }: Props) {
  // 패널 숨김
  if (!decision) {
    return null;
  }

  // 전략근거에서 정보 추출
  const extractMarketCap = (전략근거: string): string | null => {
    if (!전략근거) return null;
    if (전략근거.includes('메가캡')) return '메가캡';
    if (전략근거.includes('미드캡')) return '미드캡';
    if (전략근거.includes('스몰캡')) return '스몰캡';
    return null;
  };

  const extractSector = (전략근거: string): string | null => {
    if (!전략근거) return null;
    const match = 전략근거.match(/,\s*(Layer-\d+|Other|DeFi|AI|Meme|Gaming|Infrastructure)(\s*섹터)?/i);
    return match ? match[1] : null;
  };

  const extractLiquidity = (전략근거: string): string | null => {
    if (!전략근거) return null;
    const match = 전략근거.match(/([A-C])등급\s*유동성/);
    return match ? `${match[1]}등급` : null;
  };

  const 시총등급 = extractMarketCap(decision.전략근거);
  const 섹터 = extractSector(decision.전략근거);
  const 유동성 = extractLiquidity(decision.전략근거);

  return (
    <>
      {/* 백드롭 (클릭 시 닫기) */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* 패널 */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {decision.코인이름} 상세 정보
            </h2>
            <p className="text-sm text-slate-500">
              {format(new Date(decision.결정시각), 'PPP HH:mm:ss', { locale: ko })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 1. 비중 정보 */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-3">📊 비중 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <span className="text-sm text-slate-600">목표 비중</span>
                <div className="text-2xl font-bold text-blue-600">
                  {decision.목표비중?.toFixed(1) || '0.0'}%
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <span className="text-sm text-slate-600">현재 보유 비중</span>
                <div className="text-2xl font-bold text-green-600">
                  {decision.현재보유비중?.toFixed(1) || '0.0'}%
                </div>
              </div>
              {decision.이전목표비중 !== null && (
                <>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <span className="text-sm text-slate-600">이전 목표 비중</span>
                    <div className="text-xl font-semibold text-slate-700">
                      {decision.이전목표비중.toFixed(1)}%
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${decision.비중변화량! >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <span className="text-sm text-slate-600">비중 변화량</span>
                    <div className={`text-xl font-bold ${decision.비중변화량! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {decision.비중변화량! > 0 ? '+' : ''}
                      {decision.비중변화량?.toFixed(1)}%p
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* 2. 관리 정보 */}
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-3">⚙️ 관리 정보</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="border border-slate-200 p-3 rounded-lg">
                <span className="text-xs text-slate-500">관리 상태</span>
                <div className="font-semibold text-slate-900">{decision.관리상태}</div>
              </div>
              {decision.시장체제 && (
                <div className="border border-slate-200 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">시장 체제</span>
                  <div className="font-semibold text-slate-900">{decision.시장체제}</div>
                </div>
              )}
              {decision.목표수익률 !== null && (
                <div className="border border-slate-200 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">목표 수익률</span>
                  <div className="font-semibold text-green-600">{decision.목표수익률?.toFixed(1)}%</div>
                </div>
              )}
              {decision.목표손절률 !== null && (
                <div className="border border-slate-200 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">목표 손절률</span>
                  <div className="font-semibold text-red-600">{decision.목표손절률?.toFixed(1)}%</div>
                </div>
              )}
              {decision.공포탐욕지수 !== null && (
                <div className="border border-slate-200 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">공포탐욕지수</span>
                  <div className="font-semibold text-slate-900">{decision.공포탐욕지수}</div>
                </div>
              )}
              {decision.긴급도 !== null && (
                <div className="border border-slate-200 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">긴급도</span>
                  <div className="font-semibold text-slate-900">{decision.긴급도}</div>
                </div>
              )}
            </div>
          </section>

          {/* 3. 코인 정체성 */}
          {(시총등급 || 섹터 || 유동성) && (
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">🪙 코인 정체성</h3>
              <div className="grid grid-cols-3 gap-3">
                {시총등급 && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-600">시총 등급</span>
                    <div className="font-semibold text-purple-700">{시총등급}</div>
                  </div>
                )}
                {섹터 && (
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-600">섹터</span>
                    <div className="font-semibold text-indigo-700">{섹터}</div>
                  </div>
                )}
                {유동성 && (
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-600">유동성</span>
                    <div className="font-semibold text-cyan-700">{유동성}</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 4. 성과 지표 */}
          {(decision.기대수익률 || decision.예상변동성 || decision.샤프비율 || decision.신뢰수준) && (
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">📈 성과 지표</h3>
              <div className="grid grid-cols-2 gap-3">
                {decision.기대수익률 != null && decision.기대수익률 !== 0 && (
                  <div className="border border-slate-200 p-3 rounded-lg">
                    <span className="text-xs text-slate-500">기대 수익률</span>
                    <div className="font-bold text-green-600">{decision.기대수익률?.toFixed(1)}%</div>
                  </div>
                )}
                {decision.예상변동성 != null && decision.예상변동성 !== 0 && (
                  <div className="border border-slate-200 p-3 rounded-lg">
                    <span className="text-xs text-slate-500">예상 변동성</span>
                    <div className="font-bold text-orange-600">{decision.예상변동성?.toFixed(1)}%</div>
                  </div>
                )}
                {decision.샤프비율 != null && decision.샤프비율 !== 0 && (
                  <div className="border border-slate-200 p-3 rounded-lg">
                    <span className="text-xs text-slate-500">샤프 비율</span>
                    <div className="font-bold text-blue-600">{decision.샤프비율?.toFixed(2)}</div>
                  </div>
                )}
                {decision.신뢰수준 != null && decision.신뢰수준 !== 0 && (
                  <div className="border border-slate-200 p-3 rounded-lg">
                    <span className="text-xs text-slate-500">신뢰 수준</span>
                    <div className="font-bold text-purple-600">{decision.신뢰수준?.toFixed(0)}%</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 5. 전략 근거 */}
          {decision.전략근거 && (
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">📝 전략 근거</h3>
              <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                {decision.전략근거}
              </div>
            </section>
          )}

          {/* 6. 리스크 평가 */}
          {decision.리스크평가 && (
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">⚠️ 리스크 평가</h3>
              <div className="bg-red-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                {decision.리스크평가}
              </div>
            </section>
          )}

          {/* 7. 결정 사유 */}
          {decision.결정사유 && (
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">💭 결정 사유</h3>
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                {decision.결정사유}
              </div>
            </section>
          )}

          {/* 8. 주의사항 */}
          {decision.주의사항 && (
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">🚨 주의사항</h3>
              <div className="bg-yellow-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                {decision.주의사항}
              </div>
            </section>
          )}

          {/* 9. 다음 재평가 시각 */}
          {decision.다음재평가시각 && (
            <section>
              <h3 className="text-lg font-bold text-slate-800 mb-3">⏰ 다음 재평가</h3>
              <div className="border border-slate-200 p-4 rounded-lg">
                <p className="text-slate-700">
                  {format(new Date(decision.다음재평가시각), 'PPP HH:mm:ss', { locale: ko })}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
