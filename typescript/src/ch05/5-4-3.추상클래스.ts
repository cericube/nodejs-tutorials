// 4-3. 추상 클래스 Shape와 이를 상속하는 Circle, Rectangle, Triangle 예제

abstract class ShapeBase {
  abstract name: string;

  // 각 도형이 넓이를 계산하는 방식은 다르므로 추상 메서드로 정의
  abstract getArea(): number;

  // 공통 동작: 정보 출력
  display(): void {
    console.log(`도형: ${this.name}, 넓이: ${this.getArea().toFixed(2)}`);
  }
}

class Circle2 extends ShapeBase {
  name: string = '원';
  constructor(private radius: number) {
    super();
  }

  getArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

class Rectangle2 extends ShapeBase {
  name: string = '직사각형';
  constructor(
    private width: number,
    private height: number,
  ) {
    super();
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class Triangle2 extends ShapeBase {
  name: string = '삼각형';
  constructor(
    private base: number,
    private height: number,
  ) {
    super();
  }

  getArea(): number {
    return (this.base * this.height) / 2;
  }
}

// const s = new ShapeBase(); // ❌ 추상 클래스는 직접 인스턴스화 불가

// ✅ 다형성: ShapeBase 타입 배열로 한 번에 처리
const shapes: ShapeBase[] = [new Circle2(5), new Rectangle2(4, 6), new Triangle2(10, 3)];

for (const shape of shapes) {
  shape.display(); // 실제 인스턴스 타입에 따라 각자의 getArea()가 호출됨
}
