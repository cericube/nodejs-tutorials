import { describe, it, expect } from 'vitest';
import { request } from 'undici';

const BASE_URL = 'http://localhost:8080';

describe('POST API 테스트 (undici)', () => {
  it('POST /api/users', async () => {
    const { statusCode, body } = await request(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'kim',
        age: 30,
      }),
    });

    expect(statusCode).toBe(201);

    const json = await body.json();
    expect(json).toEqual({
      method: 'POST',
      user: {
        name: 'kim',
        age: 30,
      },
    });
  });
});
