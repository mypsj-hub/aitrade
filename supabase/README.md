# Supabase 데이터베이스 설정 가이드

## 📋 개요
이 폴더에는 AI 트레이딩 시스템을 Supabase PostgreSQL로 마이그레이션하기 위한 SQL 스크립트가 포함되어 있습니다.

---

## 📂 파일 구조

```
supabase/
├── README.md                 # 이 파일 (설정 가이드)
├── 01_create_schema.sql      # 데이터베이스 스키마 생성
└── 02_setup_rls.sql          # Row Level Security 설정
```

---

## 🚀 실행 순서

### Step 1: Supabase 프로젝트 생성

1. **Supabase 웹사이트 접속**
   - URL: https://supabase.com
   - 로그인 또는 회원가입

2. **새 프로젝트 생성**
   - Dashboard에서 `New Project` 클릭
   - 프로젝트 정보 입력:
     - **Project Name**: `ai-trading-dashboard` (원하는 이름)
     - **Database Password**: 강력한 비밀번호 생성 (안전하게 보관!)
     - **Region**: `Northeast Asia (Seoul)` 선택 (가장 빠른 속도)
     - **Pricing Plan**: `Free` (무료 플랜으로 시작)
   - `Create new project` 버튼 클릭
   - ⏳ 프로젝트 생성까지 약 2분 소요

3. **프로젝트 생성 완료 확인**
   - 대시보드에 프로젝트가 표시되면 생성 완료

---

### Step 2: SQL 스크립트 실행

#### 2.1 SQL Editor 접속
1. 좌측 메뉴에서 `SQL Editor` 클릭
2. `New Query` 버튼 클릭

#### 2.2 스키마 생성 스크립트 실행
1. 파일 `01_create_schema.sql`의 전체 내용을 복사
2. SQL Editor에 붙여넣기
3. 우측 하단의 `RUN` 버튼 클릭 (또는 Ctrl+Enter)
4. ✅ 성공 메시지 확인:
   ```
   ✅ 스키마 생성 완료!
   생성된 테이블:
     1. holding_status (보유현황)
     2. trade_history (거래내역)
     3. portfolio_summary (포트폴리오 요약)
     4. system_status (시스템 상태)
     5. cio_reports (AI 보고서)
   ```

#### 2.3 RLS 보안 정책 설정
1. 다시 `New Query` 버튼 클릭
2. 파일 `02_setup_rls.sql`의 전체 내용을 복사
3. SQL Editor에 붙여넣기
4. `RUN` 버튼 클릭
5. ✅ 성공 메시지 확인:
   ```
   ✅ RLS 보안 정책 설정 완료!
   설정 내용:
     ✓ 모든 테이블에 RLS 활성화
     ✓ 읽기 정책: 누구나 접근 가능
     ✓ 쓰기 정책: service_role 키만 가능
   ```

---

### Step 3: 테이블 생성 확인

1. 좌측 메뉴에서 `Table Editor` 클릭
2. 다음 5개 테이블이 생성되었는지 확인:
   - ✅ `holding_status`
   - ✅ `trade_history`
   - ✅ `portfolio_summary`
   - ✅ `system_status`
   - ✅ `cio_reports`

3. 각 테이블을 클릭하여 컬럼 구조 확인 가능

---

### Step 4: API 키 확인 및 저장

#### 4.1 프로젝트 설정 페이지 접속
1. 좌측 메뉴 하단의 `Settings` (⚙️) 클릭
2. `API` 메뉴 선택

#### 4.2 필요한 정보 복사

다음 3가지 정보를 복사하여 **안전한 곳에 저장**하세요:

**① Project URL**
```
https://xxxxxxxxxxxxx.supabase.co
```
- 모든 곳에서 사용 (봇 + 대시보드)

**② anon (public) key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```
- 용도: **Vercel 대시보드용** (읽기 전용)
- 특징: 공개해도 안전 (RLS로 읽기만 가능)

**③ service_role (secret) key**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```
- 용도: **트레이딩 봇용** (모든 권한)
- ⚠️ **절대 공개 금지!** (모든 데이터 접근 가능)

---

### Step 5: 환경 변수 설정

#### 5.1 로컬 `.env` 파일 수정

프로젝트 루트의 `.env` 파일을 열어 다음 내용을 추가하세요:

```env
# ========================================
# 기존 API 키들 (유지)
# ========================================
UPBIT_ACCESS_KEY="your_existing_key"
UPBIT_SECRET_KEY="your_existing_secret"
OPENAI_API_KEY="your_existing_key"
GEMINI_API_KEY="your_existing_key"

# ========================================
# 신규 추가: Supabase 정보
# ========================================
# Supabase 프로젝트 URL
SUPABASE_URL="https://xxxxxxxxxxxxx.supabase.co"

# Supabase Service Role 키 (트레이딩 봇용 - 쓰기 권한)
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi..."

# Supabase Anon 키 (대시보드용 - 읽기 전용)
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi..."
```

⚠️ **주의**: `.env` 파일은 `.gitignore`에 추가하여 Git에 업로드되지 않도록 하세요!

---

## ✅ Phase 1 완료 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] SQL 스크립트 2개 모두 실행 완료
- [ ] 5개 테이블 생성 확인
- [ ] API 키 3가지 복사 및 안전 보관
- [ ] `.env` 파일에 Supabase 정보 추가
- [ ] `.gitignore`에 `.env` 추가 확인

---

## 🔍 문제 해결 (Troubleshooting)

### 문제 1: SQL 실행 시 에러 발생
**증상**: `ERROR: relation "holding_status" already exists`
**해결**: 이미 테이블이 생성되어 있습니다. 정상입니다.

### 문제 2: RLS 정책 생성 실패
**증상**: `ERROR: policy already exists`
**해결**: 이미 정책이 생성되어 있습니다. 정상입니다.

### 문제 3: 한글 컬럼명이 보이지 않음
**해결**: SQL에서 큰따옴표를 사용했는지 확인하세요: `"코인이름"`

---

## 📞 다음 단계

Phase 1이 완료되었습니다! 이제 다음 단계로 진행하세요:

👉 **Phase 2: 트레이딩 봇 Supabase 연동**
- `data_manager.py` 수정
- Supabase Python SDK 설치 및 연동
- 로컬 테스트

---

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [PostgreSQL JSONB 타입](https://www.postgresql.org/docs/current/datatype-json.html)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)

---

**작성일**: 2025-01-XX
**버전**: 1.0
**작성자**: Claude AI
