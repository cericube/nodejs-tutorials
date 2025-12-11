// primitive-types-demo.ts
// TypeScript 기본 타입(Primitive Types) + 타입 명시 + 타입 추론 예제 모음

// ===============================
// 1. 기본 타입 선언 (Explicit Typing)
// ===============================

// number: 정수, 실수, NaN, Infinity 등 모든 숫자
let age: number = 30;
let pi: number = 3.14;
let notANumber: number = NaN;
let infinityNumber: number = Infinity;

// string: 모든 문자열
let name: string = 'Jane';
let greeting: string = '안녕하세요';
let templateGreeting: string = `Hello, ${name}!`;

// boolean: true / false
let isStudent: boolean = false;
let isActive: boolean = true;

// null: 명시적으로 "값이 없음"을 표현
let data: null = null;

// undefined: 아직 값이 할당되지 않은 상태
let nothing: undefined = undefined;

// symbol: 고유하고 변경 불가능한 값 (주로 객체의 고유 키로 사용)
const key: symbol = Symbol('key');

// bigint: 매우 큰 정수 (뒤에 n 필수, ES2020 이상)
let bigNum: bigint = 9007199254740991n;
let anotherBig: bigint = 2n;
let bigResult: bigint = bigNum * anotherBig;

// ===============================
// 2. 위 변수들을 사용하는 간단한 로그 예제
// ===============================

console.log('=== 1. 기본 타입 값 출력 ===');
console.log('age:', age);
console.log('pi:', pi);
console.log('notANumber:', notANumber);
console.log('infinityNumber:', infinityNumber);
console.log('name:', name);
console.log('greeting:', greeting);
console.log('templateGreeting:', templateGreeting);
console.log('isStudent:', isStudent);
console.log('isActive:', isActive);
console.log('data (null):', data);
console.log('nothing (undefined):', nothing);
console.log('key (symbol):', key.toString());
console.log('bigNum (bigint):', bigNum);
console.log('anotherBig:', anotherBig);
console.log('bigResult:', bigResult);

// ===============================
// 3. 질문에서 주신 예제 (타입 명시)
// ===============================

let count: number = 10;
let message: string = '안녕하세요';
let isAlive: boolean = true;

console.log('\n=== 2. 질문에서 주신 기본 예제 ===');
console.log('count:', count);
console.log('message:', message);
console.log('isAlive:', isAlive);

// 아래 코드는 오류 예시입니다. (주석 해제 후 tsc로 컴파일하면 오류 확인 가능)
// count = "열";
// Type '"열"' is not assignable to type 'number'.

// ===============================
// 4. 타입 추론 (Type Inference) 예제
// ===============================

// TypeScript는 아래와 같이 타입을 써 주지 않아도 값으로부터 타입을 추론합니다.
let inferredCount = 10; // number로 추론
let inferredMessage = '타입스크립트'; // string으로 추론
let inferredFlag = false; // boolean으로 추론

console.log('\n=== 3. 타입 추론 예제 ===');
console.log('inferredCount:', inferredCount);
console.log('inferredMessage:', inferredMessage);
console.log('inferredFlag:', inferredFlag);

// 아래 코드는 타입 추론에 의해 오류가 납니다. (주석 해제 후 확인)
// inferredCount = "다섯";
// // Type '"다섯"' is not assignable to type 'number'.

// inferredMessage = 123;
// // Type 'number' is not assignable to type 'string'.

// inferredFlag = "true";
// // Type '"true"' is not assignable to type 'boolean'.

// ===============================
// 5. null / undefined를 포함하는 타입 (Union Type 예제)
// ===============================

// 보통 실무에서는 null/undefined를 단독 보다는 다른 타입과 함께 유니온으로 사용합니다.
let nullableName: string | null = null;
let optionalAge: number | undefined = undefined;

console.log('\n=== 4. null / undefined + Union 타입 예제 ===');
console.log('nullableName 초기값:', nullableName);
console.log('optionalAge 초기값:', optionalAge);

// 나중에 실제 값 할당
nullableName = 'Tom';
optionalAge = 25;

console.log('nullableName 할당 후:', nullableName);
console.log('optionalAge 할당 후:', optionalAge);

// ===============================
// 6. symbol을 객체의 고유 키로 사용하는 예제
// ===============================

const userIdKey: symbol = Symbol('userId');

interface User {
  name: string;
  age: number;
  [userIdKey]: number; // symbol 키로만 접근 가능한 "숨겨진" 프로퍼티
}

const user: User = {
  name: 'Alice',
  age: 20,
  [userIdKey]: 12345,
};

console.log('\n=== 5. symbol을 이용한 고유 키 예제 ===');
console.log('user.name:', user.name);
console.log('user.age:', user.age);
// 일반 점 표기법으로는 symbol 키에 접근할 수 없음
// console.log(user.userIdKey); // 오류
console.log('user[userIdKey]:', user[userIdKey]); // symbol로만 접근 가능

// ===============================
// 7. bigint 연산 예제
// ===============================

// 큰 숫자를 다루는 상황 (예: 매우 큰 ID, 합계 계산 등)
const big1: bigint = 9007199254740991n; // JS 안전 정수 최대값
const big2: bigint = 10n;
const bigSum: bigint = big1 + big2;
const bigMul: bigint = big1 * big2;

console.log('\n=== 6. bigint 연산 예제 ===');
console.log('big1:', big1);
console.log('big2:', big2);
console.log('bigSum:', bigSum);
console.log('bigMul:', bigMul);

// 아래처럼 number와 bigint를 섞어 쓰면 오류 (주석 해제 후 확인)
// const mix = big1 + 1;
// // Operator '+' cannot be applied to types 'bigint' and 'number'.

// ===============================
// 8. 함수 파라미터에 기본 타입 사용 예제
// ===============================

function printUserInfo(name: string, age: number, isStudent: boolean): void {
  const studentText = isStudent ? '학생' : '학생 아님';
  console.log(`사용자 정보 -> 이름: ${name}, 나이: ${age}, 상태: ${studentText}`);
}

console.log('\n=== 7. 함수 파라미터에 기본 타입 사용 예제 ===');
printUserInfo('Bob', 28, true);
printUserInfo('Carol', 33, false);

// ===============================
// 9. typeof 연산자를 이용한 런타임 타입 확인 예제
// (주의: TypeScript 타입이 아니라, JS 런타임 타입 문자열입니다.)
// ===============================

console.log('\n=== 8. typeof로 런타임 타입 확인 ===');
console.log('typeof age:', typeof age); // "number"
console.log('typeof name:', typeof name); // "string"
console.log('typeof isActive:', typeof isActive); // "boolean"
console.log('typeof data:', typeof data); // "object" (null은 JS에서 object로 나옵니다)
console.log('typeof nothing:', typeof nothing); // "undefined"
console.log('typeof key:', typeof key); // "symbol"
console.log('typeof bigNum:', typeof bigNum); // "bigint"
