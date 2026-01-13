import { describe, it, expect } from 'vitest';

class Cart {
  items: Record<string, number> = {};

  add(productId: string, quantity: number) {
    if (quantity <= 0) throw new Error('수량은 0보다 커야 합니다.');
    this.items[productId] = (this.items[productId] || 0) + quantity;
  }
}

describe('장바구니 기능 테스트', () => {
  // .only: 이 테스트 파일 내에서 이 테스트만 실행합니다.
  it.only('장바구니에 상품을 추가하면 수량이 증가해야 한다', () => {
    const cart = new Cart();
    cart.add('Apple', 1);
    expect(cart.items['Apple']).toBe(1);
  });

  it('상품 수량은 음수가 될 수 없다', () => {
    const cart = new Cart();
    // .only가 위에 있으므로, 이 테스트는 무시됩니다.
    expect(() => cart.add('Apple', -1)).toThrow();
  });

  // .skip: 구현이 미완성되었거나 잠시 꺼두어야 할 때 사용합니다.
  it.skip('할인 쿠폰 적용 로직 (다음 스프린트 구현 예정)', () => {
    // 로직 미구현 상태에서도 전체 테스트 결과에 영향을 주지 않습니다.
  });
});
