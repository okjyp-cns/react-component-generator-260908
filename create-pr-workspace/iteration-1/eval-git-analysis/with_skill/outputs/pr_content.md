# feat: create-pr 스킬 추가 및 언어별 템플릿 구성

## 요약
<!-- 이 PR이 어떤 일을 하는지 간단히 설명 -->
git 변경사항 자동 분석 및 프로젝트 언어 감지를 통해 한국어/영문 PR 템플릿을 자동으로 선택하여 PR을 생성하는 스킬을 추가합니다.

## 변경사항
<!-- 이 PR에서 이루어진 주요 변경사항을 나열 -->
- [x] **기능**: create-pr 스킬 추가 (SKILL.md 작성)
- [x] **기능**: 프로젝트 언어 자동 감지 (한국어/영문 판별)
- [x] **기능**: 한국어 PR 템플릿 작성 (template-ko.md)
- [x] **기능**: 영문 PR 템플릿 작성 (template-en.md)
- [x] **기능**: git diff/log 분석 통합

### 수정된 파일
<!-- 주요 변경 파일 목록 (선택사항) -->
- `create-pr/SKILL.md`
- `create-pr/references/template-ko.md`
- `create-pr/references/template-en.md`

## 테스트 계획
<!-- 변경사항 검증 방법을 설명 -->
1. 한국 프로젝트 상황: README.md에서 한글 비율 > 50% 감지 → template-ko.md 사용 확인
2. 영문 프로젝트 상황: README.md에서 영문만 존재 → template-en.md 사용 확인
3. git 분석: git log와 git diff 명령으로 변경사항 정확히 추출

### 수동 테스트
- [x] 로컬에서 스킬 로드 및 SKILL.md 파일 구조 확인
- [x] README.md 한글 비율 감지 로직 테스트
- [x] 두 가지 템플릿 파일 내용 검증

### 자동 테스트
- [ ] PR 생성 스크립트 단위 테스트
- [ ] git 분석 통합 테스트
- [ ] 템플릿 로딩 테스트

## 체크리스트
- [x] 코드가 프로젝트 스타일 가이드를 따름
- [x] 자체 리뷰 완료
- [x] 복잡한 로직에 주석 추가
- [x] 문서 업데이트 (SKILL.md에 상세 가이드)
- [x] 새로운 경고 없음
- [ ] 관련 이슈/PR 연결 (해당 시)

## 관련 이슈
<!-- 관련 이슈가 있으면 링크: Closes #123, Relates to #456 -->

## 비고
- **allowed_tools**: Read, Glob, Grep, Bash (스킬 제약)
- **PR 제목 자동 생성**: git log에서 추출한 최근 커밋 메시지 활용
- **언어 감지 우선순위**: README.md (한글 비율) > CLAUDE.md > 기본값 (영문)
- **gh 의존성**: gh CLI 설치 및 GitHub 인증 필요
