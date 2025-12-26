import { prisma, pool } from '../shared/database';

// ========================================
// 논리 조합 (AND / OR / NOT)
// ========================================

/**
 * exam1: AND 조합
 * - 조건을 "모두 만족"해야 조회됨 (논리곱)
 */
async function exam1() {
  console.log('--- 1-1: AND - 발행되었고 내용도 있는 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      // AND: 배열에 있는 조건을 전부 만족해야 함
      AND: [
        { published: true }, // 발행된 글만
        { content: { not: null } }, // content가 null이 아닌 글만 (내용이 있는 글)
      ],

      // 소프트 삭제된 글 제외: deletedAt이 null인 것만 조회
      deletedAt: null,
    },

    select: {
      // 결과로 필요한 필드만 반환 (네트워크/메모리 절약)
      id: true,
      title: true,
      published: true,
    },

    // 최대 2개만 가져오기 (pagination 용도)
    take: 2,
  });

  console.log('--- 1-1: AND - 발행되었고 내용도 있는 게시글 조회 결과 ---');
  console.log(posts);
}

/**
 * exam2: OR 조합
 * - 조건 중 "하나라도 만족"하면 조회됨 (논리합)
 * - 제목/내용에 132 또는 135가 포함된 글을 찾는 예시
 */
async function exam2() {
  console.log('--- 1-2: OR - 제목이나 내용에 "132" 또는 "135" 포함 하는 글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      // OR: 배열에 있는 조건 중 하나라도 true면 매칭
      OR: [
        // 제목에 132 포함 (대소문자 무시)
        { title: { contains: '132', mode: 'insensitive' } },

        // 제목에 135 포함 (대소문자 무시)
        { title: { contains: '135', mode: 'insensitive' } },

        // 내용에 132 포함 (대소문자 무시)
        { content: { contains: '132', mode: 'insensitive' } },

        // 내용에 135 포함 (대소문자 무시)
        { content: { contains: '135', mode: 'insensitive' } },
      ],
    },

    select: {
      // 검색 결과 확인을 위해 제목/내용 포함
      id: true,
      title: true,
      content: true,
    },

    // 최대 10개만 조회
    take: 10,
  });

  console.log('--- 1-2: OR - 제목이나 내용에 "132" 또는 "135" 포함 하는 글 조회 결과 ---');
  console.log(posts);
}

/**
 * exam3: NOT 조합
 * - 특정 조건을 "제외"하고 싶을 때 사용
 * - 아래 예시는 "published=true" 이면서,
 *   title에 126 또는 127이 들어간 글은 제외
 */
async function exam3() {
  console.log('--- 1-3: NOT - 특정 키워드 제외 글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      // 기본 조건: 발행된 글만
      published: true,

      // NOT: 아래 조건들에 해당하는 레코드는 결과에서 제외됨
      NOT: [
        { title: { contains: '126', mode: 'insensitive' } }, // title에 126 포함 → 제외
        { title: { contains: '127', mode: 'insensitive' } }, // title에 127 포함 → 제외
      ],
    },

    select: {
      id: true,
      title: true,
      content: true,
    },

    // 최대 10개 조회
    take: 10,

    orderBy: {
      // title 오름차순 정렬
      title: 'asc',
    },
  });

  console.log('--- 1-3: NOT - 특정 키워드 제외 글 조회 결과 ---');
  console.log(posts);
}

/**
 * exam4: 복합 조건 (OR + 추가 필터)
 * - "published=true" 이거나, "최근 7일 이내 작성" 글을 조회
 * - 그리고 deletedAt=null (삭제되지 않은 글)만 포함
 */
async function exam4() {
  // 현재 시각 기준으로 7일 전 Date 객체 생성
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  console.log('--- 1-4: 복합 조건 - 발행되었거나 최근 7일 이내 작성 글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      // OR: 둘 중 하나라도 만족하면 포함
      OR: [
        { published: true }, // 발행된 글
        {
          createdAt: {
            gte: sevenDaysAgo, // createdAt >= sevenDaysAgo (최근 7일 이내)
          },
        },
      ],

      // 소프트 삭제 제외
      deletedAt: null,
    },

    select: {
      id: true,
      title: true,
      published: true,
      createdAt: true,
    },

    // 최대 10개 조회
    take: 10,

    orderBy: {
      // 최신 작성글이 먼저 오도록 내림차순 정렬
      createdAt: 'desc',
    },
  });

  console.log('--- 1-4: 복합 조건 - 발행되었거나 최근 7일 이내 작성 글 조회 결과 ---');
  console.log(posts);
}

// ========================================
// 실습 메인 함수
// ========================================
async function main() {
  try {
    // 실행하고 싶은 예제만 주석 해제해서 실행
    // await exam1();
    // await exam2();
    // await exam3();

    await exam4();
  } catch (e) {
    // 예외 발생 시 로깅
    console.log(e);
  } finally {
    // Prisma 연결 정리 (커넥션 릭 방지)
    await prisma.$disconnect();

    // pg Pool 정리 (프로세스가 종료되지 않는 문제 방지)
    await pool.end();
  }
}

// Node.js 실행 진입점
main();
