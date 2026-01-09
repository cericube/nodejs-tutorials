import { prisma, pool } from '../shared/database';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Read Committed 격리 수준에서
 * "Non-repeatable read"가 어떻게 발생하는지를 실험적으로 보여주는 예제
 *
 * 전제 조건
 * - 동일한 레코드(User)를 두 개의 트랜잭션이 동시에 접근
 * - TX A는 Read Committed 격리 수준
 * - TX B는 TX A 실행 중에 데이터를 수정 후 커밋
 *
 * 기대 결과
 * - TX A의 1차 SELECT와 2차 SELECT 결과가 달라짐
 * - 즉, Read Committed에서는 "같은 쿼리라도 항상 같은 결과를 보장하지 않음"
 */
async function runReadCommitted(email: string) {
  /**
   * STEP 0. 초기 데이터 준비
   *
   * 실험 대상이 될 User 레코드를 하나 생성한다.
   * deletedAt = null 상태가 기준값이 된다.
   */
  const user = await prisma.user.create({
    data: { email, displayName: 'Test User' },
  });
  console.log('--- 초기 사용자 생성 완료 (deletedAt: null) ---');

  /**
   * ===============================
   * Transaction A
   * ===============================
   * - isolationLevel: ReadCommitted
   * - 동일한 SELECT를 두 번 수행
   * - 두 SELECT 사이에 TX B가 커밋을 수행하도록 시간 지연을 둔다
   */
  const txA = prisma.$transaction(
    async (tx) => {
      /**
       * STEP 1. 첫 번째 조회
       *
       * 이 시점에는 아직 TX B가 실행되기 전이므로
       * deletedAt === null 값을 읽는다.
       *
       * Read Committed 규칙:
       * - "쿼리 실행 시점에 커밋된 데이터"를 읽는다
       */
      const firstRead = await tx.user.findUnique({
        where: { email },
      });

      console.log('[TX A] 1차 읽기 (deletedAt):', firstRead?.deletedAt);
      console.log(firstRead);

      /**
       * STEP 2. 인위적인 지연
       *
       * 이 3초 동안:
       * - TX A는 열린 상태로 대기
       * - TX B가 동일한 레코드를 수정하고 커밋할 시간 확보
       */
      await new Promise((resolve) => setTimeout(resolve, 3000));

      /**
       * STEP 3. 두 번째 조회 (같은 SELECT)
       *
       * 이 시점에는 TX B가 이미 커밋을 완료했으므로
       * Read Committed 규칙에 따라
       * "새롭게 커밋된 값"을 읽게 된다.
       */
      const secondRead = await tx.user.findUnique({
        where: { email },
      });

      console.log('[TX A] 2차 읽기 (deletedAt):', secondRead?.deletedAt);
      console.log(secondRead);

      /**
       * STEP 4. 결과 해석
       *
       * Read Committed에서는:
       * - 같은 트랜잭션 안에서도
       * - 같은 SELECT 결과가 달라질 수 있음
       *
       * 이를 Non-repeatable read라고 부른다.
       */
      if (firstRead?.deletedAt !== secondRead?.deletedAt) {
        console.log(
          '[결과] Read Committed 정상 동작: ' +
            'TX B의 커밋된 변경사항이 2차 조회에 반영됨 (Non-repeatable read)',
        );
      } else {
        console.log(
          '[경고] 예상과 다른 결과: ' + 'Read Committed에서는 일반적으로 값이 달라져야 함',
        );
      }
    },

    /**
     * 트랜잭션 옵션
     * - isolationLevel: ReadCommitted
     *
     * PostgreSQL 기본 격리 수준이며
     * 대부분의 일반 CRUD 시스템에서 사용하는 설정
     */
    { isolationLevel: 'ReadCommitted' },
  );

  /**
   * ===============================
   * Transaction B
   * ===============================
   * - TX A가 실행 중인 동안
   * - 동일한 User 레코드를 수정(Soft Delete)
   * - 즉시 커밋
   */
  const txB = async () => {
    /**
     * STEP B-1. 지연
     *
     * TX A의 1차 SELECT가 끝난 뒤
     * 2차 SELECT 전에 실행되도록 시간 조절
     */
    await new Promise((resolve) => setTimeout(resolve, 1000));

    /**
     * STEP B-2. 데이터 수정
     *
     * deletedAt 값을 설정하여 Soft Delete 수행
     * 이 UPDATE가 커밋되는 순간부터
     * 다른 트랜잭션의 SELECT 결과에 영향을 준다.
     */
    const user = await prisma.user.update({
      where: { email },
      data: { deletedAt: new Date() },
    });

    console.log('[TX B] 데이터 수정 및 커밋 완료 (실제 DB는 값이 변경됨)');
    console.log(user);
  };

  /**
   * STEP 5. 두 트랜잭션을 동시에 실행
   *
   * - txA: Read Committed 트랜잭션
   * - txB: 외부에서 데이터 변경 후 커밋
   *
   * 실행 순서 제어는 setTimeout으로 간접 조절
   */
  await Promise.all([txA, txB()]);
}

