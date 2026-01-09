/**
 * 2. type vs interface: 언제 무엇을 사용해야 할까요?
 */

/**
 * ✔️ 예제 1: type으로 유니언 타입 정의하기
 */

// 상태 값을 제한된 문자열로 표현
type Status = 'pending' | 'success' | 'error';

// 해당 타입을 변수에 적용
let currentStatus: Status = 'success';
console.log('currentStatus(초기):', currentStatus);

// 잘못된 값은 오류 발생 (컴파일 오류 예시는 주석 처리)
// currentStatus = "done"; // ❌ Error: Type '"done"' is not assignable to type 'Status'.

currentStatus = 'error'; // ✅ OK
console.log('currentStatus(변경):', currentStatus);

/**
 * ✔️ 예제 2: interface로 객체 타입 정의하기
 */
// 권장 방식
// interface ApiResponse<T = unknown> {
//  status: "success" | "error";
//  data: T;
//  message?: string;
// }

interface ApiResponse {
  status: 'success' | 'error';
  data: any; //테스트 코드로 권장하지않음. 제너릭을 권장함
  message?: string; // 선택적 프로퍼티
}

const res1: ApiResponse = {
  status: 'success',
  data: { id: 1, name: 'Jane' },
};

const res2: ApiResponse = {
  status: 'error',
  data: null,
  message: '요청에 실패했습니다.',
};

console.log('res1:', res1);
console.log('res2:', res2);

/**
 * ✔️ 예제 3: interface 확장 vs type 확장
 *    - 이름 충돌을 피하기 위해 Interface/Type 접미사를 붙였습니다.
 */

// interface 확장
interface AnimalInterface {
  name: string;
}

interface DogInterface extends AnimalInterface {
  breed: string;
}

const myDog1: DogInterface = {
  name: 'Coco',
  breed: 'Poodle',
};

console.log('myDog1:', myDog1);

// type 확장 (인터섹션 방식)
type AnimalType = { name: string };
type DogType = AnimalType & { breed: string };

const myDog2: DogType = {
  name: 'Coco',
  breed: 'Poodle',
};

console.log('myDog2:', myDog2);

/**
 * ✔️ 예제 4: 선언 병합 차이점
 */

// interface는 같은 이름으로 선언 가능하며 병합됨
interface MergeUser {
  name: string;
}

interface MergeUser {
  age: number;
}

// 병합된 결과:
const mergedUser: MergeUser = {
  name: 'Jane',
  age: 30,
};

console.log('mergedUser:', mergedUser);

// type은 같은 이름으로 다시 선언하면 오류 발생
type Admin = {
  role: string;
};

const adminUser: Admin = {
  role: 'super-admin',
};
console.log('adminUser:', adminUser);

// 아래는 오류 발생 (중복 타입 별칭 선언 → 주석 처리)
// type Admin = { level: number }; // ❌ Duplicate identifier 'Admin'
