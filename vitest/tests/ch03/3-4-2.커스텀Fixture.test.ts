import { describe, expect, it } from 'vitest';

/**
 * [구조 1] 스코프 기반 확장 (Local Extension)
 * 특정 describe 블록 내에서 공통으로 사용할 속성을 정의합니다.
 */
describe('속성 주입 기본 구조', () => {
  // it.extend는 기존 it을 변경하지 않고, 설정이 추가된 '새로운 함수'를 반환합니다.
  const billingTest = it.extend({
    feature: 'billing',
    severity: 'critical',
  });

  billingTest('결제 실패 시 포인트 롤백 처리 확인', ({ task, feature, severity }) => {
    // 결과: [BILLING] Task: 결제 실패 시 포인트 롤백 처리 확인
    console.log(`[${feature.toUpperCase()}] Task: ${task.name}`);
    console.log(`[Severity] ${severity}`);

    expect(severity).toBe('critical');
  });
});

/**
 * [구조 2] 개별 속성 주입 및 불변성 확인
 * it.extend()가 반환하는 객체의 독립성을 이해하는 것이 핵심입니다.
 */
describe('개별 속성 주입 실습', () => {
  // [실습 A] 일회성 확장 실행
  // 특정 테스트 하나에만 즉시 확장을 적용합니다.
  it.extend({
    feature: 'billing',
    severity: 'critical',
    owner: 'QA-Team',
  })('결제 실패 시 롤백 확인', ({ feature, severity, owner }) => {
    console.log(`[실습 A] Severity: ${severity}`); // 결과: critical
    expect(severity).toBe('critical');
  });

  /**
   * [실습 B] 상속 및 독립성 확인
   * * 원인 분석:
   * 만약 여기서 severity가 여전히 'critical'로 나온다면,
   * import된 순수한 'it'이 아니라 상단에서 확장된 'testIt'이나
   * 재할당된 'it'을 참조하고 있을 가능성이 높습니다.
   * * 해결: 순수 vitest의 it을 사용하면 독립적인 설정이 적용됩니다.
   */
  it.extend({
    feature: 'auth',
    severity: 'medium', // 명시적으로 medium 설정
    owner: 'QA-Team',
  })('로그인 세션 만료 테스트', ({ feature, severity, owner }) => {
    // 이 테스트는 위 실습 A의 영향을 받지 않고 독자적인 'medium' 값을 가져야 합니다.
    console.log(`[실습 B] Severity: ${severity}`);

    expect(feature).toBe('auth');
    expect(severity).toBe('medium');
  });
});
