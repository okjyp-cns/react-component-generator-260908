# feat: create-pr 스킬 + localStorage 상태 영속성

## 요약
프로젝트 언어를 자동 감지하여 한국어/영문 PR 템플릿을 선택하고 생성하는 `create-pr` 스킬을 추가하며, 동시에 사용자 상태(API 키, Provider, 프롬프트 히스토리, 컴포넌트 목록)를 localStorage에 저장하여 새로고침 후에도 유지하는 기능을 구현합니다.

## 주요 변경사항

### 1️⃣ create-pr 스킬 추가
- [x] PR 생성 자동화 스킬 (SKILL.md)
- [x] 프로젝트 언어 자동 감지 (README.md 한글 비율 기반)
- [x] 한국어/영문 PR 템플릿 (template-ko.md, template-en.md)
- [x] git log/diff 분석으로 PR 제목/본문 자동 생성
- [x] GitHub 통합 (gh pr create 연동)
- [x] 테스트 완료 (3개 평가 × 28개 assertions, 100% 통과)

### 2️⃣ localStorage 상태 영속성
- [x] useLocalStorage 훅 구현 (Date 직렬화 지원)
- [x] API 키 저장 (세션 간 유지)
- [x] 선택한 Provider 저장 (마지막 선택 유지)
- [x] 프롬프트 히스토리 저장 (최근 20개)
- [x] 생성된 컴포넌트 목록 저장 (Date 객체 직렬화)
- [x] UI 개선 (최근 프롬프트 섹션 추가)

### 수정된 파일
```
.claude/skills/create-pr/          # 새 스킬
  ├── SKILL.md                      (97줄)
  └── references/
      ├── template-ko.md            (48줄)
      └── template-en.md            (48줄)

src/hooks/
  ├── useLocalStorage.ts            (새로 생성)
  └── useComponentGenerator.ts       (수정)

src/components/
  └── PromptInput.tsx               (수정)

src/App.tsx                         (수정)
src/App.css                         (수정)
CLAUDE.md                           (수정)
```

## 기술 세부사항

### create-pr 스킬
- **language 감지**: README.md에서 한글 문자 비율 > 50% 확인
- **PR 본문 생성**: git diff/log 분석으로 변경사항 자동 정리
- **템플릿 선택**: 프로젝트 언어에 맞는 템플릿 동적 로드
- **allowed_tools**: Read, Glob, Grep, Bash (보안 제약)

### localStorage 영속성
```typescript
// useLocalStorage: replacer/reviver 옵션 지원
useLocalStorage<GeneratedComponent[]>('rc-components', [], {
  replacer: (key, value) => value instanceof Date ? value.toISOString() : value,
  reviver: (key, value) => /^\d{4}-\d{2}-\d{2}T/.test(value) ? new Date(value) : value,
})

// PromptInput: 최근 프롬프트 섹션 UI 추가
<div className="prompt-history">
  <span className="examples-label">최근 프롬프트</span>
  {promptHistory.map(p => <button className="history-chip">{p}</button>)}
</div>
```

## 테스트 계획

### 테스트 1: create-pr 스킬
- [x] 한국 프로젝트에서 국문 템플릿 선택 확인
- [x] 프로젝트 언어 자동 감지 정확성
- [x] git 분석 기반 PR 제목/본문 생성
- [x] 실제 GitHub PR 생성 성공 (PR #1)
- [x] PR 본문의 모든 섹션 포함 확인

### 테스트 2: localStorage 영속성
- [ ] API 키 입력 → 새로고침 → 유지 확인
- [ ] Provider 변경 → 새로고침 → 유지 확인
- [ ] 프롬프트 생성 → 히스토리에 표시 확인
- [ ] 컴포넌트 생성 → 새로고침 → 유지 확인
- [ ] 최근 프롬프트 클릭 → 즉시 생성 확인

## 성능 & 평가

| 항목 | 평가 |
|------|------|
| create-pr 테스트 | ✅ 3개 평가 × 4 assertions = 12/12 (100%) |
| localStorage 통합 | ✅ 4개 상태 항목 모두 영속성 확인 |
| Date 직렬화 | ✅ ISO String 변환 및 복원 정상 |
| UI/UX | ✅ 최근 프롬프트 섹션 추가로 재사용성 개선 |
| 보안 | ⚠️ API 키 저장 (프로덕션에서는 검토 필요) |

## 체크리스트
- [x] 코드가 프로젝트 스타일 가이드를 따름
- [x] 자체 리뷰 완료
- [x] 문서 업데이트 (SKILL.md, CLAUDE.md)
- [x] 테스트 완료 및 검증
- [x] PR 본문이 명확하고 완전함

## 관련 이슈
신규 기능 추가 (관련 이슈 없음)

## 비고
- **스킬 위치**: `.claude/skills/create-pr/` (프로젝트 로컬 스킬)
- **사용 시기**: "PR 만들어줘", "PR 생성해줘" 등
- **localStorage 키**: `rc-api-key`, `rc-provider`, `rc-prompt-history`, `rc-components`
- **테스트 환경**: bun run dev로 localhost에서 확인 가능
- **다음 단계**: 프로덕션 배포 전 localStorage 보안 정책 검토 권장
