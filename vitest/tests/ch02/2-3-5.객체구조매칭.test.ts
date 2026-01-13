import { describe, it, expect } from 'vitest';

describe('객체 부분 매칭 및 속성 검증', () => {
  const userResponse = {
    id: 1,
    name: 'Gemini',
    email: 'ai@google.com',
    settings: {
      theme: 'dark',
      notifications: true,
    },
    lastLogin: new Date().toISOString(), // 매번 변하는 값
  };

  it('toMatchObject: 중요한 필드만 골라서 검증', () => {
    // lastLogin이나 id가 무엇이든, 이름과 이메일만 맞으면 통과!
    expect(userResponse).toMatchObject({
      name: 'Gemini',
      email: 'ai@google.com',
    });

    // 중첩된 객체의 일부도 검증 가능
    expect(userResponse).toMatchObject({
      settings: { theme: 'dark' },
    });
  });

  it('toHaveProperty: 특정 속성의 존재와 값을 확인', () => {
    // 1. 단순히 속성이 존재하는지 확인
    expect(userResponse).toHaveProperty('id');

    // 2. 중첩된 경로의 값을 확인 (Dot notation 사용)
    expect(userResponse).toHaveProperty('settings.theme', 'dark');

    // 3. 값의 타입만 확인하고 싶을 때 (비대칭 매칭 활용)
    expect(userResponse).toHaveProperty('lastLogin', expect.any(String));
  });
});
