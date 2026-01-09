// =========================
// 4-4. 매핑된 타입: StatusTracker
// =========================

interface TaskList {
  fetchData: () => void;
  processData: () => void;
  renderUI: () => void;
}

// TaskList의 모든 속성을 boolean으로 변환
type StatusTracker<T> = {
  [K in keyof T]: boolean;
};

type TaskStatus = StatusTracker<TaskList>;
// => { fetchData: boolean; processData: boolean; renderUI: boolean; }

const currentStatus: TaskStatus = {
  fetchData: true,
  processData: false,
  renderUI: false,
};

console.log('=== currentStatus ===', currentStatus);

// =========================
// 4-5. 매핑된 타입으로 MyReadonly
// =========================

type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

interface Person {
  name: string;
  age: number;
}

type ReadonlyPerson = MyReadonly<Person>;

const user: ReadonlyPerson = { name: 'Jane', age: 30 };
// user.age = 31; // ❌ 오류: 읽기 전용 속성

console.log('=== ReadonlyPerson ===', user);

// =========================
// 4-6. 매핑된 타입으로 "Optional" / "Nullable" 타입 만들기
// =========================

// 모든 속성을 선택적(optional)으로
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// 모든 속성을 null 허용으로
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

interface Profile {
  nickname: string;
  bio: string;
}

type OptionalProfile = MyPartial<Profile>;
type NullableProfile = Nullable<Profile>;

const p1: OptionalProfile = {}; // 둘 다 생략 가능
const p2: NullableProfile = {
  nickname: null,
  bio: '소개글',
};

console.log('=== OptionalProfile / NullableProfile ===', p1, p2);
