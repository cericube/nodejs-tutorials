import { describe, it, expect } from 'vitest';
import { testAxios } from '../../src/ch05/5-3.Axios인스턴스';

describe('Header 기반 API 테스트 (axios)', () => {
  it('Authorization Header가 있으면 200을 반환한다', async () => {
    const response = await testAxios.get(`/api/secure`, {
      headers: {
        Authorization: 'Bearer test-token',
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Authorized');
  });

  it('Authorization Header가 없으면 401을 반환한다', async () => {
    try {
      await testAxios.get(`/api/secure`);
    } catch (error: any) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toEqual({
        message: 'Unauthorized',
      });
    }
  });
});