async function runRepeatableRead(email: string) {
  // 1. 초기 데이터 준비: DB에 테스트할 유저를 먼저 생성합니다.
  const user = await prisma.user.create({
    data: { email, displayName: 'Test User' },
  });
  console.log('--- 초기 사용자 생성 완료 (deletedAt: null) ---');

  // [Transaction A]: RepeatableRead 격리 수준으로 실행
  const txA = prisma.$transaction(
    async (tx) => {
      /**
       * STEP 1: TX A - 첫 번째 읽기
       * 이 시점의 데이터를 스냅샷으로 찍어둡니다. (deletedAt은 null인 상태)
       */
      const firstRead = await tx.user.findUnique({ where: { email } });
      console.log('[TX A] 1차 읽기 (deletedAt):', firstRead?.deletedAt);

      /**
       * STEP 2: 의도적인 지연 (3초)
       * 이 사이에 외부(TX B)에서 데이터를 수정하도록 시간을 벌어줍니다.
       */
      await new Promise((resolve) => setTimeout(resolve, 3000));

      /**
       * STEP 4: TX A - 두 번째 읽기
       * 중요: TX B가 이미 커밋되어 실제 DB 데이터는 수정되었지만,
       * Repeatable Read 수준이므로 TX A는 STEP 1에서 봤던 '과거 데이터'를 다시 읽어옵니다.
       */
      const secondRead = await tx.user.findUnique({ where: { email } });
      console.log('[TX A] 2차 읽기 (deletedAt):', secondRead?.deletedAt);

      // 두 읽기 결과가 같으면 격리 수준이 잘 작동하고 있다는 증거입니다.
      if (firstRead?.deletedAt === secondRead?.deletedAt) {
        console.log('[결과] Repeatable Read 성공: 데이터 일관성 유지 (TX B의 수정사항을 무시함)');
      }
    },
    { isolationLevel: 'RepeatableRead' },
  );

  // [Transaction B]: 외부에서 데이터를 수정(Soft Delete)하는 별도의 흐름
  const txB = async () => {
    /**
     * STEP 2-1: TX A가 첫 읽기를 마칠 때까지 잠시 대기 (1초)
     */
    await new Promise((resolve) => setTimeout(resolve, 1000));

    /**
     * STEP 3: TX B - 데이터 수정 및 즉시 커밋
     * 실제 DB의 deletedAt 컬럼은 현재 시간으로 업데이트됩니다.
     */
    await prisma.user.update({
      where: { email },
      data: { deletedAt: new Date() },
    });
    console.log('[TX B] 데이터 수정 및 커밋 완료 (실제 DB는 값이 변경됨)');
  };

  // 두 트랜잭션을 동시에 실행
  await Promise.all([txA, txB()]);
}

async function main() {
  try {
    let email: string = 'iso_tester9@example.com';
    // await runRepeatableRead(email);
    await runReadCommitted(email);
  } catch (error) {
    console.log(error);
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[cleanup] prisma.$disconnect() failed:', e);
    }
    try {
      await pool.end();
    } catch (e) {
      console.error('[cleanup] pool.end() failed:', e);
    }
  }
}

main();
