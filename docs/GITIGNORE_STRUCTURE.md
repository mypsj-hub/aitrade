# .gitignore 구조 정리

## 📁 프로젝트 구조

```
c:\gptbitcoin4\
├── .gitignore                  # 루트 .gitignore (Python 트레이딩 봇용)
├── dashboard/                  # Next.js 대시보드
│   ├── .gitignore             # dashboard .gitignore (Next.js용)
│   ├── lib/                   # ✅ TypeScript 파일 (Git 추적됨)
│   │   ├── types.ts
│   │   ├── supabase.ts
│   │   └── hooks/
│   └── ...
├── lib/                        # ❌ Python 라이브러리 (Git 무시됨)
├── main.py                     # 트레이딩 봇 (Git 추적 안 함)
└── ...
```

---

## 🔧 수정 내용

### 문제:
원래 루트 `.gitignore`에 `lib/`가 글로벌로 설정되어 있어서 `dashboard/lib/`도 무시되었습니다.

### 해결책:
Python 관련 경로를 **루트 전용**으로 범위 제한:

#### Before (잘못된 설정):
```gitignore
lib/          # 모든 하위 폴더의 lib도 무시
build/
dist/
```

#### After (올바른 설정):
```gitignore
/lib/         # 루트의 lib만 무시 (dashboard/lib는 제외)
/build/
/dist/
```

---

## 📄 .gitignore 파일별 역할

### 1. 루트 `.gitignore` (Python 프로젝트용)
**위치**: `c:\gptbitcoin4\.gitignore`

**무시 대상**:
- Python 관련: `__pycache__/`, `*.pyc`, `/lib/`, `/dist/`, etc.
- 환경 변수: `.env`, `.env.local`
- 데이터베이스: `*.db`, `*.sqlite`
- 로그: `*.log`, `logs/`
- 가상환경: `venv/`, `env/`
- IDE: `.vscode/`, `.idea/`

**특징**:
- `/lib/` → 루트의 `lib/` 폴더만 무시
- `dashboard/lib/`은 영향 받지 않음

### 2. Dashboard `.gitignore` (Next.js 프로젝트용)
**위치**: `c:\gptbitcoin4\dashboard\.gitignore`

**무시 대상**:
- Node.js: `node_modules/`, `npm-debug.log*`
- Next.js: `/.next/`, `/out/`
- 빌드: `/build/`
- 환경 변수: `.env*`
- Vercel: `.vercel/`
- TypeScript: `*.tsbuildinfo`, `next-env.d.ts`

**특징**:
- `lib/` 무시 항목 없음 → `dashboard/lib/` 정상 추적

---

## ✅ Git 추적 상태

### 추적되는 파일 (GitHub에 포함):
```
dashboard/
├── lib/
│   ├── types.ts              ✅ 추적됨
│   ├── supabase.ts           ✅ 추적됨
│   └── hooks/
│       └── useDashboardData.ts  ✅ 추적됨
├── components/               ✅ 추적됨
├── app/                      ✅ 추적됨
├── package.json              ✅ 추적됨
└── .gitignore               ✅ 추적됨
```

### 무시되는 파일 (GitHub에 제외):
```
dashboard/
├── node_modules/             ❌ 무시됨
├── .next/                    ❌ 무시됨
├── .env.local                ❌ 무시됨
└── .vercel/                  ❌ 무시됨

루트/
├── lib/                      ❌ 무시됨 (Python 라이브러리)
├── __pycache__/              ❌ 무시됨
├── .env                      ❌ 무시됨
├── *.db                      ❌ 무시됨
└── venv/                     ❌ 무시됨
```

---

## 🔍 검증 방법

### 1. dashboard/lib가 추적되는지 확인:
```bash
cd c:/gptbitcoin4
git add dashboard/lib/
# 에러 없이 성공하면 OK
```

### 2. 루트 lib는 무시되는지 확인:
```bash
mkdir lib
touch lib/test.py
git status
# lib/test.py가 Untracked로 표시되지 않으면 OK
```

### 3. Git 추적 파일 목록 확인:
```bash
git ls-files dashboard/lib/
# dashboard/lib/types.ts
# dashboard/lib/supabase.ts
# dashboard/lib/hooks/useDashboardData.ts
```

---

## 📝 .gitignore 패턴 설명

| 패턴 | 의미 | 예시 |
|------|------|------|
| `lib/` | 모든 폴더의 lib 무시 | `lib/`, `dashboard/lib/` 모두 무시 |
| `/lib/` | 루트의 lib만 무시 | `lib/` 무시, `dashboard/lib/` 추적 |
| `*.db` | 모든 .db 파일 무시 | `data.db`, `test/data.db` 모두 무시 |
| `node_modules/` | 모든 node_modules 무시 | 어디든 무시 |

---

## 🎯 Best Practice

### Python + Next.js 혼합 프로젝트:
1. **루트 .gitignore**: Python 관련 경로는 `/`로 시작 (루트 전용)
2. **서브 프로젝트 .gitignore**: 각 프레임워크별 전용 설정
3. **전역 패턴**: IDE 설정(`.vscode/`)은 어디서든 무시

### 예시:
```gitignore
# 루트 .gitignore
/lib/          # 루트 lib만 (Python)
/dist/         # 루트 dist만 (Python)
__pycache__/   # 모든 __pycache__ (Python 특성)
.vscode/       # 모든 .vscode (IDE 설정)

# dashboard/.gitignore
/node_modules/ # dashboard/node_modules만
/.next/        # dashboard/.next만
```

---

## 🔄 수정 이력

### 2025-01-13 (cecfab9)
- Python 관련 경로를 루트 전용으로 변경
- `lib/` → `/lib/`
- `build/` → `/build/`
- `dist/` → `/dist/`
- `dashboard/lib/` 정상 추적 가능

---

## 📞 문제 해결

### "dashboard/lib is ignored" 에러 발생 시:
1. 루트 `.gitignore` 확인
2. `lib/` → `/lib/`로 수정
3. `git rm --cached -r .` (캐시 초기화)
4. `git add .`
5. `git commit -m "Fix gitignore"`

### 확인 명령어:
```bash
# dashboard/lib가 무시되는지 확인
git check-ignore -v dashboard/lib/types.ts

# 결과가 나오면 무시되는 것 (문제)
# 결과가 없으면 추적되는 것 (정상)
```

---

**정리 완료!** ✅ 이제 `dashboard/lib/`는 정상적으로 Git에 추적됩니다.
