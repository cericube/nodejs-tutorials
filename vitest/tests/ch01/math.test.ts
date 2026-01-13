import { describe, it, test, expect } from 'vitest';
import { add } from '../../src/ch01/math';

describe('Math Service', () => {
  it('1 더하기 2는 4이어야 한다', () => {
    const result = add(1, 2);
    expect(result).toBe(3);
  });

  test('더하기 테스트', () => {
    const result = 1 + 1;
    expect(result).toBe(3); // 일부러 틀린 기댓값을 넣었습니다.
  });
});
