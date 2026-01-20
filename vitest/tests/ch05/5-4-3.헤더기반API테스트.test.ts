import { describe, it, expect } from 'vitest';
import { request } from 'undici';

const BASE_URL = 'http://localhost:8080';

describe('Header 기반 API 테스트 (undici)', () => {
  it('Authorization Header가 있으면 200을 반환한다', async () => {
    const { statusCode, body } = await request(`${BASE_URL}/api/secure`, {
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    expect(statusCode).toBe(200);

    const json = await body.json();
    expect((json as any).message).toBe('Authorized');
  });

  it('Authorization Header가 없으면 401을 반환한다', async () => {
    const { statusCode, body } = await request(`${BASE_URL}/api/secure`);

    expect(statusCode).toBe(401);

    const json = await body.json();
    expect(json).toEqual({
      message: 'Unauthorized',
    });
  });
});
