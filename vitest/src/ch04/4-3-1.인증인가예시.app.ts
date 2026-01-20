import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function verifyToken(request: FastifyRequest, reply: FastifyReply) {
  const auth = request.headers.authorization;

  if (!auth) {
    return reply.status(401).send({ code: 'UNAUTHORIZED', message: '토큰이 필요합니다.' });
  }

  if (auth !== 'Bearer valid-token') {
    return reply.status(403).send({ code: 'FORBIDDEN', message: '권한이 없습니다.' });
  }

  // 인증 통과 시 사용자 정보 설정
  (request as any).user = { id: 1, name: 'Jane' };
}

export async function verifyAdminToken(request: FastifyRequest, reply: FastifyReply) {
  const auth = request.headers.authorization;

  if (!auth) {
    return reply.status(401).send({ code: 'UNAUTHORIZED', message: '토큰 필요' });
  }

  if (auth === 'Bearer user-token') {
    return reply.status(403).send({ code: 'FORBIDDEN', message: '관리자 전용입니다.' });
  }

  if (auth === 'Bearer admin-token') {
    return;
  }

  return reply.status(403).send({ status: '잘못된 접근' });
}

export async function meRoutes(app: FastifyInstance) {
  app.route({
    method: 'GET',
    url: '/me',
    preHandler: verifyToken,
    handler: async (req, reply) => {
      // 인증된 사용자 정보 반환
      return { user: (req as any).user };
    },
  });
}

export async function adminRoutes(app: FastifyInstance) {
  app.route({
    method: 'GET',
    url: '/admin',
    preHandler: verifyAdminToken,
    handler: async () => {
      return { status: '관리자 접근 성공' };
    },
  });
}

/////////////////////////////////////////////
import Fastify from 'fastify';

/**
 * 테스트 및 서버 실행용 App Builder
 * - Vitest에서는 이 함수로 app 생성 후 inject() 사용
 * - 실제 서버에서는 listen 전에 동일 함수 사용
 */
export function buildApp() {
  const app = Fastify({
    logger: false, // 테스트 시 불필요한 로그 제거
  });

  app.register(meRoutes);
  app.register(adminRoutes);

  return app;
}
