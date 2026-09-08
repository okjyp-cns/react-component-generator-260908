---
name: create-pr
description: Automate PR creation with intelligent template selection. Analyzes git changes, detects project language (Korean vs English), and generates PRs with appropriate templates. Use this when you need to create a pull request with well-structured descriptions, or when the user asks to "create a PR", "make a pull request", "generate PR", or "커밋 후 PR 생성" / "PR 만들어줘".
compatibility:
  tools:
    - Read
    - Glob
    - Grep
    - Bash
---

# PR 생성 자동화 스킬 (create-pr)

PR 생성 과정을 자동화합니다. git 변경사항을 분석하고, 프로젝트의 사용 언어를 감지한 후, 한국어 또는 영문 템플릿 중 적절한 것을 선택해 PR을 생성합니다.

## 워크플로우

### 1. 프로젝트 언어 감지

현재 프로젝트의 기본 언어(한국어/영문)를 다음 우선순위로 감지합니다:

1. **README 파일 확인**
   - `README.md`에 한글 문자 비율 > 50% → 한국어 프로젝트
   - `README.ko.md` 또는 `README_KO.md` 존재 → 한국어 프로젝트
   - 영문 README만 존재 → 영문 프로젝트

2. **CLAUDE.md 또는 AGENTS.md 확인**
   - 파일 내 한글 문자 비율 확인

3. **기본값**
   - 감지 불가 → 영문 템플릿 사용

### 2. git 변경사항 분석

```bash
# 현재 브랜치와 main의 차이 확인
git diff main...HEAD --stat

# 최근 5개 커밋 메시지 추출
git log -n 5 --oneline

# 변경된 파일 유형 분석 (.test.ts, .md 등)
```

PR 제목과 설명에 포함할 정보:
- 변경된 파일 목록 (파일 유형별 분류)
- 커밋 메시지 요약
- 추가/삭제된 라인 수

### 3. 템플릿 로드 및 PR 본문 작성

프로젝트 언어에 맞는 템플릿을 로드합니다:

- **한국어 프로젝트** → `references/template-ko.md` 사용
- **영문 프로젝트** → `references/template-en.md` 사용

템플릿의 섹션을 작성 상황에 맞게 채웁니다:
- 변경사항 요약
- 구체적인 변경 내용
- 테스트 계획
- 체크리스트

### 4. PR 생성

`gh pr create` 명령으로 PR을 생성합니다:

```bash
gh pr create \
  --title "<자동생성 제목 또는 사용자 입력>" \
  --body "<템플릿 기반 본문>" \
  --draft  # 초안 상태로 생성 (선택)
```

## 사용 시기

다음 상황에서 이 스킬을 트리거합니다:

- **명시적 요청**: "PR 만들어줘", "PR 생성해줘", "create a pull request"
- **커밋 후 PR**: 커밋을 완료한 후 "이제 PR 생성해줄래?"
- **브랜치 작업 완료**: "작업 완료했으니 PR 올려줄래?"
- **변경사항 정리**: 여러 커밋 후 "이 변경사항들 PR로 정리해줘"

## 프로젝트별 템플릿 전환

| 상황 | 감지 방식 | 사용 템플릿 |
|------|---------|----------|
| 국내 팀 프로젝트 | README.md 한글 비율 > 50% | template-ko.md |
| 해외 오픈소스 | README.md 영문만 존재 | template-en.md |
| 혼합 프로젝트 | `README.ko.md` 존재 | template-ko.md |
| 감지 불가 | 모호한 경우 | template-en.md (기본값) |

## 참고사항

- **draft 옵션**: 초안 상태로 생성하려면 사용자에게 확인 후 적용
- **원격 브랜치**: 로컬 브랜치가 원격에 푸시되어 있어야 PR 생성 가능
- **gh 인증**: `gh auth login`으로 GitHub 인증 필요
- **PR 제목 길이**: 50자 이내 권장 (72자 이상 피하기)
