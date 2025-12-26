// -----------------------------------------------------------------------------
// 공용 Database 모듈 import
// -----------------------------------------------------------------------------
// prisma : Prisma ORM 전용 Client (CRUD, Relation, Transaction 등)
// pool   : Raw SQL, 대량 쿼리, 저수준 제어용 PostgreSQL Connection Pool
import { prisma, pool } from '../shared/database';

/**
 * [1] 단일 사용자(User) + 1:1 관계(Profile) 동시 업데이트
 *
 * 핵심 포인트
 * - user.update:
 *   - where 조건에 해당하는 레코드가 없으면 예외를 throw
 *   - 반드시 PK 또는 Unique 필드 필요
 *
 * - profile.update (nested update):
 *   - 이미 연결된 Profile 레코드가 존재해야 함
 *   - Profile이 없는 경우 → 예외 발생
 *
 * 사용 시나리오
 * - "User와 Profile이 반드시 존재한다"는 전제가 있는 관리성 로직
 */
async function runUpdate(userId: number) {
  console.log('--- [1] 사용자 정보 업데이트 시작 ---');

  const updatedUser = await prisma.user.update({
    // 업데이트 대상 User
    // PK(id) 또는 Unique(email 등) 필수
    where: { id: userId },

    // 변경할 데이터 정의
    data: {
      // User 테이블 컬럼
      displayName: '새로운 이름',

      // 1:1 관계(Profile)에 대한 Nested Update
      profile: {
        update: {
          bio: '프로필 업데이트.',
        },
      },
    },

    // 반환 필드 제한
    // - 불필요한 컬럼 조회 방지
    // - 네트워크 / 메모리 사용량 절감
    select: {
      id: true,
      displayName: true,
      profile: true,
    },
  });

  /**
   * ⚠️ 주의사항
   * - userId에 해당하는 User가 없을 경우:
   *   → PrismaClientKnownRequestError 발생
   *
   * - Profile이 존재하지 않을 경우:
   *   → nested update 단계에서 오류 발생
   *
   * ✔ 안전한 패턴
   * - update → updateMany (count 기반 처리)
   * - 또는 findUnique 후 존재 여부 분기 처리
   */

  console.log('--- [1] 사용자 정보 업데이트 결과 ---');
  console.log(updatedUser);

  return updatedUser;
}

/**
 * [2] 특정 사용자의 미공개(Post.published=false) 글 일괄 공개
 *
 * 핵심 포인트
 * - updateMany:
 *   - 조건에 맞는 레코드가 없어도 예외를 발생시키지 않음
 *   - 반환값은 수정된 행 수(count)만 제공
 *
 * 사용 시나리오
 * - 관리성 일괄 처리
 * - "없어도 괜찮은" 배치 작업
 */
async function runUpdateMany(userId: number) {
  console.log('--- [2] 다수 글 공개 처리 시작 ---');

  const result = await prisma.post.updateMany({
    where: {
      authorId: userId,
      published: false,
    },
    data: {
      published: true,
    },
  });

  console.log('--- [2] 다수 글 공개 처리 결과 ---');
  console.log(result); // { count: 수정된 행 수 }

  return result;
}

/**
 * [3] updateManyAndReturn (Prisma 7.x+)
 *
 * 핵심 포인트
 * - 다건 업데이트 + 변경된 레코드 목록을 동시에 반환
 * - PostgreSQL, CockroachDB 등 일부 DB에서만 지원
 *
 * 주의
 * - MySQL, SQLite에서는 지원되지 않음
 * - 대량 데이터 처리 시 반환 데이터 크기 주의
 *
 * 사용 시나리오
 * - 변경 결과를 즉시 후처리해야 하는 경우
 * - Audit Log, Cache 갱신 등
 */
async function runUpdateManyAndReturn(userId: number) {
  console.log('--- [3] 글 일괄 업데이트 시작 ---');

  const updatePosts = await prisma.post.updateManyAndReturn({
    where: {
      authorId: userId,
    },

    // 모든 대상 Post에 동일한 값 적용
    data: {
      content: '일괄 업데이터 내용....',
    },

    // 반환 필드 명시
    // - 성능 최적화
    // - 응답 구조 명확화
    select: {
      id: true,
      title: true,
      updatedAt: true,

      // N:1 관계(author)에 대한 Nested Select
      author: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  });

  console.log('--- [3] 글 일괄 업데이트 결과 ---');
  console.log(updatePosts); // Post[] 반환

  return updatePosts;
}

/**
 * [4] Upsert (존재 여부에 따라 Create 또는 Update)
 *
 * 핵심 포인트
 * - where 조건은 반드시 Unique 필드여야 함
 * - 내부적으로:
 *   - 존재하면 update
 *   - 없으면 create
 *
 * 주의
 * - create / update 블록의 nested relation 구조는 서로 독립
 * - update 시 profile이 없으면 오류 발생 가능
 */
async function runUpsert(email: string) {
  console.log('--- [4] Upsert 시작 ---');

  const user = await prisma.user.upsert({
    where: {
      email: email, // Unique 필드
    },

    // 레코드가 없을 경우 실행
    create: {
      email: email,
      displayName: '없음, 추가',
      profile: {
        create: {
          bio: '추가 사용자.....',
        },
      },
    },

    // 레코드가 이미 존재할 경우 실행
    update: {
      displayName: '존재, 갱신',
      profile: {
        update: {
          bio: '갱신 사용자.....',
        },
      },
    },

    // 결과에 Profile 포함
    include: {
      profile: true,
    },
  });

  console.log('--- [4] Upsert 결과 ---');
  console.log(user);

  return user;
}

/////////////////////////////////////////////////////////
// 테스트 데이터 정리용 함수
// - ../prisma/seed.ts 실행 후 재실행 시 사용
// - FK 제약 조건을 고려한 삭제 순서 유지
/////////////////////////////////////////////////////////
async function cleanUp() {
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * 프로그램 실행 진입점
 */
async function main() {
  try {
    // [1] 사용자 + 프로필 단일 업데이트
    // await runUpdate(134);

    // [2] 사용자 글 다건 공개 처리
    // await runUpdateMany(134);

    // [3] 사용자 글 다건 업데이트 + 결과 반환
    // await runUpdateManyAndReturn(134);

    // [4] Upsert 테스트
    await runUpsert('cericube@naver.com');
  } catch (e) {
    // Prisma Client 에러 또는 DB 에러 출력
    console.log(e);
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

// 프로그램 실행
main();
