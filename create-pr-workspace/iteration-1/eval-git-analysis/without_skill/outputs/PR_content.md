# feat: create-pr 스킬 생성 (PR 생성 자동화)

## 요약
PR 생성 프로세스를 자동화하는 스킬을 추가했습니다. 프로젝트의 사용 언어(한국어/영문)를 자동 감지하고, git 변경사항을 분석하여 적절한 템플릿을 선택해 PR을 생성합니다.

## 변경사항
- [x] **신규 스킬**: create-pr 스킬 생성 (SKILL.md)
- [x] **템플릿**: 한국어 PR 템플릿 작성 (template-ko.md)
- [x] **템플릿**: 영문 PR 템플릿 작성 (template-en.md)
- [x] **테스트 케이스**: evals.json에 3개 테스트 케이스 정의

### 수정된 파일
- `create-pr/SKILL.md` (97 라인)
- `create-pr/references/template-ko.md` (48 라인)
- `create-pr/references/template-en.md` (48 라인)
- `create-pr/evals/evals.json` (테스트 케이스)

## 테스트 계획
1. 한국 프로젝트에서 스킬 실행 → 국문 템플릿 선택 확인
2. 영문 프로젝트에서 스킬 실행 → 영문 템플릿 선택 확인
3. git log/diff 분석 후 PR 제목과 본문이 올바르게 생성되는지 확인

### 수동 테스트
- [x] 스킬 구조 및 문서 검증 완료
- [ ] 실제 환경에서 PR 생성 테스트
- [ ] 한국/영문 템플릿 동작 확인
- [ ] 언어 감지 로직 검증

### 자동 테스트
- [ ] 평가 케이스 실행 (with_skill & baseline)
- [ ] 벤치마크 비교

## 체크리스트
- [x] 코드가 프로젝트 스타일 가이드를 따름
- [x] SKILL.md에 명확한 워크플로우 문서화
- [x] 한국어/영문 템플릿 구성
- [x] 테스트 케이스 정의
- [x] allowed_tools 명시 (Read, Glob, Grep, Bash)
- [ ] 실제 테스트 완료

## 관련 이슈
Relates to 프로젝트 workflow 자동화

## 비고
- 언어 감지: README.md의 한글 문자 비율 > 50%로 판단
- 기본값: 감지 불가 시 영문 템플릿 사용
- 프로젝트는 fork 방식으로 서브에이전트에서 PR 생성
