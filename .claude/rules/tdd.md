⚠️ **이 규칙은 Rigid — 상황에 맞게 변형하지 마라**

프로젝트의 `CLAUDE.md` 또는 `AGENTS.md`에 TDD 규칙이 명시돼 있으면 그것을 우선한다. 이 파일은 기본값(fallback)이다.

---

# TDD (Test-Driven Development) 규칙

## 적용 기준 구분

### ✅ TDD를 반드시 적용해야 하는 대상

- **비즈니스 로직**: 주문 처리, 결제, 권한 검사, 데이터 변환
- **API 엔드포인트**: 요청 검증, 응답 형식, 상태 코드
- **유틸리티 함수**: 날짜 계산, 문자열 파싱, 수학 연산
- **버그 수정**: 재현 테스트 작성 → 수정 → 테스트 통과 확인

### ❌ TDD가 불필요한 대상

- **타입 정의**: 인터페이스, 타입 앨리어스 (TypeScript가 체크)
- **설정 파일**: `tsconfig.json`, `eslint.config.js`, `.env.example`
- **순수 UI**: 디자인만 다른 리스트, 버튼 스타일, 레이아웃 (스냅샷/e2e 테스트로 충분)
- **SQL 쿼리**: 데이터베이스 스키마 테스트로 충분 (단, 쿼리 빌더 함수는 TDD 적용)
- **마이그레이션**: 스크립트 실행 결과 검증 (문서화만 충분)

---

## RED-GREEN-REFACTOR 사이클

### 🔴 RED: 실패하는 테스트 작성

**규칙**:
1. **하나의 동작 = 하나의 테스트**: 여러 케이스를 한 테스트에 섞지 마라
2. **반드시 실행해서 실패 확인**: 실제로 `npm test` / `bun test` 돌려서 빨간색 확인
3. **실패 이유가 "기능 미구현"이어야 함**: 
   - ✅ `TypeError: createOrder is not defined`
   - ✅ `AssertionError: expected 100 to equal 120`
   - ❌ `SyntaxError` (테스트 코드 자체 오류)

**예시**:
```typescript
describe('OrderService', () => {
  it('should charge 10% tax for orders over $100', () => {
    const order = createOrder(150);
    expect(order.total).toBe(165); // 150 * 1.1
  });
});
// → 실패: createOrder is not defined
```

### 🟢 GREEN: 최소한의 코드로 테스트 통과

**규칙**:
1. **YAGNI 원칙** (You Ain't Gonna Need It): 테스트를 통과시키는 데 필요한 코드만 작성
2. **신규 + 기존 테스트 모두 통과** 확인:
   ```bash
   npm test  # 또는 bun test
   # ✅ 모든 테스트 통과
   ```
3. **꼼수도 괜찮다** (초기에는):
   ```typescript
   function createOrder(amount) {
     return { total: amount * 1.1 }; // 기능을 다 구현하지 말고 테스트만 통과
   }
   ```

### 🔵 REFACTOR: 기능 유지, 품질 개선

**규칙**:
1. **GREEN 유지**: 테스트가 여전히 통과해야 함
2. **할 수 있는 개선**:
   - 중복 제거 (DRY)
   - 변수/함수명 개선
   - 헬퍼 함수 추출
3. **절대 금지**:
   - 새로운 동작 추가 (다음 RED로)
   - 테스트 수정 (기존 의도 변경)

**예시**:
```typescript
// GREEN 단계 코드
function createOrder(amount) {
  return { total: amount * 1.1 };
}

// REFACTOR 후 (기능은 동일)
function calculateTotalWithTax(amount, taxRate = 0.1) {
  return amount * (1 + taxRate);
}

function createOrder(amount) {
  return { total: calculateTotalWithTax(amount) };
}
// → 테스트는 여전히 통과
```

### 🔄 다음 동작으로 반복

다음 테스트 케이스가 있으면 RED로 돌아가기:

```typescript
it('should apply discounts for VIP members', () => {
  const order = createOrder(150, { vip: true });
  expect(order.total).toBe(148.5); // 165 * 0.9
});
// → 실패 (VIP 기능 미구현) → GREEN → REFACTOR → 반복
```

---

## 삭제 강제 규칙

**반드시 지킬 것**:

1. **테스트 전에 프로덕션 코드를 먼저 작성했으면 삭제하고 RED부터 재시작**
   - "시험 삼아 구현해본 것"도 삭제
   - 스케치 코드도 삭제
   - 이미 동작하는 코드도 삭제

2. **"참고용으로 남겨두겠다"는 금지**
   - 주석 처리된 코드도 삭제
   - `// TODO: 나중에 구현` 도 삭제
   - 이미 완성된 코드를 "백업"으로 두지 마라

**이유**: RED에서 시작하지 않으면 테스트가 실제로 뭔가를 검증하는지 알 수 없다.

---

## 변명 차단표

| 변명 | 반론 |
|------|------|
| **"너무 단순해서 테스트 불필요"** | 단순할수록 테스트가 싸다. 나중에 누군가 건드렸을 때 보호책이 된다. |
| **"나중에 추가하겠다"** | 나중에 추가된 테스트는 보통 추가되지 않는다. 지금 하자. |
| **"시간이 없다"** | 테스트 없이 작성한 코드는 나중에 수정 시간이 2배 이상 걸린다. |
| **"삭제하면 낭비"** | 이미 동작하는 코드를 남기면 RED를 할 수 없다. 그게 더 낭비다. |
| **"프로토타입이다"** | 프로토타입이라도 TDD로 하면 프로덕션 코드가 된다. 프로토타입 코드는 나중에 버린다. |

---

## 체크리스트

RED 단계:
- [ ] 새 테스트 작성 (한 가지 동작만)
- [ ] `npm test` 실행 → 빨간색 확인
- [ ] 실패 이유가 "기능 미구현"인가?

GREEN 단계:
- [ ] 최소 코드 작성 (테스트만 통과하면 됨)
- [ ] `npm test` 실행 → 모든 테스트 초록색 확인
- [ ] 기존 기능 깨졌는가? (No)

REFACTOR 단계:
- [ ] 중복 제거 / 이름 개선 / 헬퍼 추출
- [ ] `npm test` 실행 → 초록색 유지
- [ ] 기능 추가했는가? (No → 다음 RED로)
