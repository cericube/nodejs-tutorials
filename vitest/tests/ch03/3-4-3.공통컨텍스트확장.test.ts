import { beforeEach, it, expect } from 'vitest';

/**
 * 1. 컨텍스트 타입 정의 (TypeScript)
 * 테스트 내부에서 사용할 객체들의 구조를 정의합니다.
 * 이를 통해 'ctx'를 사용할 때 강력한 자동 완성 및 타입 검사를 지원받을 수 있습니다.
 */
interface MyTestContext {
  db: {
    query: (sql: string) => Promise<string>;
    status: string;
  };
  userToken: string;
}

/**
 * 2. beforeEach를 이용한 컨텍스트 확장
 * 각 테스트(it)가 실행되기 직전에 매번 실행되어 독립적인 환경을 조성합니다.
 * 제네릭 <MyTestContext>를 전달하여 context 객체의 타입을 지정합니다.
 */
beforeEach<MyTestContext>((context) => {
  // 테스트에서 사용할 공통 리소스(DB Mock, Auth Token 등)를 context에 주입합니다.
  context.db = {
    query: async (sql) => `Result for ${sql}`,
    status: 'Connected',
  };
  context.userToken = 'mock-auth-token-123';

  /**
   * [Cleanup 로직]
   * beforeEach에서 함수를 반환(return)하면, 해당 테스트가 끝난 직후에 실행됩니다.
   * DB 연결 해제나 데이터 초기화 등 정리 작업에 활용합니다.
   */
  return () => {
    context.db.status = 'Disconnected';
    // console.log('테스트 종료 후 리소스가 정리되었습니다.');
  };
});

/**
 * 3. 확장된 컨텍스트(ctx) 사용
 * 테스트 함수의 인자로 전달된 'ctx' 객체에는 위에서 주입한 db와 userToken이 담겨 있습니다.
 */
it<MyTestContext>('사용자 결제 정보 조회 테스트', async (ctx) => {
  // ctx에서 주입된 리소스를 꺼내어 테스트 로직을 수행합니다.
  const result = await ctx.db.query('SELECT * FROM payments');

  // 주입된 상태 확인 (Connected)
  console.log(`DB Status: ${ctx.db.status}`);

  // 검증(Assertion)
  expect(result).toContain('Result for');
  expect(ctx.db.status).toBe('Connected');
});
