/**
 * 4-1. length를 가진 타입만 허용하도록 제약 조건 설정
 */

// length 속성을 가진 타입을 명시하는 인터페이스
interface HasLength {
  length: number;
}

// T는 반드시 HasLength를 "확장"해야 한다.
function getLength<T extends HasLength>(arg: T): number {
  return arg.length;
}

// ✅ 문자열은 length 속성이 있으므로 허용
console.log(getLength('Hello TypeScript')); // 17

// ✅ 배열도 length 속성이 있으므로 허용
console.log(getLength([1, 2, 3, 4])); // 4

// ✅ 사용자 정의 객체에도 length 속성이 있으면 허용
const book = { title: 'TypeScript', length: 300 };
console.log(getLength(book)); // 300

// ❌ number는 length 속성이 없으므로 컴파일 에러
// console.log(getLength(100));
// Error: Argument of type 'number' is not assignable to parameter of type 'HasLength'.

/**
 * 4-2. "id" 필드를 가진 타입만 허용하는 제네릭 함수
 */
interface HasId {
  id: number;
}

function logId<T extends HasId>(obj: T): void {
  console.log('id:', obj.id);
}

// HasId를 만족하는 다양한 타입에 사용 가능
logId({ id: 1, name: 'Alice' });
logId({ id: 2, role: 'admin', active: true });

// 아래는 id가 없기 때문에 컴파일 에러
// logId({ name: "NoId" });
// ❌ Property 'id' is missing in type '{ name: string; }' but required in type 'HasId'.

/**
 * 4-3. 두 개의 객체를 합치는 merge 함수
 * 두 타입 모두 object 형태여야 한다는 제약을 설정.
 */
function mergeObjects<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}

const merged = mergeObjects({ id: 1, name: 'Alice' }, { age: 30, active: true });

console.log(merged.id, merged.age, merged.active);

// 숫자와 객체를 합치려고 하면 제약 조건 위반으로 에러
// mergeObjects(10, { a: 1 });
// ❌ Argument of type 'number' is not assignable to parameter of type 'object'.

/**
 * 4-4. keyof와 제약 조건을 함께 사용한 "안전한 프로퍼티 접근" 예제
 */

// T 타입의 객체 obj와, 그 객체의 키 중 하나 K를 받아서,
// obj[K] 값을 안전하게 반환하는 함수
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: 'Alice', age: 30 };

// "name"과 "age"는 person의 키이므로 허용
const personName = getProperty(person, 'name');
const personAge = getProperty(person, 'age');

console.log(personName.toUpperCase());
console.log(personAge.toFixed(0));

// 아래는 person에 존재하지 않는 키이므로 컴파일 에러
// const invalid = getProperty(person, "address");
// ❌ Argument of type '"address"' is not assignable to parameter of type '"name" | "age"'.

/**
 * 4-5. 배열 요소 타입에 제약을 두는 예제
 * T는 반드시 { id: number }를 갖는 객체여야 한다.
 */
function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);
}

const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const foundUser = findById(users, 2);
console.log(foundUser); // { id: 2, name: "Bob" }

// id가 없는 객체 배열은 사용할 수 없다.
// findById([{ name: "NoId" }], 1);
// ❌ Type '{ name: string; }' is not assignable to type '{ id: number; }'.
