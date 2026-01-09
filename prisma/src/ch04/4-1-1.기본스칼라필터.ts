import { prisma, pool } from '../shared/database';

// ========================================
// 기본 스칼라 필터 (Boolean / Number / Date)
// ========================================

async function exam1() {
  console.log('--- 1-1: 발행된 게시글만 조회 ---');

  // Post 테이블에서 여러 건 조회(findMany)
  const posts = await prisma.post.findMany({
    where: {
      // Boolean 스칼라 필터: 발행(published)된 게시글만
      published: true,

      // "소프트 삭제(Soft Delete)" 패턴 가정:
      // deletedAt 컬럼이 null이면 삭제되지 않은(=유효한) 데이터
      deletedAt: null,
    },

    // select: 결과로 가져올 필드를 "필요한 것만" 제한 (payload 최소화)
    // (참고) include는 "관계 포함" 중심, select는 "필드 제한" 중심
    // ⚠️ Prisma에서는 select와 include를 동시에 쓸 수 없음
    select: {
      // Post의 스칼라 필드 중 id, title, published만 가져옴
      id: true,
      title: true,
      published: true,

      // 관계 필드: author(User)도 함께 가져오되,
      // author 전체가 아니라 author의 일부 필드만 select로 제한
      author: {
        select: {
          id: true,
          displayName: true,

          // 2단계 중첩 관계: author.profile(Profile)
          profile: {
            select: {
              bio: true, // Profile의 bio만 가져옴
            },
          },
        },
      },

      // 관계 필드: comments(Comment) 목록도 가져오되 일부 필드만 선택
      comments: {
        select: {
          id: true,
          content: true,
        },
      },
    },

    // take: 조회 개수 제한 (pagination에서 limit 역할)
    take: 2,

    // orderBy: 정렬 조건 (여기서는 id 내림차순: 최신 id 우선)
    orderBy: {
      id: 'desc',
    },
  });

  console.log('--- 1-1: 발행된 게시글만 조회 결과 ---');

  // 객체를 보기 쉽게 JSON pretty print
  // console.log(posts); // 기본 출력(가독성 낮을 수 있음)
  console.log(JSON.stringify(posts, null, 2));
}

async function exam2() {
  console.log('--- 1-2: 최근 30일 이내 작성된 게시글 ---');

  const posts = await prisma.post.findMany({
    where: {
      createdAt: {
        // Date 스칼라 필터: createdAt >= (현재 시각 - 30일)
        // gte: greater than or equal (이상)
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전 기준 시각
      },

      // 소프트 삭제 제외
      deletedAt: null,
    },

    // 상위 2개만
    take: 2,

    // id 기준 내림차순
    orderBy: {
      id: 'desc',
    },
  });

  console.log('--- 1-2: 최근 30일 이내 작성된 게시글 결과 ---');
  console.log(posts);
}

async function exam3() {
  console.log('--- 1-3: 2025년에 가입한 사용자 ---');

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        // Date 범위 필터:
        // 2025-01-01T00:00:00Z 이상 AND 2026-01-01T00:00:00Z 미만
        // → 결과적으로 "2025년 한 해"에 생성된 사용자만
        gte: new Date('2025-01-01T00:00:00.000Z'),
        lt: new Date('2026-01-01T00:00:00.000Z'), // lt: less than (미만)
      },

      // 소프트 삭제 제외
      deletedAt: null,
    },

    // 상위 2명만
    take: 2,

    // id 기준 내림차순(최근 가입자 우선)
    orderBy: {
      id: 'desc',
    },
  });

  console.log('--- 1-3: 2025년에 가입한 사용자 결과 ---');
  console.log(users);
}

// ========================================
// 실습 메인 함수
// ========================================
async function main() {
  try {
    // 실행할 예제를 선택
    // await exam1();
    // await exam2();
    await exam3();
  } catch (e) {
    // 예외 발생 시 로그 출력
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

// main 실행
main();
