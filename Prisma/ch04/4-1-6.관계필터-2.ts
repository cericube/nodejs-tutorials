import { prisma, pool } from '../shared/database';

// ========================================
// 관계 필터 (1:N 관계) - some / none
// Post 1건 ↔ Comment 여러 건
// ========================================

/**
 * exam1
 * - comments.some 사용 예제
 * - "삭제되지 않은 댓글이 하나라도 존재하는 게시글" 조회
 */
async function exam1() {
  console.log('--- 1-1: some - 댓글이 하나라도 있는 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      comments: {
        some: {
          // comments 중에서
          // deletedAt이 null인 댓글이
          // "최소 1개 이상 존재"해야 함
          deletedAt: null,
        },
      },

      // 게시글 자체도 소프트 삭제되지 않은 것만
      deletedAt: null,
    },

    select: {
      title: true,
      published: true,

      // _count: 관계된 레코드 개수 집계
      _count: {
        select: {
          comments: {
            // 집계 대상도 동일하게
            // 삭제되지 않은 댓글만 카운트
            where: { deletedAt: null },
          },
        },
      },
    },

    take: 10,
  });

  console.log('--- 1-1 결과 ---');
  console.log(JSON.stringify(posts, null, 2));
}

/**
 * exam2
 * - comments.some + 문자열 조건
 * - "댓글 내용에 '도움이'가 포함된 댓글이 하나라도 있는 게시글"
 */
async function exam2() {
  console.log('--- 1-2: some - 댓글에 "도움이" 포함된 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      comments: {
        some: {
          // 댓글 content에 "도움이" 포함
          content: {
            contains: '도움이',
            mode: 'insensitive', // 대소문자 무시
          },

          // 삭제되지 않은 댓글만 대상
          deletedAt: null,
        },
      },

      // 게시글 자체 조건
      deletedAt: null,
    },

    select: {
      title: true,
      published: true,

      // 게시글에 연결된 댓글 목록 출력
      // (⚠️ where 조건과 select 조건은 별개)
      comments: {
        select: {
          content: true,
        },
      },
    },

    take: 10,
  });

  console.log('--- 1-2 결과 ---');
  console.log(JSON.stringify(posts, null, 2));
}

/**
 * exam3
 * - comments.none 사용 예제
 * - "스팸 댓글이 단 하나도 없는 게시글"
 */
async function exam3() {
  console.log('--- 1-3: none - 스팸 댓글이 하나도 없는 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      comments: {
        none: {
          // content에 "스팸"이 포함된
          // (삭제되지 않은) 댓글이
          // "단 하나도 존재하지 않아야 함"
          content: {
            contains: '스팸',
            mode: 'insensitive',
          },
          deletedAt: null,
        },
      },

      // 게시글 자체 삭제 여부
      deletedAt: null,
    },
  });

  console.log('--- 1-3 결과 ---');
  console.log(JSON.stringify(posts, null, 2));
}

/**
 * exam4
 * - comments.some + 날짜 조건
 * - "최근 7일 이내에 작성된 댓글이 하나라도 있는 게시글"
 */
async function exam4() {
  // 현재 시점 기준 7일 전
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  console.log('--- 1-4: some - 최근 7일 이내 댓글이 달린 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      comments: {
        some: {
          // 댓글 생성 시점이 7일 이내
          createdAt: { gte: sevenDaysAgo },

          // 삭제되지 않은 댓글만
          deletedAt: null,
        },
      },

      // 게시글 자체 조건
      deletedAt: null,
    },

    select: {
      title: true,
      published: true,

      // 연결된 댓글 정보 출력
      comments: {
        select: {
          content: true,
          createdAt: true,
        },
      },
    },

    take: 10,
  });

  console.log('--- 1-4 결과 ---');
  console.log(JSON.stringify(posts, null, 2));
}

// ========================================
// 실습 메인 함수
// ========================================
async function main() {
  try {
    // await exam1();
    // await exam2();
    // await exam3();
    await exam4();
  } catch (error) {
    console.error('Error in main():', error);
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
