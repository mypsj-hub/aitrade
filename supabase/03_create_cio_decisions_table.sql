-- ============================================================
-- AI 트레이딩 시스템 - CIO 포트폴리오 결정 이력 테이블
-- 작성일: 2025-10-27
-- 목적: CIO 일관성 문제 해결 및 포트폴리오 결정 이력 추적
-- ============================================================

-- 한글 컬럼명을 큰따옴표로 감싸서 PostgreSQL에서 사용

-- ============================================================
-- 6. CIO 포트폴리오 결정 이력 테이블 (cio_portfolio_decisions)
-- ============================================================
CREATE TABLE IF NOT EXISTS cio_portfolio_decisions (
    id SERIAL PRIMARY KEY,

    -- ========== 기본 정보 ==========
    "결정시각" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "코인이름" TEXT NOT NULL,

    -- ========== 목표 비중 정보 ==========
    "목표비중" REAL NOT NULL,
    "이전목표비중" REAL,
    "비중변화량" REAL,
    "현재보유비중" REAL,

    -- ========== 리스크 관리 ==========
    "목표수익률" REAL,
    "목표손절률" REAL,

    -- ========== CIO 근거 및 맥락 ==========
    "전략근거" TEXT,
    "관리상태" TEXT,

    -- ========== 시장 맥락 정보 ==========
    "시장체제" TEXT,
    "공포탐욕지수" INTEGER,
    "긴급도" INTEGER,
    "BTC도미넌스" REAL,

    -- ========== 코인 정체성 정보 ==========
    "시가총액등급" TEXT,
    "섹터" TEXT,
    "유동성등급" TEXT,

    -- ========== 기술지표 스냅샷 ==========
    "기술지표" JSONB,

    -- ========== 전체 포트폴리오 스냅샷 ==========
    "전체포트폴리오" JSONB
);

-- ============================================================
-- 인덱스 (조회 성능 최적화)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cio_decision_time
    ON cio_portfolio_decisions("결정시각" DESC);

CREATE INDEX IF NOT EXISTS idx_cio_decision_coin
    ON cio_portfolio_decisions("코인이름");

CREATE INDEX IF NOT EXISTS idx_cio_decision_coin_time
    ON cio_portfolio_decisions("코인이름", "결정시각" DESC);

CREATE INDEX IF NOT EXISTS idx_cio_decision_market_regime
    ON cio_portfolio_decisions("시장체제");

CREATE INDEX IF NOT EXISTS idx_cio_decision_management
    ON cio_portfolio_decisions("관리상태");

-- ============================================================
-- 테이블 및 컬럼 설명
-- ============================================================
COMMENT ON TABLE cio_portfolio_decisions IS 'CIO AI의 포트폴리오 목표 비중 결정 이력 (시계열 데이터)';

COMMENT ON COLUMN cio_portfolio_decisions."결정시각" IS 'CIO 실행 시각 (timestamptz)';
COMMENT ON COLUMN cio_portfolio_decisions."코인이름" IS '코인 심볼 (BTC, ETH, SOL 등)';
COMMENT ON COLUMN cio_portfolio_decisions."목표비중" IS 'CIO가 설정한 목표 보유 비중 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."이전목표비중" IS '직전 CIO 결정의 목표 비중 (일관성 검증용, %)';
COMMENT ON COLUMN cio_portfolio_decisions."비중변화량" IS '목표비중 - 이전목표비중 (급격한 변경 감지용, %)';
COMMENT ON COLUMN cio_portfolio_decisions."현재보유비중" IS '결정 시점의 실제 포트폴리오 보유 비중 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."목표수익률" IS 'CIO가 설정한 익절 기준 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."목표손절률" IS 'CIO가 설정한 손절 기준 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."전략근거" IS 'CIO rationale: 투자 논리 및 비중 설정 근거';
COMMENT ON COLUMN cio_portfolio_decisions."관리상태" IS '활성(매매 대상) / 재평가(CIO 재검토) / 제외(매매 중단)';
COMMENT ON COLUMN cio_portfolio_decisions."시장체제" IS 'Process1이 감지한 시장 체제 (Uptrend/Range_Bound/Downtrend)';
COMMENT ON COLUMN cio_portfolio_decisions."공포탐욕지수" IS 'Crypto Fear & Greed Index (0=극단적 공포, 100=극단적 탐욕)';
COMMENT ON COLUMN cio_portfolio_decisions."긴급도" IS 'Process1 긴급도 점수 (0=정상, 100=최고 긴급)';
COMMENT ON COLUMN cio_portfolio_decisions."BTC도미넌스" IS 'BTC 시장 점유율 (%)';
COMMENT ON COLUMN cio_portfolio_decisions."시가총액등급" IS '메가캡(>1조원) / 미드캡(1천억~1조) / 스몰캡(<1천억)';
COMMENT ON COLUMN cio_portfolio_decisions."섹터" IS 'Layer-1, Layer-2, DeFi, GameFi, Meme, AI, Other 등';
COMMENT ON COLUMN cio_portfolio_decisions."유동성등급" IS 'A(최고) / B(양호) / C(보통) / D(낮음)';
COMMENT ON COLUMN cio_portfolio_decisions."기술지표" IS 'JSON 형태의 주요 기술지표 스냅샷 (RSI, MACD, MA120 거리 등)';
COMMENT ON COLUMN cio_portfolio_decisions."전체포트폴리오" IS '전체 포트폴리오 비중 맵 (선택 사항, 디버깅용)';

-- ============================================================
-- 스키마 생성 완료 확인
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CIO 결정 이력 테이블 생성 완료!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '테이블명: cio_portfolio_decisions';
    RAISE NOTICE '컬럼 수: 17개 (id 포함 18개)';
    RAISE NOTICE '인덱스: 5개 생성';
    RAISE NOTICE '용도: CIO 일관성 검증 및 이력 추적';
    RAISE NOTICE '========================================';
    RAISE NOTICE '다음 단계: RLS 설정 (02_setup_rls.sql 참고)';
    RAISE NOTICE '========================================';
END $$;
