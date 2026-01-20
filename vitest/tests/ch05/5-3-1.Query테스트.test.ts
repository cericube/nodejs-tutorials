import { describe, it, expect } from 'vitest';
import { testAxios } from '../../src/ch05/5-3.Axios인스턴스';

describe('GET API 테스트 (axios)', () => {
  it('Query Parameter 전달 및 응답 검증', async () => {
    const response = await testAxios.get(`/api/echo`, {
      params: {
        message: 'hello',
      },
    });

    // HTTP Status 검증
    expect(response.status).toBe(200);

    // Payload 검증
    expect(response.data).toEqual({
      method: 'GET',
      message: 'hello',
    });

    // Header 검증
    expect(response.headers['content-type']).toContain('application/json');
  });

  it('Path Parameter를 통한 데이터 조회', async () => {
    const response = await testAxios.get(`/api/users/10`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      method: 'GET',
      userId: 10,
    });
  });
});
