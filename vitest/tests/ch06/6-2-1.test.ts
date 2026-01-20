import { describe, it, expect } from 'vitest';
import axios from 'axios';

async function fetchUsers() {
  const response = await axios.get('https://api.ex2mple.com/users');
  return response.data;
}

describe('사용자 API 통합 테스트', () => {
  it('MSW가 가로챈 사용자 목록을 성공적으로 가져온다', async () => {
    const data = await fetchUsers();

    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Alice');
  });
});
