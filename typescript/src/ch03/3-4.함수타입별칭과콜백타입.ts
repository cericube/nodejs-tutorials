// --- 함수 타입 별칭 (MathOperation) 예시 ---

// 함수 타입 시그니처 정의
type MathOperation = (x: number, y: number) => number;

// 해당 타입을 재사용하여 여러 함수를 선언
const addOperation: MathOperation = (a, b) => a + b;
const subtractOperation: MathOperation = (a, b) => a - b;

console.log('addOperation(10, 5):', addOperation(10, 5)); // 15
console.log('subtractOperation(10, 3):', subtractOperation(10, 3)); // 7

// 오류 예시 (주석 해제 시 컴파일 에러)
// const wrongOperation: MathOperation = (a, b) => a + '5a';

//////////////////////////////////////////////////////////
// --- 콜백 함수 타입 정의하기 ---

// 콜백 함수 시그니처: number를 받아 아무것도 반환하지 않는 함수
type Callback = (result: number) => void;

// calculator 함수는 두 숫자와 콜백 함수를 인수로 받음
function calculator(a: number, b: number, callback: Callback): void {
  const sum = a + b;
  callback(sum); // 콜백 실행
}

// Callback 타입과 일치하는 콜백 함수
const printResult: Callback = (res) => {
  console.log(`계산 결과: ${res}`);
};

// 호출
calculator(20, 30, printResult); // 계산 결과: 50

/////////////////////////////////////////////////////////
// --- 제네릭을 활용한 콜백 함수 타입 별칭 (Filter<T>) ---

// Filter<T>는 어떤 타입 T를 받아 true/false를 반환하는 함수 타입
type Filter<T> = (item: T) => boolean;

// 숫자 배열
const numbers = [1, 2, 3, 4, 5];

// Filter<number> 타입에 맞는 함수: 짝수이면 true
const isEven: Filter<number> = (n) => n % 2 === 0;

// 배열 filter 메서드에 콜백으로 전달
const evenNumbers = numbers.filter(isEven);

console.log('evenNumbers:', evenNumbers); // [2, 4]
