import { describe, it, test, expect } from 'vitest';

const add = (a: number, b: number) => a + b;
const subtract = (a: number, b: number) => a - b;

//it과 test는 동일한 기능을 제공합니다. 팀의 선호도에 따라 선택하세요.
describe('계산기', () => {
  // BDD 스타일 (Behavior-Driven Development)
  it('두 숫자를 더한다', () => {
    expect(add(2, 3)).toBe(5);
  });

  // TDD 스타일 (Test-Driven Development)
  test('두 숫자를 뺀다', () => {
    expect(subtract(5, 3)).toBe(2);
  });
});
