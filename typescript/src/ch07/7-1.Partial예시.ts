// =========================
// 1-1. 사용자 정보 업데이트 예제 (기존 예제 확장)
// =========================

// 원본 User 타입 (모든 속성이 필수)
interface UserForPartial {
  id: number;
  name: string;
  email: string;
}

// 모든 속성을 선택적으로 만든 타입
type UserUpdate = Partial<UserForPartial>;

// DB에 있다고 가정하는 유저 데이터
const userStore: UserForPartial = {
  id: 1,
  name: '기존 이름',
  email: 'old@example.com',
};

// 일부 필드만 업데이트하는 함수
function updateUser(id: number, changes: UserUpdate) {
  console.log('=== updateUser 호출 ===');
  console.log(`대상 사용자 ID: ${id}`);
  console.log('변경 내용:', changes);

  // 여기서는 간단히 merge만 해봅니다.
  // 실제로는 id로 유저를 찾아서 머지하는 로직이 들어갈 수 있습니다.
  const updated: UserForPartial = { ...userStore, ...changes };
  console.log('머지 결과:', updated);
}

updateUser(1, { name: '새로운 이름' });
updateUser(1, { email: 'new@example.com', id: 999 }); // id까지 바꾸려고 하면? 타입 상으로는 허용됨

// =========================
// 1-2. 객체 초기화 시점에서의 활용 (기존 Todo 예제 확장)
// =========================

interface Todo {
  title: string;
  completed: boolean;
}

// data의 일부만 전달해도 되도록 Partial<Todo> 사용
function createTodo(data: Partial<Todo>): Todo {
  const defaultTodo: Todo = {
    title: '제목 없음',
    completed: false,
  };

  const result = { ...defaultTodo, ...data };
  console.log('=== createTodo 결과 ===', result);
  return result;
}

const t1 = createTodo({ title: 'TS 공부' }); // title만 전달
const t2 = createTodo({}); // 아무 값 없이도 가능
