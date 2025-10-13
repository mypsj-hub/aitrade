-- ============================================================
-- AI 트레이딩 시스템 - Supabase 데이터베이스 스키마 생성
-- 작성일: 2025-01-XX
-- 설명: SQLite에서 PostgreSQL로 마이그레이션
-- ============================================================

-- 한글 컬럼명을 큰따옴표로 감싸서 PostgreSQL에서 사용

-- ============================================================
-- 1. 보유현황 테이블 (holding_status)
-- ============================================================
CREATE TABLE IF NOT EXISTS holding_status (
    "코인이름" TEXT PRIMARY KEY,
    "보유수량" REAL DEFAULT 0,
    "평가금액" BIGINT DEFAULT 0,
    "매수금액" BIGINT DEFAULT 0,
    "매수평균가" BIGINT DEFAULT 0,
    "수익률" REAL DEFAULT 0,
    "평가손익" BIGINT DEFAULT 0,
    "최초매수일" TIMESTAMPTZ,
    "현재상태" TEXT DEFAULT '미보유',
    "보유비중" REAL DEFAULT 0,
    "매매판단" TEXT DEFAULT '매매보류',
    "GPT매매비중" REAL DEFAULT 0,
    "GPT목표수익률" REAL DEFAULT 0,
    "GPT목표손절률" REAL DEFAULT 0,
    "GPT보유비중" REAL DEFAULT 0,
    "최종업데이트일" TIMESTAMPTZ DEFAULT NOW(),
    "거래사유" TEXT,
    "원화잔고" BIGINT DEFAULT 0,
    "판단확신" INTEGER DEFAULT 0,
    "highest_profit" REAL DEFAULT 0,
    "마지막거래시간" TIMESTAMPTZ,
    "ai_thinking_process" TEXT,
    "관리상태" TEXT DEFAULT '활성'
);

-- 보유현황 테이블에 대한 설명 추가
COMMENT ON TABLE holding_status IS 'AI 트레이딩 시스템의 코인 보유 현황 및 AI 판단 정보';
COMMENT ON COLUMN holding_status."코인이름" IS '코인 심볼 (예: BTC, ETH)';
COMMENT ON COLUMN holding_status."보유수량" IS '현재 보유 중인 코인 수량';
COMMENT ON COLUMN holding_status."평가금액" IS '현재 시장가 기준 평가 금액 (원)';
COMMENT ON COLUMN holding_status."매수금액" IS '실제 매수에 사용한 총 금액 (원)';
COMMENT ON COLUMN holding_status."수익률" IS '수익률 (%)';
COMMENT ON COLUMN holding_status."매매판단" IS 'AI의 매매 판단 (전량익절, 부분익절, 추가매수 등)';
COMMENT ON COLUMN holding_status."관리상태" IS '활성/재평가/제외 상태';

-- ============================================================
-- 2. 거래내역 테이블 (trade_history)
-- ============================================================
CREATE TABLE IF NOT EXISTS trade_history (
    id SERIAL PRIMARY KEY,
    "코인이름" TEXT NOT NULL,
    "거래유형" TEXT NOT NULL,
    "거래수량" REAL DEFAULT 0,
    "거래금액" BIGINT DEFAULT 0,
    "거래사유" TEXT,
    "거래일시" TIMESTAMPTZ DEFAULT NOW(),
    "ai_thinking_process" TEXT,
    "수익금" BIGINT DEFAULT 0,
    "판단확신" INTEGER,
    "주요지표" JSONB  -- SQLite TEXT → PostgreSQL JSONB
);

-- 거래내역 인덱스 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_trade_coin ON trade_history("코인이름");
CREATE INDEX IF NOT EXISTS idx_trade_date ON trade_history("거래일시" DESC);
CREATE INDEX IF NOT EXISTS idx_trade_type ON trade_history("거래유형");

-- 거래내역 테이블에 대한 설명 추가
COMMENT ON TABLE trade_history IS '모든 거래 내역 로그 (매수, 매도, 익절, 손절)';
COMMENT ON COLUMN trade_history."거래유형" IS '매수, 매도, 익절, 손절 등';
COMMENT ON COLUMN trade_history."주요지표" IS 'JSON 형태의 기술적 지표 (RSI, MACD 등)';

