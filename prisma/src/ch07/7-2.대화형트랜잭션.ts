import { prisma, pool } from '../shared/database';

/**
 * ========================================
 * 대화형 트랜잭션 (Interactive Transactions)
 * ========================================
 */

function isAllowedEmailDomain(email: string): boolean {
  return email.endsWith('@example.com');
}

async function createUserWithProfile() {
  console.log('--- 대화형 트랜잭션 예시 ---');

  /**
   * prisma.$transaction(async (tx) => { ... })
   *
   * - Interactive Transaction (대화형 트랜잭션)
   * - 내부에서 실행되는 모든 쿼리는 하나의 DB 트랜잭션으로 묶임
   * - 내부에서 Error throw 시 → 자동 ROLLBACK
   * - 정상 종료 시 → COMMIT
   */
  const { user, profile } = await prisma.$transaction(async (tx) => {
    /**
     * 1️⃣ User 생성
     *
     * - 이 시점에서 INSERT SQL이 실행됨
     * - 실패 시 (unique, not null 등) → 즉시 throw → 트랜잭션 중단
     * - 성공 시 → id, email, displayName 반환
     */
    const user = await tx.user.create({
      data: {
        // ❗ 의도적으로 잘못된 도메인 (example.com 아님)
        email: 'tx_test@exmaple.com',
        displayName: '대화 트랜잭션 사용자',
      },
      /**
       * select는 "반환 객체"만 제한할 뿐
       * DB에는 전체 컬럼이 정상적으로 저장됨
       */
      select: {
        id: true,
        email: true,
        displayName: true,
      },
    });

    /**
     * 2️⃣ 비즈니스 규칙 검증
     *
     * - DB 오류가 아닌 "도메인 정책 위반" 검사
     * - example.com 도메인만 허용
     *
     * ❗ 여기서 throw 발생 시:
     *   - 이미 실행된 user.create 포함
     *   - 트랜잭션 전체가 ROLLBACK 됨
     *   - User, Profile 모두 DB에 남지 않음
     */
    if (!isAllowedEmailDomain(user.email)) {
      throw new Error('example.com 도메인 이메일만 가입할 수 있습니다.');
    }

    /**
     * 3️⃣ Profile 생성
     *
     * - 위 비즈니스 규칙을 통과한 경우에만 실행
     * - user.id 또는 unique key(email) 기반으로 연결
     */
    const profile = await tx.profile.create({
      data: {
        bio: '대화 트랜잭션 사용자',
        user: {
          connect: {
            // unique 필드(email)로 User와 연결
            email: 'tx_test@exmaple.com',
          },
        },
      },
    });

    /**
     * 4️⃣ 트랜잭션 결과 반환
     *
     * - 이 return이 실행되면 COMMIT
     * - user, profile 모두 DB에 영구 반영
     */
    return { user, profile };
  });

  console.log('--- 대화형 트랜잭션 예시 종료 ---');
  console.log(user);
  console.log(profile);
}

/**
 * ========================================
 * 메인 실행
 * ========================================
 */
async function main() {
  try {
    await createUserWithProfile();
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
