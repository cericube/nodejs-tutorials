import { describe, it, expect } from 'vitest';
import { request } from 'undici';

const BASE_URL = 'http://localhost:8080';

describe('GET API 테스트 (undici)', () => {
  it('GET /api/echo?message=hello', async () => {
    const { statusCode, headers, body } = await request(`${BASE_URL}/api/echo?message=hello`);
    // Status Code 검증
    expect(statusCode).toBe(200);
    // Header 검증
    expect(headers['content-type']).toContain('application/json');
    // Payload 검증
    const json = await body.json();
    expect(json).toEqual({
      method: 'GET',
      message: 'hello',
    });
  });

  it('GET /api/users/:id', async () => {
    const { statusCode, body } = await request(`${BASE_URL}/api/users/10`);
    expect(statusCode).toBe(200);
    const json = await body.json();
    expect(json).toEqual({
      method: 'GET',
      userId: 10,
    });
  });
});
