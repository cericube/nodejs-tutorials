import { describe, it, expect } from 'vitest';

describe('데이터 컬렉션 및 문자열 검증', () => {
  it('배열(Array) 검증: 목록에 아이템이 포함되어 있는가?', () => {
    const shoppingList = ['Apple', 'Banana', 'Orange'];

    // 1. 특정 아이템이 포함되어 있는지 확인
    expect(shoppingList).toContain('Banana');

    // 2. 배열의 전체 크기가 예상과 일치하는지 확인
    expect(shoppingList).toHaveLength(3);

    // 3. (심화) 객체 배열의 경우
    const users = [
      { id: 1, name: 'Kim' },
      { id: 2, name: 'Lee' },
    ];
    expect(users).toContainEqual({ id: 1, name: 'Kim' });
  });

  it('문자열(String) 검증: 형식이 올바른가?', () => {
    const welcomeMessage = '안녕하세요, Vitest의 세계에 오신 것을 환영합니다!';
    const email = 'test-user@google.com';

    // 1. 특정 문구가 포함되어 있는지 확인
    expect(welcomeMessage).toContain('Vitest');

    // 2. 정규표현식을 이용한 패턴 매칭 (이메일 형식이 맞는지)
    expect(email).toMatch(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);

    // 3. 특정 단어로 끝나는지 확인
    expect(email).toMatch(/com$/);
  });
});
