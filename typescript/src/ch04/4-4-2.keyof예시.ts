// ------------------------------
// keyof는 "객체 타입의 키"를 문자열 리터럴 유니언 타입으로 만들어주는
// TypeScript 전용 타입 연산자입니다.
// ------------------------------

// 1) 기본 사용: 인터페이스 키를 유니언 타입으로 추출
interface User {
  id: number;
  name: string;
  email: string;
}

type UserKey = keyof User;
// "id" | "name" | "email"

console.log('=== 1) keyof 기본 사용 ===');

let key1: UserKey = 'id'; // ✅
let key2: UserKey = 'email'; // ✅
// let key3: UserKey = "age"; // ❌ "age"는 UserKey가 아님 (주석 해제 시 에러)

console.log('key1:', key1);
console.log('key2:', key2);

// 2) keyof + 제네릭: 안전한 속성 getter 만들기
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  // key는 T의 실제 키 중 하나로만 제한됨
  return obj[key];
}

console.log('\n=== 2) keyof + 제네릭: 안전한 속성 접근 ===');

const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
};

const nameValue = getValue(user, 'name'); // nameValue: string
console.log("getValue(user, 'name'):", nameValue);

// const wrong = getValue(user, "notExist"); // ❌ "notExist"는 User의 키가 아님

// 3) keyof typeof 조합: 상수 객체에서 키 타입 뽑기
const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
} as const;

type PermissionKey = keyof typeof PERMISSIONS;
// "READ" | "WRITE" | "DELETE"

type PermissionValue = (typeof PERMISSIONS)[PermissionKey];
// "read" | "write" | "delete"

console.log('\n=== 3) keyof typeof: 상수 객체 키/값 타입 ===');

let permKey: PermissionKey = 'WRITE'; // ✅
let permValue: PermissionValue = 'delete'; // ✅

console.log('permKey  :', permKey);
console.log('permValue:', permValue);

// permValue = "admin"; // ❌ 허용되지 않는 값

// 4) Mapped Types + keyof: 전체 타입을 한 번에 변형하기
type NullableUser = {
  // User의 모든 키 K에 대해 User[K] | null 로 변환
  [K in keyof User]: User[K] | null;
};

/*
NullableUser는 다음과 같은 형태가 됩니다.
{
  id: number | null;
  name: string | null;
  email: string | null;
}
*/

console.log('\n=== 4) keyof + Mapped Types ===');

const maybeUser: NullableUser = {
  id: null,
  name: 'Bob',
  email: null,
};

console.log('maybeUser:', maybeUser);

// 5) keyof를 이용한 간단한 폼 유효성 검사기
function validateForm<T>(form: T, key: keyof T): boolean {
  const value = form[key];
  if (typeof value === 'string') {
    // 문자열이면 공백 제거 후 길이 검사
    return value.trim().length > 0;
  }
  // 그 외 타입은 undefined/null만 아닌지 간단히 검사
  return value !== undefined && value !== null;
}

console.log('\n=== 5) keyof로 폼 유효성 검사하기 ===');

const loginForm = {
  username: 'admin',
  password: '',
};

console.log('username 유효성:', validateForm(loginForm, 'username')); // true
console.log('password 유효성:', validateForm(loginForm, 'password')); // false

// 6) 객체의 키를 자동으로 뽑아 화면에 출력하는 유틸
function getAllKeys<T extends object>(obj: T): (keyof T)[] {
  // Object.keys는 string[]을 반환하므로, 단언(as)으로 (keyof T)[]로 변환
  return Object.keys(obj) as (keyof T)[];
}

console.log('\n=== 6) keyof로 키 배열 얻기 ===');

const product = {
  id: 100,
  name: 'Mechanical Keyboard',
  price: 99000,
};

const keys = getAllKeys(product); // ('id' | 'name' | 'price')[]
console.log('product keys:', keys);

keys.forEach((k) => {
  console.log(`key: ${String(k)}, value: ${product[k]}`);
});

// 7) keyof를 이용해 특정 필드만 선택/부분 업데이트 하기
//    - 실제 서비스 코드에서 DTO, 업데이트 타입 등을 만들 때 자주 쓰는 패턴

// User의 일부 키만 허용하는 업데이트 타입 예시
type UserUpdatableFields = 'name' | 'email';

// UserUpdatableFields에 해당하는 필드만 부분 업데이트
function updateUser(user: User, field: UserUpdatableFields, value: User[UserUpdatableFields]) {
  // 여기서는 간단히 로그만 출력
  console.log(`사용자 ${user.id}의 ${field}를 ${value}로 변경합니다.`);
}

console.log('\n=== 7) keyof 응용: 부분 업데이트 필드 제한 ===');

updateUser(user, 'name', 'Charlie'); // ✅
// updateUser(user, "id", 2);           // ❌ "id"는 UserUpdatableFields가 아님
