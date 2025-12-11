// 2-3. 생성자 매개변수에 접근 제어자를 붙여
//      자동으로 속성 선언 + 초기화를 처리하는 예제

class Product {
  // name: public, price: private, category: public(기본값)
  constructor(
    public name: string,
    private price: number,
    public category: string = '일반',
  ) {}

  public getPriceWithTax(): number {
    // private price는 클래스 내부에서 자유롭게 사용 가능
    const taxRate = 0.1; // 10%
    return this.price * (1 + taxRate);
  }

  public getLabel(): string {
    return `[${this.category}] ${this.name}`;
  }
}

const product = new Product('게이밍 마우스', 50_000, '전자기기');

console.log(product.name); // ✅ public
console.log(product.getLabel());
console.log(product.getPriceWithTax());

// console.log(product.price);       // ❌ private이라 직접 접근 불가
