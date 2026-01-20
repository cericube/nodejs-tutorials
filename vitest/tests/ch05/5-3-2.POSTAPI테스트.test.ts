import { describe, it, expect } from 'vitest';
import { testAxios } from '../../src/ch05/5-3.Axios인스턴스';

describe('POST API 테스트 (axios)', () => {
  it('새로운 유저를 생성한다', async () => {
    const newUser = { name: 'kim', age: 30 };
    const response = await testAxios.post(`/api/users`, newUser);

    // Status Code
    expect(response.status).toBe(201);

    // Payload 구조 검증
    // 응답 Body의 구조와 내용이 보낸 데이터와 일치하는지 검증
    expect(response.data.user).toMatchObject(newUser);
  });
});
