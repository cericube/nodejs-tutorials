function logMessageAdvanced(message: string): void {
  console.log(`[로그]: ${message}`);
}

logMessageAdvanced('작업이 완료되었습니다.');

// --- undefined 예시: 명시적 반환 ---

function returnUndefined(): undefined {
  return undefined;
}

const resultUndefined = returnUndefined();
console.log('resultUndefined:', resultUndefined); // undefined

// --- never 예시: 타입 좁히기 + 모든 경우 처리 확인 ---

type Shape = 'circle' | 'square';

function getArea(shape: Shape): number {
  switch (shape) {
    case 'circle':
      // 여기서 shape는 "circle"로 좁혀짐
      return 3.14 * 10 * 10;
    case 'square':
      // 여기서 shape는 "square"로 좁혀짐
      return 10 * 10;
    default:
      // 위에서 처리 안 된 나머지 → shape는 never로 좁혀짐
      return assertNever(shape);
  }
}

// 모든 경우를 처리했는지 컴파일 타임에 확인하기 위한 헬퍼
function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${x}`);
}

console.log('circle area:', getArea('circle'));
console.log('square area:', getArea('square'));

// 아래와 같이 잘못된 값을 넣으면 컴파일 에러
// console.log(getArea("triangle"));

// --- 함수 오버로딩 (Function Overloading) 예시 ---

// 1. 오버로드 시그니처 정의
function makeId(name: string): number; // 문자열 → 숫자 반환
function makeId(count: number): string; // 숫자 → 문자열 반환

// 2. 구현 시그니처 (모든 경우를 포괄)
function makeId(arg: string | number): number | string {
  if (typeof arg === 'string') {
    // 문자열 길이에 10을 곱해 숫자 반환
    return arg.length * 10;
  } else {
    // 숫자를 문자열로 변환하여 반환
    return 'ID-' + arg.toString();
  }
}

// 사용 예시
const idNum = makeId('Alice'); // idNum은 number로 추론
const idStr = makeId(10); // idStr은 string으로 추론

console.log('idNum:', idNum); // 50
console.log('idStr:', idStr); // ID-10

// 오버로드 시그니처가 없는 경우
// 이 함수는 항상 number | string 둘 다 가능하네?”
// 라고만 알고 있기 때문에, 호출 위치에서 “매개변수에 따라 반환 타입이 달라진다”는 사실을 모릅니다.
// 그래서 이런 코드가 안 됩니다:
// 에러: 'number | string'에는 toUpperCase가 없다.
//console.log(idStr.toUpperCase());
// 에러: 'number | string'에는 toFixed가 없다.
//console.log(idNum.toFixed(2));
