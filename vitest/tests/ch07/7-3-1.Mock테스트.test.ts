// 테스트 코드: /tests/ch07/7-3-1.Mock테스트.test.ts
import { getUserName } from '../../src/ch07/7-3-1.user.service.js';
import { fetchData } from '../../src/ch07/7-3-1.api.js';

import { vi, describe, it, expect } from 'vitest';

// 1. 모듈 통째로 모킹 (이 코드는 파일 최상단으로 호이스팅됩니다)
vi.mock('../../src/ch07/7-3-1.api', () => ({
  fetchData: vi.fn(),
}));

// describe('getUserName 테스트', () => {
//   it('fetchData가 반환한 객체에서 name을 정확히 추출해야 한다', async () => {
//     fetchData.mockResolvedValue({ name: 'Gemini', id: 1 });
//     const name = await getUserName();
//     expect(name).toBe('Gemini');
//     expect(fetchData).toHaveBeenCalledTimes(1);
//   });
// });

describe('getUserName 테스트', () => {
  it('fetchData가 반환한 객체에서 name을 정확히 추출해야 한다', async () => {
    // vi.mocked를 사용하여 타입을 강제 변환합니다.
    const mockedFetchData = vi.mocked(fetchData);
    mockedFetchData.mockResolvedValue({ name: 'Gemini', id: 1 });
    const name = await getUserName();

    expect(name).toBe('Gemini');
    expect(mockedFetchData).toHaveBeenCalledTimes(1);
  });
});
