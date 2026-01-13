import { it, expect, vi, describe } from 'vitest';

describe('함수 호출 행위 검증', () => {
  it('Spies & Mocks 실전 활용', () => {
    // 1. 가짜 함수(Mock) 생성
    const sendNotification = vi.fn((message: string, code?: number) => true);

    // 2. 함수 실행 (실제로는 특정 비즈니스 로직 내부에서 실행됨)
    sendNotification('결제가 완료되었습니다.', 200);
    sendNotification('배송이 시작되었습니다.', 300);

    // 3. 검증 시작
    // 최소 한 번은 실행되었는가?
    expect(sendNotification).toHaveBeenCalled();

    // 정확히 2번 실행되었는가?
    expect(sendNotification).toHaveBeenCalledTimes(2);

    // 첫 번째 호출 때 어떤 인자를 받았는가? (정밀 검증)
    // 숫자는 정확한 값 대신 '어떤 숫자든 상관없음'으로 유연하게 검증 가능
    expect(sendNotification).toHaveBeenCalledWith('결제가 완료되었습니다.', expect.any(Number));

    // 가장 마지막 호출의 인자는 무엇인가?
    expect(sendNotification).toHaveBeenLastCalledWith('배송이 시작되었습니다.', 300);
  });

  it('객체 인자 검증 (Partial Matching)', () => {
    const updateUser = vi.fn();

    updateUser({ id: 1, name: 'Alice', role: 'admin' });

    // 객체의 모든 속성을 다 적지 않고, 특정 속성이 포함되어 있는지만 확인
    expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alice' }));
  });
});
