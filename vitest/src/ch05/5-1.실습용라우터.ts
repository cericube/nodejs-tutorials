import type { FastifyInstance } from 'fastify';

export async function testRoutes(app: FastifyInstance) {
  /**
   * GET + Query 테스트
   * GET /api/echo?message=hello
   */
  app.get('/echo', async (request) => {
    const { message } = request.query as {
      message?: string;
    };

    return {
      method: 'GET',
      message: message ?? null,
    };
  });

  /**
   * GET + Path Param 테스트
   * GET /api/users/:id
   */
  app.get('/users/:id', async (request) => {
    const { id } = request.params as {
      id: string;
    };

    return {
      method: 'GET',
      userId: Number(id),
    };
  });

  /**
   * POST + Body 테스트
   * POST /api/users
   */
  app.post('/users', async (request, reply) => {
    const body = request.body as {
      name: string;
      age: number;
    };

    reply.code(201);

    return {
      method: 'POST',
      user: body,
    };
  });

  /**
   * Header 테스트 (Authorization)
   * GET /api/secure
   */
  app.get('/secure', async (request, reply) => {
    const auth = request.headers['authorization'];

    if (!auth || auth !== 'Bearer test-token') {
      reply.code(401);
      return {
        message: 'Unauthorized',
      };
    }

    return {
      message: 'Authorized',
      token: auth,
    };
  });
}
