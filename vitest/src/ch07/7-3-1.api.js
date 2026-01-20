// src/ch07/7-3-1.api.js
//실제 외부 통신 모듈)
export const fetchData = async () => {
  // 실제로는 DB나 외부 API에 접속하는 무거운 로직
  const response = await fetch('/api/data');
  return response.json();
};

// 실제 로직을 그대로 쓸 함수 (단순 계산 등)
export const getApiVersion = () => {
  return 'v1.0.0';
};
