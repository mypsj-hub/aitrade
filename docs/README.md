# 트레이딩봇 개발 가이드

> **📅 최종 업데이트**: 2025-10-24
> **📦 버전**: v2.0
> **목적**: 트레이딩봇 프로젝트의 모든 개발 문서를 체계적으로 관리

---

## 🎯 빠른 시작

### 학습 경로

```
1. gptbitcoin4/README.md (루트)
   → 전체 시스템 이해 (트레이딩봇 + 대시보드)
   ↓
2. docs/README.md (이 문서)
   → 트레이딩봇 시스템 개요
   ↓
3. docs/dev_guide/README.md
   → 개발 규칙 및 프롬프트 관리
   ↓
4. 명세서 3개
   → AI 판단 기준 상세
```

---

## 📁 디렉토리 구조

```
docs/
├── README.md                    # 이 파일 (Level 2: 트레이딩봇 총괄 가이드)
│
└── dev_guide/                   # 개발 가이드 (핵심 문서 4개)
    ├── README.md                # 개발 규칙 총괄 (기존 DEVELOPMENT_GUIDE.md)
    ├── AI자동편입_명세서.md      # AI 자동편입 프롬프트 명세
    ├── CIO비중_명세서.md         # CIO 프롬프트 명세
    ├── 매매판단_명세서.md        # Process2 프롬프트 명세
    └── 트레이딩봇_수정이력.md    # 전체 개발 이력 통합 (25개 파일 → 1개)
```

---

## 📚 핵심 문서 4개

### 1. [dev_guide/README.md](dev_guide/README.md)

**역할**: 개발 규칙 총괄

**내용**:
- 섹션 1-5: 기존 개발 규칙
- **섹션 6: 프롬프트 명세서 관리 규칙** ⭐
  - 6.1 명세서 위치
  - 6.2 프롬프트 수정 6단계
  - 6.3 관리 원칙
- 섹션 7: 명세서 학습 경로

**언제 보나요**:
- 코드를 처음 작성할 때
- 프롬프트를 수정할 때
- 모듈을 추가할 때

---

### 2. [dev_guide/AI자동편입_명세서.md](dev_guide/AI자동편입_명세서.md)

**역할**: AI 자동편입 프롬프트 명세

**핵심 내용**:
1. **핵심 철학**: 듀얼 퍼널 시스템 (Momentum Hunter + Quality Compounder)
2. **판단 원칙**: Dual Funnel → 백테스팅 검증 → AI 최종 면접
3. **검증 티어**: VERIFIED / PARTIAL / ALTERNATIVE
4. **시나리오 라이브러리**: 10개 구체적 시나리오
5. **검증 체크리스트**: 5개 필수 테스트

**실제 프롬프트 위치**: `ai_strategy/market_analysis.py` (Line 540~860)

---

### 3. [dev_guide/CIO비중_명세서.md](dev_guide/CIO비중_명세서.md)

**역할**: CIO 포트폴리오 비중 프롬프트 명세

**핵심 내용**:
1. **핵심 철학**: CIO 일관성 = 시스템 신뢰성
2. **판단 원칙**: MA120 지지 → MACD/RSI → Fear & Greed → 시총/섹터
3. **AI 자동편입 존중**: VERIFIED 코인은 예외적 제외만 허용
4. **시나리오 라이브러리**: 10개 구체적 시나리오
5. **검증 체크리스트**: 5개 필수 테스트

**실제 프롬프트 위치**: `ai_strategy/prompts/cio_*.txt`

---

### 4. [dev_guide/매매판단_명세서.md](dev_guide/매매판단_명세서.md)

**역할**: Process2 매매판단 프롬프트 명세

**핵심 내용**:
1. **핵심 철학**: CIO 목표는 "참고" (강제 아님)
2. **판단 원칙**: G섹터/C섹터 신호 → CIO 참고 → 과매매 방지 → 긴급도
3. **템플릿 강제**: JSON 템플릿 미준수 시 시스템 크래시 방지
4. **시나리오 라이브러리**: 10개 구체적 시나리오
5. **검증 체크리스트**: 5개 필수 테스트

**실제 프롬프트 위치**: `ai_strategy/prompts.py`

---

### 5. [dev_guide/트레이딩봇_수정이력.md](dev_guide/트레이딩봇_수정이력.md)

**역할**: 전체 개발 이력 통합 (25개 MD 파일 → 1개)

**통합된 내용**:
- **아키텍처 및 시스템 구조** (3개 파일)
  - CoinConfig vs DB 책임 분리
  - .gitignore 구조 정리
  - 트레이딩봇 프로세스 전체 흐름도

- **최적화 및 성능 개선** (4개 파일)
  - data_manager.py 모듈 분리 (3,006줄 → 8개 파일)
  - 로그 시스템 개선 v2.0
  - 모듈 Docstring 작업
  - 복잡한 계산 로직 인라인 주석

- **프로세스 개선 이력** (12개 파일)
  - AI 자동편입 개선 (검증, 고도화, 최종 검증)
  - CIO 포트폴리오 개선 (검증, 완료, 프롬프트 검토)
  - 긴급도 시스템 개선 (단순화, 분석, 제안, 구현 가이드)

- **주요 기능 설명** (6개 파일)
  - AI 자동편입, CIO 비중, 매매판단, 기타기능

---

## 🔄 프롬프트 수정 필수 절차

### 6단계 프로세스

프롬프트를 수정할 때는 반드시 아래 순서를 따르세요:

