// --- 2-3. 화살표 함수 (Arrow Function) ---

// 1. 매개변수가 하나일 때 (소괄호 생략 가능하지만 여기서는 명시)
const sayHello = (name: string): string => {
  return `안녕하세요, ${name}님!`;
};

console.log(sayHello('홍길동'));

// 2. 한 줄로 작성, return 생략
const double = (x: number): number => x * 2;

console.log('double(10):', double(10)); // 20

// 3. 매개변수가 여러 개일 때
const addArrow = (a: number, b: number): number => {
  return a + b;
};

console.log('addArrow(5, 7):', addArrow(5, 7)); // 12

// 4. 여러 개 매개변수 + 한 줄 반환
const multiply = (a: number, b: number): number => a * b;

console.log('multiply(3, 4):', multiply(3, 4)); // 12

// 5. 반환 타입이 void인 경우
const logMessage = (msg: string): void => {
  console.log('>> ', msg);
};

logMessage('타입스크립트 배우는 중입니다!');

// 6. 선택적 매개변수 사용
const greetArrow = (name: string, message?: string): string => {
  return message ? `${name}님께, ${message}` : `${name}님, 안녕하세요!`;
};

console.log(greetArrow('홍길동'));
console.log(greetArrow('홍길동', '오늘도 파이팅입니다!'));

// 7. 기본값 매개변수 사용
const calculateTax = (price: number, rate: number = 0.1): number => {
  return price * (1 + rate);
};

console.log('calculateTax(100):', calculateTax(100)); // 110
console.log('calculateTax(100, 0.2):', calculateTax(100, 0.2)); // 120

// 8. 반환값이 객체일 경우 (소괄호로 감싸야 함)
const createUserArrow = (name: string, age: number) => ({
  name,
  age,
  createdAt: new Date(),
});

const user2 = createUserArrow('이서현', 30);
console.log('user2:', user2);
