/**
 * 선택적 속성 (Optional Properties)
 */

interface Profile {
  nickname: string; // 필수 속성
  age?: number; // 선택적 속성
}

const profile1: Profile = {
  nickname: 'TypeScriptLover',
}; // age가 없어도 오류 없음

const profile2: Profile = {
  nickname: 'JSExpert',
  age: 30,
}; // age가 있어도 문제 없음

console.log('profile1:', profile1);
console.log('profile2:', profile2);

/**
 * 선택적 속성과 number | undefined의 차이
 */

interface A {
  age?: number;
}
// → age 라는 키 자체가 없어도 된다
// → {}도 A 타입으로 허용

const a1: A = {}; // OK
const a2: A = { age: 10 }; // OK

console.log('a1:', a1);
console.log('a2:', a2);

interface B {
  age: number | undefined;
}
// age 키는 항상 존재해야 한다
// → 값만 undefined일 수 있음
// → { age: undefined }는 허용되지만, {}는 B 타입이 될 수 없음

const b1: B = { age: undefined }; // OK
console.log('b1:', b1);

/**
 * 읽기 전용 속성 (readonly)
 */

interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 10, y: 20 };
console.log('p:', p);

// p.x = 5; // 오류 발생! Cannot assign to 'x' because it is a read-only property.

/**
 * const vs readonly 구분하기
 */

interface Config {
  apiBaseUrl: string;
  timeoutMs: number;
}

// 전체를 읽기 전용으로 만들고 싶을 때
const config: Readonly<Config> = {
  apiBaseUrl: 'https://api.example.com',
  timeoutMs: 5000,
};

console.log('config:', config);

// config.timeoutMs = 3000; // 읽기 전용이라 수정 불가

/**
 * 계산된 프로퍼티 (Computed Property)와 동적 키
 */

const fieldName = 'email';

const userWithComputedKey = {
  name: 'Alice',
  [fieldName]: 'alice@example.com', // => "email": "alice@example.com"
};

console.log('userWithComputedKey:', userWithComputedKey);
console.log('userWithComputedKey.email:', userWithComputedKey.email);
console.log('userWithComputedKey["email"]:', userWithComputedKey['email']);

/**
 * Type Assertion (as 키워드)
 * 글에서는 DOM 예시(document.getElementById)를 사용했지만,
 * 여기서는 Node.js 환경에서도 바로 실행 가능한 단순 예시와
 * 브라우저용 예시를 함께 제공합니다.
 */

/**
 * 1) Node.js 환경에서 바로 실행 가능한 타입 단언 예시
 */

type CanvasLike = {
  id: string;
};

const unknownValue: unknown = { id: 'main_canvas' };

// Type Assertion: unknown → CanvasLike
const canvasLike = unknownValue as CanvasLike;

console.log('canvasLike.id:', canvasLike.id);

/**
 * 2) 브라우저 환경에서 사용하는 타입 단언 예시 (DOM 필요)
 *    - 실제로 브라우저에서 실행할 때 주석을 해제하여 사용합니다.
 *    - TypeScript의 DOM 타입이 활성화된 환경(예: Vite, CRA, 브라우저 번들링) 기준입니다.
 */

// const el = document.getElementById("main_canvas");
// // 우리는 이 요소가 HTMLCanvasElement일 것이라고 가정합니다.
// const myCanvas = el as HTMLCanvasElement | null;
//
// if (myCanvas) {
//   const ctx = myCanvas.getContext("2d");
//   ctx?.fillRect(0, 0, 100, 100); // 안전하게 캔버스 API 사용
// }

/**
 * 타입 단언 대신 타입 좁히기(타입 가드)를 사용할 수도 있습니다.
 * 아래 코드는 브라우저에서만 동작 가능한 예시로 남겨두었습니다.
 */

// const el2 = document.getElementById("main_canvas");
// if (el2 instanceof HTMLCanvasElement) {
//   const ctx = el2.getContext("2d");
//   ctx?.fillRect(0, 0, 100, 100);
// }
