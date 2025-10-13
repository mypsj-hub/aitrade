# 🚀 Streamlit Cloud 배포 가이드 (Vercel 대신)

## ❌ Vercel 문제

Vercel은 서버리스 함수 기반이라 장기 실행되는 Streamlit 앱과 호환되지 않습니다.
오류: `FUNCTION_INVOCATION_FAILED`

## ✅ 해결책: Streamlit Cloud 사용

Streamlit Cloud는 Streamlit 앱 전용 무료 호스팅 서비스입니다.

---

## 📋 Streamlit Cloud 배포 단계

### 1단계: GitHub 저장소 확인

이미 준비되어 있습니다:
- Repository: https://github.com/mypsj-hub/aitrade
- 필요한 파일:
  - ✅ streamlit_app.py
  - ✅ requirements_streamlit.txt
  - ✅ .gitignore

### 2단계: requirements 파일명 변경

Streamlit Cloud는 `requirements.txt` 파일명을 기대합니다.

```bash
# 로컬에서 실행
git mv requirements_streamlit.txt requirements.txt
git commit -m "Rename requirements file for Streamlit Cloud"
git push origin main
```

### 3단계: Streamlit Cloud 접속

1. https://streamlit.io/cloud 접속
2. **Sign up** 또는 **Log in** 클릭
3. **Continue with GitHub** 선택하여 GitHub 계정(mypsj-hub)으로 로그인
4. Streamlit Cloud가 GitHub 저장소 접근 권한 요청 → **Authorize** 클릭

### 4단계: 새 앱 배포

1. 우측 상단 **New app** 버튼 클릭
2. 배포 설정:
   - **Repository**: `mypsj-hub/aitrade`
   - **Branch**: `main`
   - **Main file path**: `streamlit_app.py`
3. **Advanced settings** 클릭하여 환경 변수 설정

### 5단계: 환경 변수 설정 (Secrets)

**Secrets** 섹션에서 TOML 형식으로 입력:

```toml
[supabase]
url = "https://nlkbkyambjnlmuplpnrd.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sa2JreWFtYmpubG11cGxwbnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MDE2MzksImV4cCI6MjA3NDI3NzYzOX0.sFYud66oodoxQ1JritdZZeXYXgM2eHxeCEy3YhRqA_8"
```

### 6단계: 배포 시작

1. **Deploy!** 버튼 클릭
2. 배포 진행 상황 모니터링 (2-3분 소요)
3. 배포 완료 후 자동으로 앱 실행

### 7단계: 앱 접속

배포가 완료되면 자동으로 생성된 URL로 접속:
- URL 형식: `https://mypsj-hub-aitrade-xxxxx.streamlit.app`
- 또는: `https://<앱이름>.streamlit.app`

---

## 🎯 배포 완료 확인

- [ ] Streamlit Cloud에서 앱이 "Running" 상태
- [ ] 생성된 URL로 접속 가능
- [ ] "AI Trading Dashboard" 타이틀 표시
- [ ] Supabase 데이터 로딩 확인
- [ ] 에러 메시지 없음

---

## 🔧 문제 해결

### 1. "ModuleNotFoundError" 에러
- `requirements.txt` 파일명 확인 (requirements_streamlit.txt가 아님)
- GitHub에 파일이 푸시되었는지 확인

### 2. Secrets 오류
- Streamlit Cloud Dashboard → 앱 선택 → Settings → Secrets
- TOML 형식이 정확한지 확인 (들여쓰기, 따옴표)

### 3. Supabase 연결 실패
- Secrets에 `[supabase]` 섹션이 있는지 확인
- url과 key 값이 정확한지 확인
- Supabase ANON KEY 사용 (SERVICE_ROLE_KEY 아님)

### 4. 앱 슬립 모드
- 무료 플랜에서는 7일간 미사용 시 슬립
- 앱 접속하면 자동으로 깨어남 (30초 소요)

---

## 💰 Streamlit Cloud 무료 플랜

**포함 사항:**
- ✅ 1개 앱 배포
- ✅ 무제한 사용자
- ✅ 1GB 메모리
- ✅ GitHub 연동
- ✅ Secrets 관리
- ✅ 자동 재배포

**제한 사항:**
- ⚠️ 7일간 미사용 시 슬립 모드
- ⚠️ 1개 앱만 동시 실행
- ⚠️ 커뮤니티 지원

**총 비용: $0/월**

---

## 🔄 자동 재배포

GitHub에 변경 사항을 푸시하면 Streamlit Cloud가 자동으로 재배포:

```bash
# 코드 수정 후
git add streamlit_app.py
git commit -m "Update dashboard"
git push origin main

# 약 2분 후 자동으로 반영됨
```

---

## 📱 모바일 접속

Streamlit Cloud URL은 모바일에서도 완벽 작동:
- 반응형 디자인
- 언제 어디서나 접속 가능

---

## 🆚 Vercel vs Streamlit Cloud

| 항목 | Vercel | Streamlit Cloud |
|------|--------|-----------------|
| Streamlit 지원 | ❌ 서버리스 함수 한계 | ✅ 네이티브 지원 |
| 배포 난이도 | 🔴 어려움 | 🟢 쉬움 |
| 무료 플랜 | ✅ | ✅ |
| 자동 슬립 | ❌ | ⚠️ 7일 후 |
| 권장 사항 | Next.js, API | **Streamlit 앱** |

---

## 📞 다음 단계

1. ✅ requirements_streamlit.txt → requirements.txt 이름 변경
2. ✅ GitHub에 푸시
3. ✅ Streamlit Cloud에서 배포
4. ✅ 로컬에서 트레이딩 봇 실행 (`python main.py`)
5. ✅ Streamlit Cloud URL로 실시간 모니터링!

---

## 🎉 완료!

Streamlit Cloud 배포가 완료되면:
- **트레이딩 봇** (로컬 PC) → Supabase에 데이터 쓰기
- **웹 대시보드** (Streamlit Cloud) → Supabase에서 데이터 읽기
- 24/7 웹 접속 가능!

**Streamlit Cloud**: https://streamlit.io/cloud
**GitHub Repository**: https://github.com/mypsj-hub/aitrade
