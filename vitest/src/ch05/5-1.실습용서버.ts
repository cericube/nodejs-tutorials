import Fastify from 'fastify';
import { testRoutes } from './5-1.실습용라우터';

export function createApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(testRoutes, {
    prefix: '/api',
  });

  return app;
}

const PORT = 8080;
const app = createApp();
app.listen({ port: PORT }, () => {
  console.log(`🚀 Test API Server running on http://localhost:${PORT}`);
});
