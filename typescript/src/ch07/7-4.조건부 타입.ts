// =========================
// 4-1. 기본 조건부 타입: WrapIfString
// =========================

// string이면 string[]로, 아니면 T 그대로 반환하는 타입
type WrapIfString<T> = T extends string ? string[] : T;

// T가 string인 경우
type Result1 = WrapIfString<string>; // string[]
// T가 number인 경우
type Result2 = WrapIfString<number>; // number
// T가 boolean인 경우
type Result3 = WrapIfString<boolean>; // boolean

// 실제 변수에 적용해 보기
const r1Value: Result1 = ['a', 'b'];
const r2Value: Result2 = 123;
const r3Value: Result3 = true;

console.log('=== WrapIfString 결과들 ===', r1Value, r2Value, r3Value);

// =========================
// 4-2. 조건부 타입 + 제네릭: Response<T> (기존 예제 확장)
// =========================

// 만약 T가 string이면 { value: string[] }
// 아니라면 { value: T }가 됩니다.
type Response<T> = T extends string ? { value: string[] } : { value: T };

function wrap<T>(input: T): Response<T> {
  if (typeof input === 'string') {
    // 문자열이면 배열로 감싸기
    return { value: [input] } as Response<T>;
  } else {
    // 문자열이 아니면 그대로 넣기
    return { value: input } as Response<T>;
  }
}

// 사용 예시
const wrap1 = wrap('hi');
const wrap2 = wrap(123);
const wrap3 = wrap(true);

console.log('=== wrap 결과 ===');
console.log("wrap('hi'):", wrap1); // { value: ['hi'] }
console.log('wrap(123):', wrap2); // { value: 123 }
console.log('wrap(true):', wrap3); // { value: true }

// =========================
// 4-3. 조건부 타입으로 "배열인지 아닌지" 처리하기
// =========================

type UnwrapArray<T> = T extends (infer U)[] ? U : T;

type U1 = UnwrapArray<string[]>; // string
type U2 = UnwrapArray<number[]>; // number
type U3 = UnwrapArray<boolean>; // boolean (배열이 아니므로 그대로)

// 실제로 사용해 보기
function logFirst<T>(value: T) {
  type Element = UnwrapArray<T>;
  console.log('=== logFirst ===');
  console.log('Element 타입 예시(개념적):', {} as Element);

  if (Array.isArray(value)) {
    console.log('배열의 첫 번째 요소:', value[0]);
  } else {
    console.log('배열이 아닌 값:', value);
  }
}

logFirst([1, 2, 3]); // 배열
logFirst('hello'); // 비배열