```
1단계: 명세서 먼저 확인
   ↓
   cat docs/dev_guide/[기능명]_명세서.md

2단계: 수정 계획 검증
   ↓
   - 핵심 철학에 부합하는가?
   - 기존 판단 원칙과 충돌하지 않는가?
   - 시나리오 라이브러리의 예시와 일치하는가?

3단계: 프롬프트 수정
   ↓
   - CIO: ai_strategy/prompts/cio_*.txt
   - AI자동편입: ai_strategy/market_analysis.py
   - Process2: ai_strategy/prompts.py

4단계: 명세서 업데이트 (필수!)
   ↓
   - 최종 업데이트 날짜 수정
   - 해당 섹션 업데이트
   - 수정 이력 기록 (필수!)

5단계: 검증 체크리스트 실행
   ↓
   - 명세서의 "6. 검증 체크리스트" 항목 실행
   - 시나리오 반복 테스트
   - 일관성 확인

6단계: 테스트 및 모니터링
   ↓
   - 시스템 재시작
   - 1일 운영 후 일관성 확인
   - 문제 발견 시 수정 이력에 기록
```

**⚠️ 중요**: 프롬프트만 수정하고 명세서를 업데이트하지 않으면 명세서가 무용지물이 됩니다!

---

## 📊 시스템 구성 요소

### 핵심 프로세스

| 프로세스 | 실행 주기 | 역할 | AI 사용 |
|---------|----------|------|---------|
| **Process1** | 5분마다 | 실시간 모니터링 | ❌ |
| **긴급도 감지** | Process1 내부 | 급등/급락 감지 | ✅ Gemini |
| **CIO** | 하루 3회 + 긴급 | 포트폴리오 전략 | ✅ OpenAI |
| **Process2** | 하루 3회 + 긴급 | 매매 실행 | ✅ Gemini/OpenAI |
| **AI 자동편입** | 하루 3회 | 신규 코인 스캔 | ✅ OpenAI |

### 데이터 소유권

| 데이터 필드 | 생성 주체 | 업데이트 권한 |
|-----------|----------|--------------|
| **GPT보유비중** | CIO | **CIO만** ⭐ |
| **GPT목표수익률** | CIO | **CIO만** ⭐ |
| **GPT목표손절률** | CIO | **CIO만** ⭐ |
| **GPT매매비중** | Process2 | Process2만 |
| **보유수량** | Process2 | Process2만 |

---

## 🎯 상황별 추천 문서

| 상황 | 추천 문서 |
|------|----------|
| **처음 시작** | 1. [gptbitcoin4/README.md](../README.md) → 2. 이 문서 → 3. [dev_guide/README.md](dev_guide/README.md) |
| **AI 프롬프트 수정** | [dev_guide/README.md](dev_guide/README.md#60-프롬프트-명세서-관리-규칙) → 해당 명세서 |
| **개발 규칙 확인** | [dev_guide/README.md](dev_guide/README.md) |
| **개발 이력 확인** | [dev_guide/트레이딩봇_수정이력.md](dev_guide/트레이딩봇_수정이력.md) |
| **AI 자동편입 이해** | [dev_guide/AI자동편입_명세서.md](dev_guide/AI자동편입_명세서.md) |
| **CIO 비중 이해** | [dev_guide/CIO비중_명세서.md](dev_guide/CIO비중_명세서.md) |
| **매매판단 이해** | [dev_guide/매매판단_명세서.md](dev_guide/매매판단_명세서.md) |

---

## ✅ 최신 업데이트

### 2025-10-24: 문서 구조 재편 (v2.0)

**변경 내용**:
1. **디렉토리 구조 간소화**
   - `docs/prompts/` → `docs/dev_guide/`로 통합
   - `docs/DEVELOPMENT_GUIDE.md` → `docs/dev_guide/README.md`로 이동
   - 25개 MD 파일 → 4개 핵심 문서로 통합

2. **명세서 관리 규칙 추가**
   - DEVELOPMENT_GUIDE.md에 섹션 6.0 추가
   - 프롬프트 수정 6단계 필수 절차 정립
   - Living Document 철학 도입

3. **수정 이력 통합**
   - architecture/ (3개)
   - optimization/ (4개)
   - process_analysis/ (12개)
   - docs 루트 (6개)
   - 총 25개 → `트레이딩봇_수정이력.md` 1개로 통합

**기대 효과**:
- ✅ 문서 찾기 쉬움 (4개 핵심 문서만)
- ✅ 프롬프트 일관성 향상
- ✅ 개발 이력 추적 용이
- ✅ 유지보수성 향상

---

## 🔗 관련 링크

### 내부 문서

- [gptbitcoin4/README.md](../README.md) - 프로젝트 전체 개요
- [dev_guide/README.md](dev_guide/README.md) - 개발 규칙 총괄
- [dev_guide/트레이딩봇_수정이력.md](dev_guide/트레이딩봇_수정이력.md) - 전체 개발 이력

### 명세서 (프롬프트 수정 시 필독)

- [dev_guide/AI자동편입_명세서.md](dev_guide/AI자동편입_명세서.md)
- [dev_guide/CIO비중_명세서.md](dev_guide/CIO비중_명세서.md)
- [dev_guide/매매판단_명세서.md](dev_guide/매매판단_명세서.md)

### 코드 파일

- `main.py` - 시스템 진입점
- `config.py` - 전역 설정
- `trade_manager.py` - 거래 실행
- `supabase_adapter.py` - DB 관리
- `ai_strategy/` - AI 전략 모듈
- `data_manager/` - 데이터 수집 모듈

---

**📅 최종 업데이트**: 2025-10-24
**📦 작성자**: AI Trading Bot Team
**📝 버전**: v2.0 (문서 구조 재편)
