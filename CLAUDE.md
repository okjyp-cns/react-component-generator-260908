@AGENTS.md

## 스킬 (Skills)

### create-pr
PR 생성 자동화 스킬. git 변경사항을 분석하고 프로젝트 언어(한국/영문)를 자동 감지한 후, 맞춤형 PR 템플릿으로 pull request를 생성합니다.

**사용 시기:**
- "PR 만들어줘", "PR 생성해줘"
- 커밋 완료 후 PR 작성 필요 시
- 변경사항을 정리해서 PR로 올릴 때

**특징:**
- 한국어/영문 자동 감지 (README.md 기반)
- 프로젝트별 템플릿 자동 선택
- git log/diff 분석으로 PR 제목/본문 자동 생성
- GitHub 통합 (gh pr create 연동)
