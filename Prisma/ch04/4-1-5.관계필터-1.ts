import { prisma, pool } from '../shared/database';

/**
 * ========================================================
 * Prisma 관계 필터 (1:1 및 To-One 관계) : is & isNot 핵심 정리
 * ========================================================
 * * 1. is (필터 조건 만족):
 * - 대상 관계가 존재해야 하며 (NOT NULL), 지정한 조건을 모두 만족해야 합니다.
 * - SQL의 INNER JOIN 후 조건 필터링과 유사한 논리로 작동합니다.
 * * 2. isNot (필터 조건 불만족):
 * - 'is' 조건 전체를 부정(NOT)합니다.
 * - 결과: (관계가 아예 존재하지 않거나) OR (관계가 존재하지만 조건을 만족하지 않음)
 * - 주의: 단순히 "값의 부정"이 아니라 "관계의 존재성"까지 포함된 부정입니다.
 * * 3. Null 체크 활용:
 * - is: null    => 관계가 존재하지 않음 (Foreign Key가 null이거나 연관 데이터 없음)
 * - isNot: null => 관계가 반드시 존재함 (데이터가 반드시 있는 경우만 포함)
 */

async function exam1() {
  console.log('--- 1-1: 프로필을 보유한 작성자의 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      author: {
        profile: {
          // [isNot: null]은 "프로필이 없는 경우"를 제외합니다.
          // 즉, 반드시 Profile 레코드가 존재하는 작성자의 글만 가져옵니다.
          isNot: null,
        },
      },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      author: {
        select: {
          id: true,
          displayName: true,
          profile: { select: { bio: true } },
        },
      },
    },
    take: 2,
  });

  console.log(JSON.stringify(posts, null, 2));
}

async function exam2() {
  console.log('--- 1-2: 특정 소개글(bio)을 가진 프로필의 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      author: {
        profile: {
          // [is]: Profile이 존재 '하고' AND 아래 조건을 만족하는 경우
          // Prisma 5+에서는 'is'를 생략하고 바로 필드명을 써도 되지만,
          // 'is'를 명시하면 관계 필터임을 코드상에서 더 명확히 드러낼 수 있습니다.
          is: {
            bio: { contains: '01' },
          },
        },
      },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      author: {
        select: {
          id: true,
          displayName: true,
          profile: { select: { bio: true } },
        },
      },
    },
    take: 2,
  });

  console.log(JSON.stringify(posts, null, 2));
}

async function exam3() {
  console.log('--- 1-3: 특정 조건을 만족하지 않는(미보유 포함) 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      author: {
        profile: {
          // [isNot]: "bio에 '01'이 포함된 프로필"이 아닌 모든 경우
          // 1. 프로필이 아예 없는 작성자의 글 (Profile is NULL)
          // 2. 프로필은 있지만 bio에 '01'이 없는 글
          // 위 두 가지 케이스를 모두 포함합니다.
          isNot: {
            bio: { contains: '01' },
          },
        },
      },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
    },
    take: 2,
  });

  console.log(JSON.stringify(posts, null, 2));
}

async function exam4() {
  console.log('--- 1-4: 작성자 이메일 도메인 기반 필터링 (Scalar 필터) ---');

  const posts = await prisma.post.findMany({
    where: {
      author: {
        // author는 Post 모델에서 필수(Required) 관계인 경우가 많습니다.
        // 여기서는 profile(객체)이 아닌 email(문자열 필드)에 직접 필터를 적용합니다.
        email: {
          contains: '@example.com',
        },
      },
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      author: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    take: 2,
  });

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
