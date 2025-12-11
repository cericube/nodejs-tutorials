// --- 2-1. 매개변수와 반환 타입 지정하기 ---
// 매개변수: a, b는 number
// 반환값: number
function add(a: number, b: number): number {
  return a + b;
}

const sum = add(10, 5);
console.log('sum:', sum); // 15

// 선택적 매개변수 사용 (message?: string)
function greet(name: string, message?: string): string {
  if (message) {
    return `${name}님께, ${message}`;
  }
  return `${name}님, 안녕하세요!`;
}

console.log(greet('홍길동')); // 홍길동님, 안녕하세요!
console.log(greet('홍길동', '오늘 날씨가 좋아요.')); // 홍길동님께, 오늘 날씨가 좋아요.

// 기본값 매개변수 사용 (taxRate = 0.1)
function calculate(price: number, taxRate: number = 0.1): number {
  return price * (1 + taxRate);
}

console.log('calculate(100):', calculate(100)); // 110
console.log('calculate(100, 0.2):', calculate(100, 0.2)); // 120

////////////////////////////////////////////////
// --- 2-2. 함수 표현식 (Function Expression) --

// 1. 함수 선언문 (Function Declaration)
function greet1(name: string): string {
  return `안녕하세요, ${name}님!`;
}

// 2. 함수 표현식 (Function Expression)
const greet2 = function (name: string): string {
  return `반가워요, ${name}님!`;
};

console.log(greet1('이서현'));
console.log(greet2('이서현'));

// 3. 선택적 매개변수 사용
function introduce(name: string, hobby?: string): string {
  if (hobby) {
    return `${name}님은 ${hobby}를 좋아합니다.`;
  }
  return `${name}님의 취미 정보가 없습니다.`;
}

console.log(introduce('박지호'));
console.log(introduce('박지호', '축구'));

// 4. 기본값 매개변수 사용
function discount(price: number, rate: number = 0.1): number {
  return price * (1 - rate);
}

console.log('discount(100):', discount(100)); // 90
console.log('discount(100, 0.2):', discount(100, 0.2)); // 80

// 5. 반환 타입이 void인 경우
function logError(message: string): void {
  console.error('오류:', message);
}

logError('파일을 찾을 수 없습니다.');

// 6. 매개변수가 없는 함수
function getNow(): Date {
  return new Date();
}

console.log('지금 시각:', getNow());

// 7. 반환값이 객체인 경우
function createUser(name: string, age: number): { name: string; age: number } {
  return {
    name,
    age,
  };
}

const user = createUser('김민수', 25);
console.log('user:', user);

// 8. 함수 타입을 명확히 지정한 변수 할당
// “함수 타입” + “함수 표현식” 개념이 같이 들어 있습니다.
// addFn
//  - “변수 이름”입니다.
// : (a: number, b: number) => number
//  - “이 변수에는 이런 함수만 들어와야 한다”는 타입
//  → “파라미터 2개 받고, 둘 다 number, 그리고 number를 반환하는 함수” 라는 타입

const addFn: (a: number, b: number) => number = function (a, b) {
  return a + b;
};

console.log('addFn(3, 4):', addFn(3, 4)); // 7
