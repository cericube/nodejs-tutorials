import { describe, it, expect } from 'vitest';

describe('2. Numbers 실습', () => {
  it('숫자 크기 비교 검증', () => {
    const weight = 75 + 5; // 80

    expect(weight).toBeGreaterThan(70); // 80 > 70
    expect(weight).toBeGreaterThanOrEqual(80); // 80 >= 80
    expect(weight).toBeLessThan(100); // 80 < 100
    expect(weight).toBeLessThanOrEqual(80); // 80 <= 80

    // 정확히 일치하는지 확인 (두 개 모두 사용 가능)
    expect(weight).toBe(80);
    expect(weight).toEqual(80);
  });

  it('부동 소수점 오차 검증 (가장 중요)', () => {
    const result = 0.1 + 0.2; // 실제 값: 0.30000000000000004

    // expect(result).toBe(0.3);
    // ❌ 위 코드는 실패합니다. JS의 부동 소수점 오차 때문입니다.

    // 해결책: toBeCloseTo를 사용합니다.
    // 두 번째 인자 '5'는 소수점 5째 자리까지 반올림해서 확인하겠다는 뜻입니다.
    expect(result).toBeCloseTo(0.3, 5);
  });

  it('금융/수량 관련 경계값 테스트 예시', () => {
    const balance = 1500.55;

    // 최소 잔액 기준 확인
    expect(balance).toBeGreaterThan(1000);
    // 정확한 소수점 금액 확인
    expect(balance).toBeCloseTo(1500.55, 2);
  });
});
