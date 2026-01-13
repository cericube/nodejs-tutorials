import { describe, it, expect } from 'vitest';

describe('비대칭 매칭 (Asymmetric Matchers) 실습', () => {
  it('API 응답 결과 검증 (랜덤 데이터 처리)', () => {
    // 실제 서버에서 올 법한 무작위 데이터
    const apiResponse = {
      id: 42,
      uuid: '550e8400-e29b-41d4-a716-446655440000',
      username: 'vitest_tester',
      roles: ['admin', 'editor', 'viewer'],
      metadata: {
        lastLogin: new Date(),
        ip: '127.0.0.1',
      },
    };

    expect(apiResponse).toEqual({
      // id는 어떤 숫자든 OK
      id: expect.any(Number),

      // uuid는 정규식 패턴만 맞으면 OK
      uuid: expect.stringMatching(/^[a-f0-9-]{36}$/),

      // username은 정확히 일치해야 함 (일반 값)
      username: 'vitest_tester',

      // roles 배열 안에 'admin'과 'editor'가 포함되어 있다면 OK (순서 무관)
      roles: expect.arrayContaining(['admin', 'editor']),

      // metadata 객체 내부에 lastLogin이 Date 객체이기만 하면 OK
      metadata: expect.objectContaining({
        lastLogin: expect.any(Date),
        ip: expect.anything(), // null/undefined만 아니면 됨
      }),
    });
  });

  it('Partial Match (부분 일치) 활용', () => {
    const user = { id: 1, name: 'John', email: 'john@example.com' };

    // 전체 객체가 아닌, 내가 관심 있는 필드만 포함되어 있는지 검사
    expect(user).toEqual(
      expect.objectContaining({
        email: 'john@example.com',
      }),
    );
  });
});
