// user.service.ts
// 여기서는 User 타입 정보만 필요하고, 실제 값은 필요 없다고 가정합니다.

//verbatimModuleSyntax: true는:
//“타입만 필요한 import”를 반드시 import type으로 표시하도록 요구합니다
import type { User } from './1-2-3.user.types';

export function printUser(user: User): void {
  console.log('=== [userService] ===');
  console.log(`이름: ${user.name}`);
  console.log(`이메일: ${user.email}`);
  console.log(`권한: ${user.role}`);
}

export function isAdmin(user: User): boolean {
  return user.role === 'ADMIN';
}
