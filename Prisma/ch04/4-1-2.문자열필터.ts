import { prisma, pool } from '../shared/database';

// ========================================
// 문자열 필터 (String)
// ========================================

/**
 * exam1) 제목(title)에 "Post" 문자열이 포함(contains)된 게시글 조회
 * - Soft delete 컬럼(deletedAt)이 null인 데이터만 조회
 * - select로 필요한 필드만 반환
 * - take로 최대 2개
 * - orderBy로 id 내림차순(큰 id부터)
 */
async function exam1() {
  console.log('--- 1-2: 제목에 "Post" 포함된 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      // title에 "Post"라는 부분 문자열이 포함되어 있는지 검사 (LIKE %Post%)
      title: {
        contains: 'Post',
        // mode를 지정하지 않으면 보통 DB/설정에 따라 대소문자 구분이 적용될 수 있음
        // (PostgreSQL에서는 contains + mode 미지정 시 보통 대소문자 구분 LIKE 성격)
      },

      // Soft delete: deletedAt이 null인 것만 "삭제되지 않은 데이터"로 간주
      deletedAt: null,
    },

    // 필요한 필드만 선택해서 반환(전송 데이터 최소화 / 성능에 유리)
    select: {
      id: true,
      title: true,
      published: true,
    },

    // 최대 2개만 조회 (Pagination/미리보기 용)
    take: 2,

    // id 기준 내림차순: 최신(큰 id)부터 가져오게 됨
    orderBy: {
      id: 'desc',
    },
  });

  console.log('--- 1-2: 제목에 "Post" 포함된 게시글 조회  결과---');
  console.log(posts);
}

/**
 * exam2) email이 "@gmail.com"으로 끝나는 사용자 조회
 * - endsWith: 접미사 검사 (LIKE %@gmail.com)
 * - deletedAt null: soft delete 제외
 * - take 2: 최대 2개
 * - orderBy id desc: 최신부터
 */
async function exam2() {
  console.log('--- 1-2: 이메일이 "@gmail.com"으로 끝나는 사용자 ---');

  const users = await prisma.user.findMany({
    where: {
      // 이메일이 특정 문자열로 끝나는지 검사
      email: {
        endsWith: '@gmail.com',
      },

      // 삭제되지 않은 사용자만
      deletedAt: null,
    },

    // 필요한 필드만 반환
    select: {
      id: true,
      displayName: true,
      email: true,
    },

    // 최대 2명만
    take: 2,

    // id 내림차순으로 정렬
    orderBy: {
      id: 'desc',
    },
  });

  console.log('--- 1-2: 이메일이 "@gmail.com"으로 끝나는 사용자  결과---');
  console.log(users);
}

/**
 * exam3) email이 "user"로 시작(startsWith)하는 사용자 조회
 * - startsWith: 접두사 검사 (LIKE user%)
 * - profile 관계를 include가 아니라 select로 "부분 선택"해서 반환
 * - orderBy id asc: 작은 id부터(오래된 순)
 */
async function exam3() {
  console.log('--- 1-3: 이메일이 "user로 시작하는 사용자 ---');

  const users = await prisma.user.findMany({
    where: {
      // 이메일이 "user"로 시작하는지 검사
      email: {
        startsWith: 'user',
      },

      // 삭제되지 않은 사용자만
      deletedAt: null,
    },

    select: {
      id: true,
      displayName: true,
      email: true,

      // 관계 필드(profile)도 select로 필요한 하위 필드만 가져올 수 있음
      // (include와 달리, include는 관계 전체를 통째로 가져오는 성격)
      profile: {
        select: {
          bio: true,
        },
      },
    },

    // 최대 2명만
    take: 2,

    // id 오름차순 정렬
    orderBy: {
      id: 'asc',
    },
  });

  console.log('--- 1-3: 이메일이 "user로 시작하는 사용자 결과---');
  console.log(users);
}

/**
 * exam4) displayName이 특정 목록(in)에 포함된 사용자 조회
 * - in: "이 값들 중 하나와 일치" 조건 (SQL: IN (...))
 * - notIn: "이 값들에 포함되지 않음" (SQL: NOT IN (...))
 */
async function exam4() {
  console.log('--- 1-4: displayName이 특정 목록에 포함된 사용자 ---');

  const users = await prisma.user.findMany({
    where: {
      // displayName이 배열 안의 값 중 하나면 매칭
      displayName: {
        in: ['User 001', 'User 005', 'User 007'],
      },

      // 반대로 제외하고 싶다면 notIn 사용
      // displayName: {
      //   notIn: ['User 002', 'User 004', 'User 006'],
      // },

      // 삭제되지 않은 사용자만
      deletedAt: null,
    },

    select: {
      id: true,
      displayName: true,
      email: true,
    },

    // 최대 10명 조회
    take: 10,

    // id 오름차순 정렬
    orderBy: { id: 'asc' },
  });

  console.log('--- 1-4: displayName이 특정 목록에 포함된 사용자 결과---');
  console.log(users);
}

/**
 * exam5) 제목(title)에 "126" 또는 "129"가 포함된 게시글을 제외하고 조회
 *
 * 핵심 포인트:
 * - NOT: [...] 배열을 쓰면 "배열 안의 조건들을 모두 NOT 처리"로 해석되기 쉬운데,
 *   실제 의도(“126 또는 129가 포함된 글을 제외”)는 보통 다음 중 하나로 명확히 표현하는 게 안전합니다.
 *
 *   (A) NOT: { OR: [cond126, cond129] }  // 가장 의도에 정확
 *   (B) AND: [ { NOT: cond126 }, { NOT: cond129 } ] // 결과는 동일
 *
 * 현재 코드는:
 * - NOT: [cond126, cond129]
 * 로 되어 있는데, Prisma에서 NOT 배열은 AND/OR 결합 방식이 헷갈릴 수 있으니
 * 아래처럼 (A) 형태를 추천합니다.
 */
async function exam5() {
  console.log('--- 1-5: "126" 또는 "129" 가 포함되지 않은 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      /**
       * 추천 형태: NOT + OR 조합
       * - "126이 포함" 또는 "129가 포함"인 글들을 먼저 OR로 묶고
       * - 그 OR 결과를 NOT으로 뒤집어서 "둘 중 하나라도 포함된 글은 제외"가 됩니다.
       */
      NOT: {
        OR: [
          // title에 126 포함(대소문자 무시)
          { title: { contains: '126', mode: 'insensitive' } },

          // title에 129 포함(대소문자 무시)
          { title: { contains: '129', mode: 'insensitive' } },
        ],
      },

      // 삭제되지 않은 게시글만
      deletedAt: null,
    },

    // 최대 10개 조회
    take: 10,

    // title 오름차순 정렬(가나다/알파벳 순)
    orderBy: { title: 'asc' },
  });

  console.log('--- 1-5: "126" 또는 "129" 가 포함되지 않은 게시글 조회 결과---');
  console.log(posts);
}

// ========================================
// main
// ========================================
async function main() {
  try {
    // await exam1();
    // await exam2();
    // await exam3();
    // await exam4();
    await exam5();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    // Prisma Client 연결 종료(프로세스 종료 시 커넥션 정리)
    await prisma.$disconnect();

    // node-postgres pool 종료(열려있는 커넥션/타이머 등 정리)
    await pool.end();
  }
}

main();
