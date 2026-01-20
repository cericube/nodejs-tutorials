import { vi, describe, it, expect } from 'vitest';

describe('Vitest Mock 함수 활용 테스트', () => {
  it('1. vi.fn()은 함수 호출 여부와 인자를 감시할 수 있다', () => {
    const spy = vi.fn();
    spy('hello');
    // 함수가 호출되었는지 검증
    expect(spy).toHaveBeenCalled();
    // 'hello'라는 인자와 함께 호출되었는지 검증
    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('2. mockReturnValue를 사용하면 고정된 반환값을 가질 수 있다', () => {
    // 어떤 인자가 들어와도 무조건 10을 반환하도록 설정
    const mockAdd = vi.fn().mockReturnValue(10);
    //
    //Promise를 반환해야 한다면 mockResolvedValue(값)를 사용하면 편리합니다.
    expect(mockAdd(1, 2)).toBe(10);
    expect(mockAdd(100, 200)).toBe(10);
    expect(mockAdd).toHaveBeenCalledTimes(2);
  });

  it('3. vi.fn(함수)를 사용하면 가짜 로직(Implementation)을 구현할 수 있다', () => {
    // 인자를 받아 문자열을 조합하는 로직을 직접 주입
    const mockOrder = vi.fn((item) => `${item} 주문 완료`);
    expect(mockOrder('사과')).toBe('사과 주문 완료');
    expect(mockOrder('포도')).toBe('포도 주문 완료');
    // 두 번째 호출되었을 때의 인자가 '포도'인지 확인
    expect(mockOrder).toHaveBeenLastCalledWith('포도');
  });
});
