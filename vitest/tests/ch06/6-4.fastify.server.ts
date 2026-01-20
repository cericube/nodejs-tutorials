// /tests/ch06/6-4.fastify.server.ts

import Fastify from 'fastify';
import axios from 'axios';

/**
 * Fastify 애플리케이션을 생성하는 팩토리 함수
 * - 테스트에서는 app.listen() 없이 app.inject()로 사용
 * - 운영 환경에서는 이 app을 listen 시켜 실제 서버로 사용
 */
export function createApp() {
  // Fastify 인스턴스 생성
  const app = Fastify({
    // logger: true → 요청/응답 로그를 콘솔에 출력
    // 테스트 환경에서는 필요 없을 수도 있지만,
    // 실무에서는 디버깅과 운영 로그 수집에 중요
    logger: true,
  });

  /**
   * [API #1] 사용자 프로필 조회
   * GET /user-profile/:id
   *
   * 흐름:
   * 1. 클라이언트가 /user-profile/user_123 요청
   * 2. Fastify가 :id 값을 request.params에 담아줌
   * 3. 외부 사용자 API 호출 (axios)
   * 4. 외부 응답을 가공하여 클라이언트에 반환
   */
  app.get('/user-profile/:id', async (request, reply) => {
    // Fastify의 request.params는 기본적으로 unknown 타입
    // 따라서 타입 단언을 통해 id 추출
    const rid = (request.params as { id: string }).id;

    // 외부 API 호출
    // 테스트 환경에서는 이 요청을 MSW가 가로채서 가짜 응답을 반환
    const { data } = await axios.get(`https://api.external.com/users/${rid}`);

    // 외부 API 응답을 내부 API 규격에 맞게 변환하여 반환
    return {
      userId: data.id,
      displayName: data.name.toUpperCase(), // 비즈니스 로직: 대문자 변환
      email: data.email,
    };
  });

  /**
   * [API #2] 보호된 데이터 조회
   * GET /secure-data
   *
   * 흐름:
   * 1. 클라이언트가 Authorization 헤더와 함께 요청
   * 2. 해당 헤더를 그대로 외부 API로 전달
   * 3. 외부 API에서 인증 검증 후 응답 반환
   */
  app.get('/secure-data', async (request, reply) => {
    // Fastify는 모든 헤더를 소문자로 정규화해서 제공
    const authHeader = request.headers['authorization'];

    // 외부 API 호출 시 동일한 Authorization 헤더 전달
    const { data } = await axios.get(`https://api.external.com/data`, {
      headers: {
        Authorization: authHeader,
      },
    });

    // 외부 API 응답을 그대로 클라이언트에 반환
    return data;
  });

  // Fastify 인스턴스 반환
  // → 테스트에서는 app.inject()
  // → 운영에서는 app.listen()
  return app;
}
