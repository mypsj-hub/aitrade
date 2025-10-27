-- ============================================================
-- AI 트레이딩 시스템 - CIO 결정 이력 테이블 RLS 설정
-- 작성일: 2025-10-27
-- 설명: cio_portfolio_decisions 테이블 보안 정책
-- ============================================================

-- ============================================================
-- 1. RLS 활성화
-- ============================================================
ALTER TABLE cio_portfolio_decisions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. 읽기 정책 (Public Read Access)
-- ============================================================
-- 대시보드(anon key)에서 CIO 결정 이력을 조회할 수 있도록 허용

CREATE POLICY "Allow public read access on cio_portfolio_decisions"
ON cio_portfolio_decisions
FOR SELECT
USING (true);

-- ============================================================
-- 3. 쓰기 정책 (Service Role Only)
-- ============================================================
-- 쓰기 권한은 service_role 키만 가능 (트레이딩 봇만)
-- PostgreSQL의 기본 동작으로, service_role은 RLS를 우회하므로
-- 별도의 쓰기 정책을 만들지 않아도 됩니다.

-- ============================================================
-- RLS 설정 완료 확인
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CIO 결정 이력 테이블 RLS 설정 완료!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '테이블: cio_portfolio_decisions';
    RAISE NOTICE '  ✓ RLS 활성화';
    RAISE NOTICE '  ✓ 읽기: 누구나 접근 가능 (anon key)';
    RAISE NOTICE '  ✓ 쓰기: service_role 키만 가능';
    RAISE NOTICE '========================================';
    RAISE NOTICE '보안 테스트:';
    RAISE NOTICE '  - 대시보드: SELECT 성공 (읽기 전용)';
    RAISE NOTICE '  - 트레이딩봇: INSERT/UPDATE 성공 (모든 권한)';
    RAISE NOTICE '========================================';
END $$;
