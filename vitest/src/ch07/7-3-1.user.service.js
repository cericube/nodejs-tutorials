//테스트 대상 : src/ch07/7-3-1.user.service.js
import { fetchData, getApiVersion } from './7-3-1.api';

export const getUserName = async () => {
  const data = await fetchData();
  return data.name;
};

// 이 함수는 실제 getVersion의 결과를 반환해야 함을 검증할 것입니다.
export const getAppInfo = () => {
  const version = getApiVersion();
  return `App Version: ${version}`;
};
