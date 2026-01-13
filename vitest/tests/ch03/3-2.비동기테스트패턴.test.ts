import { describe, it, expect } from 'vitest';

interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

async function getUserById(id: number): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id, name: 'Alice', role: 'admin' });
    }, 100);
  });
}

describe('getUserById 테스트', () => {
  // 1. async/await 패턴
  it('[ASYNC] 존재하는 사용자의 정보를 반환한다', async () => {
    const user = await getUserById(1);
    expect(user.name).toBe('Alice');
    expect(user.role).toBe('admin');
  });
  //
  // 2. resolvers/rejects
  it('[RESOLVES] 성공시 사용자 이름을 포함한다', async () => {
    await expect(getUserById(1)).resolves.toMatchObject({ name: 'Alice' });
  });

  it('[RESOLVES] 잘못된 ID 입력시 에러를 던진다', async () => {
    const failJob = () => Promise.reject(new Error('Invalid ID'));
    await expect(failJob()).rejects.toThrow('Invalid ID');
  });
  //
  // 3. Timeout 제어
  it('[TIMEOUT] 3초 이내에 외부 API 응답을 받아야 한다.', async () => {
    const user = await getUserById(1);
    expect(user.name).toBe('Alice');
  }, 3000);

  //
  // 4. Promise 반환 패턴
  it('[PROMISE] Promise를 return하여 비동기를 제어한다.', () => {
    return getUserById(1).then((user) => {
      expect(user.id).toBe(1);
    });
  });
});
