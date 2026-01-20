import { vi, describe, it, expect } from 'vitest';

/**
 * 테스트할 함수: 상품 목록과 가격 계산 콜백을 받아
 * 최종 가격 리스트를 반환합니다.
 */
const applyDiscount = (prices: number[], calculate: (price: number) => number) => {
  return prices.map((price) => calculate(price));
};

describe('할인 시스템 테스트', () => {
  it('모든 상품에 10% 할인이 정확히 적용된 값을 반환해야 한다', () => {
    // 1. 가짜 함수 생성: 입력값의 10%를 뺀 값을 반환하도록 설정
    //vi.fn()의 인자로는 **객체({})가 아니라 함수(() => ...)**가 들어가야 합니다.
    const mockCalculator = vi.fn((price) => price * 0.9);
    const itemPrices = [10000, 20000, 50000];

    // 2. 실행
    const results = applyDiscount(itemPrices, mockCalculator);

    // 3. 검증 (Assertion)

    // 호출 횟수: 상품이 3개이므로 3번 호출되었는가?
    expect(mockCalculator).toHaveBeenCalledTimes(3);

    // [반환값 검증 1] 특정 순서의 결과값 확인
    // 10,000원 -> 9,000원 반환 확인
    expect(mockCalculator).toHaveNthReturnedWith(1, 9000);
    // 20,000원 -> 18,000원 반환 확인
    expect(mockCalculator).toHaveNthReturnedWith(2, 18000);
    // 50,000원 -> 45,000원 반환 확인
    expect(mockCalculator).toHaveNthReturnedWith(3, 45000);

    // [반환값 검증 2] 전체 결과 배열 확인
    // applyDiscount가 최종적으로 내뱉는 배열 자체를 검증
    expect(results).toEqual([9000, 18000, 45000]);

    // [반환값 검증 3] 내부 mock 객체 데이터 확인 (디버깅 시 유용)
    // mock.results에는 [{ type: 'return', value: 9000 }, ...] 형태로 저장됩니다.
    expect(mockCalculator.mock.results[0].value).toBe(9000);
  });
});
