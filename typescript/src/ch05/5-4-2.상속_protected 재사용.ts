// 4-2. Vehicle을 상속하는 Car, Truck 예제 (protected 속성 사용)

class VehicleBase {
  protected speed: number; // 자식에서 접근 가능

  constructor(initialSpeed: number) {
    this.speed = initialSpeed;
  }

  accelerate(amount: number): void {
    this.speed += amount;
    console.log(`현재 속도: ${this.speed} km/h`);
  }

  brake(amount: number): void {
    this.speed -= amount;
    if (this.speed < 0) this.speed = 0;
    console.log(`브레이크 적용. 현재 속도: ${this.speed} km/h`);
  }
}

class Car2 extends VehicleBase {
  constructor(
    initialSpeed: number,
    public model: string,
  ) {
    super(initialSpeed);
  }

  // Car만의 메서드
  honk(): void {
    console.log(`${this.model}: 빵빵! (현재 속도: ${this.speed} km/h)`);
  }
}

class Truck2 extends VehicleBase {
  constructor(
    initialSpeed: number,
    private capacity: number,
  ) {
    super(initialSpeed);
  }

  load(weight: number): void {
    if (weight > this.capacity) {
      console.log('적재 용량을 초과했습니다!');
    } else {
      console.log(`${weight}kg 적재 완료 (총 용량: ${this.capacity}kg)`);
    }
  }
}

// ✅ 사용 예시
const car2 = new Car2(0, '소나타');
car2.accelerate(50);
car2.honk();

const truck2 = new Truck2(30, 10_000);
truck2.load(5_000);
truck2.accelerate(20);
truck2.brake(60);
