# feat: create-pr 스킬 추가 및 배포 - 한국/영문 PR 템플릿 자동 선택

## 요약
프로젝트 언어를 자동 감지하여 한국어 또는 영문 PR 템플릿을 선택하고, git 변경사항 분석을 통해 PR을 자동으로 생성하는 `create-pr` 스킬을 추가합니다. 사용자는 "PR 만들어줘"와 같은 간단한 요청으로 구조화된 PR을 자동 생성할 수 있습니다.

## 변경사항
- [x] **기능**: create-pr 스킬 핵심 구현 (SKILL.md)
- [x] **기능**: 프로젝트 언어 자동 감지 (README.md 한글 비율 기반)
- [x] **기능**: 한국어/영문 PR 템플릿 작성
- [x] **기능**: git log/diff 분석으로 PR 제목/본문 자동 생성
- [x] **기능**: GitHub 통합 (gh pr create 연동)
- [x] **테스트**: 3개 평가 케이스 작성 및 검증 (28/28 assertions 통과)
- [x] **문서**: CLAUDE.md에 스킬 사용 방법 추가

### 수정된 파일
- `.claude/skills/create-pr/SKILL.md` - 스킬 정의 및 워크플로우 (97줄)
- `.claude/skills/create-pr/references/template-ko.md` - 한국어 PR 템플릿 (48줄)
- `.claude/skills/create-pr/references/template-en.md` - 영문 PR 템플릿 (48줄)
- `CLAUDE.md` - 스킬 정보 및 사용 가이드 추가 (16줄)

## 테스트 계획

### 수동 테스트
- [x] 한국 프로젝트에서 국문 템플릿 선택 확인
- [x] 프로젝트 언어 자동 감지 정확성 검증
- [x] git 분석 기반 PR 제목/본문 자동 생성 확인
- [x] 실제 GitHub PR 생성 (PR #1 성공)
- [x] PR 본문의 모든 섹션(요약, 변경사항, 테스트, 체크리스트) 포함 확인

### 테스트 결과
| 평가 | 항목 수 | 성공 | 비율 |
|------|--------|------|------|
| Test 1: 한국어 템플릿 | 4 | 4 | 100% |
| Test 2: 자동 언어 감지 | 5 | 5 | 100% |
| Test 3: git 분석 기반 | 5 | 5 | 100% |
| **전체** | **14** | **14** | **100%** |

## 체크리스트
- [x] 코드가 프로젝트 스타일 가이드를 따름
- [x] 자체 리뷰 완료
- [x] 스킬 사용 시기에 대한 주석 추가 (SKILL.md)
- [x] CLAUDE.md에 스킬 사용 문서 작성
- [x] 새로운 경고 없음
- [x] 테스트 완료 및 검증

## 관련 이슈
신규 기능 추가 (관련 이슈 없음)

## 비고
- **스킬 위치**: `.claude/skills/create-pr/` (프로젝트 로컬 스킬로 설치됨)
- **사용 시기**: "PR 만들어줘", "PR 생성해줘", "create a PR" 등
- **allowed_tools**: Read, Glob, Grep, Bash (사용자 지정 제약)
- **테스트 결과**: 3개 평가 × 2개 구성(with/without skill) = 6개 테스트 모두 통과
- **실제 PR 생성**: GitHub의 okjyp-cns 계정에서 PR #1이 생성되어 작동 확인됨
