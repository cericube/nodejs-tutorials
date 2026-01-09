// =====================================
// 2. any/unknown으로 받은 JSON 응답 처리
// =====================================

type User = {
  id: number;
  name: string;
};

// 예: API 응답이 아직 타입 정의가 안 되어 있을 때
function fetchUserRaw(): any {
  // 실제로는 fetch/axios 응답이라고 가정
  return JSON.parse(`{"id": 1, "name": "Kim"}`);
}

function fetchUserSafe(): unknown {
  return JSON.parse(`{"id": 2, "name": "Lee"}`);
}

// 사용자 정의 타입 가드
// value is User 의미
// “이 함수가 true를 반환하는 경우, 호출한 시점에서 value의 타입을 User라고 믿어도 된다”
// 라고 컴파일러에게 약속하는 타입 술어(type predicate)입니다.
// true가 반환된 경우 → 런타임에서는 value가
// {
//   id: number;
//  name: string;
// }
// 형태를 가지고 있음
function isUser(value: unknown): value is User {
  //1. 1차 방어: 객체인지 / null인지 검사
  if (typeof value !== 'object' || value === null) return false;

  //2. 임시 캐스팅: 구조만 맞춰 접근할 수 있게
  //as { id?: unknown; name?: unknown }는 런타임에서 아무 일도 하지 않습니다.
  //오직 컴파일 타임 타입 검사용입니다.
  const v = value as { id?: unknown; name?: unknown };

  //3. 실제 타입 검사: User 조건을 만족하는지
  return typeof v.id === 'number' && typeof v.name === 'string';
}

function demoJsonWithAny() {
  console.log('=== demoJsonWithAny ===');
  const data = fetchUserRaw(); // any

  // 컴파일러는 아무것도 모름 → 잘못된 프로퍼티 접근도 허용
  console.log('name:', data.name);
  console.log('없는 필드:', data.unknownField); // 컴파일 OK, 런타임에서는 undefined
}

function demoJsonWithUnknown() {
  console.log('=== demoJsonWithUnknown ===');
  const data = fetchUserSafe(); // unknown

  // 컴파일 에러 (주석 해제해 보세요)
  // console.log(data.name);
  // -> Object is of type 'unknown'.

  if (isUser(data)) {
    // 여기서는 data가 User로 좁혀짐
    console.log('검증된 User:', data.id, data.name);
  } else {
    console.log('User 형태가 아닙니다:', data);
  }
}

//demoJsonWithAny();
demoJsonWithUnknown();
