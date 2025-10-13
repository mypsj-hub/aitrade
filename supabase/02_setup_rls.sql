-- ============================================================
-- AI 트레이딩 시스템 - Row Level Security (RLS) 설정
-- 작성일: 2025-01-XX
-- 설명: 읽기/쓰기 권한 분리로 보안 강화
-- ============================================================

-- ============================================================
-- RLS 개념 설명
-- ============================================================
-- Row Level Security(RLS)는 PostgreSQL의 보안 기능으로,
-- 테이블의 각 행(row)에 대한 접근 권한을 세밀하게 제어합니다.
--
-- 본 시스템의 보안 전략:
-- 1. 대시보드(Vercel): anon key 사용 → 읽기 전용 (SELECT만 가능)
-- 2. 트레이딩 봇(로컬/EC2): service_role key 사용 → 모든 권한
-- ============================================================

-- ============================================================
-- 1. RLS 활성화
-- ============================================================
ALTER TABLE holding_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE cio_reports ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. 읽기 정책 (Public Read Access)
-- ============================================================
-- 누구나 데이터를 읽을 수 있도록 허용
-- 이 정책은 anon key와 service_role key 모두에게 적용됩니다.

-- 2.1 보유현황 읽기 허용
CREATE POLICY "Allow public read access on holding_status"
ON holding_status
FOR SELECT
USING (true);

-- 2.2 거래내역 읽기 허용
CREATE POLICY "Allow public read access on trade_history"
ON trade_history
FOR SELECT
USING (true);

-- 2.3 포트폴리오 요약 읽기 허용
CREATE POLICY "Allow public read access on portfolio_summary"
ON portfolio_summary
FOR SELECT
USING (true);

-- 2.4 시스템 상태 읽기 허용
CREATE POLICY "Allow public read access on system_status"
ON system_status
FOR SELECT
USING (true);

-- 2.5 CIO 보고서 읽기 허용
CREATE POLICY "Allow public read access on cio_reports"
ON cio_reports
FOR SELECT
USING (true);

-- ============================================================
-- 3. 쓰기 정책 (Service Role Only)
-- ============================================================
-- 쓰기 권한은 service_role 키만 가능하도록 설정
-- PostgreSQL의 기본 동작으로, service_role은 RLS를 우회합니다.
-- 따라서 별도의 쓰기 정책을 만들지 않아도 됩니다.
--
-- 중요: 트레이딩 봇에서는 반드시 SUPABASE_SERVICE_KEY를 사용하세요!

-- ============================================================
-- 4. RLS 정책 확인 쿼리 (선택 사항)
-- ============================================================
-- 아래 쿼리를 실행하여 생성된 정책을 확인할 수 있습니다.
-- SELECT
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- ============================================================
-- RLS 설정 완료 확인
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ RLS 보안 정책 설정 완료!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '설정 내용:';
    RAISE NOTICE '  ✓ 모든 테이블에 RLS 활성화';
    RAISE NOTICE '  ✓ 읽기 정책: 누구나 접근 가능 (anon key)';
    RAISE NOTICE '  ✓ 쓰기 정책: service_role 키만 가능';
    RAISE NOTICE '========================================';
    RAISE NOTICE '보안 가이드:';
    RAISE NOTICE '  • Vercel 대시보드: anon key 사용 (읽기 전용)';
    RAISE NOTICE '  • 트레이딩 봇: service_role key 사용 (모든 권한)';
    RAISE NOTICE '  • anon key는 공개해도 안전합니다';
    RAISE NOTICE '  • service_role key는 절대 노출 금지!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '다음 단계: .env 파일에 Supabase 키 추가';
    RAISE NOTICE '========================================';
END $$;
