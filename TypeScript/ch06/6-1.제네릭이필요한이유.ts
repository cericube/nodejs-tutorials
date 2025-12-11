/**
 * 1-1. any를 사용한 경우: 타입 정보가 전부 사라지는 예제
 */
function identityAny(arg: any): any {
  return arg;
}

// 숫자를 넣었지만, 반환 타입은 any로만 인식된다.
let numResultAny = identityAny(123);
// 문자열을 넣었지만, 반환 타입은 역시 any.
let strResultAny = identityAny('hello');

// 컴파일러는 numResultAny / strResultAny 모두 any라고만 알고 있으므로,
// 어떤 메서드를 호출해도 컴파일 단계에서는 체크해주지 못한다.
numResultAny.toFixed(2); // 런타임에서는 정상 동작(지금은 number라서)
//strResultAny.toFixed(2); // ❗ 문자열인데도 컴파일 에러가 나지 않는다 (런타임 오류 발생)

/**
 * 1-2. any 남용이 실제 버그로 이어지는 예제
 */
function parseUserAny(json: string): any {
  // JSON.parse 결과를 any로 처리
  return JSON.parse(json);
}

// 원래는 { id: number; name: string } 구조라고 "믿고" 사용
const userAny = parseUserAny(`{ "id": 1, "name": "Alice" }`);

// 오타: name이 아니라 naem이라고 잘못 필드명을 쓴 경우
// 하지만 userAny가 any이기 때문에, TS는 이 오류를 잡아주지 못한다.
console.log(userAny.naem); // ❌ 런타임에서 undefined (버그지만 컴파일 단계에서 침묵)

/**
 * 1-3. 제네릭을 사용하여 타입 정보를 유지하는 버전
 */
function identityGeneric<T>(arg: T): T {
  return arg;
}

// 호출 시 타입 추론 동작
let numResultGeneric = identityGeneric(123); // T = number
let strResultGeneric = identityGeneric('hello'); // T = string

// numResultGeneric는 number라고 정확히 인식되므로, number 메서드만 허용
console.log(numResultGeneric.toFixed(2));
// strResultGeneric는 string으로 인식되므로, string 메서드만 허용
// console.log(strResultGeneric.toFixed(2)); // string이므로 컴파일 오류 발생
console.log(strResultGeneric.toUpperCase());

// 아래 코드는 컴파일 에러 발생 (string에는 toFixed가 없음)
// strResultGeneric.toFixed(2);
// ❌ Property 'toFixed' does not exist on type 'string'.

/**
 * 1-4. 제네릭을 이용한 JSON 파싱: 타입 안전한 버전
 */
interface User {
  id: number;
  name: string;
}

// 제네릭을 사용해서, 호출하는 쪽에서 "원하는 타입"을 명시하게 한다.
function parseJsonSafe<T>(json: string): T {
  return JSON.parse(json) as T;
}

const userGeneric = parseJsonSafe<User>(`{ "id": 1, "name": "Alice" }`);

// 이제 userGeneric는 User 타입이므로, 오타를 내면 컴파일 시점에 잡힌다.
// console.log(userGeneric.naem);
// ❌ Property 'naem' does not exist on type 'User'.

console.log(userGeneric.name); // 정상: Alice

/**
 * 1-5. any vs 제네릭 비교를 위한 간단한 헬퍼 함수 예제
 */

// any 버전
function wrapAny(value: any): any[] {
  return [value];
}

const wrappedAny = wrapAny('Hello');
wrappedAny[0].nonExistentMethod?.(); // ❌ 런타임 오류 가능하지만, 컴파일 오류 없음

// 제네릭 버전
function wrapGeneric<T>(value: T): T[] {
  return [value];
}

const wrappedString = wrapGeneric('Hello'); // T = string
wrappedString[0].toUpperCase(); // 정상

// 아래는 컴파일 에러
// wrappedString[0].nonExistentMethod();
// ❌ Property 'nonExistentMethod' does not exist on type 'string'.
