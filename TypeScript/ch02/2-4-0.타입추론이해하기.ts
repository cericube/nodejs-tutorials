/**
 * 변수 선언 시의 타입 추론
 */

let favoriteColor = 'blue';
// TypeScript는 "blue"가 문자열이므로 favoriteColor를 `string` 타입으로 추론합니다.

console.log('favoriteColor(초기):', favoriteColor);

favoriteColor = 'red'; // OK
console.log('favoriteColor(변경):', favoriteColor);

// favoriteColor = 10; // 오류: 'number'는 'string'에 할당할 수 없습니다.

/**
 * 함수 반환값의 타입 추론
 */

function calculateSum(a: number, b: number) {
  // 매개변수 타입이 number이므로, 반환 타입도 number로 추론됩니다.
  return a + b;
}

let result = calculateSum(5, 3);
// TypeScript는 반환되는 값이 숫자이므로, result의 타입을 `number`로 추론합니다.

console.log('calculateSum(5, 3):', result);
console.log('result * 2:', result * 2);

/**
 * 타입 명시가 필요한 경우 1: 초기값 없이 선언한 변수
 */

// 아무 값도 지정하지 않으면 TypeScript는 `any` 타입으로 추론합니다.
let data;
data = 10; // OK
data = 'hello'; // OK (any는 어떤 타입이든 허용되므로 안전하지 않음)

console.log('data(마지막 값):', data);

// 더 안전한 방식: 타입을 명시
let count: number;
count = 42;
// count = "text"; // 오류: 'string'은 'number'에 할당될 수 없습니다.

console.log('count:', count);

/**
 * 타입 명시가 필요한 경우 2: 함수의 매개변수
 */

// 오류 예시(암시적 any)는 주석으로 유지합니다.
// function multiplyBad(a, b) {
//   return a * b;
// }
// 오류: 매개변수 'a'의 타입이 암시적으로 'any'입니다.

function multiply(a: number, b: number) {
  return a * b;
}

console.log('multiply(4, 5):', multiply(4, 5));
