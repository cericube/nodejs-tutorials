// =========================
// 3-1. Pick<T, K> - 요약 정보 타입 만들기
// =========================

interface UserDetails {
  id: number;
  name: string;
  age: number;
  address: string;
  phoneNumber: string;
}

// id와 name만 포함하는 요약 타입
type UserSummary = Pick<UserDetails, 'id' | 'name'>;

const summary: UserSummary = {
  id: 5,
  name: '이유나',
  // address: "서울" // ❌ 에러: UserSummary에는 address가 없음
};

console.log('=== UserSummary ===', summary);

// =========================
// 3-2. Pick<T, K>를 이용해 UI용 카드 데이터 타입 만들기
// =========================

type UserCardProps = Pick<UserDetails, 'name' | 'age'>;

function renderUserCard(user: UserCardProps) {
  console.log('=== renderUserCard ===');
  console.log(`이름: ${user.name}, 나이: ${user.age}`);
}

renderUserCard({ name: '홍길동', age: 30 });

// =========================
// 3-3. Omit<T, K> - ID를 제외한 생성용 Payload
// =========================

type UserCreatePayload = Omit<UserDetails, 'id'>;

const newUser: UserCreatePayload = {
  // id: 1, // ❌ 에러: id는 제외됨
  name: '최지우',
  age: 25,
  address: '부산',
  phoneNumber: '010-1234-5678',
};

console.log('=== UserCreatePayload ===', newUser);

// =========================
// 3-4. Omit + Partial을 조합해서 "업데이트용 Payload" 만들기
// =========================

// 업데이트 시에는 id는 반드시 필요하지만,
// 나머지 필드는 선택적으로 들어오게 하고 싶은 경우
type UserUpdatePayload = {
  id: number;
} & Partial<Omit<UserDetails, 'id'>>;

function updateUserPayload(payload: UserUpdatePayload) {
  console.log('=== updateUserPayload ===');
  console.log('업데이트할 유저 ID:', payload.id);
  console.log('변경 내용:', payload);
}

updateUserPayload({ id: 1, name: '새 이름' }); // name만 변경
updateUserPayload({ id: 2, age: 40, address: '서울' }); // 여러 필드를 함께 변경

// =========================
// 3-5. Product 예제로 Pick vs Omit 비교
// =========================

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

// 상세 페이지: 모든 속성 사용
type ProductDetail = Product;

// 목록 리스트: 요약 정보만 필요
type ProductSummary = Pick<Product, 'id' | 'name' | 'price'>;

// 상품 등록 요청 시: id는 자동 생성되므로 제외
type ProductCreatePayload = Omit<Product, 'id'>;

const detail: ProductDetail = {
  id: 'p-1',
  name: '노트북',
  price: 1500000,
  description: '게임도 잘 돌아갑니다.',
};

const listItem: ProductSummary = {
  id: 'p-1',
  name: '노트북',
  price: 1500000,
};

const createPayload: ProductCreatePayload = {
  name: '새 상품',
  price: 10000,
  description: '테스트용 설명',
};

console.log('=== ProductDetail ===', detail);
console.log('=== ProductSummary ===', listItem);
console.log('=== ProductCreatePayload ===', createPayload);
