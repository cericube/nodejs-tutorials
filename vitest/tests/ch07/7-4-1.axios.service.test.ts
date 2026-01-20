import { vi, describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchUserData } from '../../src/ch07/7-4-1.axios.service';

// 1. Axios 모듈 전체 모킹
// vi.mock('axios');

// axios 모듈 구조를 직접 mock
vi.mock('axios');

// TypeScript 타입 추론을 위해 vi.mocked 사용
const mockedAxiosGet = vi.mocked(axios.get);

describe('Axios Mocking & 초기화 실습', () => {
  beforeEach(() => {
    // [실습 포인트] 아래 세 가지 중 하나씩 주석을 풀고 결과를 관찰해보세요.

    // 1. 호출 기록(calls)만 초기화 (구현은 유지)
    vi.clearAllMocks();

    // 2. 호출 기록 + 가짜 구현(Implementation) 모두 초기화
    // vi.resetAllMocks();
  });

  it('첫 번째 테스트: 사용자 데이터를 성공적으로 가져온다', async () => {
    // 가짜 구현 설정
    mockedAxiosGet.mockResolvedValue({ data: { name: 'Kim', id: 1 } });

    const result = await fetchUserData(1);

    expect(result.name).toBe('Kim');
    expect(mockedAxiosGet).toHaveBeenCalledTimes(1); // 호출 횟수: 1
  });

  it('두 번째 테스트: 호출 횟수가 초기화되었는지 확인한다', async () => {
    // 가짜 구현 설정 (clearAllMocks 사용 시 이전 구현이 남아있어 다시 안 써도 동작함)
    // 하지만 resetAllMocks 사용 시 아래 줄이 없으면 에러가 발생함
    mockedAxiosGet.mockResolvedValue({ data: { name: 'Lee', id: 2 } });

    const result = await fetchUserData(2);

    expect(result.name).toBe('Lee');

    /**
     * [검증 포인트]
     * beforeEach에서 vi.clearAllMocks()를 호출했기 때문에,
     * 이전 테스트의 호출 기록이 지워져서 다시 1이 되어야 합니다.
     */
    expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
  });

  it('에러 상황 모킹 (Rejected Value)', async () => {
    // 404 에러 상황 강제 발생
    mockedAxiosGet.mockRejectedValue(new Error('User Not Found'));

    await expect(fetchUserData(999)).rejects.toThrow('User Not Found');
  });
});
