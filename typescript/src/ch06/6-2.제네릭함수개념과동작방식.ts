/**
 * 2-1. 기본적인 제네릭 함수: 단일 타입 매개변수
 * T 타입의 값을 받아 T 타입 요소로 이루어진 배열을 반환한다.
 */
function toArray<T>(element: T): T[] {
  return [element];
}

// 타입 인자를 명시적으로 전달
const numbers1 = toArray<number>(10); // T = number
const strings1 = toArray<string>('Apple'); // T = string

// 타입 인자 생략 시, 전달된 인수로부터 T를 추론
const numbers2 = toArray(99); // T = number
const strings2 = toArray('Banana'); // T = string

console.log(numbers1, numbers2); // [10] [99]
console.log(strings1, strings2); // ['Apple'] ['Banana']

/**
 * 2-2. 여러 개의 타입 매개변수를 사용하는 제네릭 함수
 * 서로 다른 두 타입을 받아 튜플로 반환한다.
 */
function createPair<U, V>(first: U, second: V): [U, V] {
  return [first, second];
}

// 타입 인자를 명시적으로 전달
const pair1 = createPair<string, number>('score', 95);
// 타입 추론에 맡기기
const pair2 = createPair(true, { x: 10, y: 20 });

console.log(pair1); // ['score', 95]
console.log(pair2); // [true, { x: 10, y: 20 }]

/**
 * 2-3. 제네릭 함수의 타입 관계 보존 예제
 * 입력으로 받은 값을 그대로 반환하는 "아이덴티티" 함수
 */
function identity<T>(value: T): T {
  return value;
}

const numId = identity(123); // numId: number
const strId = identity('hello'); // strId: string

// number 전용 메서드는 number에서만 허용
numId.toFixed(2);
// strId.toFixed(2); // ❌ 컴파일 에러
strId.toUpperCase();

/**
 * 2-4. 제네릭을 사용하지 않고 union 타입을 사용할 때의 한계
 */
function wrapUnion(value: string | number): (string | number)[] {
  return [value];
}

const unionResult = wrapUnion('Hello');
// unionResult[0]는 string | number 이므로,
// 아래처럼 바로 string 메서드를 호출하면 에러
// unionResult[0].toUpperCase();
// ❌ Property 'toUpperCase' does not exist on type 'string | number'.

// 타입 좁히기를 해야 사용 가능
if (typeof unionResult[0] === 'string') {
  console.log(unionResult[0].toUpperCase());
}

/**
 * 2-5. 제네릭을 사용한 실제 유틸 함수 예제
 * 배열에서 첫 번째 요소를 가져오는 함수
 */
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

const firstNum = firstElement([1, 2, 3]); // T = number
const firstUser = firstElement([{ name: 'A' }]); // T = { name: string }

console.log(firstNum); // 1
console.log(firstUser?.name); // "A"
