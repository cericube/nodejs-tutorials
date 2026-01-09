import { prisma, pool } from '../shared/database';

/**
 * ========================================
 * relationLoadStrategy 개요
 * ========================================
 * - 'join'  : DB 레벨에서 JOIN(또는 단일 쿼리/최소 쿼리)로 관계 데이터를 한 번에 가져오려는 전략
 * - 'query' : 관계를 단계적으로 가져오는 전략(부모 조회 후 자식들을 추가 쿼리로 조회)
 *
 * 목적:
 * - join: 네트워크 round-trip(쿼리 횟수)을 줄여 성능을 개선하려는 선택지
 * - query: 쿼리 분리로 결과/메모리/쿼리 플래너 측면에서 안정적일 수 있음(상황에 따라 유리)
 */

/**
 * ========================================
 * join 전략 (Database-level JOIN)
 * ========================================
 */

// 아래 설정 후 npx prisma generate 를 실행해야
// relationLoadStrategy: 'join' 옵션이 실제로 동작(프리뷰 기능 활성화)합니다.
// generator client {
//   provider = "prisma-client"
//   output   = "../generated"
//   previewFeatures = ["relationJoins"]
// }

async function exam1() {
  console.log('\n=== 1. User 전체 트리 조회 (join 전략) ===');

  // users -> posts -> comments 까지 "트리 형태"로 한 번에 로딩
  // join 전략은 가능한 경우 DB JOIN을 통해 쿼리 수를 줄이는 방향으로 동작합니다.
  const users = await prisma.user.findMany({
    relationLoadStrategy: 'join',
    include: {
      posts: {
        include: {
          comments: true,
        },
      },
    },
  });

  // 예제이므로 결과 출력은 생략(필요 시 users.length / JSON.stringify 등으로 확인)
  // console.log(users.length);
}

/**
 * ========================================
 * query 전략 (Application-level Join)
 * ========================================
 */

async function exam2() {
  console.log('\n=== 1. User 전체 트리 조회 (query 전략) ===');

  // 동일한 include 구조이지만,
  // query 전략은 관계별로 추가 쿼리가 발생할 수 있습니다(일종의 "애플리케이션 레벨 조인").
  // 즉, 유저 목록 조회 후 posts/comments를 별도 쿼리로 가져오는 방식으로 처리될 수 있습니다.
  const users = await prisma.user.findMany({
    relationLoadStrategy: 'query',
    include: {
      posts: {
        include: {
          comments: true,
        },
      },
    },
  });

  // console.log(users.length);
}

/**
 * ========================================
 * 메인 실행
 * ========================================
 */
async function main() {
  try {
    // 전략 비교 시 둘 중 하나만 실행해서 쿼리 로그/실행 시간을 비교합니다.
    // await exam1(); // join 전략
    await exam2(); // query 전략
  } catch (error) {
    // 실행 중 예외(쿼리 오류/연결 문제 등) 처리
    console.error('에러 발생:', error);
  } finally {
    // Prisma Client 연결 종료(미종료 시 Node 프로세스가 종료되지 않을 수 있음)
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[cleanup] prisma.$disconnect() failed:', e);
    }

    // pg Pool을 함께 사용하는 경우 pool도 반드시 종료해야 합니다.
    // (Pool이 열려 있으면 이벤트 루프가 살아있어 프로세스가 계속 대기할 수 있음)
    try {
      await pool.end();
    } catch (e) {
      console.error('[cleanup] pool.end() failed:', e);
    }
  }
}

main();
