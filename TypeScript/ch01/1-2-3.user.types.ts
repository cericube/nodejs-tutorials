// user.types.ts
// User 관련 타입만 정의하는 모듈입니다 (런타임 값 없음).

export type UserRole = 'ADMIN' | 'USER' | 'GUEST';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};
