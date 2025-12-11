// ------------------------------
// instanceof는 런타임에 어떤 객체가 특정 클래스/생성자의 인스턴스인지
// 프로토타입 체인을 기준으로 검사하는 연산자입니다.
// TypeScript에서는 이 결과를 기반으로 "타입 좁히기"에 활용할 수 있습니다.
// ------------------------------

// 1) 기본 클래스 정의
class Dog {
  constructor(public name: string) {}

  bark() {
    console.log(`${this.name}: 멍멍!`);
  }
}

class Cat {
  constructor(public name: string) {}

  meow() {
    console.log(`${this.name}: 야옹!`);
  }
}

type Animal = Dog | Cat;

console.log('=== 1) instanceof 기본 사용 + 타입 좁히기 ===');

function makeSound(animal: Animal) {
  // Animal은 Dog | Cat 유니언 타입입니다.

  if (animal instanceof Dog) {
    // 이 블록 안에서는 animal 타입이 Dog로 좁혀집니다.
    animal.bark();
  } else {
    // 위 조건이 아니면 Cat 타입이라는 것이 보장됩니다.
    animal.meow();
  }
}

const dog = new Dog('바둑이');
const cat = new Cat('나비');

makeSound(dog); // 바둑이: 멍멍!
makeSound(cat); // 나비: 야옹!

// 2) instanceof와 상속 관계: 기본 클래스 vs 파생 클래스
class AnimalBase {
  constructor(public name: string) {}
}

class Bird extends AnimalBase {
  fly() {
    console.log(`${this.name}가 하늘을 날아갑니다.`);
  }
}

class Fish extends AnimalBase {
  swim() {
    console.log(`${this.name}가 물속을 헤엄칩니다.`);
  }
}

console.log('\n=== 2) 상속 관계에서 instanceof 사용 ===');

function move(animal: AnimalBase) {
  if (animal instanceof Bird) {
    animal.fly();
  } else if (animal instanceof Fish) {
    animal.swim();
  } else {
    console.log(`${animal.name}는 움직이는 방법을 알 수 없습니다.`);
  }
}

const bird = new Bird('참새');
const fish = new Fish('고등어');

move(bird);
move(fish);

// 3) Error / CustomError 분기 처리에 instanceof 사용
class CustomError extends Error {
  constructor(
    message: string,
    public code: number,
  ) {
    super(message);
    this.name = 'CustomError';
  }
}

console.log('\n=== 3) Error / CustomError 에서 instanceof로 분기 ===');

function handleError(err: unknown) {
  if (err instanceof CustomError) {
    // CustomError 타입으로 좁혀짐
    console.log(`커스텀 에러 발생! code=${err.code}, message=${err.message}`);
  } else if (err instanceof Error) {
    // 일반 Error 타입으로 좁혀짐
    console.log(`일반 에러: ${err.name}, message=${err.message}`);
  } else {
    // 그 외 알 수 없는 타입
    console.log('알 수 없는 에러 타입:', err);
  }
}

try {
  throw new CustomError('권한이 없습니다.', 403);
} catch (e) {
  handleError(e);
}

try {
  throw new Error('단순 에러입니다.');
} catch (e) {
  handleError(e);
}

handleError('문자열 형태의 에러'); // Error가 아닌 경우

// 4) Date vs string 구분에 instanceof 사용
console.log('\n=== 4) Date vs string 타입 좁히기 ===');

function formatDate(value: Date | string) {
  if (value instanceof Date) {
    // 여기서는 value가 Date 타입
    console.log('[Date] toISOString():', value.toISOString());
  } else {
    // 여기서는 value가 string 타입
    console.log('[string] 그대로 출력:', value);
  }
}

formatDate(new Date());
formatDate('2025-01-01T00:00:00Z');

// 5) instanceof로 "타입 가드 역할" 하는 유틸 함수 만들기
//    - is 연산자를 사용한 사용자 정의 타입 가드와 함께 사용 가능

class Car {
  drive() {
    console.log('자동차가 도로를 달립니다.');
  }
}

class Bicycle {
  ride() {
    console.log('자전거가 도로를 달립니다.');
  }
}

type Vehicle = Car | Bicycle;

// 사용자 정의 타입 가드: 반환 타입에 is를 사용
function isCar(v: Vehicle): v is Car {
  return v instanceof Car;
}

console.log('\n=== 5) instanceof + 사용자 정의 타입 가드 ===');

function useVehicle(v: Vehicle) {
  if (isCar(v)) {
    // isCar가 true면 v는 Car 타입
    v.drive();
  } else {
    // 아니면 Bicycle 타입
    v.ride();
  }
}

useVehicle(new Car());
useVehicle(new Bicycle());
