//(테스트용 공통 인스턴스)
import axios from 'axios';

export const testAxios = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'X-Test-Client': 'Vitest',
  },
});
