// ------------------------------
// typeof는 두 가지 문맥에서 사용됩니다.
// 1) 런타임: 값의 타입을 문자열로 반환 (JS 공통)
// 2) 타입 위치: 값에서 타입을 추출 (TS 전용 기능)
// ------------------------------

// 1) 런타임 typeof 기본 사용
const num = 123;
const str = 'hello';
const bool = true;
const obj = { a: 1 };
const func = (x: number) => x * 2;

console.log('=== 1) 런타임 typeof 기본 사용 ===');
console.log('typeof num  :', typeof num); // "number"
console.log('typeof str  :', typeof str); // "string"
console.log('typeof bool :', typeof bool); // "boolean"
console.log('typeof obj  :', typeof obj); // "object"
console.log('typeof func :', typeof func); // "function"

// 2) 유니언 타입 + typeof로 타입 좁히기
//    - 런타임 typeof 결과에 따라 TypeScript가 타입을 좁혀줌
function printValue(value: number | string | boolean) {
  console.log('\n[printValue 호출] value =', value);

  if (typeof value === 'string') {
    // 여기서는 value가 string 타입으로 좁혀짐
    console.log('문자열 길이:', value.length);
  } else if (typeof value === 'number') {
    // 여기서는 value가 number 타입으로 좁혀짐
    console.log('숫자 제곱:', value * value);
  } else {
    // 위 두 조건이 아니면 boolean
    console.log('불리언 반전:', !value);
  }
}

console.log('\n=== 2) typeof + 유니언 타입 좁히기 ===');
printValue('TypeScript');
printValue(10);
printValue(false);

// 3) 타입 위치에서 typeof 사용: 객체 타입 재사용
const user = {
  name: 'Alice',
  age: 30,
};

type User = typeof user;
// User 타입은 { name: string; age: number; } 와 동일합니다.

const user1: User = {
  name: 'Bob',
  age: 25,
  // nickname: "Bobby", // ❌ User 타입에 없는 속성이라 에러 (주석 해제 시)
};

console.log('\n=== 3) 타입 위치 typeof: 객체 타입 재사용 ===');
console.log('user1:', user1);

// 4) 타입 위치에서 typeof 사용: 함수 타입 추출
function greet(name: string, age: number): string {
  return `Hello, ${name}. You are ${age} years old.`;
}

type GreetFn = typeof greet;
// GreetFn은 (name: string, age: number) => string 타입

const greet2: GreetFn = (n, a) => `Hi, ${n}. age = ${a}`;

console.log('\n=== 4) 타입 위치 typeof: 함수 타입 추출 ===');
console.log(greet('Alice', 30));
console.log(greet2('Bob', 20));

// 5) as const + typeof + keyof + 인덱싱 조합
//    - 상수 객체 값과 타입을 강하게 묶어서 사용하는 패턴
const STATUS = {
  READY: 'READY',
  DONE: 'DONE',
  ERROR: 'ERROR',
} as const;

// keyof typeof STATUS => "READY" | "DONE" | "ERROR"
type StatusKey = keyof typeof STATUS;

// (typeof STATUS)[StatusKey] => "READY" | "DONE" | "ERROR"
type StatusValue = (typeof STATUS)[StatusKey];

function setStatus(status: StatusValue) {
  console.log('상태 변경:', status);
}

console.log('\n=== 5) typeof + as const + 인덱싱 ===');
let statusKey: StatusKey = 'DONE'; // 키 유니언
let statusVal: StatusValue = 'ERROR'; // 값 유니언
console.log('statusKey :', statusKey);
console.log('statusVal :', statusVal);

setStatus('READY'); // ✅
// setStatus("PENDING"); // ❌ StatusValue에 없는 값 (주석 해제 시 타입 에러)

// 6) 배열 요소 타입 추출: typeof 배열 + [number] 인덱싱
const colors = ['red', 'green', 'blue'] as const;

type Color = (typeof colors)[number];
// "red" | "green" | "blue"

console.log('\n=== 6) typeof + 배열 요소 타입 추출 ===');
const favoriteColor: Color = 'green';
console.log('favoriteColor:', favoriteColor);

// const wrongColor: Color = "yellow"; // ❌ 허용되지 않는 값 (주석 해제 시 에러)

// 7) config 객체 타입 재사용 예시
const config = {
  port: 8080,
  useSsl: true,
  domain: 'example.com',
};

type Config = typeof config;

function printConfig(cfg: Config) {
  console.log(`서버 정보: https://${cfg.domain}:${cfg.port}, SSL 사용 여부: ${cfg.useSsl}`);
}

console.log('\n=== 7) typeof + 설정 객체 타입 재사용 ===');
printConfig({ port: 3000, useSsl: false, domain: 'my.dev' });