-- ============================================================
-- 3. 포트폴리오 요약 테이블 (portfolio_summary)
-- ============================================================
CREATE TABLE IF NOT EXISTS portfolio_summary (
    id SERIAL PRIMARY KEY,
    "날짜" TIMESTAMPTZ UNIQUE NOT NULL DEFAULT NOW(),
    "총포트폴리오가치" BIGINT DEFAULT 0,
    "원화잔고" BIGINT DEFAULT 0,
    "총코인가치" BIGINT DEFAULT 0,
    "일일수익률" REAL DEFAULT 0,
    "누적수익률" REAL DEFAULT 0,
    "총순자산" BIGINT DEFAULT 0
);

-- 요약 인덱스
CREATE INDEX IF NOT EXISTS idx_portfolio_date ON portfolio_summary("날짜" DESC);

-- 포트폴리오 요약 테이블에 대한 설명 추가
COMMENT ON TABLE portfolio_summary IS '일일 포트폴리오 성과 요약';
COMMENT ON COLUMN portfolio_summary."총순자산" IS '원화잔고 + 총코인가치';
COMMENT ON COLUMN portfolio_summary."일일수익률" IS '전일 대비 수익률 (%)';
COMMENT ON COLUMN portfolio_summary."누적수익률" IS '투자 시작 이후 누적 수익률 (%)';

-- ============================================================
-- 4. 시스템 상태 테이블 (system_status)
-- ============================================================
CREATE TABLE IF NOT EXISTS system_status (
    status_key TEXT PRIMARY KEY,
    status_value TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 시스템 상태 테이블에 대한 설명 추가
COMMENT ON TABLE system_status IS '시스템의 다양한 상태를 Key-Value 형태로 저장';
COMMENT ON COLUMN system_status.status_key IS '상태 키 (예: last_market_regime, cio_latest_rationale)';
COMMENT ON COLUMN system_status.status_value IS '상태 값 (텍스트 또는 JSON)';

-- 초기 시장 체제 설정
INSERT INTO system_status (status_key, status_value, last_updated)
VALUES ('last_market_regime', 'Range_Bound', NOW())
ON CONFLICT (status_key) DO NOTHING;

-- CIO 최신 평가 초기값 설정
INSERT INTO system_status (status_key, status_value, last_updated)
VALUES ('cio_latest_rationale', 'CIO 브리핑이 아직 생성되지 않았습니다.', NOW())
ON CONFLICT (status_key) DO NOTHING;

-- ============================================================
-- 5. CIO 보고서 테이블 (cio_reports)
-- ============================================================
CREATE TABLE IF NOT EXISTS cio_reports (
    report_date DATE NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('DAILY', 'WEEKLY', 'MONTHLY')),
    title TEXT,
    market_summary TEXT,
    performance_review TEXT,
    self_critique JSONB,  -- SQLite TEXT → PostgreSQL JSONB
    outlook TEXT,
    full_content_md TEXT,
    raw_json_data JSONB,  -- SQLite TEXT → PostgreSQL JSONB
    cio_latest_rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (report_date, report_type)
);

-- 보고서 인덱스
CREATE INDEX IF NOT EXISTS idx_cio_date_type ON cio_reports(report_date DESC, report_type);
CREATE INDEX IF NOT EXISTS idx_cio_created_at ON cio_reports(created_at DESC);

-- CIO 보고서 테이블에 대한 설명 추가
COMMENT ON TABLE cio_reports IS 'AI CIO(Chief Investment Officer)가 생성한 일일/주간/월간 보고서';
COMMENT ON COLUMN cio_reports.report_type IS '보고서 유형 (DAILY, WEEKLY, MONTHLY)';
COMMENT ON COLUMN cio_reports.self_critique IS 'AI의 자기 평가 (JSON 형태)';
COMMENT ON COLUMN cio_reports.full_content_md IS '마크다운 형식의 전체 보고서 내용';

-- ============================================================
-- 스키마 생성 완료 확인
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ 스키마 생성 완료!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '생성된 테이블:';
    RAISE NOTICE '  1. holding_status (보유현황)';
    RAISE NOTICE '  2. trade_history (거래내역)';
    RAISE NOTICE '  3. portfolio_summary (포트폴리오 요약)';
    RAISE NOTICE '  4. system_status (시스템 상태)';
    RAISE NOTICE '  5. cio_reports (AI 보고서)';
    RAISE NOTICE '========================================';
    RAISE NOTICE '다음 단계: 02_setup_rls.sql 실행';
    RAISE NOTICE '========================================';
END $$;
