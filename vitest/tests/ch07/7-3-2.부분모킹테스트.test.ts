// /tests/ch07/7-3-2.부분모킹테스트.test
import { vi, describe, it, expect } from 'vitest';
import { getUserName, getAppInfo } from '../../src/ch07/7-3-1.user.service';
import { fetchData } from '../../src/ch07/7-3-1.api';

// 부분 모킹 설정
vi.mock('../../src/ch07/7-3-1.api', async () => {
  // 1. 실제 모듈의 모든 내용을 가져옵니다.
  //“actual의 타입을, ../../src/ch07/7-3-1.api 모듈을 import 했을 때의 타입과 동일하게 잡아줘
  const actual = await vi.importActual<typeof import('../../src/ch07/7-3-1.api')>(
    '../../src/ch07/7-3-1.api',
  );

  return {
    ...actual, // 실제 모듈의 모든 내보내기(export)를 복사
    fetchData: vi.fn(), // fetchData만 가짜 함수로 대체
    // getApiVersion은 명시하지 않았으므로 actual에 있는 실제 함수가 사용됨
  };
});

describe('Partial Mocking 실습', () => {
  it('fetchData는 모킹되어 가짜 값을 반환해야 한다 (getUserName)', async () => {
    // fetchData를 Mock으로 타입 단언하여 설정
    const mockedFetchData = vi.mocked(fetchData);
    mockedFetchData.mockResolvedValue({ name: 'Partial-Mock-User' });

    const name = await getUserName();

    expect(name).toBe('Partial-Mock-User');
    expect(mockedFetchData).toHaveBeenCalled();
  });

  it('getVersion은 모킹되지 않고 실제 값을 반환해야 한다 (getAppInfo)', () => {
    // getAppInfo 내부의 getVersion은 실제 로직인 "v1.0.0"을 반환함
    const info = getAppInfo();
    expect(info).toBe('App Version: v1.0.0');
  });
});
