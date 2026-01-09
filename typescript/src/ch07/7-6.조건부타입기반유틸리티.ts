// =========================
// 5-1. NonNullable<T> - null, undefined 제거 (기존 예제 확장)
// =========================

type WithNull = string | null | undefined;
type WithoutNull = NonNullable<WithNull>; // string

const nameOk: WithoutNull = '홍길동';
// const nameBad: WithoutNull = null;      // ❌ 오류
// const nameBad2: WithoutNull = undefined; // ❌ 오류

console.log('=== NonNullable ===', nameOk);

// =========================
// 5-2. Exclude<T, U> - T에서 U 제거 (기존 예제 확장)
// =========================

type Role = 'admin' | 'user' | 'guest';
type VisibleRole = Exclude<Role, 'admin'>; // "user" | "guest"

const role1: VisibleRole = 'user';
const role2: VisibleRole = 'guest';
// const role3: VisibleRole = "admin"; // ❌ 오류

console.log('=== Exclude Role ===', role1, role2);

// 실무 예: "삭제된 상태" 등을 제거하고 UI에 표시할 상태만 남기기
type StatusAll = 'active' | 'inactive' | 'deleted';
type DisplayStatus = Exclude<StatusAll, 'deleted'>;

// =========================
// 5-3. Extract<T, U> - T에서 U에 해당하는 것만 추출 (기존 예제 확장)
// =========================

type Status = 'success' | 'error' | 'loading';
type FinalStatus = Extract<Status, 'success' | 'error'>; // "success" | "error"

const status1: FinalStatus = 'success';
// const status2: FinalStatus = "loading"; // ❌ 오류

console.log('=== Extract Status ===', status1);

// 실무 예: 특정 이벤트 이름 중, "로그 관련" 이벤트만 추출
type EventName = 'user:login' | 'user:logout' | 'system:boot' | 'log:info' | 'log:error';

type LogEvent = Extract<EventName, `log:${string}`>; // 템플릿 리터럴과 함께 사용 가능

const event: LogEvent = 'log:error';
console.log('=== LogEvent ===', event);

// =========================
// 5-4. ReturnType<T> - 함수 반환 타입 추출 (기존 예제 확장)
// =========================

function getUserForReturnType() {
  return {
    id: 1,
    name: 'Jane',
    isAdmin: false,
  };
}

// 함수 반환 타입을 자동으로 추출
type UserRT = ReturnType<typeof getUserForReturnType>;
// UserRT는 { id: number; name: string; isAdmin: boolean }

const u: UserRT = {
  id: 1,
  name: 'Jane',
  isAdmin: true,
};

console.log('=== ReturnType User ===', u);

// 헬퍼 함수에서 자주 사용되는 패턴
function makeSuccess<T>(data: T) {
  return {
    ok: true,
    data,
  } as const;
}

type SuccessResponse<T> = ReturnType<typeof makeSuccess<T>>;

const res = makeSuccess({ id: 1, title: '글 제목' });
type ResType = typeof res; // ReturnType으로도 같은 타입을 얻을 수 있음

console.log('=== makeSuccess 결과 ===', res);

// =========================
// 5-5. Parameters<T> - 함수 매개변수 타입을 튜플로 추출 (기존 예제 확장)
// =========================

function sendMessage(to: string, body: string, urgent?: boolean) {
  console.log(`[Message] To: ${to}, Body: ${body}, Urgent: ${urgent}`);
}

// [string, string, (boolean | undefined)?]
type SendMessageParams = Parameters<typeof sendMessage>;

const args: SendMessageParams = ['alice@example.com', 'Hello!', true];

sendMessage(...args); // 스프레드로 안전하게 전달 가능

// 실무 예: 로깅 래퍼 만들기
function withLogging<T extends (...a: any[]) => any>(fn: T) {
  return (...args: Parameters<T>): ReturnType<T> => {
    console.log('=== 함수 호출 전 로그 ===', fn.name, args);
    const result = fn(...args);
    console.log('=== 함수 호출 후 로그 ===', result);
    return result;
  };
}

function add(a: number, b: number) {
  return a + b;
}

const addWithLogging = withLogging(add);

const sum = addWithLogging(1, 2);
console.log('=== addWithLogging 결과 ===', sum);
