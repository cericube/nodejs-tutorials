/**
 * 1. 인터페이스 (Interface): 객체 타입 정의의 기본
 */

// 'User'라는 이름의 인터페이스를 정의합니다.
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  // 선택적 속성: 있어도 되고 없어도 되는 값
  phoneNumber?: string;
  // 메서드 정의: 함수 타입도 포함 가능
  greet(): string;
}

// 이 객체는 반드시 User 인터페이스의 구조를 따라야 합니다.
const user1: User = {
  id: 1,
  name: '김민준',
  email: 'minjun.kim@example.com',
  isActive: true,
  greet() {
    return `안녕하세요, ${this.name}입니다.`;
  },
};

console.log('user1:', user1);
console.log('user1.greet():', user1.greet());

/**
 * ❌ 오류 예시: 속성 누락 또는 타입 불일치
 *
 * 아래 코드는 TypeScript에서 컴파일 오류를 발생시키므로,
 * 실제 실행을 위해서는 주석으로 유지합니다.
 */

// const user2: User = {
//   id: 2,
//   name: "이서연",
//   email: "seoyeon@example.com",
//   // isActive가 누락되었고 greet 메서드도 없음 → 오류 발생
//   // Property 'isActive' is missing in type ...
//   greet() {
//     return "안녕하세요!";
//   },
// };

/**
 * 인터페이스 확장 (Extending Interfaces)
 */

// User 인터페이스를 확장한 AdminUser
interface AdminUser extends User {
  role: 'admin' | 'super-admin'; // 역할은 두 가지 중 하나
  permissions: string[]; // 권한 목록
}

const admin: AdminUser = {
  id: 100,
  name: '홍길동',
  email: 'jihoon.park@example.com',
  isActive: true,
  role: 'admin',
  permissions: ['read', 'write', 'delete'],
  greet() {
    return `관리자 ${this.name}입니다.`;
  },
};

console.log('admin:', admin);
console.log('admin.greet():', admin.greet());
